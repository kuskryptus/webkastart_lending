import 'server-only'

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PassThrough, Readable } from 'node:stream'
import sharp from 'sharp'

let storage: S3Client | undefined

const IMAGE_PREVIEW_MAX_DIMENSION = 1280
const IMAGE_PREVIEW_QUALITY = 72
const MAX_CONCURRENT_PREVIEW_GENERATIONS = 2
const previewableMimeTypes = new Set([
  'image/avif',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const previewGenerationTasks = new Map<string, Promise<string>>()
const previewGenerationQueue: Array<() => void> = []
let activePreviewGenerations = 0

export class StorageConfigurationError extends Error {
  readonly missingVariables: string[]

  constructor(missingVariables: string[]) {
    super(`S3 storage is not configured. Missing environment variables: ${missingVariables.join(', ')}`)
    this.name = 'StorageConfigurationError'
    this.missingVariables = missingVariables
  }
}

function storageConfig() {
  const values = {
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  }
  const missingVariables = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missingVariables.length) throw new StorageConfigurationError(missingVariables)

  return {
    accessKeyId: values.S3_ACCESS_KEY_ID!,
    bucket: values.S3_BUCKET!,
    region: values.S3_REGION!,
    secretAccessKey: values.S3_SECRET_ACCESS_KEY!,
  }
}

export function assertStorageConfigured() {
  storageConfig()
}

function getStorage() {
  const config = storageConfig()
  storage ??= new S3Client({
    region: config.region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    requestChecksumCalculation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
  return { bucket: config.bucket, client: storage }
}

function previewObjectKey(key: string) {
  return `${key}.preview.webp`
}

function isMissingObject(error: unknown) {
  if (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404) return true
  if (!error || typeof error !== 'object') return false
  const value = error as { $metadata?: { httpStatusCode?: number }; name?: string }
  return value.$metadata?.httpStatusCode === 404 || value.name === 'NotFound' || value.name === 'NoSuchKey'
}

async function withPreviewGenerationSlot<T>(generate: () => Promise<T>) {
  if (activePreviewGenerations >= MAX_CONCURRENT_PREVIEW_GENERATIONS) {
    await new Promise<void>((resolve) => previewGenerationQueue.push(resolve))
  } else {
    activePreviewGenerations += 1
  }
  try {
    return await generate()
  } finally {
    const next = previewGenerationQueue.shift()
    if (next) next()
    else activePreviewGenerations -= 1
  }
}

export function canCreateImagePreview(mimeType: string) {
  return previewableMimeTypes.has(mimeType)
}

async function generateImagePreview(key: string, previewKey: string) {
  const { bucket, client } = getStorage()
  const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (!(result.Body instanceof Readable)) throw new Error('Storage did not return a readable image body')

  const transformer = sharp({
    failOn: 'error',
    limitInputPixels: 80_000_000,
    sequentialRead: true,
  })
    .rotate()
    .resize({
      fit: 'inside',
      height: IMAGE_PREVIEW_MAX_DIMENSION,
      width: IMAGE_PREVIEW_MAX_DIMENSION,
      withoutEnlargement: true,
    })
    .webp({ effort: 4, quality: IMAGE_PREVIEW_QUALITY, smartSubsample: true })

  result.Body.on('error', (error) => transformer.destroy(error))
  result.Body.pipe(transformer)
  const body = await transformer.toBuffer()

  await client.send(new PutObjectCommand({
    Body: body,
    Bucket: bucket,
    CacheControl: 'private, max-age=31536000, immutable',
    ContentType: 'image/webp',
    Key: previewKey,
  }))
}

export async function ensureImagePreview(key: string) {
  const existingTask = previewGenerationTasks.get(key)
  if (existingTask) return existingTask

  const task = withPreviewGenerationSlot(async () => {
    const { bucket, client } = getStorage()
    const previewKey = previewObjectKey(key)
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: previewKey }))
    } catch (error) {
      if (!isMissingObject(error)) throw error
      await generateImagePreview(key, previewKey)
    }
    return previewKey
  })

  previewGenerationTasks.set(key, task)
  try {
    return await task
  } finally {
    if (previewGenerationTasks.get(key) === task) previewGenerationTasks.delete(key)
  }
}

class LazyObjectReadStream extends PassThrough {
  private source?: Readable
  private started = false

  constructor(private readonly load: () => Promise<Readable>) {
    super()
  }

  override _read(size: number) {
    if (!this.started) {
      this.started = true
      void this.load()
        .then((source) => {
          this.source = source
          source.on('error', (error) => this.destroy(error))
          source.pipe(this)
        })
        .catch((error: unknown) => this.destroy(error instanceof Error ? error : new Error(String(error))))
    }
    super._read(size)
  }

  override _destroy(error: Error | null, callback: (error?: Error | null) => void) {
    this.source?.destroy()
    callback(error)
  }
}

export function createObjectReadStream(key: string) {
  const { bucket, client } = getStorage()
  return new LazyObjectReadStream(async () => {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    if (!(result.Body instanceof Readable)) throw new Error('Storage did not return a readable object body')
    return result.Body
  })
}

export async function createUploadUrl(options: {
  key: string
  mimeType: string
}) {
  const { bucket, client } = getStorage()
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: options.key,
    ContentType: options.mimeType,
  })
  return getSignedUrl(client, command, { expiresIn: 10 * 60 })
}

export async function createMultipartUpload(key: string, mimeType: string) {
  const { bucket, client } = getStorage()
  const result = await client.send(new CreateMultipartUploadCommand({
    Bucket: bucket,
    ContentType: mimeType,
    Key: key,
  }))
  if (!result.UploadId) throw new Error('Storage did not create a multipart upload')
  return result.UploadId
}

export async function createMultipartPartUrls(options: {
  key: string
  partNumbers: number[]
  uploadId: string
}) {
  const { bucket, client } = getStorage()
  return Promise.all(options.partNumbers.map(async (partNumber) => ({
    partNumber,
    uploadUrl: await getSignedUrl(client, new UploadPartCommand({
      Bucket: bucket,
      Key: options.key,
      PartNumber: partNumber,
      UploadId: options.uploadId,
    }), { expiresIn: 60 * 60 }),
  })))
}

export async function listMultipartParts(key: string, uploadId: string) {
  const { bucket, client } = getStorage()
  const parts: Array<{ eTag: string; partNumber: number; size: number }> = []
  let marker: string | undefined
  do {
    const result = await client.send(new ListPartsCommand({
      Bucket: bucket,
      Key: key,
      PartNumberMarker: marker,
      UploadId: uploadId,
    }))
    for (const part of result.Parts ?? []) {
      if (part.ETag && part.PartNumber && typeof part.Size === 'number') {
        parts.push({ eTag: part.ETag, partNumber: part.PartNumber, size: part.Size })
      }
    }
    marker = result.IsTruncated ? result.NextPartNumberMarker : undefined
  } while (marker)
  return parts
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  existingParts?: Array<{ eTag: string; partNumber: number }>,
) {
  const { bucket, client } = getStorage()
  const parts = existingParts ?? await listMultipartParts(key, uploadId)
  await client.send(new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    MultipartUpload: {
      Parts: parts.map((part) => ({ ETag: part.eTag, PartNumber: part.partNumber })),
    },
    UploadId: uploadId,
  }))
  return parts
}

export async function abortMultipartUpload(key: string, uploadId: string) {
  const { bucket, client } = getStorage()
  await client.send(new AbortMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
  }))
}

export async function createDownloadUrl(
  key: string,
  originalName: string,
  disposition: 'attachment' | 'inline' = 'attachment',
) {
  const { bucket, client } = getStorage()
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: `${disposition}; filename*=UTF-8''${encodeURIComponent(originalName)}`,
  })
  return getSignedUrl(client, command, { expiresIn: 5 * 60 })
}

export async function createAssetReadUrl(options: {
  disposition: 'attachment' | 'inline'
  key: string
  mimeType: string
  originalName: string
  preview: boolean
}) {
  if (options.preview && canCreateImagePreview(options.mimeType)) {
    try {
      const previewKey = await ensureImagePreview(options.key)
      return createDownloadUrl(previewKey, `${options.originalName}.webp`, 'inline')
    } catch (error) {
      console.error(`[onboarding:image-preview] Náhľad pre ${options.key} sa nepodarilo vytvoriť.`, error)
    }
  }

  return createDownloadUrl(
    options.key,
    options.originalName,
    options.disposition,
  )
}

function matchesFileSignature(bytes: Uint8Array, mimeType: string) {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte)
  const headerText = new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/^\uFEFF/, '').trimStart()
  const headerAscii = String.fromCharCode(...bytes.slice(0, 64))
  const hasIsoBmffBrand = (...brands: string[]) =>
    headerAscii.slice(4, 8) === 'ftyp' && brands.some((brand) => headerAscii.includes(brand))

  switch (mimeType) {
    case 'image/jpeg': return startsWith(0xff, 0xd8, 0xff)
    case 'image/png': return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
    case 'image/gif': return headerAscii.startsWith('GIF87a') || headerAscii.startsWith('GIF89a')
    case 'image/bmp': return headerAscii.startsWith('BM')
    case 'image/webp': return startsWith(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    case 'image/avif': return hasIsoBmffBrand('avif', 'avis')
    case 'image/heic': return hasIsoBmffBrand('heic', 'heix', 'hevc', 'hevx', 'mif1')
    case 'image/heif': return hasIsoBmffBrand('heif', 'heim', 'heis', 'mif1', 'msf1')
    case 'image/tiff': return startsWith(0x49, 0x49, 0x2a, 0x00) || startsWith(0x4d, 0x4d, 0x00, 0x2a)
    case 'image/svg+xml': return /^(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(headerText)
    case 'image/vnd.adobe.photoshop': return headerAscii.startsWith('8BPS')
    case 'video/mp4':
    case 'video/quicktime':
    case 'video/x-m4v': return headerAscii.slice(4, 8) === 'ftyp'
    case 'video/webm':
    case 'video/x-matroska': return startsWith(0x1a, 0x45, 0xdf, 0xa3)
    case 'video/x-msvideo': return startsWith(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === 'AVI '
    case 'video/mpeg': return startsWith(0x00, 0x00, 0x01, 0xba) || startsWith(0x00, 0x00, 0x01, 0xb3)
    case 'video/3gpp': return headerAscii.slice(4, 8) === 'ftyp'
    case 'audio/mpeg': return headerAscii.startsWith('ID3') || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
    case 'audio/mp4': return headerAscii.slice(4, 8) === 'ftyp'
    case 'audio/wav': return headerAscii.startsWith('RIFF') && headerAscii.slice(8, 12) === 'WAVE'
    case 'audio/ogg': return headerAscii.startsWith('OggS')
    case 'audio/flac': return headerAscii.startsWith('fLaC')
    case 'application/pdf': return headerText.startsWith('%PDF-')
    case 'application/msword':
    case 'application/vnd.ms-excel':
    case 'application/vnd.ms-powerpoint': return startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.oasis.opendocument.text':
    case 'application/vnd.oasis.opendocument.spreadsheet':
    case 'application/vnd.oasis.opendocument.presentation':
    case 'application/zip': return startsWith(0x50, 0x4b, 0x03, 0x04)
    case 'application/rtf': return headerText.startsWith('{\\rtf')
    case 'text/csv':
    case 'text/plain': return !bytes.includes(0)
    case 'application/x-7z-compressed': return startsWith(0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c)
    case 'application/vnd.rar': return startsWith(0x52, 0x61, 0x72, 0x21, 0x1a, 0x07)
    case 'application/gzip': return startsWith(0x1f, 0x8b)
    default: return bytes.length > 0
  }
}

export async function verifyUploadedObject(key: string, expectedMimeType: string) {
  const { bucket, client } = getStorage()
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  if (head.ContentType !== expectedMimeType) return { head, validType: false }

  const sample = await client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    Range: 'bytes=0-4095',
  }))
  const bytes = sample.Body ? await sample.Body.transformToByteArray() : new Uint8Array()
  return { head, validType: matchesFileSignature(bytes, expectedMimeType) }
}

export async function deleteUploadedObject(key: string) {
  const { bucket, client } = getStorage()
  await Promise.all([
    client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })),
    client.send(new DeleteObjectCommand({ Bucket: bucket, Key: previewObjectKey(key) })),
  ])
}

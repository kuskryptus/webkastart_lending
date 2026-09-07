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
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let storage: S3Client | undefined

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

function matchesFileSignature(bytes: Uint8Array, mimeType: string) {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte)
  const headerText = new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/^\uFEFF/, '').trimStart()
  const headerAscii = String.fromCharCode(...bytes.slice(0, 64))
  const hasIsoBmffBrand = (...brands: string[]) =>
    headerAscii.slice(4, 8) === 'ftyp' && brands.some((brand) => headerAscii.includes(brand))

  switch (mimeType) {
    case 'image/jpeg': return startsWith(0xff, 0xd8, 0xff)
    case 'image/png': return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
    case 'image/webp': return startsWith(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    case 'image/avif': return hasIsoBmffBrand('avif', 'avis')
    case 'image/heic': return hasIsoBmffBrand('heic', 'heix', 'hevc', 'hevx', 'mif1')
    case 'image/heif': return hasIsoBmffBrand('heif', 'heim', 'heis', 'mif1', 'msf1')
    case 'image/tiff': return startsWith(0x49, 0x49, 0x2a, 0x00) || startsWith(0x4d, 0x4d, 0x00, 0x2a)
    case 'image/svg+xml': return /^(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(headerText)
    case 'video/mp4':
    case 'video/quicktime':
    case 'video/x-m4v': return headerAscii.slice(4, 8) === 'ftyp'
    case 'video/webm':
    case 'video/x-matroska': return startsWith(0x1a, 0x45, 0xdf, 0xa3)
    case 'video/x-msvideo': return startsWith(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === 'AVI '
    case 'application/pdf': return headerText.startsWith('%PDF-')
    case 'application/msword': return startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return startsWith(0x50, 0x4b, 0x03, 0x04)
    case 'text/plain': return !bytes.includes(0)
    default: return false
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
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

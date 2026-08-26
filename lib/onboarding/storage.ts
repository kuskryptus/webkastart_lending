import 'server-only'

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let storage: S3Client | undefined

function storageConfig() {
  const bucket = process.env.S3_BUCKET
  const region = process.env.S3_REGION
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('S3 storage is not configured')
  }

  return { accessKeyId, bucket, region, secretAccessKey }
}

function getStorage() {
  const config = storageConfig()
  storage ??= new S3Client({
    region: config.region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
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
  size: number
}) {
  const { bucket, client } = getStorage()
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: options.key,
    ContentLength: options.size,
    ContentType: options.mimeType,
  })
  return getSignedUrl(client, command, { expiresIn: 10 * 60 })
}

function matchesFileSignature(bytes: Uint8Array, mimeType: string) {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte)
  const headerText = new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/^\uFEFF/, '').trimStart()

  switch (mimeType) {
    case 'image/jpeg': return startsWith(0xff, 0xd8, 0xff)
    case 'image/png': return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
    case 'image/webp': return startsWith(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    case 'image/svg+xml': return /^(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(headerText)
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

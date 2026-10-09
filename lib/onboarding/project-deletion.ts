import 'server-only'

import { getDatabase } from './db'
import { abortMultipartUpload, deleteUploadedObject } from './storage'

/** Remove private objects before cascading the client's database records. A failed
 * storage request keeps the database record so the admin can retry the deletion. */
export async function deleteOnboardingProject(clientId: string) {
  const sql = getDatabase()
  return sql.begin(async (transaction) => {
    const clients = await transaction<{ id: string }[]>`
      select client.id
      from clients as client
      where client.id = ${clientId}
        and exists (select 1 from onboarding_projects where client_id = client.id)
      for update
    `
    if (!clients.length) return false

    const assets = await transaction<{ multipartUploadId: string | null; objectKey: string }[]>`
      select storage_key as "objectKey", multipart_upload_id as "multipartUploadId"
      from onboarding_assets
      where client_id = ${clientId}
      for update
    `

    for (let index = 0; index < assets.length; index += 5) {
      await Promise.all(assets.slice(index, index + 5).map(async (asset) => {
        if (asset.multipartUploadId) {
          try {
            await abortMultipartUpload(asset.objectKey, asset.multipartUploadId)
          } catch (error) {
            if (!(error instanceof Error && error.name === 'NoSuchUpload')) throw error
          }
        }
        await deleteUploadedObject(asset.objectKey)
      }))
    }

    await transaction`delete from clients where id = ${clientId}`
    return true
  }) as Promise<boolean>
}

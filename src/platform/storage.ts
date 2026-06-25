/**
 * Platform Adapter - Storage (Image/File Upload)
 *
 * Abstracts file storage for both H5 and mp-weixin platforms.
 * - H5: Uses IndexedDB for blob storage, returns object URLs for preview
 * - mp-weixin: Uses wx.cloud.uploadFile to cloud storage
 */

export interface UploadResult {
  success: boolean
  fileID?: string // Cloud file ID or object URL
  fileId?: string // Alias for compatibility
  message?: string
}

export interface ChooseImageResult {
  success: boolean
  tempFilePaths?: string[]
  message?: string
}

export interface UploadFileOptions {
  filePath: string
  cloudPath?: string
}

// #ifdef H5
/**
 * Choose image (H5)
 */
export async function chooseImage(options: {
  count?: number
  sizeType?: string[]
  sourceType?: string[]
}): Promise<ChooseImageResult> {
  try {
    const res = await uni.chooseImage({
      count: options.count || 1,
      sizeType: options.sizeType || ['compressed'],
      sourceType: options.sourceType || ['album', 'camera']
    })

    return {
      success: true,
      tempFilePaths: res[1]?.tempFilePaths || []
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '选择图片失败'
    }
  }
}

/**
 * H5 Mock File Upload
 * Stores files in IndexedDB and returns object URL for preview
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadResult> {
  try {
    const { filePath } = options
    // In H5, filePath is typically a blob URL or base64
    // For simplicity, we'll store it directly as the "fileId"
    // In a real implementation, you'd store the blob in IndexedDB

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Generate a mock file ID
    const fileId = `h5_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store file reference in localStorage (in real app, use IndexedDB)
    const files = JSON.parse(uni.getStorageSync('uploaded_files') || '{}')
    files[fileId] = filePath
    uni.setStorageSync('uploaded_files', JSON.stringify(files))

    return {
      success: true,
      fileID: filePath, // Return the blob URL directly for H5 preview
      fileId: filePath, // Alias
      message: '文件上传成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '文件上传失败'
    }
  }
}

/**
 * Get file URL for preview (H5)
 */
export function getFileUrl(fileId: string): string {
  // In H5, fileId is already the object URL or base64
  return fileId
}

/**
 * Delete file (H5)
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    const files = JSON.parse(uni.getStorageSync('uploaded_files') || '{}')
    delete files[fileId]
    uni.setStorageSync('uploaded_files', JSON.stringify(files))
    return true
  } catch {
    return false
  }
}
// #endif

// #ifdef MP-WEIXIN
/**
 * Choose image (mp-weixin)
 */
export async function chooseImage(options: {
  count?: number
  sizeType?: string[]
  sourceType?: string[]
}): Promise<ChooseImageResult> {
  try {
    const res = await uni.chooseImage({
      count: options.count || 1,
      sizeType: options.sizeType || ['compressed'],
      sourceType: options.sourceType || ['album', 'camera']
    })

    return {
      success: true,
      tempFilePaths: res[1]?.tempFilePaths || []
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '选择图片失败'
    }
  }
}

/**
 * WeChat Cloud Storage Upload
 * Uploads file to wx.cloud.uploadFile
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadResult> {
  try {
    const { filePath, cloudPath: customCloudPath } = options

    // Generate cloud path if not provided
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const ext = filePath.split('.').pop()
    const cloudPath = customCloudPath || `uploads/${timestamp}_${random}.${ext}`

    // Upload to cloud storage
    const uploadRes = await wx.cloud.uploadFile({
      cloudPath,
      filePath
    })

    if (uploadRes.fileID) {
      return {
        success: true,
        fileID: uploadRes.fileID,
        fileId: uploadRes.fileID, // Alias
        message: '文件上传成功'
      }
    }

    return {
      success: false,
      message: '文件上传失败'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '文件上传失败'
    }
  }
}

/**
 * Get cloud file download URL (mp-weixin)
 */
export async function getFileUrl(fileId: string): Promise<string> {
  try {
    const res = await wx.cloud.getTempFileURL({
      fileList: [fileId]
    })

    if (res.fileList && res.fileList[0]?.tempFileURL) {
      return res.fileList[0].tempFileURL
    }

    return fileId
  } catch {
    return fileId
  }
}

/**
 * Delete cloud file (mp-weixin)
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    await wx.cloud.deleteFile({
      fileList: [fileId]
    })
    return true
  } catch {
    return false
  }
}
// #endif

/**
 * Choose and upload image
 * Unified interface for both platforms
 */
export async function chooseAndUploadImage(count = 1): Promise<UploadResult[]> {
  try {
    const chooseRes = await chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    if (!chooseRes.success || !chooseRes.tempFilePaths) {
      return [{
        success: false,
        message: chooseRes.message || '选择图片失败'
      }]
    }

    // Upload all selected images
    const uploadPromises = chooseRes.tempFilePaths.map(path =>
      uploadFile({ filePath: path })
    )
    const results = await Promise.all(uploadPromises)

    return results
  } catch (error: any) {
    return [{
      success: false,
      message: error.message || '选择图片失败'
    }]
  }
}

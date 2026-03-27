import { createClient } from './client'

const STUDENT_PHOTOS_BUCKET = 'student-photos'

export async function uploadStudentPhoto(
  file: File,
  schoolId: string,
  studentId: string
): Promise<string> {
  const supabase = createClient()

  // Create a unique filename
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const filename = `${studentId}-${timestamp}.${extension}`
  const filePath = `${schoolId}/${studentId}/${filename}`

  try {
    const { data, error } = await supabase.storage
      .from(STUDENT_PHOTOS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STUDENT_PHOTOS_BUCKET).getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading student photo:', error)
    throw error
  }
}

export async function deleteStudentPhoto(
  schoolId: string,
  studentId: string,
  filename: string
): Promise<void> {
  const supabase = createClient()

  try {
    const filePath = `${schoolId}/${studentId}/${filename}`
    const { error } = await supabase.storage
      .from(STUDENT_PHOTOS_BUCKET)
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting student photo:', error)
    throw error
  }
}

export async function getStudentPhotoUrl(
  schoolId: string,
  studentId: string,
  filename: string
): Promise<string> {
  const supabase = createClient()

  const filePath = `${schoolId}/${studentId}/${filename}`
  const {
    data: { publicUrl },
  } = supabase.storage.from(STUDENT_PHOTOS_BUCKET).getPublicUrl(filePath)

  return publicUrl
}

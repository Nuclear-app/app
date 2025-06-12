import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {

    throw new Error('Missing Supabase environment variables')

}

// Use the SSR client which handles session management properly*

const supabase = createBrowserClient(

    SUPABASE_URL,

    SUPABASE_ANON_KEY

)

const BUCKET_NAME = 'transcription'

export async function uploadAudio(file: File) {

    try {
// check if user is logged in*

const { data: { session }, error: sessionErr } = await supabase.auth.getSession()

        if (sessionErr) {

            console.error('Error getting session:', sessionErr)

            throw new Error('Failed to get user session. Please sign in again.')

        }

        if (!session?.access_token) {

            console.log('No session found, checking current user...')

            const { data: { user }, error: userErr } = await supabase.auth.getUser()

            if (userErr || !user) {

                console.error('Error getting user:', userErr)

                throw new Error('No active session found. Please sign in to upload files.')

            }

            const { data: { session: newSession }, error: refreshErr } = await supabase.auth.refreshSession()

            if (refreshErr || !newSession?.access_token) {

                throw new Error('Failed to refresh session. Please sign in again.')

            }

        }

        if (!session?.access_token) {

            throw new Error('No access token available. Please sign in again.')

        }

        const timestamp = Date.now()

        const filePath = `${session.user.id}/${timestamp}-${file.name}`

        const { data: uploadData, error: uploadError } = await supabase

            .storage

            .from(BUCKET_NAME)

            .upload(filePath, file, {

                cacheControl: '3600',

                upsert: true,

                contentType: file.type

            })

        if (uploadError) {

            console.error('Upload error details:', {

                message: uploadError.message,

                name: uploadError.name,

                details: uploadError

            })

            throw new Error(`Failed to upload file: ${uploadError.message || 'Unknown error'}`)

        }

        if (!uploadData?.path) {

            throw new Error('Upload succeeded but no path returned')

        }

        return filePath

    } catch (error) {

        console.error('Error in uploadAudio:', error)

        throw error

    }

}

export async function getAudioURL(file: File) {

    try {

        const filePath = await uploadAudio(file)

        if (!filePath) {

            throw new Error('Failed to upload file')

        }

        const { data, error } = await supabase

            .storage

            .from(BUCKET_NAME)

            .createSignedUrl(filePath, 3600) // 1 hour expiry

if (error) {

            console.error('Error creating signed URL:', error)

            throw error

        }

        if (!data?.signedUrl) {

            throw new Error('No signed URL returned')

        }

        return data.signedUrl

    } catch (error) {

        console.error('Error in getAudioURL:', error)

        throw error

    }

}

export async function deleteAudio(fileName: string) {

    try {

        const { error } = await supabase

            .storage

            .from(BUCKET_NAME)

            .remove([fileName])

        if (error) {

            console.error('Error deleting file:', error)

            throw error

        }

    } catch (error) {

        console.error('Error deleting file:', error)

        throw error

    }

}

export async function uploadFile(file: File, bucketName: string = 'transcription') {
    try {
        // check if user is logged in
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession()

        if (sessionErr) {
            console.error('Error getting session:', sessionErr)
            throw new Error('Failed to get user session. Please sign in again.')
        }

        if (!session?.access_token) {
            console.log('No session found, checking current user...')
            const { data: { user }, error: userErr } = await supabase.auth.getUser()

            if (userErr || !user) {
                console.error('Error getting user:', userErr)
                throw new Error('No active session found. Please sign in to upload files.')
            }

            const { data: { session: newSession }, error: refreshErr } = await supabase.auth.refreshSession()

            if (refreshErr || !newSession?.access_token) {
                throw new Error('Failed to refresh session. Please sign in again.')
            }
        }

        if (!session?.access_token) {
            throw new Error('No access token available. Please sign in again.')
        }

        const timestamp = Date.now()
        const filePath = `${session.user.id}/${timestamp}-${file.name}`

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type
            })

        if (uploadError) {
            console.error('Upload error details:', {
                message: uploadError.message,
                name: uploadError.name,
                details: uploadError
            })
            throw new Error(`Failed to upload file: ${uploadError.message || 'Unknown error'}`)
        }

        if (!uploadData?.path) {
            throw new Error('Upload succeeded but no path returned')
        }

        return filePath
    } catch (error) {
        console.error('Error in uploadFile:', error)
        throw error
    }
}
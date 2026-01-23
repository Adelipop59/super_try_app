import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Read token from cookie (priority) or fallback to Authorization header
    let token = cookieStore.get('access_token')?.value

    if (!token) {
      const authHeader = request.headers.get('Authorization')
      token = authHeader?.replace('Bearer ', '')
    }

    console.log('[Upload API] Token present:', !!token)
    console.log('[Upload API] API_BASE_URL:', API_BASE_URL)

    if (!token) {
      console.error('[Upload API] No token found in cookies or headers')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Transférer le FormData directement au backend
    const formData = await request.formData()
    const file = formData.get('file')

    console.log('[Upload API] File:', file ? 'present' : 'missing')
    if (file instanceof File) {
      console.log('[Upload API] File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
    }

    // Ajouter les paramètres requis par le backend
    formData.append('entityType', 'products')

    // Construire l'URL du backend: API_BASE_URL = http://localhost:3001/api/v1
    // On veut: http://localhost:3001/api/upload/image
    const backendBaseUrl = API_BASE_URL.replace('/api/v1', '')
    const uploadUrl = `${backendBaseUrl}/api/upload/image`
    console.log('[Upload API] Calling backend:', uploadUrl)
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    console.log('[Upload API] Backend response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('[Upload API] Backend error:', error)
      return NextResponse.json(
        { error: error.message || 'Upload failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Upload API] Upload success:', data)
    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.error('[Upload API] Exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

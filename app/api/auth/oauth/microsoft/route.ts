import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export async function GET() {
  console.log('[Microsoft OAuth API] Starting OAuth flow')
  console.log('[Microsoft OAuth API] API_URL:', API_URL)

  try {
    const fullUrl = `${API_URL}/auth/oauth/microsoft`
    console.log('[Microsoft OAuth API] Fetching OAuth URL from:', fullUrl)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('[Microsoft OAuth API] Backend response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('[Microsoft OAuth API] Backend error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to get Microsoft OAuth URL' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Microsoft OAuth API] Backend response data:', data)
    console.log('[Microsoft OAuth API] OAuth URL to redirect to:', data.url)

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Microsoft OAuth API] Exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

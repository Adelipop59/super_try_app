import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('[Check Email API] Calling backend:', `${API_URL}/auth/check-email`)
    console.log('[Check Email API] Request body:', { email })

    const response = await fetch(`${API_URL}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    console.log('[Check Email API] Backend response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('[Check Email API] Backend error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to check email' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Check Email API] Check success:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Check Email API] Exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

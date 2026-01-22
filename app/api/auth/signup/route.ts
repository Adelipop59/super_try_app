import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      companyName,
      country,
      phone,
      siret,
    } = body

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // PRO-specific validation
    if (role === 'PRO') {
      if (!firstName || !lastName || !companyName || !country) {
        return NextResponse.json(
          { error: 'firstName, lastName, companyName, and country are required for PRO accounts' },
          { status: 400 }
        )
      }
    }

    console.log('[Signup API] Calling backend:', `${API_URL}/auth/signup`)
    console.log('[Signup API] Request body:', { email, role, firstName, lastName, companyName, country })

    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role,
        firstName,
        lastName,
        companyName,
        country,
        phone,
        siret,
      }),
    })

    console.log('[Signup API] Backend response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('[Signup API] Backend error:', error)
      return NextResponse.json(
        { error: error.message || 'Signup failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Signup API] Signup success')
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Signup API] Exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    const data = await tokenResponse.json();
    
    // Store the tokens securely (e.g., in database or secure cookie)
    // Return success response
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Spotify auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const APP_ID = process.env.INSTAGRAM_APP_ID!
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!
const REDIRECT_URI = 'https://clearthesignal.com/api/admin/instagram/capture-token'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error_description')

  if (error) {
    return new NextResponse(`<pre>Error: ${error}</pre>`, { headers: { 'Content-Type': 'text/html' } })
  }

  if (!code) {
    return new NextResponse('<pre>No code in URL</pre>', { headers: { 'Content-Type': 'text/html' } })
  }

  // Exchange code for short-lived token
  const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: APP_ID,
      client_secret: APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code,
    }),
  })
  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return new NextResponse(`<pre>Token exchange failed:\n${JSON.stringify(tokenData, null, 2)}</pre>`, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const shortToken = tokenData.access_token
  const userId = tokenData.user_id

  // Exchange for long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${APP_SECRET}&access_token=${shortToken}`
  )
  const longData = await longRes.json()

  const finalToken = longData.access_token ?? shortToken
  const expiresIn = longData.expires_in ?? 'unknown'

  const html = `<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem;background:#0a0812;color:#d4c4a8">
<h2 style="color:#c4673a">Instagram Token Captured</h2>
<p><b>INSTAGRAM_USER_ID:</b></p>
<pre style="background:#141228;padding:1rem;border-radius:4px">${userId}</pre>
<p><b>INSTAGRAM_ACCESS_TOKEN</b> (expires in ${Math.round(Number(expiresIn) / 86400)} days):</p>
<pre style="background:#141228;padding:1rem;border-radius:4px;word-break:break-all">${finalToken}</pre>
<p style="color:#6b6fad">Add both to Vercel env vars, then delete the capture-token route.</p>
</body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}

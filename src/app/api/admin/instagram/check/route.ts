import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID

  if (!accessToken || !userId) {
    return NextResponse.json({ error: 'no credentials' })
  }

  const [meRes, permsRes] = await Promise.all([
    fetch(`https://graph.instagram.com/v21.0/me?fields=id,username,account_type,name&access_token=${accessToken}`),
    fetch(`https://graph.instagram.com/v21.0/me/permissions?access_token=${accessToken}`),
  ])

  const me = await meRes.json()
  const perms = await permsRes.json()

  return NextResponse.json({ userId, me, permissions: perms?.data ?? perms })
}

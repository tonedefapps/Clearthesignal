import { NextRequest, NextResponse } from 'next/server'
import { runCurationPipeline } from '@/lib/pipeline/runPipeline'

export const dynamic = 'force-dynamic'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.PIPELINE_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runCurationPipeline()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Pipeline error:', error)
    return NextResponse.json({ error: 'Pipeline failed' }, { status: 500 })
  }
}

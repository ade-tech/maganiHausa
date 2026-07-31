import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const response = await fetch(`${ollamaHost}/api/tags`)
    if (!response.ok) {
      return NextResponse.json({ models: [] })
    }
    const data = await response.json()
    const models = data.models?.map((m: any) => m.name) || []
    return NextResponse.json({ models })
  } catch (error) {
    console.error('Failed to fetch local Ollama models:', error)
    return NextResponse.json({ models: [] })
  }
}

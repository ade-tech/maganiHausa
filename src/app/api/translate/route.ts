import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { text, image, model } = await request.json()
    const targetModel = model || 'gemma4:e4b'

    let strippedImage = null
    if (image) {
      // Strip out the data URI prefix if present (e.g. data:image/jpeg;base64,)
      strippedImage = image.includes('base64,') ? image.split('base64,')[1] : image
    }

    const systemPromptText = `You translate English medical prescription instructions into natural, conversational Kano Hausa. Rules:
1. Translate numbers into spoken Hausa words, but immediately append the original digit in parentheses, e.g. "biyu (2)", "uku (3)", "sau uku (3)", "kwana bakwai (7)".
2. Copy all dosage units (e.g. mg, ml), frequencies, and drug names EXACTLY as written in English — do not translate or reword them.
3. Translate only the surrounding instructional language into Hausa.
4. Output natural spoken Hausa a patient's family would actually say, not a stiff literal translation.
5. Identify the main drug name(s) in the prescription and provide a brief description of what it is used for and patient safety warnings in simple, patient-friendly Kano Hausa.

You MUST format your output EXACTLY like this (use these exact headers):
---HAUSA---
[Kano Hausa translation]
---DRUG-INFO---
[Brief description of the identified drug(s) and patient safety warnings in Kano Hausa]`

    const systemPromptImage = `You are a medical assistant. Extract the prescription text from the image, translate it into natural, conversational Kano Hausa, and identify the drugs. Rules:
1. Translate numbers into spoken Hausa words, but immediately append the original digit in parentheses, e.g. "biyu (2)", "uku (3)", "sau uku (3)", "kwana bakwai (7)".
2. Copy all dosage units (e.g. mg, ml), frequencies, and drug names EXACTLY as written in English — do not translate or reword them.
3. Translate only the surrounding instructional language into Hausa.
4. Output natural spoken Hausa a patient's family would actually say, not a stiff literal translation.
5. Identify the main drug name(s) in the prescription and provide a brief description of what it is used for and patient safety warnings in simple, patient-friendly Kano Hausa.

You MUST format your output EXACTLY like this (use these exact headers):
---ENGLISH---
[Extracted English prescription text]
---HAUSA---
[Kano Hausa translation]
---DRUG-INFO---
[Brief description of the identified drug(s) and patient safety warnings in Kano Hausa]`

    let messages = []
    if (strippedImage) {
      messages = [
        {
          role: 'system',
          content: systemPromptImage,
        },
        {
          role: 'user',
          content: text || 'Please extract the prescription from this image, translate it, and explain the medication.',
          images: [strippedImage],
        },
      ]
    } else {
      messages = [
        {
          role: 'system',
          content: systemPromptText,
        },
        {
          role: 'user',
          content: text,
        },
      ]
    }

    const ollamaPayload = {
      model: targetModel,
      messages,
      stream: false,
      options: {
        temperature: 0.1, // low temperature for high precision
      },
      keep_alive: '1h', // keep the model warm in memory for 1 hour to speed up subsequent queries
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout for local/slower CPU inference

    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const response = await fetch(`${ollamaHost}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaPayload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 400 && strippedImage) {
        throw new Error(
          `The selected model (${targetModel}) does not support image inputs because it is text-only. Please pull and select a vision-capable model (like "llama3.2-vision") or use text prescription entry instead.`
        )
      }
      throw new Error(`Ollama server returned status ${response.status}`)
    }

    const data = await response.json()
    const rawContent = data.message?.content || ''

    let originalText = text || ''
    let translation = ''
    let drugInfo = ''

    if (strippedImage) {
      // Parse the ---ENGLISH---, ---HAUSA---, and ---DRUG-INFO--- sections case-insensitively
      const englishMatch = rawContent.match(/---(?:ENGLISH|English)---([\s\S]*?)---(?:HAUSA|Hausa)---/i)
      const hausaMatch = rawContent.match(/---(?:HAUSA|Hausa)---([\s\S]*?)---(?:DRUG-INFO|Drug-Info|DRUG_INFO)---/i)
      const drugMatch = rawContent.match(/---(?:DRUG-INFO|Drug-Info|DRUG_INFO)---([\s\S]*)/i)

      if (englishMatch && hausaMatch) {
        originalText = englishMatch[1].trim()
        translation = hausaMatch[1].trim()
        drugInfo = drugMatch ? drugMatch[1].trim() : ''
      } else {
        // Fallback parser if structured headings failed
        originalText = 'Prescription Image'
        translation = rawContent.replace(/---(?:ENGLISH|HAUSA|DRUG-INFO|DRUG_INFO)---/gi, '').trim()
      }
    } else {
      // Parse the ---HAUSA--- and ---DRUG-INFO--- sections for text-only queries
      const hausaMatch = rawContent.match(/---(?:HAUSA|Hausa)---([\s\S]*?)---(?:DRUG-INFO|Drug-Info|DRUG_INFO)---/i)
      const drugMatch = rawContent.match(/---(?:DRUG-INFO|Drug-Info|DRUG_INFO)---([\s\S]*)/i)

      if (hausaMatch && drugMatch) {
        translation = hausaMatch[1].trim()
        drugInfo = drugMatch[1].trim()
      } else {
        // Fallback
        translation = rawContent.replace(/---(?:HAUSA|DRUG-INFO|DRUG_INFO)---/gi, '').trim()
      }
    }

    return NextResponse.json({
      originalText,
      translation,
      drugInfo: drugInfo || null,
    })

  } catch (error: any) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error?.message || 'An error occurred while communicating with the local translation model.' },
      { status: 500 }
    )
  }
}

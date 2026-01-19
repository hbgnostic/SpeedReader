import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface TextAnalysis {
  summary: string;
  keyThemes: string[];
  glossary: { term: string; definition: string }[];
  difficulty: 'easy' | 'moderate' | 'challenging' | 'dense';
  difficultyExplanation: string;
  recommendedWPM: number;
}

export async function POST(request: NextRequest) {
  try {
    const { text, apiKey } = await request.json();

    // Use provided key or fall back to environment variable
    const openaiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required. Set OPENAI_API_KEY environment variable or provide it in settings.' },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Truncate text if too long (GPT-4o context is large but we want to save tokens)
    const maxChars = 15000;
    const truncatedText = text.length > maxChars
      ? text.slice(0, maxChars) + '...[truncated]'
      : text;

    const openai = new OpenAI({ apiKey: openaiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert reading coach helping someone prepare to speed-read a text using RSVP (Rapid Serial Visual Presentation). RSVP shows one word at a time, which makes it harder to comprehend dense or technical material.

Your job is to analyze the text and provide:
1. A brief summary (2-3 sentences) to prime the reader's understanding
2. 3-5 key themes or concepts they'll encounter
3. A glossary of 3-8 technical terms, jargon, or potentially unfamiliar words with brief definitions
4. A difficulty assessment for RSVP reading specifically

For difficulty, consider:
- easy: Familiar vocabulary, simple sentences, narrative or conversational
- moderate: Some technical terms, longer sentences, requires some focus
- challenging: Dense ideas, specialized vocabulary, complex arguments
- dense: Academic/philosophical writing, requires re-reading to understand (may not be suitable for RSVP)

Respond in JSON format only.`
        },
        {
          role: 'user',
          content: `Analyze this text for RSVP speed reading preparation:

---
${truncatedText}
---

Respond with this exact JSON structure:
{
  "summary": "2-3 sentence summary",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "glossary": [
    {"term": "word", "definition": "brief definition"}
  ],
  "difficulty": "easy|moderate|challenging|dense",
  "difficultyExplanation": "Brief explanation of why, and any specific challenges",
  "recommendedWPM": 250
}`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis: TextAnalysis = JSON.parse(content);

    // Validate and provide defaults
    return NextResponse.json({
      summary: analysis.summary || 'Summary not available',
      keyThemes: analysis.keyThemes || [],
      glossary: analysis.glossary || [],
      difficulty: analysis.difficulty || 'moderate',
      difficultyExplanation: analysis.difficultyExplanation || '',
      recommendedWPM: analysis.recommendedWPM || 300,
    });
  } catch (error) {
    console.error('OpenAI analysis error:', error);

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze text' },
      { status: 500 }
    );
  }
}

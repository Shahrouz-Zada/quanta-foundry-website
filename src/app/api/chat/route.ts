import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { QUANTA_ASSISTANT_CONTEXT } from '@/lib/quanta-assistant-context';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Abuse Protection: Block empty messages
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1];

    // 2. Abuse Protection: Max input length (e.g., 500 characters)
    if (latestMessage.content && latestMessage.content.length > 500) {
      return NextResponse.json(
        { error: 'Message is too long. Please limit your message to 500 characters.' },
        { status: 400 }
      );
    }

    // 3. (Optional but recommended) Basic IP rate limiting could be added here via Edge Config or Redis.
    // For MVP, Next.js handles basic request throttling, but true rate-limiting requires a DB.

    // 4. OpenAI Server-Side Call
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: QUANTA_ASSISTANT_CONTEXT,
      messages,
      temperature: 0.2, // Low temperature to strictly stick to the facts
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    // Graceful fallback response if API fails
    return new Response(
      "I’m currently unable to answer. Please contact Quanta Foundry through the contact form.",
      { status: 500 }
    );
  }
}

import { streamText, tool } from 'ai';
import { google } from "@ai-sdk/google";
import { z } from 'zod';
import { getInstagramData } from '@/lib/getInstagramData';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-flash'),
    messages,
    system: `You are a SEO expert. You are going to generate keywords for SEO articles based on a username instagram that user provided. Use getData tool to get data from Instagram.`,
    tools: {
        getData: tool({
            description: 'Get data from Instagram',
            parameters: z.object({ username: z.string().describe('The username of the Instagram account') }),
            execute: async ({ username }) => {
                const data = await getInstagramData(username);
                return { data };
            }
        })
    },
    maxSteps: 100
  });

  return result.toDataStreamResponse();
}
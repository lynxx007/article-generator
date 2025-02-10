import { getInstagramData } from "@/lib/getInstagramData";
import { google } from "@ai-sdk/google";
import { createDataStream, createDataStreamResponse, generateObject, generateText, pipeDataStreamToResponse, streamText, tool } from "ai";
import { NextRequest } from "next/server";
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const model = google('gemini-1.5-flash-8b');

  return createDataStreamResponse({
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
    async execute(dataStream) {
      try {
        // Stream the title
        let title = '';
        const resultTitle = streamText({
          model,
          system: `You are a SEO expert. You are going to generate some titles for SEO articles based on a file user provided that contains keywords. Use the same languange as users ask to answer the questions.`,
          messages,
        });

        dataStream.writeData('***~~~~Title~~~***\n\n');
        for await (const chunk of resultTitle.textStream) {
          dataStream.writeData(chunk);
          title += chunk;
        }
        dataStream.writeData('\n\n');
        
        // Stream the content brief
        let contentBrief = '';
        const resultContentBrief = streamText({
          model,
          system: `You are a SEO expert. You are going to generate a content brief for SEO articles. The content brief must include the following items:
          - Title
          - Intended Audience
          - The Solution They Seek
          - Headings
          - Competitor and Referenced Articles
          - Length in Words
          - Keywords Used 
          your task is to outline the key elements and structure of the upcoming SEO article based on the provided title. Providing a detailed brief is crucial for guiding the content creation process in alignment with SEO best practices and the content strategy. Include target audience demographics, primary and secondary keywords, desired tone and style, key sections, and specific instructions for the content writer. Outline target audience demographics, primary and secondary keywords, desired tone, key sections, and any additional resources or references.
          Use the same languange as the title provided to answer the question.`,
          prompt: `Create a content brief for the following title: ${title}`,
        });
        dataStream.writeData('***~~~Content Brief~~~***\n\n');
        for await (const chunk of resultContentBrief.textStream) {
          dataStream.writeData(chunk);
          contentBrief += chunk;
        }
        dataStream.writeData('\n\n');

        // Stream the article
        const resultArticle = streamText({
          model,
          system: `You are a SEO expert. You are going to generate a SEO article based on a content brief. Use the same languange as the title provided to answer the question.`,
          prompt: `Create a SEO article based on the following content brief: ${contentBrief}`,
        });

        dataStream.writeData('***~~~Article~~~***\n\n');
        for await (const chunk of resultArticle.textStream) {
          dataStream.writeData(chunk);
        }
      } catch (error) {
        dataStream.writeData(`\n\nError: ${error instanceof Error ? error.message : String(error)}\n\n`);
      }
    },
    onError: error => `Custom error: ${error instanceof Error ? error.message : String(error)}`,
  });
}
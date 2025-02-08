import { getInstagramData } from "@/lib/getInstagramData";
import { google } from "@ai-sdk/google";
import { createDataStream, createDataStreamResponse, generateObject, generateText, pipeDataStreamToResponse, streamText, tool } from "ai";
import { NextRequest } from "next/server";
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const model = google('gemini-1.5-flash');

  return createDataStreamResponse({
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
    async execute(dataStream) {
      // Stream the title
      const resultTitle = await generateText({
        model,
        system: `You are a SEO expert. You are going to generate a title for SEO articles based on a file user provided that contains keywords. Use the same languange as users ask to answer the question.`,
        messages,
      });
      dataStream.writeData(`Title: ${resultTitle.text}\n\n`);
      

      // Stream the content brief
      const resultContentBrief = await generateText({
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
        use the same languange as the title provided to answer the question.`,
        prompt: `Create a content brief for the following title: ${resultTitle.text}`,
      });
      dataStream.writeData(`Content Brief: ${resultContentBrief.text}\n\n`);

      // Stream the article
      const resultArticle = streamText({
        model,
        system: `You are a SEO expert. You are going to generate a SEO article based on a content brief. use one of these titles that you have provided.
        Titles: ${resultTitle.text}. Use the same languange as the title provided to answer the question.`,
        prompt: `Create a SEO article based on the following content brief: ${resultContentBrief.text}`,
      });

      for await (const chunk of resultArticle.textStream) {
        dataStream.writeData(chunk);
      }
    },
    onError: error => `Custom error: ${error}`,
  });
}
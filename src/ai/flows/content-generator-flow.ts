
'use server';
/**
 * @fileOverview An AI flow for generating various types of content.
 *
 * - generateContent - A function that handles the content generation process.
 * - ContentGeneratorInput - The input type for the generateContent function.
 * - ContentGeneratorOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ContentGeneratorInputSchema = z.object({
  topic: z.string().describe('The main topic or a detailed prompt for the content to be generated.'),
  contentType: z.enum(['blog', 'facebook', 'experiment']).describe('The type of content to generate (e.g., blog post, facebook post).'),
  tone: z.string().optional().describe('The desired tone for the content (e.g., professional, casual, witty).'),
});
export type ContentGeneratorInput = z.infer<typeof ContentGeneratorInputSchema>;

const ContentGeneratorOutputSchema = z.object({
  title: z.string().describe('A catchy and relevant title for the content.'),
  body: z.string().describe('The main body of the content. For blogs, this should be well-structured with paragraphs. For social media, it should be concise.'),
  suggestedTags: z.array(z.string()).describe('A list of relevant tags or keywords for the content, which can be used for categorization or SEO.'),
});
export type ContentGeneratorOutput = z.infer<typeof ContentGeneratorOutputSchema>;

// Exported wrapper function to be called from the client
export async function generateContent(input: ContentGeneratorInput): Promise<ContentGeneratorOutput> {
  return contentGeneratorFlow(input);
}

const contentGenerationPrompt = ai.definePrompt({
  name: 'contentGeneratorPrompt',
  input: { schema: ContentGeneratorInputSchema },
  output: { schema: ContentGeneratorOutputSchema },
  prompt: `You are an expert content creator for a tech company called NOORIX.
Your task is to generate a draft for a new piece of content based on the user's request.

Follow these instructions carefully:
1.  Analyze the user's topic: {{{topic}}}
2.  The content type is: {{{contentType}}}.
3.  The desired tone is: {{#if tone}}{{{tone}}}{{else}}professional and informative{{/if}}.
4.  Generate a compelling title that is relevant to the topic.
5.  Write the main body of the content. It should be well-written, engaging, and tailored to the specified content type and tone.
6.  Provide a list of 3 to 5 relevant tags (lowercase, no spaces) that would be suitable for this content.

Produce the output in the required JSON format.
`,
});

const contentGeneratorFlow = ai.defineFlow(
  {
    name: 'contentGeneratorFlow',
    inputSchema: ContentGeneratorInputSchema,
    outputSchema: ContentGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await contentGenerationPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate content.");
    }
    return output;
  }
);

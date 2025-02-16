import { openai } from './openai';
import Exa from 'exa-js';

type CategoryOptions = "company" | "research paper" | "news" | "pdf" | "github" | "tweet" | "personal site" | "linkedin profile" | "financial report";

const searchExaToolSchema = {
  name: "searchExa",
  description: "Search Exa for current and relevant information about a topic",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The topic to search for",
      },
      category: {
        type: "string",
        description: "The category of the topic to search for",
        enum: ["company", "research paper", "news", "pdf", "github", "tweet", "personal site", "linkedin profile", "financial report"],
      },
    },
    required: ["query", "category"],
  },
} as const;

async function searchExa(query: string, category?: CategoryOptions): Promise<string> {
  const exa = new Exa(process.env.EXA_API_KEY);
  const searchResults = await exa.searchAndContents(query, {
    highlights: true,
    numResults: 3,
    category: category,
    useAutoprompt: true
  });

  return searchResults.results
    .map(result => result.highlights?.[0] || '')
    .filter(highlight => highlight.length > 0)
    .join('\n\n');
}

export async function generateTitle(query: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Meta-Llama-3.3-70B-Instruct
        messages: [{ role: "user", content: `Come up with a short title for the following query + context to a lesson generator: "${query}". Write nothing else. Use markdown to format the title. Do not imagine the title, just write it.` }],
    });
    return response.choices[0]?.message?.content || "";
}

export async function generateImagesAndConcepts(query: string, information: string): Promise<{ images: string[], concepts: string[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Meta-Llama-3.3-70B-Instruct
      messages: [
        {
          role: "system",
          content: `You are an expert educator who creates engaging visuals and concepts.
            Then, with 3-4 descriptions of images that are relevant to the topic to search for.
            Then, with 4-5 short, related concept names tags with an animation that is fitting for the concept.`
        },
        {
          role: "user",
          content: `Please create a title and visuals for: "${query}"`
        }
      ],
      response_format: { type: "json_schema", json_schema: { name: "imagesAndConcepts", schema: { type: "object", properties: { images: { type: "array", items: { type: "string", description: "A description of an image relevant to the topic to search the internet for" } }, concepts: { type: "array", items: { type: "string", description: "A short, related concept name" } } } } } },
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error('Error generating title and images:', error);
    return { images: [], concepts: [] };
  }
}

export async function generateIntro(query: string): Promise<ReadableStream<string>> {
  try {
    // First, get search results
    const searchContext = await searchExa(query);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert educator who creates engaging introductions to topics.
            - Create brief, engaging introductions (2-3 sentences)
            - Keep the tone friendly and approachable
            - Avoid technical jargon unless absolutely necessary
            - Use the search results to make the introduction current and relevant
            Start by coming up with a title of the topic given the query as <title>title</title>
            Then, with 3-4 descriptions of images that are relevant to the topic to search for, written as <image description="image_description" /> tags.
            Then, with 4-5 short, related concept names, written as <concept name="concept_name" animation="animation_name" /> tags with an animation that is fitting for the concept.
            Then, write an engaging introduction to the topic that is to be spoken out loud, written as <introduction>introduction</introduction>
            `
        },
        {
          role: "user",
          content: `Using this current information: "${searchContext}"\n\nPlease create an engaging introduction to: "${query}"`
        }
      ],
      tools: [{
        type: "function",
        function: searchExaToolSchema
      }],
      stream: true // Enable streaming
    });

    // Convert the stream to a ReadableStream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(content);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  } catch (error) {
    console.error('Error generating introduction:', error);
    return new ReadableStream({
      start(controller) {
        controller.enqueue('Failed to generate introduction. Please try again.');
        controller.close();
      }
    });
  }
}

export async function generateAudioIntro(query: string): Promise<ReadableStream<string>> {
  try {
    const searchContext = await searchExa(query);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert educator who creates engaging introductions to topics.
            - Create brief, engaging introductions (2-3 sentences)
            - Keep the tone friendly and approachable
            - Avoid technical jargon unless absolutely necessary
            - Use the search results to make the introduction current and relevant
            - Speak naturally and conversationally
            Your response will be converted directly to speech, so write in a way that sounds natural when spoken.`
        },
        {
          role: "user",
          content: `Using this current information: "${searchContext}"\n\nPlease create an engaging introduction to: "${query}"`
        }
      ],
      stream: true,
      max_tokens: 200
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(content);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  } catch (error) {
    console.error('Error generating audio introduction:', error);
    throw error;
  }
}

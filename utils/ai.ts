import { OpenAI } from 'openai';
import Constants from 'expo-constants';

// Use expoConfig for managed workflow
const apiKey = Constants.expoConfig?.extra?.openaiApiKey;

if (!apiKey) {
  throw new Error('OpenAI API key is not defined. Please check your app.config.js or .env file.');
}

// Initialize the OpenAI client
const client = new OpenAI({ apiKey });

export async function getAIResponse(
  prompt: string,
  addMessage: (message: string) => void
): Promise<string> {
  try {
    // Store the user's prompt
    addMessage(`User: ${prompt}`);

    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a text-based fantasy adventure game engine. Generate immersive and engaging narratives based on the player's input. Keep responses concise, varied in length, use the second person perspective, and incorporate the player's stats and inventory where appropriate. Start with a crisis that the player must resolve. End with a cliffhanger or a choice that leads to multiple branching paths.`,
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o-mini', // Use 'gpt-3.5-turbo' if 'gpt-4' is not available
      max_tokens: 200,
    });

    if (
      response.choices &&
      response.choices[0] &&
      response.choices[0].message &&
      response.choices[0].message.content
    ) {
      const responseText = response.choices[0].message.content.trim();

      // Store the AI's response
      addMessage(`AI: ${responseText}`);

      return responseText;
    } else {
      throw new Error('Invalid response structure from OpenAI API');
    }
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return 'An error occurred while fetching the story. Please try again.';
  }
}


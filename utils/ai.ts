import { OpenAI } from 'openai';
import Constants from 'expo-constants';

// Use expoConfig for managed workflow
const apiKey = Constants.expoConfig?.extra?.openaiApiKey;

if (!apiKey) {
  throw new Error('OpenAI API key is not defined. Please check your app.config.js or .env file.');
}

// Initialize the OpenAI client
const client = new OpenAI({ apiKey });

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a quest generator for a medieval text-based RPG. Here is the structured data for the quest. Please expand it into a narrative format, filling in details such as dialogue, descriptions, and gameplay mechanics, while adhering to the structure provided. Rules: Don\'t let player use any powers or items they don\'t explicitly have. Player can ONLY choose their own actions, they can\'t dictate the story or conjur items or abilities out of nothing. Always speak in 2nd person active voice and greet the player by name. Respond in structured JSON provided by the example. Keep responses under 200 characters. Include player stats: health, maxHealth, stamina, maxStamina, magic, maxMagic, attack, defense, xp, level, and skills.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o-mini', // Use 'gpt-3.5-turbo' if 'gpt-4' is not available
      max_tokens: 500,
    });

    if (
      response.choices &&
      response.choices[0] &&
      response.choices[0].message &&
      response.choices[0].message.content
    ) {
      const responseText = response.choices[0].message.content.trim();
      return responseText;
    } else {
      throw new Error('Invalid response structure from OpenAI API');
    }
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return 'An error occurred while fetching the story. Please try again.';
  }
}


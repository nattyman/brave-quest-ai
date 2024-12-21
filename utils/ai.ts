import { OpenAI } from 'openai';
import Constants from 'expo-constants';
import questData from '../story/quest1-milestone1.json'; // Import the quest data
import itemsData from '../story/items.json'; // Import the combined items list
import magicSystem from '../story/spells.json'; // Import the magic system
import characters from '../story/wyrdwell-characters.json'; // Import the characters
import places from '../story/wyrdwell-places.json'; // Import the places

// Use expoConfig for managed workflow
const apiKey = Constants.expoConfig?.extra?.openaiApiKey;

if (!apiKey) {
  throw new Error('OpenAI API key is not defined. Please check your app.config.js or .env file.');
}

// Initialize the OpenAI client
const client = new OpenAI({ apiKey });
const messageContent = `You are a quest generator for a medieval text-based RPG. Here is the structured data for the quest. Please expand it into a narrative format, filling in details such as dialogue, descriptions, and gameplay mechanics, while adhering to the structure provided. Rules: Don\'t let player use any powers or items they don\'t explicitly have. Player can ONLY choose their own actions, they can\'t dictate the story or conjur items or abilities out of nothing. Always speak in 2nd person active voice and greet the player by name. Respond in structured JSON provided by the example. Keep responses under 400 characters. Include changes to player stats: health, maxHealth, stamina, maxStamina, magic, maxMagic, attack, defense, xp, level, and skills.
          
          Story Information:
          ${JSON.stringify(questData)}

          Characters:
          ${JSON.stringify(characters)}

          Places:
          ${JSON.stringify(places)}
          
          Available Items:
          ${JSON.stringify(itemsData)}
      
          Available Spells:
          ${JSON.stringify(magicSystem)}
        
          
          `;

const responseRules = `
  Response Instructions: Respond with plus or minus changes to the game state in this JSON Object format:
      {

        "playerStats": { 
          "health": -x, 
          "maxHealth": x, 
          "stamina": -x, 
          "maxStamina": x, 
          "magic": -x, 
          "maxMagic": x, 
          "attack": x, 
          "defense": x, 
          "xp": x, 
          "level": x, 
          "skills": ["new skill"],
          "gold": x, 
          "strength": x, 
          "dexterity": x, 
          "intelligence": x, 
          "charisma": x, 
          "wisdom": x, 
          "constitution": x, 
          "stealth": x, 
          "perception": x }, 
        "inventory": { "add": ["item_id", "item_id"], "remove": ["item_id"] }, // Only add items from the available items list.
        "equippedItems": ["item_id", null],
        "spells": ["spell_name"], // Add new spells array
        "store": ["item_id", "item_id"], // If at a store, Add store array to provide items available in the store
        "AtStore": true, // Add AtStore boolean to indicate if the player is at a store
        "story": "The story content goes here..."

      }
    Response Rules:
        - Only send changes to stats that need updated, whole numbers to add, x, and negative numbers to subtrack, -x. Don't use a + sign.
        - If a stat is not updated, don't include it in the JSON object.
        - Response instruction data are just examples only provide what fits in the context of the story.
        - Provide the updated game state as a plain JSON object without any formatting characters like \`\`\`
        - Nudge the player forward in the quest, but give them space to explore.
        - Don't directly quote story text, paraphrase and expand on it.
        - Always ask what the player wants to do next inside the story JSON.
        - Character must choose to purchase items, don't purchase for them.
        - Don't summarize combat, make player choose actions, step by step through combat.
        - Remember to add and remove items from inventory as part of the story. Include item and stat changes in the story.
        - Only update character profeciencies when they level up, and it should be related to the story, and skills they used.
        - Only add items to the store array that exist in the available items list.
        - Set AtStore to true if the player is at a store, otherwise set it to false.

    Dice Rules:
      - Determine level difficulty (1-20) for success or failure for whatever task player is attempting.
      - A 20-sided die (d20) will be rolled to determine the outcome of actions.
      - A roll of 1 is a critical failure-worst case scenario, and a roll of 20 is a critical success-best possible case.
      - Add relevent proficiency, weapon, and item stats to the dice roll to determine the outcome.
      
   `;

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: messageContent + responseRules,
        },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o-mini',
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


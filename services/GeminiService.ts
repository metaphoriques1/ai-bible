

// Note: This is a partly simulated implementation. In a real scenario, ensure API key security.
// The prompt specifies using process.env.API_KEY directly.

import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // Using correct import
import { Interpretation, Theologian, ChatMessage, UserProfile, ChristianTradition, ActivityType, PlannedActivity, JournalEntry, CommunityGroup } from '../types';
import { SAMPLE_THEOLOGIANS, SAMPLE_INTERPRETATIONS, getCoachResponseSample, SAMPLE_COMMUNITY_GROUPS, SAMPLE_BIBLE_CHAPTER_VERSES } from './MockDb';
import { GEMINI_TEXT_MODEL, API_DELAY, TRADITION_THEOLOGIAN_LISTS } from '../constants';

const API_KEY_ENV = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY_ENV) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY_ENV });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI, API_KEY might be missing or invalid:", error);
  }
} else {
  console.warn("API_KEY is not defined. GeminiService will use fallback responses for some functionalities.");
}


export const getTheologians = async (): Promise<Theologian[]> => {
  console.log("GeminiService: Fetching theologians (sample data).");
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(SAMPLE_THEOLOGIANS);
    }, API_DELAY);
  });
};

export const getInterpretationsForPassage = async (passageRef: string, traditionFilters?: string[]): Promise<Interpretation[]> => {
  if (!ai || (traditionFilters && traditionFilters.length === 0 && Object.keys(TRADITION_THEOLOGIAN_LISTS).length > 0) ) { // If no AI or no filters when filters could be applied based on TRADITION_THEOLOGIAN_LISTS
    console.warn(`GeminiService: AI not initialized or no tradition filters for ${passageRef}. Using general sample interpretations.`);
    return new Promise(resolve => {
        setTimeout(() => {
            const results = SAMPLE_INTERPRETATIONS.filter(interp => {
                return interp.passage.toLowerCase() === passageRef.toLowerCase();
            });
            resolve(results.map(interp => {
                const theologian = SAMPLE_THEOLOGIANS.find(t => t.id === interp.theologianId);
                return {
                    ...interp, 
                    theologianName: theologian?.name || 'Unknown Theologian',
                    theologianTradition: theologian?.tradition || 'Sample Tradition'
                };
            }));
        }, API_DELAY);
    });
  }

  const generatedInterpretations: Interpretation[] = [];
  const traditionsToQuery = traditionFilters && traditionFilters.length > 0 
    ? traditionFilters 
    : (Object.keys(TRADITION_THEOLOGIAN_LISTS).length > 0 ? Object.keys(TRADITION_THEOLOGIAN_LISTS) : ['Christian']); 


  console.log(`GeminiService: Fetching AI interpretations for ${passageRef} across traditions: ${traditionsToQuery.join(', ')}.`);

  for (const tradition of traditionsToQuery) {
    const theologiansInTradition = TRADITION_THEOLOGIAN_LISTS[tradition as keyof typeof TRADITION_THEOLOGIAN_LISTS] || [];
    
    let randomTheologianName = "a representative theologian from this tradition";
    if (theologiansInTradition.length > 0) {
      randomTheologianName = theologiansInTradition[Math.floor(Math.random() * theologiansInTradition.length)];
    } else if (tradition === 'Christian') {
        randomTheologianName = "a prominent Christian theologian known for insightful biblical commentary";
    } else {
        randomTheologianName = `a theologian known for insights within the ${tradition} tradition`;
    }
    
    const prompt = `Adopt the persona and theological style of ${randomTheologianName}. Provide a concise interpretation (around 75-100 words) of the specific biblical verse "${passageRef}". Focus on key theological insights characteristic of this theologian's general style of thought and their associated tradition when interpreting this verse.`;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
      });
      generatedInterpretations.push({
        id: `ai-${tradition.replace(/\s+/g, '-')}-${passageRef.replace(/[:\s]/g, '_')}-${Date.now()}`, 
        passage: passageRef,
        summary: response.text,
        theologianName: randomTheologianName, 
        theologianTradition: tradition,
      });
    } catch (error) {
      console.error(`Gemini API error fetching interpretation for ${tradition} (${randomTheologianName}) on ${passageRef}:`, error);
      // Fallback to sample interpretation if API fails
      const sampleForPassage = SAMPLE_INTERPRETATIONS.find(
        interp => interp.passage.toLowerCase() === passageRef.toLowerCase() && 
                  (interp.theologianTradition?.toLowerCase() === tradition.toLowerCase() || SAMPLE_THEOLOGIANS.find(t => t.id === interp.theologianId)?.tradition.toLowerCase() === tradition.toLowerCase())
      );
      if (sampleForPassage) {
        const theologian = SAMPLE_THEOLOGIANS.find(t => t.id === sampleForPassage.theologianId);
        generatedInterpretations.push({
            ...sampleForPassage,
            id: `sample-fallback-${sampleForPassage.id}-${Date.now()}`,
            summary: `(API Error Fallback) ${sampleForPassage.summary}`,
            theologianName: theologian?.name || 'Sample Theologian',
            theologianTradition: theologian?.tradition || tradition,
        });
      } else {
         generatedInterpretations.push({
            id: `ai-error-${tradition.replace(/\s+/g, '-')}-${passageRef.replace(/[:\s]/g, '_')}-${Date.now()}`,
            passage: passageRef,
            summary: `Could not fetch AI interpretation for ${randomTheologianName} (${tradition}) for ${passageRef}. This theologian might emphasize themes of [theme_A] and [theme_B].`,
            theologianName: randomTheologianName,
            theologianTradition: tradition,
        });
      }
    }
  }
  return generatedInterpretations;
};


export const getSynthesizedInterpretation = async (passageRef: string, traditions: string[]): Promise<string> => {
  if (!ai) {
    console.warn("GeminiService: AI not initialized, using sample synthesis.");
    return new Promise(resolve => {
      setTimeout(() => {
        const traditionString = traditions.length > 0 ? traditions.join(', ') : "various major historical perspectives";
        resolve(`Synthesis for ${passageRef} across ${traditionString}: This verse is generally understood to emphasize core theological themes such as [theme 1] and [theme 2]. Different traditions may highlight specific aspects such as divine sovereignty, human response, or the scope of salvation, but a common thread is the transformative power of the scriptural message when understood through these rich historical lenses.`);
      }, API_DELAY);
    });
  }

  const traditionPromptSegment = traditions.length > 0 
    ? `Draw from the key insights and historical theological emphases of the following Christian tradition(s): ${traditions.join(', ')}. Consider the core tenets of these traditions as they apply to the verse.`
    : "Provide a general overview considering major historical Christian perspectives.";

  const prompt = `Provide a comprehensive, integral interpretation of the specific biblical verse "${passageRef}". ${traditionPromptSegment} Focus on common agreements and key distinctives regarding this text from these perspectives. Keep the synthesis concise yet thorough, around 100-150 words.`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error during getSynthesizedInterpretation:", error);
    return `Error fetching synthesized interpretation from AI for ${passageRef}. Please check your API key and network connection. Using fallback response: The verse ${passageRef} speaks to core Christian beliefs, with nuances across traditions. Key themes often discussed include [theme_1] and [theme_2].`;
  }
};

export const getBibleChapterText = async (bookName: string, chapterNumber: number): Promise<string[]> => {
  const chapterRef = `${bookName} ${chapterNumber}`;
  if (!ai) {
    console.warn(`GeminiService: AI not initialized. Returning sample text for ${chapterRef}.`);
    const sampleVerses = SAMPLE_BIBLE_CHAPTER_VERSES[chapterRef];
    if (sampleVerses) {
      return Promise.resolve(sampleVerses);
    }
    return Promise.resolve([`AI Response: Verses for ${chapterRef} would be displayed here if AI were available.`]);
  }

  console.log(`GeminiService: Fetching Bible text for ${chapterRef} using AI.`);
  const prompt = `Please provide the full scripture text for ${bookName} chapter ${chapterNumber}. Each verse should be on a new line. Start each line *only* with the verse number followed by a space and then the verse text. Do not add any other prefix, explanation, or introductory/concluding remarks.
For example, for Genesis 1, the first few lines should be:
1 In the beginning God created the heavens and the earth.
2 Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.
3 And God said, "Let there be light," and there was light.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    const rawText = response.text.trim();
    const verses = rawText.split('\n').filter(line => line.trim() !== '').map(line => line.trim());
    if (verses.length === 0 || (verses.length === 1 && verses[0].toLowerCase().includes("i cannot fulfill this request"))) {
        throw new Error("AI could not provide chapter text or invalid format.");
    }
    return verses;
  } catch (error) {
    console.error(`Gemini API error fetching Bible text for ${chapterRef}:`, error);
    const sampleVerses = SAMPLE_BIBLE_CHAPTER_VERSES[chapterRef];
    if (sampleVerses) {
      console.warn(`Falling back to sample verses for ${chapterRef} due to AI error.`);
      return sampleVerses;
    }
    return [`Error fetching Bible text for ${chapterRef} from AI. (Sample fallback: Unable to retrieve ${chapterRef}.)`];
  }
};


export const getAICoachResponse = async (userMessage: string, chatHistory: ChatMessage[], userProfile?: UserProfile | null): Promise<ChatMessage> => {  
  if (!ai || !userProfile) { 
    console.warn("GeminiService: AI not initialized or user profile missing for coach. Using sample response.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(getCoachResponseSample(userMessage, userProfile?.name));
      }, API_DELAY / 2);
    });
  }
  console.log("GeminiService: Getting AI coach response using Gemini.");
  const historyForPrompt = chatHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`).join('\n');
  
  let systemInstruction = `You are GrowthPath, an intelligent and compassionate AI discipleship coach. Your primary purpose is to help users deepen their understanding of the Bible and grow spiritually. You are knowledgeable about Christian theology, various traditions, and biblical context.
User's name: ${userProfile.name || 'User'}.
User's stated spiritual goal: "${userProfile.spiritualGoal}".
User's self-assessed Bible knowledge: ${userProfile.bibleKnowledge}.
User's preferred Christian tradition (or exploration status): ${userProfile.preferredTradition}.

IMPORTANT:
1.  Memory and Context: Carefully review the provided Chat History. Remember previous interactions in this session. Refer to the user's goals, interests, and past discussion points to provide relevant and continuous guidance. If the user asks to 'continue' or refers to previous topics, use the chat history to understand the context fully.
2.  Personalization: Tailor your responses based on the user's profile information (goal, knowledge, tradition).
3.  Tone: Maintain an empathetic, insightful, and encouraging tone. Be respectful of all Christian traditions.
4.  Guidance: Offer relevant scripture passages, theological points, or reflective questions to guide the user.
5.  Response Style: ${userProfile.aiFeedbackLevel === 'Brief' ? "Keep your responses brief and to the point. Focus on clarity and conciseness." : "Provide detailed and comprehensive responses where appropriate, explaining concepts thoroughly but accessibly."}
6.  Suggestions: Offer 2-3 relevant follow-up questions or topics as suggestions to continue the conversation.
7.  Emotion Awareness: Be attentive to the user's emotional state, whether explicitly stated or implied in their messages (e.g., words like "stressed," "joyful," "confused," "grieving"). Adapt your responses to acknowledge and address these emotions with appropriate empathy, scripture, or prayerful encouragement. For example, if a user expresses anxiety, offer comforting passages or a short prayer for peace.
8.  Spiritual Counseling Model: When appropriate, guide the conversation in a way that models pastoral care best practices: listen actively (analyze their text), empathize, explore their concern with gentle questions, offer relevant biblical wisdom, and encourage prayer or reflection.

If the user asks about their journal or past activities (and this information isn't directly in the chat history), gently guide them to share specific details or reflections from their journal if they wish, or offer to discuss general themes related to journaling and spiritual disciplines.
`;


  const contents = `Chat History:\n${historyForPrompt}\n\nUser: ${userMessage}\nAI:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    let suggestions = ["Tell me more.", "What Bible passage relates?", "How does this apply to you?"];
        
    const textResponse = response.text.trim();
    // Attempt to parse suggestions if AI formats them explicitly
    // This is a simple example; robust parsing might need more advanced logic or structured output from AI
    if (textResponse.includes("Suggestions:")) {
        const suggestionPart = textResponse.split("Suggestions:")[1];
        if (suggestionPart) {
            suggestions = suggestionPart.split(/[\n,-]/) // Split by newline, comma, or hyphen
                                   .map(s => s.replace(/^\d+\.\s*/, '').trim()) // Remove numbering like "1. "
                                   .filter(s => s.length > 0 && s.length < 80);
            if (suggestions.length === 0) {
                suggestions = ["Explore further.", "Any other questions?"];
            }
        }
    }


    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: textResponse.split("Suggestions:")[0].trim(), // Remove suggestions part from main text if present
      timestamp: new Date(),
      suggestions: suggestions, 
    };

  } catch (error) {
    console.error("Gemini API error during getAICoachResponse:", error);
     return new Promise(resolve => { 
      setTimeout(() => {
        resolve(getCoachResponseSample(userMessage, userProfile?.name));
      }, API_DELAY / 2);
    });
  }
};


export const getQuickCoachResponse = async (userMessage: string, chatHistory: ChatMessage[], userProfile?: UserProfile | null): Promise<ChatMessage> => {
  if (!ai || !userProfile) {
    console.warn("GeminiService: AI not initialized or user profile missing for quick coach. Using sample response.");
    return new Promise(resolve => {
      setTimeout(() => {
        let text = `Hi ${userProfile?.name || 'User'}! You said: "${userMessage.substring(0, 30)}...". For a deeper chat, please use the full Coach page.`;
        if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
          text = `Hello ${userProfile?.name || 'User'}! Quick question? Or head to the full Coach for more.`;
        }
        resolve({
          id: `ai-quick-${Date.now()}`,
          sender: 'ai',
          text: text,
          timestamp: new Date(),
          suggestions: ["Tell me a verse.", "What's a good focus?"],
        });
      }, API_DELAY / 3);
    });
  }

  console.log("GeminiService: Getting quick AI coach response using Gemini.");
  const historyForPrompt = chatHistory.slice(-4).map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`).join('\n'); // Last 2 exchanges

  const systemInstruction = `You are GrowthPath's Quick Assistant, a concise AI helper.
User's name: ${userProfile.name || 'User'}.
User's spiritual goal: "${userProfile.spiritualGoal}".
Your role is to provide very brief spiritual insights, answer simple questions succinctly (1-2 sentences), or suggest a quick Bible verse.
If the query is complex or requires deeper discussion, politely suggest the user visit the main "AI Discipleship Coach" page.
Do not provide long explanations here. Offer 1-2 very short follow-up suggestions.`;

  const contents = `Recent Chat (if any):\n${historyForPrompt}\n\nUser: ${userMessage}\nAI:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: contents,
      config: { systemInstruction: systemInstruction }
    });

    let suggestions = ["Verse?", "Pray?"];
    const textResponse = response.text.trim();
    // Basic suggestion parsing similar to full coach
    if (textResponse.includes("Suggestions:")) {
        const suggestionPart = textResponse.split("Suggestions:")[1];
        if (suggestionPart) {
            suggestions = suggestionPart.split(/[\n,-]/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s.length > 0 && s.length < 40);
            if (suggestions.length === 0) suggestions = ["More?", "Help?"];
        }
    }

    return {
      id: `ai-quick-${Date.now()}`,
      sender: 'ai',
      text: textResponse.split("Suggestions:")[0].trim(),
      timestamp: new Date(),
      suggestions: suggestions.slice(0,2), // Max 2 short suggestions for widget
    };
  } catch (error) {
    console.error("Gemini API error during getQuickCoachResponse:", error);
    return {
      id: `ai-quick-error-${Date.now()}`,
      sender: 'ai',
      text: "Sorry, I couldn't process that quickly. Try the main Coach page?",
      timestamp: new Date(),
      suggestions: ["Try again", "Main Coach"],
    };
  }
};


interface PassageAnalysis {
  theme: string;
  keyVerse: string; 
  applicationPoint: string;
}

export const analyzePassageForJournal = async (passageText: string): Promise<PassageAnalysis | null> => {
  if (!ai) {
    console.warn("GeminiService: AI not initialized, using sample journal analysis.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          theme: "Sample Theme: God's Faithfulness (from " + passageText.substring(0,30) + "...)",
          keyVerse: "Sample Verse: Lamentations 3:22-23 (related to " + passageText.substring(0,20) + "...)",
          applicationPoint: "Sample Application: Trust in God's unwavering faithfulness daily, inspired by " + passageText.substring(0,20) + "..."
        });
      }, API_DELAY);
    });
  }
  console.log(`GeminiService: Analyzing passage for journal using AI: ${passageText}`);
  const prompt = `Analyze the following Bible passage or reference: "${passageText}". Identify its main theme, a key verse (specific verse like John 3:16 if applicable, or a representative verse from the chapter if a chapter is given) that encapsulates this theme, and a practical application point for personal reflection. Respond in JSON format with keys "theme", "keyVerse", and "applicationPoint".`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as PassageAnalysis;
    return parsedData;

  } catch (error) {
    console.error("Gemini API error or JSON parsing error during analyzePassageForJournal:", error);
    return { 
        theme: "Error Analyzing: Could not process " + passageText.substring(0,30) + "...",
        keyVerse: "N/A",
        applicationPoint: "Please try rephrasing your passage or check the AI connection."
    };
  }
};

export const getAISuggestionForActivity = async (
  activityType: ActivityType, 
  dayOfWeek: string, 
  userProfile?: UserProfile | null
): Promise<{ suggestion: string; passageRef?: string }> => {
  if (!ai) {
    console.warn("GeminiService: AI not initialized for activity suggestion. Using sample.");
    let passage = "John 15:5";
    if (activityType === "Prayer Time") passage = "Psalm 19:14";
    else if (activityType === "Journaling") passage = "Psalm 119:105";
    return Promise.resolve({
      suggestion: `AI Suggestion for ${activityType} on ${dayOfWeek}: Consider reflecting on the theme of '${userProfile?.spiritualGoal || 'spiritual growth'}' through ${passage}.`,
      passageRef: passage,
    });
  }

  console.log(`GeminiService: Getting AI suggestion for ${activityType} on ${dayOfWeek}.`);
  
  let prompt = `You are an AI Discipleship Coach. For a user planning their week:
Activity Type: ${activityType}
Day of Week: ${dayOfWeek}
User's spiritual goal: "${userProfile?.spiritualGoal || 'general spiritual growth'}"
User's Bible knowledge: ${userProfile?.bibleKnowledge || 'any level'}
User's preferred tradition: ${userProfile?.preferredTradition || 'any Christian tradition'}

Suggest a concise focus, theme, or specific Bible passage for this activity. 
If suggesting a passage, provide the reference (e.g., "John 3:16-18").
The overall suggestion should be brief and actionable.

Example for Bible Study: "Focus on the Parable of the Sower in Matthew 13. Consider what the different types of soil represent in your life." (Passage: Matthew 13:1-23)
Example for Prayer Time: "Pray through Psalm 23, focusing on God as your Shepherd and provider." (Passage: Psalm 23)
Example for Journaling: "Reflect on a moment this week where you felt God's presence. What did you learn?" (Passage: Optional, or suggest one like James 1:17)

Provide your suggestion as a JSON object with two keys: "suggestion" (string, the main descriptive suggestion) and "passageRef" (string, optional Bible passage like "Book C:V-V").
Ensure the response is ONLY the JSON object.`;


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); 
    }

    const parsedData = JSON.parse(jsonStr) as { suggestion: string; passageRef?: string };
    return parsedData;

  } catch (error) {
    console.error(`Gemini API error or JSON parsing error for getAISuggestionForActivity:`, error);
    return { 
      suggestion: `Error getting AI suggestion. Consider focusing on a topic like 'gratitude' for your ${activityType} on ${dayOfWeek}.`,
      passageRef: "1 Thessalonians 5:18"
    };
  }
};

export const summarizeJournalEntries = async (entries: JournalEntry[]): Promise<string> => {
  if (entries.length === 0) {
    return "No entries to summarize.";
  }
  if (!ai) {
    console.warn("GeminiService: AI not initialized for journal summary. Using sample.");
    return Promise.resolve(`Sample AI Summary: Based on your recent ${entries.length} entries, common themes appear to be [theme 1] and [feeling 2]. You've also reflected on [topic A]. Keep exploring these areas!`);
  }

  console.log(`GeminiService: Summarizing ${entries.length} journal entries.`);
  const entriesText = entries.map(entry => `Entry on ${entry.timestamp.toLocaleDateString()} titled "${entry.title}" (Tags: ${entry.tags?.join(', ') || 'none'}):\n${entry.text}\n---`).join('\n\n');
  
  const prompt = `Based on the following journal entries, provide a concise summary (2-3 paragraphs). Identify key recurring themes, emotions, spiritual questions, or insights. Offer a gentle reflection or encouragement based on these observations. Do not list the entries, just provide the summary.\n\nJournal Entries:\n${entriesText}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error during summarizeJournalEntries:", error);
    return "Error generating journal summary from AI. Please check your connection or try again later. (Fallback: Your recent entries show a pattern of reflection and seeking.)";
  }
};

export const getContextualizedScripture = async (passageRef: string, lifeSituation: string): Promise<string> => {
  if (!ai) {
    console.warn("GeminiService: AI not initialized for contextualized scripture. Using sample.");
    return Promise.resolve(`Sample AI Response: If ${passageRef} speaks of hope, and you're feeling 'burnout', it might be rephrased as: "Even in times of deep weariness and burnout, remember the divine promise of rest and renewal found in the scriptures. Hold onto the enduring hope that your strength will be restored."`);
  }
  
  console.log(`GeminiService: Getting contextualized scripture for ${passageRef} regarding "${lifeSituation}".`);
  const prompt = `Take the core message or a key verse from the Bible passage "${passageRef}". Rephrase or explain this message in 1-2 concise paragraphs as if you are speaking directly to someone currently experiencing "${lifeSituation}". The aim is to make the scripture's wisdom immediately relevant and applicable to their specific struggle or context. Do not quote the original passage extensively; instead, transform its essence into a direct, empathetic, and encouraging word for their situation.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error during getContextualizedScripture:", error);
    return `Error contextualizing scripture from AI. Please check connection or try again. (Fallback: The message of ${passageRef} can bring comfort to those facing "${lifeSituation}" by reminding them of [relevant virtue/promise].)`;
  }
};

export const generatePersonalizedPrayer = async (
  userSituation: string,
  userProfile?: UserProfile | null
): Promise<string> => {
  if (!ai) {
    console.warn("GeminiService: AI not initialized for personalized prayer. Using sample.");
    return Promise.resolve(
      `Sample AI Prayer for "${userSituation.substring(0, 50)}...":\nDear God, be with this person as they navigate this situation. Grant them strength, wisdom, and peace. May they feel Your constant presence and loving care. Amen.`
    );
  }

  let promptContent = `The user is seeking a prayer related to the following situation, need, or feeling: "${userSituation}".\n`;
  if (userProfile) {
    promptContent += `\nFor context, this user's spiritual goal is: "${userProfile.spiritualGoal}". `;
    if (userProfile.bibleKnowledge) {
      promptContent += `Their self-assessed Bible knowledge is: ${userProfile.bibleKnowledge}. `;
    }
    if (userProfile.preferredTradition) {
      promptContent += `They identify with or are exploring the ${userProfile.preferredTradition} tradition.\n`;
    }
  }
  promptContent += `\nPlease craft a heartfelt, biblically-grounded, and sensitive prayer of approximately 50-100 words. The prayer should be suitable for personal use and reflect an empathetic understanding of the user's input. The tone should be comforting and encouraging. Do not add any introductory or concluding remarks, just the prayer text itself.`;

  console.log(`GeminiService: Generating personalized prayer for situation: ${userSituation}`);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: promptContent,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error during generatePersonalizedPrayer:", error);
    return `Error generating prayer from AI. (Fallback: Lord, hear our prayer for guidance and peace concerning "${userSituation.substring(0,30)}...".)`;
  }
};

interface ScripturalWisdom {
  title: string;
  content: string;
  passageRef?: string;
}

export const getScripturalWisdomForSituation = async (
  situation: string,
  userProfile?: UserProfile | null
): Promise<ScripturalWisdom> => {
  if (!ai) {
    console.warn("GeminiService: AI not initialized for scriptural wisdom. Using sample.");
    return Promise.resolve({
      title: "Sample Wisdom: Finding Strength",
      content: `In times of "${situation.substring(0,30)}...", remember that scripture offers profound comfort. For instance, passages like Psalm 46:1 can be a source of solace, reminding us that God is our refuge. Reflect on how this truth can support you today.`,
      passageRef: "Psalm 46:1 (example)"
    });
  }

  let prompt = `You are an empathetic AI spiritual guide. A user is facing the following situation: "${situation}".
Their spiritual goal is: "${userProfile?.spiritualGoal || 'general spiritual growth'}".
Their Bible knowledge is: "${userProfile?.bibleKnowledge || 'any level'}".
Their preferred tradition is: "${userProfile?.preferredTradition || 'any Christian tradition'}".

Based on their situation and Christian spiritual principles, provide:
1.  A concise, encouraging title for this guidance (e.g., 'Finding Peace in Uncertainty', 'Scripture for Strength when Feeling Overwhelmed').
2.  A relevant Bible passage reference (e.g., Philippians 4:6-7) if one is clearly applicable and specific. If multiple could apply, choose one that is broadly encouraging or foundational for the situation.
3.  A short (2-4 sentences) scriptural reflection or explanation of how biblical wisdom applies directly to their situation. This should be encouraging and practical.

Respond ONLY in JSON format with keys: "title" (string), "passageRef" (string, optional, provide only if a specific verse/short passage is highly relevant), "content" (string, the reflection).
Example JSON: {"title": "Hope in Difficult Times", "passageRef": "Romans 15:13", "content": "When you feel [user's emotion/situation], remember that God is the source of all hope. Romans 15:13 encourages us that through the power of the Spirit, we can overflow with hope. Lean into His presence for comfort and strength."}
Another Example (no specific passage): {"title": "God's Presence in Your Struggle", "content": "Even when things feel [user's emotion/situation], know that God's presence is a constant. Many scriptures affirm His nearness. Take a moment to invite His peace into your heart and seek His wisdom through prayer."}
`;

  console.log(`GeminiService: Getting scriptural wisdom for situation: ${situation}`);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as ScripturalWisdom;
    return parsedData;

  } catch (error) {
    console.error("Gemini API error or JSON parsing error during getScripturalWisdomForSituation:", error);
    return {
      title: "Guidance Unavailable",
      content: `Could not retrieve specific scriptural wisdom for "${situation.substring(0,30)}..." at this moment. Please try again or rephrase your situation. Remember, general biblical principles of God's love, faithfulness, and peace always apply.`,
    };
  }
};


export interface AISuggestedGroup {
  groupId: string;
  reason: string;
}

export const getSuggestedGroupsForUser = async (
  userProfile: UserProfile | null,
  allGroups: CommunityGroup[],
  count: number = 3
): Promise<AISuggestedGroup[]> => {
  if (!ai || !userProfile) {
    console.warn("GeminiService: AI not initialized or user profile missing for group suggestions. Using samples.");
    // Return a few sample suggestions
    const sampleSuggestions: AISuggestedGroup[] = [];
    const availableSampleGroups = SAMPLE_COMMUNITY_GROUPS.slice(0, count);
    for (const group of availableSampleGroups) {
        sampleSuggestions.push({
            groupId: group.id,
            reason: `This group, "${group.name}", focusing on ${group.focusArea}, seems like a good sample match for your interests.`
        });
    }
    return Promise.resolve(sampleSuggestions);
  }

  console.log(`GeminiService: Getting ${count} suggested groups for user ${userProfile.name}.`);

  const groupsInfoString = allGroups.map(g => 
    `- ID: ${g.id}, Name: "${g.name}", Focus: "${g.focusArea}", Description: "${g.description}"`
  ).join('\n');

  const prompt = `You are an AI community matchmaker for the GrowthPath Christian spiritual growth app.
User Profile:
  Name: ${userProfile.name || 'Anonymous User'}
  Spiritual Goal: "${userProfile.spiritualGoal || 'Not specified'}"
  Spiritual Interests: "${userProfile.spiritualInterests || 'Not specified'}"
  Preferred Tradition: "${userProfile.preferredTradition || 'Not specified'}"

Available Community Groups:
${groupsInfoString}

Based on the user's profile and the available groups, suggest up to ${count} groups that would be a particularly good fit. For each suggested group, provide its ID and a brief (1-2 sentences) personalized reason why it's a good match for this user.

Respond ONLY in JSON format as an array of objects. Each object must have two keys: "groupId" (string, corresponding to one of the provided group IDs) and "reason" (string, your personalized reason).
Example: [{"groupId": "cg1", "reason": "Given your interest in theology, the 'Theology Deep Dive' group could offer stimulating discussions."}, {"groupId": "cg2", "reason": "As you are exploring your prayer life, the 'Prayer Warriors' group might provide excellent support."}]
If no groups seem like a strong match, return an empty array. Do not suggest groups not in the provided list.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as AISuggestedGroup[];
    // Validate that returned groupIds actually exist in allGroups
    return parsedData.filter(suggestion => allGroups.some(group => group.id === suggestion.groupId));

  } catch (error) {
    console.error("Gemini API error or JSON parsing error during getSuggestedGroupsForUser:", error);
    // Fallback sample
    const sampleSuggestions: AISuggestedGroup[] = [];
    const availableSampleGroups = SAMPLE_COMMUNITY_GROUPS.slice(0, Math.min(count, SAMPLE_COMMUNITY_GROUPS.length));
    for (const group of availableSampleGroups) {
        sampleSuggestions.push({
            groupId: group.id,
            reason: `Error fetching suggestions. Sample: "${group.name}" could be interesting.`
        });
    }
    return sampleSuggestions;
  }
};

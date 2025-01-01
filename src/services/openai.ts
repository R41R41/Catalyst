import OpenAI from "openai";
import { Prompt } from "./promptApi";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ローカル開発用
});

export const getCompletion = async (
  prompt: string,
  systemPrompts: Prompt[]
) => {
  try {
    // システムプロンプトを結合
    const systemContent = systemPrompts
      .map((prompt) => prompt.content)
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o-mini",
      max_tokens: 100,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export default openai;

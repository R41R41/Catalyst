import OpenAI from "openai";
import { Prompt } from "./promptApi";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { FileData } from "../types/File";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ローカル開発用
});

export const getCompletion = async (
  prompt: string,
  systemPrompts: Prompt[],
  relatedContents: string[]
) => {
  try {
    // システムプロンプトを結合
    const systemContent = systemPrompts
      .map((prompt) => prompt.content)
      .join("\n\n");

    // 関連コンテンツを含めたメッセージを作成
    const messages = [
      {
        role: "system",
        content: systemContent,
      },
      // 関連コンテンツを追加
      ...relatedContents.map((content) => ({
        role: "system" as const,
        content: `関連コンテンツ:\n${content}`,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    const completion = await openai.chat.completions.create({
      messages: messages as ChatCompletionMessageParam[],
      model: "gpt-4-turbo-preview",
      max_tokens: 100,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const getEmbedding = async (text: string) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    return null;
  }
};

const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (norm1 * norm2);
};

export const findRelatedContents = async (
  currentContent: string,
  allFiles: FileData[]
): Promise<string[]> => {
  const currentEmbedding = await getEmbedding(currentContent);
  if (!currentEmbedding) return [];

  const similarities = await Promise.all(
    allFiles
      .filter((file) => file.content !== currentContent)
      .map(async (file) => {
        const embedding = await getEmbedding(file.content);
        if (!embedding) return { content: file.content, similarity: 0 };
        return {
          content: file.content,
          similarity: cosineSimilarity(currentEmbedding, embedding),
        };
      })
  );

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map((item) => item.content);
};

export default openai;

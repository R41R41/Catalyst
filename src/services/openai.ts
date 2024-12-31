import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ローカル開発用
});

export const getCompletion = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `以下の続きを予測して出力してください: ${prompt}`,
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

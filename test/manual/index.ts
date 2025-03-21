import { Agentica } from "@agentica/core";
import dotenv from "dotenv";
import OpenAI from "openai";
import * as readline from "readline";
import typia from "typia";
import { AgenticaOpenAIVectorStoreSelector } from "../../src/OpenAIVectorStore";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

// 문장을 입력받는 부분
const askQuestion = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function main() {
  const assistant_id = `asst_G2mAY8kXNuXRtJXV7KFG7SW0` as const; // TEST_NAME_3
  const vector_store_id = "vs_67c99c5df9e081919bdf9042d2d107c8" as const;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  const selector = new AgenticaOpenAIVectorStoreSelector({
    provider: {
      api: openai,
      assistant: { name: "agentica", model: "gpt-4o-mini" },
      vectorStore: { name: "vectorStore" },
    },
  });

  const agent = new Agentica({
    model: "chatgpt",
    vendor: {
      api: openai,
      model: "gpt-4o-mini",
    },
    controllers: [
      {
        protocol: "class",
        name: "Korean language department vector DB",
        application: typia.llm.application<AgenticaOpenAIVectorStoreSelector, "chatgpt">(),
        execute: selector,
      },
    ],
    config: {
      systemPrompt: {
        initialize: () =>
          [
            "You are a helpful assistant.",
            "",
            "Use the supplied tools to assist the user.",
            "The user will ask questions about the Korean language department,",
            "and Assistant has a vector store with Korean language department files as a tool.",
          ].join("\n"),
      },
    },
  });

  let input = "";
  while (true) {
    input = await askQuestion("문장을 입력하세요 (줄바꿈은 Shift+Enter로 가능, 종료하려면 Ctrl+C): ");
    const inputBuffer = input + "\n"; // 줄바꿈과 함께 입력 내용 누적
    // LLM 답변
    const histories = await agent.conversate(inputBuffer);
    histories.forEach((history) => {
      console.log(history.toJSON());
    });
  }
}

main().catch(console.error);

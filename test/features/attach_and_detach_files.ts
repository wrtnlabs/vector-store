import { equal } from "node:assert";
import OpenAI from "openai";
import { AgenticaOpenAIVectorStoreSelector } from "../../src/OpenAIVectorStore";

export async function attach_and_detach_files() {
  const assistant_id = `asst_G2mAY8kXNuXRtJXV7KFG7SW0` as const; // TEST_NAME_3
  const vector_store_id = "vs_67c99c5df9e081919bdf9042d2d107c8" as const;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
  const selector = new AgenticaOpenAIVectorStoreSelector({
    provider: {
      api: openai,
      assistant: {
        id: assistant_id,
      },
      vectorStore: {
        id: vector_store_id,
      },
    },
  });

  const name = "filename.pdf";
  const afterAttach = await selector.attach({
    files: [
      {
        name: name,
        data: `https://studio-api-bucket.s3.ap-northeast-2.amazonaws.com/rag-test-2.pdf`,
      },
    ],
  });

  const afterDetach = await selector.detach({
    filename: name,
  });

  equal(afterAttach.total, afterDetach.total + 1);
}

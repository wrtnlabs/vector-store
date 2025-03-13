import { equal } from "node:assert";
import OpenAI from "openai";
import { AgenticaOpenAIVectorStoreSelector } from "../../src/OpenAIVectorStore";

const url = `https://studio-api-bucket.s3.ap-northeast-2.amazonaws.com/rag-test-2.pdf`;

export async function test_detach_all_files(openai: OpenAI) {
  const assistant_id = `asst_G2mAY8kXNuXRtJXV7KFG7SW0` as const; // TEST_NAME_3
  const vector_store_id = "vs_67d26de269a08191ae7cbef82da096ff" as const;
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

  const files = await selector.list();

  for await (const file of files) {
    await selector.detach({
      file: {
        fileId: file.id,
      },
    });
  }

  equal((await selector.list()).length, 0, "Failed to detach all files.");
}

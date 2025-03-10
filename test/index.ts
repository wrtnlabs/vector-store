import dotenv from "dotenv";
import OpenAI from "openai";
import { AgenticaOpenAIVectorStoreSelector } from "../src/OpenAIVectorStore";

dotenv.config();

const TEST_NAME = "TEST_NAME" as const;
const assistant_id = "asst_OOAkIiD1l2C2UmPjJkPtqUr1" as const;
const vector_store_id = "vs_67c99c5df9e081919bdf9042d2d107c8" as const;

async function test_create_vector_store_and_query_messages() {
  const selector = new AgenticaOpenAIVectorStoreSelector({
    provider: {
      api: new OpenAI({ apiKey: process.env.OPENAI_KEY }),
      assistant: {
        id: assistant_id,
      },
      vectorStore: {
        id: vector_store_id,
      },
    },
  });

  const fileCount = await selector.attach({
    files: [
      {
        name: "Interactive effects of microplastic pollution and heat stress on reef-building corals.pdf",
        data: "https://studio-api-bucket.s3.ap-northeast-2.amazonaws.com/rag-test-2.pdf",
      },
    ],
  });

  const { response } = await selector.query({ query: "Conclusions" });
}

test_create_vector_store_and_query_messages();

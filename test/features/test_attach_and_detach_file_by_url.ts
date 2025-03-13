import { equal } from "node:assert";
import OpenAI from "openai";
import { AgenticaOpenAIVectorStoreSelector } from "../../src/OpenAIVectorStore";

export async function test_attach_and_detach_file_by_url(openai: OpenAI) {
  const assistant_id = `asst_G2mAY8kXNuXRtJXV7KFG7SW0` as const; // TEST_NAME_3
  const vector_store_id = "vs_67c99c5df9e081919bdf9042d2d107c8" as const;
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

  // 테스트할 파일의 이름을 지정
  const name = "filename.pdf";

  // 이전과 비교하여 파일 추가 후 length가 1이 증가하였는지를 검사
  const beforeAttach = await selector.list();
  await selector.attach({
    files: [{ name: name, data: `https://studio-api-bucket.s3.ap-northeast-2.amazonaws.com/rag-test-2.pdf` }],
  });
  const afterAttach = await selector.list();
  equal(beforeAttach.length + 1, afterAttach.length, "Failed to attach.");

  // 이전과 비교하여, 파일 해제 후 length가 1이 감소하였는지를 검사
  const beforeDetach = await selector.list();
  await selector.detach({ filename: name });
  const afterDetach = await selector.list();
  equal(beforeDetach.length - 1, afterDetach.length, "Failed to detach.");
}

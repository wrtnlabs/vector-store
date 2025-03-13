import { equal } from "node:assert";
import OpenAI from "openai";
import { AgenticaOpenAIVectorStoreSelector } from "../../src/OpenAIVectorStore";

const url = `https://studio-api-bucket.s3.ap-northeast-2.amazonaws.com/rag-test-2.pdf`;

export async function test_attach_same_filename(openai: OpenAI) {
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
  const name = `same_file.pdf` as const;

  // 파일을 추가
  await selector.attach({
    files: [
      {
        type: "URL_FORMAT",
        name: name,
        data: url,
      },
    ],
  });

  // 똑같은 파일을 추가하여 이전과 비교하여 파일 추가 후 length가 동일한지를 검증
  const beforeAttach = await selector.list();
  await selector.attach({
    files: [
      {
        type: "URL_FORMAT",
        name: name,
        data: url,
      },
    ],
  });
  const afterAttach = await selector.list();
  equal(beforeAttach.length, afterAttach.length, "same filename have to be ignored.");

  // 테스트 종료 후 파일 제거
  await selector.detach({
    file: {
      filename: name,
    },
  });
}

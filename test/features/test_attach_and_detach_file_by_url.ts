import { equal } from "node:assert";
import { randomUUID } from "node:crypto";
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
      fileId: file.id,
    });
  }

  equal((await selector.list()).length, 0, "Failed to detach all files.");
}

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
  const name = `${randomUUID()}.pdf` as const;

  // 해당 파일의 주소로 요청을 할 때 랜덤으로 생성한 특정 파일이 나오도록 함수를 수정
  // const testFile = await typia.random<File>().arrayBuffer();
  // selector["getFile"] = async (fileUrl: string & tags.Format<"iri">): Promise<ArrayBuffer> => {
  //   return testFile;
  // };

  // 테스트 전 이미 등록된 게 있는지 체크하여 벡터스토어에 등록된 파일들을 해제
  const hash = await selector["getChecksum"](url);
  await selector.detach({ hash });

  // 이전과 비교하여 파일 추가 후 length가 1이 증가하였는지를 검사
  const beforeAttach = await selector.list();
  await selector.attach({
    files: [{ name: name, data: url }],
  });
  const afterAttach = await selector.list();
  equal(beforeAttach.length + 1, afterAttach.length, "Failed to attach.");

  // 이전과 비교하여, 파일 해제 후 length가 1이 감소하였는지를 검사
  const beforeDetach = await selector.list();
  await selector.detach({ filename: name });
  const afterDetach = await selector.list();

  equal(beforeDetach.length - 1, afterDetach.length, "Failed to detach.");
}

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
    files: [{ name: name, data: url }],
  });

  // 똑같은 파일을 추가하여 이전과 비교하여 파일 추가 후 length가 동일한지를 검증
  const beforeAttach = await selector.list();
  await selector.attach({
    files: [{ name: name, data: url }],
  });
  const afterAttach = await selector.list();
  equal(beforeAttach.length, afterAttach.length, "same filename have to be ignored.");

  // 테스트 종료 후 파일 제거
  await selector.detach({
    filename: name,
  });
}

import OpenAI from "openai";
import { IProvider } from "../types/IProvider";

async function emplaceVectorStore(
  provider: Pick<IProvider, "api" | "vectorStore">
): Promise<OpenAI.Beta.VectorStores.VectorStore> {
  const openai = provider.api;
  const vectorStore = provider.vectorStore;

  if ("name" in vectorStore) {
    return await openai.beta.vectorStores.create({
      name: vectorStore.name,
      chunking_strategy: vectorStore.chunking_strategy ?? {
        type: "static",
        static: { max_chunk_size_tokens: 800, chunk_overlap_tokens: 400 },
      },
    });
  } else {
    let after: string | null = null;
    do {
      const fetched: Awaited<ReturnType<typeof openai.beta.vectorStores.list>> = await openai.beta.vectorStores.list({
        ...(typeof after === "string" && { after }),
      });

      after = fetched.nextPageParams()?.after ?? null;
      const created = fetched.data.find((item) => item.id === vectorStore.id);
      if (created) {
        return created;
      }
    } while (after);
  }

  throw new Error("Failed to init vectorStore with openai.");
}

export async function emplaceAssistant(
  provider: Pick<IProvider, "api" | "assistant">
): Promise<OpenAI.Beta.Assistants.Assistant> {
  const openai = provider.api;
  const assistant = provider.assistant;

  if ("id" in assistant) {
    return openai.beta.assistants.retrieve(assistant.id);
  } else {
    return openai.beta.assistants.create(assistant);
  }
}

export async function init(
  provider: IProvider
): Promise<{ vectorStore: OpenAI.Beta.VectorStores.VectorStore; assistant: OpenAI.Beta.Assistants.Assistant }> {
  const openai = provider.api;

  const vectorStore = await emplaceVectorStore(provider);
  const assistant = await emplaceAssistant(provider);
  return { vectorStore, assistant };
}

// export async function attach(provider: IProvider) {
//   const openai = provider.api;
//   const vectorStore = provider.vectorStore;

//   openai.beta.vectorStores.fileBatches.createAndPoll({})
// }

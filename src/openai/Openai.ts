import OpenAI from "openai";
import { IProvider } from "../types/IProvider";

// export async function init(provider: IProvider): Promise<OpenAI.Beta.VectorStores.VectorStore> {
//   const openai = provider.api;
//   if (this._vectorStore !== null) {
//     return this._vectorStore;
//   }

//   const vectorStore = provider.vectorStore;
//   if ("name" in vectorStore) {
//     this._vectorStore = await openai.beta.vectorStores.create({
//       name: vectorStore.name,
//       chunking_strategy: vectorStore.chunking_strategy ?? {
//         type: "static",
//         static: { max_chunk_size_tokens: 800, chunk_overlap_tokens: 400 },
//       },
//     });
//   } else {
//     let after: string | null = null;
//     do {
//       const fetched = await openai.beta.vectorStores.list({});
//       after = fetched.nextPageParams()?.after ?? null;
//       const created = fetched.data.find((vectorStore) => vectorStore.id === vectorStore.id);
//       if (created) {
//         return created;
//       }
//     } while (this._vectorStore === null && after);
//   }

//   return this._vectorStore!;
// }

export async function init(provider: IProvider): Promise<OpenAI.Beta.VectorStores.VectorStore> {
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
      const fetched = await openai.beta.vectorStores.list({});
      after = fetched.nextPageParams()?.after ?? null;
      const created = fetched.data.find((vectorStore) => vectorStore.id === vectorStore.id);
      if (created) {
        return created;
      }
    } while (after);
  }

  throw new Error("Failed to init vectorStore with openai.");
}

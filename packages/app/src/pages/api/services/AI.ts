import { CharacterTextSplitter , RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

export default class AIServices {
  private embeddings = new OpenAIEmbeddings();

  private splitTextIntoChunks(
    text: string,
    chunkSize: number,
    chunkOverlap: number
  ) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async retrieveWebPageEmbeddings(text: string, metadata: object[]) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 1,
    });
    const tokens = await splitter.splitText(text as any);
    const vectorstores = await MemoryVectorStore.fromTexts(
      tokens,
      metadata,
      this.embeddings
    );

    return vectorstores.memoryVectors;
  }


  async similaritySearch(text: string, search: string, metadata: object[]) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 1,
    });
    const tokens = await splitter.splitText(text as any);

    console.log(tokens.length, search)

    const vectorstores = await MemoryVectorStore.fromTexts(
      tokens,
      metadata,
      this.embeddings
    );
    const resultOne = vectorstores.similaritySearch(search, 5);
    return resultOne;
  }

  async getEmbeddings(text: string, metadata: object[]) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 1,
    });
    const tokens = await splitter.splitText(text as any);

    // MemoryVectorStore.fromExistingIndex();
    const vectorstores = await MemoryVectorStore.fromTexts(
      tokens,
      metadata,
      this.embeddings
    );

    console.log(vectorstores);

    // const resultOne = await vectorstores.("who is Benaiah?", 5);
    // console.log(resultOne);

    // await vectorstores.save("./");
    // return embeddings;
  }
}

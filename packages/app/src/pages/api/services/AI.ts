import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";

export default class AIServices {
  private splitter = new CharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });
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

  async getEmbeddings(text: string, metadata: object[]) {
    // const tokens = await this.splitter.splitText(text as any);
    const tokens = this.splitTextIntoChunks(text, 400, 50);

    console.log(tokens.length);

    // init embedding instance
    this.embeddings;

    const vectorstores = await FaissStore.fromTexts(
      tokens,
      metadata,
      this.embeddings
    );

    const resultOne = await vectorstores.similaritySearch("UserDesk", 5);
    console.log(resultOne);

    // await vectorstores.save("./");
    // return embeddings;
  }
}

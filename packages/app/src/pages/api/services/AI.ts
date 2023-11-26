import {
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  ChatPromptTemplate,
} from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain } from "langchain/chains";


const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });

function oneLine(text: string){
  return text.replace(/\n/g, " ");
}


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

  async retrieveEmbeddings(text: string, metadata: object[] | object) {
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

  async _webChatComplition(humanMsg: string, assistantMsg: string) {
    const resp = await model.invoke([
      ["human", humanMsg],
      ["assistant", assistantMsg],
    ]);

    return resp?.content;
  }

  async createPromptTemplate(
    query: string,
    agentName: string,
    contextText: string,
    chatName: string,
    prevConversations: { sender_type: "HUMAN" | "ADMIN" | "AI"; message: string }[]
  ) {

    // construct chat history template using prevConversations
    const chatHistoryTemplate = prevConversations.map((conv) => {
      return `
      ${conv.sender_type}: ${conv.message}
      `;
    }).join("\n");

    const systemTemplate = `
    You are a customer service agent named {agentName} representative who loves
    to help people!

    Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

    You must provide accurate, relevant, and helpful information only pertaining to provided context domain. You must respond in Simple, Concise and Short language term.

    When user asked the creator of SwissAI only not {agentName} or {chatName}:
      If a user inquires only about the creator of SwissAI, respond with: The creator of SwissAI is Benaiah Alumona, a software engineer, his github and twitter profile is https://github.com/benrobo and https://twitter.com/benaiah_al. You can as well tell them you are currently serving as a {chatName} representative. 

    All reply or output must be rendered in markdown format!.

    Additionally, you must only answer and communicate in English language, regardless of the language used by the user.

    When trying to insert the agent name, make sure it comes out in bold or extrabold format using markdown.

    """Context""": """{contextText}"""

    """Chat History""": """{chatHistoryTemplate}"""

    A chat history is provided to you, you must use it to answer the question at the end if applicable. If it is not applicable or it empty, you can ignore it.

    If a user asks a question or initiates a discussion that is not directly related to the domain or context provided, do not provide an answer or engage in the conversation. Instead, politely redirect their focus back to the domain and its related content.
    
    Use newline to format the message properly for those who struggle to read long text.

    Answer as markdown (including related code snippets if available), This is a must!!!. All answers must be properly formatted in markdown format.
    :
    `;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["human", query],
    ]);

    // Format the messages
    const formattedChatPrompt = await chatPrompt.formatMessages({
      agentName,
      chatName,
      contextText,
      chatHistoryTemplate,
    });

    return formattedChatPrompt;
  }
}

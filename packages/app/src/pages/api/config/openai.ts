import { OpenAI } from "langchain/llms/openai";

const model = new OpenAI({
  temperature: 0.9,
  openAIApiKey: process.env.OPENAI_API_KEY
});


export default model;

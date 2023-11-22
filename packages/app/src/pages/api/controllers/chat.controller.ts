import { NextApiRequest, NextApiResponse } from "next";
import HttpException from "../exception";
import zodValidation from "../utils/zodValidator";
import { chatConversationSchema, createChatSchema } from "../utils/validation";
import { RESPONSE_CODE } from "@/types";
import redisClient from "../config/redis";
import { extractLinksFromWebPages } from "../utils";
import AIServices from "../services/AI";
import prisma from "../config/prisma";
import shortUUID from "short-uuid";
import sendResponse from "../utils/sendResponse";

const aiServices = new AIServices();

type CreateChatPayload = {
  name: string;
  agent_name: string;
  fildered_links: string[];
  webpage_url: string;
  type: "webpage" | "file";
};

type ConversationPayload = {
  message: string;
  chatId: string;
  anonymous_id: string;
  sender_type: "ANONYMOUS" | "AI" | "ADMIN";
};

type SimilaritiesResult = {
  match_embeddings: {
    id: string;
    content: string[];
    metadata: {
      url: string | null;
      content: string | null;
    };
    similarity: number;
  };
};

export default class ChatController {
  async createChat(req: NextApiRequest, res: NextApiResponse) {
    const userId = (req as any).user?.id;
    const payload: CreateChatPayload = req.body;
    const _isValidated = zodValidation(createChatSchema, req, res);

    if (!_isValidated) {
      throw new HttpException(
        "Invalid payload",
        RESPONSE_CODE.VALIDATION_ERROR,
        400
      );
    }

    const { agent_name, type, fildered_links, name, webpage_url } = payload;

    // check if chat with same name exists
    const chat = await prisma.chats.findFirst({
      where: {
        name,
      },
    });

    if (chat) {
      throw new HttpException(
        "Chat with same name already exists",
        RESPONSE_CODE.VALIDATION_ERROR,
        400
      );
    }

    if (type === "webpage") {
      // check if cache data exists
      let links: { url: string; content: string }[] | any[] = [];
      const urlInfo = await redisClient.get(webpage_url);
      if (urlInfo) {
        links = urlInfo as any;
      } else {
        const extractedLinks = await extractLinksFromWebPages(webpage_url);
        links = extractedLinks.links;

        // cache data
        await redisClient.set(
          webpage_url,
          JSON.stringify(extractedLinks.links)
        );
        await redisClient.expire(webpage_url, 60 * 60); // expire in 1hr minutes
      }

      // merge content of all links
      let content = "";
      for (const link of links) {
        content += link.content;
      }

      // retrieve webpage embeddings
      const embeddings = await aiServices.retrieveEmbeddings(content, links);

      if (embeddings.length > 0) {
        // create chat first
        const chat = await prisma.chats.create({
          data: {
            id: shortUUID.generate(),
            name,
            agent_name,
            user: {
              connect: { id: userId },
            },
          },
        });

        // create embedding
        const chatId = chat.id;

        for (const data of embeddings) {
          const datasource_id = shortUUID.generate();
          const { content, embedding, metadata } = data;
          // use rawsql query
          await prisma.$executeRaw`INSERT INTO public."Datasource" (id, type, "chatId", content, embedding) VALUES (${datasource_id},${type},${chatId},${content}, ${embedding})`;

          // create datasourceMetaData
          await prisma.datasourceMetaData.create({
            data: {
              id: shortUUID.generate(),
              data_source_id: datasource_id,
              metadata: JSON.stringify({
                url: metadata.url ?? null,
                content: null,
              }),
            },
          });
        }

        return sendResponse.success(
          res,
          RESPONSE_CODE.SUCCESS,
          "Chat created successfully",
          200,
          null
        );
      } else {
        console.log(`[ERROR] No embeddings found for ${webpage_url}`);
        throw new HttpException(
          "Something went wrong. Please try again later",
          RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          400
        );
      }
    }
  }

  async getChats(req: NextApiRequest, res: NextApiResponse) {
    const userId = (req as any).user?.id;

    const chats = await prisma.chats.findMany({
      where: {
        user: { id: userId },
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Chats retrieved successfully",
      200,
      chats
    );
  }

  async deleteChat(req: NextApiRequest, res: NextApiResponse) {
    const userId = (req as any).user?.id;
    const { chat_id } = req.query;

    const chat = await prisma.chats.findFirst({
      where: {
        id: chat_id as string,
        user: { id: userId },
      },
    });

    if (!chat) {
      throw new HttpException(
        "Chat not found",
        RESPONSE_CODE.CHAT_NOT_FOUND,
        400
      );
    }

    await prisma.chats.delete({
      where: {
        id: chat_id as string,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Chat deleted successfully",
      200,
      null
    );
  }

  async getUserConversations() {}

  async getAnonymousConversations() {}

  // conversations are mean't to be created/started only from anonymous users
  async chatConversation(req: NextApiRequest, res: NextApiResponse) {
    const payload = req.body as ConversationPayload;

    // validate
    const _validated = await zodValidation(chatConversationSchema, req, res);
    if (!_validated) {
      throw new HttpException(
        "Invalid conversation payload",
        RESPONSE_CODE.VALIDATION_ERROR,
        400
      );
    }

    const { message, chatId, anonymous_id } = payload;

    // check if chat exists
    const chat = await prisma.chats.findFirst({
      where: { id: chatId },
    });

    if (!chat) {
      throw new HttpException(
        "Chat not found",
        RESPONSE_CODE.CHAT_NOT_FOUND,
        400
      );
    }

    // check if conversation exists, if not create one
    let _conversation = await prisma.conversations.findFirst({
      where: {
        AND: { chatId, anonymous_id },
      },
    });

    const chatUserId = chat.userId;
    let conversation_id = _conversation?.id || "";
    let _anonymous_id = _conversation?.anonymous_id || "";

    // create conversation if it doesn't exist
    if (!_conversation || _conversation.anonymous_id !== anonymous_id) {
      // create conversation
      conversation_id = shortUUID.generate();
      _anonymous_id = anonymous_id ?? shortUUID.generate();
      await prisma.conversations.create({
        data: {
          id: conversation_id,
          chatId,
          anonymous_id: _anonymous_id,
          userId: chatUserId,
        },
      });
    }

    // ADMIN
    if ((req as any).user?.id) {
      // handle admin conversation
    } else {
      // handle anonymous conversation

      const tmpCache: Record<string, any> = {};
      let embeddings: number[] = [];

      if (tmpCache[message]) {
        embeddings = tmpCache[message];
      } else {
        const resp = await aiServices.retrieveEmbeddings(message, {});
        embeddings = resp[0].embedding;
      }

      const embeddingsString = `[${embeddings}]`;
      const similarities = (await prisma.$queryRaw`
      SELECT match_embeddings(
        ${embeddingsString},
        0.2,
        5
      )::json;
    `) satisfies SimilaritiesResult[];
      const _similarities = [];

      for (const sim of similarities) {
        const _similarity = sim.match_embeddings;
        const combinedContent = _similarity.content.join(" ");
        _similarities.push({
          id: _similarity.id,
          content: combinedContent,
          metadata: _similarity.metadata,
          similarity: _similarity.similarity,
        });
      }

      const highest_similarity_search = _similarities.slice(0, 2);

      // combined highest content with newline
      const combinedContent = highest_similarity_search
        .map((sim) => sim.content)
        .join("\n");

      const _templates = await aiServices.createPromptTemplate(
        message,
        chat.agent_name,
        combinedContent,
        chat.name
      );

      const aiResponse = await aiServices._webChatComplition(
        _templates[0]?.content as string,
        message
      );

      // get metadata content or url if exists
      const metadata = highest_similarity_search.map((sim) => sim.metadata).filter(s => s.url);
      
      const _metadata = metadata.length > 0 ? metadata[0].url : null;

      // create messages (anonymous, ai)
      // create anonymous conversation first
      // check if airesponse exists, else add a custom error message

      const _anonymousMsgCreated =  await prisma.messages.create({
        data: {
          message,
          sender_type: "ANONYMOUS",
          conversation_id,
        },
      });

      let aiResponseMsgCreated;

      if(aiResponse && aiResponse.length > 0){
        aiResponseMsgCreated = await prisma.messages.create({
          data: {
            message: aiResponse as string,
            sender_type: "AI",
            conversation_id,
            metadata: _metadata,
          },
        });
      }else{
        aiResponseMsgCreated = await prisma.messages.create({
          data: {
            message: "Sorry, something went wrong. Please try again later.",
            sender_type: "AI",
            conversation_id,
          },
        });
      }

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Message sent successfully",
        200,
        {
          anonymous: _anonymousMsgCreated,
          aiResponse: aiResponseMsgCreated,
        }
      );
    }
  }
}

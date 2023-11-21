import { NextApiRequest, NextApiResponse } from "next";
import HttpException from "../exception";
import zodValidation from "../utils/zodValidator";
import { createChatSchema } from "../utils/validation";
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
      const embeddings = await aiServices.retrieveWebPageEmbeddings(
        content,
        links
      );

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
          const { content, embedding, metadata } = data;
          const stringifyMetaData = JSON.stringify(metadata);
          const id = shortUUID.generate();
          // use rawsql query
          await prisma.$executeRaw`INSERT INTO public."Datasource" (id, type, "chatId", content, embedding) VALUES (${id},${type},${chatId},${content}, ${embedding})`;

          // create datasourceMetaData
          await prisma.datasourceMetaData.create({
            data: {
              id: shortUUID.generate(),
              data_source_id: id,
              metadata: stringifyMetaData,
            },
          });
        }
      }

      return sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Chat created successfully", 200, null)
    }
  }
}

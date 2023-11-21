import { NextApiRequest, NextApiResponse } from "next";
import HttpException from "../exception";
import zodValidation from "../utils/zodValidator";
import { createChatSchema } from "../utils/validation";
import { RESPONSE_CODE } from "@/types";


type CreateChatPayload = {
  name: string;
  agent_name: string;
  fildered_links: string[];
  webpage_url: string;
  type: "webpage" | "file";
}

export default class ChatController {
  async createChat(req: NextApiRequest, res: NextApiResponse) {
    const userId = (req as any).user?.id;
    const payload: CreateChatPayload = req.body;
    const _isValidated = zodValidation(createChatSchema, req, res);

    if (!_isValidated) {
      throw new HttpException("Invalid payload", RESPONSE_CODE.VALIDATION_ERROR, 400);
    }

    const {agent_name, type, fildered_links, name, webpage_url} = payload;
    
    if(type === "webpage"){
      // handle webpage embeddings / metadata
      
    }

  }
}

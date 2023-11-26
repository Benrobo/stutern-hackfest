import { NextApiRequest, NextApiResponse } from "next";
import catchErrors from "../../utils/error";
import ChatController from "../../controllers/chat.controller";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // handle options request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const chatController = new ChatController();
  if (req.method === "POST") {
    await chatController.anonymousConversation(req, res);
  }
  if (req.method === "PATCH") {
    await chatController.collectUserInfo(req, res);
  }
}

export default catchErrors(handler)

import { NextApiRequest, NextApiResponse } from "next";
import catchErrors from "../../utils/error";
import ChatController from "../../controllers/chat.controller";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chatController = new ChatController();
  if (req.method === "POST") {
    await chatController.assistantConversation(req, res);
  }
}

export default catchErrors(handler)

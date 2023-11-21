import { NextApiRequest, NextApiResponse } from "next";
import catchErrors from "../utils/error";
import ChatController from "../controllers/chat.controller";
import { isAuthenticated } from "../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chatController = new ChatController();
  if (req.method === "POST") {
    await chatController.createChat(req, res);
  }
  if (req.method === "GET") {
    await chatController.getChats(req, res);
  }
}

export default catchErrors(isAuthenticated(handler));

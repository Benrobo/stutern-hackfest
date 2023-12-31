import { NextApiRequest, NextApiResponse } from "next";
import catchErrors from "../../utils/error";
import ChatController from "../../controllers/chat.controller";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chatController = new ChatController();
  // handle options request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method === "GET") {
    await chatController.isChatValid(req, res);
  }
}

export default catchErrors(handler);

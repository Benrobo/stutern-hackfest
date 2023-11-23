import { NextApiRequest, NextApiResponse } from "next";
import catchErrors from "../../utils/error";
import ChatController from "../../controllers/chat.controller";
import { isAuthenticated } from "../../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chatController = new ChatController();
  if (req.method === "GET") {
    await chatController.takeControl(req, res);
  }
}

export default catchErrors(isAuthenticated(handler));

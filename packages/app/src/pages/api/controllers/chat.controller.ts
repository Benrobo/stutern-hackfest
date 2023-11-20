import { NextApiRequest, NextApiResponse } from "next";
import HttpException from "../exception";

export default class ChatController {
  async createChat(req: NextApiRequest, res: NextApiResponse) {
    const userId = (req as any).user?.id;
    const payload = req.body;
    
  }
}

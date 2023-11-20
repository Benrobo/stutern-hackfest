import UserController from "../controllers/user.controller";
import catchErrors from "../utils/error"; // replace with the actual path to catchErrors
import { NextApiRequest, NextApiResponse } from "next";

const userController = new UserController();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await userController.getAllLinks(req, res);
  }
}

export default catchErrors(handler);

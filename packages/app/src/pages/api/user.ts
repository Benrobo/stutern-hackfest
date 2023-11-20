import UserController from "./controllers/user.controller";
import catchErrors from "./utils/error"; // replace with the actual path to catchErrors
import { NextApiRequest, NextApiResponse } from "next";

const userController = new UserController();

async function handler(req: NextApiRequest, res: NextApiResponse){
  console.log(req.method)
  if(req.method === "GET"){
    await userController.test(req, res);
  }
}

export default catchErrors(handler)
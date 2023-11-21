import { getAuth } from "@clerk/nextjs/server";
import HttpException from "../exception";
import { NextApiRequest, NextApiResponse } from "next";
import { RESPONSE_CODE } from "@/types";
import prisma from "../config/prisma";

export function isAuthenticated(fn: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const currUser = getAuth(req);
    if (!currUser.userId) {
      throw new HttpException("Unauthorized user", RESPONSE_CODE.UNAUTHORIZED, 401);
    }

    // check if user exists
    const user  = await prisma.users.findUnique({
        where: {
            id: currUser.userId
        }
    });

    if(!user){
        throw new HttpException("Unauthorized, user not found", RESPONSE_CODE.UNAUTHORIZED, 401);
    }

    (req as any)["user"] = { id: currUser.userId };
    await fn(req, res);
  };
}

import { getAuth } from "@clerk/nextjs/server";
import HttpException from "../exception";
import { NextApiRequest, NextApiResponse } from "next";

export function isAuthenticated(fn: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const currUser = getAuth(req);
    if (!currUser.userId) {
      throw new HttpException("Unauthorized user", "UNAUTHORIZED", 401);
    }
    (req as any)["user"] = { id: currUser.userId };
    await fn(req, res);
  };
}

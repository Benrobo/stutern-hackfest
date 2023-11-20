
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import HttpException from "../exception";

export default function catchErrors(fn: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await fn(req, res)
    } catch (e: any) {
        if(e instanceof HttpException){
          return res.status(e.status).json({
            code: e.code,
            status: e.status,
            message: e.message,
            error: e
          })
        }
        res.status(500).json({
          code: "SERVER_ERROR",
          status: 500,
          message: `Internal server error`,
          error: e
        });
    }
  };
}

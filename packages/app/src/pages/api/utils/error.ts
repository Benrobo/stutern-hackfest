
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import HttpException from "../exception";
import { RESPONSE_CODE } from "@/types";

export default function catchErrors(fn: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await fn(req, res)
    } catch (e: any) {
         const code = RESPONSE_CODE[RESPONSE_CODE.INTERNAL_SERVER_ERROR];
         console.log(`😥 Error [${code}]: ${e?.message}`);
        if(e instanceof HttpException){
          return res.status(e.status).json({
            code: e.code,
            status: e.status,
            message: e.message,
            error: e
          })
        }
        res.status(500).json({
          code: code,
          status: 500,
          message: `Internal server error`,
          error: e
        });
    }
  };
}

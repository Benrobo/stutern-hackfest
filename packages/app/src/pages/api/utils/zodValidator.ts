import { RESPONSE_CODE } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { AnyZodObject } from "zod";

export default async function zodValidation(
  schema: AnyZodObject,
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    await schema.parseAsync(body ?? req.query);
    return true;
  } catch (error: any) {
    res.status(400).json({
      code: RESPONSE_CODE[RESPONSE_CODE.VALIDATION_ERROR],
      message: error?.issues[0]?.message,
      error: error,
    });
    return false;
  }
}

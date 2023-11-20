import { NextApiRequest, NextApiResponse } from "next";
import HttpException from "../exception";
import { extractLinksFromWebPages } from "../utils";
import sendResponse from "../utils/sendResponse";
import { RESPONSE_CODE } from "@/types";

export default class User {

  async getAllLinks(req: NextApiRequest, res: NextApiResponse){
    const payload = req.body;
    const url = payload?.url;

    const links = await extractLinksFromWebPages(url);

    sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Links extracted successfully", 200, links);
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import HttpException from "../exception";
import { extractLinksFromWebPages } from "../utils";
import sendResponse from "../utils/sendResponse";
import { RESPONSE_CODE } from "@/types";
import AIServices from "../services/AI";
import redisClient from "../config/redis";

const aiServices = new AIServices()

export default class User {

  async getAllLinks(req: NextApiRequest, res: NextApiResponse){
    const userId = (req as any).user?.id;
    const payload = req.body;
    const url = payload?.url;

    // store all links in cache to prevent recalculation
    let links: {url: string, content: string}[] | any[] = [];
    const urlInfo = await redisClient.get(url);
    if(urlInfo){
      links = urlInfo as any;
    }else{
      const extractedLinks = await extractLinksFromWebPages(url);
      links = extractedLinks.links;

      // cache data
      await redisClient.set(url, JSON.stringify(extractedLinks.links));
      await redisClient.expire(url, 60 * 30); // expire in 30 minutes
    }

    sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Links extracted successfully", 200, links);
  }
}

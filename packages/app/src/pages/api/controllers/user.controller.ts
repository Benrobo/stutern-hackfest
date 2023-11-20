import { NextApiRequest, NextApiResponse } from "next";
import HttpException from "../exception";
import { extractLinksFromWebPages } from "../utils";
import sendResponse from "../utils/sendResponse";
import { RESPONSE_CODE } from "@/types";
import AIServices from "../services/AI";

const aiServices = new AIServices()

export default class User {

  async getAllLinks(req: NextApiRequest, res: NextApiResponse){
    const userId = (req as any).user?.id;
    const payload = req.body;
    const url = payload?.url;

    const links = await extractLinksFromWebPages(url);
    
    // get all link contents and append them to tmp variable
    let contents = "";
    if(links.rawData.length > 0){
      for (const link of links.rawData) {
        contents += link.content;
      }
    }

    // send contents to AI service
    const result = await aiServices.getEmbeddings(contents, links.rawData);
    

    sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Links extracted successfully", 200, links.links);
  }
}

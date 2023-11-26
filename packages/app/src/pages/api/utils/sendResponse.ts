import { RESPONSE_CODE } from "@/types";
import { NextApiResponse } from "next";

class SendResponse {
  capitalizeWord(word: string) {
    const capWrd = word.split("")[0].toUpperCase() + word.slice(1);
    return capWrd;
  }

  error(
    res: NextApiResponse,
    code: RESPONSE_CODE,
    message: string,
    statusCode: number,
    data?: any
  ) {
    const response = {
      errorStatus: true,
      code: RESPONSE_CODE[code],
      message: message ?? this.capitalizeWord("error-message"),
      statusCode: statusCode ?? 400,
      data,
    };
    return res.status(statusCode).json(response);
  }

  success(
    res: NextApiResponse,
    code: RESPONSE_CODE,
    message: string,
    statusCode: number,
    data?: any
  ) {
    const response = {
      errorStatus: false,
      code: RESPONSE_CODE[code],
      message: message ?? this.capitalizeWord("success-message"),
      statusCode: statusCode ?? 200,
      data: data ?? null,
    };
    return res.status(statusCode).json(response);
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new SendResponse();

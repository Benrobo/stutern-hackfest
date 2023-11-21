import { RESPONSE_CODE } from "@/types";

export default class HttpException extends Error {
  public code;
  public status: number;
  constructor(message: string, code: RESPONSE_CODE, status: number) {
    super();
    this.name = "HttpException";
    this.message = message;
    this.code = RESPONSE_CODE[code];
    this.status = status;
  }
}

export default class HttpException extends Error {
  public code;
  public status: number;
  constructor(message: string,code: string, status: number) {
    super();
    this.name = "HttpException";
    this.message = message
    this.code = code;
    this.status = status;
  }
}

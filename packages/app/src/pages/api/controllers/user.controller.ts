import HttpException from "../exception";

export default class User {
  async test(req, res) {
    throw new HttpException("Not Found", "user not found", 404);
  }
}

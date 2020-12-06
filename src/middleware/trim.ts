import { Response, Request, NextFunction } from "express"

export default (req: Request, res: Response, next: NextFunction) => {
  const exception = ["passowrd"]

  Object.keys(req.body).forEach((key) => {
    if (!exception.includes(key) && typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim()
    }
  })

  next()
}

import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

import { User } from "../entity/User"

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token
    if (!token) throw new Error("unathenticated")

    const { username }: any = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ username })
    if (!user) throw new Error("unathenticated")

    res.locals.user = user
    return next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: "unathenticated" })
  }
}

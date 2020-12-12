import { Request, Response, Router } from "express"
import { User } from "../entity/User"
import { isEmpty, validate } from "class-validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cookie from "cookie"
import auth from "../middleware/auth"

const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user)
}

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body
  try {
    let errors: any = {}
    const emailUser = await User.findOne({ email })
    const usernameUser = await User.findOne({ username })

    if (emailUser) errors.email = "Email is already taken"
    if (usernameUser) errors.email = "username is already taken"

    if (errors.length) {
      return res.status(400).json({ errors })
    }
    const user = new User({ email, username, password })

    errors = await validate(user)
    if (errors.length) {
      return res.status(400).json({ errors })
    }
    await user.save()

    return res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body
  try {
    let errors: any = {}

    if (isEmpty(username)) errors.username = "username must be not empty"
    if (isEmpty(password)) errors.password = "password must be not empty"
    if (Object.keys(errors).length) return res.status(400).json(errors)

    const user = await User.findOne({ username })
    if (!user) return res.status(400).json({ error: "User not found" })

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) return res.status(401).json({ passowrd: "incorrect" })

    const token = jwt.sign({ username }, process.env.JWT_SECRET)

    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        path: "/", // cookie is valid all across this app
      })
    )
    return res.json(user)
  } catch (err) {
    console.log(err)
  }
}

const logout = (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/", // cookie is valid all across this app
    })
  )
  return res.status(200).json({ success: true })
}

const router = Router()
router.post("/me", auth, me)
router.post("/register", register)
router.post("/login", login)
router.post("/logout", auth, logout)

export default router

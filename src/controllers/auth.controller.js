import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export async function register(req, res) {
  const { userName, email, password } = req.body;

  const isAlreadyExist = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (isAlreadyExist) {
    return res.status(409).json({
      success: false,
      message: "Username or email already exist",
    });
  }

  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    userName,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
    config.JWT_SECRET,
    {
      expiresIn: "1d", 
    },
  );

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    token,
  });
}

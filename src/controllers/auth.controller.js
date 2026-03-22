import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/session.model.js";
import crypto from "crypto";

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

  const refreshToken = jwt.sign(
    //   will be stored in cookies thats why have to send in res.cookie
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  // const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    //   will be stored in client memory thats why have to send in res.json
    {
      id: user._id,
      userName: user.userName,
      email: user.email,
      sessionId: session._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    AccessToken: accessToken,
  });
}

export async function getMe(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, token not found",
    });
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    user: {
      userName: user.userName,
      email: user.email,
    },
  });
}

export async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, refresh token not found",
    });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  // const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session=await Session.findOne({
    refreshTokenHash,
    revoked:false
  })

  if(!session){
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  const accessToken = jwt.sign(
    {
      id: decoded.id,
      userName: decoded.userName,
      email: decoded.email,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );


  // const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  const newRefreshTokenHash = crypto   //   because crypto is deterministic same hash for same input 
  //  while bcrypt is not deterministic different hash for same input
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken,
  });
}


//   multiple device login / logout

export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, refresh token not found",
    });
  }

  // const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");


  const session = await Session.findOne({ refreshTokenHash, revoked: false });

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logout successfully",
  });

}

//  all logout

export async function logoutAll(req,res){
  const refreshToken=req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({
      success:false,
      message:"Unauthorized, refresh token not found"
    })
  }

  const decoded=jwt.verify(refreshToken,config.JWT_SECRET);

  await Session.updateMany({
    user:decoded.id,
    revoked:false
  },{
    revoked:true
  })

  res.clearCookie("refreshToken");

  return res.status(200).json({
    success:true,
    message:"Logout from all devices successfully"
  })
}

export async function login(req,res){
  const {email,password}=req.body;

  const user=await User.findOne({email});

  if(!user){
    return res.status(401).json({
      success:false,
      message:"Invalid email or password"
    })
  }

  const isMatch=await bcrypt.compare(password,user.password);

  if(!isMatch){
    return res.status(401).json({
      success:false,
      message:"Invalid email or password"
    })
  }

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session=await Session.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken=jwt.sign(
    {
      id:user._id,
      sessionId:session._id
    },
    config.JWT_SECRET,
    {
      expiresIn:"15m"
    }
  )


  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    success:true,
    message:"Login successfully",
    user:{
      userName:user.userName,
      email:user.email
    },
    accessToken
  })


}

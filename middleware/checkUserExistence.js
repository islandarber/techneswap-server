import User from "../models/User.js";

export const checkUser = async(req, res, next) => {

  const { email } = req.body;

  try{
    const user = await User.findOne({ email });
    if(user) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      next();
    }
  }
 catch(error) {
    return res.status(500).json({ message: error.message });
}
}
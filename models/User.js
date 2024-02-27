import mongoose, { mongo } from "mongoose";
import Skill from "./Skill.js";
const emailRegexp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [emailRegexp, "Please fill a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  location: {
    type: String,
  },
  skills:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    }
  ],
  needs: [
     {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    }
  ],
  visibility: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
  },
  avatar: {
    type: String,
  
  },
});

export default mongoose.model("User", userSchema);
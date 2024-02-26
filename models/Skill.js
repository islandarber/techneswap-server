import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  categoryName : {
    type: String,
    required: [true, "Category is required"],
  },
  skills : {
    type: Array,
  },
});

export default mongoose.model("Skill", skillSchema);
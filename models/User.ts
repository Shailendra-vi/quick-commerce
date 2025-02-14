import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["customer", "delivery"], required: true }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);


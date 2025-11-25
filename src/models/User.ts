// src/models/User.ts
import { Schema, model } from "mongoose";

interface IUser {
  telegramId: number;
  name: string;
}

const userSchema = new Schema<IUser>(
  {
    telegramId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);

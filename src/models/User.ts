import { Schema, model } from "mongoose";

export interface IUser {
  telegramId: number;
  name: string;
  balance: number;
  referredBy?: number | null; // <-- fix
}

const userSchema = new Schema<IUser>(
  {
    telegramId: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
    referredBy: { type: Number, default: null } // <-- fix
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);

import { Schema, model } from "mongoose";

export interface IUser {
  telegramId: number;
  name: string;
  balance: number;
  referredBy?: number | null;
  action?: string;
  active?: boolean; // User active status for broadcast
  // Presentation creation state
  presentationState?: {
    topic?: string;
    author?: string;
    pages?: number;
    template?: number;
    language?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    telegramId: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
    referredBy: { type: Number, default: null },
    action: { type: String, default: "start" },
    active: { type: Boolean, default: true },
    presentationState: {
      type: {
        topic: { type: String },
        author: { type: String },
        pages: { type: Number },
        template: { type: Number },
        language: { type: String },
      },
      default: {},
    },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);

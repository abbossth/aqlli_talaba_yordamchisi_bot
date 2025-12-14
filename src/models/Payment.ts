import { Schema, model } from "mongoose";

interface IPayment {
  userId: number;
  fileId: string;
  amount: number; // Required - user selects this before sending photo
  status: "pending" | "approved" | "rejected";
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Number, required: true },
    fileId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

export default model<IPayment>("Payment", paymentSchema);

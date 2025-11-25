import User from "../models/User";

export async function deductBalance(telegramId: number, amount: number) {
  const user = await User.findOne({ telegramId });

  if (!user) return false;
  if (user.balance < amount) return false;

  user.balance -= amount;
  await user.save();

  return true;
}

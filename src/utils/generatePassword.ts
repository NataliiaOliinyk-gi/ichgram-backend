import { randomInt } from "crypto";

function generateRandomPassword(length = 10): string {
  if (length < 6) length = 6;

  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^*_-+=?:;.,/";

  const all = upper + lower + numbers + symbols;

  const getRandom = (chars: string) => chars[randomInt(0, chars.length)];
  const passwordBuf = [
    getRandom(upper),
    getRandom(lower),
    getRandom(numbers),
    getRandom(symbols),
  ];

  while (passwordBuf.length < length) passwordBuf.push(getRandom(all));

  // Перемішуємо символи
  for (let i = passwordBuf.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [passwordBuf[i], passwordBuf[j]] = [passwordBuf[j], passwordBuf[i]];
  }

  return passwordBuf.join("");
}

export default generateRandomPassword;

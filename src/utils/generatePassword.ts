function generateRandomPassword(length = 10): string {
const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{};:<>?/";

  const all = upper + lower + numbers + symbols;

  const getRandom = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

  let password = [
    getRandom(upper),
    getRandom(lower),
    getRandom(numbers),
    getRandom(symbols),
  ];

  while (password.length < length) {
    password.push(getRandom(all));
  }

  // Перемішуємо символи
  return password.sort(() => 0.5 - Math.random()).join("");
}

export default generateRandomPassword;

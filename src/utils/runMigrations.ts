// функція для міграції
// в файлі .env виставити RUN_MIGRATIONS=true

// імпортувати потрібні моделі для міграції
import Post from "../db/models/Post";
import Like from "../db/models/Like";
import Comment from "../db/models/Comment";
import User from "../db/models/User";

const runMigrations = async () => {
  console.log("➡ Running one-time migrations...");

  await User.syncIndexes()
//   await User.updateMany(
//   { followersCount: { $exists: false } },
//   { $set: { followersCount: 0, followingCount: 0 } },
//   { timestamps: false }
// );

console.log("✅ Migrations finished.");

  // 1) Ініціалізуємо лічильники, якщо відсутні (ідемпотентно)
  // const res = await Post.updateMany({}, [
  //   {
  //     $set: {
  //       likesCount: { $ifNull: ["$likesCount", 0] },
  //       commentsCount: { $ifNull: ["$commentsCount", 0] },
  //     },
  //   },
  // ]);
  // console.log(
  //   `✅ Post counters initialized. matched: ${res.matchedCount}, modified: ${res.modifiedCount}`
  // );

  // 2) (Опціонально) Синхронізуємо індекси — корисно, якщо autoIndex=false
  //   await Promise.all([
  //     Post.syncIndexes(),
  //     Like.syncIndexes(),
  //     Comment.syncIndexes(),
  //   ]);
  //   console.log("✅ Indexes synced for Post/Like/Comment");

  //   console.log("✅ Migrations finished.");
  

  // 3) цей блок при змінах, коли індекси були створені і потрібно змінити
//   await Like.syncIndexes(); // створить потрібні з коду

//   // якщо раніше створювався інший індекс і заважає:
//   try {
//     await Like.collection.dropIndex("by_post");
//   } catch {}
//   try {
//     await Like.collection.dropIndex("by_user");
//   } catch {}

};

  export default runMigrations;

  // вставити в index.ts після підключення до бази, але до старту сервера

    //  if (process.env.RUN_MIGRATIONS === "true") {
    //   try {
    //     await runMigrations();
    //   } catch (e) {
    //     console.error("❌ Migration failed:", e);
    //     // вирішуй сама: або падати, або просто попередити.
    //     // process.exit(1);
    //   }
    // };

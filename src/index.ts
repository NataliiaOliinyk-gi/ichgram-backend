import "dotenv/config";
// import runMigrations from "./utils/runMigrations";

import connectDatabase from "./db/connectDatabase";
import startServer from "./server";

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

    //    if (process.env.RUN_MIGRATIONS === "true") {
    //   try {
    //     await runMigrations();
    //   } catch (e) {
    //     console.error("❌ Migration failed:", e);
    //     // вирішуй сама: або падати, або просто попередити.
    //     // process.exit(1);
    //   }
    // };


  startServer();
};

bootstrap();

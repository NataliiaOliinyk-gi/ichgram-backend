import mongoose from "mongoose";

const DATABASE_URI: string | undefined = process.env.DATABASE_URI;

const connectDatabase = async (): Promise<void> => {
  try {
    if (typeof DATABASE_URI !== "string") throw Error("DATABASE_URI environment variable is not defined");
    await mongoose.connect(DATABASE_URI);
    console.log("Successfully connect to database");
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error connect to database ${error.message}`);
    }
    throw error;
  }
};

export default connectDatabase;

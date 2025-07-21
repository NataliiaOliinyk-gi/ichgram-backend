import multer, { StorageEngine, Options, FileFilterCallback } from "multer";
import * as path from "node:path";
import { Request } from "express";

import HttpExeption from "../utils/HttpExeption";

type FileNameCallback = (error: Error | null, filename: string) => void;

const storage: StorageEngine = multer.diskStorage({
  destination: path.resolve("temp"),
  filename: (
    req: Request,
    file: Express.Multer.File,
    callback: FileNameCallback
  ): void => {
    //сохранит файл под тем именем, которое пришло
    // callback(null, file.originalname);

    // даст новое имя файла и сохранит под новым именем
    const uniquePrefix: string = `${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}`;
    const filename: string = `${uniquePrefix}_${file.originalname}`;
    callback(null, filename);
  },
});

// максимальный размер файла 10MB
const limits: Options["limits"] = {
  fileSize: 1024 * 1024 * 10,
};

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  const extension = file.originalname.split(".").pop() as string;
  if (extension === "exe") {
    return callback(HttpExeption(400, ".exe file not allow"));
  }
  callback(null, true);
};

const upload = multer({
  storage,
  limits,
  fileFilter,
});
export default upload;

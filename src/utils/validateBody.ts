import { HttpError } from "../typescript/classes";
import { ValidateOptions } from "yup";

interface SchemaBasic<K> {
  validate: (value: K, options?: ValidateOptions) => Promise<K>;
}

const validateBody = async <T extends SchemaBasic<K>, K>(
  schema: T,
  body: K
): Promise<boolean> => {
  try {
    await schema.validate(body, { abortEarly: false, strict: true });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      (error as HttpError).status = 400;
    }
    throw error;
  }
};

export default validateBody;

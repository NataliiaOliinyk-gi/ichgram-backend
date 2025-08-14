import HttpExeption from "./HttpExeption";

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue)) {
    throw HttpExeption(400, `${value} not a number`);
  }
  return parsedValue;
};

interface IPaginationQuery {
  page?: string;
  limit?: string;
}

const parsePaginationParams = (
  query: IPaginationQuery
): { page: number; limit: number } => {
  const page = parseNumber(query.page, 1);
  const limit = parseNumber(query.limit, 20);

  return {
    page,
    limit,
  };
};

export default parsePaginationParams;

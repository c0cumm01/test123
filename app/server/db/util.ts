import { getTableColumns, type Table } from "drizzle-orm";
import { z } from "zod";

export function createTableColumnsEnum<TTable extends Table>(
  table: TTable,
  options?: { omit?: Extract<keyof TTable["_"]["columns"], string>[] },
): z.ZodEnum<
  [
    Extract<keyof TTable["_"]["columns"], string>,
    ...Extract<keyof TTable["_"]["columns"], string>[],
  ]
> {
  type ColumnNames = Extract<keyof TTable["_"]["columns"], string>;

  const columns = getTableColumns(table) as TTable["_"]["columns"];
  let columnNames = Object.keys(columns) as ColumnNames[];

  if (options?.omit) {
    const omitSet = new Set(options.omit);
    columnNames = columnNames.filter((name) => !omitSet.has(name));
  }

  if (columnNames.length === 0) {
    throw new Error("No columns left after omitting");
  }

  const [firstColumn, ...restColumns] = columnNames;

  return z.enum([firstColumn, ...restColumns] as [
    ColumnNames,
    ...ColumnNames[],
  ]);
}

/**
 * Returns a SQL expression that converts a table's columns into a JSON object.
 *
 * @param table - The table to convert to a JSON object.
 * @returns A SQL expression representing the JSON object.
 */
export function jsonObjectFromTable(table: Table) {
  const columns = getTableColumns(table);
  return `json_object(${Object.entries(columns)
    .map(([key, value]) => `${key}, ${value}`)
    .join(", ")})`;
}

import { UseQueryOptions } from "@tanstack/react-query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryOptionsData<T extends (...args: any) => UseQueryOptions<any>> =
  ReturnType<T> extends UseQueryOptions<infer U> ? NonNullable<U> : never;

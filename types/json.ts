/**
 * JSON values as produced by `JSON.parse` / REST JSON bodies.
 * JSON-serializable values for request/response bodies.
 */
export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | JsonObject;

/** Plain object JSON — request bodies map here (DTOs are asserted at call sites). */
export type JsonObject = { [key: string]: JsonValue };

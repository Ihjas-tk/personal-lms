import type { Note } from "./types";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** A 409 from `PUT /modules/{id}/note` carries the current note (§5.4). */
export class ConflictError extends ApiError {
  current: Note;
  constructor(body: unknown) {
    super(409, "The note changed on disk since it was loaded.", body);
    this.name = "ConflictError";
    this.current = (body as { current?: Note }).current ?? (body as Note);
  }
}

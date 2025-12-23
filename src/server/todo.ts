import { db } from "./db";
import { todo } from "./schema";
import { eq } from "drizzle-orm";

export function listTodos() {
  return db.select().from(todo);
}

export function setDone(id: number, done: boolean) {
  return db.update(todo).set({ done }).where(eq(todo.id, id));
}


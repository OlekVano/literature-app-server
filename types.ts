import { Work } from "@prisma/client";

export type WorkProperty = keyof Work
export type AskableWorkProperty = Exclude<WorkProperty, 'id' | 'country' | 'year' | 'age' | 'name'>
import { Work, Writer } from "@prisma/client"

export type WorkProperty = keyof Work
export type AskableWorkProperty = Exclude<WorkProperty, 'id' | 'country' | 'year' | 'age' | 'name'>

export type WriterProperty = keyof Writer
export type AskableWriterProperty = Exclude<WriterProperty, 'id' | 'country' | 'years' | 'name'>
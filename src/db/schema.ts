import { varchar, integer, pgTable, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 20 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 50 }).unique().notNull(),
    password: varchar({ length: 20 }).notNull(),
    photo: text('photo')
})

export const postsTable = pgTable("posts", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    file_url: text().notNull(),
    userId: integer('user_id').notNull().references(() => usersTable.id).unique(),
})

// TODO: Have to define the user relations

export const userReactions = pgTable("user-reactions", {
    id: integer().primaryKey(),
    comment: varchar({ length: 500 }),
    likes: integer(),
    dislikes: integer().notNull(),
    postId: integer('post_id').notNull().references(() => postsTable.id).unique(),
    userId: integer('user_id').notNull().references(() => usersTable.id).unique()
})

export const savedPosts = pgTable("save-posts-schema", {
    id: integer().primaryKey(),
    postId: integer('post_id').notNull().references(() => postsTable.id).unique(),
    userId: integer('user_id').notNull().references(() => usersTable.id).unique()
})

export {sql, and}  from "drizzle-orm";

// TODO: Tokens schema
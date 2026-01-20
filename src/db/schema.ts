import { relations } from "drizzle-orm";
import { varchar, integer, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 20 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 50 }).unique().notNull(),
    password: varchar({ length: 20 }).notNull(),
    photo: text('photo')
})

export const posts = pgTable("posts", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    file_url: text().notNull(),
    userId: integer('user_id').notNull().references(() => users.id),
})


export const likes = pgTable("likes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    like: integer(),
    postId: integer('post_id').notNull().references(() => posts.id),
    userId: integer('user_id').notNull().references(() => users.id),
})

export const comments = pgTable("comments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    comment: varchar({ length: 500 }),
    postId: integer('post_id').notNull().references(() => posts.id),
    userId: integer('user_id').notNull().references(() => users.id)
})

// TODO: Saved posts for many-many relations

export const savedPosts = pgTable("save-posts-schema", {
    id: integer().primaryKey(),
    postId: integer('post_id').notNull().references(() => posts.id),
    userId: integer('user_id').notNull().references(() => users.id)
})

// Relations

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    likes: many(likes),
    comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.userId],
        references: [users.id],
    }),
    likes: many(likes),
    comments: many(comments),
}));

export const likesRelations = relations(likes, ({ one }) => ({
    user: one(users, {
        fields: [likes.userId],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [likes.postId],
        references: [posts.id],
    }),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
}));

export {sql, and, eq}  from "drizzle-orm";

// TODO: Tokens schema
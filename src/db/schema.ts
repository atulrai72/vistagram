import { relations } from "drizzle-orm";
import {
  varchar,
  integer,
  pgTable,
  text,
  primaryKey,
  index,
  timestamp,
  unique,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 20 }).notNull(),
  email: varchar({ length: 50 }).unique().notNull(),
  password: varchar().notNull(),
  avatar_url: text(),
});

export const posts = pgTable(
  "posts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    file_url: text().notNull(),
    file_type: text().notNull(),
    caption: text().notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("posts_user_id_idx").on(t.userId),
    byUserDate: index("posts_user_date_idx").on(t.userId, t.createdAt),
  }),
);

export const likes = pgTable(
  "likes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: unique().on(t.userId, t.postId),

    postIdx: index("likes_post_id_idx").on(t.postId),

    userIdx: index("likes_user_id_idx").on(t.userId),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    comment: varchar({ length: 500 }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    postIdx: index("comments_post_id_idx").on(t.postId),
  }),
);

export const follows = pgTable(
  "follows",
  {
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id),
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => ({
    // Composite key
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
    followingIdx: index("follows_following_idx").on(t.followingId),
  }),
);

// For one to one chat

export const rooms = pgTable("rooms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  isGroup: boolean().default(false),
  participants: integer().array(),
  lastMessage: text(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  message: varchar({ length: 20000 }).notNull(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TODO: Saved posts for many-many relations
export const savedPosts = pgTable("save-posts-schema", {
  id: integer().primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  likes: many(likes),
  comments: many(comments),
  followers: many(follows, { relationName: "user_followers" }),
  following: many(follows, { relationName: "user_following" }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "user_following",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "user_followers",
  }),
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
}));

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

export const roomsRelations = relations(rooms, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export { sql, and, eq, lt, desc, getTableColumns } from "drizzle-orm";

// TODO: Tokens schema

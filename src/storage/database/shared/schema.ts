import { pgTable, serial, varchar, text, timestamp, integer, boolean, jsonb, index, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 枚举定义
export const requestStatusEnum = pgEnum("request_status", ["open", "in_progress", "resolved", "closed"])
export const responseStatusEnum = pgEnum("response_status", ["pending", "accepted", "rejected"])
export const urgencyEnum = pgEnum("urgency", ["low", "medium", "high", "urgent"])

// 系统健康检查表
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    avatar: text("avatar"),
    bio: text("bio"),
    skills: jsonb("skills").$type<string[]>(),
    location: varchar("location", { length: 200 }),
    phone: varchar("phone", { length: 20 }),
    rating: integer("rating").default(5).notNull(),
    helpCount: integer("help_count").default(0).notNull(),
    points: integer("points").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
  ]
);

// 分类表
export const categories = pgTable(
  "categories",
  {
    id: serial().notNull().primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    icon: varchar("icon", { length: 50 }),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("categories_name_idx").on(table.name),
  ]
);

// 互助需求表
export const helpRequests = pgTable(
  "help_requests",
  {
    id: serial().notNull().primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    categoryId: integer("category_id"),
    urgency: urgencyEnum("urgency").default("medium").notNull(),
    status: requestStatusEnum("status").default("open").notNull(),
    location: varchar("location", { length: 200 }),
    rewardPoints: integer("reward_points").default(0).notNull(),
    images: jsonb("images").$type<string[]>(),
    viewCount: integer("view_count").default(0).notNull(),
    responseCount: integer("response_count").default(0).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("help_requests_user_id_idx").on(table.userId),
    index("help_requests_category_id_idx").on(table.categoryId),
    index("help_requests_status_idx").on(table.status),
    index("help_requests_created_at_idx").on(table.createdAt),
  ]
);

// 需求响应表
export const helpResponses = pgTable(
  "help_responses",
  {
    id: serial().notNull().primaryKey(),
    requestId: integer("request_id").notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    message: text("message").notNull(),
    status: responseStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("help_responses_request_id_idx").on(table.requestId),
    index("help_responses_user_id_idx").on(table.userId),
  ]
);

// 评价表
export const reviews = pgTable(
  "reviews",
  {
    id: serial().notNull().primaryKey(),
    requestId: integer("request_id").notNull(),
    reviewerId: varchar("reviewer_id", { length: 36 }).notNull(),
    revieweeId: varchar("reviewee_id", { length: 36 }).notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reviews_request_id_idx").on(table.requestId),
    index("reviews_reviewer_id_idx").on(table.reviewerId),
    index("reviews_reviewee_id_idx").on(table.revieweeId),
  ]
);

// 站内消息表
export const messages = pgTable(
  "messages",
  {
    id: serial().notNull().primaryKey(),
    senderId: varchar("sender_id", { length: 36 }).notNull(),
    receiverId: varchar("receiver_id", { length: 36 }).notNull(),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_sender_id_idx").on(table.senderId),
    index("messages_receiver_id_idx").on(table.receiverId),
  ]
);

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Zod schemas for validation
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  email: true,
  username: true,
  avatar: true,
  bio: true,
  skills: true,
  location: true,
  phone: true,
});

export const insertHelpRequestSchema = createCoercedInsertSchema(helpRequests).pick({
  title: true,
  description: true,
  categoryId: true,
  urgency: true,
  location: true,
  rewardPoints: true,
  images: true,
});

export const insertHelpResponseSchema = createCoercedInsertSchema(helpResponses).pick({
  requestId: true,
  message: true,
});

export const insertReviewSchema = createCoercedInsertSchema(reviews).pick({
  requestId: true,
  revieweeId: true,
  rating: true,
  comment: true,
});

export const insertMessageSchema = createCoercedInsertSchema(messages).pick({
  receiverId: true,
  content: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type HelpRequest = typeof helpRequests.$inferSelect;
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type HelpResponse = typeof helpResponses.$inferSelect;
export type InsertHelpResponse = z.infer<typeof insertHelpResponseSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

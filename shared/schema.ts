import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define the submissions table schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create the insert schema for submissions
export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  number: true,
  name: true,
});

// Add validation rules
export const submissionFormSchema = insertSubmissionSchema.extend({
  number: z.coerce.number().min(0, "Number must be positive"),
  name: z.string().min(1, "Name is required"),
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

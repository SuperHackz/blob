import { users, type User, type InsertUser, type Submission, type InsertSubmission } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Submission methods
  getSubmissions(): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private submissions: Map<number, Submission>;
  private userId: number;
  private submissionId: number;

  constructor() {
    this.users = new Map();
    this.submissions = new Map();
    this.userId = 1;
    this.submissionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSubmissions(): Promise<Submission[]> {
    // Return all submissions sorted by createdAt (newest first)
    return Array.from(this.submissions.values())
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.submissionId++;
    const now = new Date();
    
    const submission: Submission = {
      ...insertSubmission,
      id,
      createdAt: now,
    };
    
    this.submissions.set(id, submission);
    return submission;
  }
}

export const storage = new MemStorage();

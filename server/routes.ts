import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { submissionFormSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Endpoint to get all submissions
  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error getting submissions:", error);
      res.status(500).json({ message: "Failed to retrieve submissions" });
    }
  });

  // Endpoint to create a new submission
  app.post("/api/submissions", async (req, res) => {
    try {
      // Validate request body
      const validationResult = submissionFormSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const submission = await storage.createSubmission(validationResult.data);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Add a list of predefined names for the dropdown
  app.get("/api/names", (req, res) => {
    // These are the names we'll use in the dropdown
    const names = [
      "John Doe",
      "Jane Smith",
      "Alex Johnson",
      "Sam Wilson",
      "Taylor Green",
      "Chris Brown",
      "Jordan Lee",
      "Casey Zhang",
      "Morgan Kelly",
      "Riley Cooper"
    ];
    
    res.json(names);
  });

  const httpServer = createServer(app);

  return httpServer;
}

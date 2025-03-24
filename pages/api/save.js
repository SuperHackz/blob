import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, number } = req.body;
    if (!name || !number) return res.status(400).json({ error: "Missing fields" });

    try {
      const query = "INSERT INTO submissions (name, number) VALUES ($1, $2)";
      await pool.query(query, [name, number]);
      res.status(200).json({ message: "Saved successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM submissions ORDER BY id DESC");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

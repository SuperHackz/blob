import { useState, useEffect } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [submissions, setSubmissions] = useState([]);

  // Fetch existing submissions from the API
  useEffect(() => {
    const fetchSubmissions = async () => {
      const res = await fetch("/api/save");
      const data = await res.json();
      setSubmissions(data);
    };
    fetchSubmissions();
  }, []);

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, number }),
    });

    setName("");
    setNumber("");
    fetchSubmissions(); // Refresh submissions
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Enter Your Name and Number</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <button type="submit">Save</button>
      </form>

      <h2>Submissions</h2>
      <ul>
        {submissions.map((entry, index) => (
          <li key={index}>{entry.name} - {entry.number}</li>
        ))}
      </ul>
    </div>
  );
}

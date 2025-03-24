let submissions = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Handle form submission
    const { name, number } = req.body;
    submissions.push({ name, number });
    return res.status(200).json({ message: "Submission saved" });
  } else {
    // Handle fetching submissions
    res.status(200).json(submissions);
  }
}

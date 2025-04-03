// pages/api/chat.js
import connectDb from '../../lib/db';
import Student from '../../models/Student';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;
  const lowerMessage = message.toLowerCase();

  // Define a list of keywords that trigger a database query
  const dbKeywords = ['student count', 'how many students', 'list students', 'show students'];

  const isDbQuery = dbKeywords.some(keyword => lowerMessage.includes(keyword));

  if (isDbQuery) {
    try {
      // For example: if asking for "how many students", we return the count
      if (lowerMessage.includes('count') || lowerMessage.includes('how many')) {
        const count = await Student.countDocuments({});
        return res.status(200).json({ reply: `There are ${count} students in the database.` });
      }
      // Otherwise, if asking to "list students"
      if (lowerMessage.includes('list')) {
        const students = await Student.find({}, { first_name: 1, last_name: 1, mail_id: 1 }).lean();
        const list = students.map(s => `${s.first_name} ${s.last_name} (${s.mail_id || 'No Email'})`).join('\n');
        return res.status(200).json({ reply: `Student List:\n${list}` });
      }
      // Default fallback for DB queries
      return res.status(200).json({ reply: "I couldn't understand your database query. Please try rephrasing it." });
    } catch (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Error querying the database." });
    }
  }

  // Otherwise, handle a general chat query via Hugging Face API
  try {
    const hfApiUrl = 'https://api-inference.huggingface.co/models/distilgpt2';
    const hfResponse = await fetch(hfApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: context ? `${context}\nUser: ${message}\nAI:` : `User: ${message}\nAI:`
      })
    });
    const result = await hfResponse.json();
    const reply = result.generated_text || "I'm sorry, I couldn't generate a response.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return res.status(500).json({ error: "Error processing your request" });
  }
}

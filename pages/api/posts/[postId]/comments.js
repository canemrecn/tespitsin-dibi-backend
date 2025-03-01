import Cors from 'cors';
import connection from 'pages/api/util/mysql';

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],
  origin: 'http://localhost:5173', // frontend URL
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(204).end();
    return;
  }

  if (req.method === 'POST') {
    const { postId } = req.query;
    const { comment, user_id } = req.body;

    if (!comment || !user_id) {
      res.status(400).json({ error: 'Comment and user_id are required' });
      return;
    }

    try {
      const [result] = await connection.execute(
        'INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)',
        [postId, user_id, comment]
      );

      // Fetch the new comment with the user's details
      const [commentResult] = await connection.execute(
        `SELECT c.id, c.post_id, c.user_id, c.text, c.created_at, u.username, u.profile_picture, u.gender 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.id = ?`, 
        [result.insertId]
      );

      res.status(200).json({ message: 'Comment added successfully', comment: commentResult[0] });
    } catch (error) {
      console.error('Error inserting comment:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { postId } = req.query;
      const [comments] = await connection.execute(
        `SELECT c.id, c.post_id, c.user_id, c.text, c.created_at, u.username, u.profile_picture, u.gender 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.post_id = ?`, 
        [postId]
      );

      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST');
    res.status(204).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const posts = await query(`
        SELECT posts.*, users.username, users.first_name, users.last_name, users.profile_picture 
        FROM posts 
        JOIN users ON posts.user_id = users.id
      `);
      res.status(200).json(posts);
    } else if (req.method === 'POST') {
      const { user_id, category_id, title, content } = req.body;
      const result = await query('INSERT INTO posts (user_id, category_id, title, content) VALUES (?, ?, ?, ?)', [user_id, category_id, title, content]);
      const newPost = await query(`
        SELECT posts.*, users.username, users.first_name, users.last_name, users.profile_picture 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.id = ?
      `, [result.insertId]);
      res.status(201).json(newPost[0]);
    } else {
      res.setHeader('Allow', 'GET, POST');
      res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

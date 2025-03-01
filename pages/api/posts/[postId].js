import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await query('SELECT * FROM posts WHERE id = ?', [id]);
      res.status(200).json(post[0]);
    } catch (error) {
      res.status (500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await query('DELETE FROM posts WHERE id = ?', [id]);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end();
  }
}

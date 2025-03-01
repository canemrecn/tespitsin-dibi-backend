// pages/api/posts/[postId]/like.js
import connection from "pages/api/util/mysql";

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
      return;
    }
  
    if (req.method === 'POST') {
      const { postId } = req.query;
      const { user_id } = req.body;
  
      try {
        const [existingLike] = await connection.execute('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [postId, user_id]);
        if (existingLike.length > 0) {
          res.status(400).json({ message: 'You have already liked this post' });
          return;
        }
  
        const [existingDislike] = await connection.execute('SELECT * FROM dislikes WHERE post_id = ? AND user_id = ?', [postId, user_id]);
        if (existingDislike.length > 0) {
          await connection.execute('DELETE FROM dislikes WHERE post_id = ? AND user_id = ?', [postId, user_id]);
        }
  
        await connection.execute('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, user_id]);
        await connection.execute('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
  
        res.status(200).json({ message: 'Post liked successfully' });
      } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    } else {
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
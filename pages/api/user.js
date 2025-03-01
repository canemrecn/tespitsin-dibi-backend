import { query } from '../../lib/db';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['PUT', 'OPTIONS'],
  origin: 'http://localhost:5173', // Buraya frontend URL'nizi ekleyin
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
    res.setHeader('Allow', 'PUT');
    res.status(204).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, username, firstName, lastName, profilePicture } = req.body;

  try {
    await query(
      'UPDATE users SET username = ?, first_name = ?, last_name = ?, profile_picture = ? WHERE email = ?',
      [username, firstName, lastName, profilePicture, email]
    );
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
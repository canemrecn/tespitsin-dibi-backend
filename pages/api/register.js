import { query } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import Cors from 'cors';

const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: 'http://localhost:5173',
});

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
  await runMiddleware(req, res, cors);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { email, password, username, firstName, lastName, profilePicture, gender } = req.body;

  console.log('Request body:', req.body);
  console.log('email:', email);
  console.log('password:', password);
  console.log('username:', username);
  console.log('firstName:', firstName);
  console.log('lastName:', lastName);
  console.log('profilePicture:', profilePicture);
  console.log('gender:', gender);

  try {
    if (!email || !password || !username || !firstName || !lastName || !gender) {
      throw new Error('Missing required fields');
    }

    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    const result = await query(
      'INSERT INTO users (email, password, username, first_name, last_name, profile_picture, gender) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, username, firstName, lastName, profilePicture || '/default-profile.png', gender]
    );
    console.log('User inserted successfully', result);

    res.status(201).json({ id: result.insertId, email });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: error.message });
  }
}


const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 8001; 

app.use(cors());
app.use(express.json());

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgrespassword',
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));


app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this username or email' });
    }
    
    const result = await client.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, password]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await client.query(
      'SELECT id, username, email FROM users WHERE username = $1 AND password_hash = $2',
      [username, password] 
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    console.log('Fetching groups...');
    const result = await client.query('SELECT * FROM groups');
    console.log('Groups fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/messages/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log('Fetching messages for group:', groupId);
    const result = await client.query(
      `SELECT m.*, u.username 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.group_id = $1 
       ORDER BY m.created_at ASC`,
      [groupId]
    );
    console.log('Messages fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { groupId, senderId, content, username } = req.body;
    console.log('Creating message:', { groupId, senderId, content, username });
    
    const result = await client.query(
      'INSERT INTO messages (group_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [groupId, senderId, content]
    );
    
=    const message = result.rows[0];
    message.username = username;
    
    console.log('Message created:', message);
    res.json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Chat backend server listening at http://localhost:${port}`);
});
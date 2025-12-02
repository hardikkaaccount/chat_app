const express = require('express');
const cors = require('cors');

const app = express();
const port = 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Hasura GraphQL endpoint
const HASURA_ENDPOINT = 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = 'myadminsecretkey';

// Helper function to make GraphQL requests to Hasura
async function queryHasura(query, variables = {}) {
  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
  
  return await response.json();
}

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUserQuery = `
      query ($username: String!, $email: String!) {
        users(where: {_or: [{username: {_eq: $username}}, {email: {_eq: $email}}]}) {
          id
        }
      }
    `;
    
    const existingUserResult = await queryHasura(existingUserQuery, { username, email });
    
    if (existingUserResult.data.users.length > 0) {
      return res.status(400).json({ error: 'User already exists with this username or email' });
    }
    
    // Create new user
    const createUserMutation = `
      mutation ($username: String!, $email: String!, $password: String!) {
        insert_users_one(object: {username: $username, email: $email, password_hash: $password}) {
          id
          username
          email
        }
      }
    `;
    
    const result = await queryHasura(createUserMutation, { username, email, password });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    res.status(201).json(result.data.insert_users_one);
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username and password
    const loginQuery = `
      query ($username: String!, $password: String!) {
        users(where: {username: {_eq: $username}, password_hash: {_eq: $password}}) {
          id
          username
          email
        }
      }
    `;
    
    const result = await queryHasura(loginQuery, { username, password });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    if (result.data.users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    res.json(result.data.users[0]);
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all groups
app.get('/api/groups', async (req, res) => {
  try {
    console.log('Fetching groups...');
    
    const groupsQuery = `
      query {
        groups {
          id
          name
          description
          created_by
          created_at
        }
      }
    `;
    
    const result = await queryHasura(groupsQuery);
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    console.log('Groups fetched:', result.data.groups);
    res.json(result.data.groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a specific group
app.get('/api/messages/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log('Fetching messages for group:', groupId);
    
    const messagesQuery = `
      query ($groupId: Int!) {
        messages(where: {group_id: {_eq: $groupId}}, order_by: {created_at: asc}) {
          id
          group_id
          sender_id
          content
          created_at
          user {
            username
          }
        }
      }
    `;
    
    const result = await queryHasura(messagesQuery, { groupId: parseInt(groupId) });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    // Format messages to include username
    const formattedMessages = result.data.messages.map(message => ({
      id: message.id,
      group_id: message.group_id,
      sender_id: message.sender_id,
      content: message.content,
      created_at: message.created_at,
      username: message.user ? message.user.username : null
    }));
    
    console.log('Messages fetched:', formattedMessages);
    res.json(formattedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { groupId, senderId, content, username } = req.body;
    console.log('Creating message:', { groupId, senderId, content, username });
    
    const createMessageMutation = `
      mutation ($groupId: Int!, $senderId: Int!, $content: String!) {
        insert_messages_one(object: {group_id: $groupId, sender_id: $senderId, content: $content}) {
          id
          group_id
          sender_id
          content
          created_at
        }
      }
    `;
    
    const result = await queryHasura(createMessageMutation, { 
      groupId: parseInt(groupId), 
      senderId: parseInt(senderId), 
      content 
    });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    // Add username to the response
    const message = result.data.insert_messages_one;
    message.username = username;
    
    console.log('Message created:', message);
    res.json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Chat backend server listening at http://localhost:${port}`);
});
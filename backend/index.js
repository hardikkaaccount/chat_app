require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = 8001;

app.use(cors());
app.use(express.json());

const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
const bcrypt = require('bcrypt');

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

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUserQuery = `
      query ($username: String!, $email: String!) {
        users(where: {_or: [{username: {_eq: $username}}, {email: {_eq: $email}}]}) {
          id
          username
          email
        }
      }
    `;
    
    const existingUserResult = await queryHasura(existingUserQuery, { username, email });
    
    if (existingUserResult.data.users.length > 0) {
      return res.status(400).json({ error: 'User already exists with this username or email' });
    }
    
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const createUserMutation = `
      mutation ($username: String!, $email: String!, $hashedPassword: String!) {
        insert_users_one(object: {username: $username, email: $email, password_hash: $hashedPassword}) {
          id
          username
          email
        }
      }
    `;
    
    const result = await queryHasura(createUserMutation, { username, email, hashedPassword });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    res.status(201).json(result.data.insert_users_one);
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Fetch user with password hash
    const loginQuery = `
      query ($email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
          username
          email
          password_hash
        }
      }
    `;
    
    const result = await queryHasura(loginQuery, { email });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    if (result.data.users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.data.users[0];
    
    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Return user data without the password hash
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

app.post('/api/groups', async (req, res) => {
  try {
    console.log('Creating group:', req.body);
    const { name, description, created_by } = req.body;
    console.log('Creating group:', { name, description, created_by });
    
    const createGroupMutation = `
      mutation ($name: String!, $description: String!, $created_by: Int!) {
        insert_groups_one(object: {name: $name, description: $description, created_by: $created_by}) {
          id
          name
          description
          created_by
          created_at
        }
      }
    `;
    
    const result = await queryHasura(createGroupMutation, { name, description, created_by });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    console.log('Group created:', result.data.insert_groups_one);
    res.status(201).json(result.data.insert_groups_one);
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    
    const message = result.data.insert_messages_one;
    message.username = username;
    
    console.log('Message created:', message);
    res.json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/events/group-created', async (req, res) => {
  try {
    const eventData = req.body;
    console.log('Group created event received:', eventData);
    console.log('Processing group creation event for group ID:', eventData.event.data.new.id);
    
    const insertMessageMutation = `
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
    
    const result = await queryHasura(insertMessageMutation, { 
      groupId: eventData.event.data.new.id, 
      senderId: eventData.event.data.new.created_by, 
      content: `Create group ${eventData.event.data.new.name}` 
    });
    
    res.status(200).json({ message: 'Group creation event processed successfully' });
  } catch (err) {
    console.error('Error processing group creation event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New Hasura Action for registerUser
app.post('/api/actions/register-user', async (req, res) => {
  try {
    // Extract session variables and input from the request
    const { session_variables, input } = req.body;
    const { username, email, password } = input;
    
    // Check if user already exists
    const existingUserQuery = `
      query ($username: String!, $email: String!) {
        users(where: {_or: [{username: {_eq: $username}}, {email: {_eq: $email}}]}) {
          id
          username
          email
        }
      }
    `;
    
    const existingUserResult = await queryHasura(existingUserQuery, { username, email });
    
    if (existingUserResult.data.users.length > 0) {
      return res.status(200).json({
        message: 'User already exists with this username or email'
      });
    }
    
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create the user
    const createUserMutation = `
      mutation ($username: String!, $email: String!, $hashedPassword: String!) {
        insert_users_one(object: {username: $username, email: $email, password_hash: $hashedPassword}) {
          id
          username
          email
        }
      }
    `;
    
    const result = await queryHasura(createUserMutation, { username, email, hashedPassword });
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    // Return the user data
    res.json({
      id: result.data.insert_users_one.id,
      username: result.data.insert_users_one.username,
      email: result.data.insert_users_one.email
    });
  } catch (err) {
    console.error('Error in registerUser action:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Chat backend server listening at http://localhost:${port}`);
});
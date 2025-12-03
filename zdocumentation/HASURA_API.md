# Hasura GraphQL API Documentation

This document describes the Hasura GraphQL API configuration and endpoints used in the project.

## Hasura Configuration

The Hasura service is configured through [docker-compose.yaml](docker-compose.yaml) with the following settings:

- **GraphQL Endpoint**: `http://localhost:8080/v1/graphql`
- **Hasura Console**: Enabled at `http://localhost:8080/console`
- **Admin Secret**: `myadminsecretkey`
- **PostgreSQL Connection**: `postgres://postgres:postgrespassword@postgres:5432/postgres`

## GraphQL Schema

The Hasura GraphQL schema is automatically generated from the PostgreSQL database tables:

### Users
```graphql
type users {
  id: Int!
  username: String!
  email: String!
  password_hash: String!
  created_at: timestamptz!
  group_members: [group_members!]!
  groups: [groups!]!
  messages: [messages!]!
}
```

### Groups
```graphql
type groups {
  id: Int!
  name: String!
  description: String
  created_by: Int!
  created_at: timestamptz!
  user: users!
  group_members: [group_members!]!
  messages: [messages!]!
}
```

### Messages
```graphql
type messages {
  id: Int!
  group_id: Int
  sender_id: Int
  content: String!
  created_at: timestamptz!
  group: groups
  user: users
}
```

### Group Members
```graphql
type group_members {
  id: Int!
  group_id: Int
  user_id: Int
  joined_at: timestamptz!
  group: groups
  user: users
}
```

## Event Triggers

### Group Creation Event
An event trigger named `create_group` is configured on the [groups table](hasura/metadata/databases/default/tables/public_groups.yaml):

- **Trigger Name**: create_group
- **Webhook URL**: `http://host.docker.internal:8001/api/events/group-created`
- **Operation**: Insert
- **Columns**: All (*)

When a new group is created, Hasura sends a webhook to the backend service with the group details.

## Sample Queries

### Get All Groups
```graphql
query {
  groups {
    id
    name
    description
    created_by
    created_at
  }
}
```

### Get Messages for a Group
```graphql
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
```

### Get User by Credentials
```graphql
query ($username: String!, $password: String!) {
  users(where: {username: {_eq: $username}, password_hash: {_eq: $password}}) {
    id
    username
    email
  }
}
```

## Sample Mutations

### Create User
```graphql
mutation ($username: String!, $email: String!, $password: String!) {
  insert_users_one(object: {username: $username, email: $email, password_hash: $password}) {
    id
    username
    email
  }
}
```

### Create Group
```graphql
mutation ($name: String!, $description: String!, $created_by: Int!) {
  insert_groups_one(object: {name: $name, description: $description, created_by: $created_by}) {
    id
    name
    description
    created_by
    created_at
  }
}
```

### Create Message
```graphql
mutation ($groupId: Int!, $senderId: Int!, $content: String!) {
  insert_messages_one(object: {group_id: $groupId, sender_id: $senderId, content: $content}) {
    id
    group_id
    sender_id
    content
    created_at
  }
}
```

## Metadata Structure

The Hasura metadata is organized in the following structure:

```
hasura/
└── metadata/
    ├── databases/
    │   └── default/
    │       └── tables/
    │           ├── public_group_members.yaml
    │           ├── public_groups.yaml
    │           ├── public_messages.yaml
    │           └── public_users.yaml
    ├── actions.yaml
    ├── graphql_schema_introspection.yaml
    └── version.yaml
```

Each table YAML file defines:
- Table schema and name
- Object relationships (foreign keys)
- Array relationships (reverse foreign keys)
- Event triggers
- Permissions (not shown in this project)

## Migration Structure

Database migrations are stored in:
```
hasura/
└── migrations/
    └── default/
        └── 1764653598132_init/
            └── up.sql
```

The migration creates all tables with appropriate constraints and relationships.
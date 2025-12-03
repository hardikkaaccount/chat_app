# Docker Deployment Documentation

This document describes the Docker configuration and deployment process for the Hasura Crash Course project.

## Docker Compose Configuration

The project uses Docker Compose to orchestrate the services. The configuration is defined in [docker-compose.yaml](docker-compose.yaml).

### Services

#### PostgreSQL Database
```yaml
postgres:
  image: postgres:12
  restart: always
  volumes:
  - db_data:/var/lib/postgresql/data
  environment:
    POSTGRES_PASSWORD: postgrespassword
  ports:
    - "5432:5432"
```

- **Image**: Official PostgreSQL 12 image
- **Restart Policy**: Always restart on failure
- **Volume**: Persistent storage for database data
- **Environment**: Sets the PostgreSQL password
- **Ports**: Exposes PostgreSQL on port 5432

#### Hasura GraphQL Engine
```yaml
graphql-engine:
  image: hasura/graphql-engine:v2.0.1
  ports:
    - "8080:8080"
  extra_hosts:
  - "host.docker.internal:host-gateway"
  depends_on:
    - "postgres"
  restart: always
  environment:
    HASURA_GRAPHQL_METADATA_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/postgres
    HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
    HASURA_GRAPHQL_DEV_MODE: "true"
    HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup, http-log, webhook-log, websocket-log, query-log
    HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey
```

- **Image**: Hasura GraphQL Engine v2.0.1
- **Ports**: Exposes Hasura on port 8080
- **Extra Hosts**: Maps host.docker.internal to host-gateway for webhook connectivity
- **Dependencies**: Depends on the postgres service
- **Restart Policy**: Always restart on failure
- **Environment Variables**:
  - `HASURA_GRAPHQL_METADATA_DATABASE_URL`: Connection string to PostgreSQL
  - `HASURA_GRAPHQL_ENABLE_CONSOLE`: Enables the Hasura console
  - `HASURA_GRAPHQL_DEV_MODE`: Enables development mode
  - `HASURA_GRAPHQL_ENABLED_LOG_TYPES`: Configures log types
  - `HASURA_GRAPHQL_ADMIN_SECRET`: Admin secret for securing the GraphQL endpoint

### Volumes

```yaml
volumes:
  db_data:
```

Defines a named volume for persistent PostgreSQL data storage.

## System Architecture Diagram

```mermaid
graph TD
    A[Client Browser] --> B[React Frontend]
    B --> C[Express Backend]
    C --> D[Hasura GraphQL Engine]
    D --> E[PostgreSQL Database]
    
    subgraph Docker Container
        D
        E
    end
    
    subgraph Host Machine
        A
        B
        C
    end
```

## Network Configuration

The Docker Compose configuration sets up a default bridge network that allows all services to communicate with each other using service names as hostnames:

- **PostgreSQL** is accessible at `postgres:5432` from other services
- **Hasura** is accessible at `graphql-engine:8080` from other services
- **Host machine** is accessible from containers using `host.docker.internal`

## Starting the Services

To start all services:

```bash
docker-compose up
```

This command will:
1. Pull the required Docker images if not already present
2. Create the necessary containers
3. Start the services in the correct order (PostgreSQL first, then Hasura)
4. Attach to the containers to display logs

To start services in detached mode:

```bash
docker-compose up -d
```

## Stopping the Services

To stop all services:

```bash
docker-compose down
```

This stops and removes all containers but preserves the named volumes.

To stop services and remove volumes:

```bash
docker-compose down -v
```

## Accessing Services

Once the services are running, you can access:

1. **Hasura Console**: `http://localhost:8080/console`
2. **GraphQL Endpoint**: `http://localhost:8080/v1/graphql`
3. **PostgreSQL Database**: `localhost:5432` (from host machine)

## Hasura Configuration

Hasura is configured with:
- **Admin Secret**: `myadminsecretkey` (used for authenticated GraphQL requests)
- **Console Enabled**: Yes (accessible at `/console`)
- **Development Mode**: Enabled (better error messages and debugging)
- **Metadata Database**: PostgreSQL database connection

## Data Persistence

The PostgreSQL data is persisted in a Docker named volume `db_data`. This ensures that data survives container restarts and removals.

To list volumes:

```bash
docker volume ls
```

To inspect the volume:

```bash
docker volume inspect hasura-crash-course_db_data
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If ports 5432 or 8080 are already in use, update the port mappings in [docker-compose.yaml](docker-compose.yaml).

2. **Connection Issues**: Ensure all services are running and can communicate with each other.

3. **Permission Issues**: On Linux systems, you might need to adjust permissions for volume mounts.

### Logs

To view logs for all services:

```bash
docker-compose logs
```

To view logs for a specific service:

```bash
docker-compose logs postgres
docker-compose logs graphql-engine
```

### Resetting the Environment

To completely reset the environment:

```bash
docker-compose down -v
docker-compose up
```

This removes all data and starts with a fresh database.
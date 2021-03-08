# vue-notion-clone

Notion.so clone using Vue 2 and RxDB.
RxDB supports offline-first app, with sync to CouchDB or GraphQL endpoint.
Currently sync is in the work on branch `server`.

Helps, issues, PR are welcomed.

## To-do

- [x] Page: create, list, remove, reorder, save
- [x] Block: simple text block, splitting
- [ ] Block: handle HTML
- [ ] Block: update splitting method of cursor pos

## Project setup

1. Create new file `/authentication/.env`
    ```
    DATABASE_URL=postgres://postgres:postgrespassword@postgres:5432/postgres
    ```
    and `/backend/.env`
    ```
    HASURA_GRAPHQL_DATABASE_URL=postgres://postgres:postgrespassword@postgres:5432/postgres
    HASURA_GRAPHQL_ENABLE_CONSOLE=false
    HASURA_GRAPHQL_MIGRATIONS_DIR=./migrations
    ENDPOINT=http://localhost:10000
    HASURA_GRAPHQL_ADMIN_SECRET=myadminsecret
    # add generated key here
    HASURA_GRAPHQL_JWT_SECRET={"type": "RS256", "key": ""}
    ```

2. Generate authentication keys
    ```
    cd ./authentication
    openssl genrsa -out private.pem 2048
    openssl rsa -in private.pem -pubout > public.pem
    awk -v ORS='\n' '1' public.pem
    ```
3. Copy key from `public.pem` to `HASURA_GRAPHQL_JWT_SECRET` key in backend `.env` file in one line (add \n).

## How To Run

- frontend: Vue 2 using vue-cli. Start with `npm run serve` on `/frontend`.
- backend: Hasura GraphQL API. Start with `docker-compose up -d` on project root.
- authentication: Server for Hasura auth, same DB with backend.

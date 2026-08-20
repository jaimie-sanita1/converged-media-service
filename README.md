# Converged Media Planning API – Local Dev Server

A fully-typed **Express + TypeScript** server that mirrors the endpoints defined in the **Converged Media Planning API** Postman collection. It uses an in-memory store seeded with sample data so you can run the collection against a real HTTP server without any external dependencies.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) configure environment
cp .env.example .env   # edit PORT / BEARER_TOKEN as needed

# 3. Start in watch mode (auto-restarts on file changes)
npm run dev

# 4. Or build and run the compiled output
npm run build && npm start
```

The server starts on **http://localhost:3000** by default.

---

## Environment variables

| Variable       | Default      | Description                                                    |
|----------------|--------------|----------------------------------------------------------------|
| `PORT`         | `3000`       | TCP port the server listens on                                 |
<<<<<<< HEAD
| `HOST`         | `{IP_ADDRESS}`    | Bind address                                                   |
=======
| `HOST`         | `0.0.0.0`    | Bind address                                                   |
>>>>>>> 17058ce (Generate TypeScript Express server, tests, and CI workflow)
| `BEARER_TOKEN` | `demo-token` | Expected bearer token – must match `{{token}}` in the collection |

---

## Collection → Server mapping

| Collection request | Method | Path                        | Notes                                                  |
|--------------------|--------|-----------------------------|--------------------------------------------------------|
| Create campaign    | POST   | `/v1/campaigns`             | Body: `{ advertiserId, name, budget }`                 |
| List campaigns.    | GET    | `/v1/campaigns`             | Query: `advertiserId` (required), `status` (optional)  |
| Get media plan     | GET    | `/v1/media-plans/`          | Query: `planId` (required). Trailing slash is tolerated |

### Authentication

Every endpoint requires a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer demo-token
```

This matches the collection's `{{token}}` variable (default value `demo-token`). Set `BEARER_TOKEN` in your environment to use a different value.

---

## Endpoints

### `POST /v1/campaigns`

Creates a new media campaign.

**Request body**
```json
{
  "advertiserId": "adv_12345",
  "name": "Fall Launch",
  "budget": 150000
}
```

**Response `201`**
```json
{
  "data": {
    "id": "cmp_1700000000000",
    "advertiserId": "adv_12345",
    "name": "Fall Launch",
    "budget": 150000,
    "status": "DRAFT",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "meta": { "message": "Campaign created successfully." }
}
```

---

### `GET /v1/campaigns?advertiserId=adv_12345&status=ACTIVE`

Returns campaigns for an advertiser, optionally filtered by status.

| Query param    | Required | Values                              |
|----------------|----------|-------------------------------------|
| `advertiserId` | ✅        | any string                          |
| `status`       | ❌        | `ACTIVE` \| `PAUSED` \| `DRAFT` \| `COMPLETED` |

**Response `200`**
```json
{
  "data": [ /* Campaign[] */ ],
  "meta": { "total": 1, "advertiserId": "adv_12345", "status": "ACTIVE" }
}
```

---

### `GET /v1/media-plans/?planId=plan_45678`

Returns a media plan and its current planning status.

| Query param | Required | Values     |
|-------------|----------|------------|
| `planId`    | ✅        | any string |

**Response `200`**
```json
{
  "data": { /* MediaPlan */ },
  "meta": { "planId": "plan_45678", "planningStatus": "APPROVED" }
}
```

**Response `404`** – when the plan ID is not found.

---

### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }` – useful for liveness probes.

---

## Seeded data

The in-memory store is pre-loaded with:

| Entity       | ID            | advertiserId  | Notes                        |
|--------------|---------------|---------------|------------------------------|
| Campaign     | `cmp_001`     | `adv_12345`   | Status: ACTIVE               |
| Campaign     | `cmp_002`     | `adv_12345`   | Status: DRAFT                |
| Campaign     | `cmp_003`     | `adv_99999`   | Status: PAUSED               |
| Media Plan   | `plan_45678`  | `adv_12345`   | Status: APPROVED, 3 line items |
| Media Plan   | `plan_99001`  | `adv_12345`   | Status: DRAFT, 2 line items  |

> **Note:** Data resets to seed values every time the server restarts (in-memory only).

---

## Project structure

<<<<<<< HEAD
```text
=======
```
>>>>>>> 17058ce (Generate TypeScript Express server, tests, and CI workflow)
media-planning-service/
├── src/
│   ├── index.ts              # Entry point – starts the HTTP server
│   ├── app.ts                # Express app factory (routes, middleware)
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   ├── data/
│   │   ├── seed.ts           # Sample campaigns & media plans
│   │   └── store.ts          # In-memory CRUD store (singleton)
│   ├── middleware/
│   │   ├── auth.ts           # Bearer-token authentication
│   │   └── validate.ts       # Request validation per endpoint
│   └── routes/
│       ├── campaigns.ts      # POST /v1/campaigns, GET /v1/campaigns
│       └── mediaPlans.ts     # GET /v1/media-plans
├── postman/
│   └── collections/
│       └── Converged Media Planning API/   # Source collection YAML files
<<<<<<< HEAD
├── .github/workflows/ci.yml
=======
>>>>>>> 17058ce (Generate TypeScript Express server, tests, and CI workflow)
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Running the Postman collection

1. Start the server: `npm run dev`
2. In Postman, set the collection variable `baseUrl` to `http://localhost:3000`
3. Set the collection variable `token` to `demo-token` (or your custom `BEARER_TOKEN`)
4. Send any request – the server will respond with seeded or newly-created data

---

## Testing and CI

Run the automated checks locally:

```bash
npm test
npm run build
```

The GitHub Actions workflow at `.github/workflows/ci.yml` runs on pull requests and on pushes to `main` and `master`. It installs dependencies with `npm ci`, then runs the TypeScript build and test suite.

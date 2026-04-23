# Stage 2 Backend — Intelligence Query Engine

A queryable demographic intelligence API built with **NestJS**, **Prisma**, and **Supabase (PostgreSQL)**. It stores 2026 user profiles and exposes advanced filtering, sorting, pagination, and natural language search.

---

## Tech Stack

- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **ORM:** Prisma v6
- **Database:** Supabase (PostgreSQL)
- **Package Manager:** pnpm
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- A Supabase project with a PostgreSQL database

### Installation

```bash
git clone <your-repo-url>
cd stage-2-task
pnpm install
```

### Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres"
```

- `DATABASE_URL` — Supabase pooler connection (used by the app at runtime)
- `DIRECT_URL` — Direct connection (used for migrations and seeding)

### Database Setup

```bash
# Run migrations
pnpm prisma migrate deploy

# Seed the database with 2026 profiles
pnpm prisma db seed
```

### Run Locally

```bash
pnpm start:dev
```

Server runs at `http://localhost:3009`.

---

## API Reference

### Base URL

```
https://stage-2-task-l9dj.vercel.app/
```

---

### GET /api/profiles

Returns a paginated, filterable, sortable list of profiles.

**Query Parameters**

| Parameter               | Type   | Description                                      |
|------------------------|--------|--------------------------------------------------|
| `gender`               | string | Filter by gender: `male` or `female`             |
| `age_group`            | string | Filter by age group: `child`, `teenager`, `adult`, `senior` |
| `country_id`           | string | Filter by ISO country code e.g. `NG`, `KE`      |
| `min_age`              | number | Minimum age (inclusive)                          |
| `max_age`              | number | Maximum age (inclusive)                          |
| `min_gender_probability` | number | Minimum gender confidence score (0–1)          |
| `min_country_probability` | number | Minimum country confidence score (0–1)        |
| `sort_by`              | string | Sort field: `age`, `created_at`, `gender_probability` |
| `order`                | string | Sort direction: `asc` or `desc` (default: `desc`) |
| `page`                 | number | Page number (default: `1`)                       |
| `limit`                | number | Results per page (default: `10`, max: `50`)      |

**Example Request**

```
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=asc&page=1&limit=10
```

**Example Response**

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 312,
  "data": [
    {
      "id": "019db9a3-5c64-7ecd-b7f4-616ade9bc971",
      "name": "John Doe",
      "gender": "male",
      "gender_probability": 0.98,
      "age": 26,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.95,
      "created_at": "2026-04-23T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/profiles/search

Natural language search endpoint. Converts plain English queries into structured filters.

**Query Parameters**

| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| `q`       | string | Natural language query (required)  |
| `page`    | number | Page number (default: `1`)         |
| `limit`   | number | Results per page (default: `10`, max: `50`) |

**Example Request**

```
GET /api/profiles/search?q=young males from nigeria&page=1&limit=10
```

**Supported Query Patterns**

| Natural Language Query                  | Resolved Filters                                  |
|----------------------------------------|---------------------------------------------------|
| `young males`                          | `gender=male`, `min_age=16`, `max_age=24`         |
| `females above 30`                     | `gender=female`, `min_age=30`                     |
| `people from angola`                   | `country_id=AO`                                   |
| `adult males from kenya`               | `gender=male`, `age_group=adult`, `country_id=KE` |
| `male and female teenagers above 17`   | `age_group=teenager`, `min_age=17`                |

> **Note:** Parsing is rule-based only — no AI or LLMs are used. `young` maps to ages 16–24 for parsing purposes only and is not a stored age group.

**Unrecognised Query Response**

```json
{
  "status": "error",
  "message": "Unable to interpret query"
}
```

---

## Error Responses

All errors follow this structure:

```json
{
  "status": "error",
  "message": "<description>"
}
```

| Status Code | Meaning                          |
|-------------|----------------------------------|
| `400`       | Missing or empty parameter       |
| `422`       | Invalid parameter type           |
| `404`       | Profile not found                |
| `500`       | Internal server error            |

---

## Database Schema

```prisma
model Profile {
  id                   String   @id
  name                 String   @unique
  gender               String
  gender_probability   Float
  age                  Int
  age_group            String
  country_id           String
  country_name         String
  country_probability  Float
  created_at           DateTime @default(now())
}
```

---

## Natural Language Query — How It Works

The `/api/profiles/search` endpoint uses a **rule-based parser** (`parseNaturalLanguage`) that applies regex patterns to the query string and maps matched tokens to structured filter fields:

1. **Gender detection** — matches words like `male`, `males`, `female`, `females`
2. **Age group detection** — matches `teenager`, `adult`, `senior`, `child`
3. **"Young" rule** — maps to `min_age=16`, `max_age=24`
4. **Age comparison** — matches phrases like `above 30`, `over 25`, `older than 18`
5. **Country detection** — maps country names to ISO codes (e.g. `nigeria` → `NG`)

If no filters can be extracted from the query, the API returns an error response rather than returning all records.

---

## CORS

All endpoints include the header:

```
Access-Control-Allow-Origin: *
```

---

## Scripts

```bash
pnpm start:dev          # Run in development (watch mode)
pnpm build              # Compile TypeScript
pnpm start:prod         # Run compiled build
pnpm prisma migrate dev # Create and apply a new migration
pnpm prisma db seed     # Seed the database
pnpm prisma studio      # Open Prisma Studio (DB GUI)
```
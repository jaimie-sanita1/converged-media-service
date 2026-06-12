# Acme Shop — 10-Minute Demo Script

Presenter flow for Postman + Playwright Application Inventory.

## Before the demo

```bash
cd ~/Desktop/src/postman-playwright-ecommerce-demo
npm install
npx playwright install chromium
postman login
```

Optional: link this folder to a Postman workspace via **Files → Open folder** so results appear in Application Inventory.

Keep two terminals ready:
- **Terminal A** — app server (`npm start`)
- **Terminal B** — `npm run test:app`

---

## Scene 1: The problem (1 min)

**Talk track:** Modern apps need both UI and API validation. Playwright proves the UI works, but UI-green does not mean the API layer is healthy. Postman Application Inventory runs both in one command.

Show the app at http://localhost:3000 — browse products, add to cart, checkout manually if helpful.

---

## Scene 2: Happy path (3 min)

**Terminal A:**
```bash
npm start
```

**Terminal B:**
```bash
npm run test:app
```

**What to highlight in terminal output:**
- Playwright test passes
- Captured API requests are listed
- Matched requests run collection assertions (status 200/201, response shape)
- `0 not matched` (or all matched)

**Optional:** Open Postman → **Home → Application Inventory** and show the run synced to your workspace.

**Talk track:** Real browser traffic from a real user journey is validated against your Postman collection contracts — no duplicate test authoring for the same flows.

---

## Scene 3: Contract drift (3 min)

Stop the server (Ctrl+C), then restart in drift mode.

**Terminal A:**
```bash
npm run start:drift
```

Note the badge: `Demo mode: drift`

**Terminal B:**
```bash
npm run test:app
```

**What happens:**
- Playwright still passes — user can add to cart and checkout
- The UI calls `POST /api/cart/add` instead of the documented `POST /api/cart/items`
- Postman reports **unmatched** or failed contract validation for the add-to-cart call

**Talk track:** The frontend silently diverged from the API contract. Traditional UI tests miss this. Application Inventory catches undocumented endpoints and drift between docs and real usage.

---

## Scene 4: Silent backend error (3 min)

**Terminal A:**
```bash
npm run start:silent-error
```

**Terminal B:**
```bash
npm run test:app
```

**What happens:**
- Checkout API returns **500** (`Payment gateway unavailable`)
- The UI bug shows "Order placed successfully" anyway (optimistic UI without error handling)
- Playwright passes because it asserts on the success message
- Postman fails checkout assertions on status 201 / confirmed order

**Talk track:** This is the false-green scenario — the worst kind of test gap. UI tests alone would ship this bug. Combined validation catches silent API failures during the same run.

---

## Reset between runs

Each Playwright test calls `POST /api/demo/reset` before running. Restarting the server also clears in-memory cart/order state.

---

## Closing (30 sec)

**Key messages:**
1. Keep your existing Playwright tests — add `postman-playwright` once in config
2. `postman app init` links collections + environment
3. `CI=true postman app test` validates API contracts from real UI traffic
4. Application Inventory shows coverage, matched/unmatched calls, and drift over time

**Optional next step:** `npm run test:app:capture` to bootstrap a collection from traffic when API tests do not exist yet.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED localhost:3000` | Start the app first (`npm start`) |
| Results not in Application Inventory | Use `CI=true`, ensure Postman CLI is logged in, repo linked to workspace |
| Playwright browser missing | `npx playwright install chromium` |
| `postman app init` not finding collection | Collections live in `postman/collections/` — run init from project root |

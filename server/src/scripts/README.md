# Database seed scripts

Scripts to populate the Carbonix app with sample users, listings, and transactions.

## Commands

| Command | What it does |
|--------|----------------|
| `npm run seed` | **Destructive:** drops the DB, then creates users, listings, transactions, and links. |
| `npm run add-listings` | Adds random listings for existing producer-style users (keeps data). |
| `npm run add-transactions` | Adds sample purchases for consumers (keeps data; needs listings). |

Typical flow when extending an existing DB:

```bash
npm run seed
npm run add-listings
npm run add-transactions
```

## Seeded users (`npm run seed`)

Passwords are for **local development only**.

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@example.local | Admin@123 | admin | Demo Admin |
| seller.demo@example.com | User@123 | user | Morgan Lee |
| buyer.demo@example.com | User@123 | user | Riley Chen |
| seller1@example.com | User@456 | user | Rajesh Mehta |
| buyer1@example.com | User@456 | user | Alex Park |
| user1@example.com | User@789 | user | Amit Patel |

Listings are spread across `seller.demo@example.com`, `seller1@example.com`, and `user1@example.com`; sample transactions reference those accounts.

## Warning

`npm run seed` **wipes the database**. Do not run it against production.

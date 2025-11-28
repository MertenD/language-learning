# Next Starter

## Getting Started

1. Copy `.env.example` to `.env`
2. Create a PostgreSQL database and set the `DATABASE_URL` in `.env`. You can use [Neon](https://neon.com/)
3. We use [Better-Auth](https://www.better-auth.com/) for authentication. Create a random auth secret and set the `BETTER_AUTH_SECRET` to it. Change the `BETTER_AUTH_SECRET` when going to production later.
4. Run the [Inngest](https://www.inngest.com/) cli with `npm run inngest:dev`
5. ...

Run `npx prisma generate` and `npx prisma db push`
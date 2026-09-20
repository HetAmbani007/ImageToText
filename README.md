# ClearText

An image-to-text converter built with Next.js and API Ninjas. It supports file uploads, drag and drop, and live camera capture on browsers that provide `getUserMedia`.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set `API_NINJAS_KEY`.
3. Start the app with `npm run dev` and open `http://localhost:3000`.

The API key is used only by the server route and is never exposed to the browser. Camera access requires HTTPS in production (localhost is allowed for local development). If camera access is unavailable or denied, the upload option remains available.

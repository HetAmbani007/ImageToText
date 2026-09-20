# ClearText

An image-to-text converter built with Next.js and Tesseract.js. OCR runs locally in the browser, so images are not uploaded to an OCR provider.

## Run locally

1. Install dependencies: `npm install`
2. Start the app with `npm run dev` and open `http://localhost:3000`.

The first scan downloads the English OCR model and may take a little longer; later scans are faster. Camera access requires HTTPS in production (localhost is allowed for local development). If camera access is unavailable or denied, the upload option remains available.

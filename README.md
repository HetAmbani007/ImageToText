# ClearText

An image-to-text converter built with Next.js and Tesseract.js. OCR runs locally in the browser, so images are not uploaded to an OCR provider.

## Run locally

1. Install dependencies: `npm install`
2. Start the app with `npm run dev` and open `http://localhost:3000`.

The OCR engine recognizes English and Gujarati (`eng+guj`) and returns Gujarati text as Gujarati; it does not translate or transliterate it. The first scan downloads both language models and may take a little longer; later scans are faster. The upload control opens the file picker, including on Safari. Camera access is available only through the separate camera tab and requires HTTPS in production (localhost is allowed for local development). If camera access is unavailable or denied, the upload option remains available.

# AI-Powered Web Scraper

A powerful web scraping tool that extracts and stores website data in a well-formatted way. The application offers two analysis options: OpenAI-powered analysis (requiring an API key) and a free local analyzer.

## Features

- Extract metadata, content, links, and images from any website
- Choose between OpenAI-powered analysis or free local analysis
- View extracted data in organized tabs
- Responsive design works on desktop and mobile
- No data storage or user accounts required (in-memory storage)

## Deployment Instructions

### Prerequisites
- Node.js 18+ and npm installed
- Basic understanding of web hosting

### Quick Start (Local Development)

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
4. Open your browser to the URL shown in the console

### Deployment Options

#### Option 1: Vercel

1. Sign up for a [Vercel](https://vercel.com/) account
2. Connect your GitHub/GitLab repository or upload your project
3. Vercel will automatically detect your Next.js application and deploy it
4. Add the following environment variables in the Vercel dashboard:
   - `PORT=3000`

#### Option 2: Netlify

1. Sign up for a [Netlify](https://www.netlify.com/) account
2. Connect your GitHub/GitLab repository or upload your project
3. Configure the build command: `npm run build`
4. Set the publish directory: `dist` or `build`
5. Add the following environment variables in the Netlify dashboard:
   - `PORT=3000`

#### Option 3: Render

1. Sign up for a [Render](https://render.com/) account
2. Create a new Web Service
3. Connect your repository or upload your project
4. Set the build command: `npm install && npm run build`
5. Set the start command: `npm run start`
6. Add the following environment variables in the Render dashboard:
   - `PORT=3000`

### Important Notes

- This application uses in-memory storage, which means data will be lost when the server restarts
- For OpenAI-powered analysis, users need to provide their own OpenAI API key
- The free local analyzer is available to all users without any API key requirement

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS, ShadcnUI
- Backend: Node.js, Express
- Libraries: Axios, Cheerio, OpenAI (optional)

## License

MIT
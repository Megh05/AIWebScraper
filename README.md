# AI Web Scraper

An advanced AI-powered web scraping platform that intelligently extracts, processes, and presents website data with cutting-edge automation and analysis capabilities.

## Features

- Enter any URL and get detailed information about the webpage
- Choose between free local analysis or enhanced OpenAI-powered analysis
- View extracted data organized into tabs:
  - Metadata (title, descriptions, OpenGraph data)
  - Content (headings, paragraphs, reading stats)
  - Links (internal and external)
  - Images (with details about size, type, and alt text)
  - Raw JSON data (for developers)
- Export results as JSON or CSV
- Clean, modern UI built with React and Tailwind CSS

## Technologies Used

- **Frontend**: React, TailwindCSS, shadcn/ui
- **Backend**: Express.js
- **Data Processing**: Cheerio for HTML parsing
- **AI Integration**: OpenAI API (optional)
- **Type Safety**: TypeScript throughout

## Deployment Instructions

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Local Development
1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

### Production Deployment

#### Deploying to Render, Railway, or similar Node.js hosting:
1. Connect your repository to the service
2. Set the build command to `npm run build`
3. Set the start command to `npm start`
4. Add environment variables if needed (see below)

#### Manual Deployment:
1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Environment Variables
- `PORT`: Port for the server (defaults to 5000)
- `OPENAI_API_KEY`: Your OpenAI API key (optional, only needed for OpenAI analysis)

## Usage

1. Visit the homepage
2. Enter a URL to analyze
3. Choose between local analysis or OpenAI-powered analysis
4. If selecting OpenAI analysis, enter your API key
5. View the detailed results across different tabs
6. Export the data as needed

## License

MIT
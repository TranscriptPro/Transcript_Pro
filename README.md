# Audio Transcription App

A full-stack web application for uploading audio files and transcribing them using Google Cloud Speech-to-Text API.

## Features

- Upload audio files (mp3, wav, flac, m4a) with drag and drop or file picker
- Manage uploaded files with status tracking
- Transcribe audio files to text
- Playback audio files directly in the browser
- View, copy, and download transcriptions

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Query
- **Backend:** Node.js, Express
- **Audio Processing:** Google Cloud Speech-to-Text API

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Google Cloud account with Speech-to-Text API enabled

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/audio-transcription-app.git
cd audio-transcription-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Configure your Google Cloud credentials:

- Create a service account key in the Google Cloud Console
- Download the JSON key file
- Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your key file

### Development

Start the development server:

```bash
npm run dev:all
```

This will start both the frontend and backend servers.

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Google Cloud Speech-to-Text Configuration

The application is configured to use Google Cloud Speech-to-Text with the following settings:

- Language: Portuguese (Brazil) - `pt-BR`
- Profanity filter: Enabled
- Word timestamps: Enabled
- Max alternatives: 1

## Production Deployment

1. Build the frontend:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## License

MIT
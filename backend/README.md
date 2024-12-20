# Class Manager Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
- Copy `.env.example` to `.env`
- Fill in your actual values

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

Make sure to set up these environment variables in your `.env` file:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service key
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Frontend URL for CORS

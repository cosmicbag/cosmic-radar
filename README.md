# Cosmic Radar 🚀

A dark-themed Web3-style crypto dashboard that tracks the top 200 cryptocurrencies by market cap using the CoinMarketCap Pro API. Monitor daily rank movements, market flows, and macro metrics in one comprehensive dashboard.

![Cosmic Radar Dashboard](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=flat-square&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## Features ✨

### Core Features
- **Real-time Market Metrics**: Total market cap, 24h volume, BTC dominance, Fear & Greed Index, and Altcoin Season Index
- **Top 200 Tracking**: Comprehensive table with sorting, filtering, and search capabilities
- **Rank Change Analysis**: Visual indicators showing daily rank movements (up/down/new)
- **Tier Movement Tracking**: Monitor coins entering/leaving Top 10/50/100/200
- **Gainers & Losers**: Identify the biggest price movers in the Top 200
- **Historical Snapshots**: Daily snapshots stored in PostgreSQL for trend analysis
- **Coin Detail View**: Click any coin to see detailed information, stats, and links

### News & Information
- **Crypto News Page**: Dedicated news feed powered by CryptoPanic API
- **Filter by Sentiment**: View hot, rising, bullish, bearish, or important news
- **Real-time Updates**: Stay informed with the latest crypto headlines

### User Features
- **Google Authentication**: Sign in with Google for a seamless experience
- **Email/Password Auth**: Traditional signup and login option
- **User Dashboard**: Protected dashboard with portfolio placeholders
- **Watchlist (Coming Soon)**: Track your favorite coins
- **Price Alerts (Coming Soon)**: Get notified on price movements

### Mobile Experience
- **Responsive Design**: Optimized for all screen sizes
- **Bottom Navigation**: Kraken-style mobile navigation bar
- **Touch-Friendly**: Card-based UI designed for mobile interaction

### Technical
- **Dark Theme UI**: Modern, Web3-inspired design
- **Vercel-Ready**: Optimized for deployment on Vercel
- **DeFi Integration**: DEX volume and TVL tracking via DeFi Llama

## Tech Stack 🛠️

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Table**: TanStack Table (React Table v8)
- **API**: CoinMarketCap Pro API, CryptoPanic API, DeFi Llama API
- **Auth**: NextAuth.js with Google OAuth and Credentials
- **Deployment**: Vercel-ready

## Prerequisites 📋

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud-hosted like Supabase)
- CoinMarketCap Pro API key ([Get one here](https://coinmarketcap.com/api/))
- (Optional) CryptoPanic API key for news ([Get one here](https://cryptopanic.com/developers/api/))
- (Optional) Google OAuth credentials for Google Sign-In

## Getting Started 🚀

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd flow-radar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# CoinMarketCap Pro API Key (Required)
CMC_API_KEY=your_coinmarketcap_api_key_here

# Database URL (Required - Postgres e.g., Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# NextAuth Configuration (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_with_openssl_rand_base64_32

# CryptoPanic API Key (Optional - for news feed)
CRYPTOPANIC_API_KEY=your_cryptopanic_api_key_here

# Google OAuth (Optional - for Google Sign In)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Optional: Base URL for API calls (defaults to http://localhost:3000)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Getting a CoinMarketCap API Key:

1. Visit [CoinMarketCap API](https://coinmarketcap.com/api/)
2. Sign up for a free account (Basic plan includes 10,000 calls/month)
3. Copy your API key from the dashboard
4. Paste it into your `.env` file

#### Setting up PostgreSQL:

**Option A: Supabase (Recommended for beginners)**
1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → Database → Connection String
4. Copy the connection string and paste it into your `.env` file

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL locally, then:
DATABASE_URL=postgresql://postgres:password@localhost:5432/flowradar?schema=public
```

### 4. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:

```bash
npx prisma generate
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Snapshot

When you first visit the dashboard, it will automatically:
1. Fetch the latest Top 200 cryptocurrencies from CoinMarketCap
2. Create a snapshot in your database
3. Display the data

To manually refresh the snapshot, click the "Refresh Snapshot" button in the Flows & Movers section.

## Project Structure 📁

```
flow-radar/
├── app/
│   ├── api/
│   │   ├── global/              # Global market metrics endpoint
│   │   ├── top200/live/         # Live Top 200 data endpoint
│   │   └── snapshots/
│   │       ├── today/           # Create/get today's snapshot
│   │       └── compare/         # Compare snapshots
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main dashboard page
├── components/
│   ├── dashboard/
│   │   ├── FlowsSection.tsx           # Flows & Movers section
│   │   ├── GainersLosersPanel.tsx     # Gainers/Losers cards
│   │   ├── MetricsRow.tsx             # Hero metrics cards
│   │   ├── NewsPanel.tsx              # News panel (placeholder)
│   │   ├── RankChangeCell.tsx         # Rank change indicator
│   │   ├── TierMovementCards.tsx      # Tier movement cards
│   │   └── TopCoinsTable.tsx          # Main Top 200 table
│   └── layout/
│       └── Header.tsx                 # App header
├── lib/
│   ├── cmcClient.ts             # CoinMarketCap API client
│   ├── compare.ts               # Snapshot comparison logic
│   ├── date.ts                  # Date utility functions
│   └── prisma.ts                # Prisma client singleton
├── prisma/
│   └── schema.prisma            # Database schema
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind configuration
└── README.md                    # This file
```

## API Endpoints 🔌

### GET /api/global
Returns global market metrics including Fear & Greed and Altcoin Season indices.

### GET /api/top200/live
Returns live Top 200 cryptocurrencies directly from CoinMarketCap (not from database).

### POST /api/snapshots/today
Creates or returns today's snapshot. Automatically fetches fresh data if no snapshot exists.

### GET /api/snapshots/compare?date=YYYY-MM-DD
Compares the snapshot for the given date with the previous day. Use `date=today` for today's comparison.

## Database Schema 💾

### Snapshot
Stores daily snapshots of the Top 200.

- `id`: Auto-incrementing primary key
- `date`: Unique date (UTC, 00:00)
- `createdAt`: Timestamp
- `coins`: Relation to CoinSnapshot

### CoinSnapshot
Stores individual coin data for each snapshot.

- `id`: Auto-incrementing primary key
- `snapshotId`: Foreign key to Snapshot
- `cmcId`: CoinMarketCap ID
- `name`: Coin name
- `symbol`: Coin symbol
- `rank`: CMC rank
- `price`: USD price
- `marketCap`: Market cap in USD
- `volume24h`: 24h volume in USD
- `change24h`: 24h price change percentage

## Deployment 🚀

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `CMC_API_KEY`
   - `DATABASE_URL`
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Run Prisma generate
- Deploy to a global CDN

### Important Notes for Production

- Ensure your PostgreSQL database is accessible from Vercel's servers
- Consider using connection pooling (e.g., Supabase Pooler or PgBouncer)
- Set up a cron job to create daily snapshots automatically

## Usage Tips 💡

### Creating Daily Snapshots

For production, set up a cron job to hit the snapshot endpoint daily:

```bash
# Example: Daily at 00:00 UTC
curl -X POST https://your-domain.com/api/snapshots/today
```

Or use Vercel Cron Jobs in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/snapshots/today",
    "schedule": "0 0 * * *"
  }]
}
```

### Filtering and Sorting

The Top 200 table supports:
- **Search**: Filter by coin name or symbol
- **Sort**: By rank, 24h %, market cap, volume, or rank change
- **Filters**: Minimum volume and market cap thresholds

### Understanding Rank Changes

- **Green ▲**: Rank improved (moved up)
- **Red ▼**: Rank decreased (moved down)
- **Orange 0**: No change
- **Blue NEW**: New to Top 200

## Troubleshooting 🔧

### "Failed to fetch global metrics"
- Check that your `CMC_API_KEY` is valid
- Verify you haven't exceeded your API rate limit
- Ensure your internet connection is stable

### "No snapshot found"
- Visit the dashboard to trigger automatic snapshot creation
- Or manually call `POST /api/snapshots/today`

### Database Connection Errors
- Verify your `DATABASE_URL` is correct
- Ensure your database is running and accessible
- Check that migrations have been run: `npx prisma migrate dev`

### TypeScript Errors
- Run `npx prisma generate` to regenerate Prisma Client
- Delete `node_modules` and `.next`, then run `npm install`

## Future Enhancements 🔮

- [ ] News integration with CryptoPanic API
- [ ] Historical charts and trend analysis
- [ ] Portfolio tracking
- [ ] Price alerts and notifications
- [ ] Multi-timeframe comparisons (weekly, monthly)
- [ ] Export data to CSV
- [ ] Mobile app version

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License.

## Acknowledgments 🙏

- [CoinMarketCap](https://coinmarketcap.com/) for providing the crypto data API
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [TanStack Table](https://tanstack.com/table) for the powerful table component

---

Built with ❤️ for the crypto community

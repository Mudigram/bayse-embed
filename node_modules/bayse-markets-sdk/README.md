# Bayse-Markets SDK

[![npm version](https://badge.fury.io/js/bayse-markets-sdk.svg)](https://badge.fury.io/js/bayse-markets-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript SDK for the Bayse Markets prediction market API. Bayse is Nigeria's premier prediction market platform where users can trade on real-world events and outcomes.

## Features

- **Full TypeScript Support** - Complete type definitions for all API responses
- **Prediction Markets** - Access events, markets, and trading data
- **Portfolio Management** - Track positions, balances, and trading history
- **Real-time Streaming** - WebSocket connections for live market data
-**Secure Authentication** - API key-based authentication with proper error handling
- **Comprehensive Testing** - Smoke tests and integration tests included

## Installation

```bash
npm install bayse-markets-sdk
```

## Quick Start

### 1. Get Your API Keys

1. Sign up for a Bayse account at [bayse.markets](https://bayse.markets)
2. Generate API keys from your account settings
3. Store them securely (never commit to version control)

### 2. Initialize the Client

```typescript
import BayseClient from 'bayse-markets-sdk';

const bayse = new BayseClient({
  publicKey: process.env.BAYSE_PUBLIC_KEY!,
  secretKey: process.env.BAYSE_SECRET_KEY!,
});
```

### 3. Fetch Open Events

```typescript
// Get all open prediction markets
const result = await bayse.events.getAll({
  status: 'open',
  size: 10,
});

console.log(`Found ${result.events.length} open events`);

// Example output:
// Found 5 open events
```

### 4. Get Market Details

```typescript
// Get details for a specific event
const event = await bayse.events.getById('event-id-here');

console.log(`${event.title}`);
// Show YES/NO prices for the first market
if (event.markets.length > 0) {
  const market = event.markets[0];
  console.log(`YES: ${market.outcome1Price} | NO: ${market.outcome2Price}`);
}
```

### 5. Real-time Market Data

```typescript
// Connect to real-time market updates
const stream = bayse.stream.markets();

stream.on('data', (data) => {
  console.log('Market update:', data);
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});

// Connect to a specific market
await stream.connect('market-id-here');
```

## API Reference

### Events
```typescript
// List open events
const { events, pagination } = await bayse.events.getAll({
  status: 'open',
  category: 'sports',
  size: 20,
})

// Get single event
const event = await bayse.events.getById('evt_123')

// Get by slug
const event = await bayse.events.getBySlug('super-eagles-afcon-2026')

// Price history
const history = await bayse.events.getPriceHistory('evt_123')
```

### Markets
```typescript
// Get ticker
const ticker = await bayse.markets.getTicker('mkt_123')

// Get order book
const books = await bayse.markets.getOrderBook(['outcome_id_1', 'outcome_id_2'])

// Get recent trades
const trades = await bayse.markets.getTrades({ marketId: 'mkt_123' })

// Get quote before trading
const quote = await bayse.markets.getQuote('evt_123', 'mkt_123', {
  side: 'BUY',
  outcome: 'YES',
  amount: 100,
  currency: 'NGN',
})
// quote.expectedShares, quote.total, quote.fee
```

### Orders
```typescript
// Place an order
const order = await bayse.orders.place('evt_123', 'mkt_123', {
  side: 'BUY',
  outcome: 'YES',
  amount: 100,
  currency: 'NGN',
})

// AMM markets fill instantly
console.log(order.ammOrder?.id)

// Cancel an order (CLOB only)
await bayse.orders.cancel('ord_123')

// View your orders
const { data, pagination } = await bayse.orders.getAll({ status: 'open' })
```

### Portfolio & Wallet
```typescript
// Your open positions
const positions = await bayse.portfolio.getPositions()

// Your trade history
const { data } = await bayse.portfolio.getActivities({ page: 1, size: 20 })

// Your wallet balances
const { assets } = await bayse.wallet.getAssets()
assets.forEach(a => console.log(`${a.symbol}: ${a.availableBalance}`))
```

### WebSockets — Real-time Data
```typescript
// Market prices and activity
const feed = bayse.stream.markets()
await feed.connect()

feed.subscribePrices('evt_123', (data) => {
  console.log('Price update:', data)
})

feed.subscribeActivity('evt_123', (data) => {
  console.log('Trade:', data)
})

feed.subscribeOrderbook(['mkt_123'], 'NGN', (data) => {
  console.log('Orderbook:', data)
})

// Handle server-side errors
feed.onError = (message) => {
  console.error('Stream error:', message)
}

// Disconnect when done
feed.disconnect()
```
```typescript
// Live asset prices — crypto and FX
const prices = bayse.stream.realtime()
await prices.connect()

// USD/NGN live rate
prices.subscribeAssetPrices(['USDNGN'], (data) => {
  console.log('USD/NGN:', data)
})

// Available: BTCUSDT, ETHUSDT, SOLUSDT, XAUUSD, EURUSD, GBPUSD, USDNGN
```

### Streaming

#### Markets Stream
```typescript
const stream = bayse.stream.markets();
await stream.connect(marketId);
```

#### Real-time Stream
```typescript
const stream = bayse.stream.realtime();
await stream.connect();
```

## Configuration

```typescript
interface BayseConfig {
  publicKey: string;        // Required: Your public API key
  secretKey: string;        // Required: Your secret API key
  baseUrl?: string;         // Optional: Defaults to https://relay.bayse.markets
}
```

## Error Handling

The SDK throws typed errors for different scenarios:

```typescript
import {
  BayseApiError,
  BayseAuthError,
  BayseRateLimitError,
  BayseNotFoundError
} from 'bayse-markets-sdk';

try {
  const result = await bayse.events.getAll();
} catch (error) {
  if (error instanceof BayseAuthError) {
    console.log('Authentication failed');
  } else if (error instanceof BayseRateLimitError) {
    console.log('Rate limit exceeded, retry later');
  } else if (error instanceof BayseNotFoundError) {
    console.log('Resource not found');
  } else {
    console.log('API error:', error.message);
  }
}
```

## Testing

### Smoke Test

Run the included smoke test to verify your setup:

```bash
# Set your API keys in .env first
echo "BAYSE_PUBLIC_KEY=your_public_key_here" > .env
echo "BAYSE_SECRET_KEY=your_secret_key_here" >> .env

# Run the smoke test
npm test
```

### Integration Tests

```bash
# Run integration tests
npx ts-node tests/integration.ts
```

### WebSocket Tests

```bash
# Test WebSocket connections
npx ts-node tests/websocket.ts
```

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Project Structure

```
src/
├── index.ts          # Main entry point
├── client.ts         # HTTP client
├── auth.ts           # Authentication utilities
├── utils.ts          # Helper functions
├── types/            # TypeScript definitions
├── modules/          # API modules
│   ├── events.ts
│   ├── markets.ts
│   ├── orders.ts
│   ├── portfolio.ts
│   ├── wallet.ts
│   └── system.ts
└── websocket/        # WebSocket streaming
    ├── markets.ts
    └── realtime.ts
```

## Contributing
This is a community SDK built during the Bayse Public API Beta.
Issues and PRs welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add my feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.bayse.markets)
- 🐛 [Issues](https://github.com/Mudigram/bayse-markets-sdk/issues)
- 💬 [Discussions](https://github.com/Mudigram/bayse-markets-sdk/discussions)

---

Built by [@Mudigram](https://github.com/Mudigram) · 
Not officially affiliated with Bayse Markets
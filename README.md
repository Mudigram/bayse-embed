# bayse-embed

A lightweight, framework-agnostic library for embedding real-time prediction market widgets from [Bayse Markets](https://bayse.markets).  Includes a standalone <bayse-market> HTML custom element and a native React <BayseMarket /> component.

## Features

- **Zero-config**: Drop the script and add a tag. No build step required.
- **Framework-agnostic**: Works with React, Vue, Svelte, or vanilla HTML.
- **Real-time updates**: Live prices and order book data via WebSocket.
- **Customizable**: Two card sizes (full and compact) and currency selection.
- **Lightweight**: Under 5KB (gzipped) and no heavy dependencies.

## Quick start

### Script tag (any website)
```html
<script src="https://cdn.bayse.markets/embed.js"></script>
<bayse-market slug="your-market-slug"></bayse-market>
```

### React
```bash
npm install bayse-embed
```
```tsx
import { BayseMarket } from 'bayse-embed'

<BayseMarket slug="your-market-slug" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| slug | string | — | Required. Market slug from Bayse |
| variant | "full" \| "compact" | "full" | Card size |
| currency | "USD" \| "NGN" | "USD" | Price currency |
| onTrade | (slug: string) => void | Opens Bayse | React only |

## Development
```bash
npm install
npm run build        # React library
npm run build:embed  # Standalone embed.js
npx vite             # Demo site on localhost:5173
```
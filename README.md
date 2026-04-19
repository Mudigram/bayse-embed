# bayse-embed

Embeddable prediction market widgets for [Bayse Markets](https://bayse.markets).

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
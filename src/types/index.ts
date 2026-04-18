export type EventStatus = 'open' | 'closed' | 'resolved' | 'cancelled' | 'paused' | 'draft'
export type EventType = 'single' | 'combined' | 'grouped'
export type MarketEngine = 'AMM' | 'CLOB'
export type Currency = 'USD' | 'NGN'

export interface MarketData {
    id: string
    title: string
    status: EventStatus
    outcome1Id: string
    outcome1Label: string
    outcome1Price: number
    outcome2Id: string
    outcome2Label: string
    outcome2Price: number
    yesBuyPrice: number
    noBuyPrice: number
    feePercentage: number
    totalOrders: number
    rules: string
    marketThreshold?: number
}

export interface BayseEvent {
    id: string
    slug: string
    title: string
    category: string
    type: EventType
    engine: MarketEngine
    status: EventStatus
    openingDate: string
    closingDate: string
    resolutionDate: string
    assetSymbolPair?: string
    eventThreshold?: number
    seriesSlug?: string
    liquidity: number
    totalVolume: number
    totalOrders: number
    supportedCurrencies: Currency[]
    markets: MarketData[]
}

export interface MarketPrice {
    outcome1Label: string
    outcome1Price: number
    outcome2Label: string
    outcome2Price: number
}

export interface PriceUpdateMessage {
    type: 'price_update'
    data: {
        id: string
        slug: string
        markets: Array<{
            id: string
            prices: Record<string, number>
        }>
    }
    timestamp: number
}

export interface ActivityOrderMessage {
    type: 'buy_order' | 'sell_order'
    data: {
        user: {
            id: string
            tag: string | null
            imageUrl: string | null
        }
        order: {
            id: string
            amount: number
            quantity: number
            price: number
            outcome: string
            outcomeLabel: string
            currency: Currency
            createdAt: string
        }
        event: {
            id: string
            slug: string
            title: string
        }
        market: {
            id: string
            title: string
        }
    }
    timestamp: number
}

export type WebSocketMessage = PriceUpdateMessage | ActivityOrderMessage

export interface MarketState {
    event: BayseEvent | null
    market: MarketData | null
    prices: MarketPrice | null
    loading: boolean
    error: string | null
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface BayseMarketProps {
    slug: string
    variant?: 'full' | 'compact'
    currency?: Currency
    onTrade?: (slug: string) => void
}
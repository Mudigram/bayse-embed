import { useState, useEffect } from 'react'
import { BayseEvent, MarketData, MarketPrice, MarketState, Currency } from '../types'

const BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/api/v1'
    : 'https://relay.bayse.markets/v1'

function extractPrices(market: MarketData): MarketPrice {
    return {
        outcome1Label: market.outcome1Label,
        outcome1Price: market.outcome1Price,
        outcome2Label: market.outcome2Label,
        outcome2Price: market.outcome2Price
    }
}

function resolveError(status: number, slug: string): string {
    switch (status) {
        case 404: return `Market "${slug}" not found — check the slug is correct`
        case 429: return 'Too many requests — please try again in a moment'
        case 500: return 'Bayse API is having issues — try again shortly'
        default: return `Failed to load market (${status})`
    }
}

export function useBayseMarket(slug: string, currency: Currency = 'USD'): MarketState {
    const [state, setState] = useState<MarketState>({
        event: null,
        market: null,
        prices: null,
        loading: true,
        error: null
    })

    useEffect(() => {
        if (!slug) return

        let cancelled = false

        async function fetchMarket() {
            setState(prev => ({ ...prev, loading: true, error: null }))

            try {
                const res = await fetch(
                    `${BASE_URL}/pm/events/slug/${slug}?currency=${currency}`
                )

                if (!res.ok) {
                    throw new Error(resolveError(res.status, slug))
                }

                const event: BayseEvent = await res.json()
                const market: MarketData | undefined = event.markets[0]

                if (!market) {
                    throw new Error(`No markets found for "${slug}"`)
                }

                if (!cancelled) {
                    setState({
                        event,
                        market,
                        prices: extractPrices(market),
                        loading: false,
                        error: null
                    })
                }
            } catch (err) {
                if (!cancelled) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: err instanceof Error ? err.message : 'Something went wrong'
                    }))
                }
            }
        }

        fetchMarket()

        return () => { cancelled = true }
    }, [slug, currency])

    return state
}
import { useState, useCallback } from 'react'
import { BayseMarketProps, MarketPrice, MarketState } from '../types'
import { useBayseMarket } from '../hooks/useBayseMarkets'
import { useBayseStream } from '../hooks/useBayseStream'

const TRADE_BASE_URL = 'https://bayse.markets/events'

function formatPrice(price: number): string {
    return `${Math.round(price * 100)}¢`
}

function formatProbability(price: number): string {
    return `${Math.round(price * 100)}%`
}

function formatVolume(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

function LiveDot({ status }: { status: string }) {
    const isLive = status === 'connected'
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 500,
            padding: '2px 7px',
            borderRadius: '4px',
            background: isLive ? '#EAF3DE' : '#F1EFE8',
            color: isLive ? '#3B6D11' : '#5F5E5A'
        }}>
            <span style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: isLive ? '#639922' : '#888780',
                display: 'inline-block',
                animation: isLive ? 'bayse-pulse 1.8s infinite' : 'none'
            }} />
            {isLive ? 'Live' : 'Connecting'}
        </span>
    )
}

function ProbabilityBar({ outcome1Price }: { outcome1Price: number }) {
    const pct = Math.round(outcome1Price * 100)
    return (
        <div style={{
            height: '6px',
            background: '#D3D1C7',
            borderRadius: '3px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: `${pct}%`,
                background: '#1D9E75',
                borderRadius: '3px 0 0 3px',
                transition: 'width 0.4s ease'
            }} />
            <div style={{
                position: 'absolute',
                right: 0, top: 0, bottom: 0,
                width: `${100 - pct}%`,
                background: '#E24B4A',
                borderRadius: '0 3px 3px 0'
            }} />
        </div>
    )
}

function LoadingCard() {
    return (
        <div style={cardStyle}>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[120, 80, 40].map((width, i) => (
                    <div key={i} style={{
                        height: '14px',
                        width: `${width}px`,
                        background: '#D3D1C7',
                        borderRadius: '4px',
                        opacity: 0.6
                    }} />
                ))}
            </div>
        </div>
    )
}

function ErrorCard({ message }: { message: string }) {
    return (
        <div style={{ ...cardStyle, padding: '16px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#A32D2D' }}>{message}</p>
        </div>
    )
}

const cardStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: 'var(--color-background-primary, #ffffff)',
    border: '0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))',
    borderRadius: '12px',
    overflow: 'hidden',
    maxWidth: '420px',
    width: '100%'
}

function FullCard({
    state,
    prices,
    streamStatus,
    onTrade,
    slug
}: {
    state: MarketState
    prices: MarketPrice
    streamStatus: string
    onTrade: () => void
    slug: string
}) {
    const { event, market } = state
    if (!event || !market) return null

    return (
        <div style={cardStyle}>

            <style>{`
        @keyframes bayse-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

            <div style={{
                padding: '14px 16px 12px',
                borderBottom: '0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))'
            }}>
                <div style={{ marginBottom: '8px' }}>
                    <LiveDot status={streamStatus} />
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 500, lineHeight: 1.45 }}>
                    {event.title}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary, #5F5E5A)' }}>
                    Resolves {formatDate(event.resolutionDate)} · {event.category}
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                padding: '14px 16px',
                borderBottom: '0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))'
            }}>
                {[
                    { label: prices.outcome1Label, price: prices.outcome1Price, color: '#0F6E56' },
                    { label: prices.outcome2Label, price: prices.outcome2Price, color: '#A32D2D' }
                ].map(({ label, price, color }) => (
                    <div key={label} style={{
                        background: 'var(--color-background-secondary, #F1EFE8)',
                        borderRadius: '8px',
                        padding: '10px 12px'
                    }}>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary, #5F5E5A)', letterSpacing: '0.02em' }}>
                            {label}
                        </p>
                        <p style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: 500, color, lineHeight: 1 }}>
                            {formatPrice(price)}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-secondary, #5F5E5A)' }}>
                            per share
                        </p>
                    </div>
                ))}
            </div>

            <div style={{
                padding: '12px 16px',
                borderBottom: '0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #5F5E5A)' }}>
                        Implied probability
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                        {formatProbability(prices.outcome1Price)} {prices.outcome1Label}
                    </span>
                </div>
                <ProbabilityBar outcome1Price={prices.outcome1Price} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: '10px 16px',
                borderBottom: '0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))'
            }}>
                {[
                    { label: '24h volume', value: formatVolume(event.totalVolume) },
                    { label: 'Liquidity', value: formatVolume(event.liquidity) }
                ].map(({ label, value }, i) => (
                    <div key={label} style={{
                        paddingRight: i === 0 ? '16px' : 0,
                        paddingLeft: i === 1 ? '16px' : 0,
                        borderRight: i === 0 ? '0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))' : 'none'
                    }}>
                        <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'var(--color-text-secondary, #5F5E5A)' }}>
                            {label}
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary, #5F5E5A)' }}>
                    bayse.markets
                </span>
                <button
                    onClick={onTrade}
                    style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#3C3489',
                        background: '#EEEDFE',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        cursor: 'pointer'
                    }}
                >
                    Trade on Bayse →
                </button>
            </div>

        </div>
    )
}

function CompactCard({
    state,
    prices,
    onTrade
}: {
    state: MarketState
    prices: MarketPrice
    onTrade: () => void
}) {
    const { event } = state
    if (!event) return null

    return (
        <div style={{ ...cardStyle, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, lineHeight: 1.4 }}>
                {event.title}
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F6E56' }}>
                    {prices.outcome1Label} {formatPrice(prices.outcome1Price)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary, #5F5E5A)' }}>·</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#A32D2D' }}>
                    {prices.outcome2Label} {formatPrice(prices.outcome2Price)}
                </span>
            </div>
            <ProbabilityBar outcome1Price={prices.outcome1Price} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary, #5F5E5A)' }}>
                    Resolves {formatDate(event.resolutionDate)}
                </span>
                <button
                    onClick={onTrade}
                    style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        color: '#534AB7',
                        background: '#EEEDFE',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        cursor: 'pointer'
                    }}
                >
                    Trade →
                </button>
            </div>
        </div>
    )
}

export function BayseMarket({ slug, variant = 'full', currency = 'USD', onTrade }: BayseMarketProps) {
    const [livePrices, setLivePrices] = useState<MarketPrice | null>(null)

    const state = useBayseMarket(slug, currency)

    const handlePriceUpdate = useCallback((prices: MarketPrice) => {
        setLivePrices(prices)
    }, [])

    const { status } = useBayseStream({
        eventId: state.event?.id ?? null,
        marketId: state.market?.id ?? null,
        onPriceUpdate: handlePriceUpdate
    })

    const handleTrade = useCallback(() => {
        if (onTrade) {
            onTrade(slug)
        } else {
            window.open(`${TRADE_BASE_URL}/${slug}`, '_blank', 'noopener,noreferrer')
        }
    }, [slug, onTrade])

    if (state.loading) return <LoadingCard />
    if (state.error) return <ErrorCard message={state.error} />

    const prices = livePrices ?? state.prices
    if (!prices) return null

    if (variant === 'compact') {
        return <CompactCard state={state} prices={prices} onTrade={handleTrade} />
    }

    return (
        <FullCard
            state={state}
            prices={prices}
            streamStatus={status}
            onTrade={handleTrade}
            slug={slug}
        />
    )
}
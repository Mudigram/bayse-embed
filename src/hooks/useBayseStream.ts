import { useEffect, useRef, useState } from 'react'
import { MarketPrice, PriceUpdateMessage, ConnectionStatus } from '../types'

const WS_URL = 'wss://socket.bayse.markets/ws/v1/markets'
const MAX_BACKOFF = 30000

interface UseBayseStreamOptions {
    eventId: string | null
    marketId: string | null
    onPriceUpdate: (prices: MarketPrice) => void
}

interface UseBayseStreamResult {
    status: ConnectionStatus
    serverError: string | null
}

export function useBayseStream({
    eventId,
    marketId,
    onPriceUpdate
}: UseBayseStreamOptions): UseBayseStreamResult {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected')
    const [serverError, setServerError] = useState<string | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const attemptRef = useRef(0)
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const mountedRef = useRef(true)
    const onPriceUpdateRef = useRef(onPriceUpdate)

    useEffect(() => {
        onPriceUpdateRef.current = onPriceUpdate
    }, [onPriceUpdate])

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (!eventId || !marketId) return

        mountedRef.current = true

        function clearReconnectTimer() {
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current)
                reconnectTimerRef.current = null
            }
        }

        function subscribe(ws: WebSocket) {
            ws.send(JSON.stringify({
                type: 'subscribe',
                channel: 'prices',
                eventId
            }))
        }

        function handleMessage(event: MessageEvent) {
            const lines = event.data.split('\n')

            for (const line of lines) {
                if (!line.trim()) continue

                let msg: any
                try {
                    msg = JSON.parse(line)
                } catch {
                    continue
                }

                if (msg.type === 'error') {
                    setServerError(msg.data?.message ?? 'WebSocket error')
                    return
                }

                if (msg.type === 'price_update') {
                    const update = msg as PriceUpdateMessage
                    const marketUpdate = update.data.markets.find(m => m.id === marketId)
                    if (!marketUpdate) return

                    const prices = marketUpdate.prices
                    const labels = Object.keys(prices)
                    if (labels.length < 2) return

                    const [label1, label2] = labels
                    const newPrices: MarketPrice = {
                        outcome1Label: label1,
                        outcome1Price: prices[label1],
                        outcome2Label: label2,
                        outcome2Price: prices[label2]
                    }

                    onPriceUpdateRef.current(newPrices)
                }
            }
        }

        function connect() {
            if (!mountedRef.current) return

            setStatus('connecting')
            setServerError(null)

            const ws = new WebSocket(WS_URL)
            wsRef.current = ws

            ws.addEventListener('open', () => {
                if (!mountedRef.current) { ws.close(); return }
                attemptRef.current = 0
                setStatus('connected')
                subscribe(ws)
            })

            ws.addEventListener('message', handleMessage)

            ws.addEventListener('close', () => {
                if (!mountedRef.current) return
                setStatus('disconnected')

                const delay = Math.min(1000 * 2 ** attemptRef.current, MAX_BACKOFF)
                attemptRef.current++

                reconnectTimerRef.current = setTimeout(connect, delay)
            })

            ws.addEventListener('error', () => {
                setStatus('error')
                ws.close()
            })
        }

        connect()

        return () => {
            mountedRef.current = false
            clearReconnectTimer()
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
        }
    }, [eventId, marketId])

    return { status, serverError }
}
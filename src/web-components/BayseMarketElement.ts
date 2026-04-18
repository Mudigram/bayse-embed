import React from 'react'
import ReactDOM from 'react-dom/client'
import { BayseMarket } from '../components/BayseMarket'
import type { Currency } from '../types'

const OBSERVED_ATTRIBUTES = ['slug', 'variant', 'currency'] as const
type ObservedAttribute = typeof OBSERVED_ATTRIBUTES[number]

class BayseMarketElement extends HTMLElement {
    private root: ReactDOM.Root | null = null
    private mountPoint: HTMLDivElement | null = null

    static get observedAttributes(): string[] {
        return [...OBSERVED_ATTRIBUTES]
    }

    connectedCallback() {
        console.log('[bayse] connectedCallback fired, slug:', this.getAttribute('slug'))

        this.mountPoint = document.createElement('div')
        this.mountPoint.style.cssText = 'display:block;width:100%;min-height:20px;'

        const shadow = this.attachShadow({ mode: 'open' })
        shadow.appendChild(this.mountPoint)

        console.log('[bayse] shadow root created, mount point appended')

        try {
            this.root = ReactDOM.createRoot(this.mountPoint)
            console.log('[bayse] React root created')
            this.render()
        } catch (err) {
            console.error('[bayse] failed to create React root:', err)
        }
    }

    disconnectedCallback() {
        console.log('[bayse] disconnectedCallback fired')
        if (this.root) {
            this.root.unmount()
            this.root = null
        }
    }

    attributeChangedCallback(
        _name: ObservedAttribute,
        oldValue: string | null,
        newValue: string | null
    ) {
        console.log('[bayse] attribute changed:', _name, oldValue, '->', newValue)
        if (oldValue !== newValue && this.root) {
            this.render()
        }
    }

    private getProps() {
        const slug = this.getAttribute('slug') ?? ''
        const variant = this.getAttribute('variant') as 'full' | 'compact' | null
        const currency = this.getAttribute('currency') as Currency | null

        return {
            slug,
            variant: variant ?? 'full',
            currency: currency ?? 'USD'
        }
    }

    private render() {
        if (!this.root) {
            console.error('[bayse] render called but root is null')
            return
        }

        const props = this.getProps()
        console.log('[bayse] rendering with props:', props)

        if (!props.slug) {
            this.root.render(
                React.createElement('p', {
                    style: { fontSize: '13px', color: '#A32D2D', margin: 0, padding: '12px' }
                }, 'bayse-market: slug attribute is required')
            )
            return
        }

        try {
            this.root.render(React.createElement(BayseMarket, props))
            console.log('[bayse] React.createElement rendered')
        } catch (err) {
            console.error('[bayse] render failed:', err)
        }
    }
}

if (typeof window !== 'undefined' && !customElements.get('bayse-market')) {
    console.log('[bayse] registering custom element')
    customElements.define('bayse-market', BayseMarketElement)
    console.log('[bayse] custom element registered')
} else {
    console.log('[bayse] custom element already registered or no window')
}

export { BayseMarketElement }
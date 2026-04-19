const API_BASE = '/api/v1'
const CDN_URL = 'https://cdn.bayse.markets/embed.js'

/* ─── State ─────────────────────────────────────────────────── */
const state = {
    events: [],
    filtered: [],
    loading: true,
    currency: 'USD',
    category: 'all',
    search: '',
    selected: null,
    variant: 'full',
    activePage: 'browse',
    activeDocsSection: 'overview',
    activeCodeTab: 'html'
}

/* ─── Formatting helpers ────────────────────────────────────── */
function getCurrencySymbol(currency) {
    return currency === 'NGN' ? '₦' : '$'
}

function formatPrice(price, currency) {
    const symbol = getCurrencySymbol(currency ?? state.currency)
    return `${symbol}${Math.round(price * 100)}¢`
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })
}

/**
 * Smart closing label — shows "Closed" if the date is in the past,
 * "Closes" if it's still in the future.
 */
function closingLabel(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    const past = d < new Date()
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (past) {
        return `<span class="closed-label">Closed ${formatted}</span>`
    }
    return `Closes ${formatted}`
}

function formatVolume(value, currency) {
    const symbol = getCurrencySymbol(currency)
    if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`
    return `${symbol}${value.toFixed(0)}`
}

/* ─── Theme ─────────────────────────────────────────────────── */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙'
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    localStorage.setItem('bayse-theme', next)
    applyTheme(next)
}

/* ─── Fetching ──────────────────────────────────────────────── */
async function fetchEvents() {
    state.loading = true
    renderGrid()
    try {
        const params = new URLSearchParams({ status: 'open', currency: state.currency })
        if (state.category !== 'all') params.set('category', state.category)
        if (state.search) params.set('keyword', state.search)

        const res = await fetch(`${API_BASE}/pm/events?${params}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        state.events = Array.isArray(data) ? data : (data.events ?? data.data ?? [])
        state.filtered = state.events
        state.loading = false
        renderGrid()
    } catch (err) {
        state.loading = false
        document.getElementById('events-grid').innerHTML = `
            <div class="empty-state">
                <p>⚠️ Failed to load markets — ${err.message}</p>
            </div>`
    }
}

/* ─── Filtering ─────────────────────────────────────────────── */
function applyFilters() {
    let results = [...state.events]

    if (state.search) {
        const q = state.search.toLowerCase()
        results = results.filter(e =>
            e.title?.toLowerCase().includes(q) || e.slug?.includes(q)
        )
    }

    if (state.category !== 'all') {
        results = results.filter(e =>
            e.category?.toLowerCase() === state.category.toLowerCase()
        )
    }

    state.filtered = results
    renderGrid()
}

/* ─── Grid render ───────────────────────────────────────────── */
function renderGrid() {
    const grid = document.getElementById('events-grid')

    if (state.loading) {
        grid.innerHTML = Array(6).fill(`
            <div class="skeleton-card">
                <div class="skeleton" style="height:11px;width:64px;margin-bottom:12px;border-radius:99px;"></div>
                <div class="skeleton" style="height:13px;width:90%;margin-bottom:6px;"></div>
                <div class="skeleton" style="height:13px;width:72%;margin-bottom:18px;"></div>
                <div style="display:flex;gap:8px;margin-bottom:12px">
                    <div class="skeleton" style="height:26px;width:80px;border-radius:99px;"></div>
                    <div class="skeleton" style="height:26px;width:68px;border-radius:99px;"></div>
                </div>
                <div class="skeleton" style="height:5px;margin-bottom:12px;border-radius:99px;"></div>
                <div class="skeleton" style="height:11px;width:90px;"></div>
            </div>`).join('')
        return
    }

    if (!state.filtered.length) {
        grid.innerHTML = `<div class="empty-state"><p>No open markets found</p></div>`
        return
    }

    grid.innerHTML = state.filtered.map(event => {
        const market = event.markets?.[0]
        if (!market) return ''

        const yes = market.outcome1Price ?? 0
        const no = market.outcome2Price ?? 0
        const yesPct = Math.round(yes * 100)
        const isSelected = state.selected?.slug === event.slug

        return `
            <div class="event-card${isSelected ? ' selected' : ''}"
                 onclick="selectEvent('${event.slug}')">
                <div class="event-card-top">
                    <span class="event-category">${event.category ?? 'General'}</span>
                    <span class="event-engine">${event.engine ?? 'AMM'}</span>
                </div>
                <p class="event-title">${event.title}</p>
                <div class="event-prices">
                    <span class="price-pill yes">${market.outcome1Label ?? 'YES'} ${formatPrice(yes)}</span>
                    <span class="price-pill no">${market.outcome2Label ?? 'NO'} ${formatPrice(no)}</span>
                </div>
                <div class="event-bar">
                    <div class="event-bar-yes" style="width:${yesPct}%"></div>
                    <div class="event-bar-no"  style="width:${100 - yesPct}%"></div>
                </div>
                <div class="event-meta">
                    <span class="event-meta-text">
                        Vol ${formatVolume(event.totalVolume ?? 0, state.currency)}
                        · ${closingLabel(event.closingDate)}
                    </span>
                    <button class="embed-btn"
                        onclick="event.stopPropagation(); openPanel('${event.slug}')">
                        Get embed →
                    </button>
                </div>
            </div>`
    }).join('')
}

/* ─── Selection + panel ─────────────────────────────────────── */
function selectEvent(slug) {
    state.selected = state.events.find(e => e.slug === slug) ?? null
    renderGrid()
}

function openPanel(slug) {
    state.selected = state.events.find(e => e.slug === slug) ?? null
    if (!state.selected) return

    document.getElementById('panel-title').textContent = state.selected.title
    renderPanel()
    document.getElementById('panel-overlay').classList.add('open')
    document.body.style.overflow = 'hidden'
}

function closePanel() {
    document.getElementById('panel-overlay').classList.remove('open')
    document.body.style.overflow = ''
}

function createPreviewIframe(slug, variant, currency) {
    const iframe = document.createElement('iframe')
    iframe.src = '/preview.html'
    iframe.style.cssText = `
        width: 100%;
        border: none;
        border-radius: 12px;
        min-height: ${variant === 'compact' ? '140px' : '320px'};
        transition: height 0.2s ease;
    `
    iframe.onload = () => {
        iframe.contentWindow.postMessage({
            type: 'bayse-render',
            slug,
            variant,
            currency
        }, '*')
    }
    return iframe
}

function renderPanel() {
    if (!state.selected) return
    const { slug } = state.selected
    const { variant, currency, activeCodeTab } = state

    const preview = document.getElementById('panel-preview')
    let iframe = preview.querySelector('iframe')
    if (!iframe) {
        iframe = createPreviewIframe(slug, variant, currency)
        preview.appendChild(iframe)
    } else {
        iframe.style.minHeight = variant === 'compact' ? '140px' : '320px'
        iframe.contentWindow.postMessage({ type: 'bayse-render', slug, variant, currency }, '*')
    }

    const htmlSnippet =
        `<!-- Step 1: add the script once per page -->
<script src="${CDN_URL}"><\/script>

<!-- Step 2: drop this where you want the embed -->
<bayse-market
  slug="${slug}"
  variant="${variant}"
  currency="${currency}"
></bayse-market>`

    const reactSnippet =
        `import { BayseMarket } from 'bayse-markets-embed'

<BayseMarket
  slug="${slug}"
  variant="${variant}"
  currency="${currency}"
/>`

    document.getElementById('code-content').textContent =
        activeCodeTab === 'html' ? htmlSnippet : reactSnippet
}

/* ─── Variant preview (docs) ────────────────────────────────── */
function updateVariantPreview(slug) {
    slug = (slug || 'will-carter-efe-defeat-portable').trim()

    const fullEl = document.getElementById('preview-full')
    const compactEl = document.getElementById('preview-compact')
    if (!fullEl || !compactEl) return

    let fullIframe = fullEl.querySelector('iframe')
    if (!fullIframe) {
        fullEl.appendChild(createPreviewIframe(slug, 'full', state.currency))
    } else {
        fullIframe.contentWindow.postMessage({ type: 'bayse-render', slug, variant: 'full', currency: state.currency }, '*')
    }

    let compactIframe = compactEl.querySelector('iframe')
    if (!compactIframe) {
        compactEl.appendChild(createPreviewIframe(slug, 'compact', state.currency))
    } else {
        compactIframe.contentWindow.postMessage({ type: 'bayse-render', slug, variant: 'compact', currency: state.currency }, '*')
    }
}

/* ─── Controls ──────────────────────────────────────────────── */
function setVariant(v) {
    state.variant = v
    document.querySelectorAll('.variant-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.variant === v)
    })
    renderPanel()
}

function setCodeTab(tab) {
    state.activeCodeTab = tab
    document.querySelectorAll('.code-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab)
    })
    renderPanel()
}

function copyCode() {
    const code = document.getElementById('code-content').textContent
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copy-btn')
        btn.textContent = 'Copied!'
        btn.classList.add('copied')
        setTimeout(() => {
            btn.textContent = 'Copy'
            btn.classList.remove('copied')
        }, 2000)
    })
}

function setCurrency(c) {
    state.currency = c
    document.querySelectorAll('.currency-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.currency === c)
    })
    fetchEvents()
}

function setCategory(cat) {
    state.category = cat
    document.querySelectorAll('.cat-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === cat)
    })
    applyFilters()
}

function setSearch(q) {
    state.search = q
    applyFilters()
}

function showPage(page) {
    state.activePage = page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.dataset.page === page)
    })
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page)
    })
    // Initialise the variant preview when switching to docs
    if (page === 'docs' && state.activeDocsSection === 'variants') {
        const slug = document.getElementById('preview-slug')?.value
        updateVariantPreview(slug)
    }
}

function showDocsSection(section) {
    state.activeDocsSection = section
    document.querySelectorAll('.docs-nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.section === section)
    })
    document.querySelectorAll('.docs-section').forEach(s => {
        s.style.display = s.dataset.section === section ? 'block' : 'none'
    })
    if (section === 'variants') {
        const slug = document.getElementById('preview-slug')?.value
        updateVariantPreview(slug)
    }
}

/* ─── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Restore theme preference
    const savedTheme = localStorage.getItem('bayse-theme') ?? 'light'
    applyTheme(savedTheme)

    fetchEvents()
    showPage('browse')
    showDocsSection('overview')
})
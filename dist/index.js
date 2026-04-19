import { jsx as r, jsxs as i } from "react/jsx-runtime";
import { useState as g, useEffect as k, useRef as x, useCallback as z } from "react";
const _ = typeof window < "u" && window.location.hostname === "localhost" ? "/api/v1" : "https://relay.bayse.markets/v1";
function N(e) {
  return {
    outcome1Label: e.outcome1Label,
    outcome1Price: e.outcome1Price,
    outcome2Label: e.outcome2Label,
    outcome2Price: e.outcome2Price
  };
}
function I(e, t) {
  switch (e) {
    case 404:
      return `Market "${t}" not found — check the slug is correct`;
    case 429:
      return "Too many requests — please try again in a moment";
    case 500:
      return "Bayse API is having issues — try again shortly";
    default:
      return `Failed to load market (${e})`;
  }
}
function O(e, t = "USD") {
  const [o, s] = g({
    event: null,
    market: null,
    prices: null,
    loading: !0,
    error: null
  });
  return k(() => {
    if (!e) return;
    let a = !1;
    async function f() {
      s((n) => ({ ...n, loading: !0, error: null }));
      try {
        const n = await fetch(
          `${_}/pm/events/slug/${e}?currency=${t}`
        );
        if (!n.ok)
          throw new Error(I(n.status, e));
        const d = await n.json(), c = d.markets[0];
        if (!c)
          throw new Error(`No markets found for "${e}"`);
        a || s({
          event: d,
          market: c,
          prices: N(c),
          loading: !1,
          error: null
        });
      } catch (n) {
        a || s((d) => ({
          ...d,
          loading: !1,
          error: n instanceof Error ? n.message : "Something went wrong"
        }));
      }
    }
    return f(), () => {
      a = !0;
    };
  }, [e, t]), o;
}
const q = "wss://socket.bayse.markets/ws/v1/markets", H = 3e4;
function J({
  eventId: e,
  marketId: t,
  onPriceUpdate: o
}) {
  const [s, a] = g("disconnected"), [f, n] = g(null), d = x(null), c = x(0), p = x(null), l = x(!0), m = x(o);
  return k(() => {
    m.current = o;
  }, [o]), k(() => {
    if (typeof window > "u" || !e || !t) return;
    l.current = !0;
    function h() {
      p.current && (clearTimeout(p.current), p.current = null);
    }
    function v(u) {
      u.send(JSON.stringify({
        type: "subscribe",
        channel: "prices",
        eventId: e
      }));
    }
    function T(u) {
      var F;
      const E = u.data.split(`
`);
      for (const L of E) {
        if (!L.trim()) continue;
        let y;
        try {
          y = JSON.parse(L);
        } catch {
          continue;
        }
        if (y.type === "error") {
          n(((F = y.data) == null ? void 0 : F.message) ?? "WebSocket error");
          return;
        }
        if (y.type === "price_update") {
          const R = y.data.markets.find((j) => j.id === t);
          if (!R) return;
          const S = R.prices, P = Object.keys(S);
          if (P.length < 2) return;
          const [A, $] = P, U = {
            outcome1Label: A,
            outcome1Price: S[A],
            outcome2Label: $,
            outcome2Price: S[$]
          };
          m.current(U);
        }
      }
    }
    function D() {
      if (!l.current) return;
      a("connecting"), n(null);
      const u = new WebSocket(q);
      d.current = u, u.addEventListener("open", () => {
        if (!l.current) {
          u.close();
          return;
        }
        c.current = 0, a("connected"), v(u);
      }), u.addEventListener("message", T), u.addEventListener("close", () => {
        if (!l.current) return;
        a("disconnected");
        const E = Math.min(1e3 * 2 ** c.current, H);
        c.current++, p.current = setTimeout(D, E);
      }), u.addEventListener("error", () => {
        a("error"), u.close();
      });
    }
    return D(), () => {
      l.current = !1, h(), d.current && (d.current.close(), d.current = null);
    };
  }, [e, t]), { status: s, serverError: f };
}
const K = "https://bayse.markets/events";
function B(e) {
  return e === "NGN" ? "₦" : "$";
}
function w(e, t) {
  return `${B(t)}${Math.round(e * 100)}`;
}
function V(e) {
  return `${Math.round(e * 100)}%`;
}
function C(e, t) {
  const o = B(t);
  return e >= 1e6 ? `${o}${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `${o}${(e / 1e3).toFixed(1)}K` : `${o}${e.toFixed(0)}`;
}
function W(e) {
  return new Date(e).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function G({ status: e }) {
  const t = e === "connected";
  return /* @__PURE__ */ i("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 500,
    padding: "2px 7px",
    borderRadius: "4px",
    background: t ? "#EAF3DE" : "#F1EFE8",
    color: t ? "#3B6D11" : "#5F5E5A"
  }, children: [
    /* @__PURE__ */ r("span", { style: {
      width: "5px",
      height: "5px",
      borderRadius: "50%",
      background: t ? "#639922" : "#888780",
      display: "inline-block",
      animation: t ? "bayse-pulse 1.8s infinite" : "none"
    } }),
    t ? "Live" : "Connecting"
  ] });
}
function M({ outcome1Price: e }) {
  const t = Math.round(e * 100);
  return /* @__PURE__ */ i("div", { style: {
    height: "6px",
    background: "#D3D1C7",
    borderRadius: "3px",
    overflow: "hidden",
    position: "relative"
  }, children: [
    /* @__PURE__ */ r("div", { style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: `${t}%`,
      background: "#1D9E75",
      borderRadius: "3px 0 0 3px",
      transition: "width 0.4s ease"
    } }),
    /* @__PURE__ */ r("div", { style: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: `${100 - t}%`,
      background: "#E24B4A",
      borderRadius: "0 3px 3px 0"
    } })
  ] });
}
function X() {
  return /* @__PURE__ */ r("div", { style: b, children: /* @__PURE__ */ r("div", { style: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }, children: [120, 80, 40].map((e, t) => /* @__PURE__ */ r("div", { style: {
    height: "14px",
    width: `${e}px`,
    background: "#D3D1C7",
    borderRadius: "4px",
    opacity: 0.6
  } }, t)) }) });
}
function Q({ message: e }) {
  return /* @__PURE__ */ r("div", { style: { ...b, padding: "16px" }, children: /* @__PURE__ */ r("p", { style: { margin: 0, fontSize: "13px", color: "#A32D2D" }, children: e }) });
}
const b = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  background: "var(--color-background-primary, #ffffff)",
  border: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))",
  borderRadius: "12px",
  overflow: "hidden",
  maxWidth: "420px",
  width: "100%"
};
function Y({
  state: e,
  prices: t,
  streamStatus: o,
  onTrade: s,
  slug: a,
  currency: f
}) {
  const { event: n, market: d } = e;
  return !n || !d ? null : /* @__PURE__ */ i("div", { style: b, children: [
    /* @__PURE__ */ r("style", { children: `
        @keyframes bayse-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      ` }),
    /* @__PURE__ */ i("div", { style: {
      padding: "14px 16px 12px",
      borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))"
    }, children: [
      /* @__PURE__ */ r("div", { style: { marginBottom: "8px" }, children: /* @__PURE__ */ r(G, { status: o }) }),
      /* @__PURE__ */ r("p", { style: { margin: "0 0 4px", fontSize: "14px", fontWeight: 500, lineHeight: 1.45 }, children: n.title }),
      /* @__PURE__ */ i("p", { style: { margin: 0, fontSize: "12px", color: "var(--color-text-secondary, #5F5E5A)" }, children: [
        "Resolves ",
        W(n.resolutionDate),
        " · ",
        n.category
      ] })
    ] }),
    /* @__PURE__ */ r("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      padding: "14px 16px",
      borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))"
    }, children: [
      { label: t.outcome1Label, price: t.outcome1Price, color: "#0F6E56" },
      { label: t.outcome2Label, price: t.outcome2Price, color: "#A32D2D" }
    ].map(({ label: c, price: p, color: l }) => /* @__PURE__ */ i("div", { style: {
      background: "var(--color-background-secondary, #F1EFE8)",
      borderRadius: "8px",
      padding: "10px 12px"
    }, children: [
      /* @__PURE__ */ r("p", { style: { margin: "0 0 4px", fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary, #5F5E5A)", letterSpacing: "0.02em" }, children: c }),
      /* @__PURE__ */ r("p", { style: { margin: "0 0 3px", fontSize: "22px", fontWeight: 500, color: l, lineHeight: 1 }, children: w(p, f) }),
      /* @__PURE__ */ r("p", { style: { margin: 0, fontSize: "11px", color: "var(--color-text-secondary, #5F5E5A)" }, children: "per share" })
    ] }, c)) }),
    /* @__PURE__ */ i("div", { style: {
      padding: "12px 16px",
      borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))"
    }, children: [
      /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "7px" }, children: [
        /* @__PURE__ */ r("span", { style: { fontSize: "12px", color: "var(--color-text-secondary, #5F5E5A)" }, children: "Implied probability" }),
        /* @__PURE__ */ i("span", { style: { fontSize: "13px", fontWeight: 500 }, children: [
          V(t.outcome1Price),
          " ",
          t.outcome1Label
        ] })
      ] }),
      /* @__PURE__ */ r(M, { outcome1Price: t.outcome1Price })
    ] }),
    /* @__PURE__ */ r("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      padding: "10px 16px",
      borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))"
    }, children: [
      { label: "24h volume", value: C(n.totalVolume, f) },
      { label: "Liquidity", value: C(n.liquidity, f) }
    ].map(({ label: c, value: p }, l) => /* @__PURE__ */ i("div", { style: {
      paddingRight: l === 0 ? "16px" : 0,
      paddingLeft: l === 1 ? "16px" : 0,
      borderRight: l === 0 ? "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))" : "none"
    }, children: [
      /* @__PURE__ */ r("p", { style: { margin: "0 0 2px", fontSize: "11px", color: "var(--color-text-secondary, #5F5E5A)" }, children: c }),
      /* @__PURE__ */ r("p", { style: { margin: 0, fontSize: "13px", fontWeight: 500 }, children: p })
    ] }, c)) }),
    /* @__PURE__ */ i("div", { style: {
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }, children: [
      /* @__PURE__ */ r("span", { style: { fontSize: "11px", color: "var(--color-text-secondary, #5F5E5A)" }, children: "bayse.markets" }),
      /* @__PURE__ */ r(
        "button",
        {
          onClick: s,
          style: {
            fontSize: "12px",
            fontWeight: 500,
            color: "#3C3489",
            background: "#EEEDFE",
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px",
            cursor: "pointer"
          },
          children: "Trade on Bayse →"
        }
      )
    ] })
  ] });
}
function Z({
  state: e,
  prices: t,
  onTrade: o,
  currency: s
}) {
  const { event: a } = e;
  return a ? /* @__PURE__ */ i("div", { style: { ...b, padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px" }, children: [
    /* @__PURE__ */ r("p", { style: { margin: 0, fontSize: "12px", fontWeight: 500, lineHeight: 1.4 }, children: a.title }),
    /* @__PURE__ */ i("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
      /* @__PURE__ */ i("span", { style: { fontSize: "13px", fontWeight: 500, color: "#0F6E56" }, children: [
        t.outcome1Label,
        " ",
        w(t.outcome1Price, s)
      ] }),
      /* @__PURE__ */ r("span", { style: { fontSize: "11px", color: "var(--color-text-secondary, #5F5E5A)" }, children: "·" }),
      /* @__PURE__ */ i("span", { style: { fontSize: "13px", fontWeight: 500, color: "#A32D2D" }, children: [
        t.outcome2Label,
        " ",
        w(t.outcome2Price, s)
      ] })
    ] }),
    /* @__PURE__ */ r(M, { outcome1Price: t.outcome1Price }),
    /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ i("span", { style: { fontSize: "10px", color: "var(--color-text-secondary, #5F5E5A)" }, children: [
        "Resolves ",
        W(a.resolutionDate)
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          onClick: o,
          style: {
            fontSize: "10px",
            fontWeight: 500,
            color: "#534AB7",
            background: "#EEEDFE",
            border: "none",
            borderRadius: "4px",
            padding: "3px 8px",
            cursor: "pointer"
          },
          children: "Trade →"
        }
      )
    ] })
  ] }) : null;
}
function ne({ slug: e, variant: t = "full", currency: o = "USD", onTrade: s }) {
  var m, h;
  const [a, f] = g(null), n = O(e, o), d = z((v) => {
    f(v);
  }, []), { status: c } = J({
    eventId: ((m = n.event) == null ? void 0 : m.id) ?? null,
    marketId: ((h = n.market) == null ? void 0 : h.id) ?? null,
    onPriceUpdate: d
  }), p = z(() => {
    s ? s(e) : window.open(`${K}/${e}`, "_blank", "noopener,noreferrer");
  }, [e, s]);
  if (n.loading) return /* @__PURE__ */ r(X, {});
  if (n.error) return /* @__PURE__ */ r(Q, { message: n.error });
  const l = a ?? n.prices;
  return l ? t === "compact" ? /* @__PURE__ */ r(Z, { state: n, prices: l, onTrade: p, currency: o }) : /* @__PURE__ */ r(
    Y,
    {
      state: n,
      prices: l,
      streamStatus: c,
      onTrade: p,
      slug: e,
      currency: o
    }
  ) : null;
}
export {
  ne as BayseMarket
};

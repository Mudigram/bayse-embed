import { jsx as r, jsxs as i } from "react/jsx-runtime";
import { useState as g, useEffect as k, useRef as x, useCallback as $ } from "react";
const j = "https://relay.bayse.markets/v1";
function _(e) {
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
  const [u, c] = g({
    event: null,
    market: null,
    prices: null,
    loading: !0,
    error: null
  });
  return k(() => {
    if (!e) return;
    let p = !1;
    async function s() {
      c((n) => ({ ...n, loading: !0, error: null }));
      try {
        const n = await fetch(
          `${j}/pm/events/slug/${e}?currency=${t}`
        );
        if (!n.ok)
          throw new Error(I(n.status, e));
        const o = await n.json(), a = o.markets[0];
        if (!a)
          throw new Error(`No markets found for "${e}"`);
        p || c({
          event: o,
          market: a,
          prices: _(a),
          loading: !1,
          error: null
        });
      } catch (n) {
        p || c((o) => ({
          ...o,
          loading: !1,
          error: n instanceof Error ? n.message : "Something went wrong"
        }));
      }
    }
    return s(), () => {
      p = !0;
    };
  }, [e, t]), u;
}
const q = "wss://socket.bayse.markets/ws/v1/markets", H = 3e4;
function N({
  eventId: e,
  marketId: t,
  onPriceUpdate: u
}) {
  const [c, p] = g("disconnected"), [s, n] = g(null), o = x(null), a = x(0), l = x(null), f = x(!0), m = x(u);
  return k(() => {
    m.current = u;
  }, [u]), k(() => {
    if (typeof window > "u" || !e || !t) return;
    f.current = !0;
    function h() {
      l.current && (clearTimeout(l.current), l.current = null);
    }
    function v(d) {
      d.send(JSON.stringify({
        type: "subscribe",
        channel: "prices",
        eventId: e
      }));
    }
    function M(d) {
      var F;
      const E = d.data.split(`
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
          const R = y.data.markets.find((U) => U.id === t);
          if (!R) return;
          const S = R.prices, P = Object.keys(S);
          if (P.length < 2) return;
          const [A, z] = P, T = {
            outcome1Label: A,
            outcome1Price: S[A],
            outcome2Label: z,
            outcome2Price: S[z]
          };
          m.current(T);
        }
      }
    }
    function D() {
      if (!f.current) return;
      p("connecting"), n(null);
      const d = new WebSocket(q);
      o.current = d, d.addEventListener("open", () => {
        if (!f.current) {
          d.close();
          return;
        }
        a.current = 0, p("connected"), v(d);
      }), d.addEventListener("message", M), d.addEventListener("close", () => {
        if (!f.current) return;
        p("disconnected");
        const E = Math.min(1e3 * 2 ** a.current, H);
        a.current++, l.current = setTimeout(D, E);
      }), d.addEventListener("error", () => {
        p("error"), d.close();
      });
    }
    return D(), () => {
      f.current = !1, h(), o.current && (o.current.close(), o.current = null);
    };
  }, [e, t]), { status: c, serverError: s };
}
const J = "https://bayse.markets/events";
function w(e) {
  return `${Math.round(e * 100)}¢`;
}
function K(e) {
  return `${Math.round(e * 100)}%`;
}
function B(e) {
  return e >= 1e6 ? `$${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `$${(e / 1e3).toFixed(1)}K` : `$${e.toFixed(0)}`;
}
function C(e) {
  return new Date(e).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function V({ status: e }) {
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
function W({ outcome1Price: e }) {
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
function G({ message: e }) {
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
function Q({
  state: e,
  prices: t,
  streamStatus: u,
  onTrade: c,
  slug: p
}) {
  const { event: s, market: n } = e;
  return !s || !n ? null : /* @__PURE__ */ i("div", { style: b, children: [
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
      /* @__PURE__ */ r("div", { style: { marginBottom: "8px" }, children: /* @__PURE__ */ r(V, { status: u }) }),
      /* @__PURE__ */ r("p", { style: { margin: "0 0 4px", fontSize: "14px", fontWeight: 500, lineHeight: 1.45 }, children: s.title }),
      /* @__PURE__ */ i("p", { style: { margin: 0, fontSize: "12px", color: "var(--color-text-secondary, #5F5E5A)" }, children: [
        "Resolves ",
        C(s.resolutionDate),
        " · ",
        s.category
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
    ].map(({ label: o, price: a, color: l }) => /* @__PURE__ */ i("div", { style: {
      background: "var(--color-background-secondary, #F1EFE8)",
      borderRadius: "8px",
      padding: "10px 12px"
    }, children: [
      /* @__PURE__ */ r("p", { style: { margin: "0 0 4px", fontSize: "11px", fontWeight: 500, color: "var(--color-text-secondary, #5F5E5A)", letterSpacing: "0.02em" }, children: o }),
      /* @__PURE__ */ r("p", { style: { margin: "0 0 3px", fontSize: "22px", fontWeight: 500, color: l, lineHeight: 1 }, children: w(a) }),
      /* @__PURE__ */ r("p", { style: { margin: 0, fontSize: "11px", color: "var(--color-text-secondary, #5F5E5A)" }, children: "per share" })
    ] }, o)) }),
    /* @__PURE__ */ i("div", { style: {
      padding: "12px 16px",
      borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))"
    }, children: [
      /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "7px" }, children: [
        /* @__PURE__ */ r("span", { style: { fontSize: "12px", color: "var(--color-text-secondary, #5F5E5A)" }, children: "Implied probability" }),
        /* @__PURE__ */ i("span", { style: { fontSize: "13px", fontWeight: 500 }, children: [
          K(t.outcome1Price),
          " ",
          t.outcome1Label
        ] })
      ] }),
      /* @__PURE__ */ r(W, { outcome1Price: t.outcome1Price })
    ] }),
    /* @__PURE__ */ r("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      padding: "10px 16px",
      borderBottom: "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))"
    }, children: [
      { label: "24h volume", value: B(s.totalVolume) },
      { label: "Liquidity", value: B(s.liquidity) }
    ].map(({ label: o, value: a }, l) => /* @__PURE__ */ i("div", { style: {
      paddingRight: l === 0 ? "16px" : 0,
      paddingLeft: l === 1 ? "16px" : 0,
      borderRight: l === 0 ? "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))" : "none"
    }, children: [
      /* @__PURE__ */ r("p", { style: { margin: "0 0 2px", fontSize: "11px", color: "var(--color-text-secondary, #5F5E5A)" }, children: o }),
      /* @__PURE__ */ r("p", { style: { margin: 0, fontSize: "13px", fontWeight: 500 }, children: a })
    ] }, o)) }),
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
          onClick: c,
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
function Y({
  state: e,
  prices: t,
  onTrade: u
}) {
  const { event: c } = e;
  return c ? /* @__PURE__ */ i("div", { style: { ...b, padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px" }, children: [
    /* @__PURE__ */ r("p", { style: { margin: 0, fontSize: "12px", fontWeight: 500, lineHeight: 1.4 }, children: c.title }),
    /* @__PURE__ */ i("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
      /* @__PURE__ */ i("span", { style: { fontSize: "13px", fontWeight: 500, color: "#0F6E56" }, children: [
        t.outcome1Label,
        " ",
        w(t.outcome1Price)
      ] }),
      /* @__PURE__ */ r("span", { style: { fontSize: "11px", color: "var(--color-text-secondary, #5F5E5A)" }, children: "·" }),
      /* @__PURE__ */ i("span", { style: { fontSize: "13px", fontWeight: 500, color: "#A32D2D" }, children: [
        t.outcome2Label,
        " ",
        w(t.outcome2Price)
      ] })
    ] }),
    /* @__PURE__ */ r(W, { outcome1Price: t.outcome1Price }),
    /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ i("span", { style: { fontSize: "10px", color: "var(--color-text-secondary, #5F5E5A)" }, children: [
        "Resolves ",
        C(c.resolutionDate)
      ] }),
      /* @__PURE__ */ r(
        "button",
        {
          onClick: u,
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
function re({ slug: e, variant: t = "full", currency: u = "USD", onTrade: c }) {
  var m, h;
  const [p, s] = g(null), n = O(e, u), o = $((v) => {
    s(v);
  }, []), { status: a } = N({
    eventId: ((m = n.event) == null ? void 0 : m.id) ?? null,
    marketId: ((h = n.market) == null ? void 0 : h.id) ?? null,
    onPriceUpdate: o
  }), l = $(() => {
    c ? c(e) : window.open(`${J}/${e}`, "_blank", "noopener,noreferrer");
  }, [e, c]);
  if (n.loading) return /* @__PURE__ */ r(X, {});
  if (n.error) return /* @__PURE__ */ r(G, { message: n.error });
  const f = p ?? n.prices;
  return f ? t === "compact" ? /* @__PURE__ */ r(Y, { state: n, prices: f, onTrade: l }) : /* @__PURE__ */ r(
    Q,
    {
      state: n,
      prices: f,
      streamStatus: a,
      onTrade: l,
      slug: e
    }
  ) : null;
}
export {
  re as BayseMarket
};

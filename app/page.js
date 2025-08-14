'use client';

import { useEffect, useState } from 'react';

// === Simple config ===
// You own 4.5 ETH (you told me earlier). We’ll make this an env var later.
const ETH_AMOUNT = 4.5;

// Format numbers as USD nicely
function formatUSD(n) {
  try {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  } catch {
    return `$${Number(n).toFixed(2)}`;
  }
}

export default function Home() {
  const [price, setPrice] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // Public endpoint (no key needed). Updates disabled from cache.
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
          { next: { revalidate: 0 }, cache: 'no-store' }
        );
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setPrice(data?.ethereum?.usd ?? null);
        setChange24h(data?.ethereum?.usd_24h_change ?? null);
        setErr(null);
      } catch (e) {
        setErr(e.message || 'Failed to load price');
      } finally {
        setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 60_000); // refresh every 60s
    return () => clearInterval(id);
  }, []);

  const positionUSD = price ? price * ETH_AMOUNT : null;
  const changeColor = (change24h ?? 0) >= 0 ? 'green' : 'crimson';

  return (
    <main style={{ fontFamily: 'system-ui, Arial', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>ETH Dashboard</h1>
      <div style={{ color: '#666', marginBottom: 20 }}>Live ETH price & your position (auto-updates every 60s)</div>

      {loading && <div>Loading…</div>}
      {err && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>
          Error: {err} — try refreshing the page.
        </div>
      )}

      {price && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 14, color: '#666' }}>Current ETH Price</div>
            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginTop: 6 }}>
              {formatUSD(price)}
            </div>
            <div style={{ marginTop: 8, fontWeight: 600, color: changeColor }}>
              24h: {(change24h >= 0 ? '+' : '') + (change24h ?? 0).toFixed(2)}%
            </div>
          </div>

          <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 14, color: '#666' }}>Your Position</div>
            <div style={{ marginTop: 6 }}>
              ETH owned: <strong>{ETH_AMOUNT}</strong>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginTop: 8 }}>
              Value: {positionUSD ? formatUSD(positionUSD) : '—'}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

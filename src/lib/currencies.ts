const CACHE_DURATION = 3600000; // 1 hour in ms

interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
}

let cache: RateCache | null = null;

export async function getExchangeRates(base: string = "USD"): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.rates;
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      return getStaticRates(base);
    }

    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error("Failed to fetch exchange rates");

    const data = await res.json();
    cache = { rates: data.conversion_rates, timestamp: Date.now() };
    return data.conversion_rates;
  } catch {
    return getStaticRates(base);
  }
}

function getStaticRates(base: string): Record<string, number> {
  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    EGP: 49.5,
    AED: 3.67,
    SAR: 3.75,
    CAD: 1.36,
    AUD: 1.54,
    JPY: 155.5,
    CHF: 0.9,
  };

  if (base !== "USD" && rates[base]) {
    const baseRate = rates[base];
    const converted: Record<string, number> = {};
    for (const [key, val] of Object.entries(rates)) {
      converted[key] = val / baseRate;
    }
    return converted;
  }

  return rates;
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  if (from === to) return amount;
  const rates = await getExchangeRates(from);
  const rate = rates[to];
  if (!rate) return amount;
  return Math.round(amount * rate * 100) / 100;
}

export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", EGP: "E£",
    AED: "AED ", SAR: "SAR ", CAD: "CA$", AUD: "A$",
    JPY: "¥", CHF: "CHF ",
  };
  return symbols[code] || code + " ";
}

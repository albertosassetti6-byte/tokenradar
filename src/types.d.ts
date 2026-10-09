// Interfaccia per i dati restituiti dall'API CoinGecko
export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  anomalyScore?: number;
}

// Dichiarazioni globali per librerie esterne incluse via CDN (Chart.js e Lucide)
declare global {
  interface Window {
    Chart: any;
    lucide: {
      createIcons: () => void;
    };
  }
}

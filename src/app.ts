class TrendingTokenRadar {
  private apiUrl: string = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=8&page=1&sparkline=false';
  private refreshInterval: number = 15; // Aumentato a 15s per evitare il blocco API
  private timerCountdown: number = 15;
  private chart: any = null;

  constructor() {
    this.initLucideIcons();
    this.initChart();
    this.fetchData();
    this.startAutoRefresh();
  }

  private initLucideIcons(): void {
    if ((window as any).lucide) {
      try {
        (window as any).lucide.createIcons();
      } catch (e) {
        console.warn('Lucide icons warning:', e);
      }
    }
  }

  private initChart(): void {
    const ctx = document.getElementById('volumeChart') as HTMLCanvasElement | null;
    if (!ctx || !(window as any).Chart) return;

    try {
      const chartCtx = ctx.getContext('2d');
      let gradient: any = '#2563eb';
      
      if (chartCtx) {
        gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
      }

      this.chart = new (window as any).Chart(ctx, {
        type: 'line',
        data: {
          labels: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'DOGE'],
          datasets: [{
            label: 'Volume 24h ($USD)',
            data: [0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: '#2563eb',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#f1f5f9' } }
          }
        }
      });
    } catch (err) {
      console.error('Errore inizializzazione Chart.js:', err);
    }
  }

  private async fetchData(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`API Limit / Error Status: ${response.status}`);
      }
      
      const tokens = await response.json();
      
      const processedTokens = tokens.map((token: any) => ({
        ...token,
        anomalyScore: Math.min(100, Math.floor((Math.abs(token.price_change_percentage_24h || 0) * 2) + ((token.total_volume || 0) / 100000000)))
      }));

      this.updateUI(processedTokens);
    } catch (error) {
      console.warn('Uso dati simulati di backup a causa del blocco API CoinGecko:', error);
      this.loadMockData();
    }
  }

  private loadMockData(): void {
    // Dati di ripiego per garantire che la pagina mostri sempre informazioni
    const mockTokens = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 64200, price_change_percentage_24h: 4.8, total_volume: 32400000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', anomalyScore: 88 },
      { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3480, price_change_percentage_24h: -1.2, total_volume: 18200000000, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', anomalyScore: 62 },
      { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 145, price_change_percentage_24h: 12.4, total_volume: 8500000000, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', anomalyScore: 95 },
      { id: 'binancecoin', name: 'BNB', symbol: 'bnb', current_price: 580, price_change_percentage_24h: 0.9, total_volume: 1200000000, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', anomalyScore: 45 },
      { id: 'ripple', name: 'XRP', symbol: 'xrp', current_price: 0.58, price_change_percentage_24h: 8.3, total_volume: 2300000000, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', anomalyScore: 79 }
    ];
    this.updateUI(mockTokens);
  }

  private updateUI(tokens: any[]): void {
    this.updateTable(tokens);
    this.updateChart(tokens);
    this.updateKPIs(tokens);
  }

  private updateTable(tokens: any[]): void {
    const tbody = document.getElementById('token-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    tokens.forEach(token => {
      const isPositive = (token.price_change_percentage_24h || 0) >= 0;
      const score = token.anomalyScore || 0;
      const alertClass = score > 75 ? 'badge-high' : 'badge-medium';
      const alertText = score > 75 ? 'Critico' : 'Sospetto';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="token-cell">
            <img src="${token.image}" alt="${token.name}" width="28" height="28" />
            <span>${token.name} <small style="color:#64748b">(${token.symbol.toUpperCase()})</small></span>
          </div>
        </td>
        <td>$${(token.current_price || 0).toLocaleString()}</td>
        <td class="${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '+' : ''}${(token.price_change_percentage_24h || 0).toFixed(2)}%
        </td>
        <td>$${((token.total_volume || 0) / 1000000).toFixed(2)}M</td>
        <td><strong>${score} / 100</strong></td>
        <td><span class="badge-alert ${alertClass}">${alertText}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  private updateChart(tokens: any[]): void {
    if (!this.chart) return;

    const labels = tokens.map(t => t.symbol.toUpperCase());
    const volumeData = tokens.map(t => (t.total_volume || 0) / 1000000);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = volumeData;
    this.chart.update();
  }

  private updateKPIs(tokens: any[]): void {
    const anomalyCountEl = document.getElementById('anomaly-count');
    const avgSpikeEl = document.getElementById('avg-volume-spike');
    const totalLiquidityEl = document.getElementById('total-liquidity');

    if (anomalyCountEl) {
      anomalyCountEl.textContent = tokens.filter(t => (t.anomalyScore || 0) > 60).length.toString();
    }

    if (avgSpikeEl) {
      const avg = tokens.reduce((acc, t) => acc + Math.abs(t.price_change_percentage_24h || 0), 0) / tokens.length;
      avgSpikeEl.textContent = `+${avg.toFixed(1)}%`;
    }

    if (totalLiquidityEl) {
      const totalVol = tokens.reduce((acc, t) => acc + (t.total_volume || 0), 0);
      totalLiquidityEl.textContent = `$${(totalVol / 1000000000).toFixed(2)}B`;
    }
  }

  private startAutoRefresh(): void {
    const timerEl = document.getElementById('timer');

    setInterval(() => {
      this.timerCountdown--;
      if (timerEl) timerEl.textContent = this.timerCountdown.toString();

      if (this.timerCountdown <= 0) {
        this.fetchData();
        this.timerCountdown = this.refreshInterval;
      }
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TrendingTokenRadar();
});

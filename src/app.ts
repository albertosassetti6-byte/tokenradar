

export class TrendingTokenRadar {
  private apiUrl: string = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=8&page=1&sparkline=false';
  private refreshInterval: number = 5;
  private timerCountdown: number = 5;
  private chart: any = null;

  constructor() {
    this.initLucideIcons();
    this.initChart();
    this.fetchData();
    this.startAutoRefresh();
  }

  private initLucideIcons(): void {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  private initChart(): void {
    const ctx = document.getElementById('volumeChart') as HTMLCanvasElement | null;
    if (!ctx) return;

    const chartCtx = ctx.getContext('2d');
    let gradient: CanvasGradient | string = '#2563eb';
    
    if (chartCtx) {
      gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    }

    if (!window.Chart) return;

    this.chart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Volume 24h ($USD)',
          data: [],
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
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#f1f5f9' } }
        }
      }
    });
  }

  private async fetchData(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const tokens: TokenData[] = await response.json();
      
      const processedTokens: TokenData[] = tokens.map(token => ({
        ...token,
        anomalyScore: Math.min(100, Math.floor((Math.abs(token.price_change_percentage_24h) * 2) + (token.total_volume / 10000000)))
      }));

      this.updateTable(processedTokens);
      this.updateChart(processedTokens);
      this.updateKPIs(processedTokens);
    } catch (error) {
      console.error('Errore durante il recupero dei dati da CoinGecko:', error);
    }
  }

  private updateTable(tokens: TokenData[]): void {
    const tbody = document.getElementById('token-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    tokens.forEach(token => {
      const isPositive = token.price_change_percentage_24h >= 0;
      const score = token.anomalyScore || 0;
      const alertClass = score > 75 ? 'badge-high' : 'badge-medium';
      const alertText = score > 75 ? 'Critico' : 'Sospetto';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="token-cell">
            <img src="${token.image}" alt="${token.name}" />
            <span>${token.name} <small style="color:#64748b">(${token.symbol.toUpperCase()})</small></span>
          </div>
        </td>
        <td>$${token.current_price.toLocaleString()}</td>
        <td class="${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '+' : ''}${token.price_change_percentage_24h.toFixed(2)}%
        </td>
        <td>$${(token.total_volume / 1000000).toFixed(2)}M</td>
        <td><strong>${score} / 100</strong></td>
        <td><span class="badge-alert ${alertClass}">${alertText}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  private updateChart(tokens: TokenData[]): void {
    if (!this.chart) return;

    const labels = tokens.map(t => t.symbol.toUpperCase());
    const volumeData = tokens.map(t => t.total_volume / 1000000);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = volumeData;
    this.chart.update();
  }

  private updateKPIs(tokens: TokenData[]): void {
    const anomalyCountEl = document.getElementById('anomaly-count');
    const avgSpikeEl = document.getElementById('avg-volume-spike');
    const totalLiquidityEl = document.getElementById('total-liquidity');

    if (anomalyCountEl) {
      anomalyCountEl.textContent = tokens.filter(t => (t.anomalyScore || 0) > 60).length.toString();
    }

    if (avgSpikeEl) {
      const avg = tokens.reduce((acc, t) => acc + Math.abs(t.price_change_percentage_24h), 0) / tokens.length;
      avgSpikeEl.textContent = `+${avg.toFixed(1)}%`;
    }

    if (totalLiquidityEl) {
      const totalVol = tokens.reduce((acc, t) => acc + t.total_volume, 0);
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

// Inizializzazione dell'applicazione al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
  new TrendingTokenRadar();
});

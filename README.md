# 📡 Trending Token Radar

**Trending Token Radar** è una dashboard in tempo reale per il monitoraggio e l'analisi delle anomalie di volume, prezzo e liquidità sul mercato delle criptovalute.

🔗 **Demo Live:** [https://albertosassetti6-byte.github.io/tokenradar/](https://albertosassetti6-byte.github.io/tokenradar/)

---

## 🚀 Caratteristiche Principali

- **Auto-refresh in tempo reale:** Aggiornamento dei dati ogni 15 secondi con conto alla rovescia dinamico.
- **Visualizzazione Grafica:** Grafico dei volumi a 24h alimentato da **Chart.js**.
- **Algoritmo di Anomalia:** Calcolo di uno *Score Anomalia* (0-100) per identificare picchi insoliti di volume e prezzo.
- **Fallback Anti-Rate Limit:** Gestione automatica dei limiti API con dati di riserva per garantire zero downtime.
- **UI Responsiva e Moderna:** Sfondo chiaro, layout a sezioni orizzontali ed icone **Lucide**.

---

## 🛠️ Tecnologie Utilizzate

- **Frontend:** HTML5, CSS3, TypeScript (ES2022)
- **Librerie UI & Grafici:** Chart.js, Lucide Icons
- **Data Source:** CoinGecko API (*Market Data Feed*)
- **CI/CD & Hosting:** GitHub Actions, GitHub Pages

---

## 📁 Struttura del Progetto

```text
tokenradar/
├── .github/workflows/
│   └── deploy.yml      # Workflow di build e deploy automatico
├── src/
│   ├── app.ts          # Sorgente principale TypeScript
│   └── types.d.ts      # Definizione delle interfacce e tipi
├── index.html          # Struttura della dashboard
├── style.css           # Stili e layout responsivo
└── tsconfig.json       # Configurazione del compilatore TypeScript

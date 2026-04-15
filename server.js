'use strict';

const express  = require('express');
const session  = require('express-session');
const path     = require('path');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'car-puzzle-node-2024',
  resave: false,
  saveUninitialized: true,
}));

// ─── Data ─────────────────────────────────────────────────────────────────
const CARS = [
  { id: 1, name: 'Ferrari 488',          speed: 330, price: 250000,  color: '#e63946' },
  { id: 2, name: 'Lamborghini Huracán',  speed: 325, price: 230000,  color: '#f4a261' },
  { id: 3, name: 'Porsche 911',          speed: 310, price: 120000,  color: '#2a9d8f' },
  { id: 4, name: 'McLaren 720S',         speed: 341, price: 300000,  color: '#e9c46a' },
  { id: 5, name: 'Bugatti Chiron',       speed: 420, price: 3000000, color: '#264653' },
  { id: 6, name: 'Aston Martin DB11',    speed: 301, price: 200000,  color: '#9b2226' },
];

/** @type {Array<{name:string, score:number, mode:string}>} */
let leaderboard = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sortedCars(mode) {
  if (mode === 'speed') return [...CARS].sort((a, b) => a.speed - b.speed);
  if (mode === 'price') return [...CARS].sort((a, b) => a.price - b.price);
  return [...CARS].sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Routes ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/game'));

app.get('/game', (req, res) => {
  const mode = req.query.mode || 'speed';
  req.session.mode  = mode;
  req.session.moves = 0;
  res.render('game', { cars: shuffle(CARS), mode, message: null, won: false });
});

app.post('/game', (req, res) => {
  const action = req.query.action || req.body.action || '';

  if (action === 'shuffle') {
    const mode = req.query.mode || 'speed';
    req.session.mode  = mode;
    req.session.moves = 0;
    return res.render('game', { cars: shuffle(CARS), mode, message: null, won: false });
  }

  if (action === 'validate') {
    const orderIds    = (req.body.order || []).map(Number);
    const mode        = req.session.mode || 'speed';
    const moves       = (req.session.moves || 0) + 1;
    req.session.moves = moves;

    const correctOrder = sortedCars(mode).map(c => c.id);
    const correct      = JSON.stringify(orderIds) === JSON.stringify(correctOrder);

    if (correct) {
      const score = Math.max(100 - (moves - CARS.length) * 5, 10);
      return res.json({ correct: true, score, moves });
    }
    return res.json({ correct: false, moves });
  }

  res.status(400).json({ error: 'Unknown action' });
});

// ─── Leaderboard API ──────────────────────────────────────────────────────
app.get('/api/score', (_req, res) => {
  const top10 = [...leaderboard].sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(top10);
});

app.post('/api/score', (req, res) => {
  const { name = 'Anonymous', score = 0, mode = 'speed' } = req.body;
  leaderboard.push({ name: String(name).slice(0, 30), score: Number(score), mode: String(mode) });
  res.status(201).json({ status: 'ok' });
});

// ─── Start ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🏎️  Car Puzzle running → http://localhost:${PORT}`));

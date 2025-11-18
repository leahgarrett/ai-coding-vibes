import { createGameState } from './game/state/state.js';
import { startLoop } from './game/engine/loop.js';
import { level1 } from './game/levels/level1.js';
import { towerRegistry } from './game/registry/towerRegistry.js';
import { BasicTower } from './game/entities/tower.js';
import { bus } from './game/engine/events.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startWaveBtn = document.getElementById('startWaveBtn');
const goldDisplay = document.getElementById('goldDisplay');
const waveDisplay = document.getElementById('waveDisplay');
const statusDisplay = document.getElementById('statusDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const debugToggle = document.getElementById('debugToggle');
const difficultySelect = document.getElementById('difficultySelect');

towerRegistry.register({
  id:'basic', name:'Basic Tower', cost:80, range:120, damage:28, rateMs:500, projectileSpeed:240
});
towerRegistry.register({
  id:'sniper', name:'Sniper Tower', cost:140, range:260, damage:120, rateMs:1800, projectileSpeed:520
});

const difficulties = {
  easy:  { name:'easy',  hpBaseMultiplier:0.8, hpWaveIncrementMultiplier:0.8, speedMultiplier:0.95, startGold:260, startLives:26 },
  normal:{ name:'normal',hpBaseMultiplier:1.0, hpWaveIncrementMultiplier:1.0, speedMultiplier:1.0,  startGold:200, startLives:20 },
  hard:  { name:'hard',  hpBaseMultiplier:1.2, hpWaveIncrementMultiplier:1.2, speedMultiplier:1.05, startGold:160, startLives:15 }
};

const state = createGameState({ level: level1 });
state.difficulty = difficulties.normal;
state.gold = state.difficulty.startGold;
state.lives = state.difficulty.startLives;

function applyDifficulty(key) {
  const diff = difficulties[key];
  if (!diff) return;
  if (state.waveInProgress || state.currentWaveIndex > 0) {
    if (state.debug) console.log('[DEBUG] Cannot change difficulty mid-game');
    statusDisplay.textContent = 'Difficulty locked (waves started)';
    return;
  }
  state.difficulty = diff;
  state.gold = diff.startGold;
  state.lives = diff.startLives;
  updateHUD();
  statusDisplay.textContent = 'Difficulty: ' + diff.name;
  if (state.debug) console.log('[DEBUG] Difficulty applied', diff);
}

difficultySelect.addEventListener('change', () => {
  applyDifficulty(difficultySelect.value);
});

function updateHUD() {
  goldDisplay.textContent = 'Gold: ' + state.gold;
  waveDisplay.textContent = 'Wave: ' + (state.currentWaveIndex + 1) + '/' + state.level.waves.length;
  livesDisplay.textContent = 'Lives: ' + state.lives;
}

debugToggle.addEventListener('change', () => {
  state.debug = debugToggle.checked;
  if (state.debug) console.log('[DEBUG] Debug mode enabled');
});

startWaveBtn.addEventListener('click', () => {
  if (!state.waveInProgress) {
    if (state.debug) console.log('[DEBUG] Starting wave index', state.currentWaveIndex, 'difficulty', state.difficulty.name);
    state.startNextWave();
    statusDisplay.textContent = 'Wave started';
  } else if (state.debug) console.log('[DEBUG] Wave already in progress');
});

document.querySelectorAll('.tower-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.pendingTowerType = btn.dataset.tower;
  });
});

canvas.addEventListener('mousemove', e => {
  // Use offsetX/Y to avoid page layout offset issues
  const ox = (typeof e.offsetX === 'number') ? e.offsetX : (e.clientX - canvas.getBoundingClientRect().left);
  const oy = (typeof e.offsetY === 'number') ? e.offsetY : (e.clientY - canvas.getBoundingClientRect().top);
  state.mouse.x = ox;
  state.mouse.y = oy;
  if (state.debug) state._lastMouse = { x: ox, y: oy };
});

canvas.addEventListener('click', e => {
  const ox = (typeof e.offsetX === 'number') ? e.offsetX : (e.clientX - canvas.getBoundingClientRect().left);
  const oy = (typeof e.offsetY === 'number') ? e.offsetY : (e.clientY - canvas.getBoundingClientRect().top);
  state.mouse.x = ox;
  state.mouse.y = oy;
  attemptPlaceTower();
});
canvas.addEventListener('keydown', e => {
  if (e.key === 't') attemptPlaceTower();
});

function attemptPlaceTower() {
  const type = state.pendingTowerType || 'basic';
  const cfg = towerRegistry.get(type);
  if (!cfg) { if (state.debug) console.log('[DEBUG] No tower config for type', type); return; }
  const tile = state.tileFromPoint(state.mouse.x, state.mouse.y);
  if (state.debug) console.log('[DEBUG] Attempt place', {
    mouse: { x: state.mouse.x, y: state.mouse.y },
    tile: tile ? { x: tile.x, y: tile.y } : null,
    difficulty: state.difficulty.name
  });
  if (!tile) { if (state.debug) console.log('[DEBUG] Invalid tile at', state.mouse); return; }
  if (tile.isPath) { if (state.debug) console.log('[DEBUG] Cannot place on path tile', tile); return; }
  if (state.gold < cfg.cost) { if (state.debug) console.log('[DEBUG] Insufficient gold', { gold: state.gold, cost: cfg.cost }); return; }
  state.gold -= cfg.cost;
  state.towers.push(new BasicTower(tile.cx, tile.cy, cfg));
  if (state.debug) console.log('[DEBUG] Placed tower', { type, x: tile.cx, y: tile.cy, remainingGold: state.gold });
  state.pendingTowerType = null;
  updateHUD();
}

bus.on('enemyKilled', e => {
  state.gold += e.payout;
  if (state.debug) console.log('[DEBUG] Enemy killed. +Gold', e.payout, 'Current gold', state.gold);
  updateHUD();
});

bus.on('leak', () => {
  state.lives--;
  if (state.debug) console.log('[DEBUG] Leak occurred. Lives now', state.lives);
  updateHUD();
  statusDisplay.textContent = 'Leak! -1 life';
  if (state.lives <= 0) {
    state.gameOver = true;
    statusDisplay.textContent = 'Game Over';
    statusDisplay.className = 'fail';
  }
});

bus.on('waveCleared', () => {
  if (state.debug) console.log('[DEBUG] Wave cleared index', state.currentWaveIndex - 1);
  statusDisplay.textContent = 'Wave cleared';
  if (!state.gameOver && state.currentWaveIndex >= state.level.waves.length - 1 && state.enemies.length === 0) {
    statusDisplay.textContent = 'Victory!';
    statusDisplay.className = 'success';
  }
});

startLoop(state, ctx, updateHUD);
updateHUD();

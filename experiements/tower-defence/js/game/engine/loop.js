import { bus } from './events.js';

export function startLoop(state, ctx, hudUpdate) {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(100, now - last) / 1000;
    last = now;
    tick(state, dt);
    render(state, ctx);
    hudUpdate();
    if (!state.gameOver) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function tick(state, dt) {
  state.time += dt;
  if (state.waveInProgress) state.handleSpawns();
  // update enemies
  state.enemies.forEach(e => e.update(dt));
  // cull dead / reached end
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (e.hp <= 0) {
      state.enemies.splice(i,1);
      bus.emit('enemyKilled',{ payout: e.payout });
    } else if (e.done) {
      state.enemies.splice(i,1);
      bus.emit('leak',{ });
    }
  }
  // towers fire
  state.towers.forEach(t => t.update(dt, state.enemies, state.projectiles, state.debug));
  // projectiles
  state.projectiles.forEach(p => p.update(dt));
  // projectile hits
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    if (p.dead) { state.projectiles.splice(i,1); continue; }
    if (p.target && p.target.hp > 0) {
      const dx = p.x - p.target.x;
      const dy = p.y - p.target.y;
      if (dx*dx + dy*dy < 16) {
        p.target.hp -= p.damage;
        if (state.debug) console.log('[DEBUG] Projectile hit', { damage: p.damage, remainingHp: p.target.hp });
        p.dead = true;
      }
    }
  }
  // wave clear?
  if (state.waveInProgress && state.pendingSpawns.length === 0 && state.enemies.length === 0) {
    state.waveInProgress = false;
    bus.emit('waveCleared', {});
  }
}

function render(state, ctx) {
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  drawGrid(state, ctx);
  drawPath(state, ctx);
  // towers
  ctx.fillStyle = '#2ecc71';
  state.towers.forEach(t => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 12, 0, Math.PI*2);
    ctx.fill();
  });
  // enemies
  state.enemies.forEach(e => {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(e.x, e.y, 10, 0, Math.PI*2);
    ctx.fill();
    // hp bar
    ctx.fillStyle = '#000';
    ctx.fillRect(e.x - 12, e.y - 18, 24, 4);
    ctx.fillStyle = '#ff5555';
    ctx.fillRect(e.x - 12, e.y - 18, 24 * (e.hp / e.maxHp), 4);
  });
  // projectiles
  ctx.fillStyle = '#fff';
  state.projectiles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
    ctx.fill();
  });
  // hover tile highlight
  const tile = state.tileFromPoint(state.mouse.x, state.mouse.y);
  if (tile && !tile.isPath) {
    ctx.strokeStyle = '#3498db';
    ctx.strokeRect(tile.x, tile.y, state.tileSize, state.tileSize);
  }
  // Debug overlay
  if (state.debug) {
    ctx.save();
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(4,4,160,50);
    ctx.fillStyle = '#0f0';
    const col = tile ? tile.x / state.tileSize : '-';
    const row = tile ? tile.y / state.tileSize : '-';
    ctx.fillText(`Mouse: ${state.mouse.x.toFixed(1)}, ${state.mouse.y.toFixed(1)}`, 10, 20);
    ctx.fillText(`Tile: col ${col} row ${row}`, 10, 34);
    ctx.fillText(`WaveInProgress: ${state.waveInProgress}`, 10, 48);
    // Crosshair
    ctx.strokeStyle = '#ff0';
    ctx.beginPath();
    ctx.moveTo(state.mouse.x - 6, state.mouse.y);
    ctx.lineTo(state.mouse.x + 6, state.mouse.y);
    ctx.moveTo(state.mouse.x, state.mouse.y - 6);
    ctx.lineTo(state.mouse.x, state.mouse.y + 6);
    ctx.stroke();
    ctx.restore();
  }
}

function drawGrid(state, ctx) {
  ctx.strokeStyle = '#333';
  for (let x=0;x<ctx.canvas.width;x+=state.tileSize) {
    ctx.beginPath();
    ctx.moveTo(x,0); ctx.lineTo(x,ctx.canvas.height); ctx.stroke();
  }
  for (let y=0;y<ctx.canvas.height;y+=state.tileSize) {
    ctx.beginPath();
    ctx.moveTo(0,y); ctx.lineTo(ctx.canvas.width,y); ctx.stroke();
  }
}

function drawPath(state, ctx) {
  ctx.fillStyle = '#444';
  state.pathTiles.forEach(t=>{
    ctx.fillRect(t.x, t.y, state.tileSize, state.tileSize);
  });
}

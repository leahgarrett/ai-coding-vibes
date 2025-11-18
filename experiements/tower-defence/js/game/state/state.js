import { Enemy } from '../entities/enemy.js';

export function createGameState({ level }) {
  const tileSize = 32;
  const cols = 20, rows = 15;
  const pathTiles = buildPathTiles(level.path, tileSize);
  return {
    time:0,
    tileSize,
    level,
    gold:200,
    lives:20,
    debug:false,
    currentWaveIndex:0,
    waveInProgress:false,
    pendingSpawns:[],
    enemies:[],
    towers:[],
    projectiles:[],
    pathTiles,
    pendingTowerType:null,
    mouse:{x:0,y:0},
    gameOver:false,
    startNextWave() {
      if (this.currentWaveIndex >= this.level.waves.length) return;
      this.waveInProgress = true;
      this.pendingSpawns = [...this.level.waves[this.currentWaveIndex]];
      this.currentWaveIndex++;
      this.waveStartTime = this.time;
      if (this.debug) console.log('[DEBUG] Wave start. Total spawn events', this.pendingSpawns.length);
    },
    handleSpawns() {
      if (!this.waveInProgress) return;
      while (this.pendingSpawns.length) {
        const next = this.pendingSpawns[0];
        if (this.time - this.waveStartTime >= next.timeOffsetMs / 1000) {
          this.pendingSpawns.shift();
          for (let i=0;i<next.count;i++) {
            this.enemies.push(new Enemy(this.level.path, this.currentWaveIndex - 1, next.enemyType, this.difficulty));
            if (this.debug) console.log('[DEBUG] Spawn enemy', { wave: this.currentWaveIndex - 1, type: next.enemyType, diff: this.difficulty.name });
          }
        } else break;
      }
    },
    tileFromPoint(x,y) {
      const cx = Math.floor(x / tileSize)*tileSize;
      const cy = Math.floor(y / tileSize)*tileSize;
      if (cx < 0 || cy < 0 || cx >= cols*tileSize || cy >= rows*tileSize) return null;
      const tile = { x:cx, y:cy, cx:cx+tileSize/2, cy:cy+tileSize/2 };
      tile.isPath = pathTiles.some(pt=>pt.x===cx && pt.y===cy);
      return tile;
    }
  };
}

function buildPathTiles(path, tileSize) {
  const tiles = [];
  // simple line interpolation between waypoints
  for (let i=0;i<path.length-1;i++) {
    const [x1,y1]=path[i], [x2,y2]=path[i+1];
    const dx = Math.sign(x2-x1);
    const dy = Math.sign(y2-y1);
    let x=x1, y=y1;
    tiles.push({ x:x1, y:y1 });
    while (x!==x2 || y!==y2) {
      if (x!==x2) x+=dx;
      if (y!==y2) y+=dy;
      tiles.push({ x, y });
    }
  }
  // convert pixel coords to tile coords already aligned
  return tiles.map(t=>({ x:t.x, y:t.y }));
}

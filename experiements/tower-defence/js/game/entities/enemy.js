export class Enemy {
  constructor(path, waveIndex = 0, type = 'basic', difficulty = { hpBaseMultiplier:1, hpWaveIncrementMultiplier:1, speedMultiplier:1 }) {
    this.path = path;
    this.pathIndex = 0;
    this.x = path[0][0] + 16;
    this.y = path[0][1] + 16;
    const fast = type === 'fast';
    const baseSpeed = fast ? 120 : 70;
    this.speed = baseSpeed * difficulty.speedMultiplier;
    const baseHp = (fast ? 50 : 80) * difficulty.hpBaseMultiplier;
    const waveAdd = waveIndex * (fast ? 10 : 25) * difficulty.hpWaveIncrementMultiplier;
    this.maxHp = baseHp + waveAdd;
    this.hp = this.maxHp;
    this.payout = fast ? 10 : 15;
    this.done = false;
  }
  update(dt) {
    if (this.done || this.hp<=0) return;
    const target = this.path[this.pathIndex + 1];
    if (!target) { this.done = true; return; }
    const tx = target[0] + 16, ty = target[1] + 16;
    const dx = tx - this.x, dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (step >= dist) {
      this.x = tx; this.y = ty; this.pathIndex++;
    } else {
      this.x += dx / dist * step;
      this.y += dy / dist * step;
    }
  }
}

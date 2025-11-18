import { Projectile } from './projectile.js';

export class BasicTower {
  constructor(x,y,cfg){
    Object.assign(this,cfg);
    this.x=x; this.y=y;
    this.cooldown=0;
  }
  update(dt, enemies, projectiles, debugFlag) {
    this.cooldown -= dt*1000;
    if (this.cooldown>0) return;
    const target = findTarget(enemies, this);
    if (!target) return;
    this.cooldown = this.rateMs;
    projectiles.push(new Projectile(this.x, this.y, target, this.damage, this.projectileSpeed));
    if (debugFlag) console.log('[DEBUG] Tower fired', { tower: this.id, targetHp: target.hp, damage: this.damage });
  }
}

function findTarget(enemies, tower) {
  let best=null, bestDist=Infinity;
  enemies.forEach(e=>{
    if (e.hp<=0 || e.done) return;
    const dx = e.x - tower.x;
    const dy = e.y - tower.y;
    const d2 = dx*dx + dy*dy;
    if (d2 <= tower.range * tower.range && d2 < bestDist) {
      bestDist = d2; best = e;
    }
  });
  return best;
}

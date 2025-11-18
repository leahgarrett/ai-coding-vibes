export class Projectile {
  constructor(x,y,target,damage,speed){
    this.x=x; this.y=y;
    this.target=target;
    this.damage=damage;
    this.speed=speed;
    this.dead=false;
  }
  update(dt){
    if (this.dead || !this.target || this.target.hp<=0) { this.dead=true; return; }
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (step >= dist) {
      this.x = this.target.x;
      this.y = this.target.y;
      // damage applied in loop collision
    } else {
      this.x += dx/dist * step;
      this.y += dy/dist * step;
    }
  }
}

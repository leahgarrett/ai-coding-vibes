class TowerRegistry {
  constructor(){ this.map=new Map(); }
  register(cfg){ this.map.set(cfg.id, cfg); }
  get(id){ return this.map.get(id); }
}
export const towerRegistry = new TowerRegistry();

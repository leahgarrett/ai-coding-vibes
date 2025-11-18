class EventBus {
  constructor(){ this.map = new Map(); }
  on(type, fn){ (this.map.get(type) || this.map.set(type, []).get(type)).push(fn); }
  emit(type, payload){
    const list = this.map.get(type); if (!list) return;
    for (const fn of list) fn(payload);
  }
}
export const bus = new EventBus();

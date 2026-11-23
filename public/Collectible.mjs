class Collectible {
  constructor({x = 0, y = 0, value = 1, id, tier = 'bronze'} = {}) {
    this.x = typeof x === 'number' ? x : 0;
    this.y = typeof y === 'number' ? y : 0;
    this.value = typeof value === 'number' ? value : 1;
    this.id = id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.tier = tier;

    const tiers = {
      bronze: { radius: 8, color: '#cd7f32' },
      silver: { radius: 6, color: '#c0c0c0' },
      gold: { radius: 4, color: '#ffd700' }
    };
    const display = tiers[tier] || tiers.bronze;
    this.radius = display.radius;
    this.color = display.color;
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;

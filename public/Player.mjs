class Player {
  constructor({x = 0, y = 0, score = 0, id, avatar = '😀'} = {}) {
    this.x = typeof x === 'number' ? x : 0;
    this.y = typeof y === 'number' ? y : 0;
    this.score = typeof score === 'number' ? score : 0;
    this.id = id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.avatar = avatar;
  }

  movePlayer(dir, speed) {
    if (typeof speed !== 'number') {
      return;
    }

    switch (dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
    }
  }

  collision(item) {
    if (!item) {
      return false;
    }

    const playerSize = typeof this.radius === 'number' ? this.radius * 2 : 20;
    const itemSize = typeof item.radius === 'number'
      ? item.radius * 2
      : typeof item.size === 'number'
        ? item.size
        : 20;

    const playerLeft = this.x - playerSize / 2;
    const playerRight = this.x + playerSize / 2;
    const playerTop = this.y - playerSize / 2;
    const playerBottom = this.y + playerSize / 2;
    const itemLeft = item.x - itemSize / 2;
    const itemRight = item.x + itemSize / 2;
    const itemTop = item.y - itemSize / 2;
    const itemBottom = item.y + itemSize / 2;

    return playerLeft < itemRight &&
      playerRight > itemLeft &&
      playerTop < itemBottom &&
      playerBottom > itemTop;
  }

  calculateRank(arr) {
    const players = Array.isArray(arr) ? arr : [];
    const ranked = players.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
    let position = ranked.findIndex(player => player === this || player.id === this.id);
    if (position === -1) {
      position = 0;
    }
    return `Rank: ${position + 1}/${players.length}`;
  }
}

export default Player;

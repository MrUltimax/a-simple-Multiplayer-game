require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.disable('x-powered-by');
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(function(req, res, next) {
  res.set('X-Powered-By', 'PHP 7.4.3');
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const io = socket(server);
const players = new Map();
const playerEmojis = ['😀', '😎', '🤠', '🥳', '😺', '🐼', '🦊', '🐸', '🐵', '🐯', '🐨', '🦁'];

const collectible = {
  id: crypto.randomBytes(16).toString('hex'),
  x: 320,
  y: 240,
  value: 1,
  tier: 'bronze',
  radius: 8,
  color: '#cd7f32'
};

function randomPosition() {
  return {
    x: 20 + Math.floor(Math.random() * 600),
    y: 20 + Math.floor(Math.random() * 440)
  };
}

function randomCollectible() {
  const roll = Math.random();
  let tier;

  if (roll < 0.1) {
    tier = {
      tier: 'gold',
      value: 5,
      radius: 4,
      color: '#ffd700'
    };
  } else if (roll < 0.3) {
    tier = {
      tier: 'silver',
      value: 3,
      radius: 6,
      color: '#c0c0c0'
    };
  } else {
    tier = {
      tier: 'bronze',
      value: 1,
      radius: 8,
      color: '#cd7f32'
    };
  }

  return {
    id: crypto.randomBytes(16).toString('hex'),
    ...randomPosition(),
    ...tier
  };
}

function publishState() {
  io.emit('update', {
    players: Array.from(players.values()),
    collectible
  });
  io.emit('state', {
    players: Array.from(players.values()),
    collectible
  });
}

io.on('connection', (socket) => {
  const position = randomPosition();
  const player = {
    id: socket.id,
    x: position.x,
    y: position.y,
    score: 0,
    avatar: playerEmojis[players.size % playerEmojis.length]
  };
  players.set(socket.id, player);
  publishState();

  socket.on('move', (input) => {
    let horizontal = 0;
    let vertical = 0;
    let elapsedSeconds = 1 / 60;

    if (typeof input === 'string') {
      if (input === 'up') vertical = -1;
      if (input === 'down') vertical = 1;
      if (input === 'left') horizontal = -1;
      if (input === 'right') horizontal = 1;
    } else if (input && typeof input === 'object') {
      horizontal = Math.max(-1, Math.min(1, Number(input.x) || 0));
      vertical = Math.max(-1, Math.min(1, Number(input.y) || 0));
      elapsedSeconds = Math.max(0, Math.min(0.05, Number(input.elapsedSeconds) || 0));
    }

    const inputLength = Math.hypot(horizontal, vertical);
    if (inputLength > 0) {
      horizontal /= inputLength;
      vertical /= inputLength;
      const speed = 240;
      player.x += horizontal * speed * elapsedSeconds;
      player.y += vertical * speed * elapsedSeconds;
    }

    player.x = Math.max(10, Math.min(630, player.x));
    player.y = Math.max(10, Math.min(470, player.y));

    const dx = player.x - collectible.x;
    const dy = player.y - collectible.y;
    if (Math.sqrt(dx * dx + dy * dy) < 10 + collectible.radius) {
      player.score += collectible.value;
      Object.assign(collectible, randomCollectible());
    }

    publishState();
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    publishState();
  });
});

module.exports = app; // For testing

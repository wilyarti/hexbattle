var animations = [];

var game = {
  score: 0,
  startTime: new Date(),
  speed: 1,
  started: false,
  updated: new Date(),
  gameOver: false,
}
var level = {
  maxNumber: 16,
  damage: 5,
  timeOffset: 8000,
  levelNumber: 1,
  DURATION: 10000,
  scoreElement: document.getElementById('score'),
  misses: 0,
  rate: 1,
  RATE_INTERVAL: .05 //playbackRate will increase by .05 for each letter... so after 20 letters, the rate of falling will be 2x what it was at the start

}
var enemies = [];

let shooter = [0, 0, 0, 0, 0, 0, 0, 0];
const container = document.getElementById("container");


function resetGame() {
  document.getElementById("gameOver").classList.add("hidden-content");
  document.getElementById("startGame").classList.add("hidden-content");

  resetShooter()
  enemies = [];
  clearInterval(cleanupInterval);
  getAllAnimations().forEach(function(anim) {
    anim.pause();
  });
  // remove all animations
  container.querySelectorAll('.enemy-animated').forEach(function (enemy) {
    enemy.parentNode.removeChild(enemy);
  });
  game = {
    score: 0,
    startTime: new Date(),
    speed: 1,
    started: false,
    updated: new Date(),
    gameOver: false,
  }
  level = {
    maxNumber: 16,
    damage: 5,
    timeOffset: 8000,
    levelNumber: 1,
    DURATION: 10000,
    scoreElement: document.getElementById('score'),
    misses: 0,
    rate: 1,
    RATE_INTERVAL: .05 //playbackRate will increase by .05 for each letter... so after 20 letters, the rate of falling will be 2x what it was at the start
  }
}

function start() {
  if (game.started) {
    console.log("Warning: game already started.");
  } else {
    document.getElementById("gameOver").classList.add("hidden-content");
    document.getElementById("startGame").classList.add("hidden-content");
    game.started = true;
    game.startTime = new Date();
    spawn();
    setInterval(main, 100,)
  }
}

function main(elementId) {
  if (game.gameOver) {
    enemies = [];
    game.started = false;
    document.getElementById("gameOver").classList.remove("hidden-content");
    return;
  }
  let currentTime = new Date();
  let timeDiff = currentTime - game.updated; //in ms

  // update score
  if (game.score < 0) {
    game.gameOver = true;
    game.started = false;
  }
  calculateScore();
  // spawn units
  if (timeDiff > level.timeOffset) {
    spawn();
  }
  if (enemies.length === 0) {
    console.log("No enemies!");
    spawn();
  }
  // level up
  if ((game.score / level.levelNumber) > 50) { // 202/2
    levelUp();
  }
  calculateLevel();
}

function shoot(column) {
  let oldScore = game.score;
  // Lazy update field
  if (shooter[column] == 0) {
    shooter[column]++;
  } else {
    shooter[column]--;
  }
  // Update codex
  let binaryNumber = '';
  for (let i = 0; i < shooter.length; i++) {
    document.getElementById('two' + i).innerText = shooter[i];
    binaryNumber += shooter[i].toString();
  }
  console.log(binaryNumber);
  calculateShooter();
  // Check if matches an enemy
  enemies = enemies.map(enemy => {
    if (typeof enemy === "undefined") {
      return
    }
    if ((parseInt(enemy.value, 16) === parseInt(binaryNumber, 2))) {
      let ship = document.getElementById(enemy.value);
      ship.parentNode.removeChild(ship);
      enemy.bomb.classList.add("explosion");
      animations.find(x => x.code === enemy.value).animation.pause(); // pause animation
      setTimeout(() => { container.removeChild(enemy.bomb)}, 1000);
      game.score += 10;
    } else {
      return enemy;
    }
  });
  // If it does reset numbers
  if (oldScore !== game.score) {
    try {
      calculateScore();
    } catch (e) {
      console.log(e);
    }
    resetShooter();
  }
}

function spawn() {
  console.log("Spawning enemy.");
  let value = getRandomInt(0, level.maxNumber).toString(16);

  let idx = Math.floor(Math.random() * 255);
  let x = (Math.random() * 75) + 'vw';
  let bomb = document.createElement('div');
  //let ship = document.createElement('img');
  let letter = document.createElement('span');
  let letterText = document.createElement('b');
  letterText.textContent = value;
  letterText.classList.add("glow");
  letter.classList.add("enemy-animated");

  letter.id = value;
  //ship.src = "img/Ship_01.png";
  //letter.appendChild(ship);
  letter.appendChild(letterText);
  bomb.appendChild(letter);
  container.appendChild(bomb);
  console.log(bomb);
  let animation = bomb.animate([
    {transform: 'translate3d(' + x + ',-2.5vh,0)'},
    {transform: 'translate3d(' + x + ',82.5vh,0)'}
  ], {
    duration: level.DURATION,
    easing: 'linear',
    fill: 'both'
  });

  animations.push({animation: animation, element: bomb, code: value});
  level.rate = level.rate + level.RATE_INTERVAL;
  animation.playbackRate = level.rate;

  //If an animation finishes, we will consider that as a miss, so we will remove it from the active animations array and increment our miss count
  animation.onfinish = function(e) {
    let target = bomb;
    target.classList.add('missed');
    handleMisses();
  }
// create new enemy
  enemies.push({
    value: value,
    locationX: getRandomInt(1, 7),
    locationY: 1,
    speed: 0,
    alive: true,
    updated: new Date(),
    bomb: bomb
  })
  console.log(enemies);

  // Reset game timer
  game.updated = new Date();
}

function levelUp() {
  // Display level up message
  // maxNumber: 16,
  //   advanceRate: 2500, // ms per square (*5 = total)
  //   damage: 5,
  //   timeOffset: 15000,
  //   levelNumber: 1
  level.levelNumber++;
  level.maxNumber *= 2;
  // Increase difficulty parameters
  calculateLevel();

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateShooter() {
  let binaryNumber = '';
  for (let i = 0; i < shooter.length; i++) {
    binaryNumber += shooter[i].toString();
  }
  document.getElementById("code").innerText = parseInt(binaryNumber, 2).toString(16);
}

function resetShooter() {
  for (let i = 0; i < 8; i++) {
    document.getElementById("two" + i).innerText = "0";
    shooter[i] = 0;
  }
  calculateShooter();
}

function calculateScore() {
  document.getElementById("score").innerText = game.score;
}

function calculateLevel() {
  document.getElementById("level").innerText = level.levelNumber;
}


//Periodically remove missed elements, and lower the interval between falling elements
var cleanupInterval = setInterval(function () {
  level.timeOffset = level.timeOffset * 4 / 5;
  cleanup();
}, 20000);

function cleanup() {
  container.querySelectorAll('.missed').forEach(function (missed) {
    container.removeChild(missed);
  });
}

//Firefox 48 supports document.getAnimations as per latest spec, Chrome 52 and polyfill use older spec
function getAllAnimations() {
  if (document.getAnimations) {
    return document.getAnimations();
  } else if (document.timeline && document.timeline.getAnimations) {
    return document.timeline.getAnimations();
  }
  return [];
}

//When a miss is registered, check if we have reached the max number of misses
function handleMisses() {
  level.misses++;
  game.score = game.score - (1 * level.damage);
  let missedMarker = document.querySelector('.misses:not(.missed)');
  if (missedMarker) {
    missedMarker.classList.add('missed');
  } else {
    //game.gameOver = true;
  }
}

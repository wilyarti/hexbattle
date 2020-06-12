let game = {
  score: 0,
  startTime: new Date(),
  speed: 1,
  started: false,
  updated: new Date(),
  gameOver: false
}
let level = {
  maxNumber: 16,
  advanceRate: 2500, // ms per square (*5 = total)
  damage: 5,
  spawnTime: 15000,
  levelNumber: 1
}
let enemies = [];

let shooter = [0, 0, 0, 0, 0, 0, 0, 0];
const container = document.getElementById("container");


function resetGame() {
  document.getElementById("gameOver").classList.add("hidden-content");
  document.getElementById("startGame").classList.add("hidden-content");
  game.started = true;
  game.startTime = new Date();
  resetShooter()
  enemies = [];
  level = {
    maxNumber: 16,
    advanceRate: 2500, // ms per square (*5 = total)
    damage: 5,
    spawnTime: 15000,
    levelNumber: 1
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
  // move/delete units
  enemies = enemies.filter(function (enemy) {
    if (typeof enemy === "undefined") {
      // delete
      console.log("Blank enemy. Deleting.")
      return
    }
    if (currentTime - enemy.updated > level.advanceRate) {
      if (enemy.locationY === 6) {
        game.score -= level.damage;
        console.log("Game over.");
        container.removeChild(enemy.cell);
        // delete
        return
      } else {
        enemy.locationY++;
        console.log("Enemy to be moved");
        enemy.cell.style.gridColumnStart = enemy.locationX;
        enemy.cell.style.gridRowStart = enemy.locationY;
        let text = document.createElement("div");
        text.classList.add("enemy");
        text.innerText = enemy.value;
        enemy.cell.append(text);
        enemy.cell.append(enemy.bomb);
        container.appendChild(enemy.cell);
        enemy.updated = new Date();
        // update and move
      }
    }
    // loop or return updated
    return enemy;
  });
  // update score
  if (game.score < 0) {
    game.gameOver = true;
    game.started = false;
  }
  calculateScore();
  // spawn units
  if (timeDiff > level.spawnTime) {
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
      container.removeChild(enemy.cell);
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
  // create new enemy
  let bomb = document.createElement("img")
  bomb.src = "img/bomb.svg"
  bomb.classList.add("grid-img")
  enemies.push({
    value: getRandomInt(0, level.maxNumber).toString(16),
    locationX: getRandomInt(1, 7),
    locationY: 1,
    speed: 0,
    alive: true,
    updated: new Date(),
    cell: document.createElement("div"),
    bomb: bomb
  })
  // Reset game timer
  game.updated = new Date();
}

function levelUp() {
  // Display level up message
  // maxNumber: 16,
  //   advanceRate: 2500, // ms per square (*5 = total)
  //   damage: 5,
  //   spawnTime: 15000,
  //   levelNumber: 1
  level.maxNumber *=2;
  level.advanceRate *= 0.80;
  level.damage *= 2;
  level.spawnTime *= 0.80;
  level.levelNumber++;
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

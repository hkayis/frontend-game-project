/*Alp: I fixed the problem where the new tile is put in the last deleted tiles location */
const cover = document.getElementById("cover");
const countdown = document.getElementById("countdown");
const game = document.getElementById("game");
const endScreen = document.getElementById("end");

const countText = document.getElementById("countText");
const board = document.getElementById("board");

const scoreEl = document.getElementById("score");
const hiscoreEl = document.getElementById("hiscore");
const timeEl = document.getElementById("time");

const pointFill = document.getElementById("pointFill");
const endText = document.getElementById("endText");

let score = 0;
let timeLeft = 10;
let pointValue = 10;
let blackTiles = /* new */ []; /*Alp: Should we use a hashset or map?*/
let gameActive = false;
let pointIntervalId = null;
const endHiScoreEl = document.getElementById("endHiScore");



let hiscore = Number(localStorage.getItem("hiscore")) || 0;
hiscoreEl.textContent = hiscore;

/* cover*/
cover.addEventListener("click", () => {
  cover.classList.remove("active");
  startCountdown();
});

/* cntdown*/
function startCountdown() {
  countdown.classList.add("active");
  let n = 3;
  countText.textContent = n;

  const interval = setInterval(() => {
    n--;
    if (n === 0) {
      clearInterval(interval);
      countdown.classList.remove("active");
      startGame();
    } else {
      countText.textContent = n;
    }
  }, 1000);
}

/* game*/
function startGame() {
  game.classList.add("active");
  gameActive = true;
  score = 0;
  scoreEl.textContent = score;

  createBoard();
  spawnInitialBlackTiles();
  startTimer();
  resetPointBar();
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.idx = i;
    board.appendChild(cell);
  }
}

function spawnInitialBlackTiles() {
  blackTiles = [];

  while (blackTiles.length < 3) {
    const idx = Math.floor(Math.random() * 16);
    if (!blackTiles.includes(idx)) {
      blackTiles.push(idx);
    }
  }

  renderBlackTiles();
}


function spawnOneBlackTile(blockedIdx) {
  let idx;
  do {
    idx = Math.floor(Math.random() * 16);
  } while (blackTiles.includes(idx) || idx === blockedIdx);

  blackTiles.push(idx);
  const cell = board.children[idx];
  cell.classList.add("black", "fade");
}

function renderBlackTiles() {
  [...board.children].forEach((cell, i) => {
    cell.className = "cell";
    if (blackTiles.includes(i)) {
      cell.classList.add("black");
    }
  });
}


board.addEventListener("click", (e) => {
  if (!gameActive) return;

  const cell = e.target;
if (!cell.classList.contains("cell")) return;

  const idx = Number(cell.dataset.idx);
  if (!blackTiles.includes(idx)) return;

  blackTiles = blackTiles.filter(i => i !== idx);
  /*Alp: I fixed this part it should be 0 instead of 1, the player must get no points if the time exceeds*/ 
  const earned = Math.max(0, pointValue);

  cell.className = "cell hit";
  cell.textContent = `+${earned}`;

  score += earned;
  scoreEl.textContent = score;

  setTimeout(() => {
    cell.textContent = "";
    cell.className = "cell";
  }, 300);

  spawnOneBlackTile(idx);
  resetPointBar();
});


/* pointBAr*/
function resetPointBar() {
  // eski interval varsa kapat (asıl fix bu)
  if (pointIntervalId !== null) {
    clearInterval(pointIntervalId);
    pointIntervalId = null;
  }

  // puanı sıfırla
  pointValue = 10;

  // barı resetle (100% -> 0% animasyon)
 pointFill.style.transition = "none";
pointFill.style.width = "100%";

setTimeout(() => {
  pointFill.style.transition = "width 1s linear";
  pointFill.style.width = "0%";
}, 10);


  // puan düşüşünü başlat
  pointIntervalId = setInterval(() => {
    pointValue = Math.max(0, pointValue - 1);
    if (!gameActive || pointValue === 0) {
      clearInterval(pointIntervalId);
      pointIntervalId = null;
    }
  }, 100);
}


/* timer (Time goes down from 10 to 0)*/
function startTimer() {
  timeLeft = 10;
  timeEl.textContent = timeLeft;

  const timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft === 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

/* end (
(5Pts) “F5 to play again” text with CSS animation appears
b. (5Pts) “Time is up” text message (no hiscore case)
c. (5Pts) “New HiScore” text appears (hiscore case)
d. (5Pts) A confetti plays for three seconds (hiscore case))*/
function endGame() {
  gameActive = false;
  game.classList.remove("active");
  endScreen.classList.add("active");

  if (score > hiscore) {
    hiscore = score;
    localStorage.setItem("hiscore", hiscore);
    endText.textContent = "New High Score!";
    launchConfetti();
  } else {
    endText.textContent = "Time is up!";
  }
   endHiScoreEl.textContent = hiscore;
  hiscoreEl.textContent = hiscore;
}

/* confetti*/
function launchConfetti() {
  const end = Date.now() + 3000;
  const interval = setInterval(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (Date.now() > end) clearInterval(interval);
  }, 300);
}

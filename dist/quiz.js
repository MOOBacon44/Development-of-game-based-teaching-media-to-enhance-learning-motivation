import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore,doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
  
const firebaseConfig = {
  apiKey: "AIzaSyB1mKfR5r6BovgxvpnlENum-CuwJN_HadE",
  authDomain: "d-44-6e5df.firebaseapp.com",
  projectId: "d-44-6e5df",
  storageBucket: "d-44-6e5df.firebasestorage.app",
  messagingSenderId: "323300555854",
  appId: "1:323300555854:web:5973150527095c380ed71f",
  measurementId: "G-ZQKFL63WL2"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

// ----------------------------
// Elements
// ----------------------------
const questionEl = document.getElementById('quiz_Question');
const hpBarEl = document.getElementById('hpBarCanvas');
const trueBtn = document.getElementById('quiz_T');
const falseBtn = document.getElementById('quiz_F');
const sfx = document.getElementById('sfx') || new Audio();
sfx.volume = 1.0;
const bgm = document.getElementById('bgm');
if (bgm) bgm.volume = 1.0;
const audioCache = new Map();
const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const restart = document.getElementById("restart");
const exit = document.getElementById("exit");

// ----------------------------
// Game State
// ----------------------------
let ani_fin = 0;
let quizData;
let currentQuestionIndex = 0;
let currentStreak = 0;
let score = 0;
let maxHP = 0;
let currentQuestion = null;

const baseScore = 10;
const bonusPerStreak = 5;

// Prevent double click input
let inputCooldown = false;

// Animation intervals
let chAnimInterval = null;
let idleChInterval = null;
let idleEnInterval = null;

// ----------------------------
// Render Text Helper
// ----------------------------
function renderTextToDiv(el, text, font, color) {
  if (!el) return;
  el.style.color = color || 'white';
  el.style.font = font || '16px Sriracha';
  el.style.textAlign = 'center';
  el.style.whiteSpace = 'pre-wrap';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.innerText = text;
}

// ----------------------------
// HP Bar
// ----------------------------

function drawHPBar(currentHP, maxHP) {
  if (!hpBarEl) return;

  const ratio = Math.max(0, currentHP) / maxHP;

  hpBarEl.innerHTML = '';
  hpBarEl.style.display = 'flex';
  hpBarEl.style.alignItems = 'center';
  hpBarEl.style.justifyContent = 'center';
  hpBarEl.style.position = 'relative';
  hpBarEl.style.border = '2px solid white';
  hpBarEl.style.background = '#222';
  hpBarEl.style.boxSizing = 'border-box';

  // HP BAR FILL
  const fill = document.createElement('div');
  fill.style.position = 'absolute';
  fill.style.left = '0';
  fill.style.top = '0';
  fill.style.bottom = '0';
  fill.style.width = `${Math.round(ratio * 100)}%`;
  fill.style.background = ratio > 0.6 ? 'lime' :
                          ratio > 0.3 ? 'orange' : 'red';
  fill.style.transition = 'width 300ms linear';
  hpBarEl.appendChild(fill);

  // HP TEXT
  const text = document.createElement('div');
  text.style.position = 'relative';
  text.style.zIndex = '1';
  text.style.color = 'white';
  text.style.font = '16px "Caveat", cursive';
  text.innerText = `${currentHP} / ${maxHP}`;
  hpBarEl.appendChild(text);
}

// ----------------------------
// SFX
// ----------------------------

function bigClick() { playSfx("../src/audi/game-start.mp3"); }
function normalClick() { playSfx('../src/audi/button-click.mp3'); }
function createClick() { playSfx('../src/audi/select-sound.mp3'); }
function sfxhurt() { playSfx('../src/audi/hurt.mp3'); }
function bonus() { playSfx('../src/audi/bonus.mp3'); }
function lose() { playSfx('../src/audi/lose.mp3'); }
function pull() { playSfx('../src/audi/pull.mp3'); }
function playSfx(src) {
  if (!src) return;
  try {
    // prefer cached audio element so repeated sounds start immediately
    let a = audioCache.get(src);
    if (a) {
      // clone behavior: reset time and play the cached instance
      try { a.currentTime = 0; } catch (e) { /* some browsers restrict */ }
      a.play().catch(err => console.warn('SFX play failed:', err));
      return;
    }

    // fallback to using the shared sfx element (in DOM) to avoid creating many Audio objects
    if (sfx) {
      if (!sfx.paused) {
        // stop any current sfx immediately for UI sounds like 'pull'
        try { sfx.pause(); } catch(e) {}
      }
      sfx.src = src;
      try { sfx.currentTime = 0; } catch(e){}
      sfx.load();
      sfx.play().catch(err => console.warn('SFX play failed:', err));
      return;
    }

    // final fallback: create a short-lived Audio
    const tmp = new Audio(src);
    tmp.volume = 1.0;
    tmp.play().catch(err => console.warn('SFX play failed:', err));
  } catch (e) {
    console.warn('SFX error:', e);
  }
}
function dashboard() {
  playSfx('../src/audi/win.mp3');
  bgm.pause();
  bgm.currentTime = 0;
}

function preloadAudio(src) {
  try {
    if (audioCache.has(src)) return;
    const a = new Audio(src);
    a.preload = 'auto';
    // start load; browsers may defer but setting src helps reduce delay later
    a.load();
    audioCache.set(src, a);
  } catch (e) {
    console.warn('preloadAudio failed:', e);
  }
}
let musicAudio = null;
function music() {
  if (!bgm) return;
  bgm.muted = true;
  const src = '../src/audi/quiz.mp3';

  // if we have a cached music audio, reuse it and avoid starting multiple plays
  if (musicAudio && !musicAudio.paused) return;

  musicAudio = audioCache.get(src) || new Audio(src);
  musicAudio.loop = false;
  musicAudio.volume = 1.0;
  try { musicAudio.currentTime = 0; } catch(e){}
  musicAudio.play().catch(err => console.warn('Music play failed:', err));
}
// ----------------------------
// Question Display
// ----------------------------
function displayQuestion(index) {
  if (!quizData) return;
  if (index >= quizData.questions.length) {
     endQuiz();
     return;
  }
 
  const question = quizData.questions[index];
  if (!question || typeof question.answer === 'undefined') return;

  currentQuestion = question;

  renderTextToDiv(questionEl, question.question, '40px Sriracha', 'white');
  renderTextToDiv(trueBtn, 'True', '36px Caveat', 'green');
  renderTextToDiv(falseBtn, 'False', '36px Caveat', 'red');
}

// ----------------------------
// Check Answer
// ----------------------------
function checkAnswer(selectedSide) {
  if (inputCooldown) return;
  inputCooldown = true;
  document.getElementById("butn").style.display = "none";
  const isCorrect =
    (selectedSide === 'left' && currentQuestion.answer === true) ||
    (selectedSide === 'right' && currentQuestion.answer === false);

  shoot(() => {
    if (isCorrect) {
      sfxhurt();
      hurt(() => {
        currentStreak++;
        const pointsEarned = baseScore + (currentStreak - 1) * bonusPerStreak;
        score += pointsEarned;
        updateStreakImages();
        drawHPBar(maxHP - score, maxHP);
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
        setTimeout(() => { inputCooldown = false, document.getElementById("butn").style.display = "flex";}, 500);
      })
    } else {
      currentStreak = 0;
      updateStreakImages();
      drawHPBar(maxHP - score, maxHP);
      currentQuestionIndex++;
      displayQuestion(currentQuestionIndex);
      setTimeout(() => { inputCooldown = false,document.getElementById("butn").style.display = "flex"; }, 500);
    }
  });
}

// ----------------------------
// Streak Images
// ----------------------------
let bonusPlayed = false;
let losePlayed = false;

function updateStreakImages() {
  for (let i = 0; i < 5; i++) {
    const streakElement = document.getElementById(`streak-${i}`);
    if (!streakElement) continue;

    streakElement.style.backgroundImage = i < currentStreak 
      ? "url('../src/sprites/ston.png')" 
      : "url('../src/sprites/stof.png')";
  }

  // Play sounds based on streak change
  if (currentStreak > 0 && !bonusPlayed) {
    bonus();
    bonusPlayed = true;
    losePlayed = false;
  }

  if (currentStreak === 0 && !losePlayed) {
    lose();
    losePlayed = true;
    bonusPlayed = false;
  }
}

// ----------------------------
// Animations
// ----------------------------
function shoot(callback, mute = false) {
  const ch = document.getElementById("ch");
  clearInterval(chAnimInterval);
  let frame = 0;

  chAnimInterval = setInterval(() => {
    if (frame === 0) {
      ch.style.backgroundImage = "url('../src/sprites/s1.png')";
    } else if (frame === 1) {
      ch.style.backgroundImage = "url('../src/sprites/s2.png')";
    } else if (frame === 2) {
      ch.style.backgroundImage = "url('../src/sprites/s3.png')";
    } else if (frame === 3) {
      if (!mute) pull();
      clearInterval(chAnimInterval);
      idleCh();
      if (callback) callback();
      ani_fin++;
      checkLoader(); // check after shoot finishes
      return;
    }
    frame++;
  }, 300);
}

function hurt(callback) {
  const en = document.getElementById("en");

  // Flash effect
  en.style.filter = "brightness(150%) sepia(100%) hue-rotate(-50deg) saturate(500%)";

  setTimeout(() => {
    en.style.filter = "";
    idleEn();
    if (callback) callback();
  }, 300);
}


function idleCh() {
  const ch = document.getElementById("ch");
  clearInterval(idleChInterval);
  let frame = 0;
  const chImg = ["url('../src/sprites/ig_1.png')","url('../src/sprites/ig_2.png')"];
  idleChInterval = setInterval(() => {
    ch.style.backgroundImage = chImg[frame];
    frame = 1 - frame;
  }, 300);
}

function idleEn() {
  const en = document.getElementById("en");
  clearInterval(idleEnInterval);
  let frame = 0;
  const enImg = ["url('../src/sprites/e1.png')","url('../src/sprites/e2.png')"];
  idleEnInterval = setInterval(() => {
    en.style.backgroundImage = enImg[frame];
    frame = 1 - frame;
  }, 100);
  
}

function flashStreakIcons() {
  for (let i = 0; i < 5; i++) {
    const streakElement = document.getElementById(`streak-${i}`);
    if (!streakElement) continue;

    streakElement.style.backgroundImage = "url('../src/sprites/ston.png')";
    setTimeout(() => {
      streakElement.style.backgroundImage = "url('../src/sprites/stof.png')";
      ani_fin++;
      checkLoader();
    }, 3000);
  }
}

// ----------------------------
// Preload Images
// ----------------------------
function preloadImages(imagePaths, callback) {
  let loadedCount = 0;
  const total = imagePaths.length;
  imagePaths.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = img.onerror = () => {
      loadedCount++;
      if (loadedCount === total && callback) callback();
    };
  });
}

// ----------------------------
// Calculate Max Score
// ----------------------------
function calculateMaxScore(totalQuestions) {
  let maxScore = 0;
  for (let i = 0; i < totalQuestions; i++) {
    maxScore += baseScore + i * bonusPerStreak;
  }
  return maxScore;
}

// ----------------------------
// End Quiz
// ----------------------------
function endQuiz() {

      overlay.style.display = "block";
      const performance = ((score / maxHP) * 100).toFixed(0);
      const resultText = `\nDamage Dealt: ${score}\nEnemy HP Remaining: ${maxHP - score}\nPerformance: ${performance}%`;

      renderTextToDiv(popup, resultText, '46px Caveat', 'lime');
      renderTextToDiv(restart, 'Restart', '36px Caveat', 'yellow');
      renderTextToDiv(exit, 'Exit', '36px Caveat', 'red');

      drawHPBar(maxHP - score, maxHP);
      dashboard();
      restart.onclick = () => { bigClick(); setTimeout(() => location.reload(), 1000); };
      exit.onclick = () => { bigClick(); setTimeout(() => window.location.href = "index.html", 1000); };
  
}


function checkLoader() {
 
  const loader = document.getElementById("loadsc");
  document.getElementById("butn").style.display = "none";
  setTimeout(() => {
    if (ani_fin >= 2) {
    loader.style.display = "none";
    document.getElementById("butn").style.display = "flex";
    document.body.classList.remove('loading');
    music();
    ani_fin = 0; 
  }
  }, 2000);
   
}

// ----------------------------
// Initialize Game
// ----------------------------
window.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');
  if (!quizId) { console.error("No quiz ID provided in URL."); return; }

  try {
    const docSnap = await getDoc(doc(db, "publicQuizzes", quizId));
    if (!docSnap.exists()) { console.error("Quiz not found in Firebase."); return; }
    quizData = docSnap.data();
    if (!quizData?.questions?.length) { console.error("Invalid quiz data."); return; }

    maxHP = calculateMaxScore(quizData.questions.length);
    drawHPBar(maxHP - score, maxHP);
    displayQuestion(currentQuestionIndex);

    trueBtn?.addEventListener('click', () => { normalClick(); checkAnswer('left'); });
    falseBtn?.addEventListener('click', () => { normalClick(); checkAnswer('right'); });

  } catch (error) { console.error("Failed to fetch quiz:", error); }
});

// ----------------------------
// Window Load
// ----------------------------
window.onload = function () {
  const imagesToPreload = [
    "../src/sprites/ig_1.png","../src/sprites/ig_2.png",
    "../src/sprites/e1.png","../src/sprites/e2.png","../src/sprites/e3.png",
    "../src/sprites/s1.png","../src/sprites/s2.png","../src/sprites/s3.png",
    "../src/sprites/ston.png","../src/sprites/stof.png"
  ];

  // preload images
  preloadImages(imagesToPreload, () => {
    shoot(null, true);
    flashStreakIcons();
    idleEn();
  });

  // preload common SFX to remove delay (including pull)
  [
    "../src/audi/game-start.mp3",
    "../src/audi/button-click.mp3",
    "../src/audi/select-sound.mp3",
    "../src/audi/pull.mp3",
    "../src/audi/hurt.mp3",
    "../src/audi/bonus.mp3",
    "../src/audi/lose.mp3",
    "../src/audi/quiz.mp3",
    "../src/audi/win.mp3"
  ].forEach(preloadAudio);

  const loader = document.getElementById("loadsc");
  if (loader) {
    loader.style.display = "flex";
    document.body.classList.add('loading');
  }

  window.normalClick = normalClick;
  window.createClick = createClick;
};

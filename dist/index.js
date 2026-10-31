import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
  
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

function addQuestion() {
  const container = document.getElementById("questionsContainer");
  const questionDiv = document.createElement("div");
  questionDiv.classList.add("question");

  const questionInput = document.createElement("input");
  questionInput.type = "text";
  questionInput.style.fontSize = "20px";
  questionInput.placeholder = "Enter your question";
  questionInput.style.marginBottom = "16px";
  questionInput.style.backgroundColor = "#f7e8d5";
  questionInput.style.color = "#7f541b";
  questionInput.required = true;
  const trueOption = document.createElement("label");

  trueOption.style.fontSize = "20px";
  trueOption.style.color = "#7f541b";
  trueOption.innerHTML = `
      <input type="radio" name="answer${container.children.length}" value="true" required> True
  `;

  const falseOption = document.createElement("label");
  falseOption.style.fontSize = "20px";
  falseOption.style.color = "#7f541b";
  falseOption.innerHTML = `
      <input type="radio" name="answer${container.children.length}" value="false"> False
  `;

  questionDiv.appendChild(questionInput);
  questionDiv.appendChild(trueOption);
  questionDiv.appendChild(falseOption);

  container.appendChild(questionDiv);
}

function closeQuizForm() {
  document.getElementById("bill").style.display = "block";
  document.getElementById("popupOverlay").style.display = "none";
  document.getElementById("quizCreationForm").style.display = "none";
  document.getElementById("questionsContainer").innerHTML = "";
}

function popUpQuizForm() {
  document.getElementById("popupOverlay").style.display = "block";
}

function collectQuizData() {
  const title = document.getElementById("quizTitle").value.trim();
  const description = document.getElementById("quizDes").value.trim();

  if (!title) {
    alert("Quiz title is required.");
    return null;
  }

  const questions = [];
  const questionElements = document.querySelectorAll("#questionsContainer .question");

  questionElements.forEach((questionEl) => {
    const questionText = questionEl.querySelector("input[type='text']").value.trim();
    const selectedAnswer = questionEl.querySelector("input[type='radio']:checked")?.value;

    if (questionText && selectedAnswer !== null) {
      questions.push({
        question: questionText,
        answer: selectedAnswer === "true"
      });
    }
  });

  if (questions.length === 0) {
    alert("Add at least one question.");
    return null;
  }

  return {
    title,
    description,
    questions
  };
}

function generateQuizCode(title) {
  const cleanTitle = title.trim().toLowerCase().replace(/\s+/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanTitle}-${randomNum}`;
}

function hoverIn(){
  const clipElement = document.getElementById("clip");
  const mainlist = document.getElementById("main_list");
  function changeOut() {
    clipElement.style.backgroundImage = "url('../src/sprites/o.png')";
  }
  function changeDef() {
    clipElement.style.backgroundImage = "url('../src/sprites/p.png')";
  }
  if (mainlist){
    mainlist.addEventListener('mouseenter', changeDef);
    mainlist.addEventListener('mouseleave', changeOut);
  }
}
function choverIn(){
  const clipElement = document.getElementById("createQuiz");
  const mainlist = document.getElementById("createQuiz");
  function changeOut() {
    clipElement.style.backgroundImage = "url('../src/sprites/create.png')";
  }
  function changeDef() {
    clipElement.style.backgroundImage = "url('../src/sprites/cq.png')";
  }
  if (mainlist){
    mainlist.addEventListener('mouseenter', changeDef);
    mainlist.addEventListener('mouseleave', changeOut);
  }
}
  const sfxElement = document.getElementById('sfx');
  const sfx = sfxElement || new Audio();

  async function playSfx(src) {
  if (!src) return;

  // candidate paths to try (original, absolute-root)
  const candidates = [
    src,
    src.replace(/^\.\//, ''),            // remove leading ./ 
    src.replace(/^\.\.\//, ''),          // remove leading ../
    '/' + src.replace(/^\.\//, ''),      // absolute from site root
    '/' + src.replace(/^\.\.\//, '')     // absolute from site root (strip ..)
  ].filter(Boolean);

  let okSrc = null;
  for (const c of candidates) {
    try {
      // HEAD check to see if the resource exists & is reachable
      const res = await fetch(c, { method: 'HEAD' });
      if (res.ok) { okSrc = c; break; }
    } catch (e) {
      // network/error — try next candidate
    }
  }

  if (!okSrc) {
    console.warn('SFX not found or unsupported for any candidate paths:', candidates);
    return;
  }

  try {
    const el = sfxElement || sfx; // reuse DOM <audio> if present
    el.src = okSrc;
    if (el.load) el.load();
    try { el.currentTime = 0; } catch {}
    await el.play().catch(err => console.warn('SFX play failed:', err));
  } catch (e) {
    console.warn('SFX error:', e);
  }
}

  function bigClick() {

    playSfx("../src/audi/button-click.mp3");
  }
  function normalClick() {
    playSfx('../src/audi/button-click.mp3');
  }
  function createClick() {
    playSfx('../src/audi/select-sound.mp3');
  }
  function fadeOutAudio(bgm, durationMs) {
    const initialVolume = bgm.volume;
    const fadeInterval = 50; // milliseconds
    let currentVolume = initialVolume;
    const volumeDecrement = initialVolume / (durationMs / fadeInterval);

    const fadeOut = setInterval(() => {
      currentVolume -= volumeDecrement;
      if (currentVolume <= 0) {
        bgm.volume = 0;
        bgm.pause(); // Optional: pause the audio when fully faded
        clearInterval(fadeOut);
      } else {
        bgm.volume = currentVolume;
      }
    }, fadeInterval);
}

const bgm = document.getElementById('bgm');
function playAudio() {
    if (!bgm) {bgm.src = "../src/audi/music.mp3"; return;}
    try {
      // set loop on the audio element itself and ensure bgm exists before using its properties
      bgm.loop = true;
      if (!bgm.paused) return; // avoid re-starting if already playing
      bgm.muted = false;
      bgm.play().catch(error => console.log("Audio play failed:", error));
    } catch (e) {
      console.warn('Audio error:', e);
    }
}
window.onload = function () {

  const imagesToPreload = [
    "../src/sprites/cq.png","../src/sprites/create.png",
    "../src/sprites/n.png","../src/sprites/o.png","../src/sprites/p.png","../src/sprites/pen.png",
    "../src/sprites/s_icon.png","../src/sprites/plus.png"
  ];
  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
  playAudio();

 document.addEventListener('click', playAudio, { once: true });
    const fontloader = document.getElementById("l1");

  // handle both possible loader elements (old vs new ids)
  const loadscEl = document.getElementById("loadsc");
  const popupEl = document.getElementById("popup");

  // show the correct loader(s)
  if (loadscEl) {
    loadscEl.style.display = "flex";
  }
  if (popupEl) {
    popupEl.style.display = "flex";
  }
  if (fontloader) fontloader.textContent = "ภาษาไทย";
  document.body.classList.add('loading');

  // ensure we only hide once and cancel if re-used
  let hideLoaderTimer = setTimeout(() => {
    // prefer hiding the element that was shown
    if (fontloader) fontloader.textContent = "";
    if (loadscEl) loadscEl.style.display = "none";
    if (popupEl) popupEl.style.display = "none";
    document.body.classList.remove('loading');

    // as a safety, force hide after a short animation frame (overrides CSS specificity)
    requestAnimationFrame(() => {
      if (loadscEl && getComputedStyle(loadscEl).display !== "none") {
        loadscEl.style.setProperty("display", "none", "important");
      }
      if (popupEl && getComputedStyle(popupEl).display !== "none") {
        popupEl.style.setProperty("display", "none", "important");
      }
    });
  }, 1000);

  // optional: expose to debugger to cancel/hide early
  window.__hideLoader = () => { clearTimeout(hideLoaderTimer); hideLoaderTimer = 0; };
    //animate
    hoverIn();
    choverIn();
    const quizForm = document.getElementById("quizForm");
    if (!quizForm) {
      console.error("quizForm element not found!");
      return;
    }
quizForm.onsubmit = function (e) {
  e.preventDefault();

  const quizData = collectQuizData();
  console.log(quizData); // Log the collected quiz data

  if (!quizData) return;

  localStorage.setItem("savedQuiz", JSON.stringify(quizData));
  window.location.href = "quiz_p.html";
};
  document.getElementById("publicQuiz").onclick = async function () {
    bigClick();
    const quizData = collectQuizData();
    const button = document.getElementById("publicQuiz");
    if (!quizData) return;

    const quizCode = generateQuizCode(quizData.title);
    if (!quizCode) return;

    quizData.code = quizCode;

    try {
      const quizRef = doc(collection(db, "publicQuizzes"), quizCode);
      await setDoc(quizRef, quizData);
      alert(`Quiz published! Your quiz code is: ${quizCode}`);
      window.location.href = `quiz_p.html?id=${quizCode}`;
      button.disabled = true; setTimeout(() => {
      button.disabled = false;
    }, 3000);
    } catch (error) {
      console.error("Error publishing quiz:", error);
      alert("Failed to publish quiz.");
    }
     
  };

document.getElementById("search").onclick = async function () {
  normalClick(); 
  const resutagEl = document.getElementById("resutag");
  const inputEl = document.getElementById("searchInput");
  const input = (inputEl?.value || "").trim().toLowerCase();
  resutagEl.style.fontSize = "27px";
  
  const resultsDiv = document.getElementById("quizItems");
  const availableQuizzesEl = document.getElementById("availableQuizzes");
  availableQuizzesEl.style.fontSize = "25px";
  availableQuizzesEl.style.color = "#4f8fb1";
  const buttonEl = document.getElementById("search");

  // Clear previous results
  if (resultsDiv) resultsDiv.replaceChildren();
  if (availableQuizzesEl) availableQuizzesEl.textContent = "";

  if (!input) {
    if (resultsDiv) resultsDiv.style.backgroundColor = "transparent";
    if (availableQuizzesEl) {
      availableQuizzesEl.textContent = "Please enter a search term.";
    }
    if (resutagEl) {
      resutagEl.textContent = "0 result";
    }
    return;
  }
  
  availableQuizzesEl.style.padding = '18px';
  availableQuizzesEl.textContent ='Loading....';
  try {
    const querySnapshot = await getDocs(collection(db, "publicQuizzes"));

    // Use a Map keyed by doc id (or fallback to title|description) to avoid duplicates
    const uniqueMap = new Map();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const title = (data.title || "").toLowerCase();
      const description = (data.description || "").toLowerCase();

      // Redirect if input exactly matches quiz ID
      if (id.toLowerCase() === input) {
        window.location.href = `quiz_p.html?id=${id}`;
        return;
      }

      if (title.includes(input) || description.includes(input)) {
        const key = id || `${title}|${description}`;
        if (!uniqueMap.has(key)) uniqueMap.set(key, { id, ...data });
      }
    });

    const size = uniqueMap.size;
    if (resutagEl) resutagEl.textContent = `${size} result${size === 0|| 1 ? "" : "s"}`;
 
    if (size === 0) {
      if (resultsDiv) resultsDiv.style.backgroundColor = "transparent";
      if (availableQuizzesEl) availableQuizzesEl.textContent = "No matching quizzes found.";
      return;
    }
     // render unique results
    if (resultsDiv) {
      resultsDiv.style.display = "block";
      resultsDiv.style.backgroundColor = "#c7ebff";
    } 
    for (const quiz of uniqueMap.values()) {
      
      const li = document.createElement("li");
      li.className = "quiz-item cursor-pointer";
      li.innerHTML = `
        <div class="flex flex-col space-y-1.5 p-3">
          <span id="l3" class="text-xl font-semibold">${escapeHtml(quiz.title || "")}</span>
          <p id="l3" class="text-sm">${escapeHtml(quiz.description || "")}</p>
          <div id="l3" class="mt-2 inline-block px-3 py-1 bg-blue-200 w-fit h-auto">Take a quiz</div>
        </div>
      `; 
      li.addEventListener('click', () => {
        const myAudio = document.getElementById('bgm');
        myAudio.volume = 0.1; 
        setTimeout(() => {
          fadeOutAudio(myAudio, 1000);
        }, 1000); 
        bigClick();
        setTimeout(() =>{
          window.location.href = `quiz_p.html?id=${quiz.id}`;
        },2000);
      });
      availableQuizzesEl.textContent = '';     
      resultsDiv.appendChild(li);

      buttonEl.disable = true;
       setTimeout(() => {
      buttonEl.disabled = false;
    }, 100); 
    }

  } catch (error) {
    console.error("Error fetching quizzes:", error);
    alert("Failed to fetch quiz data. Please try again later.");
  } finally {
    if (inputEl) inputEl.value = "";
  }
};

const _searchInput = document.getElementById("searchInput");
if (_searchInput) {
  _searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchBtn = document.getElementById("search");
      if (searchBtn) searchBtn.click();
    }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
}
  document.getElementById("createQuiz").onclick = function () {
    normalClick();
    document.getElementById("quizCreationForm").style.display = "block";
    document.getElementById("bill").style.display = "none";

  };

  document.getElementById("addQuestion").onclick = function (e) {
    createClick();
    e.preventDefault();
    addQuestion();
  };

  document.getElementById("cancelQuiz").onclick = function (e) {
    normalClick();
    e.preventDefault();
    popUpQuizForm();
  };

  document.getElementById("closeQuiz").onclick = function () {
    normalClick();
    closeQuizForm();
    console.log("Quiz creation cancelled.");
  };

  document.getElementById("keepEditing").onclick = function () {
    normalClick();
    document.getElementById("popupOverlay").style.display = "none";
  };
  
  document.getElementById("qr").onclick = function () {
     bigClick();
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSdf-p8Cy0XqtPaYTgSjkoQanyzTNtmsfGmIaWGyaA4TCqLqAw/viewform?usp=header";
  };
function hideLoaders() {
  try {
    const loadscEl = document.getElementById("loadsc");
    const popupEl = document.getElementById("popup");
    if (loadscEl) {
      loadscEl.style.display = "none";
      loadscEl.style.setProperty("display", "none", "important");
    }
    if (popupEl) {
      popupEl.style.display = "none";
      popupEl.style.setProperty("display", "none", "important");
    }
    document.body.classList.remove("loading");
  } catch (err) {
    console.warn("hideLoaders error:", err);
  }
}

// run on load and ensure fallback runs even if an error occurs elsewhere
window.addEventListener("load", () => {
  // normal hide after 1s
  setTimeout(hideLoaders, 1000);

  // guaranteed force-hide after 5s as a safety net
  setTimeout(hideLoaders, 5000);
});

// also remove loader if any uncaught error/rejection happens
window.addEventListener("error", () => setTimeout(hideLoaders, 50));
window.addEventListener("unhandledrejection", () => setTimeout(hideLoaders, 50));


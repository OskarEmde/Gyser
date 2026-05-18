const scenes = document.querySelectorAll(".scene");

let inventory = [];
let selectedItem = null;
let demonTimer = null;
let timeLeft = 30;
let demonsLeft = 3;
let satanDialogIndex = 0;

let checkpointScene = "scene-intro";
let checkpointInventory = [];
let checkpointSelectedItem = null;

const satanDialogLines = [
  {
    speaker: "Kai",
    text: "Vent.. er det.. er det dig, Mara!?"
  },
  {
    speaker: "Satan",
    text: "Måske én gang... men ikke længere."
  },
  {
    speaker: "Kai",
    text: "Hvad har du gjort her!?"
  },
  {
    speaker: "Kai",
    text: "Mara! Mara!? Kan du høre mig!?"
  },
  {
    speaker: "Satan",
    text: "Giv op, hun er død og væk. Ligesom du vil være."
  },
  {
    speaker: "Kai",
    text: "Nej, jeg tror dig ikke!"
  }
];

/* =========================
   SCENE SKIFT
========================= */

function showScene(sceneId) {
  scenes.forEach(scene => scene.classList.remove("active"));

  const nextScene = document.getElementById(sceneId);

  if (!nextScene) {
    console.error("Scene findes ikke:", sceneId);
    return;
  }

  nextScene.classList.add("active");
  renderHotbars();

  if (sceneId === "scene-introduction") {
    playSound("dystert");
  }

  if (sceneId !== "scene-death") {
    checkpointScene = sceneId;
    checkpointInventory = [...inventory];
    checkpointSelectedItem = selectedItem;
  }

  if (sceneId === "scene-demon-room") {
    startDemonRoom();
  }

  if (sceneId === "scene-after-locked-door") {
    playSound("screamSound");

    setTimeout(() => {
      playSound("thoughtSound");
    }, 1200);
  }

  if (sceneId === "scene-inside-closet") {
    playSound("closetSound");
  }

  if (sceneId === "scene-jumpscare") {
    playSound("jumpscareSound");
  }

  if (sceneId === "scene-satan-appears") {
    const roomShakeSound = document.getElementById("roomShakeSound");

    if (roomShakeSound) {
      roomShakeSound.loop = true;
      roomShakeSound.currentTime = 0;
      roomShakeSound.play().catch(() => {});
    }

    satanDialogIndex = 0;

    const satanScene = document.getElementById("scene-satan-appears");

    if (satanScene) {
      satanScene.classList.remove("stop-shake");
    }

    updateSatanDialog();
  }

  /* GOOD ENDING VIDEO */
  if (sceneId === "scene-good-ending-video") {
    const goodEndingVideo = document.getElementById("goodEndingVideo");

    if (goodEndingVideo) {
      goodEndingVideo.pause();
      goodEndingVideo.currentTime = 0;

      setTimeout(() => {
        goodEndingVideo.play().catch(error => {
          console.log("Good ending video kunne ikke starte:", error);
        });
      }, 100);
    }
  }

  /* SEMI GOOD ENDING VIDEO */
  if (sceneId === "scene-semi-good-ending-video") {
    const semiGoodEndingVideo = document.getElementById("semiGoodEndingVideo");

    if (semiGoodEndingVideo) {
      semiGoodEndingVideo.pause();
      semiGoodEndingVideo.currentTime = 0;
      semiGoodEndingVideo.muted = true;

      setTimeout(() => {
        semiGoodEndingVideo.play().catch(error => {
          console.log("Semi good ending video kunne ikke starte:", error);
        });
      }, 100);
    }
  }
}

/* =========================
   LYD
========================= */

function playSound(soundId) {
  const sound = document.getElementById(soundId);

  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

function stopSound(soundId) {
  const sound = document.getElementById(soundId);

  if (sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
  }
}

/* =========================
   INTRO
========================= */

const introScene = document.getElementById("scene-intro");

if (introScene) {
  introScene.onclick = function () {
    const introVideo = document.getElementById("introVideo");

    if (introVideo) {
      introVideo.pause();
      introVideo.muted = true;
      introVideo.currentTime = 0;
    }

    showScene("scene-introduction");
  };
}

/* =========================
   GÅ VIDERE KNAPPER
========================= */

document.querySelectorAll("[data-next]").forEach(button => {
  button.onclick = function (event) {
    event.stopPropagation();
    showScene(button.dataset.next);
  };
});

/* =========================
   INVENTORY
========================= */

function addItem(itemName) {
  if (!inventory.includes(itemName)) {
    inventory.push(itemName);
  }

  renderHotbars();

  if (
    inventory.includes("flashlight") &&
    inventory.includes("key") &&
    inventory.includes("bible")
  ) {
    showScene("scene-door");
  }
}

document.querySelectorAll("[data-item]").forEach(item => {
  item.onclick = function (event) {
    event.stopPropagation();
    addItem(item.dataset.item);
    item.classList.add("hidden");
  };
});

function renderHotbars() {
  const hotbars = document.querySelectorAll(".hotbar");

  hotbars.forEach(hotbar => {
    hotbar.innerHTML = "";

    inventory.forEach(item => {
      const button = document.createElement("button");
      button.className = "hotbar-item";
      button.textContent = getItemName(item);

      if (selectedItem === item) {
        button.classList.add("selected");
      }

      button.onclick = function (event) {
        event.stopPropagation();
        selectedItem = item;
        renderHotbars();
      };

      hotbar.appendChild(button);
    });
  });
}

function getItemName(item) {
  if (item === "flashlight") return "Lommelygte";
  if (item === "key") return "Nøgle";
  if (item === "bible") return "Biblen";
  if (item === "gun") return "Pistol";
  return item;
}

/* =========================
   GÅDE MED KOMMODE
========================= */

const dresser = document.getElementById("dresser");
const riddleBox = document.getElementById("riddleBox");
const nextDoorArrow = document.getElementById("next-door-arrow");

if (dresser) {
  dresser.onclick = function (event) {
    event.stopPropagation();
    showScene("scene-dresser-closeup");
  };
}

document.querySelectorAll("[data-answer]").forEach(answer => {
  answer.onclick = function (event) {
    event.stopPropagation();

    if (answer.dataset.answer === "correct") {
      if (dresser) dresser.classList.add("hidden");
      if (nextDoorArrow) nextDoorArrow.classList.remove("hidden");

      showScene("scene-room");
    } else {
      showScene("scene-death");
    }
  };
});

/* =========================
   DEMON ROOM
========================= */

function startDemonRoom() {
  clearInterval(demonTimer);

  timeLeft = 30;
  demonsLeft = 3;

  const timerElement = document.getElementById("timer");

  if (timerElement) {
    timerElement.textContent = timeLeft;
  }

  document.querySelectorAll(".demon").forEach(demon => {
    demon.classList.remove("hidden");
  });

  playSound("whisperSound");

  demonTimer = setInterval(() => {
    timeLeft--;

    if (timerElement) {
      timerElement.textContent = timeLeft;
    }

    if (timeLeft <= 0 && demonsLeft > 0) {
      clearInterval(demonTimer);
      showScene("scene-death");
    }
  }, 1000);
}

document.querySelectorAll(".demon").forEach(demon => {
  demon.onclick = function (event) {
    event.stopPropagation();

    demon.classList.add("hidden");
    demonsLeft--;

    if (demonsLeft <= 0) {
      clearInterval(demonTimer);
    }
  };
});

/* =========================
   LÅST DØR
========================= */

const lockedDoor = document.getElementById("lockedDoor");
const lockedText = document.getElementById("lockedText");

if (lockedDoor && lockedText) {
  lockedDoor.onclick = function (event) {
    event.stopPropagation();

    if (selectedItem === "key" && demonsLeft <= 0) {
      showScene("scene-after-locked-door");
    } else if (demonsLeft > 0) {
      lockedText.textContent = "Du skal først fjerne alle dæmonerne.";
      lockedText.classList.remove("hidden");
    } else {
      lockedText.textContent = "Døren er låst. Vælg nøglen i hotbaren først.";
      lockedText.classList.remove("hidden");
    }
  };
}

/* =========================
   SKAB
========================= */

const closet = document.getElementById("closet");

if (closet) {
  closet.onclick = function (event) {
    event.stopPropagation();
    showScene("scene-inside-closet");
  };
}

/* =========================
   INDE I SKABET
========================= */

const insideClosetScene = document.getElementById("scene-inside-closet");

if (insideClosetScene) {
  insideClosetScene.onclick = function () {
    showScene("scene-jumpscare");

    setTimeout(() => {
      showScene("scene-demon-dialog");
    }, 1200);
  };
}

/* =========================
   VALG VED DÆMON
========================= */

const attackDemonButton = document.getElementById("attackDemonButton");

if (attackDemonButton) {
  attackDemonButton.onclick = function (event) {
    event.stopPropagation();
    showScene("scene-death");
  };
}

const useFlashlightButton = document.getElementById("useFlashlightButton");

if (useFlashlightButton) {
  useFlashlightButton.onclick = function (event) {
    event.stopPropagation();

    if (inventory.includes("flashlight")) {
      showScene("scene-two-doors");
    } else {
      showScene("scene-death");
    }
  };
}

/* =========================
   TO DØRE - FØRST KOMMER SATAN
========================= */

const leftFinalDoor = document.getElementById("leftFinalDoor");
const rightFinalDoor = document.getElementById("rightFinalDoor");

if (leftFinalDoor) {
  leftFinalDoor.onclick = function (event) {
    event.stopPropagation();
    showScene("scene-satan-appears");
  };
}

if (rightFinalDoor) {
  rightFinalDoor.onclick = function (event) {
    event.stopPropagation();
    showScene("scene-satan-appears");
  };
}

/* =========================
   SATAN DIALOG
========================= */

const satanDialogText = document.getElementById("satanDialogText");
const satanSpeaker = document.getElementById("satanSpeaker");
const satanDialogBox = document.getElementById("satanDialogBox");

function updateSatanDialog() {
  if (!satanDialogText || !satanSpeaker) return;

  satanSpeaker.textContent = satanDialogLines[satanDialogIndex].speaker;
  satanDialogText.textContent = satanDialogLines[satanDialogIndex].text;
}

function continueSatanDialog(event) {
  event.stopPropagation();

  satanDialogIndex++;

  const satanScene = document.getElementById("scene-satan-appears");

  if (satanDialogIndex >= 1 && satanScene) {
    satanScene.classList.add("stop-shake");
    stopSound("roomShakeSound");
  }

  if (satanDialogIndex < satanDialogLines.length) {
    updateSatanDialog();
  } else {
    if (!inventory.includes("gun")) {
      inventory.push("gun");
    }

    selectedItem = "gun";
    renderHotbars();

    satanDialogIndex = 0;
    showScene("scene-satan-riddle");
  }
}

const satanScene = document.getElementById("scene-satan-appears");

if (satanScene) {
  satanScene.onclick = continueSatanDialog;
}

if (satanDialogBox) {
  satanDialogBox.onclick = continueSatanDialog;
}

/* =========================
   SATANS GÅDE - DØRVALG
========================= */

const chooseLeftDoor = document.getElementById("chooseLeftDoor");
const chooseRightDoor = document.getElementById("chooseRightDoor");

if (chooseLeftDoor) {
  chooseLeftDoor.onclick = function (event) {
    event.stopPropagation();
    showScene("scene-semi-good-ending-video");
  };
}

if (chooseRightDoor) {
  chooseRightDoor.onclick = function (event) {
    event.stopPropagation();
    showScene("scene-right-door-choice");
  };
}

/* =========================
   SIDSTE VALG
========================= */

const shootSatan = document.getElementById("shootSatan");
const useBible = document.getElementById("useBible");

if (shootSatan) {
  shootSatan.onclick = function (event) {
    event.stopPropagation();

    if (inventory.includes("gun")) {
      showScene("scene-death");
    } else {
      alert("Du har ikke pistolen.");
    }
  };
}

if (useBible) {
  useBible.onclick = function (event) {
    event.stopPropagation();

    if (inventory.includes("bible")) {
      showScene("scene-good-ending-video");
    } else {
      showScene("scene-death");
    }
  };
}

/* =========================
   VIDEO ENDINGS
========================= */

const goodEndingVideo = document.getElementById("goodEndingVideo");

if (goodEndingVideo) {
  goodEndingVideo.onended = function () {
    showScene("scene-ending-save-friend");
  };
}

const semiGoodEndingVideo = document.getElementById("semiGoodEndingVideo");

if (semiGoodEndingVideo) {
  semiGoodEndingVideo.onended = function () {
    showScene("scene-ending-escape");
  };
}

/* =========================
   CHECKPOINT
========================= */

function restartFromCheckpoint() {
  clearInterval(demonTimer);

  inventory = [...checkpointInventory];
  selectedItem = checkpointSelectedItem;

  renderHotbars();
  showScene(checkpointScene);
}

window.restartFromCheckpoint = restartFromCheckpoint;

/* =========================
   RESTART
========================= */

function restartGame() {
  inventory = [];
  selectedItem = null;
  demonsLeft = 3;
  timeLeft = 30;
  satanDialogIndex = 0;

  checkpointScene = "scene-intro";
  checkpointInventory = [];
  checkpointSelectedItem = null;

  clearInterval(demonTimer);

  stopSound("roomShakeSound");

  document.querySelectorAll(".item, .demon").forEach(el => {
    el.classList.remove("hidden");
  });

  const satanScene = document.getElementById("scene-satan-appears");

  if (satanScene) {
    satanScene.classList.remove("stop-shake");
  }

  if (dresser) dresser.classList.remove("hidden");
  if (riddleBox) riddleBox.classList.add("hidden");
  if (nextDoorArrow) nextDoorArrow.classList.add("hidden");
  if (lockedText) lockedText.classList.add("hidden");

  renderHotbars();
  showScene("scene-intro");
}

window.restartGame = restartGame;

/* =========================
   INTRO VIDEO LYD-KNAP
========================= */

const introVideo = document.getElementById("introVideo");
const soundButton = document.getElementById("soundButton");

let soundOn = false;

if (introVideo && soundButton) {
  soundButton.onclick = function (event) {
    event.stopPropagation();

    if (!soundOn) {
      introVideo.muted = false;
      introVideo.volume = 0.5;
      introVideo.play().catch(() => {});

      soundButton.textContent = "🔊 Lyd til";
      soundOn = true;
    } else {
      introVideo.muted = true;

      soundButton.textContent = "🔇 Lyd fra";
      soundOn = false;
    }
  };
}

// ==========================================
// Generic Copy Utility
// ==========================================
function copyText(elementId) {
    const textElement = document.getElementById(elementId);
    if (!textElement) return;
    
    const textToCopy = textElement.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Change alert based on what was copied
        if (elementId.includes('prompt')) {
            alert("AI Prompt copied! Now head over to Gemini or ChatGPT to generate your code.");
        } else {
            alert("Template code copied to clipboard!");
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// ==========================================
// Pause & Reflect Stepper Logic
// ==========================================
let currentStep = 1;
const totalSteps = 3;

function changeStep(direction) {
  currentStep += direction;
  if (currentStep > totalSteps) {
    showCompletion();
    return;
  }
  if (currentStep < 1) currentStep = 1;

  document.querySelectorAll('.think-card').forEach(card => {
    card.classList.remove('active');
    if (parseInt(card.getAttribute('data-card')) === currentStep) {
      card.classList.add('active');
    }
  });

  let completion = document.getElementById('completion-screen');
  if(completion) completion.classList.remove('active');

  document.querySelectorAll('.indicator').forEach(ind => {
    ind.classList.remove('active');
    if (parseInt(ind.getAttribute('data-step')) <= currentStep) {
      ind.classList.add('active');
    }
  });

  let stepCounter = document.getElementById('step-counter');
  let prevBtn = document.getElementById('prev-btn');
  let nextBtn = document.getElementById('next-btn');

  if(stepCounter) stepCounter.textContent = currentStep + " / " + totalSteps;
  if(prevBtn) prevBtn.disabled = (currentStep === 1);
  
  if(nextBtn) {
    if (currentStep === totalSteps) {
      nextBtn.textContent = "Complete Reflection";
    } else {
      nextBtn.textContent = "Next Question";
    }
  }
}

function showCompletion() {
  document.querySelectorAll('.think-card').forEach(card => card.classList.remove('active'));
  
  let footer = document.getElementById('stepper-footer');
  let indicators = document.getElementById('stepper-indicators');
  let completion = document.getElementById('completion-screen');
  
  if (footer) footer.style.display = 'none';
  if (indicators) indicators.style.display = 'none';
  if (completion) completion.classList.add('active');
}

function resetReflection() {
  currentStep = 1;
  
  let completion = document.getElementById('completion-screen');
  let footer = document.getElementById('stepper-footer');
  let indicators = document.getElementById('stepper-indicators');
  
  if (completion) completion.classList.remove('active');
  if (footer) footer.style.display = 'flex';
  if (indicators) indicators.style.display = 'flex';
  
  document.querySelectorAll('.think-card').forEach(card => card.classList.remove('active'));
  let firstCard = document.querySelector('.think-card[data-card="1"]');
  if (firstCard) firstCard.classList.add('active');
  
  document.querySelectorAll('.indicator').forEach((ind, index) => {
    ind.classList.remove('active');
    if (index === 0) ind.classList.add('active');
  });

  let stepCounter = document.getElementById('step-counter');
  let prevBtn = document.getElementById('prev-btn');
  let nextBtn = document.getElementById('next-btn');

  if (stepCounter) stepCounter.textContent = "1 / 3";
  if (prevBtn) prevBtn.disabled = true;
  if (nextBtn) nextBtn.textContent = "Next Question";
}

// ==========================================
// Matching Game Logic
// ==========================================
let draggedCard = null;
let selectedCard = null;

function handleCardClick(e) {
  e.stopPropagation();
  if (selectedCard) selectedCard.classList.remove('selected-card');
  if (selectedCard === e.currentTarget) {
    selectedCard = null;
    return;
  }
  selectedCard = e.currentTarget;
  selectedCard.classList.add('selected-card');
}

function handleZoneClick(e) {
  if (!selectedCard) return;
  let zone = e.currentTarget;

  if (zone.id === 'draggable-pool') {
    let oldZone = selectedCard.closest('.drop-zone');
    if (oldZone) {
      let placeholder = oldZone.querySelector('.placeholder-text');
      if (placeholder) placeholder.style.display = 'block';
    }
    zone.appendChild(selectedCard);
  } else {
    if (zone.querySelector('.draggable-card')) {
      let existingCard = zone.querySelector('.draggable-card');
      document.getElementById('draggable-pool').appendChild(existingCard);
      existingCard.classList.remove('correct', 'incorrect');
    }
    let placeholder = zone.querySelector('.placeholder-text');
    if (placeholder) placeholder.style.display = 'none';
    zone.appendChild(selectedCard);
  }
  
  selectedCard.classList.remove('selected-card', 'correct', 'incorrect');
  selectedCard = null;
}

function dragStart(e) {
  draggedCard = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.id);
  if (selectedCard) {
    selectedCard.classList.remove('selected-card');
    selectedCard = null;
  }
}

function allowDrop(e) { e.preventDefault(); }
function highlightDrop(e) {
  e.preventDefault();
  let zone = e.target.closest('.drop-zone');
  if (zone) zone.classList.add('drag-over');
}
function removeHighlight(e) {
  let zone = e.target.closest('.drop-zone');
  if (zone) zone.classList.remove('drag-over');
}

function dropItem(e) {
  e.preventDefault();
  let zone = e.target.closest('.drop-zone');
  if (!zone) return;
  zone.classList.remove('drag-over');

  if (zone.querySelector('.draggable-card')) {
    let existingCard = zone.querySelector('.draggable-card');
    document.getElementById('draggable-pool').appendChild(existingCard);
    existingCard.classList.remove('correct', 'incorrect');
  }

  if (draggedCard) {
    let placeholder = zone.querySelector('.placeholder-text');
    if (placeholder) placeholder.style.display = 'none';
    zone.appendChild(draggedCard);
    draggedCard.classList.remove('dragging');
    draggedCard = null;
  }
}

function allowDropPool(e) { e.preventDefault(); }

function dropToPool(e) {
  e.preventDefault();
  let pool = document.getElementById('draggable-pool');
  if (draggedCard) {
    let oldZone = draggedCard.closest('.drop-zone');
    if (oldZone) {
      let placeholder = oldZone.querySelector('.placeholder-text');
      if (placeholder) placeholder.style.display = 'block';
    }
    pool.appendChild(draggedCard);
    draggedCard.classList.remove('dragging', 'correct', 'incorrect');
    draggedCard = null;
  }
}

function checkAnswers() {
  let zones = document.querySelectorAll('.drop-zone');
  if (zones.length === 0) return; // Not on the matching page
  
  let allCorrect = true;
  let placedCount = 0;

  zones.forEach(zone => {
    let targetStep = zone.getAttribute('data-target');
    let card = zone.querySelector('.draggable-card');
    
    let existingIcon = zone.querySelector('.feedback-icon');
    if (existingIcon) existingIcon.remove();
    zone.classList.remove('correct', 'incorrect');

    if (card) {
      placedCount++;
      let cardAnswer = card.getAttribute('data-answer');
      let icon = document.createElement('span');
      icon.classList.add('feedback-icon');

      if (cardAnswer === targetStep) {
        zone.classList.add('correct');
        icon.classList.add('correct-icon');
        icon.innerHTML = '&#10004;';
      } else {
        zone.classList.add('incorrect');
        icon.classList.add('incorrect-icon');
        icon.innerHTML = '&#10006;';
        allCorrect = false;
      }
      zone.appendChild(icon);
    } else {
      allCorrect = false;
    }
  });

  let msg = document.getElementById('feedback-message');
  if (placedCount < 5) {
    msg.style.color = '#d69e2e';
    msg.textContent = "Please place an answer in every slot before checking!";
  } else if (allCorrect) {
    msg.style.color = '#38a169';
    msg.textContent = "Fantastic job! All constraints and actions correctly matched.";
    createConfettiRain();
    let banner = document.getElementById('success-banner');
    if (banner) {
        banner.classList.add('show');
        setTimeout(() => {
          banner.classList.remove('show');
        }, 2600);
    }
  } else {
    msg.style.color = '#e53e3e';
    msg.textContent = "Some matches are incorrect (marked with a red X). Review and try again!";
  }
}

function createConfettiRain() {
  let container = document.getElementById('confetti-rain');
  if (!container) return;
  
  container.innerHTML = "";
  // Original Fun Colors Restored
  let colors = ['#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#805ad5', '#ed8936'];
  
  for (let i = 0; i < 45; i++) {
    let piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 0.9 + 1.1) + 's';
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    
    if (Math.random() > 0.5) piece.style.borderRadius = '50%';
    container.appendChild(piece);
  }
}

function resetGame() {
  if (selectedCard) {
    selectedCard.classList.remove('selected-card');
    selectedCard = null;
  }
  
  let pool = document.getElementById('draggable-pool');
  let cards = document.querySelectorAll('.draggable-card');
  let zones = document.querySelectorAll('.drop-zone');
  let banner = document.getElementById('success-banner');

  if(banner) banner.classList.remove('show');
  let confetti = document.getElementById('confetti-rain');
  if(confetti) confetti.innerHTML = "";

  let cardsArray = Array.from(cards);
  cardsArray.sort(() => Math.random() - 0.5);

  cardsArray.forEach(card => {
    card.classList.remove('correct', 'incorrect');
    if (pool) pool.appendChild(card);
  });

  zones.forEach(zone => {
    zone.classList.remove('correct', 'incorrect');
    let icon = zone.querySelector('.feedback-icon');
    if (icon) icon.remove();
    let placeholder = zone.querySelector('.placeholder-text');
    if (placeholder) placeholder.style.display = 'block';
  });

  let msg = document.getElementById('feedback-message');
  if(msg) msg.textContent = "";
}
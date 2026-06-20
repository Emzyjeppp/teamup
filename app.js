// ============================================
//  TeamUp — App Logic, Animations & Confetti
//  Supports Simple Mode + Custom Task Mode
// ============================================

(() => {
  'use strict';

  // --- DOM Elements ---
  const namesInput = document.getElementById('names-input');
  const nameCounter = document.getElementById('name-counter');
  const groupSizeSelect = document.getElementById('group-size');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const shuffleCustomBtn = document.getElementById('shuffle-custom-btn');
  const resultsSection = document.getElementById('results-section');
  const resultsTitle = document.getElementById('results-title');
  const groupsGrid = document.getElementById('groups-grid');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const reshuffleBtn = document.getElementById('reshuffle-btn');
  const animationStage = document.getElementById('animation-stage');
  const animationCards = document.getElementById('animation-cards');
  const animationTitle = document.getElementById('animation-title');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // Custom mode elements
  const modeSimpleBtn = document.getElementById('mode-simple-btn');
  const modeCustomBtn = document.getElementById('mode-custom-btn');
  const eventTitleGroup = document.getElementById('event-title-group');
  const eventTitleInput = document.getElementById('event-title');
  const taskBuilder = document.getElementById('task-builder');
  const taskList = document.getElementById('task-list');
  const addTaskBtn = document.getElementById('add-task-btn');
  const slotCounter = document.getElementById('slot-counter');
  const simpleControls = document.getElementById('simple-controls');
  const customControls = document.getElementById('custom-controls');
  const sectionDivider = document.getElementById('section-divider');
  const slotMatch = document.getElementById('slot-match');
  const slotMatchIcon = document.getElementById('slot-match-icon');
  const slotMatchText = document.getElementById('slot-match-text');

  // Import elements
  const importBanner = document.getElementById('import-banner');
  const importBannerDesc = document.getElementById('import-banner-desc');
  const importBtn = document.getElementById('import-btn');
  const importCloseBtn = document.getElementById('import-close-btn');

  // --- Group Color Palette ---
  const GROUP_COLORS = [
    { hex: '#06b6d4', rgb: '6, 182, 212' },
    { hex: '#a855f7', rgb: '168, 85, 247' },
    { hex: '#ec4899', rgb: '236, 72, 153' },
    { hex: '#22c55e', rgb: '34, 197, 94' },
    { hex: '#f59e0b', rgb: '245, 158, 11' },
    { hex: '#3b82f6', rgb: '59, 130, 246' },
    { hex: '#ef4444', rgb: '239, 68, 68' },
    { hex: '#14b8a6', rgb: '20, 184, 166' },
    { hex: '#f97316', rgb: '249, 115, 22' },
    { hex: '#8b5cf6', rgb: '139, 92, 246' },
  ];

  // --- Default Emojis for tasks ---
  const TASK_EMOJIS = ['📋', '🛒', '🍳', '📦', '🧽', '🔧', '📝', '🎨', '🏗️', '🧹', '🚿', '🪣', '🗑️', '💻', '📚'];

  // --- State ---
  let currentGroups = [];
  let currentMode = 'simple'; // 'simple' | 'custom'
  let currentEventTitle = '';
  let currentTaskNames = [];
  let taskIdCounter = 0;
  let isAnimating = false;
  let parsedContextData = null;
  let isBannerDismissed = false;

  // =====================
  //  Utility Functions
  // =====================

  /**
   * Smart Parser — Detects and parses names from various input formats
   */
  function parseNames(text) {
    if (!text || !text.trim()) return [];

    let names = [];
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);

    for (const line of lines) {
      let parts;

      if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes('\t')) {
        parts = line.split('\t');
      } else {
        parts = [line];
      }

      for (let part of parts) {
        part = part.trim();
        if (!part) continue;

        part = part
          .replace(/^\d+[\.\)\-\:]\s*/, '')
          .replace(/^[a-zA-Z][\.\)]\s*/, '')
          .replace(/^[-–—•*▪▸►]\s*/, '')
          .replace(/[\.\,\;]+$/, '')
          .trim();

        if (!part) continue;

        const uppercaseCount = (part.match(/[A-Z]/g) || []).length;
        const hasSpaces = /\s/.test(part);

        if (!hasSpaces && uppercaseCount >= 3 && part.length > 8) {
          const camelNames = part.split(/(?<=[a-z])(?=[A-Z])/);
          if (camelNames.length >= 2) {
            names.push(...camelNames.map(n => n.trim()).filter(n => n.length > 0));
            continue;
          }
        }

        if (hasSpaces) {
          const words = part.split(/\s+/);
          const allCapitalized = words.every(w => /^[A-Z]/.test(w));
          if (allCapitalized && words.length >= 4 && words.every(w => w.length <= 15)) {
            names.push(...words);
            continue;
          }
        }

        if (part.length > 0) {
          names.push(part);
        }
      }
    }

    return names;
  }

  /**
   * Parse context structure containing tasks/slots/names:
   * e.g., "Kerja Bakti: \n Kolam 1 orang (Asror) \n ..."
   */
  function parseTaskContext(text) {
    if (!text || !text.trim()) return null;

    const lines = text.split(/\n/).map(l => l.trim());
    let eventTitle = '';
    const tasks = [];
    const allNames = [];

    // Helper to split names by connectors/commas and clean them up
    function extractNamesFromString(str) {
      if (!str) return [];
      return str
        .split(/,|\bdan\b|\band\b|&|;/i)
        .map(n => n.trim().replace(/[\(\)\.\,]+$/, '').trim())
        .filter(n => n.length > 0);
    }

    // Regexp to match task definition lines, e.g.:
    // "Kolam 1 orang (Asror)"
    // "🛒 Membeli Barang (2 orang)"
    // "Garasi 2 orang"
    const taskRegex = /^(.*?)\s*\(?(\d+)\s*(?:orang|pax|anggota|member)\)?\s*(.*)$/i;

    let currentTask = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const match = line.match(taskRegex);

      if (match) {
        // Push previous task if we had one and it's not empty
        if (currentTask) {
          tasks.push(currentTask);
        }

        let taskName = match[1].trim();
        const size = parseInt(match[2], 10);
        const trailing = match[3].trim();

        // Extract emoji from task name if it starts with one
        let emoji = '';
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        const emojiMatch = taskName.match(emojiRegex);
        if (emojiMatch && taskName.startsWith(emojiMatch[0])) {
          emoji = emojiMatch[0];
          taskName = taskName.substring(emoji.length).trim();
        }
        
        // Clean task name
        taskName = taskName.replace(/^[-–—•*▪▸►:\s]+/, '').replace(/[:\s]+$/, '').trim();

        currentTask = {
          emoji: emoji || null,
          name: taskName,
          size: size,
          names: []
        };

        // If names are inline in trailing part, e.g. "(Asror)"
        if (trailing) {
          const innerMatch = trailing.match(/^\((.*)\)$/);
          const nameStr = innerMatch ? innerMatch[1] : trailing;
          const inlineNames = extractNamesFromString(nameStr);
          if (inlineNames.length > 0) {
            currentTask.names.push(...inlineNames);
            allNames.push(...inlineNames);
            tasks.push(currentTask);
            currentTask = null; // Reset so next lines don't append names to this
          }
        }
      } else {
        // Line doesn't define a task.
        // If we are currently collecting names for a task:
        if (currentTask) {
          // Check if this line looks like names
          const lineNames = extractNamesFromString(line);
          if (lineNames.length > 0) {
            currentTask.names.push(...lineNames);
            allNames.push(...lineNames);

            // If we have collected enough names for this task, push it
            if (currentTask.names.length >= currentTask.size) {
              tasks.push(currentTask);
              currentTask = null;
            }
          }
        } else {
          // No active task. This might be the event title!
          // We only set the event title if we haven't found any tasks yet.
          if (tasks.length === 0) {
            let cleanLine = line.replace(/[:\s]+$/, '').trim();
            if (cleanLine) {
              if (eventTitle) {
                eventTitle += ' - ' + cleanLine;
              } else {
                eventTitle = cleanLine;
              }
            }
          }
        }
      }
    }

    // Push last task if it was never pushed
    if (currentTask) {
      tasks.push(currentTask);
    }

    // Only return parsed data if we found at least one valid task
    if (tasks.length > 0) {
      return {
        eventTitle: eventTitle || 'Tugas Kelompok',
        tasks,
        names: allNames
      };
    }

    return null;
  }

  /**
   * Monitor name input real-time to detect tasks context and show import banner
   */
  function checkNamesInputForTasks() {
    const text = namesInput.value;
    
    // If the banner was dismissed, don't show it again unless the text is cleared
    if (isBannerDismissed) {
      if (!text || !text.trim()) {
        isBannerDismissed = false; // Reset dismiss state on empty
      }
      importBanner.style.display = 'none';
      return;
    }

    const parsed = parseTaskContext(text);

    if (parsed) {
      parsedContextData = parsed;
      const taskCount = parsed.tasks.length;
      const totalSlots = parsed.tasks.reduce((sum, t) => sum + t.size, 0);
      importBannerDesc.textContent = `Terdeteksi ${taskCount} tugas dengan total ${totalSlots} slot.`;
      importBanner.style.display = 'flex';
    } else {
      parsedContextData = null;
      importBanner.style.display = 'none';
    }
  }

  /** Remove duplicate names (case-insensitive) */
  function removeDuplicates(names) {
    const seen = new Set();
    return names.filter(name => {
      const lower = name.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }

  /** Fisher-Yates shuffle algorithm */
  function fisherYatesShuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /** Split array into groups of given size */
  function splitIntoGroups(names, groupSize) {
    const groups = [];
    for (let i = 0; i < names.length; i += groupSize) {
      groups.push(names.slice(i, i + groupSize));
    }
    return groups;
  }

  /** Split array into groups with variable sizes */
  function splitIntoCustomGroups(names, sizes) {
    const groups = [];
    let index = 0;
    for (const size of sizes) {
      groups.push(names.slice(index, index + size));
      index += size;
    }
    return groups;
  }

  /** Generate random number in range */
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /** Sleep helper */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // =====================
  //  Mode Toggle
  // =====================

  function setMode(mode) {
    currentMode = mode;

    // Toggle buttons
    modeSimpleBtn.classList.toggle('active', mode === 'simple');
    modeCustomBtn.classList.toggle('active', mode === 'custom');

    // Show/hide custom mode elements
    const isCustom = mode === 'custom';
    eventTitleGroup.style.display = isCustom ? 'block' : 'none';
    taskBuilder.style.display = isCustom ? 'block' : 'none';
    sectionDivider.style.display = isCustom ? 'flex' : 'none';
    slotMatch.style.display = isCustom ? 'flex' : 'none';
    simpleControls.style.display = isCustom ? 'none' : 'flex';
    customControls.style.display = isCustom ? 'flex' : 'none';

    // Add default tasks if empty
    if (isCustom && taskList.children.length === 0) {
      addTask('', 2);
      addTask('', 2);
    }

    // Hide results on mode switch
    resultsSection.classList.remove('visible');

    // Update counters
    updateNameCounter();
    if (isCustom) updateSlotCounter();
  }

  // =====================
  //  Task Builder (Custom Mode)
  // =====================

  function addTask(name = '', size = 2, emoji = null) {
    const id = taskIdCounter++;
    const emojiIndex = taskList.children.length % TASK_EMOJIS.length;
    const emojiToUse = emoji || TASK_EMOJIS[emojiIndex];

    const item = document.createElement('div');
    item.className = 'task-item';
    item.dataset.taskId = id;

    item.innerHTML = `
      <button class="task-item__emoji" type="button" title="Klik untuk ganti emoji">${emojiToUse}</button>
      <input
        class="task-item__name"
        type="text"
        placeholder="Nama tugas..."
        value="${name}"
        spellcheck="false"
      />
      <div class="task-item__size-group">
        <span class="task-item__size-label">👤</span>
        <input
          class="task-item__size"
          type="number"
          min="1"
          max="50"
          value="${size}"
        />
      </div>
      <button class="task-item__delete" type="button" title="Hapus tugas">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    `;

    // Event: Delete task
    item.querySelector('.task-item__delete').addEventListener('click', () => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';
      setTimeout(() => {
        item.remove();
        updateSlotCounter();
      }, 200);
    });

    // Event: Size change
    item.querySelector('.task-item__size').addEventListener('input', updateSlotCounter);

    // Event: Emoji click — cycle through emojis
    const emojiBtn = item.querySelector('.task-item__emoji');
    emojiBtn.addEventListener('click', () => {
      const currentIdx = TASK_EMOJIS.indexOf(emojiBtn.textContent);
      const nextIdx = (currentIdx + 1) % TASK_EMOJIS.length;
      emojiBtn.textContent = TASK_EMOJIS[nextIdx];
      emojiBtn.style.transform = 'scale(1.3)';
      setTimeout(() => { emojiBtn.style.transform = 'scale(1)'; }, 200);
    });

    taskList.appendChild(item);
    updateSlotCounter();
  }

  function getTasksData() {
    const items = taskList.querySelectorAll('.task-item');
    const tasks = [];
    items.forEach((item) => {
      const emoji = item.querySelector('.task-item__emoji').textContent;
      const name = item.querySelector('.task-item__name').value.trim();
      const size = parseInt(item.querySelector('.task-item__size').value) || 1;
      tasks.push({ emoji, name, size });
    });
    return tasks;
  }

  function getTotalSlots() {
    return getTasksData().reduce((sum, t) => sum + t.size, 0);
  }

  function updateSlotCounter() {
    const total = getTotalSlots();
    slotCounter.textContent = `${total} slot`;
    updateSlotMatch();
  }

  function updateSlotMatch() {
    if (currentMode !== 'custom') return;

    const names = removeDuplicates(parseNames(namesInput.value));
    const totalSlots = getTotalSlots();
    const nameCount = names.length;

    if (nameCount === 0) {
      slotMatch.className = 'slot-match';
      slotMatchIcon.textContent = '💡';
      slotMatchText.textContent = `Masukkan nama — butuh ${totalSlots} orang untuk ${getTasksData().length} tugas`;
    } else if (nameCount === totalSlots) {
      slotMatch.className = 'slot-match match';
      slotMatchIcon.textContent = '✅';
      slotMatchText.textContent = `Pas! ${nameCount} nama = ${totalSlots} slot tugas`;
      shuffleCustomBtn.disabled = false;
    } else if (nameCount < totalSlots) {
      slotMatch.className = 'slot-match error';
      slotMatchIcon.textContent = '⚠️';
      slotMatchText.textContent = `Kurang ${totalSlots - nameCount} orang — punya ${nameCount} nama, butuh ${totalSlots}`;
      shuffleCustomBtn.disabled = true;
    } else {
      slotMatch.className = 'slot-match error';
      slotMatchIcon.textContent = '⚠️';
      slotMatchText.textContent = `Kelebihan ${nameCount - totalSlots} orang — punya ${nameCount} nama, butuh ${totalSlots}`;
      shuffleCustomBtn.disabled = true;
    }

    // Also disable if no tasks
    if (getTasksData().length === 0) {
      shuffleCustomBtn.disabled = true;
    }
  }

  // =====================
  //  Name Counter
  // =====================

  function updateNameCounter() {
    const names = parseNames(namesInput.value);
    const unique = removeDuplicates(names);
    const count = unique.length;
    const dupes = names.length - unique.length;

    let counterText = `${count} nama`;
    if (dupes > 0) {
      counterText += ` (${dupes} duplikat)`;
    }
    nameCounter.textContent = counterText;

    if (count > 0) {
      const preview = unique.slice(0, 8).join(', ');
      const suffix = count > 8 ? `, ... (+${count - 8} lagi)` : '';
      nameCounter.title = `Terdeteksi: ${preview}${suffix}`;
      nameCounter.classList.add('has-names');
    } else {
      nameCounter.title = '';
      nameCounter.classList.remove('has-names');
    }

    if (currentMode === 'simple') {
      const groupSize = parseInt(groupSizeSelect.value);
      shuffleBtn.disabled = count < 2 || count < groupSize;
    } else {
      updateSlotMatch();
    }
  }

  // =====================
  //  Animation System
  // =====================

  function createAnimationCards(names) {
    animationCards.innerHTML = '';
    names.forEach((name, index) => {
      const card = document.createElement('div');
      card.className = 'name-card';
      card.textContent = name;
      card.style.setProperty('--r', randomRange(-15, 15));
      card.style.animationDelay = `${index * 40}ms`;
      animationCards.appendChild(card);
    });
  }

  function startShuffleAnimation() {
    const cards = animationCards.querySelectorAll('.name-card');
    cards.forEach(card => {
      card.style.setProperty('--dx', randomRange(-8, 8));
      card.style.setProperty('--dy', randomRange(-8, 8));
      card.style.setProperty('--r', randomRange(-5, 5));
      card.classList.add('shuffling');
    });
  }

  function stopShuffleAnimation() {
    const cards = animationCards.querySelectorAll('.name-card');
    cards.forEach(card => {
      card.classList.remove('shuffling');
    });
  }

  function assignCardsToGroups(names, groups) {
    const cards = animationCards.querySelectorAll('.name-card');
    const nameToGroupIndex = new Map();

    groups.forEach((group, groupIndex) => {
      group.forEach(name => {
        nameToGroupIndex.set(name, groupIndex);
      });
    });

    cards.forEach(card => {
      const name = card.textContent;
      const groupIndex = nameToGroupIndex.get(name);
      if (groupIndex !== undefined) {
        const color = GROUP_COLORS[groupIndex % GROUP_COLORS.length];
        card.style.setProperty('--assigned-color', color.hex);
        card.style.setProperty('--assigned-color-rgb', color.rgb);
        card.classList.add('assigned');
        card.style.borderColor = color.hex;
        card.style.boxShadow = `0 0 15px rgba(${color.rgb}, 0.3)`;
      }
    });
  }

  async function runAnimation(names, groups) {
    isAnimating = true;

    animationStage.classList.add('active');
    animationTitle.textContent = currentMode === 'custom'
      ? '🎲 Mengacak tugas...'
      : '🎲 Mengacak kelompok...';

    createAnimationCards(names);
    await sleep(names.length * 40 + 400);

    startShuffleAnimation();

    for (let i = 0; i < 4; i++) {
      await sleep(400);
      const cards = animationCards.querySelectorAll('.name-card');
      cards.forEach(card => {
        card.style.setProperty('--dx', randomRange(-10, 10));
        card.style.setProperty('--dy', randomRange(-10, 10));
        card.style.setProperty('--r', randomRange(-6, 6));
      });
    }

    await sleep(400);

    stopShuffleAnimation();
    animationTitle.textContent = currentMode === 'custom'
      ? '✨ Menugaskan anggota...'
      : '✨ Membentuk kelompok...';
    await sleep(300);

    assignCardsToGroups(names, groups);
    await sleep(800);

    animationStage.classList.remove('active');
    await sleep(200);

    if (currentMode === 'custom') {
      const tasks = getTasksData();
      renderCustomResults(groups, tasks);
    } else {
      renderResults(groups);
    }
    launchConfetti();

    isAnimating = false;
  }

  // =====================
  //  Results Rendering
  // =====================

  /** Simple mode: generic groups */
  function renderResults(groups) {
    currentGroups = groups;
    currentTaskNames = [];
    currentEventTitle = '';
    groupsGrid.innerHTML = '';
    resultsTitle.textContent = '🎉 Hasil Pembagian Kelompok';

    groups.forEach((group, index) => {
      const color = GROUP_COLORS[index % GROUP_COLORS.length];
      const card = document.createElement('div');
      card.className = 'group-card';
      card.style.setProperty('--group-color', color.hex);
      card.style.setProperty('--delay', `${index * 100}ms`);

      card.innerHTML = `
        <div class="group-card__header">
          <span class="group-card__name">
            <span>👥</span>
            Kelompok ${index + 1}
          </span>
          <span class="group-card__badge">${group.length} anggota</span>
        </div>
        <div class="group-card__members">
          ${group.map((name, i) => `
            <div class="member-item">
              <span class="member-item__number">${i + 1}.</span>
              <span>${name}</span>
            </div>
          `).join('')}
        </div>
      `;

      groupsGrid.appendChild(card);
    });

    resultsSection.classList.add('visible');
    setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  /** Custom mode: named tasks with emojis */
  function renderCustomResults(groups, tasks) {
    currentGroups = groups;
    currentTaskNames = tasks.map(t => `${t.emoji} ${t.name || 'Tugas'}`);
    currentEventTitle = eventTitleInput.value.trim();
    groupsGrid.innerHTML = '';

    // Show event title in results
    if (currentEventTitle) {
      resultsTitle.innerHTML = `🎉 ${currentEventTitle}`;
    } else {
      resultsTitle.textContent = '🎉 Hasil Pembagian Tugas';
    }

    groups.forEach((group, index) => {
      const task = tasks[index] || { emoji: '📋', name: `Tugas ${index + 1}`, size: group.length };
      const color = GROUP_COLORS[index % GROUP_COLORS.length];
      const card = document.createElement('div');
      card.className = 'group-card';
      card.style.setProperty('--group-color', color.hex);
      card.style.setProperty('--delay', `${index * 100}ms`);

      const taskName = task.name || `Tugas ${index + 1}`;

      card.innerHTML = `
        <div class="group-card__header">
          <span class="group-card__name">
            <span>${task.emoji}</span>
            ${taskName}
          </span>
          <span class="group-card__badge">${group.length} orang</span>
        </div>
        <div class="group-card__members">
          ${group.map((name, i) => `
            <div class="member-item">
              <span class="member-item__number">${i + 1}.</span>
              <span>${name}</span>
            </div>
          `).join('')}
        </div>
      `;

      groupsGrid.appendChild(card);
    });

    resultsSection.classList.add('visible');
    setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  // =====================
  //  Confetti System
  // =====================

  function launchConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const PARTICLE_COUNT = 80;
    const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#f97316'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: randomRange(0, confettiCanvas.width),
        y: randomRange(-confettiCanvas.height, -20),
        w: randomRange(6, 12),
        h: randomRange(4, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: randomRange(0, 360),
        rotationSpeed: randomRange(-8, 8),
        velocityX: randomRange(-2, 2),
        velocityY: randomRange(2, 6),
        gravity: 0.08,
        opacity: 1,
        wobble: randomRange(0, Math.PI * 2),
        wobbleSpeed: randomRange(0.03, 0.08),
      });
    }

    let animFrame;

    function animate() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let activeCount = 0;

      particles.forEach(p => {
        if (p.opacity <= 0) return;
        activeCount++;

        p.velocityY += p.gravity;
        p.x += p.velocityX + Math.sin(p.wobble) * 0.5;
        p.y += p.velocityY;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (p.y > confettiCanvas.height * 0.85) {
          p.opacity -= 0.02;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (activeCount > 0) {
        animFrame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        cancelAnimationFrame(animFrame);
      }
    }

    animate();
  }

  // =====================
  //  Export Functions
  // =====================

  function groupsToText(groups) {
    let text = '═══════════════════════════════\n';

    if (currentMode === 'custom' && currentEventTitle) {
      text += `  ${currentEventTitle.toUpperCase()}\n`;
    } else {
      text += '  HASIL PEMBAGIAN KELOMPOK\n';
    }
    text += '  Generated by TeamUp\n';
    text += '═══════════════════════════════\n\n';

    groups.forEach((group, index) => {
      let groupName;
      if (currentTaskNames.length > 0 && currentTaskNames[index]) {
        groupName = currentTaskNames[index];
      } else {
        groupName = `Kelompok ${index + 1}`;
      }

      text += `── ${groupName} (${group.length} orang) ──\n`;
      group.forEach((name, i) => {
        text += `   ${i + 1}. ${name}\n`;
      });
      text += '\n';
    });

    text += '═══════════════════════════════\n';
    text += `Total: ${groups.flat().length} orang → ${groups.length} ${currentMode === 'custom' ? 'tugas' : 'kelompok'}\n`;
    return text;
  }

  function copyToClipboard() {
    if (currentGroups.length === 0) return;

    const text = groupsToText(currentGroups);
    navigator.clipboard.writeText(text).then(() => {
      showToast('✅ Berhasil disalin ke clipboard!');
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('✅ Berhasil disalin ke clipboard!');
    });
  }

  function downloadAsText() {
    if (currentGroups.length === 0) return;

    const text = groupsToText(currentGroups);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const prefix = currentEventTitle
      ? currentEventTitle.replace(/\s+/g, '_')
      : 'TeamUp_Kelompok';
    a.download = `${prefix}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.txt`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 File berhasil diunduh!');
  }

  // =====================
  //  Toast Notification
  // =====================

  let toastTimeout;

  function showToast(message) {
    clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toast.classList.add('visible');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3000);
  }

  // =====================
  //  Main Shuffle Handlers
  // =====================

  /** Simple mode shuffle */
  async function handleSimpleShuffle() {
    if (isAnimating) return;

    let names = parseNames(namesInput.value);
    names = removeDuplicates(names);

    if (names.length < 2) {
      showToast('⚠️ Minimal 2 nama diperlukan!');
      return;
    }

    const groupSize = parseInt(groupSizeSelect.value);

    if (names.length < groupSize) {
      showToast(`⚠️ Jumlah nama (${names.length}) kurang dari ukuran kelompok (${groupSize})!`);
      return;
    }

    resultsSection.classList.remove('visible');

    const shuffledNames = fisherYatesShuffle(names);
    const groups = splitIntoGroups(shuffledNames, groupSize);

    await runAnimation(shuffledNames, groups);
  }

  /** Custom mode shuffle */
  async function handleCustomShuffle() {
    if (isAnimating) return;

    let names = parseNames(namesInput.value);
    names = removeDuplicates(names);
    const tasks = getTasksData();
    const totalSlots = tasks.reduce((sum, t) => sum + t.size, 0);

    if (names.length !== totalSlots) {
      showToast(`⚠️ Jumlah nama (${names.length}) tidak sesuai total slot (${totalSlots})!`);
      return;
    }

    if (tasks.length === 0) {
      showToast('⚠️ Tambahkan minimal 1 tugas!');
      return;
    }

    resultsSection.classList.remove('visible');

    const shuffledNames = fisherYatesShuffle(names);
    const sizes = tasks.map(t => t.size);
    const groups = splitIntoCustomGroups(shuffledNames, sizes);

    await runAnimation(shuffledNames, groups);
  }

  // =====================
  //  Event Listeners
  // =====================

  // Mode toggle
  modeSimpleBtn.addEventListener('click', () => setMode('simple'));
  modeCustomBtn.addEventListener('click', () => setMode('custom'));

  // Live name counter and task format detection
  namesInput.addEventListener('input', () => {
    updateNameCounter();
    checkNamesInputForTasks();
  });

  // Import banner buttons
  importBtn.addEventListener('click', () => {
    if (!parsedContextData) return;

    // Switch to custom mode
    setMode('custom');

    // Set event title
    eventTitleInput.value = parsedContextData.eventTitle;

    // Clear and build tasks
    taskList.innerHTML = '';
    parsedContextData.tasks.forEach(task => {
      addTask(task.name, task.size, task.emoji);
    });

    // Populate textarea with names
    namesInput.value = parsedContextData.names.join('\n');

    // Update counters and slots
    updateNameCounter();
    updateSlotCounter();

    // Hide banner & reset
    importBanner.style.display = 'none';
    parsedContextData = null;

    showToast('✨ Berhasil mengimpor tugas & nama!');
  });

  importCloseBtn.addEventListener('click', () => {
    isBannerDismissed = true;
    importBanner.style.display = 'none';
  });

  // Group size change (simple mode)
  groupSizeSelect.addEventListener('change', updateNameCounter);

  // Shuffle buttons
  shuffleBtn.addEventListener('click', handleSimpleShuffle);
  shuffleCustomBtn.addEventListener('click', handleCustomShuffle);

  // Add task button
  addTaskBtn.addEventListener('click', () => addTask('', 2));

  // Copy button
  copyBtn.addEventListener('click', copyToClipboard);

  // Download button
  downloadBtn.addEventListener('click', downloadAsText);

  // Reshuffle button — uses correct handler based on mode
  reshuffleBtn.addEventListener('click', () => {
    if (currentMode === 'custom') {
      handleCustomShuffle();
    } else {
      handleSimpleShuffle();
    }
  });

  // Handle window resize for confetti canvas
  window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });

  // Keyboard shortcut: Ctrl+Enter to shuffle
  namesInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (currentMode === 'custom') {
        if (!shuffleCustomBtn.disabled) handleCustomShuffle();
      } else {
        if (!shuffleBtn.disabled) handleSimpleShuffle();
      }
    }
  });

  // Initialize
  updateNameCounter();
  checkNamesInputForTasks();

})();

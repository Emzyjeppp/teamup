// ============================================
//  TeamUp — App Logic, Animations & Confetti
// ============================================

(() => {
  'use strict';

  // --- DOM Elements ---
  const namesInput = document.getElementById('names-input');
  const nameCounter = document.getElementById('name-counter');
  const groupSizeSelect = document.getElementById('group-size');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const resultsSection = document.getElementById('results-section');
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

  // --- State ---
  let currentGroups = [];
  let isAnimating = false;

  // =====================
  //  Utility Functions
  // =====================

  /**
   * Smart Parser — Detects and parses names from various input formats:
   *
   * 1. Newline-separated:     "Ahmad\nBudi\nCitra"
   * 2. Comma-separated:       "Ahmad, Budi, Citra"
   * 3. Semicolon-separated:   "Ahmad; Budi; Citra"
   * 4. Tab-separated:         "Ahmad\tBudi\tCitra"
   * 5. Numbered list:         "1. Ahmad\n2. Budi\n3. Citra"
   * 6. Bullet list:           "- Ahmad\n- Budi\n• Citra"
   * 7. CamelCase concat:      "AhmadBudiCitra" → ["Ahmad", "Budi", "Citra"]
   * 8. Mixed (multi-line with commas per line)
   */
  function parseNames(text) {
    if (!text || !text.trim()) return [];

    let names = [];

    // Step 1: Split by newlines first
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);

    for (const line of lines) {
      // Step 2: Detect separator within each line
      let parts;

      if (line.includes(',')) {
        // Comma-separated: "Ahmad, Budi, Citra"
        parts = line.split(',');
      } else if (line.includes(';')) {
        // Semicolon-separated: "Ahmad; Budi; Citra"
        parts = line.split(';');
      } else if (line.includes('\t')) {
        // Tab-separated
        parts = line.split('\t');
      } else {
        // Single name per line (or CamelCase)
        parts = [line];
      }

      for (let part of parts) {
        part = part.trim();
        if (!part) continue;

        // Step 3: Strip common list prefixes
        // "1. Ahmad" → "Ahmad", "1) Ahmad" → "Ahmad"
        // "- Ahmad" → "Ahmad", "• Ahmad" → "Ahmad"
        // "a. Ahmad" → "Ahmad", "a) Ahmad" → "Ahmad"
        part = part
          .replace(/^\d+[\.\)\-\:]\s*/, '')  // "1. " or "1) " or "1- " or "1: "
          .replace(/^[a-zA-Z][\.\)]\s*/, '') // "a. " or "a) "
          .replace(/^[-–—•*▪▸►]\s*/, '')     // "- " or "• " or "* "
          .replace(/[\.\,\;]+$/, '')          // trailing punctuation
          .trim();

        if (!part) continue;

        // Step 4: Detect CamelCase concatenation
        // "JokoDewiFajar" → ["Joko", "Dewi", "Fajar"]
        // Only if: single "word" (no spaces), length > 10, has multiple uppercase
        const uppercaseCount = (part.match(/[A-Z]/g) || []).length;
        const hasSpaces = /\s/.test(part);

        if (!hasSpaces && uppercaseCount >= 3 && part.length > 8) {
          // Split on uppercase boundaries: aA → a, A
          const camelNames = part.split(/(?<=[a-z])(?=[A-Z])/);
          if (camelNames.length >= 2) {
            names.push(...camelNames.map(n => n.trim()).filter(n => n.length > 0));
            continue;
          }
        }

        // Step 5: If the part contains spaces, it might be space-separated names
        // But only if ALL words are capitalized (e.g., "Ahmad Budi Citra")
        // vs. a full name like "Ahmad Fajar" (2 words = likely full name)
        if (hasSpaces) {
          const words = part.split(/\s+/);
          const allCapitalized = words.every(w => /^[A-Z]/.test(w));
          
          // If more than 3 space-separated capitalized words AND each word is
          // a single word (no compound like "Dewi Sartika"), treat as separate names
          // Heuristic: if each "word" is ≤ 1 word and there are 4+ words
          if (allCapitalized && words.length >= 4 && words.every(w => w.length <= 15)) {
            names.push(...words);
            continue;
          }
        }

        // Default: treat as a single name
        if (part.length > 0) {
          names.push(part);
        }
      }
    }

    return names;
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

  /** Generate random number in range */
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /** Sleep helper */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    // Show preview as title tooltip
    if (count > 0) {
      const preview = unique.slice(0, 8).join(', ');
      const suffix = count > 8 ? `, ... (+${count - 8} lagi)` : '';
      nameCounter.title = `Terdeteksi: ${preview}${suffix}`;
      nameCounter.classList.add('has-names');
    } else {
      nameCounter.title = '';
      nameCounter.classList.remove('has-names');
    }

    // Enable/disable shuffle button
    const groupSize = parseInt(groupSizeSelect.value);
    shuffleBtn.disabled = count < 2 || count < groupSize;
  }

  // =====================
  //  Animation System
  // =====================

  /** Create animated name cards in the stage */
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

  /** Start shuffle animation on all cards */
  function startShuffleAnimation() {
    const cards = animationCards.querySelectorAll('.name-card');
    cards.forEach(card => {
      card.style.setProperty('--dx', randomRange(-8, 8));
      card.style.setProperty('--dy', randomRange(-8, 8));
      card.style.setProperty('--r', randomRange(-5, 5));
      card.classList.add('shuffling');
    });
  }

  /** Stop shuffle animation */
  function stopShuffleAnimation() {
    const cards = animationCards.querySelectorAll('.name-card');
    cards.forEach(card => {
      card.classList.remove('shuffling');
    });
  }

  /** Assign colors to cards based on groups */
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

  /** Full animation orchestration */
  async function runAnimation(names, groups) {
    isAnimating = true;

    // Show animation stage
    animationStage.classList.add('active');
    animationTitle.textContent = '🎲 Mengacak kelompok...';

    // Step 1: Create cards with staggered entry
    createAnimationCards(names);
    await sleep(names.length * 40 + 400);

    // Step 2: Shuffle animation
    startShuffleAnimation();

    // Rapid shuffle visual (re-randomize positions multiple times)
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

    // Step 3: Stop shuffling and assign colors
    stopShuffleAnimation();
    animationTitle.textContent = '✨ Membentuk kelompok...';
    await sleep(300);

    assignCardsToGroups(names, groups);
    await sleep(800);

    // Step 4: Hide animation stage
    animationStage.classList.remove('active');
    await sleep(200);

    // Step 5: Show results with confetti
    renderResults(groups);
    launchConfetti();

    isAnimating = false;
  }

  // =====================
  //  Results Rendering
  // =====================

  function renderResults(groups) {
    currentGroups = groups;
    groupsGrid.innerHTML = '';

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

    // Smooth scroll to results
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

        // Fade out when near bottom
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
    text +=    '  HASIL PEMBAGIAN KELOMPOK\n';
    text +=    '  Generated by TeamUp\n';
    text +=    '═══════════════════════════════\n\n';

    groups.forEach((group, index) => {
      text += `── Kelompok ${index + 1} (${group.length} anggota) ──\n`;
      group.forEach((name, i) => {
        text += `   ${i + 1}. ${name}\n`;
      });
      text += '\n';
    });

    text += '═══════════════════════════════\n';
    text += `Total: ${groups.flat().length} mahasiswa → ${groups.length} kelompok\n`;
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
      // Fallback for older browsers
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
    a.download = `TeamUp_Kelompok_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.txt`;
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
  //  Main Shuffle Handler
  // =====================

  async function handleShuffle() {
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

    // Hide previous results
    resultsSection.classList.remove('visible');

    // Shuffle names
    const shuffledNames = fisherYatesShuffle(names);

    // Split into groups
    const groups = splitIntoGroups(shuffledNames, groupSize);

    // Run animation
    await runAnimation(shuffledNames, groups);
  }

  // =====================
  //  Event Listeners
  // =====================

  // Live name counter
  namesInput.addEventListener('input', updateNameCounter);

  // Group size change
  groupSizeSelect.addEventListener('change', updateNameCounter);

  // Shuffle button
  shuffleBtn.addEventListener('click', handleShuffle);

  // Copy button
  copyBtn.addEventListener('click', copyToClipboard);

  // Download button
  downloadBtn.addEventListener('click', downloadAsText);

  // Reshuffle button
  reshuffleBtn.addEventListener('click', handleShuffle);

  // Handle window resize for confetti canvas
  window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });

  // Keyboard shortcut: Ctrl+Enter to shuffle
  namesInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter' && !shuffleBtn.disabled) {
      e.preventDefault();
      handleShuffle();
    }
  });

  // Initialize
  updateNameCounter();

})();

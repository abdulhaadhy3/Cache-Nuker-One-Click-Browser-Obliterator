// ============================================
//  Cache Nuker – Popup Logic
//  Uses chrome.browsingData API to clear caches
// ============================================

const CACHE_CATEGORIES = [
  {
    id: 'cache',
    name: 'Browser Cache',
    desc: 'Cached images, scripts, stylesheets',
    emoji: '🗂️',
    dataType: { cache: true },
    selected: true
  },
  {
    id: 'cookies',
    name: 'Cookies',
    desc: 'All site cookies & session data',
    emoji: '🍪',
    dataType: { cookies: true },
    selected: true
  },
  {
    id: 'localStorage',
    name: 'Local Storage',
    desc: 'localStorage & sessionStorage',
    emoji: '💾',
    dataType: { localStorage: true },
    selected: true
  },
  {
    id: 'serviceWorkers',
    name: 'Service Workers',
    desc: 'Background scripts & PWA caches',
    emoji: '⚙️',
    dataType: { serviceWorkers: true },
    selected: true
  },
  {
    id: 'cacheStorage',
    name: 'Cache Storage',
    desc: 'CacheStorage API entries',
    emoji: '📦',
    dataType: { cacheStorage: true },
    selected: true
  },
  {
    id: 'indexedDB',
    name: 'IndexedDB',
    desc: 'Client-side databases',
    emoji: '🗄️',
    dataType: { indexedDB: true },
    selected: true
  },
  {
    id: 'webSQL',
    name: 'WebSQL',
    desc: 'Legacy web databases',
    emoji: '🔗',
    dataType: { webSQL: true },
    selected: true
  },
  {
    id: 'fileSystems',
    name: 'File Systems',
    desc: 'Sandboxed file system data',
    emoji: '📁',
    dataType: { fileSystems: true },
    selected: true
  },
  {
    id: 'formData',
    name: 'Form Data',
    desc: 'Autofill entries & saved forms',
    emoji: '📝',
    dataType: { formData: true },
    selected: false
  },
  {
    id: 'downloads',
    name: 'Download History',
    desc: 'List of downloaded files',
    emoji: '📥',
    dataType: { downloads: true },
    selected: false
  },
  {
    id: 'history',
    name: 'Browsing History',
    desc: 'Visited URLs and page titles',
    emoji: '🕐',
    dataType: { history: true },
    selected: false
  }
];

// --- State ---
let currentScope = 'global';
let currentOrigin = '';

// --- DOM References ---
const categoriesContainer = document.getElementById('categories');
const nukeBtn = document.getElementById('nukeBtn');
const selectAllBtn = document.getElementById('selectAllBtn');
const selectedCountEl = document.getElementById('selectedCount');
const totalCategoriesEl = document.getElementById('totalCategories');
const progressOverlay = document.getElementById('progressOverlay');
const progressStatus = document.getElementById('progressStatus');
const progressBar = document.getElementById('progressBar');
const resultsOverlay = document.getElementById('resultsOverlay');
const resultsSummary = document.getElementById('resultsSummary');
const resultsList = document.getElementById('resultsList');
const doneBtn = document.getElementById('doneBtn');

// New Scope Elements
const scopeGlobal = document.getElementById('scopeGlobal');
const scopeSite = document.getElementById('scopeSite');
const targetDisplay = document.getElementById('targetDisplay');
const targetOriginEl = document.getElementById('targetOrigin');

// --- Initialize ---
async function init() {
  await detectCurrentTab();
  renderCategories();
  updateStats();
  bindEvents();
}

// --- Detect Current Tab Origin ---
async function detectCurrentTab() {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        const url = new URL(tab.url);
        currentOrigin = url.origin;
        targetOriginEl.textContent = currentOrigin;
      } else {
        // Not a web page
        currentOrigin = '';
        scopeSite.disabled = true;
        scopeSite.title = "Only available on websites";
      }
    } catch (err) {
      console.error('Error detecting tab:', err);
    }
  } else {
    // Development mockup
    currentOrigin = 'https://example.com';
    targetOriginEl.textContent = currentOrigin;
  }
}

// --- Render Category Cards ---
function renderCategories() {
  categoriesContainer.innerHTML = '';
  CACHE_CATEGORIES.forEach((cat, idx) => {
    // Check if category is compatible with site-specific clearing
    // BrowserData.remove origins filter only supports some types
    const isCompatible = currentScope === 'global' ||
      ['cache', 'cookies', 'localStorage', 'serviceWorkers', 'cacheStorage', 'indexedDB', 'webSQL', 'fileSystems'].includes(cat.id);

    const card = document.createElement('div');
    card.className = `category-card ${cat.selected ? 'selected' : ''} ${!isCompatible ? 'disabled-scope' : ''}`;
    card.dataset.id = cat.id;

    if (!isCompatible) {
      card.title = "Not available for specific site clearing";
      card.style.opacity = '0.3';
      card.style.pointerEvents = 'none';
      if (cat.selected) cat.selected = false;
    } else {
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    }

    card.innerHTML = `
      <span class="category-emoji">${cat.emoji}</span>
      <div class="category-info">
        <div class="category-name">${cat.name}</div>
        <div class="category-desc">${cat.desc}</div>
      </div>
      <div class="category-toggle"></div>
    `;

    if (isCompatible) {
      card.addEventListener('click', () => toggleCategory(cat.id));
    }
    categoriesContainer.appendChild(card);
  });
}

// --- Toggle a Category ---
function toggleCategory(id) {
  const cat = CACHE_CATEGORIES.find(c => c.id === id);
  if (cat) {
    cat.selected = !cat.selected;
    const card = categoriesContainer.querySelector(`[data-id="${id}"]`);
    if (card) card.classList.toggle('selected', cat.selected);
    updateStats();
  }
}

// --- Update Stats ---
function updateStats() {
  const isCompatible = (cat) => currentScope === 'global' ||
    ['cache', 'cookies', 'localStorage', 'serviceWorkers', 'cacheStorage', 'indexedDB', 'webSQL', 'fileSystems'].includes(cat.id);

  const availableCats = CACHE_CATEGORIES.filter(isCompatible);
  const selected = availableCats.filter(c => c.selected).length;

  selectedCountEl.textContent = selected;
  totalCategoriesEl.textContent = availableCats.length;

  // Update select all button text
  if (selected === availableCats.length && availableCats.length > 0) {
    selectAllBtn.textContent = 'Deselect All';
  } else {
    selectAllBtn.textContent = 'Select All';
  }

  // Update nuke button sub text
  const nukeSub = nukeBtn.querySelector('.nuke-sub');
  if (selected === 0) {
    nukeSub.textContent = 'Select targets below';
    nukeBtn.style.opacity = '0.5';
    nukeBtn.style.pointerEvents = 'none';
  } else {
    const scopeNames = { global: 'Global System', site: 'Current Site' };
    nukeSub.textContent = `Target: ${scopeNames[currentScope]} (${selected})`;
    nukeBtn.style.opacity = '1';
    nukeBtn.style.pointerEvents = 'auto';
  }
}

// --- Bind Events ---
function bindEvents() {
  nukeBtn.addEventListener('click', startNuking);
  selectAllBtn.addEventListener('click', toggleSelectAll);
  doneBtn.addEventListener('click', closeResults);

  scopeGlobal.addEventListener('click', () => switchScope('global'));
  scopeSite.addEventListener('click', () => switchScope('site'));
}

// --- Switch Cleaning Scope ---
function switchScope(scope) {
  if (currentScope === scope) return;

  // Prevent switching to site scope if no origin is detected
  if (scope === 'site' && !currentOrigin) {
    showToast("No active website detected!");
    return;
  }

  currentScope = scope;

  // UI Updates
  scopeGlobal.classList.toggle('active', scope === 'global');
  scopeSite.classList.toggle('active', scope === 'site');
  targetDisplay.classList.toggle('hidden', scope === 'global');

  // Re-render categories to disable incompatible ones
  renderCategories();
  updateStats();
}

// --- Toast notification utility ---
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Select All / Deselect All ---
function toggleSelectAll() {
  const isCompatible = (cat) => currentScope === 'global' ||
    ['cache', 'cookies', 'localStorage', 'serviceWorkers', 'cacheStorage', 'indexedDB', 'webSQL', 'fileSystems'].includes(cat.id);

  const availableCats = CACHE_CATEGORIES.filter(isCompatible);
  const allSelected = availableCats.every(c => c.selected);

  availableCats.forEach(cat => {
    cat.selected = !allSelected;
    const card = categoriesContainer.querySelector(`[data-id="${cat.id}"]`);
    if (card) card.classList.toggle('selected', cat.selected);
  });
  updateStats();
}

// --- Start Nuking ---
async function startNuking() {
  const isCompatible = (cat) => currentScope === 'global' ||
    ['cache', 'cookies', 'localStorage', 'serviceWorkers', 'cacheStorage', 'indexedDB', 'webSQL', 'fileSystems'].includes(cat.id);

  const selectedCats = CACHE_CATEGORIES.filter(c => c.selected && isCompatible(c));
  if (selectedCats.length === 0) return;

  // Show progress
  nukeBtn.classList.add('cleaning');
  progressOverlay.classList.remove('hidden');
  progressBar.style.width = '0%';

  const results = [];
  const total = selectedCats.length;

  for (let i = 0; i < selectedCats.length; i++) {
    const cat = selectedCats[i];
    progressStatus.textContent = `Nuking ${cat.name}…`;
    progressBar.style.width = `${((i) / total) * 100}%`;

    try {
      await clearBrowsingData(cat.dataType);
      results.push({ ...cat, success: true });
    } catch (err) {
      results.push({ ...cat, success: false, error: err.message });
    }

    // Small delay for visual feedback
    await sleep(250);
  }

  progressBar.style.width = '100%';
  progressStatus.textContent = 'Mission Accomplished!';
  await sleep(500);

  // Show results
  showResults(results);
}

// --- Clear Browsing Data via Chrome API ---
function clearBrowsingData(dataTypes) {
  return new Promise((resolve, reject) => {
    if (typeof chrome !== 'undefined' && chrome.browsingData && chrome.browsingData.remove) {
      const options = {};

      if (currentScope === 'site' && currentOrigin) {
        // Site specific cleaning
        options.origins = [currentOrigin];
      } else {
        // Global cleaning
        options.since = 0;
      }

      chrome.browsingData.remove(
        options,
        dataTypes,
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        }
      );
    } else {
      // Fallback for development mockup
      console.log(`Mock clear: ${JSON.stringify(dataTypes)} for scope: ${currentScope}`);
      setTimeout(resolve, 400);
    }
  });
}

// --- Show Results ---
function showResults(results) {
  progressOverlay.classList.add('hidden');
  resultsOverlay.classList.remove('hidden');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  const targetName = currentScope === 'site' ? 'this site' : 'the global system';
  if (failCount === 0) {
    resultsSummary.textContent = `The target (${targetName}) has been cleansed.`;
  } else {
    resultsSummary.textContent = `${successCount} cleared, ${failCount} resilient fragments.`;
  }

  resultsList.innerHTML = '';
  results.forEach((r, idx) => {
    const item = document.createElement('div');
    item.className = `result-item ${r.success ? '' : 'failed'}`;
    item.style.animationDelay = `${idx * 0.05}s`;
    item.innerHTML = `
      <span class="result-emoji">${r.emoji}</span>
      <span class="result-name">${r.name}</span>
      <span class="result-status">${r.success ? '✓ Obliterated' : '✗ Shielded'}</span>
    `;
    resultsList.appendChild(item);
  });
}

// --- Close Results ---
function closeResults() {
  resultsOverlay.classList.add('hidden');
  nukeBtn.classList.remove('cleaning');
}

// --- Utility ---
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);

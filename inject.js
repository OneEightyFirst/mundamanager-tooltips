(async () => {
  console.log('🎲 Munda Manager Tooltips: Loading...');
  
  // Configuration
  const RULES_URL = 'https://OneEightyFirst.github.io/mundamanager-tooltips/rules.json';
  const CACHE_KEY = 'munda_tooltips_rules';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Prevent multiple injections
  if (window.mundaTooltipsActive) {
    console.log('⚠️ Munda Tooltips already active on this page');
    return;
  }
  window.mundaTooltipsActive = true;

  // Fetch rules with caching
  async function fetchRules() {
    // Try cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Munda Tooltips: Using cached rules');
          return data;
        }
      } catch (e) {
        // Invalid cache, fetch fresh
      }
    }

    // Fetch from remote
    try {
      console.log('Munda Tooltips: Fetching rules from remote...');
      const res = await fetch(RULES_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rules = await res.json();
      
      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: rules,
        timestamp: Date.now()
      }));
      
      return rules;
    } catch (err) {
      console.error('Munda Tooltips: Failed to fetch rules', err);
      alert('Failed to load Munda Manager rules. Please check your connection.');
      return {};
    }
  }

  const rules = await fetchRules();
  const processedNodes = new WeakSet();

  // Create tooltip element for desktop
  const tooltip = document.createElement('div');
  tooltip.id = 'munda-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    z-index: 999999;
    max-width: 320px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #e8e8e8;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: none;
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: opacity 0.2s ease;
  `;
  document.body.appendChild(tooltip);

  // Create mobile modal
  const modal = document.createElement('div');
  modal.id = 'munda-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999998;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #e8e8e8;
    padding: 24px;
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const modalTitle = document.createElement('h3');
  modalTitle.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffd700;
  `;
  
  const modalText = document.createElement('p');
  modalText.style.cssText = `
    margin: 0 0 16px 0;
    font-size: 15px;
    line-height: 1.6;
  `;
  
  const modalClose = document.createElement('button');
  modalClose.textContent = 'Close';
  modalClose.style.cssText = `
    background: #4a90e2;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s ease;
  `;
  modalClose.onmouseover = () => modalClose.style.background = '#357abd';
  modalClose.onmouseout = () => modalClose.style.background = '#4a90e2';
  
  modalContent.appendChild(modalTitle);
  modalContent.appendChild(modalText);
  modalContent.appendChild(modalClose);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Modal controls
  function showModal(title, text) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });

  // Tooltip controls
  function showTooltip(text, x, y) {
    tooltip.textContent = text;
    
    // Position tooltip
    tooltip.style.left = x + 10 + 'px';
    tooltip.style.top = y + 10 + 'px';
    tooltip.style.display = 'block';

    // Adjust if tooltip goes off-screen
    setTimeout(() => {
      const rect = tooltip.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        tooltip.style.left = (x - rect.width - 10) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        tooltip.style.top = (y - rect.height - 10) + 'px';
      }
    }, 0);
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  // Detect if device is touch-enabled
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Find and wrap rule text
  function wrapRuleText(node) {
    if (!node || processedNodes.has(node)) return;
    if (node.nodeType !== Node.TEXT_NODE) return;
    if (!node.textContent || !node.textContent.trim()) return;
    
    const parent = node.parentElement;
    if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return;
    if (parent.id === 'munda-tooltip' || parent.id === 'munda-modal') return;
    if (parent.classList.contains('munda-rule-tooltip')) return;

    const text = node.textContent;
    let hasMatch = false;
    let newHTML = text;

    // Sort rules by length (longest first) to match longer rules before shorter ones
    const sortedRules = Object.keys(rules).sort((a, b) => b.length - a.length);

    for (const ruleName of sortedRules) {
      // Create a case-insensitive regex that matches the rule name
      const regex = new RegExp(`\\b${ruleName.replace(/[()]/g, '\\$&')}\\b`, 'gi');
      
      if (regex.test(text)) {
        hasMatch = true;
        newHTML = newHTML.replace(regex, (match) => {
          return `<span class="munda-rule-tooltip" data-rule="${ruleName}" style="border-bottom: 1px dotted #888; cursor: help;">${match}</span>`;
        });
      }
    }

    if (hasMatch) {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = newHTML;
      parent.replaceChild(wrapper, node);
      processedNodes.add(wrapper);
      
      // Attach events to new rule spans
      wrapper.querySelectorAll('.munda-rule-tooltip').forEach(span => {
        const ruleName = span.getAttribute('data-rule');
        const ruleText = rules[ruleName];
        
        if (!isTouchDevice) {
          // Desktop: hover
          span.addEventListener('mouseenter', (e) => {
            showTooltip(ruleText, e.clientX, e.clientY);
          });
          span.addEventListener('mousemove', (e) => {
            showTooltip(ruleText, e.clientX, e.clientY);
          });
          span.addEventListener('mouseleave', hideTooltip);
        }
        
        // Mobile: tap (works for both touch and desktop)
        span.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isTouchDevice) {
            showModal(ruleName, ruleText);
          }
        });
      });
    }
  }

  // Walk the DOM tree
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      wrapRuleText(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip already processed nodes and injected elements
      if (processedNodes.has(node)) return;
      if (node.id === 'munda-tooltip' || node.id === 'munda-modal') return;
      if (node.classList && node.classList.contains('munda-rule-tooltip')) return;
      
      // Process child nodes
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  // Initial scan
  function attachTooltips() {
    processNode(document.body);
  }

  attachTooltips();

  // Watch for dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
          processNode(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('%c✓ Munda Manager Tooltips Active!', 'color: #4a90e2; font-weight: bold; font-size: 14px;');
  console.log(`📖 Loaded ${Object.keys(rules).length} rules`);
  console.log(`📱 Device mode: ${isTouchDevice ? 'touch' : 'desktop'}`);
  console.log('💡 Hover (desktop) or tap (mobile) on rule names to see definitions');
})();


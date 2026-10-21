(async () => {
  const INJECTOR_VERSION = '1.3.0';
  console.log(`🎲 Munda Manager Tooltips ${INJECTOR_VERSION}: Loading...`);
  
  if (window.mundaTooltipsActive) return;
  window.mundaTooltipsActive = true;
  // Rules are injected at build time (scripts/build.py) or provided by the host app/extension.
  const rules = window.MUNDA_MATE_BUNDLED_RULES || /*__MUNDAMATE_RULES__*/null;
  if (!rules) { console.error('MundaMate: no rules bundled'); return; }
  const processedNodes = new WeakSet();

  // Create tooltip element for desktop
  const tooltip = document.createElement('div');
  tooltip.id = 'munda-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    z-index: 999999;
    max-width: min(420px, calc(100vw - 24px));
    max-height: min(55vh, 420px);
    overflow: hidden;
    white-space: pre-wrap;
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
    background: #181818;
    color: #ffffff;
    padding: 24px;
    padding-top: 16px;
    border-radius: 8px;
    max-width: 520px;
    max-height: 85vh;
    overflow-y: auto;
    width: 100%;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8);
    border: 1px solid #333;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
  `;
  
  const modalClose = document.createElement('button');
  modalClose.textContent = '×';
  modalClose.setAttribute('aria-label', 'Close');
  modalClose.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    color: #999;
    border: none;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.2s ease;
  `;
  modalClose.onmouseover = () => modalClose.style.color = '#fff';
  modalClose.onmouseout = () => modalClose.style.color = '#999';
  
  const modalTitle = document.createElement('h3');
  modalTitle.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    padding-right: 32px;
  `;
  
  const modalText = document.createElement('p');
  modalText.style.cssText = `
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: #e0e0e0;
    white-space: pre-wrap;
  `;
  
  modalContent.appendChild(modalClose);
  modalContent.appendChild(modalTitle);
  modalContent.appendChild(modalText);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Weapon table styles
  const mundaStyle = document.createElement('style');
  mundaStyle.textContent = `
    .munda-weapon-table {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
      font-size: 13px;
    }
    .munda-weapon-table th {
      background: #2a2a4a;
      color: #aac4ff;
      padding: 5px 8px;
      text-align: center;
      border: 1px solid #444;
      font-weight: 600;
      white-space: nowrap;
    }
    .munda-weapon-table td {
      padding: 5px 8px;
      text-align: center;
      border: 1px solid #444;
      color: #e8e8e8;
      white-space: nowrap;
    }
    .munda-weapon-table td:last-child {
      text-align: left;
      white-space: normal;
    }
    #munda-modal p { margin: 0 0 10px 0; }
    #munda-modal p:last-child { margin-bottom: 0; }
  `;
  document.head.appendChild(mundaStyle);

  // Convert rule text to safe HTML, rendering weapon profiles as tables
  function formatRuleHTML(text) {
    if (!text) return '';

    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    function makeTable(name, SR, LR, Str, AP, L, Traits) {
      const haName = name ? `<th>Name</th>` : '';
      const tdName = name ? `<td>${esc(name.trim())}</td>` : '';
      const clean = v => esc(String(v).trim().replace(/\.+$/, ''));
      return `<table class="munda-weapon-table"><thead><tr>${haName}<th>SR</th><th>LR</th><th>Str</th><th>AP</th><th>L</th><th>Traits</th></tr></thead>` +
        `<tbody><tr>${tdName}<td>${clean(SR)}</td><td>${clean(LR)}</td><td>${clean(Str)}</td><td>${clean(AP)}</td><td>${clean(L)}</td><td>${clean(Traits)}</td></tr></tbody></table>`;
    }

    // Marker sentinel for table segments
    const tables = [];
    const MARK = '\x00T\x00';

    // Pattern 1 — multiline block: "WeaponName\nSR: x\nLR: x\nStr: x\nAP: x\nL: x\nTraits: x"
    let processed = text.replace(
      /([A-Z][^\n:]{0,40})\nSR:\s*([^\n]+)\nLR:\s*([^\n]+)\nStr:\s*([^\n]+)\nAP:\s*([^\n]+)\nL:\s*([^\n]+)\nTraits:\s*([^\n]+)/g,
      (_, name, SR, LR, Str, AP, L, Traits) => {
        tables.push(makeTable(name, SR, LR, Str, AP, L, Traits));
        return MARK;
      }
    );

    // Pattern 2 — inline: "Profile: SR x; LR x; Str x; AP x; L x; traits"
    processed = processed.replace(
      /Profile:\s*SR\s*([^;]+);\s*LR\s*([^;]+);\s*Str\s*([^;]+);\s*AP\s*([^;]+);\s*L\s*([^;.\n]+)[;.]?\s*([^\n.]*)/g,
      (_, SR, LR, Str, AP, L, traits) => {
        tables.push(makeTable('', SR, LR, Str, AP, L, traits));
        return MARK;
      }
    );

    // Reassemble: split on markers, escape text segments, splice tables back in
    let ti = 0;
    return processed.split(MARK).map((seg, i) => {
      const textHTML = seg.trim()
        ? seg.trim().split(/\n\n+/).filter(p => p.trim())
            .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
        : '';
      return i < processed.split(MARK).length - 1
        ? textHTML + (tables[ti++] || '')
        : textHTML;
    }).join('');
  }

  // Modal controls
  let previousOverflow = '';
  function showModal(title, text) {
    previousOverflow = document.body.style.overflow;
    modalTitle.textContent = title;
    modalText.innerHTML = formatRuleHTML(text);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = previousOverflow;
  }

  modalClose.addEventListener('click', hideModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display !== 'none') hideModal();
  });
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

  function isWeaponTraitContext(element) {
    const table = element.closest('table');
    if (!table || !element.closest('td')) return false;

    return Array.from(table.querySelectorAll('th')).some(
      (header) => header.textContent.trim().toLowerCase() === 'traits'
    );
  }

  function isSkillContext(element) {
    const valueContainer = element.closest('div');
    const label = valueContainer?.previousElementSibling;

    return label?.textContent.trim().toLowerCase() === 'skills';
  }

  function resolveRule(ruleName, element) {
    const entry = rules[ruleName];
    if (typeof entry === 'string') {
      return { title: ruleName, text: entry };
    }

    if (entry && typeof entry === 'object') {
      if (isWeaponTraitContext(element) && entry.weaponTrait) {
        return { title: `${ruleName} — Weapon Trait`, text: entry.weaponTrait };
      }

      if (isSkillContext(element) && entry.skill) {
        return { title: `${ruleName} — Skill`, text: entry.skill };
      }

      const fallbackParts = [];
      if (entry.skill) fallbackParts.push(`Skill: ${entry.skill}`);
      if (entry.weaponTrait) fallbackParts.push(`Weapon trait: ${entry.weaponTrait}`);

      return {
        title: ruleName,
        text: fallbackParts.join('\n\n')
      };
    }

    return { title: ruleName, text: '' };
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function rulePattern(ruleName) {
    if (ruleName === 'Blast (3"/5")') {
      return 'Blast \\((?:3"|5")\\)';
    }

    const variablePlus = ruleName.match(/^(.*) \(X\+\)$/);
    if (variablePlus) {
      return `${escapeRegExp(variablePlus[1])} \\((?:X|\\d+)\\+\\)`;
    }

    const variable = ruleName.match(/^(.*) \(X\)$/);
    if (variable) {
      return `${escapeRegExp(variable[1])} \\((?:X|[^)\\r\\n]+)\\)`;
    }

    // Match the typography used by the site and by pasted rule names.
    if (ruleName === 'Nox Servo-claw') {
      return `[‘’']?Nox[‘’']?\\s+Servo[\\s\\-‐‑–]+claw`;
    }
    return escapeRegExp(ruleName)
      .replace(/['‘’]/g, "['‘’]")
      .replace(/[-‐‑–]/g, '[\\s\\-‐‑–]+')
      .replace(/ /g, '\\s+');
  }

  // One combined expression prevents shorter names (for example, "Heavy")
  // from being matched again inside a longer match such as "Heavy Blows".
  const ruleMatchers = Object.keys(rules)
    .sort((a, b) => b.length - a.length)
    .map((ruleName) => {
      const pattern = rulePattern(ruleName);
      return {
        ruleName,
        pattern,
        exactRegex: new RegExp(`^(?:${pattern})$`, 'iu')
      };
    });

  const combinedRuleRegex = new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${ruleMatchers.map(({ pattern }) => pattern).join('|')})(?![\\p{L}\\p{N}_])`,
    'giu'
  );

  function addRuleInteractions(span, ruleName) {
    span.addEventListener('mouseenter', (event) => {
      if (!window.matchMedia('(hover: hover)').matches) return;
      const resolvedRule = resolveRule(ruleName, span);
      showTooltip(resolvedRule.text, event.clientX, event.clientY);
    });

    span.addEventListener('mousemove', (event) => {
      if (tooltip.style.display === 'block') {
        showTooltip(tooltip.textContent, event.clientX, event.clientY);
      }
    });

    span.addEventListener('mouseleave', hideTooltip);

    span.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideTooltip();
      const resolvedRule = resolveRule(ruleName, span);
      showModal(resolvedRule.title, resolvedRule.text);
    });
  }

  // Find and wrap rule text
  function wrapRuleText(node) {
    if (!node || processedNodes.has(node)) return;
    if (node.nodeType !== Node.TEXT_NODE) return;
    if (!node.textContent || !node.textContent.trim()) return;
    
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'NOSCRIPT'].includes(parent.tagName)) return;
    if (parent.closest('[contenteditable]:not([contenteditable="false"]), select, [role="combobox"], #munda-tooltip, #munda-modal, #mundamate-library, .munda-rule-tooltip')) return;

    const text = node.textContent;
    const matches = Array.from(text.matchAll(combinedRuleRegex));
    if (!matches.length) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    matches.forEach((match) => {
      if (match.index > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      }

      const matchedText = match[0];
      const matcher = ruleMatchers.find(({ exactRegex }) => exactRegex.test(matchedText));
      if (!matcher) {
        fragment.appendChild(document.createTextNode(matchedText));
      } else {
        const span = document.createElement('span');
        span.className = 'munda-rule-tooltip';
        span.dataset.rule = matcher.ruleName;
        span.style.cssText = 'border-bottom: 1px dotted #888; cursor: pointer;';
        span.textContent = matchedText;
        addRuleInteractions(span, matcher.ruleName);
        fragment.appendChild(span);
      }

      cursor = match.index + matchedText.length;
    });

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }

    const wrapper = document.createElement('span');
    wrapper.appendChild(fragment);
    processedNodes.add(wrapper);
    parent.replaceChild(wrapper, node);
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


  // A searchable library makes rules accessible even when absent from the roster.
  const libraryButton = document.createElement('button');
  libraryButton.id = 'mundamate-library';
  libraryButton.textContent = 'Rules · N26';
  libraryButton.style.cssText = 'position:fixed;bottom:20px;right:16px;z-index:999997;padding:12px 16px;border:1px solid #b99753;border-radius:24px;background:#181818;color:#fff;font:600 15px system-ui;cursor:pointer';
  libraryButton.addEventListener('click', () => {
    showModal('MundaMate · N26 rules', '');
    const input = document.createElement('input');
    input.type = 'search'; input.placeholder = 'Search '+Object.keys(rules).length+' rules';
    input.setAttribute('aria-label', 'Search rules');
    input.style.cssText = 'box-sizing:border-box;width:100%;padding:12px;background:#272727;color:white;border:1px solid #888;border-radius:8px;font-size:16px';
    const results = document.createElement('div');
    modalText.replaceChildren(input, results);
    function render() {
      results.replaceChildren();
      const q = input.value.trim().toLowerCase();
      const names = Object.keys(rules).sort().filter(name => (name+' '+JSON.stringify(rules[name])).toLowerCase().includes(q));
      const count = document.createElement('p'); count.textContent = names.length+' matching rules'; results.appendChild(count);
      names.forEach(name => {
        const button = document.createElement('button'); button.textContent = name;
        button.style.cssText='display:block;width:100%;text-align:left;padding:12px;margin:4px 0;background:#252525;color:white;border:1px solid #555;border-radius:6px;font-size:16px';
        button.onclick = () => {
          const entry = rules[name];
          const text = typeof entry === 'string' ? entry : Object.entries(entry).map(([key,value])=>key+': '+value).join('\n\n');
          const back = document.createElement('button'); back.textContent='← Search results'; back.style.cssText=button.style.cssText;
          const detail = document.createElement('div'); detail.innerHTML = formatRuleHTML(text);
          modalTitle.textContent=name; results.replaceChildren(back, detail); input.hidden=true;
          back.onclick=()=>{modalTitle.textContent='MundaMate · N26 rules';input.hidden=false;render();};
        };
        results.appendChild(button);
      });
    }
    input.addEventListener('input', render); render(); input.focus();
  });
  document.body.appendChild(libraryButton);

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

  console.log(`%c✓ Munda Manager Tooltips ${INJECTOR_VERSION} Active!`, 'color: #4a90e2; font-weight: bold; font-size: 14px;');
  console.log(`📖 Loaded ${Object.keys(rules).length} rules`);
  console.log('💡 Click on rule names to see definitions');
})();

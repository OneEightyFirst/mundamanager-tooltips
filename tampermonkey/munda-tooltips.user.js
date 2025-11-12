// ==UserScript==
// @name         Munda Manager Tooltips
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add rule tooltips to Munda Manager
// @author       OneEightyFirst
// @match        https://www.mundamanager.com/*
// @match        https://mundamanager.com/*
// @icon         https://www.mundamanager.com/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('🎲 Munda Manager Tooltips: Loading...');

    // Prevent multiple injections
    if (window.mundaTooltipsActive) {
        console.log('⚠️ Munda Tooltips already active on this page');
        return;
    }
    window.mundaTooltipsActive = true;

    // Bundled rules data
    const rules = {
        "Blaze": "When a weapon with this trait hits a target, the target must make an Initiative check. If failed, they catch fire and suffer a Strength 3, AP -1 hit at the end of each round.",
        "Unwieldy": "This weapon requires both hands to use effectively. The fighter cannot use a second weapon while using this one and suffers a -1 penalty to hit if they moved before shooting.",
        "Rapid Fire (1)": "When making a Shoot action, roll an extra Firepower dice. Each hit beyond the first inflicts another hit on the same target.",
        "Rapid Fire (2)": "When making a Shoot action, roll two extra Firepower dice. Each hit beyond the first inflicts another hit on the same target.",
        "Rapid Fire (3)": "When making a Shoot action, roll three extra Firepower dice. Each hit beyond the first inflicts another hit on the same target.",
        "Knockback": "When a fighter is hit by a weapon with this trait, they are pushed D3\" directly away from the attacker after the hit is resolved.",
        "Scarce": "This weapon's ammo is hard to come by. Out of Ammo results cannot be ignored by spending ammo tokens.",
        "Versatile": "This weapon can be used in close combat or as a ranged weapon. The wielder can choose which profile to use each time they attack.",
        "Blast (3\")": "When this weapon hits, place a 3\" Blast marker with its center on the target. All models touched by the marker are hit.",
        "Blast (5\")": "When this weapon hits, place a 5\" Blast marker with its center on the target. All models touched by the marker are hit.",
        "Melta": "When making a ranged attack at half range or less, add D3 to the weapon's Damage. Roll the extra Damage dice after a successful wound roll.",
        "Plasma": "Before firing, the user can choose to supercharge the weapon for +1 Strength and +1 Damage, but Out of Ammo results cause a wound to the user.",
        "Toxin": "Target wounded by this weapon must make a Toughness check. If failed, they go Out of Action immediately. If passed, treat as a normal wound.",
        "Flash": "If a fighter is hit by this weapon, they must pass an Initiative check or become subject to the Blind condition until the end of the round.",
        "Gas": "Targets hit ignore armor saves. Instead, make a Toughness check. If failed, the target suffers one wound.",
        "Smoke": "Place a 5\" Blast marker when fired. Models within or firing through the cloud suffer -1 to hit. The cloud remains until the End phase.",
        "Template": "Place the Flame template with the narrow end touching the fighter's base. All models under the template are hit automatically.",
        "Seismic": "After resolving hits, make a 5\" Blast centered on the target. Models touched must pass an Initiative check or become Pinned.",
        "Rad-phage": "Targets wounded by this weapon reduce their Toughness by 1 (to a minimum of 1) for the remainder of the battle.",
        "Shock": "When a fighter is wounded by a weapon with this trait, they suffer a Flesh Wound in addition to any other Injury dice rolled.",
        "Graviton Pulse": "Models hit by this weapon halve their Movement and cannot make Charge actions until the end of the next round.",
        "Web": "If a fighter is wounded by a weapon with this trait, they become Webbed and cannot move or make actions until they pass a Strength check in their activation.",
        "Power": "Adds 1 to the weapon's Strength and reduces the target's armor save by 1 (AP -1).",
        "Melee": "This weapon can only be used in close combat.",
        "Sidearm": "This weapon can be used as a secondary weapon in close combat without penalty.",
        "Parry": "If the fighter is charged, they may force the attacker to re-roll one successful hit in close combat.",
        "Backstab": "If the fighter charged their target or made a Coup de Grace action, add 1 to their Strength for the attack.",
        "Paired": "If a fighter is equipped with two weapons with this trait, they can attack with both. Roll double the Attack dice but reduce Strength by 1.",
        "Disarm": "When this weapon wounds a target in close combat, the attacker can force them to drop one weapon (attacker's choice).",
        "Entangle": "When a fighter is hit by this weapon in close combat, they cannot make Reaction attacks until the end of the round.",
        "Cumbersome": "The fighter cannot move and shoot with this weapon in the same activation.",
        "Limited": "This weapon can only be used a limited number of times per battle. Track usage with counters.",
        "Single Shot": "This weapon can only be fired once per battle. After firing, it cannot be reloaded.",
        "Reckless": "When firing this weapon, the user must roll a D6. On a 1, they suffer a hit from the weapon in addition to any other effects.",
        "Unstable": "If an Ammo check is failed, the weapon explodes. The user suffers a Strength 8, Damage 2, AP -2 hit.",
        "Seismic (Melee)": "When this weapon wounds a target in close combat, all models within 3\" of the target (friend or foe) must pass an Initiative check or become Pinned.",
        "Concussion": "Models wounded by this weapon lose their Ready marker if they have one. If they don't have a Ready marker, they cannot gain one in their next activation.",
        "Drag": "When a fighter hits with this weapon in close combat, they can pull the target up to D3\" directly towards them before resolving the wound.",
        "Pulverise": "If the attack dice rolls a natural 6 when attacking with this weapon, the hit is resolved at double Strength.",
        "Rending": "If the wound roll is a natural 6, the attack's AP is improved by 3 (e.g., AP - becomes AP -3).",
        "Silent": "Shooting this weapon does not trigger enemy sentries or alarm conditions in scenarios that use stealth rules.",
        "Cursed": "When this weapon causes a fighter to go Out of Action, roll a D6. On a 5+, that fighter suffers a permanent injury (roll twice on the Lasting Injury table).",
        "Esoteric": "This weapon is so unusual that few understand it. Only the original owner can use it effectively. Other fighters suffer -2 to hit.",
        "Impale": "If this weapon causes an Injury roll of Seriously Injured, the target is impaled and cannot be moved by teammates until a successful Intelligence check is made while assisting them.",
        "Combi": "This weapon has two profiles. The wielder can choose which one to use each time they attack.",
        "Master-crafted": "The wielder may re-roll a single failed hit roll when attacking with this weapon each time they use it.",
        "Legendary": "This weapon is a relic of great power. It grants the wielder +1 to their Cool stat while equipped.",
        "Phase": "This weapon ignores all cover modifiers and can shoot through walls and terrain as if they weren't there.",
        "Solid Projectile": "This weapon does not suffer penalties for shooting through smoke, gas, or other vision-obscuring effects.",
        "Salvo": "When firing this weapon, the user can choose to fire a salvo, making multiple shots at -1 to hit. Roll the Firepower dice twice.",
        "Grenade": "This weapon is a thrown explosive. It uses the Throw Grenade rules and has a maximum range of Sx3 inches."
    };

    const processedNodes = new WeakSet();

    // Create tooltip element
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
        background: #181818;
        color: #ffffff;
        padding: 24px;
        padding-top: 16px;
        border-radius: 8px;
        max-width: 400px;
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
    `;

    modalContent.appendChild(modalClose);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalText);
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
        tooltip.style.left = x + 10 + 'px';
        tooltip.style.top = y + 10 + 'px';
        tooltip.style.display = 'block';

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

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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

        const sortedRules = Object.keys(rules).sort((a, b) => b.length - a.length);

        for (const ruleName of sortedRules) {
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

            wrapper.querySelectorAll('.munda-rule-tooltip').forEach(span => {
                const ruleName = span.getAttribute('data-rule');
                const ruleText = rules[ruleName];

                if (!isTouchDevice) {
                    span.addEventListener('mouseenter', (e) => {
                        showTooltip(ruleText, e.clientX, e.clientY);
                    });
                    span.addEventListener('mousemove', (e) => {
                        showTooltip(ruleText, e.clientX, e.clientY);
                    });
                    span.addEventListener('mouseleave', hideTooltip);
                }

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

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            wrapRuleText(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (processedNodes.has(node)) return;
            if (node.id === 'munda-tooltip' || node.id === 'munda-modal') return;
            if (node.classList && node.classList.contains('munda-rule-tooltip')) return;
            Array.from(node.childNodes).forEach(processNode);
        }
    }

    function attachTooltips() {
        processNode(document.body);
    }

    attachTooltips();

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


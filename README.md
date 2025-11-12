# Munda Manager Rule Tooltips 🎲

A lightweight tooltip system that adds hover/tap definitions for Necromunda rules when viewing cards on [Munda Manager](https://www.mundamanager.com/).

**✨ Features:**
- 📖 Hover over rule names to see instant definitions (desktop)
- 📱 Tap rule names for clean modal popups (mobile)
- 🔄 Works with dynamically loaded content
- 🚀 Zero build step — runs via bookmarklet or Tampermonkey
- 🔒 100% client-side — no server required

---

## 📦 What's Included

```
mundamanager-plugin/
├── rules.json                    # 50+ Necromunda rule definitions
├── inject.js                     # Tooltip injection script
├── bookmarklet.txt              # Bookmarklet code for easy copy-paste
├── index.html                   # Landing page with setup instructions
├── demo.html                    # Standalone demo page
├── README.md                    # This file
└── tampermonkey/
    └── munda-tooltips.user.js   # Tampermonkey userscript (auto-runs!)
```

---

## 🚀 Installation Methods

### Method 1: Tampermonkey (Recommended for Desktop + Firefox Mobile)

**Best for:** Desktop browsers, Firefox Mobile, Kiwi Browser

**⚠️ Note:** Chrome on Android doesn't support extensions. Use Firefox or Kiwi Browser instead.

1. **Install Tampermonkey**:
   - **Desktop Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - **Desktop Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - **Firefox Mobile**: Open Firefox → Menu → Add-ons → Search "Tampermonkey"
   - **Kiwi Browser**: Use Chrome Web Store link above

2. **Install the script**:
   - Open: https://oneeightyfirst.github.io/mundamanager-tooltips/tampermonkey/munda-tooltips.user.js
   - Tampermonkey will detect it and prompt to install
   - Click "Install"

3. **Use it**:
   - Visit https://www.mundamanager.com/
   - Tooltips appear automatically! ✅

### Method 2: Bookmarklet (Desktop Browsers)

**Best for:** Desktop Chrome, Firefox, Safari, Edge

1. **Create a bookmark**:
   - Right-click bookmarks bar → "Add page" or "New bookmark"
   - Name: `MM Rules+`
   - URL: Copy from `bookmarklet.txt` or use:

```javascript
javascript:(async()=>{console.log('🔖 Bookmarklet clicked, loading Munda Tooltips...');const s=document.createElement('script');s.src='https://OneEightyFirst.github.io/mundamanager-tooltips/inject.js';s.onerror=()=>console.error('❌ Failed to load inject.js - is GitHub Pages enabled?');s.onload=()=>console.log('📥 Script loaded successfully');document.body.appendChild(s);})();
```

2. **Use it**:
   - Visit https://www.mundamanager.com/
   - Click your `MM Rules+` bookmark
   - Tooltips appear! ✅

### Method 3: Firefox Mobile Bookmarklet

**Firefox Mobile DOES support bookmarklets properly!**

1. Install Firefox from Play Store
2. Create bookmark with the bookmarklet code above
3. Navigate to mundamanager.com
4. Tap the bookmark - it executes on the page! ✅

### Method 4: Kiwi Browser (Alternative for Android)

Kiwi Browser is Chrome-based but supports bookmarklets:

1. Install Kiwi Browser from Play Store
2. Add bookmarklet (same as desktop)
3. Works perfectly! ✅

---

## ⚠️ Chrome Android Limitations

**Chrome on Android has TWO issues:**
1. ❌ **No bookmarklet support** - clicking them opens a new tab
2. ❌ **No extension support** - can't install Tampermonkey

**Android Solutions:**
- ✅ **Firefox Mobile** - Supports both bookmarklets AND Tampermonkey!
- ✅ **Kiwi Browser** - Supports both bookmarklets AND Tampermonkey!

---

## 📝 Updating Rules

To add or edit rules, update `rules.json` in the GitHub repo:

```json
{
  "New Rule": "Description goes here.",
  "Another Rule": "Another description."
}
```

Commit and push - GitHub Pages will update automatically!

---

## 🎨 How It Works

1. **Bookmarklet**: Injects `inject.js` from GitHub Pages into the current page
2. **Tampermonkey**: Auto-runs the script every time you visit mundamanager.com
3. **Script**: 
   - Fetches `rules.json` (bookmarklet) or has rules embedded (Tampermonkey)
   - Scans the DOM for rule names
   - Wraps matches with interactive spans
   - Adds hover tooltips (desktop) or tap modals (mobile)
   - Uses MutationObserver to handle dynamic content

---

## 🛠️ Troubleshooting

### Bookmarklet doesn't run

**Desktop:**
- Make sure you're on `https://` (bookmarklets may not work on `http://`)
- Check browser console (F12) for errors
- Verify GitHub Pages is enabled

**Mobile Chrome:**
- Bookmarklets don't work in Chrome Android - use Tampermonkey or Firefox instead

### No tooltips appear

1. Open browser console (F12 on desktop)
2. Look for: `✓ Munda Manager Tooltips Active!`
3. If you see errors, check that:
   - GitHub Pages is serving the files
   - You're on www.mundamanager.com (not a different domain)
   - JavaScript is enabled

### Rules not matching

- Rules use case-insensitive matching with word boundaries
- "Blast" won't match "Blaster" 
- Special characters must be exact: "Rapid Fire (1)"
- Check spelling in `rules.json`

---

## 📊 Browser Compatibility

| Browser | Desktop Bookmarklet | Mobile Bookmarklet | Desktop Tampermonkey | Mobile Tampermonkey |
|---------|-------------------|-------------------|---------------------|---------------------|
| **Chrome** | ✅ Yes | ❌ No | ✅ Yes | ❌ No extensions |
| **Firefox** | ✅ Yes | ✅ Yes! | ✅ Yes | ✅ Yes! |
| **Safari** | ✅ Yes | ⚠️ Limited | ⚠️ Limited | ❌ No |
| **Edge** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Kiwi** | N/A | ✅ Yes | N/A | ✅ Yes |

---

## 🎯 Why Not a Native App?

We originally tried building a Capacitor/React Native app, but discovered:

❌ **Munda Manager blocks iframe embedding** (`X-Frame-Options: deny`)  
❌ Complex workarounds needed  
❌ App store approval required  
❌ Must update entire app for rule changes  

The bookmarklet/Tampermonkey approach is actually **better**:

✅ Works directly on mundamanager.com  
✅ No iframe restrictions  
✅ Instant updates via GitHub Pages  
✅ Cross-platform (desktop + mobile)  
✅ No installation friction  
✅ No app store approval needed  

---

## 🤝 Contributing

Want to add more rules?

1. Fork this repo
2. Edit `rules.json`
3. Submit a pull request

Common rules to add:
- Gang-specific rules
- Scenario rules  
- Vehicle rules
- Campaign rules
- House-specific abilities

---

## 📄 Files Overview

### `rules.json`
Contains all rule definitions. Format:
```json
{
  "Rule Name": "Description text"
}
```

### `inject.js`
Main script that:
- Fetches rules from GitHub Pages
- Caches in localStorage (24 hours)
- Scans and wraps rule text
- Handles tooltips and modals
- Monitors for dynamic content

### `bookmarklet.txt`
Ready-to-copy bookmarklet code with error handling and logging.

### `tampermonkey/munda-tooltips.user.js`
Tampermonkey userscript with:
- Embedded rules (no network request)
- Auto-runs on mundamanager.com
- Same tooltip functionality as bookmarklet

### `index.html`
Beautiful landing page with:
- Drag-and-drop bookmarklet installation
- Mobile setup instructions
- Troubleshooting guide

### `demo.html`
Standalone demo page showing tooltips in action without needing to visit mundamanager.com.

---

## 🔗 Links

- **GitHub Repo**: https://github.com/OneEightyFirst/mundamanager-tooltips
- **GitHub Pages**: https://oneeightyfirst.github.io/mundamanager-tooltips/
- **Munda Manager**: https://www.mundamanager.com/

---

## 📜 License

MIT License - Free to use and modify.

---

**Made with ⚔️ for the Necromunda community**

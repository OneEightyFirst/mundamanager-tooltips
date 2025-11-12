# Munda Manager Tooltips 🎲

A lightweight bookmarklet that adds hover/tap tooltips for Necromunda rules when viewing cards on [mundamanager.app](https://mundamanager.app/).

**✨ Features:**
- 📖 Hover over rule names to see instant definitions (desktop)
- 📱 Tap rule names for clean modal popups (mobile)
- 🔄 Works with dynamically loaded content
- 💾 Caches rules locally for faster loading
- 🚀 Zero build step — runs via bookmarklet
- 🔒 100% client-side — no server required

---

## 📦 Deployment Instructions

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `munda-tooltips`
3. Set to **Public**
4. Click **Create repository**

### Step 2: Upload Files

Upload these files to the root of your repo:
- `rules.json`
- `inject.js`

You can do this via:
- **Web UI**: Click "Add file" → "Upload files"
- **Git CLI**:
  ```bash
  git clone https://github.com/YOUR-USERNAME/munda-tooltips.git
  cd munda-tooltips
  # Copy rules.json and inject.js here
  git add .
  git commit -m "Initial commit"
  git push
  ```

### Step 3: Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages** (left sidebar)
2. Under "Source", select:
   - **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
3. Click **Save**
4. Wait 1-2 minutes for deployment

### Step 4: Verify Deployment

Check that your files are accessible:
- `https://YOUR-USERNAME.github.io/munda-tooltips/rules.json`
- `https://YOUR-USERNAME.github.io/munda-tooltips/inject.js`

*(Replace `YOUR-USERNAME` with your actual GitHub username)*

---

## 🔖 Bookmarklet Setup

### Desktop (Chrome, Firefox, Safari, Edge)

1. **Create a new bookmark** (right-click bookmarks bar → Add page / New bookmark)
2. **Name**: `MM Rules+`
3. **URL**: Paste this code (replace `YOUR-USERNAME`):

```javascript
javascript:(async()=>{const s=document.createElement('script');s.src='https://YOUR-USERNAME.github.io/munda-tooltips/inject.js';document.body.appendChild(s);})();
```

4. Save the bookmark

### Mobile (iOS Safari)

1. **Create any bookmark** (open any page → Share → Add Bookmark)
2. **Edit the bookmark**:
   - Go to Bookmarks
   - Tap the bookmark you just created
   - Tap "Edit"
   - Change the name to `MM Rules+`
   - Replace the URL with the bookmarklet code above
3. Save

### Mobile (Android Chrome)

1. **Create any bookmark** (tap ⋮ → ★ Add bookmark)
2. **Edit the bookmark**:
   - Go to Bookmarks (⋮ → Bookmarks)
   - Long-press the bookmark → Edit
   - Change the name to `MM Rules+`
   - Replace the URL with the bookmarklet code above
3. Save

---

## 🎯 Usage

1. Open [mundamanager.app](https://mundamanager.app/)
2. Tap/click your **MM Rules+** bookmark
3. You should see a console message: `✓ Munda Tooltips active`
4. Rule names on the page will now have dotted underlines
5. **Desktop**: Hover over a rule to see its definition
6. **Mobile**: Tap a rule to see a modal popup

---

## 🛠️ Updating Rules

To add or edit rules:

1. Edit `rules.json` in your repo
2. Commit and push changes
3. GitHub Pages will update automatically
4. Users' browsers will fetch the new version within 24 hours (or immediately if they clear cache)

**Rule Format:**
```json
{
  "Rule Name": "Rule description goes here.",
  "Another Rule": "Another description."
}
```

---

## 🎨 Enhancements Included

This implementation includes several optional enhancements:

### ✅ Better Mobile UX
- Uses modal overlay instead of `alert()` for cleaner presentation
- Touch-optimized with tap detection
- Prevents double-handling on hybrid devices

### ✅ LocalStorage Caching
- Caches rules for 24 hours to reduce network requests
- Falls back to remote fetch if cache is stale or missing
- Improves performance on repeated visits

### ✅ Optimized DOM Scanning
- Uses `WeakSet` to track processed nodes and avoid duplicate processing
- Sorts rules by length to match longer phrases before shorter ones
- Processes only text nodes for efficiency
- Prevents re-processing of already wrapped elements

### ✅ Better Styling
- Modern gradient backgrounds
- Smooth transitions and hover effects
- Responsive sizing for mobile screens
- Professional typography with system fonts

### ✅ Smart Tooltip Positioning
- Auto-adjusts if tooltip would go off-screen
- Follows cursor on desktop
- Fixed positioning that works with scrolling

---

## 🐛 Troubleshooting

**Bookmarklet doesn't work:**
- Make sure you're on `https://` (bookmarklets may not work on `http://` in some browsers)
- Check that GitHub Pages is enabled and files are accessible
- Try clearing browser cache

**Rules don't appear:**
- Open browser console (F12) and check for errors
- Verify `inject.js` contains your correct GitHub username in `RULES_URL`
- Make sure the JSON file is valid (use [jsonlint.com](https://jsonlint.com/))

**Tooltips show on wrong elements:**
- This can happen if rule names are common words (e.g., "Power", "Blast")
- The script uses `\b` word boundaries to minimize false matches
- You may need to refine rule names or add context

---

## 📄 License

Free to use and modify. This is a fan-made tool for the Necromunda community.

---

## 🤝 Contributing

Want to add more rules? Submit a PR with updates to `rules.json`!

Common rules to add:
- Gang-specific rules
- Scenario rules
- Vehicle rules
- Campaign rules
- House-specific abilities

---

## 📸 Screenshots

### Desktop View
When you hover over a rule name:
```
┌─────────────────────────────┐
│ Blaze                       │
│ When a weapon with this     │
│ trait hits a target, the    │
│ target must make an...      │
└─────────────────────────────┘
```

### Mobile View
When you tap a rule name:
```
╔═══════════════════════════════╗
║  Blaze                        ║
║  ─────────────────────────    ║
║  When a weapon with this      ║
║  trait hits a target...       ║
║                               ║
║  [ Close ]                    ║
╚═══════════════════════════════╝
```

---

**Happy gaming! May the Emperor protect your gang! ⚔️**


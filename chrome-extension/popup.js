(async () => {
  const $ = id => document.getElementById(id);
  const search = $('search'), house = $('house'), category = $('category');
  const results = $('results'), count = $('count'), detail = $('detail');
  const normalize = text => text.toLowerCase().replace(/['‘’]/g, '').replace(/[-‐‑–]/g, ' ').replace(/\s+/g, ' ').trim();
  let limit = 40;
  function showDetail(title, text) {
    $('rule-title').textContent = title; $('rule-text').textContent = text;
    results.hidden = true; detail.hidden = false; detail.scrollTop = 0;
    $('back').focus();
  }
  function showResults() { detail.hidden = true; results.hidden = false; }
  $('back').addEventListener('click', () => {showResults(); search.focus();});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !detail.hidden) {event.preventDefault();showResults();search.focus();}
  });
  let coverageText = 'Loading…';
  $('coverage').addEventListener('click', () => showDetail('Coverage', coverageText));
  try {
    const [rules, metadata] = await Promise.all(['rules.json', 'house-rules.json'].map(async file => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Cannot load ${file}`);
      return response.json();
    }));
    const entries = Object.entries(rules).map(([name, entry]) => {
      const text = typeof entry === 'string' ? entry : Object.entries(entry).map(([kind, value]) => `${kind}: ${value}`).join('\n\n');
      const meta = metadata[name] || {house: '', category: 'Existing rules'};
      return {name, text, ...meta, normalizedName: normalize(name), search: normalize(`${name} ${text} ${meta.category}`)};
    }).sort((a, b) => a.name.localeCompare(b.name));
    const houses = [...new Set(entries.map(entry => entry.house).filter(Boolean))].sort();
    houses.forEach(value => {
      const option = document.createElement('option'); option.value = value; option.textContent = value; house.appendChild(option);
    });
    coverageText = `${entries.length} N26 rules: core skills, traits and actions; House of Blades and House of Chains journal entries; and fighter special rules, gang special rules and wyrd powers from Gangs of the Underhive, Gangs of the Outlands and Most Wanted. Each added entry cites its book and PDF page; FAQ and errata changes are applied where they exist.\n\nThis is a reference lookup. It does not add roster options or change stats in Munda Manager.\n\nTerritories, side jobs, alliances and gang-building rules are not in the tooltip catalog. No older-edition rules were used to fill gaps.`;
    [...new Set(entries.map(entry => entry.category))].sort().forEach(value => {
      const option = document.createElement('option'); option.value = value; option.textContent = value; category.appendChild(option);
    });
    function render() {
      showResults();
      const query = normalize(search.value), words = query.split(' ').filter(Boolean);
      const filtered = entries.filter(entry => (!house.value || entry.house.includes(house.value)) && (!category.value || entry.category === category.value) && words.every(word => entry.search.includes(word)));
      const rank = entry => entry.normalizedName === query ? 0 : entry.normalizedName.includes(query) ? 1 : 2;
      filtered.sort((a,b) => rank(a)-rank(b) || a.name.localeCompare(b.name));
      const fragment = document.createDocumentFragment();
      count.textContent = `${filtered.length} of ${entries.length} rules` + (filtered.length > limit ? ` · showing ${limit}` : '');
      for (const entry of filtered.slice(0,limit)) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'rule'; button.textContent = entry.name;
        const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = [entry.house, entry.category].filter(Boolean).join(' · '); button.appendChild(tag);
        button.addEventListener('click', () => showDetail(entry.name, entry.text)); fragment.appendChild(button);
      }
      if (filtered.length > limit) {
        const more = document.createElement('button'); more.id = 'more'; more.type = 'button'; more.textContent = 'Show more rules';
        more.addEventListener('click', () => {const scroll = results.scrollTop;limit += 40;render();results.scrollTop = scroll;});fragment.appendChild(more);
      }
      if (!filtered.length) {
        const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'No matching rules. Try a shorter search or clear the filters.'; fragment.appendChild(empty);
      }
      results.replaceChildren(fragment);
    }
    function changed() {limit=40;results.scrollTop=0;render();}
    search.addEventListener('input', changed);house.addEventListener('change', changed);category.addEventListener('change', changed);
    render();
  } catch (error) {
    count.textContent = 'Rules could not be loaded. Reload MundaMate in Chrome’s extensions page.';
    console.error(error);
  }
})();

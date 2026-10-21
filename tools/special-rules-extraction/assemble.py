import json,re,os
c=json.load(open('curated.json'))
BOOK={'UH':'Necromunda Skirmish - Gangs of the Underhive','OL':'Necromunda Skirmish - Gangs of the Outlands','MW':'Necromunda Additional Rules - Most Wanted','EJ':'Escher Journal 2026 (House of Blades)','GJ':'Goliath Journal 2026 (House of Chains)'}
FIX={
 'Force Blast (Free)':lambda t:'Continuous Effect. '+t.replace(' SR LR Str AP L Traits Force blast 8" 12" 2 -1 1 Knockback (3+)','\nForce blast\nSR: 8"\nLR: 12"\nStr: 2\nAP: -1\nL: 1\nTraits: Knockback (3+)'),
 'Force Field (Single)':lambda t:'Continuous Effect. '+t,
 'Extra Arm':lambda t:t.replace(' SR LR Str AP L Traits Clawed arm E s 1 Additional Attacks (1), Melee, Rending (6+)','\nClawed arm\nSR: E\nLR: -\nStr: S\nAP: -\nL: 1\nTraits: Additional Attacks (1), Melee, Rending (6+)'),
 'Lands on Their Feet':lambda t:t+' 3" when consulting the Falling table.',
 'Random Movement':lambda t:t+' Spawn is activated.' if not t.endswith('activated.') else t,
 'A Band Apart':lambda t:t.rstrip(',').rstrip('.,')+'.' if t.endswith(',') else t,
 'Ashwing Lure':lambda t:re.sub(r'Once an Ashwing Lure.*$','Once an Ashwing Lure has been placed upon the battlefield, it may be activated as if it were a Fighter. When it is activated, all Ashwing Helamites it controls are activated as a single Group Activation.',t),
 'Useful Lies':lambda t:'During the Pre-battle and Post-battle Sequences, a gang with a Whisper Merchant may count the result of a single D6 roll as a 6 in the following circumstances: determine starting crew (when random crew size applies), rolling on the Escape table and Receive Rewards. This ability can be used only once in each sequence and, each time it is used, make a note on the gang roster. Once this ability has been used six times, the Whisper Merchant calls in their debt and the gang must pay their Credit Cost again or remove the Whisper Merchant from their gang roster.',
 'Prime Bomb Rat (Single)':lambda t:re.sub(r'otherwise the\s*$','otherwise the bomb delivery rat escapes. Either way, remove them from the battlefield.',t),
 'Warped Monstrosity':lambda t:'When a Chaos Spawn is added to the Gang Roster, roll a D6 for each characteristic in their profile and consult the table below to determine their value: D6 1 — WS 5+, S 3, T 4, W 1, I 2, A 1, Sv 6+. D6 2-5 — WS 4+, S 4, T 5, W 2, I 3, A 2, Sv 5+. D6 6 — WS 3+, S 5, T 6, W 3, I 4, A 3, Sv 4+.',
 'The Finest Merchandise':lambda t:t.replace('Post-cycle A they','Post-cycle Action as if they'),
 'Ambush Predator':lambda t:t.replace(' d J ',' '),
}
RENAME={'Mastery of the lmmaterium':'Mastery of the Immaterium',"Helmawr's Heir":'Helmawr’s Heir'}
def fix(t):
    t=t.replace('Iron head','Ironhead').replace('~ ','').replace(' O credits',' 0 credits').replace('Slapper','Slopper').replace('Postbattle','Post-battle').replace('lmmaterium','Immaterium')
    return re.sub(r'[ \t]{2,}',' ',t).strip()
def words(t): return set(re.sub(r'[^a-z0-9]+',' ',t.lower()).split())
def house(sec,book):
    s=re.sub(r'\s{2,}.*','',sec)
    m=re.match(r'(?:HOUSE )?([A-Z][A-Z \'’]+?) - ',s)
    if book=='MW': return 'Most Wanted'
    if book in('EJ',): return 'Escher'
    if book=='GJ': return 'Goliath'
    if m:
        h=m.group(1).title().replace("'S","'s")
        h=re.sub(r'^Supplementary Fighters?$','Supplementary fighters',h)
        return h
    return ''
rules={}; meta={}
for n,v in c.items():
    name=RENAME.get(n,n)
    kept=[]
    for x in v:
        t=fix(FIX[n](x['text']) if n in FIX else x['text'])
        x=dict(x,text=t)
        if any(len(words(t)&words(k['text']))/max(1,len(words(t)|words(k['text'])))>0.85 for k in kept): continue
        kept.append(x)
    parts=[]
    for x in kept:
        parts.append(f"{x['text']}\n(Source: {BOOK[x['book']]}, PDF p. {x['page']})")
    rules[name]='\n\n'.join(parts)
    cat='Wyrd power' if re.search(r'WYRD POWERS',kept[0]['section']) else ('Action' if re.search(r'\((Single|Double|Free)\)$',name) else 'Special rule')
    meta[name]={'house':house(kept[0]['section'],kept[0]['book']),'category':cat,'source':'; '.join(sorted({f"{BOOK[x['book']]}, PDF p. {x['page']}" for x in kept}))}
rules['Leash Range']=("Pets are purchased as wargear for a model. When their owner is deployed to the battlefield, including as part of a special rule, any Pets they own are deployed following the rules for the model’s deployment within their Leash range of their owner. When a model that owns any Pets activates, check if each of their Pets are outside of their Leash range; any that are will become Panicked. A Panicked Pet must attempt to end their activation within Leash Range of their owner. If they are unable to do so, they must end their activation as close as possible to their owner. Each Pet's profile gives its Leash range (for example, a Phyrr Cat has a 9\" Leash range; a Phelynx or Sumpkroc has a 3\" Leash range)."
 "\n(Source: N26 Core Rulebook, Model Types — Pet; Gangs of the Underhive, PDF pp. 42, 54)")
meta['Leash Range']={'house':'Core','category':'Special rule','source':'N26 Core Rulebook, Pet / Panicked; Gangs of the Underhive, PDF pp. 42, 54'}
json.dump(rules,open('new-rules.json','w'),indent=1,ensure_ascii=False); json.dump(meta,open('new-meta.json','w'),indent=1,ensure_ascii=False)
print(len(rules))
for n in ['Poison Blood','Nimble','Combat Chems Stash','Tend Patient','Crush (Free)']: print('##',n,meta[n]); print(rules[n]); print()
import collections; print(collections.Counter(m['house'] for m in meta.values()))

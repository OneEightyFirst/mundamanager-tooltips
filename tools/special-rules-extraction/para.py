import json,re,os
NAME=re.compile(r"^\s*([A-Za-z][A-Za-z'’\- ]{1,45}?(?:\s?\([A-Za-z0-9+\"/ ]+\))?)(?:,\s*Continuous Effect)?:\s+(\S.*)$")
HEAD=re.compile(r"^\s*[A-Z0-9][A-Z0-9 '’\-:&,()]{4,}$")
STAT=re.compile(r"^\s*(M|Ld)\s+(ws|WS|Cl)\b")
STOPNAMES={'Equipment','Skills','Skill','Starting Skill','Starting Skills','Skill Access','Wargear','Weapons','Options','Note','Example','Type','Cost','Requirements','Restrictions'}
def clean(s):
    s=re.sub(r'(\w)-\n\s*(?=[a-z])',r'\1',s); s=re.sub(r'\s*\n\s*',' ',s)
    s=re.sub(r'\s+([,.;:])',r'\1',s); s=re.sub(r'\bl(?=[A-Z])','I',s)
    s=s.replace('lronhead','Ironhead').replace(' lf ',' If ').replace(' ln ',' In ')
    return re.sub(r'\s{2,}',' ',s).strip()
res=[]
for k in ['UH','OL','GJ','EJ','MW']:
    allc=json.load(open(k+'.cols.json'))
    for ci,c in enumerate(allc):
        L=c['text'].split('\n'); section=''; ctx=''
        for l in L:
            if l.strip(): section=l.strip(); break
        i=0
        while i<len(L):
            l=L[i]
            if HEAD.match(l) and not NAME.match(l): ctx=l.strip()
            m=NAME.match(l)
            if m and not l.strip().startswith('•'):
                name=m.group(1).strip()
                if name[0].islower(): name=name[0].upper()+name[1:]
                parts=[m.group(2)]; blanks=0; j=i+1
                while j<len(L):
                    t=L[j]
                    if not t.strip():
                        blanks+=1
                        if blanks>=3: break
                        j+=1; continue
                    if (NAME.match(t) and not t.strip().startswith('•')) or HEAD.match(t) or STAT.match(t): break
                    if blanks>=2 and not t.strip().startswith('•'): break
                    blanks=0; parts.append(t); j+=1
                txt='\n'.join(parts)
                if j>=len(L) and not re.search(r'[.:)!]\s*$',txt.strip()) and ci+1<len(allc) and allc[ci+1]['page']==c['page']:
                    nxt=allc[ci+1]['text'].split('\n')
                    nl=[t for t in nxt if t.strip()]
                    for t in nl[1:] if nl and HEAD.match(nl[0]) else nl:
                        if (NAME.match(t) and not t.strip().startswith('•')) or HEAD.match(t) or STAT.match(t): break
                        parts.append(t)
                res.append(dict(name=name,book=k,page=c['page'],section=section,ctx=ctx,text=clean('\n'.join(parts))))
                i=j; continue
            i+=1
json.dump(res,open('paras.json','w'),indent=1); print(len(res))

import re,sys,json
def split_page(lines):
    lines=[l.rstrip() for l in lines]
    W=max((len(l) for l in lines),default=0)
    if W==0: return []
    txt=[l for l in lines if l.strip()]
    occ=[0]*(W+1)
    for l in txt:
        for i,ch in enumerate(l):
            if ch!=' ': occ[i]+=1
    thr=max(1,int(len(txt)*0.04))
    # gutters: runs of >=3 low-occupancy columns, not at edges
    gut=[];i=0
    while i<W:
        if occ[i]<=thr:
            j=i
            while j<W and occ[j]<=thr: j+=1
            if j-i>=3 and i>5 and j<W-5: gut.append((i+j)//2)
            i=j
        else: i+=1
    bounds=[0]+gut+[W+1]
    cols=[]
    for a,b in zip(bounds,bounds[1:]):
        cols.append('\n'.join(l[a:b].rstrip() for l in lines))
    return cols
k=sys.argv[1]
pages=open(k+'.layout.txt',encoding='utf-8',errors='replace').read().split('\f')
out=[]
for pi,p in enumerate(pages,1):
    for ci,c in enumerate(split_page(p.split('\n'))):
        out.append(dict(page=pi,col=ci,text=c))
json.dump(out,open(k+'.cols.json','w'))
print(k,len(pages),len(out))

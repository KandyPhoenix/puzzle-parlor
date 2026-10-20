#!/usr/bin/env python3
"""Release the next queued puzzle into the live app. Run from the repo root:
    python3 tools/release_next.py          # releases the top line of tools/queue.tsv
    python3 tools/release_next.py <slug>   # releases that slug instead
Then commit and push; Cloudflare Pages deploys main automatically.
Needs Pillow (pip install pillow)."""
import sys,os,json,re,hashlib,shutil
from PIL import Image, ImageOps
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q=os.path.join(R,'tools/queue.tsv')
lines=open(Q,encoding='utf-8').read().split('\n')
rows=[l for l in lines if l.strip() and not l.startswith('#')]
if not rows: print('queue is empty'); sys.exit(0)
pick=None
for l in rows:
    if len(sys.argv)<2 or l.split('\t')[1]==sys.argv[1]: pick=l; break
if not pick: print('slug not in queue'); sys.exit(1)
cat,slug,title,artist,year,page=(pick.split('\t')+['']*6)[:6]
src=os.path.join(R,'queue/img',slug+'.jpg')
if not os.path.exists(src): print('missing',src); sys.exit(1)
# 1. picture + thumbnail
dst=os.path.join(R,'public/img',slug+'.jpg'); shutil.copy(src,dst)
im=Image.open(dst); w,h=im.size
ImageOps.fit(im,(520,390),Image.LANCZOS).save(os.path.join(R,'public/thumbs',slug+'.jpg'),'JPEG',quality=78,optimize=True,progressive=True)
# 2. add to the app's image list (a theme must already exist in CATS; this script does not add themes)
H=os.path.join(R,'public/index.html'); s=open(H,encoding='utf-8').read()
head,rest=s.split('const IMAGES=',1); arr,tail=rest.split(';\nconst SIZES',1)
imgs=json.loads(arr)
if any(i['slug']==slug for i in imgs): print(slug,'already live'); sys.exit(1)
if f"id:'{cat}'" not in s: print('theme',cat,'is not in CATS; add it to public/index.html and tools/index.src.html first'); sys.exit(1)
imgs.append({'cat':cat,'slug':slug,'title':title,'artist':artist,'year':year,'w':w,'h':h,'page':page,'isNew':True,'added':__import__('datetime').date.today().isoformat()})
s=head+'const IMAGES='+json.dumps(imgs,ensure_ascii=False)+';\nconst SIZES'+tail
open(H,'w',encoding='utf-8').write(s)
# 3. new service-worker cache name so every device drops the old copy
hh=hashlib.md5(s.encode('utf-8')+b''.join(open(os.path.join(R,'public/img',i['slug']+'.jpg'),'rb').read(4096) for i in imgs)).hexdigest()[:10]
SW=os.path.join(R,'public/sw.js'); sw=open(SW).read(); open(SW,'w').write(re.sub(r"const C='puzzle-parlor-[^']*';",f"const C='puzzle-parlor-{hh}';",sw))
# 4. bookkeeping: queue -> list
open(Q,'w',encoding='utf-8').write('\n'.join(l for l in lines if l!=pick))
L=os.path.join(R,'tools/list.tsv'); open(L,'a',encoding='utf-8').write(f'{cat}\t{slug}\t{page}\n')
os.remove(src)
print(f'released {slug} ({title}) into {cat}; {len(rows)-1} left in queue; cache {hh}')

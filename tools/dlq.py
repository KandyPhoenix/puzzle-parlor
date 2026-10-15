import json,urllib.request,urllib.parse,time,io,os,re,html
from PIL import Image
UA={'User-Agent':'PuzzleBuilder/1.0 (kandyphoenix@hotmail.com)'}
def get(u):
    for i in range(10):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120).read()
        except urllib.error.HTTPError as e:
            if e.code!=429: raise
            print(' 429 wait',30*(i+1),flush=True); time.sleep(30*(i+1))
    raise SystemExit('gave up')
rows=[l.rstrip('\n').split('\t') for l in open('queue.tsv') if l.strip()]
meta=json.load(open('meta.json')); have={m['slug'] for m in meta}
miss=[r for r in rows if r[1] not in have]
r=json.loads(get('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','titles':'|'.join(t for *_,t in miss),'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':1920,'iiextmetadatafilter':'LicenseShortName|Artist|DateTimeOriginal','format':'json'})))
norm={n['to']:n['from'] for n in r['query'].get('normalized',[])}
info={norm.get(p['title'],p['title']):p['imageinfo'][0] for p in r['query']['pages'].values()}
clean=lambda s:re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s or ''))).strip()
for c,s,t in miss:
    ii=info[t]; m=ii['extmetadata']
    if not os.path.exists(f'img/{s}.jpg'):
        im=Image.open(io.BytesIO(get(ii['thumburl']))).convert('RGB'); im.thumbnail((2400,2400),Image.LANCZOS)
        im.save(f'img/{s}.jpg','JPEG',quality=84,optimize=True,progressive=True); time.sleep(4)
    im=Image.open(f'img/{s}.jpg')
    meta.append(dict(cat=c,slug=s,w=im.width,h=im.height,lic=clean(m['LicenseShortName']['value']),artist=clean(m.get('Artist',{}).get('value'))[:40],date=clean(m.get('DateTimeOriginal',{}).get('value'))[:30],name='',page=ii['descriptionurl']))
    print(s,im.size,meta[-1]['lic'],'|',meta[-1]['artist'],'|',meta[-1]['date'],flush=True)
    json.dump(meta,open('meta.json','w'),indent=1)

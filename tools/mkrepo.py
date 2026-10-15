# Build the repo copy of the app (adds PWA head + service-worker registration) from out/index.html
import json,sys
from PIL import Image
R='/home/user/puzzle-parlor'
s=open('out/index.html').read()
imgs=json.loads(s.split('const IMAGES=')[1].split(';\nconst SIZES')[0])
for m in imgs: m['w'],m['h']=Image.open(R+'/public/img/'+m['slug']+'.jpg').size
s=s.split('const IMAGES=')[0]+'const IMAGES='+json.dumps(imgs,ensure_ascii=False)+';\nconst SIZES'+s.split(';\nconst SIZES',1)[1]
head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#f1f2f4">
<meta name="description" content="Free online jigsaw puzzles for iPad, phone and computer. Halloween, Christmas, famous paintings and fairy tales, 100 to 1,000 pieces, sharp zoom, no ads.">
<link rel="canonical" href="https://puzzles.kandyphoenix.com/">
<meta property="og:type" content="website">
<meta property="og:title" content="Puzzle Parlor: Free Online Jigsaw Puzzles">
<meta property="og:description" content="Relaxing jigsaw puzzles for tablet, phone and PC. 100 to 1,000 pieces, sharp zoom, no ads, plays offline.">
<meta property="og:url" content="https://puzzles.kandyphoenix.com/">
<meta property="og:image" content="https://puzzles.kandyphoenix.com/shots/og-home.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="https://puzzles.kandyphoenix.com/shots/og-home.jpg">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"Puzzle Parlor","url":"https://puzzles.kandyphoenix.com/","applicationCategory":"GameApplication","genre":"Jigsaw puzzle","operatingSystem":"Any (web browser), Android","browserRequirements":"Requires a modern browser","image":"https://puzzles.kandyphoenix.com/shots/tablet.jpg","description":"Online jigsaw puzzles with 100 to 1,000 pieces, full-resolution zoom, a piece tray, hard mode and cross-device sync. Free version available; full version unlocks every picture.","offers":[{"@type":"Offer","name":"Free version","price":"0","priceCurrency":"USD"},{"@type":"Offer","name":"Full version","price":"2.99","priceCurrency":"USD","url":"https://puzzles.kandyphoenix.com/buy"}],"publisher":{"@type":"Organization","name":"Puzzle Parlor","email":"puzzles@phoenixmethodseo.com"}}</script>
'''
s=s.replace('<meta charset="utf-8">\n','',1)
i=s.index('<main id="gallery">')
open(R+'/public/index.html','w').write(head+s[:i]+'<style>html,body{margin:0}img{max-width:100%}</style>\n</head>\n<body>\n'+s[i:]+"""
<script>if('serviceWorker' in navigator&&location.protocol!=='file:'&&!window.Capacitor)navigator.serviceWorker.register('sw.js').catch(()=>{});</script>
</body>
</html>
""")
import hashlib,re
# service worker cache name follows the content, so every deploy drops stale pictures
h=hashlib.md5(open(R+'/public/index.html','rb').read()+b''.join(open(R+'/public/img/'+m['slug']+'.jpg','rb').read(4096) for m in imgs)).hexdigest()[:10]
sw=open(R+'/public/sw.js').read(); sw=re.sub(r"const C='puzzle-parlor-[^']*';",f"const C='puzzle-parlor-{h}';",sw); open(R+'/public/sw.js','w').write(sw)
print('repo index written, cache',h)

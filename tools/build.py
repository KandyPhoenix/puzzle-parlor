import json,os,shutil
from PIL import Image, ImageOps
D={
'witches-sabbath':("Witches' Sabbath","Francisco Goya","1797–98"),
'triumph-of-death':("The Triumph of Death","Pieter Bruegel the Elder","c. 1562"),
'isle-of-the-dead':("Isle of the Dead","Arnold Böcklin","1880"),
'the-nightmare':("The Nightmare","Henry Fuseli","1781"),
'flight-of-witches':("Flight of the Witches","Francisco Goya","1798"),
'ice-skaters':("Ice Scene","Hendrick Avercamp","1610"),
'st-nicholas':("The Feast of St. Nicholas","Jan Steen","c. 1663–65"),
'thanksgiving':("Thanksgiving at Plymouth","Jennie Augusta Brownscombe","1925"),
'childrens-games':("Children's Games","Pieter Bruegel the Elder","1560"),
'hunters-in-snow':("Hunters in the Snow","Pieter Bruegel the Elder","1565"),
'bethlehem':("The Census at Bethlehem","Pieter Bruegel the Elder","1566"),
'merry-christmas':("Merry Christmas (Glade jul)","Viggo Johansen","1891"),
'christmas-eve':("Christmas Eve","Carl Larsson","1904–05"),
'mystic-nativity':("Mystic Nativity","Sandro Botticelli","c. 1500"),
'starry-night':("The Starry Night","Vincent van Gogh","1889"),
'great-wave':("The Great Wave off Kanagawa","After Katsushika Hokusai","c. 1830–32 design"),
'grande-jatte':("A Sunday on La Grande Jatte","Georges Seurat","1884–86"),
'the-kiss':("The Kiss","Gustav Klimt","1907–08"),
'water-lilies':("Water Lilies","Claude Monet","1916"),
'cafe-terrace':("Café Terrace at Night","Vincent van Gogh","1888"),
'boating-party':("Luncheon of the Boating Party","Pierre-Auguste Renoir","1880–81"),
'earthly-delights':("The Garden of Earthly Delights","Hieronymus Bosch","c. 1480–1505"),
'titans-goblet':("The Titan's Goblet","Thomas Cole","1833"),
'midsummer-eve':("Midsummer Eve","Edward Robert Hughes","c. 1908"),
'bogatyrs':("Bogatyrs","Viktor Vasnetsov","1898"),
'fairy-feller':("The Fairy Feller's Master-Stroke","Richard Dadd","c. 1855–64"),
'voyage-of-life':("The Voyage of Life: Childhood","Thomas Cole","1842"),
'wrath':("The Great Day of His Wrath","John Martin","c. 1851–53"),
'haunted-village':("Haunted Hollow Village","Original art",""),
'monster-ball':("The Monster Ball","Original art",""),
'witch-kitchen':("The Witch's Kitchen","Original art",""),
'midnight-graveyard':("Midnight Graveyard","Original art",""),
'sierra-nevada':("Among the Sierra Nevada, California","Albert Bierstadt","1868"),
'landers-peak':("The Rocky Mountains, Lander's Peak","Albert Bierstadt","1863"),
'heart-of-andes':("Heart of the Andes","Frederic Edwin Church","1859"),
'yellowstone':("The Grand Canyon of the Yellowstone","Thomas Moran","1872"),
'the-oxbow':("The Oxbow","Thomas Cole","1836"),
'pine-forest':("Morning in a Pine Forest","Ivan Shishkin and Konstantin Savitsky","1889"),
'wheat-cypresses':("Wheat Field with Cypresses","Vincent van Gogh","1889"),
'fairytale-kingdom':("Once Upon a Kingdom","Original art",""),
'gingerbread-house':("Hansel and Gretel's Gingerbread House","Original art",""),
'grey-wolf':("Ivan Tsarevich Riding the Grey Wolf","Viktor Vasnetsov","1889"),
'flying-carpet':("The Flying Carpet","Viktor Vasnetsov","1880"),
'sleeping-princess':("The Sleeping Princess","Viktor Vasnetsov","1900–26"),
'tuvstarr':("Princess Tuvstarr Gazing into the Forest Pool","John Bauer","1913"),
'santa-workshop':("Santa's Workshop","Original art",""),
'gingerbread-village':("Gingerbread Village","Original art",""),
'sleigh-over-town':("Christmas Eve Flight","Original art",""),
'sea-of-fog':("Wanderer above the Sea of Fog","Caspar David Friedrich","c. 1817"),
'forest-picnic':("The Woodland Picnic","Original art",""),
'grand-prix-street':("Street Circuit Showdown","Original art",""),
'tide-pool':("Tide Pool Treasures","Original art",""),
'penguin-beach':("Penguin Beach Party","Original art",""),
'stadium-lights':("Under the Stadium Lights","Original art",""),
'drag-race':("Sunset Drag Race","Original art",""),
'hunter-and-dog':("The Hunter and His Dog","Original art",""),
'regatta':("Regatta Day","Original art",""),
'bookshop-cafe':("The Bookshop Café","Original art",""),
'blossom-village':("Cherry Blossom Village","Original art",""),
'koi-pond':("Koi Pond at Dusk","Original art",""),
'autumn-village':("Autumn in the Village","Original art",""),
'savanna-sunset':("Waterhole at Sunset","Original art",""),
'aurora-lake':("Northern Lights over the Lake","Original art",""),
'choose-happiness':("Choose Happiness","Original art",""),
'todays-forecast':("Today's Forecast","Original art",""),
'on-fire':("Some Days I'm on Fire","Original art",""),
'choose-peace':("Today I Choose Peace","Original art",""),
'silly-cow':("A Little Silliness","Original art",""),
'zen-garden':("Evening in the Zen Garden","Original art",""),
'zen-morning':("Morning in the Zen Garden","Original art",""),
'carnival-lights':("A Night at the Fair","Original art",""),
'rocky-storm':("A Storm in the Rocky Mountains, Mt. Rosalie","Albert Bierstadt","1866"),
'poppy-field':("Poppy Field","Claude Monet","1873"),
'paris-rainy-day':("Paris Street; Rainy Day","Gustave Caillebotte","1877"),
'woman-parasol':("Woman with a Parasol","Claude Monet","1875"),
'train-countryside':("Train in the Countryside","Claude Monet","c. 1870"),
'breezing-up':("Breezing Up (A Fair Wind)","Winslow Homer","1873–76"),
'fog-warning':("The Fog Warning","Winslow Homer","1885"),
'cat-cafe':("Chaos at the Cat Café","Original art",""),
'dog-park':("Dog Park Day","Original art",""),
}
meta={m['slug']:m for m in json.load(open('meta.json'))}
rows=[l.rstrip('\n').split('\t') for l in open('list.tsv') if l.strip()]
NEWC={'haunted-village':'halloween','monster-ball':'halloween','witch-kitchen':'halloween','midnight-graveyard':'halloween','fairytale-kingdom':'fairytales','gingerbread-house':'fairytales','santa-workshop':'christmas','gingerbread-village':'christmas','sleigh-over-town':'christmas','forest-picnic':'animals','cat-cafe':'animals','dog-park':'animals','grand-prix-street':'sports','tide-pool':'animals','penguin-beach':'animals','stadium-lights':'sports','drag-race':'sports','bookshop-cafe':'christmas','blossom-village':'landscapes','koi-pond':'animals','autumn-village':'holiday','savanna-sunset':'animals','aurora-lake':'landscapes','choose-happiness':'vibes','todays-forecast':'vibes','on-fire':'vibes','choose-peace':'vibes','silly-cow':'vibes','zen-garden':'vibes','hunter-and-dog':'sports','regatta':'sports','zen-morning':'vibes','carnival-lights':'vibes'}
NEW=list(NEWC)
for n in NEW: meta[n]={'lic':'Original','page':''}
QUEUED=set(l.strip().split('\t')[1] for l in open('queued.txt') if l.strip()) if os.path.exists('queued.txt') else set()
NEW=[n for n in NEW if n not in QUEUED]
missing=[n for n in NEW if not os.path.exists(f'img/{n}.jpg')]
if missing: print('NOT YET SHARPENED, skipped:',missing)
rows=rows+[(NEWC[n],n,'') for n in NEW if n not in missing]
# ADDED: release dates (YYYY-MM-DD) for the 'New scene' chip; the release script fills this in for new puzzles
ADDED={'zen-morning':'2026-10-20','carnival-lights':'2026-10-20','choose-happiness':'2026-10-20','silly-cow':'2026-10-20'}
# PIN: these go to the top of their category (the first two per category are the free ones)
PIN=['monster-ball','haunted-village','zen-garden']
for slug in reversed(PIN):
    r=next((x for x in rows if x[1]==slug),None)
    if r:
        rows.remove(r); first=next(i for i,x in enumerate(rows) if x[0]==r[0]); rows.insert(first,r)
rows.sort(key=lambda r:[c['id'] for c in __import__('json').loads(open('cats.json').read())].index(r[0]) if False else 0)  # stable: keep file order
os.makedirs('out/img',exist_ok=True); os.makedirs('out/thumbs',exist_ok=True)
imgs=[]
for cat,slug,_ in rows:
    m=meta.get(slug) or {'lic':'Original','page':''}; assert m['lic'] in ('Public domain','CC0','Original'),(slug,m['lic'])
    if slug not in D: D[slug]=(slug.replace('-',' ').title(),'Original art','')
    im=Image.open(f'img/{slug}.jpg'); shutil.copy(f'img/{slug}.jpg',f'out/img/{slug}.jpg')
    ImageOps.fit(im,(520,390),Image.LANCZOS).save(f'out/thumbs/{slug}.jpg','JPEG',quality=78,optimize=True,progressive=True)
    t,a,y=D[slug]
    imgs.append(dict(cat=cat,slug=slug,title=t,artist=a,year=y,w=im.width,h=im.height,page=m['page'],isNew=slug in NEW,added=ADDED.get(slug,'')))
h=open('index.html').read().replace('/*IMAGES*/[]',json.dumps(imgs,ensure_ascii=False))
open('out/index.html','w').write(h)
print(len(imgs),'images');os.system('du -sh out/img out/thumbs')

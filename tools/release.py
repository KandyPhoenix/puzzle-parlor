# Move one or more queued puzzles into the live list: python3 release.py slug [slug ...]
import sys
q=[l for l in open('queue.tsv') if l.strip()]; live=open('list.tsv').read().rstrip('\n')+'\n'
keep=[]; moved=[]
for l in q:
    if l.split('\t')[1] in sys.argv[1:]: live+=l; moved.append(l.split('\t')[1])
    else: keep.append(l)
open('queue.tsv','w').write(''.join(keep)); open('list.tsv','w').write(live)
print('released',moved,'| still queued',[l.split('\t')[1] for l in keep])

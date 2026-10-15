# Build tooling and release queue

The app is built from `tools/index.src.html` (the hand-edited source). `build.py` fills in the
image list from `list.tsv` + the original-art entries, writes `out/`, and `mkrepo.py` adds the PWA
head and copies the result to `public/index.html` (bumping the service-worker cache name).

Scripts expect to run from a working folder that has `img/` (full-size pictures) and this
folder's files beside them. The full-size pictures for everything already live are in
`public/img/`; pictures waiting for release are in `queue/img/` and listed in `queue.tsv`.

Release: `python3 release.py <slug> [...]` moves rows from `queue.tsv` into `list.tsv`;
copy the matching `queue/img/*.jpg` into the working `img/`, run `build.py` then `mkrepo.py`,
copy new `out/img` and `out/thumbs` files into `public/`, commit and push.
A queued category that does not exist yet also needs a `CATS` entry and a `--c-<id>` colour
in `index.src.html`.

Model weights for the sharpening step (`sr2/x4plus.pth`, Real-ESRGAN x4plus) are not in the
repo; download from the Real-ESRGAN releases if they are needed again.

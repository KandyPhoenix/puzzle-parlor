# Minimal Real-ESRGAN (RRDBNet) inference on CPU, tiled. Usage: esrgan.py in.jpg out.jpg [target_width]
import sys,math,torch,torch.nn as nn,torch.nn.functional as F,numpy as np
from PIL import Image
class RDB(nn.Module):
    def __init__(s,nf=64,gc=32):
        super().__init__(); s.c1=nn.Conv2d(nf,gc,3,1,1); s.c2=nn.Conv2d(nf+gc,gc,3,1,1); s.c3=nn.Conv2d(nf+2*gc,gc,3,1,1); s.c4=nn.Conv2d(nf+3*gc,gc,3,1,1); s.c5=nn.Conv2d(nf+4*gc,nf,3,1,1); s.l=nn.LeakyReLU(0.2,True)
    def forward(s,x):
        x1=s.l(s.c1(x)); x2=s.l(s.c2(torch.cat((x,x1),1))); x3=s.l(s.c3(torch.cat((x,x1,x2),1))); x4=s.l(s.c4(torch.cat((x,x1,x2,x3),1))); x5=s.c5(torch.cat((x,x1,x2,x3,x4),1)); return x5*0.2+x
class RRDB(nn.Module):
    def __init__(s,nf,gc=32): super().__init__(); s.rdb1=RDB(nf,gc); s.rdb2=RDB(nf,gc); s.rdb3=RDB(nf,gc)
    def forward(s,x): return s.rdb3(s.rdb2(s.rdb1(x)))*0.2+x
class RRDBNet(nn.Module):
    def __init__(s,nf=64,nb=6,gc=32):
        super().__init__(); s.conv_first=nn.Conv2d(3,nf,3,1,1); s.body=nn.Sequential(*[RRDB(nf,gc) for _ in range(nb)]); s.conv_body=nn.Conv2d(nf,nf,3,1,1)
        s.conv_up1=nn.Conv2d(nf,nf,3,1,1); s.conv_up2=nn.Conv2d(nf,nf,3,1,1); s.conv_hr=nn.Conv2d(nf,nf,3,1,1); s.conv_last=nn.Conv2d(nf,3,3,1,1); s.l=nn.LeakyReLU(0.2,True)
    def forward(s,x):
        f=s.conv_first(x); f=s.conv_body(s.body(f))+f
        f=s.l(s.conv_up1(F.interpolate(f,scale_factor=2,mode='nearest'))); f=s.l(s.conv_up2(F.interpolate(f,scale_factor=2,mode='nearest')))
        return s.conv_last(s.l(s.conv_hr(f)))
# rename keys from the official checkpoint (RDB convs are named conv1..conv5, lrelu)
def load(path,nb=6):
    sd=torch.load(path,map_location='cpu'); sd=sd.get('params_ema',sd.get('params',sd)); out={}
    for k,v in sd.items():
        k2=k
        for i in range(1,6): k2=k2.replace(f'.conv{i}.',f'.c{i}.')
        out[k2]=v
    m=RRDBNet(nb=nb); m.load_state_dict(out,strict=True); m.eval(); return m
def upscale(m,im,tile=320,pad=12):
    x=torch.from_numpy(np.array(im).astype(np.float32)/255).permute(2,0,1).unsqueeze(0)
    _,_,H,W=x.shape; out=torch.zeros(1,3,H*4,W*4)
    with torch.no_grad():
        for y in range(0,H,tile):
            for xx in range(0,W,tile):
                y0,y1=max(0,y-pad),min(H,y+tile+pad); x0,x1=max(0,xx-pad),min(W,xx+tile+pad)
                o=m(x[:,:,y0:y1,x0:x1])
                oy=(y-y0)*4; ox=(xx-x0)*4; h=min(tile,H-y)*4; w=min(tile,W-xx)*4
                out[:,:,y*4:y*4+h,xx*4:xx*4+w]=o[:,:,oy:oy+h,ox:ox+w]
    arr=(out.squeeze(0).permute(1,2,0).clamp(0,1).numpy()*255).round().astype(np.uint8); return Image.fromarray(arr)
if __name__=='__main__':
    torch.set_num_threads(max(1,torch.get_num_threads()))
    model=sys.argv[4] if len(sys.argv)>4 else 'sr2/anime6B.pth'; nb=23 if 'x4plus.pth' in model else 6
    m=load(model,nb); im=Image.open(sys.argv[1]).convert('RGB'); up=upscale(m,im)
    tw=int(sys.argv[3]) if len(sys.argv)>3 else up.width
    if tw<up.width: up=up.resize((tw,round(up.height*tw/up.width)),Image.LANCZOS)
    up.save(sys.argv[2],'JPEG',quality=88,optimize=True,progressive=True); print('saved',up.size)

"""把遊戲素材整理成宣傳片用的高解析版本（build/img）。"""
import os
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build", "img")
os.makedirs(OUT, exist_ok=True)

SCENES = """rain-street memory-bookshop-door counter jinglan memory-school memory-platform memory-office
memory-grandstage memory-old-oven memory-last-bus memory-lighthouse bookshop-lincheng memory
memory-hidden-room memory-train memory-banquet memory-hospital memory-summer-visit memory-child-bookshop
memory-child-home memory-white-room-v2 moon-sea memory-backstage memory-post-office""".split()
for name in SCENES:
    im = Image.open(f"{ROOT}/public/images/{name}.webp").convert("RGB")
    im = im.resize((2560, 1440), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))
    im.save(f"{OUT}/{name}.jpg", quality=94)

for name in "jinglan boyan ruoyin yenuan yuhang haiming owner lincheng-child".split():
    Image.open(f"{ROOT}/public/images/characters/{name}.webp").save(f"{OUT}/char-{name}.png")

for name in "tea-infusion dialogue letter".split():
    im = Image.open(f"{ROOT}/output/{name}-desktop.png").convert("RGB")
    im.crop((0, 0, 1440, 900)).save(f"{OUT}/ui-{name}.jpg", quality=95)
print("ok")

"""夜行書店 宣傳片配樂：從零合成鋼琴、弦樂墊音、八音盒與低頻打擊，再與遊戲音效混音。

72 BPM，4/4，一小節 = 10/3 秒；畫面剪接點全部對齊小節（見 timeline.js 的 BAR）。
輸出 build/score.wav（48 kHz / 24-bit 立體聲）。
"""

import os
import wave
import numpy as np

SR = 48000
BPM = 72
BEAT = 60 / BPM
BAR = BEAT * 4
LENGTH = 80.0
N = int(SR * LENGTH)
HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
rng = np.random.default_rng(7)


def t_of(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, start_s, sig, gain=1.0, pan=0.0):
    i = int(start_s * SR)
    if i >= buf.shape[1]:
        return
    if i < 0:
        sig = sig[..., -i:]
        i = 0
    n = min(sig.shape[-1], buf.shape[1] - i)
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    if sig.ndim == 1:
        buf[0, i:i + n] += sig[:n] * gain * l * 1.414
        buf[1, i:i + n] += sig[:n] * gain * r * 1.414
    else:
        buf[0, i:i + n] += sig[0, :n] * gain
        buf[1, i:i + n] += sig[1, :n] * gain


# ---------- 音色 ----------

def piano(m, vel=0.5, dur=6.0, ring=None):
    """加法合成鋼琴：非諧和泛音、雙弦微失諧、兩段式衰減、擊槌噪音。"""
    f = midi_hz(m)
    ring = ring if ring is not None else min(9.0, 3.0 + 5.0 * (261.6 / f) ** 0.5)
    L = int(SR * (dur + 0.4))
    t = np.arange(L) / SR
    out = np.zeros(L)
    B = 0.00035 * (f / 261.6) ** 0.6
    bright = 0.42 - 0.3 * vel
    for n in range(1, 24):
        fn = f * n * np.sqrt(1 + B * n * n)
        if fn > 16000:
            break
        amp = (1 / n ** 1.15) * np.exp(-(n - 1) * bright)
        tau = ring / (1 + 0.45 * (n - 1))
        env = 0.62 * np.exp(-t / (tau * 0.18)) + 0.38 * np.exp(-t / tau)
        for det in (-0.7, 0.7):
            fd = fn * 2 ** (det / 1200)
            out += amp * 0.5 * env * np.sin(2 * np.pi * fd * t + rng.uniform(0, 6.28))
    atk = np.minimum(1, t / 0.004)
    out *= atk
    # 擊槌
    hn = int(SR * 0.03)
    ham = rng.standard_normal(hn) * np.exp(-np.arange(hn) / (SR * 0.006))
    ham = np.convolve(ham, np.ones(6) / 6, "same")
    out[:hn] += ham * 0.05 * vel
    # 鬆鍵（制音）
    rel_i = int(SR * dur)
    if rel_i < L:
        out[rel_i:] *= np.exp(-np.arange(L - rel_i) / (SR * 0.12))
    return out * vel * 0.9


def musicbox(m, vel=0.5):
    f = midi_hz(m)
    L = int(SR * 3.2)
    t = np.arange(L) / SR
    out = np.zeros(L)
    for ratio, amp, tau in ((1, 1, 1.4), (2.0, 0.25, 0.6), (5.4, 0.18, 0.18), (8.9, 0.08, 0.08)):
        out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * f * ratio * t)
    out *= np.minimum(1, t / 0.002)
    return out * vel * 0.5


def pad(notes, dur, vel=0.4, attack=1.6, release=2.4, bright=5.0):
    """弦樂墊音：每個音三個失諧聲部、柔和泛音、慢顫音。"""
    L = int(SR * (dur + release))
    t = np.arange(L) / SR
    out = np.zeros((2, L))
    for k, m in enumerate(notes):
        f = midi_hz(m)
        for v, det in enumerate((-8, 0, 8)):
            vib = 1 + 0.0025 * np.sin(2 * np.pi * (4.6 + 0.37 * v + 0.11 * k) * t + v)
            sig = np.zeros(L)
            for n in range(1, 10):
                fn = f * n * 2 ** (det / 1200)
                if fn > 9000:
                    break
                ph = 2 * np.pi * fn * np.cumsum(vib) / SR
                sig += np.exp(-(n - 1) / bright) / n * np.sin(ph + rng.uniform(0, 6.28))
            p = (v - 1) * 0.5
            out[0] += sig * np.cos((p + 1) * np.pi / 4)
            out[1] += sig * np.sin((p + 1) * np.pi / 4)
    env = np.minimum(1, t / attack) * np.where(t > dur, np.exp(-(t - dur) / (release / 3)), 1)
    swell = 0.85 + 0.15 * np.sin(2 * np.pi * t / (dur * 2) - np.pi / 2)
    return out * env * swell * vel * 0.06


def boom(vel=1.0, f0=58, f1=32, length=4.0):
    L = int(SR * length)
    t = np.arange(L) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.25)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 1.1)
    noise = rng.standard_normal(L) * np.exp(-t / 0.05)
    noise = np.convolve(noise, np.ones(40) / 40, "same")
    sig = body + noise * 0.6
    return np.tanh(sig * 1.4) * vel


def riser(length):
    L = int(SR * length)
    t = np.arange(L) / SR
    x = t / length
    noise = rng.standard_normal((2, L))
    # 越接近終點越亮：以移動平均窗長控制高頻
    lo = np.stack([np.convolve(noise[c], np.ones(64) / 64, "same") for c in range(2)])
    hi = noise - np.stack([np.convolve(noise[c], np.ones(8) / 8, "same") for c in range(2)])
    sig = lo * (1 - x) + (lo * 0.4 + hi * 0.6) * x
    return sig * (x ** 2.4) * 0.5


def sub_drone(m, dur):
    L = int(SR * dur)
    t = np.arange(L) / SR
    f = midi_hz(m)
    sig = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t + 1)
    env = np.minimum(1, t / 3) * np.minimum(1, (dur - t) / 3)
    return sig * env * 0.18


def reverb_ir(seconds=4.2, predelay=0.02):
    L = int(SR * seconds)
    t = np.arange(L) / SR
    ir = np.zeros((2, L))
    for c in range(2):
        n = rng.standard_normal(L)
        # 高頻衰減更快：將平滑版本與原噪音按時間交叉
        smooth = np.convolve(n, np.ones(12) / 12, "same")
        mix = np.exp(-t / 0.6)
        ir[c] = (n * mix + smooth * (1 - mix) * 2.2) * np.exp(-t * 6.9 / seconds)
    pd = int(SR * predelay)
    ir = np.concatenate([np.zeros((2, pd)), ir], axis=1)
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


def convolve(sig, ir):
    n = sig.shape[1] + ir.shape[1]
    size = 1 << (n - 1).bit_length()
    out = np.zeros((2, sig.shape[1]))
    for c in range(2):
        S = np.fft.rfft(sig[c], size)
        I = np.fft.rfft(ir[c], size)
        out[c] = np.fft.irfft(S * I, size)[: sig.shape[1]]
    return out


def eq_fft(sig, fn):
    size = 1 << (sig.shape[1] - 1).bit_length()
    freqs = np.fft.rfftfreq(size, 1 / SR)
    resp = fn(np.maximum(freqs, 1e-3))
    return np.stack([np.fft.irfft(np.fft.rfft(sig[c], size) * resp, size)[: sig.shape[1]] for c in range(2)])


def highpass(sig, fc, order=2):
    return eq_fft(sig, lambda f: 1 / np.sqrt(1 + (fc / f) ** (2 * order)))


def low_shelf(sig, fc, db):
    g = 10 ** (db / 20)
    return eq_fft(sig, lambda f: g + (1 - g) / np.sqrt(1 + (fc / f) ** 4))


def lowpass_fft(sig, cutoff):
    size = 1 << (sig.shape[1] - 1).bit_length()
    freqs = np.fft.rfftfreq(size, 1 / SR)
    resp = 1 / np.sqrt(1 + (freqs / cutoff) ** 4)
    return np.stack([np.fft.irfft(np.fft.rfft(sig[c], size) * resp, size)[: sig.shape[1]] for c in range(2)])


def read_wav(name):
    with wave.open(os.path.join(BUILD, name)) as w:
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        return data.reshape(-1, w.getnchannels()).T


def automation(points):
    """points: [(秒, 增益)]，線性內插成整條包絡。"""
    xs, ys = zip(*points)
    return np.interp(np.arange(N) / SR, xs, ys)


# ---------- 編曲 ----------

CH = {
    "Dm9": ([38, 50], [50, 57, 60, 64, 65]),
    "Bb": ([34, 46], [46, 53, 57, 62, 65]),
    "F/A": ([33, 45], [45, 53, 57, 60, 65, 69]),
    "C": ([36, 48], [48, 55, 60, 62, 67]),
    "Gm7": ([31, 43], [43, 50, 53, 58, 62]),
    "Asus": ([33, 45], [45, 52, 57, 62, 64]),
    "A": ([33, 45], [45, 52, 57, 61, 64]),
}

# 每小節和弦（24 小節 = 80 秒）
PROG = [
    None, None,                      # 0-1 雨夜
    "Dm9", "Bb", "F/A", "C",         # 2-5 書店現身
    "Dm9", "Bb", "F/A", "C", "Gm7", "Asus",  # 6-11 六位訪客
    "Bb", "C",                       # 12-13 玩法
    "Dm9", "Bb",                     # 14-15 轉折（極簡）
    "Bb", "F/A", "Gm7", "Asus",      # 16-19 高潮
    "Dm9",                           # 20 片名
    "Bb", "F/A", "Dm9",              # 21-23 尾聲
]

# 主旋律動機（拍, MIDI, 時值拍）
MOTIF = {
    "Dm9": [(0, 69, 1), (1, 74, 0.5), (1.5, 76, 0.5), (2, 77, 2)],
    "Bb": [(0, 74, 2), (2, 72, 1), (3, 69, 1)],
    "F/A": [(0, 72, 1), (1, 77, 0.5), (1.5, 79, 0.5), (2, 81, 2)],
    "C": [(0, 79, 2), (2, 76, 1.5), (3.5, 74, 0.5)],
    "Gm7": [(0, 74, 1), (1, 77, 0.5), (1.5, 79, 0.5), (2, 82, 2)],
    "Asus": [(0, 81, 2), (2, 79, 1), (3, 76, 1)],
}

ARP = [0, 1, 2, 3, 4, 3, 2, 1]  # 左手分解和弦的音序索引


def build():
    dry = np.zeros((2, N))
    piano_bus = np.zeros((2, N))
    pad_bus = np.zeros((2, N))
    perc = np.zeros((2, N))

    def P(bar, beat, m, vel, dur=4.0, pan=0.0):
        add(piano_bus, t_of(bar, beat), piano(m, vel, dur), 1.0, pan + (m - 64) / 90)

    # 0-1 小節：低音零星落下
    P(0, 0.6, 50, 0.32, 8)
    P(0, 2.6, 57, 0.22, 8)
    P(1, 1.0, 62, 0.2, 8)
    P(1, 3.0, 45, 0.28, 6)
    add(dry, 0.0, sub_drone(50, 22.0), 0.35)

    for bar, name in enumerate(PROG):
        if name is None:
            continue
        bass, voicing = CH[name]
        quiet = bar in (14, 15)
        climax = 16 <= bar <= 19
        if not quiet:
            # 左手低音
            P(bar, 0, bass[0], 0.3 if climax else 0.22, 6)
            P(bar, 0, bass[1], 0.32, 6)
        # 墊音
        if bar >= 4 and not quiet:
            v = 0.55 if bar < 16 else 0.95 if climax else 0.7
            if bar == 20:
                v = 1.0
            if bar >= 21:
                v = 0.55 - 0.12 * (bar - 21)
            add(pad_bus, t_of(bar), pad(voicing, BAR + 0.3, v, attack=1.2 if bar != 20 else 0.05))
        # 左手分解和弦
        if 6 <= bar <= 13 or climax:
            step = 0.5 if not climax else 0.25
            k = 0
            beat = 0.0
            while beat < 4 - 1e-6:
                m = voicing[ARP[k % len(ARP)] % len(voicing)]
                vel = (0.2 if not climax else 0.26) + (0.06 if k % 4 == 0 else 0)
                P(bar, beat, m, vel, 1.6)
                k += 1
                beat += step
        # 旋律
        if name in MOTIF and (2 <= bar <= 13 or climax or bar >= 21):
            for beat, m, d in MOTIF[name]:
                if bar >= 21 and beat not in (0, 2):
                    continue
                vel = 0.4 if bar < 6 else 0.48
                if climax:
                    vel = 0.62
                    P(bar, beat, m - 12, 0.4, d * BEAT + 1)
                if bar >= 21:
                    vel = 0.34 - 0.05 * (bar - 21)
                P(bar, beat, m + (12 if 8 <= bar <= 11 and beat >= 2 else 0), vel, d * BEAT + 1.2, 0.1)

    # 14-15 小節：八音盒的四個音
    for i, (beat, m) in enumerate([(0, 81), (1, 86), (2, 88), (3.5, 89)]):
        add(dry, t_of(14, beat), musicbox(m, 0.55), 1.0, 0.25)
    for i, (beat, m) in enumerate([(0, 81), (1, 86), (2, 88)]):
        add(dry, t_of(15, beat), musicbox(m, 0.4), 1.0, -0.25)
    P(14, 0, 50, 0.22, 10)
    P(15, 2, 86, 0.22, 6)
    add(dry, t_of(14), sub_drone(50, BAR * 2.2), 0.35)

    # 打擊：訪客段每兩小節、高潮每小節
    for bar in range(6, 14, 2):
        add(perc, t_of(bar), boom(0.35, 52, 34, 2.5))
    for bar in range(16, 20):
        add(perc, t_of(bar), boom(0.55 + 0.08 * (bar - 16)))
        add(perc, t_of(bar, 2.5), boom(0.25, 60, 40, 1.5))
    # 片名前的上升與片名重擊
    add(perc, t_of(19), riser(BAR - 0.25), 0.9)
    add(perc, t_of(20), boom(1.0, 62, 30, 6.0), 1.2)
    P(20, 0, 38, 0.6, 8)
    P(20, 0, 50, 0.7, 8)
    P(20, 0, 62, 0.55, 8)
    P(20, 0, 69, 0.45, 8)
    P(20, 0, 74, 0.45, 8)
    P(23, 2, 62, 0.25, 10)
    P(23, 2, 50, 0.2, 10)

    # 高潮最後半拍淨空，讓片名重擊更響
    gap = automation([(0, 1), (t_of(20) - 0.32, 1), (t_of(20) - 0.3, 0.0), (t_of(20) - 0.005, 0.0), (t_of(20), 1), (LENGTH, 1)])
    piano_bus *= gap
    pad_bus *= automation([(0, 1), (t_of(20) - 0.6, 1), (t_of(20) - 0.3, 0.0), (t_of(20), 1), (LENGTH, 1)])

    pad_bus = lowpass_fft(pad_bus, 3200)
    music = piano_bus * 0.9 + pad_bus + dry + perc * 0.55
    ir = reverb_ir()
    wet = highpass(convolve(music, ir), 220)
    music = low_shelf(music, 140, -7) + perc * 0.25
    music = music * 0.62 + wet * 0.55

    # ---------- 音效與環境 ----------
    amb = np.zeros((2, N))
    rain = read_wav("sfx_rain-window.wav")
    xf = int(SR * 2)
    seg = rain.shape[1]
    pos = 0
    while pos < N:
        piece = rain.copy()
        fade = np.ones(seg)
        fade[:xf] = np.linspace(0, 1, xf)
        fade[-xf:] = np.linspace(1, 0, xf)
        add(amb, pos / SR, piece * fade)
        pos += seg - xf
    amb *= automation([
        (0, 0.0), (1.2, 1.1), (7, 1.0), (12, 0.55), (20, 0.4), (40, 0.35), (46.7, 0.6), (53.3, 0.3),
        (60, 0.1), (66.6, 0.0), (68, 0.0), (72, 0.45), (80, 0.25),
    ])
    room = read_wav("sfx_bookshop-room.wav")
    for k in range(5):
        add(amb, 9.0 + k * 15, room, 0.35)

    def sfx(name, at, gain, pan=0.0):
        s = read_wav(name)
        add(amb, at, s * gain)

    sfx("sfx_door-bell.wav", 7.05, 0.55)
    sfx("sfx_paper.wav", 15.2, 0.6)
    sfx("sfx_paper.wav", 18.4, 0.4)
    sfx("sfx_porcelain.wav", 40.3, 0.5)
    sfx("sfx_tea-pour.wav", 41.0, 0.55)
    sfx("sfx_tea-chime.wav", 43.4, 0.35)
    sfx("sfx_paper.wav", 44.9, 0.6)
    sfx("sfx_door-bell.wav", 77.0, 0.35)
    amb = highpass(amb, 120)
    amb_wet = highpass(convolve(amb * 0.25, ir), 300)

    mix = music + amb * 0.5 + amb_wet * 0.25
    mix = highpass(mix, 32, 3)
    # 頭尾淡入淡出
    mix *= automation([(0, 0), (0.4, 1), (LENGTH - 3.5, 1), (LENGTH, 0)])
    # 輕柔母帶：軟限幅並把峰值放到 -1 dBFS
    peak = np.max(np.abs(mix))
    mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25) * 10 ** (-1 / 20)

    os.makedirs(BUILD, exist_ok=True)
    pcm = (np.clip(mix.T, -1, 1) * 8388607).astype(np.int32)
    raw = np.zeros((pcm.shape[0], 2, 3), dtype=np.uint8)
    for b in range(3):
        raw[:, :, b] = (pcm >> (8 * b)) & 0xFF
    with wave.open(os.path.join(BUILD, "score.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(raw.tobytes())
    print("score.wav", LENGTH, "s")


if __name__ == "__main__":
    build()

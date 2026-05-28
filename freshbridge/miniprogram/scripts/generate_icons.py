"""Generate tab bar icons as simple 88x88 PNG files."""
import struct, zlib, os, math

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'static', 'images')

def create_png(width, height, pixels):
    """Create a PNG file from RGBA pixel data. pixels is a list of (r,g,b,a) tuples, row by row."""
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter none
        for x in range(width):
            raw += bytes(pixels[y * width + x])

    return (b'\x89PNG\r\n\x1a\n' +
            chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress(raw)) +
            chunk(b'IEND', b''))

def fill_rect(px, w, cx, cy, rw, rh, color):
    """Fill a rectangle centered at (cx, cy) with size rw x rh."""
    left = max(0, cx - rw // 2)
    right = min(w, cx + rw // 2)
    top = max(0, cy - rh // 2)
    bottom = min(w, cy + rh // 2)
    for y in range(top, bottom):
        for x in range(left, right):
            px[y * w + x] = color

def fill_circle(px, w, cx, cy, r, color):
    """Fill a circle centered at (cx, cy) with radius r."""
    for y in range(max(0, cy - r), min(w, cy + r + 1)):
        for x in range(max(0, cx - r), min(w, cx + r + 1)):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2:
                px[y * w + x] = color

def draw_line(px, w, x1, y1, x2, y2, color, thickness=3):
    """Draw a thick line."""
    for t in range(-thickness//2, thickness//2 + 1):
        for i in range(max(abs(x2-x1), abs(y2-y1)) + 1):
            frac = i / max(abs(x2-x1), abs(y2-y1), 1)
            x = int(x1 + (x2 - x1) * frac) + (t if abs(y2-y1) > abs(x2-x1) else 0)
            y = int(y1 + (y2 - y1) * frac) + (t if abs(x2-x1) > abs(y2-y1) else 0)
            if 0 <= x < w and 0 <= y < w:
                px[y * w + x] = color

# Canvas: 88x88
S = 88

def make_icon(draw_fn, color):
    px = [(0,0,0,0)] * (S * S)
    draw_fn(px, S, color)
    return create_png(S, S, px)

C = 44  # center

def home(px, w, col):
    # House shape
    draw_line(px, w, 12, 64, C, 14, col, 5)  # left roof
    draw_line(px, w, C, 14, 76, 64, col, 5)  # right roof
    fill_rect(px, w, C, 56, 48, 35, col)     # body
    # Door
    fill_rect(px, w, C, 58, 16, 22, (255,255,255,255))

def supply(px, w, col):
    # Box with lid
    fill_rect(px, w, C, 52, 44, 28, col)     # box body
    fill_rect(px, w, C, 32, 50, 12, col)     # lid
    # Lines on box
    draw_line(px, w, C, 40, C, 66, (255,255,255,255), 3)
    draw_line(px, w, 28, 52, 60, 52, (255,255,255,255), 3)

def publish(px, w, col):
    # Filled circle with plus
    fill_circle(px, w, C, C, 34, col)
    # Plus sign
    fill_rect(px, w, C, C, 24, 8, (255,255,255,255))
    fill_rect(px, w, C, C, 8, 24, (255,255,255,255))

def message(px, w, col):
    # Bell shape or speech bubble
    # Speech bubble
    fill_circle(px, w, C, 36, 22, col)
    # Pointy bit
    fill_rect(px, w, C, 64, 12, 16, col)
    # Inner highlight
    fill_rect(px, w, C, 33, 20, 4, (255,255,255,255))

def mine(px, w, col):
    # Person
    fill_circle(px, w, C, 26, 16, col)       # head
    fill_circle(px, w, C, 66, 28, col)       # body (bigger circle)
    # Overlap with background to create neck
    fill_rect(px, w, C, 40, 32, 24, (0,0,0,0))

active_col = (21, 128, 61, 255)     # #15803D
inactive_col = (153, 153, 153, 255) # #999999

icons = {
    'home.png': (home, active_col),
    'home-active.png': (home, active_col),
    'supply.png': (supply, inactive_col),
    'supply-active.png': (supply, active_col),
    'publish.png': (publish, active_col),
    'publish-active.png': (publish, active_col),
    'message.png': (message, inactive_col),
    'message-active.png': (message, active_col),
    'mine.png': (mine, inactive_col),
    'mine-active.png': (mine, active_col),
}

os.makedirs(OUT, exist_ok=True)
for name, (fn, col) in icons.items():
    path = os.path.join(OUT, name)
    with open(path, 'wb') as f:
        f.write(make_icon(fn, col))
    print(f'  Created {name} ({os.path.getsize(path)} bytes)')

print(f'\nDone! {len(icons)} icons generated in {OUT}')

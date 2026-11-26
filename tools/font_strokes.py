#!/usr/bin/env python3
"""Turns the school font (Slabikář, rendered by tools/font_render.js) into strokes in writing order.
Thin the ink to its centre line, make a graph of it, then walk it the way the pen goes:
start where the letter starts (school rules), at every crossing go on as straight as possible, a line that ends in a dead end
is retraced (d, t), crossbars and the second line of x, dots, accents and háčky are written after the word.
Output: app/src/main/assets/www/write_font.js  (window.FONT_STROKES[text] = [[ [x, y], ... ], ...], units: x-height = 1, Y1 = 0, y down)
Run: node tools/font_render.js && python3 tools/font_strokes.py
"""
import json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, 'font_out')
WWW = os.path.join(HERE, '..', 'app', 'src', 'main', 'assets', 'www')

# ---------- thinning (Zhang–Suen) ----------
def thin(img):
    img = img.copy().astype(np.uint8)
    while True:
        changed = False
        for step in (0, 1):
            P = np.pad(img, 1)
            p2, p3, p4, p5 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:], P[2:, 2:]
            p6, p7, p8, p9 = P[2:, 1:-1], P[2:, :-2], P[1:-1, :-2], P[:-2, :-2]
            nb = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(n.astype(int) for n in nb)
            A = sum(((nb[i] == 0) & (nb[(i + 1) % 8] == 1)).astype(int) for i in range(8))
            if step == 0: c = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else: c = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            m = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c
            if m.any(): img[m] = 0; changed = True
        if not changed: return img

N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

def neighbours(S, p):
    y, x = p
    return [(y + dy, x + dx) for dy, dx in N8 if (y + dy, x + dx) in S]

# ---------- graph: nodes = ends and crossings, edges = pixel chains ----------
def graph(S):
    nb = {p: neighbours(S, p) for p in S}
    isnode = {p for p in S if len(nb[p]) != 2}
    # touching crossing pixels form one node
    node_of, nodes = {}, []
    for p in isnode:
        if p in node_of: continue
        k = len(nodes); stack = [p]; grp = []; node_of[p] = k
        while stack:
            q = stack.pop(); grp.append(q)
            for r in nb[q]:
                if r in isnode and r not in node_of and len(nb[r]) >= 3 and len(nb[q]) >= 3: node_of[r] = k; stack.append(r)
        nodes.append(grp)
    edges, done, used = [], set(), set()
    for p in isnode:
        for m in nb[p]:
            if (p, m) in done: continue
            if m in isnode and node_of[m] == node_of[p]: continue
            chain = [p, m]; prev, cur = p, m
            while cur not in isnode:
                nxt = [r for r in nb[cur] if r != prev]
                if not nxt: break
                prev, cur = cur, nxt[0]; chain.append(cur)
            done.add((p, m)); done.add((chain[-1], chain[-2]))
            used.update(chain)
            edges.append({'a': node_of[p], 'b': node_of.get(chain[-1], node_of[p]), 'pts': chain})
    # loops without any node (a ring): cut at the top pixel
    rest = S - used - isnode
    while rest:
        p = min(rest); k = len(nodes); nodes.append([p])
        loop = [p]; prev, cur = None, p
        while True:
            nxt = [r for r in nb[cur] if r != prev and r in rest]
            if not nxt: break
            prev, cur = cur, nxt[0]
            if cur == p or cur in loop: break
            loop.append(cur)
        edges.append({'a': k, 'b': k, 'pts': loop + [p]})
        rest -= set(loop)
    return nodes, edges

def length(pts): return sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))
def direction(pts, k=10):
    a, b = pts[0], pts[min(len(pts) - 1, k)]
    d = (b[1] - a[1], b[0] - a[0]); n = math.hypot(*d) or 1
    return (d[0] / n, d[1] / n)                      # (dx, dy)

def prune(nodes, edges, spur):
    # remove short whiskers from ends (thinning artefacts), repeat until stable
    while True:
        deg = {}
        for e in edges:
            deg[e['a']] = deg.get(e['a'], 0) + 1; deg[e['b']] = deg.get(e['b'], 0) + 1
        cut = [e for e in edges if e['a'] != e['b'] and ((deg[e['a']] == 1 and deg[e['b']] >= 3) or (deg[e['b']] == 1 and deg[e['a']] >= 3)) and length(e['pts']) < spur]
        if not cut: return edges
        edges = [e for e in edges if e not in cut]

def area(pts):
    return abs(sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1] for i in range(len(pts) - 1))) / 2

def contract(edges, small):
    # a crossing that thinned into several tiny bits: make it one node again
    while True:
        deg = {}
        for e in edges:
            deg[e['a']] = deg.get(e['a'], 0) + 1; deg[e['b']] = deg.get(e['b'], 0) + 1
        # a tiny ring at a crossing is a thinning artefact; a real small loop (top of r, v, w, b) encloses some area
        loops = [e for e in edges if e['a'] == e['b'] and length(e['pts']) < small * 2.5 and deg[e['a']] > 2 and area(e['pts']) < (small * .45) ** 2]
        if loops: edges = [e for e in edges if e not in loops]; continue
        tiny = next((e for e in edges if e['a'] != e['b'] and length(e['pts']) < small and deg[e['a']] >= 2 and deg[e['b']] >= 2), None)
        if tiny is None: return edges
        a, b = tiny['a'], tiny['b']
        out = []
        for e in edges:
            if e is tiny: continue
            e = dict(e)
            if e['a'] == b: e['a'] = a; e['pts'] = tiny['pts'][:1] + e['pts']
            if e['b'] == b: e['b'] = a; e['pts'] = e['pts'] + tiny['pts'][:1]
            out.append(e)
        edges = out

def merge_twos(edges):
    # a node with exactly two edges is not a real crossing: join the two edges
    while True:
        deg = {}
        for i, e in enumerate(edges):
            deg.setdefault(e['a'], []).append(i); deg.setdefault(e['b'], []).append(i)
        k = next((n for n, l in deg.items() if len(l) == 2 and l[0] != l[1]), None)
        if k is None: return edges
        i, j = deg[k]
        e, f = edges[i], edges[j]
        p = e['pts'] if e['b'] == k else e['pts'][::-1]
        q = f['pts'] if f['a'] == k else f['pts'][::-1]
        a = e['a'] if e['b'] == k else e['b']; b = f['b'] if f['a'] == k else f['a']
        new = {'a': a, 'b': b, 'pts': p + q[1:]}
        edges = [x for t, x in enumerate(edges) if t not in (i, j)] + [new]

# ---------- where the pen starts (school rules / the poster) ----------
OVAL = set('acdgoqáčďó')
# capitals: (x, y) in the letter box, 0..1 from the left / from the top; 'ccw' = starts on a closed curve going left
# capitals (the poster): where in the letter box the pen starts (x, y: 0..1 from left / top) and which way it goes first
U, D, Lf, R = (0, -1), (0, 1), (-1, 0), (1, 0)
CAP_START = {'A': (0, 1, U), 'B': (.45, 0, D), 'C': (1, .15, Lf), 'Č': (1, .15, Lf), 'D': (.5, 0, D), 'Ď': (.5, 0, D), 'E': (1, .1, Lf),
    'F': (0, .1, R), 'G': (1, .1, Lf), 'H': (0, .1, R), 'I': (.3, .05, R), 'J': (.3, .05, R), 'K': (0, .1, R), 'L': (.9, .1, Lf),
    'M': (0, .15, U), 'N': (0, .15, U), 'Ň': (0, .15, U), 'O': (.6, 0, Lf), 'P': (.35, 0, D), 'Q': (.6, 0, Lf), 'R': (.35, 0, D), 'Ř': (.35, 0, D),
    'S': (0, .85, D), 'Š': (0, .85, D), 'T': (0, .1, R), 'Ť': (0, .1, R), 'U': (0, .15, R), 'V': (0, .15, R), 'W': (0, .15, R),
    'X': (0, .1, R), 'Y': (0, .15, R), 'Z': (0, .1, R), 'Ž': (0, .1, R)}
for k, v in list(CAP_START.items()): CAP_START[{'A': 'Á', 'E': 'É', 'U': 'Ú', 'I': 'Í', 'O': 'Ó', 'Y': 'Ý'}.get(k, k)] = v

# capitals whose pen way needs the school order spelled out (from the parent's norm): the pen passes these points in order
# (x, y in the letter box 0..1, the first one is the start); '|' = lift the pen; bridge = the line ends close to another one and goes on there
WAY = {
    'A': [(.62, 0), (.05, .8), (.45, .97), (.62, .05), (1, .5)],                    # big a: oval CCW from the top, back up, stem down
    'B': [(.45, 0), (.02, .85), (.35, .55), (.98, .2), (.56, .46), (.98, .75), (.5, .97)],                 # stem down, loop, up, upper bowl, lower bowl
    'D': [(.72, 0), (0, .97), (.98, .45), (.3, .2)],                                # stem down, loop, big arc up, curl in
    'F': [(0, .12), (1, .02), '|', (.5, .03), (.4, .6), (0, .95), '|', (.2, .55), (.95, .5)],   # wave | stem | crossbar
    'K': [(0, .15), (.35, 0), (0, .92), '|', (1, .12), (.45, .45), (1, .5)],
    'L': [(.1, .05), (.4, .25), (.95, .05), (.4, .3), (0, .97), (1, .5)],
    'S': [(.15, .05), (.95, .1), (.4, .5), (0, .8)],
    'T': [(0, .12), (1, .02), '|', (.5, .03), (.4, .6), (0, .9)],                             # wave | stem
    'Q': [(.55, .11), (.03, .98), (.46, .56), (.19, 1.45), '|', (.33, .95), (1, .55)],  # oval + stem to Y0 | line across
    'Ch': [(.33, .2), (.07, .97), (.69, .1), (.45, .98), (.76, .5), (1, .55)],      # C on into h, one stroke
    'X': [(0, .15), (.45, .48), (1, .5), '|', (1, .12), (.45, .48), (0, .85)],
}
for k, v in [('Á', 'A'), ('Ď', 'D'), ('Š', 'S'), ('Ť', 'T')]: WAY[k] = WAY[v]
BRIDGE = set('AÁ')

def solve(item):
    t = item['t']
    img = np.array(Image.open(os.path.join(OUT_DIR, item['file'])).convert('L')) < 235
    # thicken a little: the font's sharp turns are so thin that they would break apart
    for _ in range(3):
        P = np.pad(img, 1); img = P[1:-1, 1:-1] | P[:-2, 1:-1] | P[2:, 1:-1] | P[1:-1, :-2] | P[1:-1, 2:]
    sk = thin(img)
    S = set(map(tuple, np.argwhere(sk == 1)))
    xh, base = item['xh'], item['base']
    nodes, edges = graph(S)
    lonely = [q for q in S if not any(q in e['pts'] for e in edges)] if len(S) < 200000 else []
    edges = contract(edges, xh * .14)
    edges = prune(nodes, edges, xh * .2)
    edges = merge_twos(edges)
    if not edges: return []
    # connected components of edges
    comp = list(range(len(nodes)))
    def find(a):
        while comp[a] != a: comp[a] = comp[comp[a]]; a = comp[a]
        return a
    for e in edges: comp[find(e['a'])] = find(e['b'])
    groups = {}
    for i, e in enumerate(edges): groups.setdefault(find(e['a']), []).append(i)
    allpts = [q for e in edges for q in e['pts']]
    ymin = min(q[0] for q in allpts)
    def bbox(ids):
        ps = [q for i in ids for q in edges[i]['pts']]
        return min(q[1] for q in ps), min(q[0] for q in ps), max(q[1] for q in ps), max(q[0] for q in ps)
    # marks = small things above the letters (dots, čárky, háčky, kroužky)
    comps = []
    for g, ids in groups.items():
        x0, y0, x1, y1 = bbox(ids)
        small = max(x1 - x0, y1 - y0) < xh * .75
        above = y1 < base - xh * 1.08
        comps.append({'ids': ids, 'box': (x0, y0, x1, y1), 'mark': small and above})
    def clen(c): return sum(length(edges[i]['pts']) for i in c['ids'])
    comps = [c for c in comps if clen(c) > xh * (.05 if c['mark'] else .35)]
    mains = sorted([c for c in comps if not c['mark']], key=lambda c: c['box'][0])
    marks = sorted([c for c in comps if c['mark']], key=lambda c: c['box'][0])
    first = t[0]
    strokes, later = [], []
    # crossbars: at a crossing with 4 lines, the straight pair whose both other ends are free ends and which is short
    deg = {}
    for i, e in enumerate(edges):
        deg.setdefault(e['a'], []).append(i)
        if e['b'] != e['a']: deg.setdefault(e['b'], []).append(i)
    deferred = set()
    for n, ids in deg.items():
        if len(ids) != 4 or first in WAY: continue
        outs = []
        for i in ids:
            e = edges[i]; pts = e['pts'] if e['a'] == n else e['pts'][::-1]
            other = e['b'] if e['a'] == n else e['a']
            outs.append((i, direction(pts, 14), other, length(pts)))
        best = None
        for a in range(4):
            for b in range(a + 1, 4):
                (i, da, oa, la), (j, db, ob, lb) = outs[a], outs[b]
                straight = -(da[0] * db[0] + da[1] * db[1])
                free = len(deg.get(oa, [])) == 1 and len(deg.get(ob, [])) == 1
                rest = [o for o in outs if o[0] not in (i, j)]
                rest_straight = -(rest[0][1][0] * rest[1][1][0] + rest[0][1][1] * rest[1][1][1])
                if free and straight > .7 and rest_straight > .4 and la + lb < xh * 2.2:
                    if best is None or la + lb < best[0]: best = (la + lb, i, j, n)
        if best:
            _, i, j, n = best
            pa = edges[i]['pts'] if edges[i]['b'] == n else edges[i]['pts'][::-1]
            pb = edges[j]['pts'] if edges[j]['a'] == n else edges[j]['pts'][::-1]
            bar = pa + pb[1:]
            if bar[0][1] > bar[-1][1]: bar = bar[::-1]          # left to right
            if abs(bar[0][1] - bar[-1][1]) < abs(bar[0][0] - bar[-1][0]) * .7 and bar[0][0] < bar[-1][0]:
                pass
            # x: the second line from bottom left up to the right
            if bar[0][0] < bar[-1][0] and abs(bar[0][1] - bar[-1][1]) < abs(bar[0][0] - bar[-1][0]): bar = bar[::-1] if bar[0][1] > bar[-1][1] else bar
            deferred |= {i, j}; later.append(bar)
    for ci, c in enumerate(mains):
        ids = [i for i in c['ids'] if i not in deferred]
        if not ids: continue
        x0, y0, x1, y1 = c['box']
        node_pos = {}
        for i in ids:
            e = edges[i]; node_pos[e['a']] = e['pts'][0]; node_pos[e['b']] = e['pts'][-1]
        ends = [n for n in node_pos if sum(1 for i in ids if n in (edges[i]['a'], edges[i]['b'])) == 1]
        letter = first if ci == 0 else None
        ccw = False; init = None
        w1 = item.get('w1', xh)
        if letter and letter in OVAL:
            target = (base - xh * 1.0, x0 + xh * .5)              # 2 h of the first oval
            ccw = True; init = (-1, 0)
        elif letter and letter in CAP_START:
            h = CAP_START[letter]
            top = base - xh * 2.05
            target = (top + h[1] * (base - top), x0 + h[0] * w1); init = h[2]
        elif letter and letter.lower() == letter:
            target = (base, x0 - xh)                               # the lead-in from Y1 on the left
        else:
            target = (y0, x0)                                      # a later part: from its top left
        # start: the nearest free end, or (closed start) the nearest point on a line
        near_end = ends and min(math.dist(node_pos[n], target) for n in ends) < xh * .45
        if ends and not ccw and (init is None or near_end):
            if letter and letter.lower() == letter and letter not in OVAL:
                sn = min(ends, key=lambda n: abs(node_pos[n][0] - base) * 2 + (node_pos[n][1] - x0))
            else:
                sn = min(ends, key=lambda n: math.dist(node_pos[n], target))
            start = ('node', sn)
        else:
            best = None
            for i in ids:
                for k, q in enumerate(edges[i]['pts']):
                    d = math.dist(q, target)
                    if best is None or d < best[0]: best = (d, i, k)
            _, i, k = best
            e = edges[i]; pts = e['pts']
            if 0 < k < len(pts) - 1:
                vn = 'v%d' % ci
                e1 = {'a': e['a'], 'b': vn, 'pts': pts[:k + 1]}; e2 = {'a': vn, 'b': e['b'], 'pts': pts[k:]}
                edges.append(e1); edges.append(e2); ids = [x for x in ids if x != i] + [len(edges) - 2, len(edges) - 1]
                start = ('node', vn)
            else:
                start = ('node', e['a'] if k == 0 else e['b'])
        exit_n = max(ends, key=lambda n: node_pos[n][1]) if ends else None
        if letter and (t if t == 'Ch' else letter) in WAY:
            letter = t if t == 'Ch' else letter
            top = base - xh * 2.05
            wps = [w if w == '|' else (top + w[1] * (base - top), x0 + w[0] * w1) for w in WAY[letter]]
            strokes.extend(way_walk(edges, ids, wps, xh, letter in BRIDGE))
            continue
        strokes.extend(walk(edges, ids, start[1], ccw, exit_n=exit_n, init=init, up_first=letter in ('s', 'š')))
    # dots that thinned down to (almost) a single point
    inline = set(q for e in edges for q in e['pts'])
    blobs, seen_px = [], set()
    for q in sorted(S):
        if q in seen_px: continue
        comp_px, stack = [], [q]; seen_px.add(q)
        while stack:
            u = stack.pop(); comp_px.append(u)
            for v in neighbours(S, u):
                if v not in seen_px: seen_px.add(v); stack.append(v)
        if not any(u in inline for u in comp_px) and max(u[0] for u in comp_px) < base - xh * 1.08:
            blobs.append((sum(u[0] for u in comp_px) / len(comp_px), sum(u[1] for u in comp_px) / len(comp_px)))
    for q in blobs:
        r_ = max(2, xh * .04)
        later.append([(q[0] - r_ * math.cos(a), q[1] - r_ * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 12)])
    # marks after the word: čárka from the top right, háček from the left, dots and rings from the top
    for c in marks:
        ids = c['ids']; pts = []
        for i in ids: pts += edges[i]['pts']
        x0, y0, x1, y1 = c['box']
        if max(x1 - x0, y1 - y0) < xh * .16:                       # a dot: a tiny circle
            cy, cx = (y0 + y1) / 2, (x0 + x1) / 2; r = max(2, xh * .04)
            later.append([(cy - r * math.cos(a), cx - r * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 12)])
            continue
        s = walk(edges, ids, None, False, mark=True)
        later.extend(s)
    return [[(round((q[1] - item['x0']) / xh, 3), round((q[0] - base) / xh, 3)) for q in simplify(st, xh)] for st in strokes + later]

def split_at(edges, ids, q, name):
    """Cut the line nearest to point q there; returns the node at q."""
    best = None
    for i in ids:
        for k, p in enumerate(edges[i]['pts']):
            d = math.dist(p, q)
            if best is None or d < best[0]: best = (d, i, k)
    _, i, k = best; e = edges[i]; pts = e['pts']
    if k == 0: return e['a'], ids
    if k == len(pts) - 1: return e['b'], ids
    edges.append({'a': e['a'], 'b': name, 'pts': pts[:k + 1]}); edges.append({'a': name, 'b': e['b'], 'pts': pts[k:]})
    return name, [x for x in ids if x != i] + [len(edges) - 2, len(edges) - 1]

def way_walk(edges, ids, wps, xh, bridge):
    """Try every way the pen can go through the drawing (retracing or lifting at dead ends) and keep the one that
    passes the school points in order with the fewest lifts and the least going back."""
    ids = list(ids)
    pos = {}
    for i in ids:
        e = edges[i]; pos[e['a']] = e['pts'][0]; pos[e['b']] = e['pts'][-1]
    if bridge:                                       # a free end close to another line (A: the oval closes at the stem)
        deg = {}
        for i in ids: deg[edges[i]['a']] = deg.get(edges[i]['a'], 0) + 1; deg[edges[i]['b']] = deg.get(edges[i]['b'], 0) + 1
        for n in [n for n, d in deg.items() if d == 1]:
            own = next(i for i in ids if n in (edges[i]['a'], edges[i]['b']))
            best = None
            for i in ids:
                pts = edges[i]['pts']
                for k, p in enumerate(pts):
                    if i == own and min(k, len(pts) - 1 - k) < xh * .8 * 1: continue
                    d = math.dist(p, pos[n])
                    if best is None or d < best[0]: best = (d, i, k, p)
            if best and best[0] < xh * .3:
                m, ids = split_at(edges, ids, best[3], 'br%d' % n if isinstance(n, int) else 'br' + str(n))
                edges.append({'a': n, 'b': m, 'pts': [pos[n], best[3]]}); ids.append(len(edges) - 1)
    start, ids = split_at(edges, ids, wps[0], 'ws')
    adj = {}
    for i in ids:
        e = edges[i]; adj.setdefault(e['a'], []).append(i)
        if e['b'] != e['a']: adj.setdefault(e['b'], []).append(i)
    def orient(i, n):
        e = edges[i]; return e['pts'] if e['a'] == n else e['pts'][::-1]
    def other(i, n):
        e = edges[i]; return e['b'] if e['a'] == n else e['a']
    lifts = wps.count('|'); pts_w = [w for w in wps if w != '|']
    results = []
    def go(node, used, strokes, back):
        if len(results) > 6000: return
        free = [i for i in adj.get(node, []) if i not in used]
        if free:
            for i in free:
                p = orient(i, node)
                st = [s[:] for s in strokes]; st[-1].extend(p if not st[-1] else p[1:])
                go(other(i, node), used | {i}, st, back)
            return
        if len(used) == len(ids): results.append((strokes, back)); return
        # back along the written line to the nearest node with a free line
        prev = {node: None}; queue = [node]; goal = None
        while queue:
            n = queue.pop(0)
            if any(i not in used for i in adj.get(n, [])): goal = n; break
            for i in adj.get(n, []):
                m = other(i, n)
                if m not in prev: prev[m] = (n, i); queue.append(m)
        if goal is not None:
            chain = []; n = goal
            while prev[n] is not None: p_, i = prev[n]; chain.append((p_, i)); n = p_
            st = [s[:] for s in strokes]; b = back
            for p_, i in reversed(chain): q = orient(i, p_); st[-1].extend(q[1:]); b += length(q)
            go(goal, used, st, b)
        if lifts:                                      # or lift the pen and start again at a free end
            for n, l in adj.items():
                if any(i not in used for i in l) and (len(l) == 1 or n == goal):
                    go(n, used, [s[:] for s in strokes] + [[]], back)
    go(start, frozenset(), [[]], 0)
    segs, cur = [], []
    for w in wps:
        if w == '|': segs.append(cur); cur = []
        else: cur.append(w)
    segs.append(cur)
    def fit(seg, pts):
        # each stroke starts at its first point and passes the others in order
        W = np.array(seg, float); P = np.array(pts[::3] + [pts[-1]], float)
        D = np.sqrt(((P[None, :, :] - W[:, None, :]) ** 2).sum(-1))
        c = np.full(len(P), 1e12); c[0] = D[0][0]
        for j in range(1, len(W)): c = np.minimum.accumulate(c) + D[j]
        return c.min()
    def cost(res):
        strokes, back = res
        strokes = [s for s in strokes if len(s) > 1]
        if len(strokes) != len(segs): return 1e15 + abs(len(strokes) - len(segs))
        return sum(fit(sg, st) for sg, st in zip(segs, strokes)) + back * .15
    best = min(results, key=cost)
    return [s for s in best[0] if len(s) > 1]

def walk(edges, ids, start, ccw, mark=False, exit_n=None, init=None, up_first=False):
    """The pen's way through one connected drawing: straight on at crossings, back along a dead end when more is left."""
    ids = list(ids)
    adj = {}
    for i in ids:
        e = edges[i]; adj.setdefault(e['a'], []).append(i)
        if e['b'] != e['a']: adj.setdefault(e['b'], []).append(i)
    if start is None:
        # a mark: čárka from its upper right end, háček from its left end, ring from the top
        ends = [n for n, l in adj.items() if len(l) == 1]
        def pos(n):
            i = adj[n][0]; e = edges[i]; return e['pts'][0] if e['a'] == n else e['pts'][-1]
        if ends:
            ps = {n: pos(n) for n in ends}
            left = min(ends, key=lambda n: ps[n][1]); right = max(ends, key=lambda n: ps[n][1])
            # háček (V): both ends up, start left; čárka: start at the higher end (upper right)
            start = left if abs(ps[left][0] - ps[right][0]) < abs(ps[left][1] - ps[right][1]) * .5 else min(ends, key=lambda n: ps[n][0])
        else:
            start = edges[ids[0]]['a']
    used = set(); path = []; node = start; incoming = None; strokes = []; up = [up_first]
    def orient(i, n):
        e = edges[i]; return e['pts'] if e['a'] == n else e['pts'][::-1]
    def other(i, n):
        e = edges[i]; return e['b'] if e['a'] == n else e['a']
    while True:
        free = [i for i in adj.get(node, []) if i not in used]
        if free:
            def is_end(n): return len(adj.get(n, [])) == 1
            def score(i):
                d = direction(orient(i, node), 14)
                o = other(i, node)
                pen = 0
                if o == exit_n and len(free) > 1: pen += 10                     # the way out of the word comes last
                elif is_end(o) and o != exit_n and len(free) > 1: pen -= 5      # a dead end first (then back along it)
                if up[0] and incoming is not None and len(free) > 1: return pen + d[1] * 3   # s: up to the peak first
                if incoming is None:
                    if init: return pen - (d[0] * init[0] + d[1] * init[1])   # the first way the pen goes
                    return pen + (d[0] if ccw else (-d[1] if mark else 0))
                return pen - (d[0] * incoming[0] + d[1] * incoming[1])
            i = min(free, key=score)
            if len(free) > 1 and incoming is not None: up[0] = False
            pts = orient(i, node)
            path.extend(pts if not path else pts[1:])
            used.add(i)
            nd = direction(pts[::-1], 14); incoming = (-nd[0], -nd[1])
            node = other(i, node)
            continue
        if len(used) == len(ids): break
        # dead end with more to write: go back along what was written to the nearest node that still has a free line
        prev = {node: None}; queue = [node]; goal = None
        while queue:
            n = queue.pop(0)
            if any(i not in used for i in adj.get(n, [])): goal = n; break
            for i in adj.get(n, []):
                m = other(i, n)
                if m not in prev: prev[m] = (n, i); queue.append(m)
        if goal is None: break
        chain = []; n = goal
        while prev[n] is not None:
            p, i = prev[n]; chain.append((p, i)); n = p
        for p, i in reversed(chain):
            pts = orient(i, p); path.extend(pts[1:])
            nd = direction(pts[::-1], 14); incoming = (-nd[0], -nd[1])
        node = goal
    if path: strokes.append(path)
    return strokes

def simplify(pts, xh):
    # even spacing (about 3 % of the x-height) and a light smoothing of the pixel steps
    step = max(1.5, xh * .03); out = [pts[0]]; acc = 0
    for i in range(1, len(pts)):
        acc += math.dist(pts[i - 1], pts[i])
        if acc >= step: out.append(pts[i]); acc = 0
    if out[-1] != pts[-1]: out.append(pts[-1])
    sm = [out[0]]
    for i in range(1, len(out) - 1):
        sm.append(((out[i - 1][0] + 2 * out[i][0] + out[i + 1][0]) / 4, (out[i - 1][1] + 2 * out[i][1] + out[i + 1][1]) / 4))
    sm.append(out[-1])
    return sm

if __name__ == '__main__':
    index = json.load(open(os.path.join(OUT_DIR, 'index.json')))
    res = {}
    for it in index:
        try: res[it['t']] = solve(it)
        except Exception as e: print('fail', it['t'], e, file=sys.stderr)
    # ť: the font joins its háček to the stem; the school writes t and then the háček as the 2nd stroke (like ď)
    if 't' in res and 'ď' in res and 'd' in res:
        top = lambda st: min((q for s_ in st for q in s_), key=lambda q: q[1])
        hk = res['ď'][-1]; dt, tt = top(res['d']), top(res['t'])
        dx, dy = tt[0] - dt[0], tt[1] - dt[1] + .15
        res['ť'] = [s_[:] for s_ in res['t']] + [[(round(x + dx, 3), round(y + dy, 3)) for x, y in hk]]
    with open(os.path.join(WWW, 'write_font.js'), 'w') as f:
        f.write('// generated by tools/font_strokes.py from the school font Slabikář – cursive strokes in writing order\n')
        f.write('window.FONT_STROKES = ' + json.dumps(res, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(len(res), 'items')

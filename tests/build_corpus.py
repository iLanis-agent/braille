#!/usr/bin/env python3
"""Braille oracle: independent python encode/decode per the dot standard."""
import json, os

LETTERS = {
 'a':[1],'b':[1,2],'c':[1,4],'d':[1,4,5],'e':[1,5],'f':[1,2,4],'g':[1,2,4,5],
 'h':[1,2,5],'i':[2,4],'j':[2,4,5],'k':[1,3],'l':[1,2,3],'m':[1,3,4],
 'n':[1,3,4,5],'o':[1,3,5],'p':[1,2,3,4],'q':[1,2,3,4,5],'r':[1,2,3,5],
 's':[2,3,4],'t':[2,3,4,5],'u':[1,3,6],'v':[1,2,3,6],'w':[2,4,5,6],
 'x':[1,3,4,6],'y':[1,3,4,5,6],'z':[1,3,5,6]}
CAP=[6]; NUM=[3,4,5,6]
PUNCT={'.':[2,5,6],',':[2],'?':[2,3,6],'!':[2,3,5],"'":[3],'-':[3,6],';':[2,3],':':[2,5]}

def mask(dots):
    m = 0
    for d in dots: m |= 1 << (d-1)
    return m

def bchar(dots): return chr(0x2800 + mask(dots))

def encode(text):
    out = ''; num = False
    for c in text:
        lc = c.lower()
        if 'a' <= lc <= 'z':
            if c != lc: out += bchar(CAP)
            out += bchar(LETTERS[lc]); num = False
        elif c.isdigit():
            if not num: out += bchar(NUM); num = True
            d = 'j' if c == '0' else chr(96+int(c))
            out += bchar(LETTERS[d])
        elif c == ' ':
            out += ' '; num = False
        elif c in PUNCT:
            out += bchar(PUNCT[c]); num = False
        else:
            return None
    return out

TEXTS = ['hello', 'Braille', 'abc xyz', 'room 101', 'a1x2', 'hi, there.',
         'what?', "it's", '2026', 'z', 'Q']
items = []
for t in TEXTS:
    e = encode(t)
    items.append({'kind':'encode','text':t,'oracle':e})
    if e: items.append({'kind':'roundtrip','text':t,'encoded':e})
# known reference: 'a' = U+2801, 'b' = U+2803, 'z' = U+283A, number sign U+283C, cap U+2820
REFS = [('a',0x2801),('b',0x2803),('j',0x281A),('z',0x2835)]
for L,code in REFS:
    items.append({'kind':'ref','letter':L,'code':code})
items.append({'kind':'ref','letter':'__CAP__','code':0x2820})
items.append({'kind':'ref','letter':'__NUM__','code':0x283C})
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expected.json')
json.dump({'items': items}, open(out,'w'))
print('cases:', len(items))

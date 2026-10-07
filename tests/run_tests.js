/* Braille tests: engine vs tests/expected.json (python oracle) + standard codepoints. */
'use strict';
const fs=require('fs'),path=require('path');
const B=require(path.join(__dirname,'..','engine.js'));
const items=JSON.parse(fs.readFileSync(path.join(__dirname,'expected.json'),'utf8')).items;
let pass=0,fail=0;
function ok(){pass++;}
function bad(l,a,b){fail++;console.log('FAIL '+l+': got '+JSON.stringify(a)+' want '+JSON.stringify(b));}
for(const it of items){
  const T=it.kind+' '+JSON.stringify(it.text||it.letter)+' ';
  if(it.kind==='encode'){
    const r=B.encode(it.text);
    if(it.oracle===null){if(!r.ok)ok();else bad(T+'should fail',r,null);continue;}
    if(r.ok&&r.braille===it.oracle)ok(); else bad(T,r.braille||r,it.oracle);
  }else if(it.kind==='roundtrip'){
    const d=B.decode(it.encoded);
    if(d.ok&&d.text===it.text)ok(); else bad(T+'decode',d,it.text);
  }else{
    let got;
    if(it.letter==='__CAP__')got=0x2800+B.mask(B.CAP);
    else if(it.letter==='__NUM__')got=0x2800+B.mask(B.NUM);
    else got=0x2800+B.mask(B.LETTERS[it.letter]);
    if(got===it.code)ok(); else bad(T+'codepoint',got,it.code);
  }
}
// every letter has a unique mask 1..63
const masks=new Set(Object.values(B.LETTERS).map(B.mask));
if(masks.size===26&&[...masks].every(m=>m>0&&m<64))pass++; else bad('mask uniqueness',masks.size,26);
// dotsOf round-trips char
if(JSON.stringify(B.dotsOf(B.char([1,4,5])))===JSON.stringify([1,4,5]))pass++; else bad('dotsOf','mismatch','[1,4,5]');
// unsupported char fails cleanly
if(!B.encode('hello \u20ac').ok)pass++; else bad('euro should fail','ok','fail');
console.log(pass+' passed, '+fail+' failed');
process.exit(fail?1:0);

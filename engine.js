/* Braille engine: Grade 1 (uncontracted) braille encode/decode.
   Dot numbering and Unicode mapping follow the braille standard:
   Unicode braille patterns start at U+2800; dot N adds bit (1<<(N-1)).
   Grade 1 only - no contractions; capital sign (dot 6) and number sign
   (dots 3-4-5-6) prefixes per standard. Pure JS, browser + Node. */
(function(root,factory){
  if(typeof module==='object'&&module.exports){module.exports=factory();}
  else{root.Braille=factory();}
})(typeof self!=='undefined'?self:this,function(){
'use strict';
/* letter -> dots array (1-6) */
var LETTERS={
 a:[1],b:[1,2],c:[1,4],d:[1,4,5],e:[1,5],f:[1,2,4],g:[1,2,4,5],h:[1,2,5],
 i:[2,4],j:[2,4,5],k:[1,3],l:[1,2,3],m:[1,3,4],n:[1,3,4,5],o:[1,3,5],
 p:[1,2,3,4],q:[1,2,3,4,5],r:[1,2,3,5],s:[2,3,4],t:[2,3,4,5],u:[1,3,6],
 v:[1,2,3,6],w:[2,4,5,6],x:[1,3,4,6],y:[1,3,4,5,6],z:[1,3,5,6]
};
var CAP=[6],NUM=[3,4,5,6];
var PUNCT={
 '.':[2,5,6],',':[2],'?':[2,3,6],'!':[2,3,5],"'":[3],'-':[3,6],';':[2,3],':':[2,5]
};
/* digits reuse a-j under the number sign */
function mask(dots){var m=0;for(var i=0;i<dots.length;i++)m|=1<<(dots[i]-1);return m;}
function char(dots){return String.fromCharCode(0x2800+mask(dots));}
function dotsOf(ch){
  var code=ch.charCodeAt(0);
  if(code<0x2800||code>0x28FF)return null;
  var m=code-0x2800,dots=[];
  for(var d=1;d<=6;d++)if(m&(1<<(d-1)))dots.push(d);
  return dots;
}
/* encode plain text to unicode braille string */
function encode(text){
  var out='',numMode=false;
  var s=String(text);
  for(var i=0;i<s.length;i++){
    var c=s[i],lc=c.toLowerCase();
    if(lc>='a'&&lc<='z'){
      if(c!==lc)out+=char(CAP);
      out+=char(LETTERS[lc]);
      numMode=false;
    }else if(c>='0'&&c<='9'){
      if(!numMode){out+=char(NUM);numMode=true;}
      var d=c==='0'?'j':String.fromCharCode(96+parseInt(c,10));
      out+=char(LETTERS[d]);
    }else if(c===' '){
      out+=' ';numMode=false;
    }else if(PUNCT[c]){
      out+=char(PUNCT[c]);
      numMode=false;
    }else{
      return {ok:false,error:'unsupported character: '+c};
    }
  }
  return {ok:true,braille:out};
}
/* decode unicode braille back to text (Grade 1) */
function decode(braille){
  var out='',numMode=false,capNext=false;
  var s=String(braille);
  for(var i=0;i<s.length;i++){
    var c=s[i];
    if(c===' '){out+=' ';numMode=false;continue;}
    var dots=dotsOf(c);
    if(!dots)return {ok:false,error:'not a braille pattern: '+c};
    var m=mask(dots);
    if(m===mask(CAP)){capNext=true;continue;}
    if(m===mask(NUM)){numMode=true;continue;}
    var letter=null;
    for(var L in LETTERS)if(mask(LETTERS[L])===m){letter=L;break;}
    if(letter){
      if(numMode&&letter<='j'){
        out+=letter==='j'?'0':String(letter.charCodeAt(0)-96);
      }else{
        out+=capNext?letter.toUpperCase():letter;
        numMode=false;
      }
      capNext=false;
      continue;
    }
    var p=null;
    for(var k in PUNCT)if(mask(PUNCT[k])===m){p=k;break;}
    if(p){out+=p;numMode=false;capNext=false;continue;}
    return {ok:false,error:'unmapped dot pattern'};
  }
  return {ok:true,text:out};
}
function dotsOfLetter(l){
  l=String(l).toLowerCase();
  return LETTERS[l]||PUNCT[l]||null;
}
return {LETTERS:LETTERS,CAP:CAP,NUM:NUM,mask:mask,char:char,dotsOf:dotsOf,encode:encode,decode:decode,dotsOfLetter:dotsOfLetter};
});

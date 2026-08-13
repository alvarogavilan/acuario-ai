(()=>{'use strict';
const photos={
  'Pez payaso común · pareja':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Amphiprion%20ocellaris.jpg?width=900',
  'Cirujano azul / Dory':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Paracanthurus%20hepatus.JPG?width=900',
  'Damisela azul de cola amarilla':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chrysiptera%20parasema.JPG?width=900',
  'Caracol abeja / Engina rayada':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Engina%20mendicaria%20unilineata.jpg?width=900'
};
function apply(){document.querySelectorAll('.life-photo img,.mini-photo img').forEach(img=>{const src=photos[img.alt];if(src&&img.dataset.speciesPhoto!=='1'){img.dataset.speciesPhoto='1';img.referrerPolicy='no-referrer';img.loading='eager';img.src=src}})}
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
(()=>{'use strict';
const sources={
 'Pez payaso común · pareja':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Amphiprion%20ocellaris.jpg?width=900'],
 'Cirujano azul / Dory':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Paracanthurus%20hepatus.JPG?width=900'],
 'Damisela azul de cola amarilla':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Chrysiptera%20parasema.JPG?width=900'],
 'Caracol abeja / Engina rayada':['https://commons.wikimedia.org/wiki/Special:Redirect/file/Engina%20mendicaria%20unilineata.jpg?width=772','https://commons.wikimedia.org/wiki/Special:Redirect/file/Naturalis%20Biodiversity%20Center%20-%20RMNH.MOL.201154%20-%20Engina%20mendicaria%20(Linnaeus,%201758)%20-%20Buccinidae%20-%20Mollusc%20shell.jpeg?width=800']
};
function wire(img){const list=sources[img.alt];if(!list||img.dataset.speciesPhoto==='ready')return;img.dataset.speciesPhoto='ready';img.referrerPolicy='no-referrer';img.loading='eager';let i=0;const next=()=>{if(i>=list.length){img.style.objectFit='contain';img.style.background='#0a222c';img.alt=`Foto no disponible · ${img.alt}`;return}img.src=list[i++]};img.onerror=next;next()}
function apply(){document.querySelectorAll('.life-photo img,.mini-photo img').forEach(wire)}
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
(()=>{'use strict';
const photos={
  'Pez payaso común · pareja':'https://upload.wikimedia.org/wikipedia/commons/5/51/Amphiprion_ocellaris.jpg',
  'Cirujano azul / Dory':'https://upload.wikimedia.org/wikipedia/commons/4/4d/Paracanthurus_hepatus.jpg',
  'Damisela azul de cola amarilla':'https://upload.wikimedia.org/wikipedia/commons/1/18/Chrysiptera_parasema.JPG',
  'Caracol abeja / Engina rayada':'https://upload.wikimedia.org/wikipedia/commons/a/aa/Engina_mendicaria_unilineata.jpg'
};
function fallbackBox(img){const box=img.parentElement;if(!box||box.querySelector('.species-photo-error'))return;const e=document.createElement('div');e.className='species-photo-error';e.textContent='Foto de especie no disponible';e.style.cssText='position:absolute;inset:0;display:grid;place-items:center;padding:12px;text-align:center;background:#0c2029;color:#9cb4bd;font:700 11px system-ui';box.style.position='relative';box.appendChild(e)}
function apply(){document.querySelectorAll('.life-photo img,.mini-photo img').forEach(img=>{const src=photos[img.alt];if(!src||img.dataset.speciesPhoto==='2')return;img.dataset.speciesPhoto='2';img.referrerPolicy='no-referrer';img.crossOrigin='anonymous';img.loading='eager';img.decoding='async';img.onerror=()=>fallbackBox(img);img.src=src})}
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
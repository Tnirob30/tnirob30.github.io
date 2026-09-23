(function(){
'use strict';
let data=JSON.parse(JSON.stringify(window.PORTFOLIO_DATA)), selected='profile', dirty=false;
const route=new URLSearchParams(location.search);
const schema={
profile:{label:'Profile & contact',fields:{name:'Full name',shortName:'Short name for footer',initials:'Initials',role:'Professional role',headline:'Research headline',focusLine:'Research fields above your name',intro:'Introduction|long',about:'About me|long',opportunity:'Opportunity statement|long',email:'Email address',location:'Location',affiliation:'Affiliation',degree:'Degree',gpa:'CGPA',gpaNote:'CGPA context',portrait:'Portrait|image',portraitAlt:'Portrait description',cv:'CV file path or URL|url',linkedin:'LinkedIn profile|url',scholar:'Google Scholar|url',github:'GitHub profile|url',updated:'Last updated (e.g. October 2026)'}},
interests:{label:'Research interests',fields:{title:'Title',description:'Description|long'}},
publications:{label:'Publications',fields:{title:'Publication title|long',authors:'Authors (in publication order)|long',venue:'Journal or conference',year:'Year',type:'Publication type|type',status:'Status|status',url:'DOI or publication URL|url'}},
projects:{label:'Projects',fields:{title:'Project title',category:'Research area',summary:'Project summary|long',contribution:'Your contribution|long',tags:'Tools (comma separated)',image:'Project image|image',imageAlt:'Image description',postUrl:'Exact LinkedIn project post URL|url',codeUrl:'Code repository URL|url',demoUrl:'Demo URL|url'}},
experience:{label:'Experience',fields:{title:'Role',organization:'Laboratory or organization',period:'Dates',location:'Location',description:'Description|long'}},
education:{label:'Education',fields:{title:'Degree or certificate',institution:'Institution',period:'Dates',detail:'Grades / distinction',description:'Research or other details|long'}},
skills:{label:'Technical skills',fields:{title:'Skill category',items:'Skills (comma separated)|long'}},
awards:{label:'Honors & awards',fields:{title:'Award title',organization:'Awarding organization',year:'Date (optional)',detail:'Details|long'}},
certifications:{label:'Certifications',fields:{title:'Course or training title',issuer:'Issuing organization',date:'Completion date',detail:'Duration, grade, credential ID|long',url:'Credential or certificate PDF URL|url',image:'Certificate scan|image',imageAlt:'Certificate image description'}},
service:{label:'Leadership & service',fields:{title:'Role',organization:'Organization',period:'Dates',description:'Details / earlier roles|long'}},
presentations:{label:'Presentations',fields:{title:'Presentation title|long',venue:'Event and year',detail:'Authors, role, or paper ID|long'}},
gallery:{label:'Photo gallery',fields:{title:'Caption / event',detail:'Date and location',image:'Photograph|image',imageAlt:'Image description for accessibility'}},
settings:{label:'Display settings & counter',fields:{showGallery:'Show the photo gallery section|boolean',galleryAutoplay:'Automatically advance gallery photos|boolean',galleryInterval:'Seconds between photographs (4–20)',showCounter:'Show the site visit counter|boolean',counterEndpoint:'Visit counter endpoint (Worker HTTPS URL)|url'}}
};
const $=id=>document.getElementById(id);
function status(msg,error=false){$('status').textContent=msg;$('status').classList.toggle('error',error);}
function change(){dirty=true;}
function validate(candidate){
 if(!candidate||typeof candidate!=='object'||!candidate.profile||typeof candidate.profile.name!=='string'||!candidate.settings)throw new Error('This is not a portfolio content file.');
 candidate.profile.focusLine??='Artificial intelligence · Intelligent systems · Engineering'; candidate.settings={galleryAutoplay:true,galleryInterval:'6',showCounter:true,counterEndpoint:'',...candidate.settings};
 for(const [key,definition] of Object.entries(schema)){
  const list=(key==='profile'||key==='settings')?[candidate[key]]:candidate[key];
  if(!Array.isArray(list)||list.length>500)throw new Error('Invalid or missing section: '+key);
  list.forEach(item=>{if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Invalid entry in '+key);for(const [field,label]of Object.entries(definition.fields)){const isBool=label.endsWith('|boolean');if(item[field]===undefined)item[field]=isBool?false:'';if(typeof item[field]!== (isBool?'boolean':'string'))throw new Error('Invalid field: '+field);}});
 }
 return candidate;
}
function renderNav(){const nav=$('editor-nav');nav.replaceChildren();for(const[key,def]of Object.entries(schema)){const b=document.createElement('button');b.type='button';b.textContent=def.label;b.className=key===selected?'active':'';if(key===selected)b.setAttribute('aria-current','page');b.onclick=()=>{selected=key;render();};nav.append(b);}}
function newEntry(key){const x={};for(const[field,label]of Object.entries(schema[key].fields))x[field]=label.endsWith('|boolean')?false:'';if(key==='publications'){x.type='Manuscript';x.status='In preparation';}return x;}
function render(){
 renderNav();$('fields').replaceChildren();$('section-head').replaceChildren();const title=document.createElement('h2');title.textContent=schema[selected].label;$('section-head').append(title);
 const singleton=selected==='profile'||selected==='settings';
 if(!singleton){const add=document.createElement('button');add.textContent='Add entry';add.onclick=()=>{data[selected].push(newEntry(selected));change();render();const entries=$('fields').querySelectorAll('.entry');entries[entries.length-1].scrollIntoView({block:'start',behavior:'smooth'});};$('section-head').append(add);}
 const list=singleton?[data[selected]]:data[selected];if(!list.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='No entries yet. Select “Add entry” to create one.';$('fields').append(empty);}
 list.forEach((entry,index)=>{
 const card=document.createElement('section');card.className='entry';
 if(!singleton){const head=document.createElement('div');head.className='entry-head';const h=document.createElement('h3');h.textContent=(index+1)+'. '+(entry.title||'New entry');head.append(h);const actions=document.createElement('div');actions.className='entry-actions';[['↑','Move up',-1],['↓','Move down',1],['Remove','Remove entry',0]].forEach(([text,label,delta])=>{const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=text;b.setAttribute('aria-label',label+' '+(entry.title||index+1));b.disabled=(delta===-1&&index===0)||(delta===1&&index===list.length-1);b.onclick=()=>{if(delta){[list[index],list[index+delta]]=[list[index+delta],list[index]];}else{if(!confirm('Remove this entry from your draft?'))return;list.splice(index,1);}change();render();};actions.append(b);});head.append(actions);card.append(head);}
 const grid=document.createElement('div');grid.className='fields-grid';
 for(const[field,definition]of Object.entries(schema[selected].fields)){
 const[label,type='text']=definition.split('|');const wrap=document.createElement('div');wrap.className='field'+(['long','image'].includes(type)?' wide':'');const id=selected+'-'+index+'-'+field;const lab=document.createElement('label');lab.className='field-label';lab.htmlFor=id;lab.textContent=label;wrap.append(lab);
 let input;if(type==='long'){input=document.createElement('textarea');input.rows=field==='about'?6:3;}else if(type==='type'||type==='status'){input=document.createElement('select');(type==='type'?['Journal article','Conference paper','Manuscript','Preprint']:['Published','Accepted','Under review','Under revision','Submitted','Preprint','In preparation']).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;input.append(o);});if(entry[field]&&!Array.from(input.options).some(o=>o.value===entry[field])){const o=document.createElement('option');o.value=o.textContent=entry[field];input.append(o);}}else{input=document.createElement('input');input.type=type==='boolean'?'checkbox':'text';}
 input.id=id;if(type==='boolean')input.checked=!!entry[field];else input.value=entry[field]||'';input.addEventListener('input',()=>{entry[field]=type==='boolean'?input.checked:input.value;change();});wrap.append(input);
 if(type==='url'){const help=document.createElement('span');help.className='help';help.textContent='Use a full https:// link, or an assets/ file path. Leave blank to hide the link.';wrap.append(help);}
 if(type==='image'){
 input.placeholder='Choose an image below, or enter an https:// URL / assets/ path';
 const help=document.createElement('span');help.className='help';help.textContent='Upload JPG, PNG, WebP, or GIF. Images are resized and embedded in content.js; GIF uploads become still images. Add an image description too.';wrap.append(help);
 if(entry[field]){const img=document.createElement('img');img.className='image-preview';img.alt='Current image';img.src=entry[field];img.onerror=()=>img.hidden=true;wrap.append(img);}
 const bar=document.createElement('div');bar.className='image-actions';const upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp,image/gif';upload.hidden=true;upload.id=id+'-upload';const uplabel=document.createElement('label');uplabel.htmlFor=upload.id;uplabel.className='button secondary';uplabel.textContent='Choose image';const clear=document.createElement('button');clear.type='button';clear.className='secondary';clear.textContent='Remove image';clear.onclick=()=>{entry[field]='';change();render();};upload.onchange=async()=>{const file=upload.files[0];if(!file)return;try{entry[field]=await resizeImage(file,field==='portrait'?1000:2400);change();render();status('Image added to the draft. Download content.js to keep this change.');}catch(err){status(err.message,true);}};bar.append(uplabel,upload,clear);wrap.append(bar);
 }
 grid.append(wrap);
 }
 card.append(grid);$('fields').append(card);
 });
}
function resizeImage(file,max){return new Promise((resolve,reject)=>{
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))return reject(new Error('Please choose a JPG, PNG, WebP, or GIF image.'));
 if(file.size>20*1024*1024)return reject(new Error('Choose an image below 20 MB.'));
 const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{try{const scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/webp',.88));}catch{reject(new Error('Could not process this image.'));}finally{URL.revokeObjectURL(url);}};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read the image.'));};img.src=url;
 });}
$('download').onclick=()=>{try{validate(data);const text='/* Portfolio content. Edit with editor.html. */\nwindow.PORTFOLIO_DATA = '+JSON.stringify(data,null,2).replace(/</g,'\\u003c')+';\n';const blob=new Blob([text],{type:'text/javascript;charset=utf-8'});if(blob.size>20*1024*1024){status('Your file is over 20 MB. Remove some embedded images, or use assets/ image paths, before downloading.',true);return;}const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='content.js';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),30000);dirty=false;status('Downloaded content.js. Replace the file in your GitHub repository and commit to publish. If your browser renamed it, rename it back to content.js.');}catch(err){status(err.message,true);}};
$('import-file').onchange=async evt=>{const f=evt.target.files[0];if(!f)return;if(f.size>25*1024*1024){status('The content file is too large.',true);return;}try{let text=(await f.text()).replace(/^\uFEFF/,'').trim();text=text.replace(/^\/\*[\s\S]*?\*\/\s*/,'');if(text.startsWith('window.PORTFOLIO_DATA'))text=text.replace(/^window\.PORTFOLIO_DATA\s*=\s*/,'').replace(/;\s*$/,'');const candidate=validate(JSON.parse(text));if(dirty&&!confirm('Replace the unsaved draft with this imported file?'))return;data=candidate;dirty=false;render();status('Content imported. You can now edit and preview it.');}catch(err){status('Import failed: '+err.message,true);}finally{evt.target.value='';}};
$('save-draft').onclick=()=>{try{localStorage.setItem('touhid-portfolio-draft-v1',JSON.stringify(data));status('Draft saved in this browser only. Download content.js for a portable backup.');}catch{status('Browser storage is unavailable or full. Download content.js to save your draft.',true);}};
$('load-draft').onclick=()=>{try{const raw=localStorage.getItem('touhid-portfolio-draft-v1');if(!raw){status('No saved draft in this browser.',true);return;}if(dirty&&!confirm('Replace your current unsaved changes with the saved draft?'))return;data=validate(JSON.parse(raw));dirty=true;render();status('Saved draft loaded. This does not change the published website.');}catch{status('Unable to load the saved draft. Import a downloaded content.js instead.',true);}};
const dialog=$('preview-dialog'),frame=$('preview-frame');
$('preview').onclick=()=>{dialog.showModal();frame.onload=()=>frame.contentWindow.postMessage({type:'portfolio-preview',data},'*');frame.src='index.html?preview=1&draft='+Date.now();};
$('close-preview').onclick=()=>dialog.close();$('narrow').onclick=()=>{const narrow=frame.classList.toggle('narrow');$('narrow').textContent=narrow?'Wide view':'Narrow view';};
window.addEventListener('beforeunload',evt=>{if(dirty){evt.preventDefault();evt.returnValue='';}});
if(Object.prototype.hasOwnProperty.call(schema,route.get('section')))selected=route.get('section');
if(route.get('action')==='add'&&Array.isArray(data[selected])){data[selected].push(newEntry(selected));dirty=true;}
render();
if(route.get('action')==='add'){requestAnimationFrame(()=>{const cards=$('fields').querySelectorAll('.entry');const last=cards[cards.length-1];last?.scrollIntoView({block:'start'});last?.querySelector('input,textarea')?.focus();});}
})();

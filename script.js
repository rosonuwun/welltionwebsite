
/* NAV */
function toggleMenu(){document.getElementById('mobMenu').classList.toggle('open')}
window.addEventListener('scroll',()=>{document.getElementById('nav').style.height=scrollY>60?'58px':'68px'})
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',function(e){const t=document.querySelector(this.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}))

/* REVEAL */
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.1})
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el))

/* LIGHTBOX */
function openLB(id){document.getElementById('lbFrame').src='https://drive.google.com/file/d/'+id+'/preview';document.getElementById('lightbox').classList.add('open');document.body.style.overflow='hidden'}
function closeLB(){document.getElementById('lightbox').classList.remove('open');document.getElementById('lbFrame').src='';document.body.style.overflow=''}

/* CV BUILDER */
let tpl='min'
function openCV(){document.getElementById('cvModal').classList.add('open');document.body.style.overflow='hidden';renderCV()}
function closeCV(){document.getElementById('cvModal').classList.remove('open');document.body.style.overflow=''}
function setTpl(t,btn){tpl=t;document.querySelectorAll('.tpl-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderCV()}
function gv(id){return(document.getElementById(id)||{}).value||''}
function n2b(s){return s.replace(/\n/g,'<br>')}

function renderCV(){
  const name=gv('cn')||'Nama Lengkap',title=gv('ct'),email=gv('ce'),phone=gv('cp'),loc=gv('cl'),li=gv('cli')
  const sum=gv('csum'),exp=gv('cexp'),edu=gv('cedu'),sk=gv('csk'),ex=gv('cex')
  const contact=[email,phone,loc,li].filter(Boolean).join(' · ')
  let h=''
  if(tpl==='min'){
    h=`<div class="tpl-min">
      <div class="cn">${name}</div>${title?`<div style="font-size:11px;color:#666;margin-bottom:5px">${title}</div>`:''}
      <div class="ct">${contact}</div>
      ${sum?`<div class="cs"><div class="cst">Profil</div>${n2b(sum)}</div>`:''}
      ${exp?`<div class="cs"><div class="cst">Pengalaman</div>${n2b(exp)}</div>`:''}
      ${edu?`<div class="cs"><div class="cst">Pendidikan</div>${n2b(edu)}</div>`:''}
      ${sk?`<div class="cs"><div class="cst">Keahlian</div>${sk}</div>`:''}
      ${ex?`<div class="cs"><div class="cst">Lainnya</div>${n2b(ex)}</div>`:''}
    </div>`
  } else if(tpl==='pro'){
    h=`<div class="tpl-pro">
      <div class="ch"><div class="cn">${name}</div>${title?`<div class="ct">${title}</div>`:''}
      <div class="ct" style="margin-top:4px">${contact}</div></div>
      <div class="cb">
        ${sum?`<div class="cs"><div class="cst">Profil</div>${n2b(sum)}</div>`:''}
        ${exp?`<div class="cs"><div class="cst">Pengalaman</div>${n2b(exp)}</div>`:''}
        ${edu?`<div class="cs"><div class="cst">Pendidikan</div>${n2b(edu)}</div>`:''}
        ${sk?`<div class="cs"><div class="cst">Keahlian</div>${sk}</div>`:''}
        ${ex?`<div class="cs"><div class="cst">Lainnya</div>${n2b(ex)}</div>`:''}
      </div></div>`
  } else {
    h=`<div class="tpl-cre">
      <div class="csb">
        <div class="cn">${name}</div>${title?`<div class="ct">${title}</div>`:''}
        <div style="font-size:10px;color:rgba(255,255,255,.55);line-height:1.8">${[email,phone,loc,li].filter(Boolean).join('<br>')}</div>
        ${sk?`<div class="csts">Keahlian</div><div style="font-size:11px;color:rgba(255,255,255,.7);line-height:1.7">${sk.split(',').map(s=>'• '+s.trim()).join('<br>')}</div>`:''}
        ${ex?`<div class="csts">Lainnya</div><div style="font-size:11px;color:rgba(255,255,255,.7)">${n2b(ex)}</div>`:''}
      </div>
      <div class="cm">
        ${sum?`<div class="cst">Profil</div><div style="font-size:11px;margin-bottom:8px">${n2b(sum)}</div>`:''}
        ${exp?`<div class="cst">Pengalaman</div><div style="font-size:11px;margin-bottom:8px">${n2b(exp)}</div>`:''}
        ${edu?`<div class="cst">Pendidikan</div><div style="font-size:11px">${n2b(edu)}</div>`:''}
      </div></div>`
  }
  document.getElementById('cvPrev').innerHTML=h
}

async function dlCV(fmt){
  const el=document.getElementById('cvPrev')
  if(!el.innerText.trim()){alert('Isi data CV kamu dulu ya!');return}
  try{
    const canvas=await html2canvas(el,{scale:2,backgroundColor:'#ffffff'})
    if(fmt==='png'){
      const a=document.createElement('a');a.download='CV-Welltion.png';a.href=canvas.toDataURL();a.click()
    } else {
      const {jsPDF}=window.jspdf
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'})
      const w=pdf.internal.pageSize.getWidth()
      const h=canvas.height*w/canvas.width
      pdf.addImage(canvas.toDataURL(),'PNG',0,0,w,h)
      pdf.save('CV-Welltion.pdf')
    }
  }catch(e){alert('Gagal download, coba lagi ya!')}
}

/* COMMENTS */
let rating=5
function setRating(r){rating=r;document.querySelectorAll('#starRow span').forEach((s,i)=>s.classList.toggle('on',i<r))}
setRating(5)

let comments=[]
try{comments=JSON.parse(localStorage.getItem('wt_comm')||'[]')}catch(e){}
renderComments()

function submitComment(){
  const txt=document.getElementById('ctxt').value.trim()
  if(!txt){alert('Tulis komentar dulu ya! 😊');return}
  const name=document.getElementById('cname').value.trim()||'Anonim'
  const role=document.getElementById('crole').value.trim()
  comments.unshift({name,role,txt,rating,date:new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})})
  try{localStorage.setItem('wt_comm',JSON.stringify(comments))}catch(e){}
  document.getElementById('ctxt').value=''
  document.getElementById('cname').value=''
  document.getElementById('crole').value=''
  setRating(5)
  renderComments()
}

function renderComments(){
  const list=document.getElementById('commList')
  if(!comments.length){list.innerHTML='<div class="no-comm">Belum ada komentar. Jadilah yang pertama! 🌟</div>';return}
  list.innerHTML=comments.map(c=>{
    const ini=c.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
    const stars='★'.repeat(c.rating)+'☆'.repeat(5-c.rating)
    return`<div class="comm-card">
      <div class="comm-top">
        <div class="comm-av">${ini}</div>
        <div class="comm-meta">
          <div class="comm-name">${c.name}${c.role?` <span style="font-weight:400;color:var(--gray-400);font-size:.8rem">· ${c.role}</span>`:''}</div>
          <div class="comm-date">${c.date}</div>
        </div>
        <div class="comm-stars">${stars}</div>
      </div>
      <div class="comm-txt">${c.txt}</div>
    </div>`
  }).join('')
}

renderCV()

/* ============================================================
   WELLTION — script.js
   Supabase: https://pggcbqhspnyktpkckamq.supabase.co
   ============================================================ */

// ── SUPABASE CONFIG ──────────────────────────────────────────
const SUPABASE_URL = 'https://pggcbqhspnyktpkckamq.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ2NicWhzcG55a3Rwa2NrYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDc5NTgsImV4cCI6MjA5NDIyMzk1OH0.4l7766iJ72s2S-eGGt-OPGePeDebGzyHZv6wlkaFg0s'

const sb = {
  async query(method, path, body = null, extra = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}${extra}`, {
      method,
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=minimal' : ''
      },
      body: body ? JSON.stringify(body) : null
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Supabase error')
    }
    if (method === 'GET') return res.json()
    return true
  },
  get: (path, extra) => sb.query('GET', path, null, extra),
  post: (path, body) => sb.query('POST', path, body)
}

// ── SUPABASE STORAGE (untuk upload foto komentar) ────────────
async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const filename = `comment_${Date.now()}.${ext}`
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/comment-images/${filename}`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': file.type
      },
      body: file
    }
  )
  if (!res.ok) throw new Error('Gagal upload gambar')
  return `${SUPABASE_URL}/storage/v1/object/public/comment-images/${filename}`
}

// ── NAVBAR ───────────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobMenu').classList.toggle('open')
}

window.addEventListener('scroll', () => {
  document.getElementById('nav').style.height = scrollY > 60 ? '58px' : '68px'
})

document.querySelectorAll('a[href^="#"]').forEach(a =>
  a.addEventListener('click', function (e) {
    const t = document.querySelector(this.getAttribute('href'))
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }) }
  })
)

// ── SCROLL REVEAL ────────────────────────────────────────────
const obs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
}), { threshold: 0.1 })
document.querySelectorAll('.reveal').forEach(el => obs.observe(el))

/* ============================================================
   GANTI fungsi openLB & closeLB di script.js kamu
   dengan fungsi openDrive & closeLB di bawah ini
   ============================================================ */

// Lightbox dengan fallback ke Google Drive
function openDrive(fileId, driveUrl) {
  const frame = document.getElementById('lbFrame')
  const fallback = document.getElementById('lbFallback')
  const fallbackLink = document.getElementById('lbFallbackLink')
  const lb = document.getElementById('lightbox')

  // Reset state
  frame.style.display = 'block'
  fallback.style.display = 'none'
  fallbackLink.href = driveUrl

  // Coba load iframe preview
  frame.src = 'https://drive.google.com/file/d/' + fileId + '/preview'

  // Kalau iframe gagal load dalam 5 detik → tampilkan fallback
  const timeout = setTimeout(() => {
    showFallback(driveUrl)
  }, 5000)

  frame.onload = () => {
    clearTimeout(timeout)
    // Cek apakah konten berhasil (iframe bisa load tapi isinya error page)
    try {
      // Kalau tidak error, biarkan tampil
      clearTimeout(timeout)
    } catch (e) {
      showFallback(driveUrl)
    }
  }

  frame.onerror = () => {
    clearTimeout(timeout)
    showFallback(driveUrl)
  }

  lb.classList.add('open')
  document.body.style.overflow = 'hidden'
}

function showFallback(driveUrl) {
  const frame = document.getElementById('lbFrame')
  const fallback = document.getElementById('lbFallback')
  const fallbackLink = document.getElementById('lbFallbackLink')

  frame.style.display = 'none'
  fallback.style.display = 'flex'
  fallbackLink.href = driveUrl

  // Auto-buka Drive di tab baru setelah 1 detik
  setTimeout(() => {
    window.open(driveUrl, '_blank')
  }, 800)
}

function closeLB() {
  const lb = document.getElementById('lightbox')
  const frame = document.getElementById('lbFrame')
  lb.classList.remove('open')
  frame.src = ''
  document.body.style.overflow = ''
}

// ── CV BUILDER ───────────────────────────────────────────────
let tpl = 'min'

function openCV() {
  document.getElementById('cvModal').classList.add('open')
  document.body.style.overflow = 'hidden'
  renderCV()
}
function closeCV() {
  document.getElementById('cvModal').classList.remove('open')
  document.body.style.overflow = ''
}
function setTpl(t, btn) {
  tpl = t
  document.querySelectorAll('.tpl-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  renderCV()
}
function gv(id) { return (document.getElementById(id) || {}).value || '' }
function n2b(s) { return s.replace(/\n/g, '<br>') }

function renderCV() {
  const name = gv('cn') || 'Nama Lengkap'
  const title = gv('ct'), email = gv('ce'), phone = gv('cp')
  const loc = gv('cl'), li = gv('cli')
  const sum = gv('csum'), exp = gv('cexp'), edu = gv('cedu')
  const sk = gv('csk'), ex = gv('cex')
  const contact = [email, phone, loc, li].filter(Boolean).join(' · ')
  let h = ''

  if (tpl === 'min') {
    h = `<div class="tpl-min">
      <div class="cn">${name}</div>
      ${title ? `<div style="font-size:11px;color:#666;margin-bottom:5px">${title}</div>` : ''}
      <div class="ct">${contact}</div>
      ${sum ? `<div class="cs"><div class="cst">Profil</div>${n2b(sum)}</div>` : ''}
      ${exp ? `<div class="cs"><div class="cst">Pengalaman</div>${n2b(exp)}</div>` : ''}
      ${edu ? `<div class="cs"><div class="cst">Pendidikan</div>${n2b(edu)}</div>` : ''}
      ${sk ? `<div class="cs"><div class="cst">Keahlian</div>${sk}</div>` : ''}
      ${ex ? `<div class="cs"><div class="cst">Lainnya</div>${n2b(ex)}</div>` : ''}
    </div>`
  } else if (tpl === 'pro') {
    h = `<div class="tpl-pro">
      <div class="ch">
        <div class="cn">${name}</div>
        ${title ? `<div class="ct">${title}</div>` : ''}
        <div class="ct" style="margin-top:4px">${contact}</div>
      </div>
      <div class="cb">
        ${sum ? `<div class="cs"><div class="cst">Profil</div>${n2b(sum)}</div>` : ''}
        ${exp ? `<div class="cs"><div class="cst">Pengalaman</div>${n2b(exp)}</div>` : ''}
        ${edu ? `<div class="cs"><div class="cst">Pendidikan</div>${n2b(edu)}</div>` : ''}
        ${sk ? `<div class="cs"><div class="cst">Keahlian</div>${sk}</div>` : ''}
        ${ex ? `<div class="cs"><div class="cst">Lainnya</div>${n2b(ex)}</div>` : ''}
      </div>
    </div>`
  } else {
    h = `<div class="tpl-cre">
      <div class="csb">
        <div class="cn">${name}</div>
        ${title ? `<div class="ct">${title}</div>` : ''}
        <div style="font-size:10px;color:rgba(255,255,255,.55);line-height:1.8">${[email, phone, loc, li].filter(Boolean).join('<br>')}</div>
        ${sk ? `<div class="csts">Keahlian</div><div style="font-size:11px;color:rgba(255,255,255,.7);line-height:1.7">${sk.split(',').map(s => '• ' + s.trim()).join('<br>')}</div>` : ''}
        ${ex ? `<div class="csts">Lainnya</div><div style="font-size:11px;color:rgba(255,255,255,.7)">${n2b(ex)}</div>` : ''}
      </div>
      <div class="cm">
        ${sum ? `<div class="cst">Profil</div><div style="font-size:11px;margin-bottom:8px">${n2b(sum)}</div>` : ''}
        ${exp ? `<div class="cst">Pengalaman</div><div style="font-size:11px;margin-bottom:8px">${n2b(exp)}</div>` : ''}
        ${edu ? `<div class="cst">Pendidikan</div><div style="font-size:11px">${n2b(edu)}</div>` : ''}
      </div>
    </div>`
  }
  document.getElementById('cvPrev').innerHTML = h
}

async function dlCV(fmt) {
  const el = document.getElementById('cvPrev')
  if (!el.innerText.trim()) { alert('Isi data CV kamu dulu ya!'); return }
  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
    if (fmt === 'png') {
      const a = document.createElement('a')
      a.download = 'CV-Welltion.png'
      a.href = canvas.toDataURL()
      a.click()
    } else {
      const { jsPDF } = window.jspdf
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = canvas.height * w / canvas.width
      pdf.addImage(canvas.toDataURL(), 'PNG', 0, 0, w, h)
      pdf.save('CV-Welltion.pdf')
    }
  } catch (e) { alert('Gagal download, coba lagi ya!') }
}

// ── COMMENTS — SUPABASE ──────────────────────────────────────
let rating = 5
let selectedImageFile = null

function setRating(r) {
  rating = r
  document.querySelectorAll('#starRow span').forEach((s, i) => s.classList.toggle('on', i < r))
}
setRating(5)

// Preview foto yang dipilih
const imgInput = document.getElementById('commentImg')
if (imgInput) {
  imgInput.addEventListener('change', function () {
    const file = this.files[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran foto maksimal 4MB ya!')
      this.value = ''
      return
    }
    selectedImageFile = file
    const reader = new FileReader()
    reader.onload = e => {
      const prev = document.getElementById('imgPreview')
      if (prev) { prev.src = e.target.result; prev.style.display = 'block' }
    }
    reader.readAsDataURL(file)
  })
}

async function submitComment() {
  const txt = document.getElementById('ctxt').value.trim()
  if (!txt) { alert('Tulis komentar dulu ya! 😊'); return }

  const btn = document.querySelector('.comm-btn')
  btn.textContent = 'Mengirim...'
  btn.disabled = true

  try {
    let image_url = null

    // Upload foto jika ada
    if (selectedImageFile) {
      try {
        image_url = await uploadImage(selectedImageFile)
      } catch (e) {
        console.warn('Upload gambar gagal, lanjut tanpa foto:', e)
      }
    }

    const name = document.getElementById('cname').value.trim() || 'Anonim'
    const role = document.getElementById('crole').value.trim() || null

    await sb.post('comments', { name, role, text: txt, rating, image_url, approved: false })

    // Reset form
    document.getElementById('ctxt').value = ''
    document.getElementById('cname').value = ''
    document.getElementById('crole').value = ''
    if (imgInput) imgInput.value = ''
    const prev = document.getElementById('imgPreview')
    if (prev) prev.style.display = 'none'
    selectedImageFile = null
    setRating(5)

    showToast('✅ Komentar terkirim! Akan muncul setelah disetujui admin.')
  } catch (e) {
    console.error(e)
    showToast('❌ Gagal kirim komentar. Coba lagi ya!', true)
  } finally {
    btn.textContent = 'Kirim Komentar →'
    btn.disabled = false
  }
}

async function loadComments() {
  const list = document.getElementById('commList')
  if (!list) return

  list.innerHTML = '<div class="no-comm">Memuat komentar...</div>'

  try {
    const data = await sb.get('comments', '?approved=eq.true&order=created_at.desc')

    if (!data.length) {
      list.innerHTML = '<div class="no-comm">Belum ada komentar. Jadilah yang pertama! 🌟</div>'
      return
    }

    list.innerHTML = data.map(c => {
      const ini = (c.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      const stars = '★'.repeat(c.rating || 5) + '☆'.repeat(5 - (c.rating || 5))
      const date = new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      const imgHTML = c.image_url
        ? `<img src="${c.image_url}" alt="foto komentar" style="margin-top:.8rem;max-width:100%;border-radius:10px;max-height:300px;object-fit:cover;cursor:pointer" onclick="window.open('${c.image_url}','_blank')">`
        : ''
      return `<div class="comm-card">
        <div class="comm-top">
          <div class="comm-av">${ini}</div>
          <div class="comm-meta">
            <div class="comm-name">${c.name}${c.role ? ` <span style="font-weight:400;color:var(--gray-400);font-size:.8rem">· ${c.role}</span>` : ''}</div>
            <div class="comm-date">${date}</div>
          </div>
          <div class="comm-stars">${stars}</div>
        </div>
        <div class="comm-txt">${c.text}</div>
        ${imgHTML}
      </div>`
    }).join('')
  } catch (e) {
    console.error(e)
    list.innerHTML = '<div class="no-comm">Gagal memuat komentar. Refresh halaman ya.</div>'
  }
}

// ── TOAST NOTIFICATION ───────────────────────────────────────
function showToast(msg, isError = false) {
  let toast = document.getElementById('toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'toast'
    toast.style.cssText = `
      position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
      background:${isError ? '#ef4444' : '#10b981'};color:#fff;
      padding:.8rem 1.6rem;border-radius:100px;font-size:.9rem;font-weight:500;
      z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.2);
      transition:opacity .3s;white-space:nowrap;font-family:'Sora',sans-serif
    `
    document.body.appendChild(toast)
  }
  toast.style.background = isError ? '#ef4444' : '#10b981'
  toast.textContent = msg
  toast.style.opacity = '1'
  setTimeout(() => { toast.style.opacity = '0' }, 4000)
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadComments()
  renderCV()
})
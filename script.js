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

/* ── UPDATE renderCV() — tambah foto ke template ──
   Ganti fungsi renderCV() yang lama di script.js dengan ini */
 
function renderCV() {
  const name = gv('cn') || 'Nama Lengkap'
  const title = gv('ct'), email = gv('ce'), phone = gv('cp')
  const loc = gv('cl'), li = gv('cli')
  const sum = gv('csum'), exp = gv('cexp'), edu = gv('cedu')
  const sk = gv('csk'), ex = gv('cex')
  const contact = [email, phone, loc, li].filter(Boolean).join(' · ')
  const photo = croppedPhotoDataURL
 
  const photoCircle = photo
    ? `<img src="${photo}" class="cv-photo-circle" alt="foto">`
    : ''
 
  let h = ''
 
  if (tpl === 'min') {
    // Minimalist: foto di kanan atas (pojok)
    h = `<div class="tpl-min">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div>
          <div class="cn">${name}</div>
          ${title ? `<div style="font-size:11px;color:#666;margin-bottom:5px">${title}</div>` : ''}
          <div class="ct">${contact}</div>
        </div>
        ${photo ? `<div style="flex-shrink:0;margin-left:12px">${photoCircle}</div>` : ''}
      </div>
      ${sum ? `<div class="cs"><div class="cst">Profil</div>${n2b(sum)}</div>` : ''}
      ${exp ? `<div class="cs"><div class="cst">Pengalaman</div>${n2b(exp)}</div>` : ''}
      ${edu ? `<div class="cs"><div class="cst">Pendidikan</div>${n2b(edu)}</div>` : ''}
      ${sk ? `<div class="cs"><div class="cst">Keahlian</div>${sk}</div>` : ''}
      ${ex ? `<div class="cs"><div class="cst">Lainnya</div>${n2b(ex)}</div>` : ''}
    </div>`
 
  } else if (tpl === 'pro') {
    // Professional: foto di header tengah atas
    h = `<div class="tpl-pro">
      <div class="ch" style="display:flex;align-items:center;gap:1rem">
        ${photo ? `<div style="flex-shrink:0">${photoCircle}</div>` : ''}
        <div>
          <div class="cn">${name}</div>
          ${title ? `<div class="ct">${title}</div>` : ''}
          <div class="ct" style="margin-top:4px">${contact}</div>
        </div>
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
    // Creative: foto di sidebar tengah
    h = `<div class="tpl-cre">
      <div class="csb">
        ${photo ? `<div style="display:flex;justify-content:center;margin-bottom:10px">${photoCircle}</div>` : ''}
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

/* ============================================================
   TAMBAHKAN ke script.js — Support Modal + CV Photo Crop
   ============================================================ */
 
/* ── SUPPORT MODAL ── */
let selectedAmount = 20000
 
function openSupportModal() {
  document.getElementById('supportOverlay').classList.add('open')
  document.body.style.overflow = 'hidden'
}
 
function closeSupportModal() {
  document.getElementById('supportOverlay').classList.remove('open')
  document.body.style.overflow = ''
}
 
function supportPay(amount) {
  selectedAmount = amount
  // Update active button
  document.querySelectorAll('.support-amount-btn').forEach(btn => btn.classList.remove('active'))
  event.currentTarget.classList.add('active')
  // Update pay button text
  const payBtn = document.getElementById('supportPayBtn')
  payBtn.textContent = `❤️ Dukung Rp${amount.toLocaleString('id-ID')} via Lynk`
}
 
// Init default
document.addEventListener('DOMContentLoaded', () => {
  const payBtn = document.getElementById('supportPayBtn')
  if (payBtn) payBtn.textContent = `❤️ Dukung Rp20.000 via Lynk`
})
 
 
/* ── CV PHOTO CROP ── */
let cropImg = null
let cropOffsetX = 0
let cropOffsetY = 0
let cropZoom = 1
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let croppedPhotoDataURL = null
 
const CROP_SIZE = 280    // canvas display size
const OUTPUT_SIZE = 300  // output circle size
 
function handleCVPhoto(input) {
  const file = input.files[0]
  if (!file) return

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Hanya file JPG, PNG yang diperbolehkan!')
    input.value = ''
    return
  }

  // Validasi ukuran max 2MB
  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran foto maksimal 5MB ya!')
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = e => {
    const img = new Image()
    img.onload = () => {
      cropImg = img
      cropZoom = 1
      cropOffsetX = 0
      cropOffsetY = 0
      document.getElementById('cropZoom').value = 1
      document.getElementById('cropOverlay').classList.add('open')
      document.body.style.overflow = 'hidden'
      drawCrop()
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}
 
function drawCrop() {
  const canvas = document.getElementById('cropCanvas')
  const ctx = canvas.getContext('2d')
  canvas.width = CROP_SIZE
  canvas.height = CROP_SIZE
 
  ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE)
 
  if (!cropImg) return
 
  const scale = cropZoom * Math.max(CROP_SIZE / cropImg.width, CROP_SIZE / cropImg.height)
  const w = cropImg.width * scale
  const h = cropImg.height * scale
 
  // Center + offset
  const x = (CROP_SIZE - w) / 2 + cropOffsetX
  const y = (CROP_SIZE - h) / 2 + cropOffsetY
 
  ctx.drawImage(cropImg, x, y, w, h)
}
 
function updateCrop() {
  cropZoom = parseFloat(document.getElementById('cropZoom').value)
  drawCrop()
}
 
// Drag to reposition
const cropWrap = document.querySelector('.crop-canvas-wrap')
if (cropWrap) {
  cropWrap.addEventListener('mousedown', e => {
    isDragging = true
    dragStartX = e.clientX - cropOffsetX
    dragStartY = e.clientY - cropOffsetY
  })
  window.addEventListener('mousemove', e => {
    if (!isDragging) return
    cropOffsetX = e.clientX - dragStartX
    cropOffsetY = e.clientY - dragStartY
    drawCrop()
  })
  window.addEventListener('mouseup', () => { isDragging = false })
 
  // Touch support
  cropWrap.addEventListener('touchstart', e => {
    isDragging = true
    dragStartX = e.touches[0].clientX - cropOffsetX
    dragStartY = e.touches[0].clientY - cropOffsetY
  }, { passive: true })
  window.addEventListener('touchmove', e => {
    if (!isDragging) return
    cropOffsetX = e.touches[0].clientX - dragStartX
    cropOffsetY = e.touches[0].clientY - dragStartY
    drawCrop()
  }, { passive: true })
  window.addEventListener('touchend', () => { isDragging = false })
}
 
function applyCrop() {
  // Render ke canvas output bulat
  const outCanvas = document.createElement('canvas')
  outCanvas.width = OUTPUT_SIZE
  outCanvas.height = OUTPUT_SIZE
  const ctx = outCanvas.getContext('2d')
 
  // Clip lingkaran
  ctx.beginPath()
  ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
 
  // Scale dari crop canvas ke output
  const ratio = OUTPUT_SIZE / CROP_SIZE
  const scale = cropZoom * Math.max(CROP_SIZE / cropImg.width, CROP_SIZE / cropImg.height) * ratio
  const w = cropImg.width * scale
  const h = cropImg.height * scale
  const x = (OUTPUT_SIZE - w) / 2 + cropOffsetX * ratio
  const y = (OUTPUT_SIZE - h) / 2 + cropOffsetY * ratio
 
  ctx.drawImage(cropImg, x, y, w, h)
 
  croppedPhotoDataURL = outCanvas.toDataURL('image/png')
 
  // Update preview di form
  const preview = document.getElementById('cvPhotoPreview')
  preview.innerHTML = `<img src="${croppedPhotoDataURL}" alt="Foto profil">`
  preview.classList.add('has-photo')
 
  // Tutup crop modal
  document.getElementById('cropOverlay').classList.remove('open')
  document.body.style.overflow = ''
 
  // Re-render CV dengan foto baru
  renderCV()
}
 
function cancelCrop() {
  document.getElementById('cropOverlay').classList.remove('open')
  document.body.style.overflow = ''
  document.getElementById('cvPhotoInput').value = ''
}
 
/* ============================================================
   BATCH 3 JS — Kartu Nama Builder
   Tambahkan di bagian bawah script.js
   ============================================================ */

/* ── KARTU NAMA BUILDER ── */
let knTpl = 'clean'
let knLogoDataURL = null

// Rasio kartu nama landscape: 8.26 x 5.03 cm
// Canvas internal: 826 x 503 px (1px = 0.1cm, 96dpi friendly)
const KN_W = 992  // 8.26cm * 120
const KN_H = 604  // 5.03cm * 120

function openKartunama() {
  document.getElementById('knModal').classList.add('open')
  document.body.style.overflow = 'hidden'
  renderKN()
}

function closeKartunama() {
  document.getElementById('knModal').classList.remove('open')
  document.body.style.overflow = ''
}

function setKNTpl(t, btn) {
  knTpl = t
  document.querySelectorAll('#knModal .tpl-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  renderKN()
}

function handleKNLogo(input) {
  const file = input.files[0]
  if (!file) return
  const allowed = ['image/jpeg','image/png','image/webp','image/svg+xml']
  if (!allowed.includes(file.type)) {
    alert('Hanya JPG, PNG, WebP, atau SVG!')
    input.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran logo maksimal 5MB ya!')
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = e => {
    knLogoDataURL = e.target.result
    const prev = document.getElementById('knLogoPreview')
    prev.innerHTML = `<img src="${knLogoDataURL}" alt="logo">`
    prev.classList.add('has-logo')
    renderKN()
  }
  reader.readAsDataURL(file)
}

function knGv(id) { return (document.getElementById(id)||{}).value||'' }

function renderKN() {
  const canvas = document.getElementById('knCanvas')
  if (!canvas) return
  canvas.width = KN_W
  canvas.height = KN_H
  const ctx = canvas.getContext('2d')

  const company = knGv('knCompany') || 'Nama Perusahaan'
  const tagline  = knGv('knTagline')
  const name     = knGv('knName') || 'Nama Kamu'
  const role     = knGv('knRole')
  const phone    = knGv('knPhone')
  const email    = knGv('knEmail')
  const ig       = knGv('knIg')
  const web      = knGv('knWeb')

  if (knTpl === 'clean') {
    drawKNClean(ctx, { company, tagline, name, role, phone, email, ig, web })
  } else {
    drawKNModern(ctx, { company, tagline, name, role, phone, email, ig, web })
  }
}

/* ── Template 1: Clean Minimalist ── */
function drawKNClean(ctx, d) {
  const W = KN_W, H = KN_H

  // Background putih
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Accent line kiri
  ctx.fillStyle = '#10b981'
  ctx.fillRect(0, 0, 6, H)

  // Subtle wave pattern kanan bawah
  ctx.save()
  ctx.globalAlpha = 0.04
  ctx.fillStyle = '#0a0f1e'
  ctx.beginPath()
  ctx.ellipse(W * 0.85, H * 0.8, 260, 160, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(W * 0.9, H * 0.5, 200, 120, -0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Logo (kiri atas)
  const logoY = 52
  let textStartX = 48

  if (knLogoDataURL) {
    const logoImg = new Image()
    logoImg.src = knLogoDataURL
    const lSize = 80
    ctx.save()
    ctx.drawImage(logoImg, 40, logoY - lSize/2, lSize, lSize)
    ctx.restore()
    textStartX = 140
  }

  // Nama perusahaan
  ctx.fillStyle = '#0f172a'
  ctx.font = `bold ${knLogoDataURL ? 28 : 32}px "Sora", sans-serif`
  ctx.fillText(d.company, textStartX, logoY + 6)

  // Tagline
  if (d.tagline) {
    ctx.fillStyle = '#10b981'
    ctx.font = `400 16px "DM Sans", sans-serif`
    ctx.fillText(d.tagline, textStartX, logoY + 30)
  }

  // Divider
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(40, H / 2 - 20)
  ctx.lineTo(W - 40, H / 2 - 20)
  ctx.stroke()

  // Nama pemilik
  ctx.fillStyle = '#0f172a'
  ctx.font = `bold 30px "Sora", sans-serif`
  ctx.fillText(d.name, 40, H / 2 + 20)

  // Jabatan
  if (d.role) {
    ctx.fillStyle = '#64748b'
    ctx.font = `400 18px "DM Sans", sans-serif`
    ctx.fillText(d.role, 40, H / 2 + 46)
  }

  // Kontak — baris bawah
  ctx.fillStyle = '#334155'
  ctx.font = `400 16px "DM Sans", sans-serif`
  const contacts = []
  if (d.phone) contacts.push(`📱 ${d.phone}`)
  if (d.email) contacts.push(`✉ ${d.email}`)
  if (d.ig)    contacts.push(`ig: ${d.ig}`)
  if (d.web)   contacts.push(`🌐 ${d.web}`)

  const colW = (W - 80) / 2
  contacts.forEach((c, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    ctx.fillText(c, 40 + col * colW, H - 90 + row * 28)
  })

  // Watermark kecil welltion
  ctx.fillStyle = 'rgba(16,185,129,0.25)'
  ctx.font = `500 13px "Sora", sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText('— salamsenyum :)', W - 30, H - 22)
  ctx.textAlign = 'left'
}

/* ── Template 2: Modern Dark ── */
function drawKNModern(ctx, d) {
  const W = KN_W, H = KN_H

  // Background dark navy
  ctx.fillStyle = '#0a0f1e'
  ctx.fillRect(0, 0, W, H)

  // Glow kiri
  const gradL = ctx.createRadialGradient(0, H/2, 0, 0, H/2, 400)
  gradL.addColorStop(0, 'rgba(37,99,235,0.25)')
  gradL.addColorStop(1, 'transparent')
  ctx.fillStyle = gradL
  ctx.fillRect(0, 0, W, H)

  // Glow kanan
  const gradR = ctx.createRadialGradient(W, H, 0, W, H, 350)
  gradR.addColorStop(0, 'rgba(16,185,129,0.2)')
  gradR.addColorStop(1, 'transparent')
  ctx.fillStyle = gradR
  ctx.fillRect(0, 0, W, H)

  // Sidebar kiri emerald
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#10b981')
  grad.addColorStop(1, '#059669')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 8, H)

  // Logo area (kiri atas)
  let nameX = 40
  if (knLogoDataURL) {
    const logoImg = new Image()
    logoImg.src = knLogoDataURL
    // Invert logo untuk dark background
    ctx.save()
    ctx.filter = 'brightness(0) invert(1)'
    ctx.drawImage(logoImg, 30, 36, 70, 70)
    ctx.filter = 'none'
    ctx.restore()
    nameX = 116
  }

  // Nama perusahaan
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 28px "Sora", sans-serif`
  ctx.fillText(d.company, nameX, 70)

  // Tagline
  if (d.tagline) {
    ctx.fillStyle = '#34d399'
    ctx.font = `400 15px "DM Sans", sans-serif`
    ctx.fillText(d.tagline, nameX, 94)
  }

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(30, H/2 - 30)
  ctx.lineTo(W - 30, H/2 - 30)
  ctx.stroke()

  // Nama pemilik
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 32px "Sora", sans-serif`
  ctx.fillText(d.name, 30, H/2 + 16)

  // Jabatan
  if (d.role) {
    ctx.fillStyle = '#34d399'
    ctx.font = `500 17px "DM Sans", sans-serif`
    ctx.fillText(d.role, 30, H/2 + 42)
  }

  // Kontak
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = `400 15px "DM Sans", sans-serif`
  const contacts = []
  if (d.phone) contacts.push(`📱 ${d.phone}`)
  if (d.email) contacts.push(`✉ ${d.email}`)
  if (d.ig)    contacts.push(`ig: ${d.ig}`)
  if (d.web)   contacts.push(`🌐 ${d.web}`)

  const colW = (W - 60) / 2
  contacts.forEach((c, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    ctx.fillText(c, 30 + col * colW, H - 90 + row * 28)
  })

  // Watermark
  ctx.fillStyle = 'rgba(52,211,153,0.3)'
  ctx.font = `400 13px "Sora", sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText('— salamsenyum :)', W - 24, H - 20)
  ctx.textAlign = 'left'
}

/* ── DOWNLOAD KARTU NAMA ── */
function downloadKN() {
  const canvas = document.getElementById('knCanvas')
  if (!canvas) return

  // Render ulang sekali lagi untuk pastikan up to date
  renderKN()

  setTimeout(() => {
    const link = document.createElement('a')
    link.download = 'KartuNama-Welltion.png'
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
    showToast('✅ Kartu nama berhasil didownload!')
  }, 100)
}

/* ── HERO BRAND reveal ── */
document.addEventListener('DOMContentLoaded', () => {
  // Reveal hero brand
  setTimeout(() => {
    const hb = document.querySelector('.hero-brand')
    if (hb) hb.classList.add('visible')
  }, 100)

  // Init kartu nama canvas
  renderKN()
})
/* ============================================================
   AIO Downloader — app.js
   By Dafa 2026
   ============================================================ */

const API_BASE = 'https://api.theresav.biz.id';
const API_KEY  = 'LvpUR';

/* ---------- Canvas Background ---------- */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function spawnParticles() {
    particles = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Gradient blob
    const grad = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, W * 0.55);
    if (isDark()) {
      grad.addColorStop(0, 'rgba(232,197,71,0.07)');
      grad.addColorStop(0.5, 'rgba(240,112,64,0.04)');
      grad.addColorStop(1, 'transparent');
    } else {
      grad.addColorStop(0, 'rgba(200,146,15,0.06)');
      grad.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Second blob
    const grad2 = ctx.createRadialGradient(W * 0.75, H * 0.7, 0, W * 0.75, H * 0.7, W * 0.4);
    if (isDark()) {
      grad2.addColorStop(0, 'rgba(77,232,160,0.04)');
      grad2.addColorStop(1, 'transparent');
    } else {
      grad2.addColorStop(0, 'rgba(26,156,92,0.04)');
      grad2.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);

    // Particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isDark()
        ? `rgba(232,197,71,${p.alpha * 0.5})`
        : `rgba(200,146,15,${p.alpha * 0.35})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  spawnParticles();
  draw();
  window.addEventListener('resize', () => { resize(); spawnParticles(); });
})();

/* ---------- Theme Toggle ---------- */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

const savedTheme = localStorage.getItem('aiodl-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☾';

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('aiodl-theme', next);
  themeIcon.textContent = next === 'dark' ? '☀' : '☾';
});

/* ---------- Paste Button ---------- */
document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('urlInput').value = text;
    document.getElementById('urlInput').focus();
  } catch {
    document.getElementById('urlInput').focus();
  }
});

/* ---------- Platform Chips ---------- */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

/* ---------- Detect Platform ---------- */
function detectPlatform(url) {
  if (!url) return 'unknown';
  const u = url.toLowerCase();
  if (u.includes('tiktok.com') || u.includes('vt.tiktok'))  return 'TikTok';
  if (u.includes('instagram.com'))                           return 'Instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be'))  return 'YouTube';
  if (u.includes('twitter.com') || u.includes('x.com'))     return 'Twitter/X';
  if (u.includes('facebook.com') || u.includes('fb.'))      return 'Facebook';
  if (u.includes('soundcloud.com'))                          return 'SoundCloud';
  if (u.includes('capcut.com'))                              return 'CapCut';
  if (u.includes('spotify.com'))                             return 'Spotify';
  return 'Media';
}

/* ---------- Format File Size ---------- */
function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ---------- Format Duration ---------- */
function formatDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ---------- Quality Label ---------- */
function qualityLabel(q) {
  const map = {
    hd_no_watermark: '⬆ HD · No Watermark',
    no_watermark:    'No Watermark',
    watermark:       'With Watermark',
    audio:           '🎵 Audio',
    default:         'Standard',
  };
  return map[q] || q || 'Standard';
}

/* ---------- Force Download via Blob ---------- */
async function forceDownload(url, filename, btn) {
  const origText = btn.innerHTML;
  btn.innerHTML  = '<span class="dl-spin">⏳</span> Downloading...';
  btn.disabled   = true;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob     = await res.blob();
    const blobUrl  = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = blobUrl;
    a.download     = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    btn.innerHTML = '✓ Selesai!';
    setTimeout(() => { btn.innerHTML = origText; btn.disabled = false; }, 2500);
  } catch {
    // Fallback: buka di tab baru dengan header Content-Disposition via proxy trick
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.target   = '_blank';
    a.rel      = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    btn.innerHTML = origText;
    btn.disabled  = false;
  }
}

/* ---------- Build Media Item ---------- */
function buildMediaItem(media) {
  const isAudio = media.type === 'audio';
  const isImage = media.type === 'image' || ['jpg','jpeg','png','webp'].includes(media.extension);

  const typeClass = isAudio ? 'audio' : isImage ? 'image' : 'video';
  const typeEmoji = isAudio ? '🎵' : isImage ? '🖼' : '🎬';
  const btnClass  = isAudio ? 'audio-btn' : '';
  const label     = qualityLabel(media.quality);
  const sizeTxt   = media.data_size ? ` · ${formatSize(media.data_size)}` : '';
  const dimTxt    = media.width && media.height ? ` · ${media.width}×${media.height}` : '';
  const durTxt    = media.duration ? ` · ${formatDuration(media.duration)}` : '';
  const ext       = (media.extension || 'mp4').toLowerCase();
  const extLabel  = ext.toUpperCase();
  const filename  = `aiodl_${Date.now()}.${ext}`;

  const div = document.createElement('div');
  div.className = 'media-item';
  div.innerHTML = `
    <div class="media-left">
      <div class="media-type-icon ${typeClass}">${typeEmoji}</div>
      <div>
        <div class="media-label">${label}</div>
        <div class="media-meta">${extLabel}${dimTxt}${sizeTxt}${durTxt}</div>
      </div>
    </div>
    <button class="media-dl-btn ${btnClass}" data-url="${media.url}" data-filename="${filename}">
      ⬇ Download
    </button>
  `;

  // Attach click handler
  div.querySelector('.media-dl-btn').addEventListener('click', function () {
    forceDownload(this.dataset.url, this.dataset.filename, this);
  });

  return div;
}

/* ---------- Show Result ---------- */
function showResult(data) {
  const card     = document.getElementById('resultCard');
  const grid     = document.getElementById('mediaGrid');
  const platform = detectPlatform(data.url || '');

  document.getElementById('resultThumb').src     = data.thumbnail || '';
  document.getElementById('resultPlatform').textContent = platform;
  document.getElementById('resultTitle').textContent    = data.title || 'Untitled';
  document.getElementById('resultAuthor').textContent   = data.author ? `@${data.author}` : '';
  document.getElementById('resultDuration').textContent = data.duration
    ? `⏱ ${formatDuration(data.duration)}`
    : '';

  grid.innerHTML = '';
  const medias = data.medias || [];
  if (medias.length === 0) {
    grid.innerHTML = '<p style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono)">Tidak ada media ditemukan.</p>';
  } else {
    medias.forEach(m => grid.appendChild(buildMediaItem(m)));
  }

  card.style.display = 'block';
}

/* ---------- Show Error ---------- */
function showError(msg) {
  const card = document.getElementById('errorCard');
  document.getElementById('errorText').textContent = msg;
  card.style.display = 'flex';
}

/* ---------- Hide All Results ---------- */
function hideAll() {
  document.getElementById('resultCard').style.display  = 'none';
  document.getElementById('errorCard').style.display   = 'none';
  document.getElementById('statusBar').style.display   = 'none';
}

/* ---------- Set Status ---------- */
function setStatus(visible, text = 'Fetching media info...') {
  const bar = document.getElementById('statusBar');
  document.getElementById('statusText').textContent = text;
  bar.style.display = visible ? 'flex' : 'none';
}

/* ---------- Main Fetch ---------- */
async function fetchMedia(url) {
  hideAll();
  setStatus(true, 'Mendeteksi platform...');

  const btn = document.getElementById('downloadBtn');
  btn.classList.add('loading');
  btn.querySelector('.btn-label').textContent = 'Fetching...';

  try {
    const encoded = encodeURIComponent(url);
    setStatus(true, 'Mengambil info media...');

    const res = await fetch(
      `${API_BASE}/download/aio?url=${encoded}&apikey=${API_KEY}`
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    if (!json.status || !json.result) {
      throw new Error(json.message || 'Gagal mendapatkan data media.');
    }

    setStatus(false);
    showResult(json.result);

  } catch (err) {
    setStatus(false);
    const msg = err.message || 'Terjadi kesalahan, coba lagi.';
    if (err.message && err.message.includes('fetch')) {
      showError('Tidak dapat terhubung ke server API. Periksa koneksi internet.');
    } else {
      showError(msg);
    }
  } finally {
    btn.classList.remove('loading');
    btn.querySelector('.btn-label').textContent = 'Fetch Media';
  }
}

/* ---------- Download Button ---------- */
document.getElementById('downloadBtn').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) {
    document.getElementById('urlInput').focus();
    return;
  }
  if (!url.startsWith('http')) {
    showError('URL tidak valid. Pastikan dimulai dengan https://');
    return;
  }
  fetchMedia(url);
});

/* ---------- Enter Key ---------- */
document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('downloadBtn').click();
});

/* ---------- Clear on new input ---------- */
document.getElementById('urlInput').addEventListener('input', () => {
  document.getElementById('errorCard').style.display  = 'none';
  document.getElementById('resultCard').style.display = 'none';
});

/* ---------- PWA: Register Service Worker ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* ---------- PWA: Install Prompt ---------- */
let deferredPrompt = null;
const installBtn   = document.getElementById('installBtn');
const pwaBanner    = document.getElementById('pwaBanner');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'flex';
  setTimeout(() => {
    if (!localStorage.getItem('aiodl-pwa-dismissed')) {
      pwaBanner.style.display = 'flex';
    }
  }, 2500);
});

async function triggerInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
  pwaBanner.style.display  = 'none';
  if (outcome === 'accepted') localStorage.setItem('aiodl-pwa-dismissed', '1');
}

installBtn.addEventListener('click', triggerInstall);
document.getElementById('pwaBannerInstall').addEventListener('click', triggerInstall);
document.getElementById('pwaBannerDismiss').addEventListener('click', () => {
  pwaBanner.style.display = 'none';
  localStorage.setItem('aiodl-pwa-dismissed', '1');
});

window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  pwaBanner.style.display  = 'none';
});

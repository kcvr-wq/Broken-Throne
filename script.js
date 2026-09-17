// ============ شاشة الدخول ============
const splash = document.getElementById('splash');
const site = document.getElementById('site');
const enterBtn = document.getElementById('enterBtn');

function enterSite(){
  splash.classList.add('fade-out');
  setTimeout(() => {
    splash.classList.add('hidden');
    site.classList.remove('hidden');
  }, 750);
}

enterBtn.addEventListener('click', enterSite);

// إعادة عرض الدخولية من إعدادات الموقع
document.getElementById('replayIntro').addEventListener('click', () => {
  site.classList.add('hidden');
  splash.classList.remove('hidden', 'fade-out');
});

// ============ التنقل بين الصفحات ============
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
function goToPage(target){
  pages.forEach(p => p.classList.toggle('active', p.id === target));
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.target === target));
}

navLinks.forEach(link => {
  link.addEventListener('click', () => goToPage(link.dataset.target));
});

// أزرار الصفحة الرئيسية
document.getElementById('startReading').addEventListener('click', () => {
  goToPage('chapters');
  // TODO: اربط هذا الزر لاحقًا بأول فصل مباشرة
});

document.getElementById('continueReading').addEventListener('click', () => {
  goToPage('chapters');
  // TODO: اربط هذا الزر لاحقًا بآخر فصل توقف عنده القارئ
});

// ============ الفصول وواجهة القراءة ============
const chapterItems = document.querySelectorAll('.chapter-item');
const chaptersList = document.querySelector('.chapters-list');
const reader = document.getElementById('reader');
const readerTitle = document.getElementById('readerTitle');
const backToChapters = document.getElementById('backToChapters');

chapterItems.forEach(item => {
  item.addEventListener('click', () => {
    readerTitle.textContent = item.querySelector('.chapter-name').textContent;
    chaptersList.classList.add('hidden');
    reader.classList.remove('hidden');
    // TODO: اربط محتوى الفصل الحقيقي هنا حسب data-chapter
  });
});

backToChapters.addEventListener('click', () => {
  reader.classList.add('hidden');
  chaptersList.classList.remove('hidden');
  document.getElementById('readingSettingsPanel').classList.add('hidden');
});

// ============ إعدادات القراءة (منفصلة عن إعدادات الموقع) ============
const readingSettingsBtn = document.getElementById('readingSettingsBtn');
const readingSettingsPanel = document.getElementById('readingSettingsPanel');
const closeReadingSettings = document.getElementById('closeReadingSettings');
const readerText = document.getElementById('readerText');

readingSettingsBtn.addEventListener('click', () => {
  readingSettingsPanel.classList.toggle('hidden');
});
closeReadingSettings.addEventListener('click', () => {
  readingSettingsPanel.classList.add('hidden');
});

// حجم الخط
let fontSize = 1.15;
document.querySelectorAll('[data-font-step]').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = parseInt(btn.dataset.fontStep, 10);
    fontSize = Math.min(1.6, Math.max(0.9, fontSize + step * 0.1));
    readerText.style.fontSize = fontSize + 'rem';
  });
});

// تباعد الأسطر
let lineHeight = 2.1;
document.querySelectorAll('[data-line-step]').forEach(btn => {
  btn.addEventListener('click', () => {
    const step = parseInt(btn.dataset.lineStep, 10);
    lineHeight = Math.min(3, Math.max(1.4, lineHeight + step * 0.15));
    readerText.style.lineHeight = lineHeight;
  });
});

// خلفية القراءة
document.querySelectorAll('[data-reader-theme]').forEach(btn => {
  btn.addEventListener('click', () => {
    readerText.classList.remove('theme-dark', 'theme-sepia', 'theme-light');
    readerText.classList.add('theme-' + btn.dataset.readerTheme);
    document.querySelectorAll('[data-reader-theme]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// نوع الخط
document.querySelectorAll('[data-reader-font]').forEach(btn => {
  btn.addEventListener('click', () => {
    readerText.classList.remove('font-cairo', 'font-ruqaa');
    readerText.classList.add('font-' + btn.dataset.readerFont);
    document.querySelectorAll('[data-reader-font]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// حالة افتراضية لواجهة القراءة
readerText.classList.add('theme-dark', 'font-cairo');

// ============ إعدادات الموقع العامة ============
const animationsToggle = document.getElementById('animationsToggle');
animationsToggle.addEventListener('change', () => {
  document.documentElement.style.setProperty(
    '--transition-speed',
    animationsToggle.checked ? '0.3s' : '0s'
  );
  document.body.classList.toggle('no-animations', !animationsToggle.checked);
});

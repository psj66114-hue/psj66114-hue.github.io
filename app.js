/**
 * Google Style Homepage Engine
 * Features:
 * - Real-time Weather for Seoul & Jeju (Open-Meteo API + Fallbacks)
 * - Google Search Engine with Autocomplete, Clear, and Voice Search
 * - Daily Quotes with Random Shuffle & Copy
 * - Real-time Clock & Date
 * - Google Dark/Light Mode Theme Toggle
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTheme();
  initGoogleSearch();
  initWeather();
  initQuotes();
});

/* ==========================================================================
   1. Real-time Clock & Date
   ========================================================================== */
function initClock() {
  const clockTime = document.getElementById('clockTime');
  const clockDate = document.getElementById('clockDate');

  function update() {
    const now = new Date();
    
    // Time format: 오후 01:23:45 or 13:23:45
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockTime.textContent = `${hours}:${minutes}:${seconds}`;

    // Date format: 2026년 10월 5일 (월)
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayName = days[now.getDay()];

    clockDate.textContent = `${year}년 ${month}월 ${date}일 (${dayName})`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. Dark / Light Mode Theme
   ========================================================================== */
function initTheme() {
  const html = document.documentElement;
  const btnToggle = document.getElementById('btn-theme-toggle');
  const iconSun = document.getElementById('themeIconSun');
  const iconMoon = document.getElementById('themeIconMoon');

  const savedTheme = localStorage.getItem('google_home_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(savedTheme);

  btnToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('google_home_theme', nextTheme);
  });

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    } else {
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    }
  }
}

/* ==========================================================================
   3. Google Search Engine (Autocomplete, Voice, Clear, Lucky)
   ========================================================================== */
function initGoogleSearch() {
  const form = document.getElementById('googleSearchForm');
  const input = document.getElementById('gSearchInput');
  const btnClear = document.getElementById('btnClearSearch');
  const btnLucky = document.getElementById('btnLucky');
  const btnVoice = document.getElementById('btnVoiceSearch');
  const btnLens = document.getElementById('btnLensSearch');
  const dropdown = document.getElementById('searchSuggestions');

  const POPULAR_SUGGESTIONS = [
    "오늘의 날씨",
    "서울 날씨 예보",
    "제주도 가볼만한 곳",
    "유튜브 바로가기",
    "구글 번역기",
    "네이버 지도",
    "인기 뉴스 헤드라인",
    "챗GPT 활용법",
    "오늘의 환율 정보",
    "프로그래밍 기초 강좌"
  ];

  // Show/Hide Clear button and Suggestions
  input.addEventListener('input', () => {
    const val = input.value.trim();
    btnClear.classList.toggle('visible', val.length > 0);

    if (val.length === 0) {
      dropdown.classList.remove('open');
      return;
    }

    const matches = POPULAR_SUGGESTIONS.filter(item => 
      item.toLowerCase().includes(val.toLowerCase())
    );

    if (matches.length > 0) {
      dropdown.innerHTML = matches.map(text => `
        <div class="search-dropdown-item" data-query="${escapeHtml(text)}">
          <span class="icon">🔍</span>
          <span>${highlightMatch(text, val)}</span>
        </div>
      `).join('');
      dropdown.classList.add('open');
    } else {
      dropdown.innerHTML = `
        <div class="search-dropdown-item" data-query="${escapeHtml(val)}">
          <span class="icon">🔍</span>
          <span><strong>${escapeHtml(val)}</strong> 검색하기</span>
        </div>
      `;
      dropdown.classList.add('open');
    }

    // Attach click handlers on suggestions
    dropdown.querySelectorAll('.search-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const query = item.getAttribute('data-query');
        input.value = query;
        dropdown.classList.remove('open');
        form.submit();
      });
    });
  });

  // Clear button click
  btnClear.addEventListener('click', () => {
    input.value = '';
    btnClear.classList.remove('visible');
    dropdown.classList.remove('open');
    input.focus();
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // I'm Feeling Lucky button
  btnLucky.addEventListener('click', () => {
    const query = input.value.trim();
    if (query) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`;
    } else {
      window.location.href = `https://www.google.com/doodles`;
    }
  });

  // Voice Search (Speech Recognition)
  btnVoice.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("이 브라우저는 음성 인식을 지원하지 않습니다. 마이크를 지원하는 브라우저를 이용해주세요.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.interimResults = false;

      showToast("음성을 듣고 있습니다... 말씀해주세요 🎙️");

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        btnClear.classList.add('visible');
        showToast(`인식됨: "${transcript}"`);
        setTimeout(() => form.submit(), 600);
      };

      recognition.onerror = () => {
        showToast("음성 인식이 취소되었거나 오류가 발생했습니다.");
      };

      recognition.start();
    } catch (e) {
      showToast("마이크 권한을 확인해주세요.");
    }
  });

  // Lens Search
  btnLens.addEventListener('click', () => {
    showToast("Google 렌즈 이미지 검색 페이지로 이동합니다.");
    setTimeout(() => {
      window.open('https://images.google.com/', '_blank');
    }, 500);
  });
}

function highlightMatch(text, query) {
  const reg = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(reg, '<b>$1</b>');
}

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

/* ==========================================================================
   4. Weather Engine (Seoul & Jeju) via Open-Meteo API
   ========================================================================== */
const CITIES = {
  seoul: {
    name: "서울",
    lat: 37.5665,
    lon: 126.9780,
    fallback: { temp: 19.5, code: 1, min: 14, max: 23, wind: 9.4, humidity: 45 }
  },
  jeju: {
    name: "제주",
    lat: 33.4996,
    lon: 126.5312,
    fallback: { temp: 22.0, code: 2, min: 18, max: 24, wind: 14.2, humidity: 62 }
  }
};

const WMO_WEATHER_MAP = {
  0: { desc: "맑음", icon: "☀️" },
  1: { desc: "대체로 맑음", icon: "🌤️" },
  2: { desc: "구름 조금", icon: "⛅" },
  3: { desc: "흐림", icon: "☁️" },
  45: { desc: "안개", icon: "🌫️" },
  48: { desc: "상해 안개", icon: "🌫️" },
  51: { desc: "약한 이슬비", icon: "🌦️" },
  53: { desc: "이슬비", icon: "🌧️" },
  55: { desc: "강한 이슬비", icon: "🌧️" },
  61: { desc: "약한 비", icon: "🌧️" },
  63: { desc: "비", icon: "🌧️" },
  65: { desc: "강한 비", icon: "🌧️" },
  71: { desc: "약한 눈", icon: "🌨️" },
  73: { desc: "눈", icon: "❄️" },
  75: { desc: "강한 눈", icon: "❄️" },
  80: { desc: "약한 소나기", icon: "🌦️" },
  81: { desc: "소나기", icon: "⛈️" },
  82: { desc: "강한 소나기", icon: "⛈️" },
  95: { desc: "뇌우", icon: "⚡" },
  96: { desc: "우박을 동반한 뇌우", icon: "⛈️" },
  99: { desc: "강한 뇌우", icon: "⛈️" }
};

function initWeather() {
  const btnRefresh = document.getElementById('btnRefreshWeather');

  loadAllWeather();

  btnRefresh.addEventListener('click', () => {
    btnRefresh.classList.add('spinning');
    loadAllWeather().finally(() => {
      setTimeout(() => {
        btnRefresh.classList.remove('spinning');
        showToast("날씨 정보가 최신 상태로 갱신되었습니다.");
      }, 600);
    });
  });

  // Auto-refresh every 10 minutes
  setInterval(loadAllWeather, 10 * 60 * 1000);
}

async function loadAllWeather() {
  await Promise.all([
    fetchCityWeather('seoul'),
    fetchCityWeather('jeju')
  ]);
}

async function fetchCityWeather(cityKey) {
  const city = CITIES[cityKey];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`;

  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    const current = data.current_weather;
    const daily = data.daily;

    const temp = Math.round(current.temperature * 10) / 10;
    const code = current.weathercode;
    const wind = current.windspeed;
    const max = Math.round(daily.temperature_2m_max[0]);
    const min = Math.round(daily.temperature_2m_min[0]);

    renderCityWeather(cityKey, { temp, code, min, max, wind });
  } catch (err) {
    console.warn(`Weather API request failed for ${city.name}, using cached fallback.`, err);
    renderCityWeather(cityKey, city.fallback);
  }
}

function renderCityWeather(cityKey, data) {
  const capitalKey = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
  const info = WMO_WEATHER_MAP[data.code] || { desc: "대체로 맑음", icon: "🌤️" };

  const tempEl = document.getElementById(`temp${capitalKey}`);
  const iconEl = document.getElementById(`icon${capitalKey}`);
  const descEl = document.getElementById(`desc${capitalKey}`);
  const maxEl = document.getElementById(`max${capitalKey}`);
  const minEl = document.getElementById(`min${capitalKey}`);
  const windEl = document.getElementById(`wind${capitalKey}`);
  const timeEl = document.getElementById(`time${capitalKey}`);

  if (tempEl) tempEl.textContent = data.temp;
  if (iconEl) iconEl.textContent = info.icon;
  if (descEl) descEl.textContent = info.desc;
  if (maxEl) maxEl.textContent = `${data.max}°`;
  if (minEl) minEl.textContent = `${data.min}°`;
  if (windEl) windEl.textContent = `💨 풍속: ${data.wind} km/h`;

  if (timeEl) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes} 갱신`;
  }
}

/* ==========================================================================
   5. Daily Quotes (오늘의 명언)
   ========================================================================== */
const QUOTES = [
  { text: "시작이 반이다. 작은 한 걸음이 모든 위대한 변화의 출발점이다.", author: "아리스토텔레스" },
  { text: "단순함이 궁극의 정교함이다.", author: "레오나르도 다빈치" },
  { text: "오늘 할 수 있는 일을 내일로 미루지 마라.", author: "벤저민 프랭클린" },
  { text: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기증세이다.", author: "알베르트 아인슈타인" },
  { text: "우리가 두려워해야 할 유일한 것은 두려움 그 자체다.", author: "프랭클린 D. 루스벨트" },
  { text: "자신을 믿어라. 자신의 능력을 신뢰하라. 겸손하지만 합리적인 자신감 없이는 성공할 수도 행복할 수도 없다.", author: "노먼 빈센트 필" },
  { text: "끝까지 해보기 전까지는 늘 불가능해 보인다.", author: "넬슨 만델라" },
  { text: "미래를 예측하는 가장 좋은 방법은 미래를 직접 창조하는 것이다.", author: "피터 드러커" },
  { text: "살아있는 한 꿈을 잃지 마라. 희망은 우리를 앞으로 나아가게 하는 등불이다.", author: "헬렌 켈러" },
  { text: "성공이란 열정을 잃지 않고 실패를 거듭할 수 있는 능력이다.", author: "윈스턴 처칠" },
  { text: "인생은 속도가 아니라 방향이다.", author: "괴테" },
  { text: "가장 어두운 밤도 언젠가는 끝나고 해는 떠오를 것이다.", author: "빅토르 위고" },
  { text: "지혜로운 자는 배우기를 멈추지 않는다.", author: "공자" },
  { text: "배움에는 끝이 없고 실천에는 망설임이 없어야 한다.", author: "율곡 이이" }
];

let currentQuoteIndex = 0;

function initQuotes() {
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const btnNext = document.getElementById('btnNextQuote');
  const btnCopy = document.getElementById('btnCopyQuote');

  // Random initial quote
  currentQuoteIndex = Math.floor(Math.random() * QUOTES.length);
  renderQuote();

  btnNext.addEventListener('click', () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * QUOTES.length);
    } while (nextIndex === currentQuoteIndex && QUOTES.length > 1);

    currentQuoteIndex = nextIndex;
    renderQuote();
  });

  btnCopy.addEventListener('click', () => {
    const q = QUOTES[currentQuoteIndex];
    const fullText = `"${q.text}" - ${q.author}`;
    navigator.clipboard.writeText(fullText).then(() => {
      showToast("명언이 클립보드에 복사되었습니다! 📋");
    }).catch(() => {
      showToast("복사 실패. 브라우저 설정을 확인해주세요.");
    });
  });

  function renderQuote() {
    const q = QUOTES[currentQuoteIndex];
    quoteText.style.opacity = '0';
    quoteAuthor.style.opacity = '0';

    setTimeout(() => {
      quoteText.textContent = q.text;
      quoteAuthor.textContent = `- ${q.author}`;
      quoteText.style.transition = 'opacity 0.25s ease';
      quoteAuthor.style.transition = 'opacity 0.25s ease';
      quoteText.style.opacity = '1';
      quoteAuthor.style.opacity = '1';
    }, 150);
  }
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

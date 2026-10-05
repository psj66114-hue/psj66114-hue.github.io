/**
 * Google Style Start Page - Main Application Logic
 * Features:
 * - Real-time Weather for Seoul & Jeju via Open-Meteo
 * - Google Search Engine integration with keyboard shortcuts
 * - Curated Quote of the Day with shuffle & clipboard copy
 * - Live clock & time-aware dynamic greeting
 * - Dark / Light theme toggle with local storage persistence
 */

// ============================================================================
// 1. Quotes Collection (명언 모음)
// ============================================================================
const QUOTES_DATABASE = [
  {
    text: "미래를 예측하는 가장 좋은 방법은 스스로 미래를 만들어가는 것이다.",
    author: "피터 드러커 (Peter Drucker)",
    tag: "도전과 성장"
  },
  {
    text: "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 당신이 옳다.",
    author: "헨리 포드 (Henry Ford)",
    tag: "신념과 의지"
  },
  {
    text: "배움에는 끝이 없다. 호기심을 잃지 않는 한 청춘은 영원하다.",
    author: "알베르트 아인슈타인 (Albert Einstein)",
    tag: "배움과 탐구"
  },
  {
    text: "오늘 걷지 않으면 내일은 뛰어야 한다.",
    author: "카를레스 푸욜",
    tag: "성실과 실천"
  },
  {
    text: "위대한 일을 하는 유일한 방법은 당신이 하는 일을 진정으로 사랑하는 것이다.",
    author: "스티브 잡스 (Steve Jobs)",
    tag: "열정과 혁신"
  },
  {
    text: "어디로 가고 있는지 모른다면, 어떤 길을 가도 상관없다. 목표를 세워라.",
    author: "루이스 캐럴 (이상한 나라의 앨리스)",
    tag: "목표와 방향"
  },
  {
    text: "바람이 불지 않을 때 바람개비를 돌리는 방법은 앞으로 달려가는 것이다.",
    author: "데일 카네기 (Dale Carnegie)",
    tag: "실천과 행동"
  },
  {
    text: "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기증세이다.",
    author: "알베르트 아인슈타인",
    tag: "변화와 결단"
  },
  {
    text: "지식에 투자하는 것이 언제나 최고의 이자를 낸다.",
    author: "벤저민 프랭클린 (Benjamin Franklin)",
    tag: "교육과 투자"
  },
  {
    text: "가장 어두운 밤도 언젠가는 끝나고 해는 다시 떠오른다.",
    author: "빅토르 위고 (레 미제라블)",
    tag: "희망과 위로"
  },
  {
    text: "시작하는 방법은 말하는 것을 그만두고 행동을 시작하는 것이다.",
    author: "월트 디즈니 (Walt Disney)",
    tag: "시작의 힘"
  },
  {
    text: "배우고 때때로 익히면 또한 기쁘지 아니한가.",
    author: "공자 (논어)",
    tag: "학습의 즐거움"
  },
  {
    text: "당신이 세상을 바꿀 수 없다고 말하는 사람은 두 종류다. 시도하기를 두려워하는 자와 당신이 성공할까 봐 두려워하는 자.",
    author: "레이 고포스",
    tag: "도전과 용기"
  },
  {
    text: "모든 성취의 시작점은 갈망이다.",
    author: "나폴레온 힐 (Napoleon Hill)",
    tag: "동기부여"
  },
  {
    text: "실패를 두려워하지 말라. 실패는 성공을 향해 나아가는 소중한 과정이다.",
    author: "넬슨 만델라 (Nelson Mandela)",
    tag: "극복과 끈기"
  },
  {
    text: "디지털 시대의 문맹은 글을 못 읽는 사람이 아니라, 배우고 버리고 다시 배우지 못하는 사람이다.",
    author: "앨빈 토플러 (Alvin Toffler)",
    tag: "디지털 배움"
  },
  {
    text: "지금 이 순간이 당신의 남은 인생의 첫날이다.",
    author: "아메리칸 인디언 격언",
    tag: "새로운 시작"
  },
  {
    text: "인생은 속도가 아니라 방향이다.",
    author: "괴테 (J. W. von Goethe)",
    tag: "삶의 지혜"
  }
];

// ============================================================================
// 2. Weather Engine (Open-Meteo API for Seoul & Jeju)
// ============================================================================
const CITIES = {
  seoul: {
    name: "서울",
    lat: 37.5665,
    lon: 126.9780,
    elementId: "weather-seoul"
  },
  jeju: {
    name: "제주",
    lat: 33.4996,
    lon: 126.5312,
    elementId: "weather-jeju"
  }
};

/**
 * Interpret WMO weather interpretation code into icon & text
 */
function interpretWmoCode(code) {
  switch (code) {
    case 0:
      return { icon: "☀️", label: "맑음", color: "#fbbc04" };
    case 1:
      return { icon: "🌤️", label: "대체로 맑음", color: "#fbbc04" };
    case 2:
      return { icon: "⛅", label: "구름 조금", color: "#9aa0a6" };
    case 3:
      return { icon: "☁️", label: "흐림", color: "#80868b" };
    case 45:
    case 48:
      return { icon: "🌫️", label: "안개", color: "#9aa0a6" };
    case 51:
    case 53:
    case 55:
      return { icon: "🌦️", label: "이슬비", color: "#4285f4" };
    case 61:
    case 63:
    case 65:
      return { icon: "🌧️", label: "비", color: "#1a73e8" };
    case 71:
    case 73:
    case 75:
    case 77:
      return { icon: "❄️", label: "눈", color: "#8ab4f8" };
    case 80:
    case 81:
    case 82:
      return { icon: "🌦️", label: "소나기", color: "#4285f4" };
    case 95:
    case 96:
    case 99:
      return { icon: "⛈️", label: "뇌우", color: "#ea4335" };
    default:
      return { icon: "🌤️", label: "맑음", color: "#fbbc04" };
  }
}

async function fetchCityWeather(cityKey) {
  const city = CITIES[cityKey];
  const container = document.getElementById(city.elementId);
  if (!container) return;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FSeoul`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather fetch failed: ${response.status}`);
    const data = await response.json();

    const current = data.current;
    const temp = Math.round(current.temperature_2m * 10) / 10;
    const humidity = current.relative_humidity_2m;
    const weatherInfo = interpretWmoCode(current.weather_code);

    container.innerHTML = `
      <span class="city-name">${city.name}</span>
      <span class="weather-icon" title="${weatherInfo.label}">${weatherInfo.icon}</span>
      <span class="temp">${temp}°C</span>
      <span class="condition">${weatherInfo.label}</span>
    `;
    container.setAttribute("title", `${city.name} 현재 기온 ${temp}°C, 습도 ${humidity}%, ${weatherInfo.label}`);
  } catch (error) {
    console.warn(`Weather fetch fallback for ${city.name}:`, error);
    container.innerHTML = `
      <span class="city-name">${city.name}</span>
      <span class="weather-icon">🌤️</span>
      <span class="temp">19°C</span>
      <span class="condition">맑음</span>
    `;
  }
}

async function updateAllWeather() {
  const refreshBtn = document.getElementById("weatherRefreshBtn");
  if (refreshBtn) refreshBtn.classList.add("rotating");

  try {
    await Promise.all([
      fetchCityWeather("seoul"),
      fetchCityWeather("jeju")
    ]);
  } finally {
    if (refreshBtn) {
      setTimeout(() => {
        refreshBtn.classList.remove("rotating");
      }, 600);
    }
  }
}

// ============================================================================
// 3. Quotes Management
// ============================================================================
let currentQuoteIndex = 0;

function getDailyQuoteIndex() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return dayOfYear % QUOTES_DATABASE.length;
}

function displayQuote(index, animate = false) {
  const quoteTextEl = document.getElementById("quoteText");
  const quoteAuthorEl = document.getElementById("quoteAuthor");
  const quoteTagEl = document.getElementById("quoteTag");

  if (!quoteTextEl || !quoteAuthorEl) return;

  const quote = QUOTES_DATABASE[index];
  currentQuoteIndex = index;

  if (animate) {
    quoteTextEl.style.opacity = "0";
    quoteAuthorEl.style.opacity = "0";

    setTimeout(() => {
      quoteTextEl.textContent = `"${quote.text}"`;
      quoteAuthorEl.textContent = quote.author;
      if (quoteTagEl) quoteTagEl.textContent = quote.tag;

      quoteTextEl.style.opacity = "1";
      quoteAuthorEl.style.opacity = "1";
    }, 180);
  } else {
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = quote.author;
    if (quoteTagEl) quoteTagEl.textContent = quote.tag;
  }
}

function nextQuote() {
  let nextIdx = (currentQuoteIndex + 1) % QUOTES_DATABASE.length;
  displayQuote(nextIdx, true);
}

function copyCurrentQuote() {
  const quote = QUOTES_DATABASE[currentQuoteIndex];
  const copyText = `"${quote.text}" - ${quote.author} (서울디지털대학교 시작홈)`;

  navigator.clipboard.writeText(copyText).then(() => {
    showToast("명언이 클립보드에 복사되었습니다! ✨");
  }).catch(() => {
    showToast("복사에 실패했습니다.");
  });
}

// ============================================================================
// 4. Clock & Dynamic Greetings
// ============================================================================
function updateClockAndGreeting() {
  const clockEl = document.getElementById("headerClock");
  const greetingEl = document.getElementById("greetingText");
  const dateEl = document.getElementById("greetingDate");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[now.getDay()];

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  if (dateEl) {
    dateEl.textContent = `${year}년 ${month}월 ${date}일 (${dayName}요일)`;
  }

  if (greetingEl) {
    let greeting = "";
    if (hours >= 5 && hours < 11) {
      greeting = "상쾌한 아침입니다, 활기찬 하루 되세요! ☀️";
    } else if (hours >= 11 && hours < 14) {
      greeting = "맛있는 점심 식사 하시고 힘내세요! 🥪";
    } else if (hours >= 14 && hours < 18) {
      greeting = "집중하기 좋은 오후, 오늘도 응원합니다! ☕";
    } else if (hours >= 18 && hours < 22) {
      greeting = "편안하고 알찬 저녁 시간 보내세요 🌙";
    } else {
      greeting = "오늘 하루도 수고 많으셨습니다. 편안한 밤 되세요 ✨";
    }
    greetingEl.textContent = greeting;
  }
}

// ============================================================================
// 5. Search Engine & Google Actions
// ============================================================================
function initSearch() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  const luckyBtn = document.getElementById("feelingLuckyBtn");

  if (!searchForm || !searchInput) return;

  // Toggle clear button
  searchInput.addEventListener("input", () => {
    if (clearBtn) {
      if (searchInput.value.trim().length > 0) {
        clearBtn.classList.add("visible");
      } else {
        clearBtn.classList.remove("visible");
      }
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.classList.remove("visible");
      searchInput.focus();
    });
  }

  // Handle Form Submit
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  });

  // I'm Feeling Lucky Action
  if (luckyBtn) {
    luckyBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        // Direct Google I'm Feeling Lucky search
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`;
      } else {
        // If empty, reveal a fresh inspirational quote with lucky alert
        nextQuote();
        showToast("행운의 오늘의 명언이 새로고침 되었습니다! 🍀");
      }
    });
  }

  // Quick shortcut: Press '/' key anywhere to focus search input
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
}

// ============================================================================
// 6. Theme Switching (Light / Dark Mode)
// ============================================================================
function initTheme() {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");

  // Determine saved or system preferred theme
  const savedTheme = localStorage.getItem("sdu_theme");
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem("sdu_theme", newTheme);
      showToast(`${newTheme === "dark" ? "다크 모드" : "라이트 모드"}로 전환되었습니다.`);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (sunIcon && moonIcon) {
      if (theme === "dark") {
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
      } else {
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
      }
    }
  }
}

// ============================================================================
// 7. Toast Notification Helper
// ============================================================================
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// ============================================================================
// 8. Application Initialization
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Theme setup
  initTheme();

  // Search setup
  initSearch();

  // Initial quote (today's quote)
  displayQuote(getDailyQuoteIndex(), false);

  const nextQuoteBtn = document.getElementById("nextQuoteBtn");
  if (nextQuoteBtn) {
    nextQuoteBtn.addEventListener("click", nextQuote);
  }

  const copyQuoteBtn = document.getElementById("copyQuoteBtn");
  if (copyQuoteBtn) {
    copyQuoteBtn.addEventListener("click", copyCurrentQuote);
  }

  // Weather setup
  updateAllWeather();
  const weatherRefreshBtn = document.getElementById("weatherRefreshBtn");
  if (weatherRefreshBtn) {
    weatherRefreshBtn.addEventListener("click", updateAllWeather);
  }
  // Periodically refresh weather every 20 minutes
  setInterval(updateAllWeather, 20 * 60 * 1000);

  // Clock & Greeting setup
  updateClockAndGreeting();
  setInterval(updateClockAndGreeting, 1000);
});

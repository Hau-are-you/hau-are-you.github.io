// ====== 可調參數 ======
const MIN_SPEED = 0.5
const MAX_SPEED = 2
const FOLLOW_EASE = 0.02  // 跟隨平滑度（0.08 ~ 0.25 之間較自然）
const CENTER_ON_CURSOR = true // true = 以 blob 中心對齊滑鼠

// ====== 小工具 ======
function randomNumber(min, max) {
  return Math.random() * (max - min) + min
}

// ====== 自由漂浮 Blob（2–7號用）======
class Blob {
  constructor(el) {
    this.el = el
    const boundingRect = this.el.getBoundingClientRect()
    this.size = boundingRect.width

    // 隨機初始位置
    this.initialX = randomNumber(0, Math.max(0, window.innerWidth - this.size))
    this.initialY = randomNumber(0, Math.max(0, window.innerHeight - this.size))
    this.el.style.top = `${this.initialY}px`
    this.el.style.left = `${this.initialX}px`

    // 隨機速度向量
    this.vx = randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1)
    this.vy = randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1)

    this.x = this.initialX
    this.y = this.initialY
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    // 牆反彈
    if (this.x >= window.innerWidth - this.size) {
      this.x = window.innerWidth - this.size
      this.vx *= -1
    }
    if (this.y >= window.innerHeight - this.size) {
      this.y = window.innerHeight - this.size
      this.vy *= -1
    }
    if (this.x <= 0) {
      this.x = 0
      this.vx *= -1
    }
    if (this.y <= 0) {
      this.y = 0
      this.vy *= -1
    }

    // 相對初始位移（避免累積誤差）
    this.el.style.transform =
      `translate(${this.x - this.initialX}px, ${this.y - this.initialY}px)`
  }
}

// ====== 跟鼠標 Blob（1號用）======
class CursorFollower {
  constructor(el) {
    this.el = el
    // 初始放在(0,0)，用 transform 做移動
    this.el.style.top = '0px'
    this.el.style.left = '0px'

    const rect = this.el.getBoundingClientRect()
    this.size = rect.width

    // 當前位置（用於平滑追蹤）
    this.cx = window.innerWidth / 2
    this.cy = window.innerHeight / 2

    // 目標位置（滑鼠/觸控）
    this.tx = this.cx
    this.ty = this.cy

    // 綁定事件
    this._bindEvents()
  }

  _bindEvents() {
    // 滑鼠
    document.addEventListener('mousemove', (e) => {
      this.tx = e.clientX
      this.ty = e.clientY
    }, { passive: true })

    // 觸控（取第一點）
    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.tx = e.touches[0].clientX
        this.ty = e.touches[0].clientY
      }
    }, { passive: true })

    // 視窗縮放更新尺寸
    window.addEventListener('resize', () => {
      const rect = this.el.getBoundingClientRect()
      this.size = rect.width
    })
  }

  update() {
    // 線性插值（慣性效果）
    this.cx += (this.tx - this.cx) * FOLLOW_EASE
    this.cy += (this.ty - this.cy) * FOLLOW_EASE

    // 是否以中心對齊
    const offsetX = CENTER_ON_CURSOR ? this.size / 2 : 0
    const offsetY = CENTER_ON_CURSOR ? this.size / 2 : 0

    this.el.style.transform = `translate(${this.cx - offsetX}px, ${this.cy - offsetY}px)`
  }
}

// ====== 初始化 ======
function initBlobs() {
  const blobEls = document.querySelectorAll('.blob')
  if (!blobEls.length) return

  // 1號 blob → 跟隨滑鼠
  const follower = new CursorFollower(blobEls[0])

  // 2–7號 blob → 自由漂浮
  const floaters = Array.from(blobEls)
    .slice(1)
    .map((el) => new Blob(el))

  function tick() {
    requestAnimationFrame(tick)
    follower.update()
    floaters.forEach((b) => b.update())
  }
  requestAnimationFrame(tick)
}

initBlobs()


// reveal in Home Page
document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('in-view'));
    return;
  }

  let armed = false;
  let io = null;

  function armObserver() {
    if (armed) return;
    armed = true;

    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 進入視窗：加 .in-view（會重播動畫）
          entry.target.classList.add('in-view');
        } else {
          // 離開視窗：移除 .in-view（下次再入再播）
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      root: null,
      // 提前少少觸發，避免貼邊先出現；也減少進出抖動
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    });

    revealEls.forEach(el => io.observe(el));
  }

  let lastScrollY = window.scrollY;
  function onFirstScroll() {
    const now = window.scrollY;
    if (now > lastScrollY || now > 0) {
      armObserver();
      window.removeEventListener('scroll', onFirstScroll, { passive: true });
      window.removeEventListener('wheel', onFirstScroll, { passive: true });
      window.removeEventListener('touchmove', onFirstScroll, { passive: true });
    }
    lastScrollY = now;
  }

  window.addEventListener('scroll', onFirstScroll, { passive: true });
  window.addEventListener('wheel', onFirstScroll, { passive: true });
  window.addEventListener('touchmove', onFirstScroll, { passive: true });

  if (window.location.hash || window.scrollY > 0) armObserver();
});





// scroll photo 
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // ✅ 只執行一次
      }
    });
  }, {
    threshold: 0.2   // 20% 卡片出現在 viewport 時觸發
  });

  cards.forEach(card => observer.observe(card));
});
if (entry.isIntersecting) {
  const delay = Array.from(cards).indexOf(entry.target) * 100; // 每張延遲 0.1s
  entry.target.style.transitionDelay = `${delay}ms`;
  entry.target.classList.add("visible");
  observer.unobserve(entry.target);
}



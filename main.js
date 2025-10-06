
const MIN_SPEED = 0.5
const MAX_SPEED = 2
const FOLLOW_EASE = 0.02  
const CENTER_ON_CURSOR = true


function randomNumber(min, max) {
  return Math.random() * (max - min) + min
}


class Blob {
  constructor(el) {
    this.el = el
    const boundingRect = this.el.getBoundingClientRect()
    this.size = boundingRect.width


    this.initialX = randomNumber(0, Math.max(0, window.innerWidth - this.size))
    this.initialY = randomNumber(0, Math.max(0, window.innerHeight - this.size))
    this.el.style.top = `${this.initialY}px`
    this.el.style.left = `${this.initialX}px`


    this.vx = randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1)
    this.vy = randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1)

    this.x = this.initialX
    this.y = this.initialY
  }

  update() {
    this.x += this.vx
    this.y += this.vy


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


    this.el.style.transform =
      `translate(${this.x - this.initialX}px, ${this.y - this.initialY}px)`
  }
}


class CursorFollower {
  constructor(el) {
    this.el = el

    this.el.style.top = '0px'
    this.el.style.left = '0px'

    const rect = this.el.getBoundingClientRect()
    this.size = rect.width


    this.cx = window.innerWidth / 2
    this.cy = window.innerHeight / 2


    this.tx = this.cx
    this.ty = this.cy


    this._bindEvents()
  }

  _bindEvents() {

    document.addEventListener('mousemove', (e) => {
      this.tx = e.clientX
      this.ty = e.clientY
    }, { passive: true })

    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.tx = e.touches[0].clientX
        this.ty = e.touches[0].clientY
      }
    }, { passive: true })


    window.addEventListener('resize', () => {
      const rect = this.el.getBoundingClientRect()
      this.size = rect.width
    })
  }

  update() {

    this.cx += (this.tx - this.cx) * FOLLOW_EASE
    this.cy += (this.ty - this.cy) * FOLLOW_EASE


    const offsetX = CENTER_ON_CURSOR ? this.size / 2 : 0
    const offsetY = CENTER_ON_CURSOR ? this.size / 2 : 0

    this.el.style.transform = `translate(${this.cx - offsetX}px, ${this.cy - offsetY}px)`
  }
}


function initBlobs() {
  const blobEls = document.querySelectorAll('.blob')
  if (!blobEls.length) return


  const follower = new CursorFollower(blobEls[0])


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
       
          entry.target.classList.add('in-view');
        } else {
       
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      root: null,
   
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






document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.2  
  });

  cards.forEach(card => observer.observe(card));
});
if (entry.isIntersecting) {
  const delay = Array.from(cards).indexOf(entry.target) * 100; 
  entry.target.style.transitionDelay = `${delay}ms`;
  entry.target.classList.add("visible");
  observer.unobserve(entry.target);
}



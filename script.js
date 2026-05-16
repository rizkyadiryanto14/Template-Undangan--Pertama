// ── GUEST NAME FROM URL ──
const urlParams = new URLSearchParams(window.location.search);
const guestParam = urlParams.get("to") || urlParams.get("nama");
const guestNameDisplay = document.getElementById("guestNameDisplay");
if (guestParam && guestNameDisplay) {
  guestNameDisplay.textContent = decodeURIComponent(guestParam);
}

const cover = document.getElementById("cover");
const invitation = document.getElementById("invitation");
const openButton = document.getElementById("openInvitation");
const musicButton = document.getElementById("musicButton");
const bgMusic = document.getElementById("bgMusic");
const countdown = document.querySelector(".countdown");
const navLinks = [...document.querySelectorAll(".bottom-nav a")];
const rsvpForm = document.getElementById("rsvpForm");
const wishes = document.getElementById("wishes");

let isPlaying = false;

document.body.classList.add("locked");

// ── OPEN INVITATION ──
openButton.addEventListener("click", () => {
  cover.style.display = "none";
  invitation.classList.add("open");
  musicButton.classList.add("show");
  document.body.classList.remove("locked");
  window.scrollTo({ top: 0, behavior: "instant" });
  tryPlayMusic();

  // Trigger reveal untuk elemen yang langsung terlihat di viewport
  setTimeout(() => {
    revealTargets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add("visible");
      }
    });
    document.querySelectorAll(".reveal-ribbon").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add("ribbon-visible");
      }
    });
  }, 120);
});

// ── MUSIC ──
musicButton.addEventListener("click", () => {
  isPlaying ? stopMusic() : tryPlayMusic();
});

function tryPlayMusic() {
  if (isPlaying) return;
  bgMusic.volume = 0.4;
  bgMusic.play().then(() => {
    isPlaying = true;
    musicButton.classList.add("playing");
    musicButton.setAttribute("aria-label", "Pause musik");
    musicButton.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
  }).catch(() => {});
}

function stopMusic() {
  bgMusic.pause();
  isPlaying = false;
  musicButton.classList.remove("playing");
  musicButton.setAttribute("aria-label", "Putar musik");
  musicButton.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>`;
}

// ── COUNTDOWN ──
function updateCountdown() {
  if (!countdown) return;
  const target = new Date(countdown.dataset.date).getTime();
  const distance = Math.max(0, target - Date.now());
  const day = 86400000, hour = 3600000, minute = 60000;
  document.getElementById("days").textContent    = String(Math.floor(distance / day)).padStart(2, "0");
  document.getElementById("hours").textContent   = String(Math.floor((distance % day) / hour)).padStart(2, "0");
  document.getElementById("minutes").textContent = String(Math.floor((distance % hour) / minute)).padStart(2, "0");
  document.getElementById("seconds").textContent = String(Math.floor((distance % minute) / 1000)).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ── REVEAL ON SCROLL ──
const revealTargets = [...document.querySelectorAll(
  ".section-inner, .event-card, .person, .gallery img, .bank-card, .story-item, .countdown, .map-embed, .ampersand, .story-photo"
)];

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealTargets.forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// ── RIBBON REVEAL ON SCROLL ──
const ribbonObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("ribbon-visible");
      ribbonObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll(".section-ribbon").forEach((el) => {
  ribbonObserver.observe(el);
});

// ── ACTIVE NAV ──
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { threshold: 0.45 });

document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

// ── COPY REKENING ──
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    await copyText(btn.dataset.copy);
    const orig = btn.textContent;
    btn.textContent = "✓ Tersalin";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
});

// ── RSVP / WISHES ──
const storedWishes = JSON.parse(localStorage.getItem("melin-rizky-wishes") || "[]");
const defaultWishes = [
  { name: "Keluarga Besar", attendance: "Hadir", message: "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin." }
];

const WISHES_PER_PAGE = 5;
let currentPage = 1;

function renderWishes() {
  const all = [...storedWishes, ...defaultWishes];
  const totalPages = Math.max(1, Math.ceil(all.length / WISHES_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * WISHES_PER_PAGE;
  const pageItems = all.slice(start, start + WISHES_PER_PAGE);

  const wishesHtml = pageItems.map((w) => `
    <article class="wish">
      <p class="wish-meta">${escapeHtml(w.name)} · <em>${escapeHtml(w.attendance)}</em></p>
      <p>${escapeHtml(w.message)}</p>
    </article>
  `).join("");

  const paginationHtml = totalPages > 1 ? `
    <div class="wishes-pagination">
      <button class="wish-page-btn" id="prevPage" ${currentPage === 1 ? "disabled" : ""}>&#8592;</button>
      <span class="wish-page-info">${currentPage} / ${totalPages}</span>
      <button class="wish-page-btn" id="nextPage" ${currentPage === totalPages ? "disabled" : ""}>&#8594;</button>
    </div>
  ` : "";

  wishes.innerHTML = wishesHtml + paginationHtml;

  document.getElementById("prevPage")?.addEventListener("click", () => {
    currentPage--;
    renderWishes();
    wishes.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  document.getElementById("nextPage")?.addEventListener("click", () => {
    currentPage++;
    renderWishes();
    wishes.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

rsvpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  storedWishes.unshift({
    name: document.getElementById("guestName").value,
    attendance: document.getElementById("attendance").value,
    message: document.getElementById("message").value
  });
  localStorage.setItem("melin-rizky-wishes", JSON.stringify(storedWishes.slice(0, 50)));
  rsvpForm.reset();
  currentPage = 1;
  renderWishes();
});

// ── HELPERS ──
function escapeHtml(v) {
  return v.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
}

async function copyText(v) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(v);
    return;
  }
  const el = document.createElement("input");
  el.value = v;
  el.setAttribute("readonly", "");
  el.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  el.remove();
}

renderWishes();


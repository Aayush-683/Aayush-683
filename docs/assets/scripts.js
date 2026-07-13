// ============================================================
// Aayush Goel — portfolio scripts
// theme toggle · particle network · cursor glow · scroll progress
// typed hero line · counter animation · scroll reveal
// ============================================================

(function () {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- footer year ----------
    document.getElementById("year").textContent = new Date().getFullYear();

    // ---------- theme toggle ----------
    const themeToggle = document.getElementById("theme-toggle");
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    function currentTheme() {
        return document.documentElement.getAttribute("data-theme") || "dark";
    }

    let themeAnimTimer;
    function applyTheme(theme) {
        const root = document.documentElement;
        root.classList.add("theme-anim");
        root.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        if (themeColorMeta) themeColorMeta.content = theme === "light" ? "#FFFFFF" : "#0B0E14";
        refreshParticleColors();
        clearTimeout(themeAnimTimer);
        themeAnimTimer = setTimeout(() => root.classList.remove("theme-anim"), 450);
    }

    themeToggle.addEventListener("click", () => {
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });

    // ---------- scroll progress ----------
    const progressEl = document.getElementById("scroll-progress");
    let progressTicking = false;
    function updateProgress() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressEl.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        progressTicking = false;
    }
    window.addEventListener("scroll", () => {
        if (!progressTicking) {
            progressTicking = true;
            requestAnimationFrame(updateProgress);
        }
    }, { passive: true });
    updateProgress();

    // ---------- cursor spotlight ----------
    const glowEl = document.getElementById("cursor-glow");
    if (window.matchMedia("(pointer: fine)").matches) {
        let glowRaf = null;
        window.addEventListener("mousemove", (e) => {
            if (glowRaf) return;
            glowRaf = requestAnimationFrame(() => {
                glowEl.style.transform = `translate(${e.clientX - 260}px, ${e.clientY - 260}px)`;
                glowEl.style.opacity = "1";
                glowRaf = null;
            });
        }, { passive: true });
        document.documentElement.addEventListener("mouseleave", () => {
            glowEl.style.opacity = "0";
        });
    }

    // ---------- particle network (hero) ----------
    const canvas = document.getElementById("hero-canvas");
    const heroSection = document.getElementById("hero");
    let particleColors = { node: "#7D9BCE", line: "125, 155, 206" };

    function refreshParticleColors() {
        const steel = getComputedStyle(document.documentElement).getPropertyValue("--steel").trim();
        // hex -> "r, g, b" for line alpha
        const hex = steel.replace("#", "");
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            particleColors = { node: steel, line: `${r}, ${g}, ${b}` };
        }
    }
    refreshParticleColors();

    if (canvas) {
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particles = [];
        let width = 0, height = 0;
        let rafId = null;
        let heroVisible = true;
        const mouse = { x: -9999, y: -9999 };

        const LINK_DIST = 130;
        const MOUSE_DIST = 170;

        heroSection.addEventListener("mousemove", (e) => {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }, { passive: true });
        heroSection.addEventListener("mouseleave", () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        function resize() {
            width = heroSection.offsetWidth;
            height = heroSection.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(90, Math.floor((width * height) / 16000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: 1 + Math.random() * 1.4,
            }));
        }

        function step() {
            ctx.clearRect(0, 0, width, height);

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            }

            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < LINK_DIST) {
                        ctx.strokeStyle = `rgba(${particleColors.line}, ${0.14 * (1 - dist / LINK_DIST)})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // link nearby nodes to the cursor — the network notices you
            for (const p of particles) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < MOUSE_DIST) {
                    ctx.strokeStyle = `rgba(${particleColors.line}, ${0.22 * (1 - dist / MOUSE_DIST)})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }

            ctx.fillStyle = particleColors.node;
            ctx.globalAlpha = 0.5;
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            rafId = requestAnimationFrame(step);
        }

        function start() {
            if (rafId === null && heroVisible && !document.hidden) rafId = requestAnimationFrame(step);
        }
        function stop() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        new IntersectionObserver((entries) => {
            heroVisible = entries[0].isIntersecting;
            heroVisible ? start() : stop();
        }).observe(heroSection);

        document.addEventListener("visibilitychange", () => {
            document.hidden ? stop() : start();
        });

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });

        resize();
        start();
    }

    // ---------- magnetic buttons ----------
    if (window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".btn").forEach((btn) => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
                const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
                btn.style.transform = `translate(${x * 5}px, ${y * 3}px)`;
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "";
            });
        });
    }

    // ---------- for the ones who inspect ----------
    console.log(
        "%c$ whoami%c\nAayush Goel — Engineering Lead, backend & automation.\n%c$ cat contact.txt%c\naayushgoel683@outlook.com · github.com/Aayush-683\n\nnice devtools btw.",
        "color:#7D9BCE;font-family:monospace;font-weight:bold",
        "color:inherit;font-family:monospace",
        "color:#7D9BCE;font-family:monospace;font-weight:bold",
        "color:inherit;font-family:monospace"
    );

    const hostName = window.location.hostname;

    console.log(window.location)

    // ---------- typed hero line ----------
    const lines = [
        "node services/api && watch logs -f",
        "kubectl get pods -n production",
        "git commit --no-verify --force -m 'fix: attempt number 3'",
        "docker build -t aayush683/portfolio:latest .",
        "redis-cli FLUSHALL",
        `curl -X POST https://${hostName || 'localhost'}/deploy -H 'Authorization: Bearer Aayush683@12345'`,
    ];

    const typedEl = document.getElementById("typed-line");

    {
        let lineIdx = Math.floor(Math.random() * lines.length), charIdx = 0, deleting = false;

        function tick() {
            const current = lines[lineIdx];

            if (!deleting) {
                charIdx++;
                typedEl.textContent = current.slice(0, charIdx);
                if (charIdx === current.length) {
                    deleting = true;
                    setTimeout(tick, 4000);
                    return;
                }
                setTimeout(tick, 46 + Math.random() * 40);
            } else {
                charIdx--;
                typedEl.textContent = current.slice(0, charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    lineIdx = Math.floor(Math.random() * lines.length);
                    setTimeout(tick, 380);
                    return;
                }
                setTimeout(tick, 24 + Math.random() * 30);
            }
        }
        setTimeout(tick, 500);
    }

    // ---------- stat counters ----------
    function animateCount(el) {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix ? el.dataset.prefix.replace("&lt;", "<") : "";
        const decimals = String(el.dataset.count).includes(".") ? 1 : 0;
        const duration = 1100;
        const start = performance.now();

        function fmt(v) {
            if (target >= 1000) return Math.round(v).toLocaleString("en-IN");
            return v.toFixed(decimals);
        }

        function frame(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = prefix + fmt(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    const statEls = document.querySelectorAll(".stat-value");
    if (prefersReducedMotion) {
        statEls.forEach((el) => {
            const prefix = el.dataset.prefix ? el.dataset.prefix.replace("&lt;", "<") : "";
            const target = parseFloat(el.dataset.count);
            const val = target >= 1000 ? target.toLocaleString("en-IN") : el.dataset.count;
            el.textContent = prefix + val + (el.dataset.suffix || "");
        });
    } else {
        const statObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        statObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );
        statEls.forEach((el) => statObserver.observe(el));
    }

    // ---------- resume last-updated (from GitHub commit history) ----------
    const resumeMetaEl = document.getElementById("resume-meta");
    if (resumeMetaEl) {
        fetch("https://api.github.com/repos/Aayush-683/Aayush-683/commits?path=docs/assets/resume.pdf&per_page=1")
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((commits) => {
                const dateStr = commits[0]?.commit?.committer?.date;
                if (!dateStr) return;
                const formatted = new Date(dateStr).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                });
                console.log({ dateStr, formatted });
                resumeMetaEl.textContent = `2 pages · PDF · updated ${formatted}`;
            })
            .catch(() => {
                // keep the static fallback text already in the markup
            });
    }

    // ---------- scroll reveal ----------
    const revealEls = document.querySelectorAll(".reveal");
    if (prefersReducedMotion) {
        revealEls.forEach((el) => el.classList.add("visible"));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    }
})();
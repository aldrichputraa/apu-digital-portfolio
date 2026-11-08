/* =========================================================
   APU PORTFOLIO V16 · Main JavaScript
   Tema · Nav · Scroll · Terminal navigator (+ easter eggs) ·
   Reveal · Marquee · Filter + Counter · Kursor · Lightbox
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  /* ---------------------------------------------------------
     1. THEME TOGGLE (dark / light) dengan transisi halus
  --------------------------------------------------------- */

  const themeToggle = $("#themeToggle");
  const themeIcon = $(".theme-icon");
  const themeMeta = $('meta[name="theme-color"]');
  const THEME_KEY = "apu-portfolio-theme";

  const applyTheme = (theme) => {
    const isLight = theme === "light";

    root.setAttribute("data-theme", isLight ? "light" : "dark");

    if (themeIcon) {
      themeIcon.textContent = isLight ? "☾" : "☀";
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Aktifkan Dark Mode" : "Aktifkan Light Mode",
      );
      themeToggle.setAttribute("aria-pressed", String(isLight));
      themeToggle.title = isLight
        ? "Ganti ke Dark Mode"
        : "Ganti ke Light Mode";
    }

    if (themeMeta) {
      themeMeta.setAttribute("content", isLight ? "#f4f7fc" : "#0b0f17");
    }
  };

  // Tema awal sudah diatur oleh skrip kecil di <head>; sinkronkan ikon & label.
  applyTheme(root.getAttribute("data-theme"));

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";

      // Aktifkan transisi warna 0.3s hanya selama pergantian tema.
      root.classList.add("theme-transition");
      applyTheme(next);

      window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 450);

      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (error) {
        console.warn("Tema tidak dapat disimpan:", error);
      }
    });
  }

  /* ---------------------------------------------------------
     2. FOOTER YEAR
  --------------------------------------------------------- */

  const yearElement = $("#tahun");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     3. MOBILE NAVIGATION
  --------------------------------------------------------- */

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  if (menuToggle && navLinks) {
    const setMenu = (open, returnFocus = false) => {
      navLinks.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute(
        "aria-label",
        open ? "Tutup menu navigasi" : "Buka menu navigasi",
      );

      if (!open && returnFocus) {
        menuToggle.focus();
      }
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    // Tutup menu setelah salah satu tautan dipilih.
    $$("a", navLinks).forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    // Tutup dengan Escape dan kembalikan fokus ke tombol.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navLinks.classList.contains("open")) {
        setMenu(false, true);
      }
    });

    // Tutup ketika area di luar menu diklik.
    document.addEventListener("click", (event) => {
      if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        setMenu(false);
      }
    });

    // Tutup menu ketika layar kembali ke ukuran desktop (> 1024px).
    window
      .matchMedia("(min-width: 1025px)")
      .addEventListener("change", (event) => {
        if (event.matches) {
          setMenu(false);
        }
      });
  }

  /* ---------------------------------------------------------
     4. SCROLL: PROGRESS BAR + BACK TO TOP
  --------------------------------------------------------- */

  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");
  let scrollTicking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }

    if (backToTop) {
      backToTop.classList.toggle("visible", y > 450);
    }

    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );

  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------------------------------------------------------
     5. TERMINAL INTERAKTIF — navigator situs + easter egg
        (diaktifkan sebelum reveal dipasang)
  --------------------------------------------------------- */

  const terminal = $("#terminal");
  const terminalScreen = $("#terminalScreen");
  const terminalOutput = $("#terminalOutput");
  const terminalInput = $("#terminalInput");
  const terminalTyped = $("#terminalTyped");

  if (
    terminal &&
    terminalScreen &&
    terminalOutput &&
    terminalInput &&
    terminalTyped
  ) {
    terminal.hidden = false; // tampil hanya bila JavaScript aktif

    const typingElement = terminalTyped.parentElement;

    const GITHUB_URL = "https://github.com/aldrichputraa";
    const EMAIL = "aldrichputrautama629@gmail.com";

    const history = [];
    let historyIndex = 0;

    const has = (object, key) =>
      Object.prototype.hasOwnProperty.call(object, key);

    const scrollToEnd = () => {
      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    };

    /* ----- Helper cetak (semua teks lewat textContent: aman dari injeksi HTML) ----- */

    const addLine = (text = "", className = "") => {
      const line = document.createElement("div");
      line.className = className ? `t-line ${className}` : "t-line";
      line.textContent = text;
      terminalOutput.appendChild(line);
      return line;
    };

    const addGap = () => {
      const gap = document.createElement("div");
      gap.className = "t-gap";
      terminalOutput.appendChild(gap);
    };

    // Teks multi-baris: "\n" memisahkan baris, baris kosong menjadi jeda.
    const addText = (text, className = "") => {
      text.split("\n").forEach((line) => {
        if (line === "") {
          addGap();
        } else {
          addLine(line, className);
        }
      });
    };

    const addHeading = (text) => addLine(text, "t-head");

    const addRow = (key, value, wide = false) => {
      const row = document.createElement("div");
      row.className = wide ? "t-row t-row-wide" : "t-row";

      const keyElement = document.createElement("span");
      keyElement.className = "t-key";
      keyElement.textContent = key;

      const valueElement = document.createElement("span");
      valueElement.className = "t-val";
      valueElement.textContent = value;

      row.append(keyElement, valueElement);
      terminalOutput.appendChild(row);
    };

    // Baris dengan tautan yang bisa diklik
    const addLinkRow = (key, label, href, external = true) => {
      const row = document.createElement("div");
      row.className = "t-row";

      const keyElement = document.createElement("span");
      keyElement.className = "t-key";
      keyElement.textContent = key;

      const valueElement = document.createElement("span");
      valueElement.className = "t-val";

      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;

      if (external) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }

      valueElement.appendChild(link);
      row.append(keyElement, valueElement);
      terminalOutput.appendChild(row);
    };

    // Baris dengan art ASCII (spasi dipertahankan)
    const addArtRow = (art, key, value) => {
      const row = document.createElement("div");
      row.className = "t-line";
      row.style.whiteSpace = "pre";

      const artElement = document.createElement("span");
      artElement.className = "t-accent";
      artElement.textContent = art;
      row.appendChild(artElement);

      if (key) {
        const keyElement = document.createElement("span");
        keyElement.className = "t-key";
        keyElement.textContent = key;
        row.appendChild(keyElement);
      }

      if (value) {
        const valueElement = document.createElement("span");
        valueElement.className = "t-val";
        valueElement.textContent = value;
        row.appendChild(valueElement);
      }

      terminalOutput.appendChild(row);
    };

    const addEcho = (rawValue) => {
      const line = document.createElement("div");
      line.className = "t-line t-cmd";

      const symbol = document.createElement("span");
      symbol.className = "t-symbol";
      symbol.textContent = "$";

      const text = document.createElement("span");
      text.textContent = rawValue;

      line.append(symbol, text);
      terminalOutput.appendChild(line);
    };

    // Buka GitHub di tab baru (dipanggil langsung dari penekanan Enter = gestur pengguna)
    const openGithub = () => {
      addLine("Membuka GitHub di tab baru...", "t-muted");
      window.open(GITHUB_URL, "_blank", "noopener,noreferrer");

      const fallback = document.createElement("div");
      fallback.className = "t-line t-muted";
      fallback.append("Jika tab tidak terbuka, klik: ");

      const link = document.createElement("a");
      link.href = GITHUB_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "github.com/aldrichputraa";

      fallback.appendChild(link);
      terminalOutput.appendChild(fallback);
    };

    /* ----- Perintah publik (Indonesia + alias Inggris) ----- */

    const commands = {
      help() {
        addLine(
          "Perintah tersedia (alias ditulis setelah tanda “/”):",
          "t-muted",
        );
        addGap();

        addHeading("Profil");
        addRow("perkenalan / bio", "perkenalan lengkap saya", true);
        addRow("minat / focus", "bidang yang saya minati", true);
        addRow("hobi / hobby", "kegiatan di luar akademik", true);
        addRow("prinsip / quote", "prinsip pribadi saya", true);
        addGap();

        addHeading("Akademik & karya");
        addRow("kuliah / edu", "status kuliah saat ini", true);
        addRow("pendidikan / education", "riwayat pendidikan formal", true);
        addRow("proyek / projects", "karya pilihan", true);
        addRow("keahlian / skills", "tech stack & kemampuan analitis", true);
        addRow("sertifikat / certificates", "sertifikasi profesional", true);
        addGap();

        addHeading("Lainnya");
        addRow("kontak / contact", "email & kanal kontak", true);
        addRow("github", "buka profil GitHub di tab baru", true);
        addRow("tema / theme", "cara mengganti mode Light/Dark", true);
        addRow("clear", "bersihkan layar terminal", true);
      },

      perkenalan() {
        addLine(
          "Belajar memahami teknologi, menciptakan sesuatu yang bermanfaat.",
          "t-accent",
        );
        addGap();
        addLine(
          "Saya adalah mahasiswa Sistem Informasi yang memiliki ketertarikan pada perkembangan teknologi, " +
            "pengembangan website, dan analisis sistem. Saat ini, saya sedang membangun pemahaman serta " +
            "mengembangkan kemampuan di bidang teknologi informasi melalui proses belajar dan eksplorasi.",
        );
        addGap();
        addLine(
          "Saya percaya bahwa setiap proses pembelajaran merupakan kesempatan untuk mengenali potensi diri, " +
            "memperluas wawasan, dan menciptakan sesuatu yang bermanfaat. Bagi saya, perjalanan berkembang " +
            "bukan tentang menjadi sempurna, melainkan tentang terus mencoba, belajar, dan memperbaiki diri.",
        );
      },

      minat() {
        addLine("Technology & Web Development", "t-accent");
        addLine(
          "Tertarik pada perkembangan teknologi, pengembangan website, dan analisis sistem informasi.",
        );
      },

      hobi() {
        addLine("Membaca Komik", "t-accent");
        addLine(
          "Menikmati cerita melalui perpaduan narasi dan ilustrasi visual di luar aktivitas akademik.",
        );
      },

      prinsip() {
        addLine(
          "“Bukan tentang seberapa cepat aku mencapai tujuan, tetapi seberapa kuat tekadku untuk terus melangkah dan berkembang.”",
          "t-accent",
        );
      },

      kuliah() {
        addRow("kampus", "Universitas Komputama Cilacap");
        addRow("program", "Sistem Informasi");
        addRow("status", "Mahasiswa · Semester 1 (2026 — sekarang)");
        addRow("fokus", "analisis sistem & pengembangan web");
      },

      proyek() {
        addLine("Karya pilihan:", "t-muted");
        addRow(
          "01",
          "Sistem Informasi Perpustakaan\nHTML · CSS · JavaScript · PHP · MySQL — fitur CRUD serta login & logout",
        );
        addRow(
          "02",
          "Website Informasi Pendidikan\nProyek awal mempelajari pengembangan website",
        );
      },

      keahlian() {
        addLine("Tech stack & kemampuan inti:", "t-muted");
        addRow("web", "HTML · CSS · JavaScript");
        addRow("backend", "PHP · MySQL (CRUD, login & logout)");
        addRow(
          "analisis",
          "analisis kebutuhan · alur sistem · identifikasi permasalahan",
        );
        addRow("tim", "kolaborasi · komunikasi · penyampaian ide");
      },

      pendidikan() {
        addLine("Riwayat pendidikan:", "t-muted");
        addRow(
          "2026 — kini",
          "Universitas Komputama Cilacap\nProgram Studi Sistem Informasi (Semester 1)",
        );
        addRow(
          "2023 — 2026",
          "SMK Muhammadiyah Majenang\nRekayasa Perangkat Lunak (RPL)",
        );
        addRow("2021 — 2023", "SMP Negeri 3 Majenang");
      },

      sertifikat() {
        addLine("Sertifikasi kompetensi:", "t-muted");
        addRow(
          "01",
          "Pengembang Perangkat Lunak\nBNSP & LSP SMK Muhammadiyah Majenang · Majenang, 5 Juni 2026",
        );
        addRow(
          "02",
          "Pengembang Web (Front End Developer)\nBNSP & LSP Teknologi Informatika Bisnis Digital · Tangerang, 30 Mei 2026",
        );
      },

      kontak() {
        addLine("Mari terhubung:", "t-muted");
        addLinkRow("email", EMAIL, `mailto:${EMAIL}`, false);
        addLinkRow(
          "instagram",
          "instagram.com/aldrchptraa",
          "https://www.instagram.com/aldrchptraa/",
        );
        addLinkRow(
          "tiktok",
          "tiktok.com/@ashcroftparker",
          "https://www.tiktok.com/@ashcroftparker",
        );
        addLinkRow("github", "github.com/aldrichputraa", GITHUB_URL);
      },

      github() {
        openGithub();
      },

      tema() {
        const current =
          root.getAttribute("data-theme") === "light" ? "Light" : "Dark";
        addLine(`Tema aktif: ${current}`, "t-muted");
        addRow("cara", "klik tombol ☀ / ☾ di pojok kanan atas header");
        addRow("info", "pilihan tema tersimpan otomatis di browser Anda");
      },

      clear() {
        terminalOutput.textContent = "";
      },
    };

    // Alias Inggris → perintah utama (hasil cetak sama persis)
    const aliases = {
      bio: "perkenalan",
      about: "perkenalan",
      focus: "minat",
      hobby: "hobi",
      quote: "prinsip",
      edu: "kuliah",
      projects: "proyek",
      skills: "keahlian",
      education: "pendidikan",
      certificates: "sertifikat",
      contact: "kontak",
      theme: "tema",
    };

    // Daftar untuk auto-lengkap Tab (perintah rahasia sengaja tidak disertakan)
    const commandNames = [...Object.keys(commands), ...Object.keys(aliases)];

    /* ----- Perintah rahasia (tidak muncul di help maupun Tab) ----- */

    const secretCommands = {
      secret() {
        addText(
          "Accessing hidden_memory.db... [FOUND]\n" +
            "Status: Crushing Hard.\n" +
            "\n" +
            "Clue 01: She’s the epitome of independence. A girl who walks her own path, takes care of her own world, " +
            "and moves gracefully without needing anyone else's rescue. Truly admirable and effortlessly cool.\n" +
            "\n" +
            "Type 'clue2' to unlock the next system hint.",
          "t-muted",
        );
      },

      clue2() {
        addText(
          "Decrypting secondary database... [SUCCESS]\n" +
            "\n" +
            "Clue 02: Independent but soft-hearted. Often seen managing things on her own, a true self-reliant soul.\n" +
            "\n" +
            "System Overload: If you think you know her name, try typing it to override encryption!",
          "t-muted",
        );
      },

      ghaitsaa() {
        addText(
          "ACCESS GRANTED. System Encryption Overridden.\n" +
            "Current Status: 100% Crushing on her. ❤️\n" +
            "'Even the most independent systems have a core connection they can't ignore.'",
          "t-soft",
        );
      },

      socials() {
        openGithub();
      },

      neofetch() {
        const art = [
          "    /\\    ",
          "   /  \\   ",
          "  / /\\ \\  ",
          " / ____ \\ ",
          "/_/    \\_\\",
        ];
        const theme =
          root.getAttribute("data-theme") === "light" ? "Light" : "Dark";
        const info = [
          ["aldrich", "@apu-portfolio"],
          ["", "----------------------"],
          ["OS      ", "APU Portfolio OS v9"],
          ["Host    ", "Komputama Cilacap · SI"],
          ["Stack   ", "HTML / CSS / JS"],
          ["Theme   ", theme],
          ["Status  ", "Open for Opportunities"],
        ];

        info.forEach(([key, value], index) => {
          const artLine = (art[index] || "").padEnd(10) + "   ";
          addArtRow(artLine, key, value);
        });

        addGap();
      },

      "sudo rm -rf /"() {
        addLine("Nice try, developer! Access denied. 😉", "t-danger");
      },
    };

    const secretAliases = {
      hidden: "secret",
    };

    /* ----- Eksekusi perintah ----- */

    const runCommand = (rawValue) => {
      const value = rawValue.trim();

      addEcho(rawValue);

      if (value === "") {
        scrollToEnd();
        return;
      }

      history.push(value);
      historyIndex = history.length;

      // Normalisasi: huruf kecil + spasi dirapikan → "Bio", " BIO " dan "bio" sama saja
      const normalized = value.toLowerCase().replace(/\s+/g, " ");
      const letters = normalized.replace(/[^a-z0-9 ]/g, "").trim();
      const firstWord = normalized.split(" ")[0];

      // 1) Perintah rahasia
      let secretKey = null;

      if (/^ghaitsa+$/.test(letters)) {
        secretKey = "ghaitsaa"; // menerima variasi huruf besar/kecil dan ejaan ghaitsa/ghaitsaa/ghaitsaaa
      } else if (/^sudo rm -rf \/\*?$/.test(normalized)) {
        secretKey = "sudo rm -rf /";
      } else if (has(secretAliases, firstWord)) {
        secretKey = secretAliases[firstWord];
      } else if (has(secretCommands, firstWord)) {
        secretKey = firstWord;
      }

      if (secretKey) {
        secretCommands[secretKey]();
        scrollToEnd();
        return;
      }

      // 2) Perintah publik (alias Inggris dipetakan ke perintah Indonesia)
      const key = has(aliases, firstWord) ? aliases[firstWord] : firstWord;

      if (has(commands, key)) {
        commands[key]();
      } else {
        addLine(`perintah tidak dikenal: ${firstWord}`, "t-muted");
        addLine("Ketik 'help' untuk melihat daftar perintah.", "t-muted");
      }

      scrollToEnd();
    };

    const setInputValue = (value) => {
      terminalInput.value = value;
      terminalTyped.textContent = value;
      typingElement.classList.toggle("is-empty", value === "");
    };

    /* ----- Pesan sambutan ----- */

    addLine(
      "Selamat datang di terminal portfolio Aldrich Putra Utama.",
      "t-accent",
    );
    addLine("Ketik 'help' untuk melihat daftar perintah.", "t-muted");
    addGap();

    /* ----- Input ----- */

    // Cerminkan teks input ke tampilan agar kursor blok ikut berkedip
    terminalInput.addEventListener("input", () => {
      terminalTyped.textContent = terminalInput.value;
      typingElement.classList.toggle("is-empty", terminalInput.value === "");
      scrollToEnd();
    });

    terminalInput.addEventListener("keydown", (event) => {
      const { key } = event;

      if (key === "Enter") {
        event.preventDefault();
        runCommand(terminalInput.value);
        setInputValue("");
        return;
      }

      if (key === "ArrowUp") {
        event.preventDefault();
        if (history.length > 0) {
          historyIndex = Math.max(0, historyIndex - 1);
          setInputValue(history[historyIndex]);
        }
        return;
      }

      if (key === "ArrowDown") {
        event.preventDefault();
        if (history.length > 0) {
          historyIndex = Math.min(history.length, historyIndex + 1);
          setInputValue(history[historyIndex] || "");
        }
        return;
      }

      // Kursor selalu di akhir teks (tampilan memang hanya mencerminkan akhir teks)
      if (
        key === "ArrowLeft" ||
        key === "ArrowRight" ||
        key === "Home" ||
        key === "End"
      ) {
        event.preventDefault();
        return;
      }

      // Ctrl/Cmd + L = clear
      if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === "l") {
        event.preventDefault();
        commands.clear();
        return;
      }

      // Tab = lengkapi perintah (hanya bila ada teks dan cocok tunggal)
      if (key === "Tab" && terminalInput.value.trim() !== "") {
        const typedValue = terminalInput.value.trim().toLowerCase();
        const matches = commandNames.filter((name) =>
          name.startsWith(typedValue),
        );

        if (matches.length === 1) {
          event.preventDefault();
          setInputValue(matches[0]);
        }
      }
    });

    // Fokus & status terminal
    terminalInput.addEventListener("focus", () =>
      terminal.classList.add("is-focused"),
    );
    terminalInput.addEventListener("blur", () =>
      terminal.classList.remove("is-focused"),
    );

    terminalScreen.addEventListener("click", () => {
      terminalInput.focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------
     6. SCROLL REVEAL (Intersection Observer + stagger)
  --------------------------------------------------------- */

  const revealElements = $$(".js-reveal");

  // Beri jeda bertahap untuk elemen bersaudara agar muncul berurutan.
  revealElements.forEach((element) => {
    const siblings = Array.from(element.parentElement.children).filter(
      (child) => child.classList.contains("js-reveal"),
    );

    const index = Math.min(siblings.indexOf(element), 5);
    element.style.setProperty("--delay", `${index * 0.07}s`);
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Tampilkan semuanya tanpa animasi.
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    root.classList.add("js-enabled");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* ---------------------------------------------------------
     7. ACTIVE NAVIGATION
  --------------------------------------------------------- */

  const header = $("#header");
  const pageSections = $$("main section[id]");
  const navItems = $$('.nav-links a[href^="#"]');

  const updateActiveNav = () => {
    const reference = (header ? header.offsetHeight : 0) + 100;
    let current = null;

    pageSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= reference) {
        current = section;
      }
    });

    // Pastikan bagian terakhir aktif saat tiba di dasar halaman.
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;

    if (atBottom) {
      current = pageSections[pageSections.length - 1];
    }

    navItems.forEach((link) => {
      const isActive =
        current && link.getAttribute("href") === `#${current.id}`;

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  window.addEventListener(
    "scroll",
    () => window.requestAnimationFrame(updateActiveNav),
    { passive: true },
  );
  window.addEventListener("resize", updateActiveNav);
  updateActiveNav();

  /* ---------------------------------------------------------
     8. TECH STACK MARQUEE
  --------------------------------------------------------- */

  if (!reduceMotion) {
    $$(".marquee").forEach((marquee) => {
      const track = $(".marquee-track", marquee);

      if (!track) {
        return;
      }

      // Gandakan item agar loop -50% terlihat mulus.
      // Klon disembunyikan dari pembaca layar.
      Array.from(track.children).forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });

      marquee.classList.add("is-ready");
    });
  }

  /* ---------------------------------------------------------
     9. PROJECT FILTER + LIVE COUNTERS
  --------------------------------------------------------- */

  // Animasi hitung naik dari 0 ke nilai akhir (ease-out cepat).
  const animateNumber = (
    element,
    target,
    format = (n) => String(n),
    duration = 650,
  ) => {
    if (!element) {
      return;
    }

    if (element._frame) {
      window.cancelAnimationFrame(element._frame);
    }

    if (reduceMotion || target === 0) {
      element.textContent = format(target);
      return;
    }

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      element.textContent = format(Math.round(target * eased));

      if (progress < 1) {
        element._frame = window.requestAnimationFrame(tick);
      }
    };

    element.textContent = format(0);
    element._frame = window.requestAnimationFrame(tick);
  };

  const filterButtons = $$(".filter-btn");
  const projectCards = $$("#projectGrid .project");
  const filterStatus = $("#filterStatus");
  const filterRow = $(".filter-row");
  const resultCount = $("#resultCount");

  if (filterButtons.length > 0 && projectCards.length > 0) {
    const isPlaceholder = (card) => card.classList.contains("is-placeholder");

    const matchesFilter = (card, filter) =>
      filter === "all" ||
      (card.dataset.category || "").split(/\s+/).includes(filter);

    // Jumlah proyek sebenarnya pada suatu kategori (placeholder tidak dihitung).
    const countFor = (filter) =>
      projectCards.filter(
        (card) => !isPlaceholder(card) && matchesFilter(card, filter),
      ).length;

    const formatCount = (n) => `(${n})`;

    // Isi nilai akhir lebih dulu agar tidak ada tombol kosong sebelum animasi.
    filterButtons.forEach((button) => {
      const total = countFor(button.dataset.filter);
      const label = $(".filter-label", button);
      const labelText = label
        ? label.textContent.trim()
        : button.dataset.filter;
      const count = $(".count", button);

      if (count) {
        count.textContent = formatCount(total);
      }

      // Nama aksesibel yang stabil (angka yang berubah tidak diumumkan).
      button.setAttribute("aria-label", `${labelText}, ${total} proyek`);
    });

    if (resultCount) {
      resultCount.textContent = String(countFor("all"));
    }

    // Hitung naik saat bar filter pertama kali terlihat.
    const animateAllCounts = () => {
      filterButtons.forEach((button) => {
        animateNumber(
          $(".count", button),
          countFor(button.dataset.filter),
          formatCount,
        );
      });
      animateNumber(resultCount, countFor("all"));
    };

    if (filterRow && "IntersectionObserver" in window && !reduceMotion) {
      const countObserver = new IntersectionObserver(
        (entries, observer) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            animateAllCounts();
            observer.disconnect();
          }
        },
        { threshold: 0.6 },
      );

      countObserver.observe(filterRow);
    }

    const applyFilter = (filter) => {
      let visibleProjects = 0;

      projectCards.forEach((card) => {
        if (matchesFilter(card, filter)) {
          if (!isPlaceholder(card)) {
            visibleProjects++;
          }

          if (card.hidden) {
            card.hidden = false;
            void card.offsetWidth; // paksa reflow agar transisi masuk berjalan
          }

          card.classList.remove("is-out");
        } else {
          card.classList.add("is-out");

          window.setTimeout(
            () => {
              if (card.classList.contains("is-out")) {
                card.hidden = true;
              }
            },
            reduceMotion ? 0 : 320,
          );
        }
      });

      if (filterStatus) {
        filterStatus.textContent = `${visibleProjects} proyek ditampilkan`;
      }

      return visibleProjects;
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((other) => {
          const isActive = other === button;
          other.classList.toggle("is-active", isActive);
          other.setAttribute("aria-pressed", String(isActive));
        });

        const filter = button.dataset.filter;
        const visible = applyFilter(filter);

        // Counter animasi: angka tombol yang diklik + hasil yang ditampilkan.
        animateNumber($(".count", button), countFor(filter), formatCount);
        animateNumber(resultCount, visible);
      });
    });
  }

  /* ---------------------------------------------------------
     10. CUSTOM CURSOR (titik + ring yang mengikuti)
  --------------------------------------------------------- */

  const cursorDot = $(".cursor-dot");
  const cursorRing = $(".cursor-ring");

  if (cursorDot && cursorRing && finePointer && !reduceMotion) {
    root.classList.add("has-cursor");

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let started = false;

    const interactiveSelector = "a, button, [data-cursor]";

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") {
          return;
        }

        mouseX = event.clientX;
        mouseY = event.clientY;
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

        if (!started) {
          // Mulai dari posisi mouse, bukan dari pojok layar.
          started = true;
          ringX = mouseX;
          ringY = mouseY;
          root.classList.add("cursor-on");
        }
      },
      { passive: true },
    );

    const followMouse = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      window.requestAnimationFrame(followMouse);
    };

    followMouse();

    // Reaksi saat berada di atas elemen yang bisa diklik.
    document.addEventListener("pointerover", (event) => {
      root.classList.toggle(
        "is-hover",
        Boolean(event.target.closest(interactiveSelector)),
      );
    });

    document.addEventListener("pointerdown", () =>
      root.classList.add("is-down"),
    );
    document.addEventListener("pointerup", () =>
      root.classList.remove("is-down"),
    );

    root.addEventListener("mouseleave", () =>
      root.classList.remove("cursor-on"),
    );
    root.addEventListener("mouseenter", () => {
      if (started) {
        root.classList.add("cursor-on");
      }
    });
  }

  /* ---------------------------------------------------------
     11. CERTIFICATE LIGHTBOX
  --------------------------------------------------------- */

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $("#lightboxClose");

  if (lightbox && lightboxImage && lightboxClose) {
    let lastFocusedElement = null;

    const openLightbox = (button) => {
      const source = button.dataset.lightbox;

      if (!source) {
        return;
      }

      lastFocusedElement = button;

      lightboxImage.src = source;
      lightboxImage.alt = button.dataset.alt || "Pratinjau sertifikat";

      lightbox.inert = false;
      lightbox.setAttribute("aria-hidden", "false");
      lightbox.classList.add("active");
      body.classList.add("no-scroll");

      lightboxClose.focus();
    };

    const closeLightbox = () => {
      if (!lightbox.classList.contains("active")) {
        return;
      }

      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.inert = true;
      body.classList.remove("no-scroll");

      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";

      if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    };

    $$("[data-lightbox]").forEach((button) => {
      button.addEventListener("click", () => openLightbox(button));
    });

    lightboxClose.addEventListener("click", closeLightbox);

    // Tutup ketika latar belakang diklik.
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard: Escape menutup, Tab dikunci pada tombol tutup.
    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("active")) {
        return;
      }

      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "Tab") {
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     12. IMAGE ERROR FALLBACK
  --------------------------------------------------------- */

  $$("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-error");
      console.warn("Gambar tidak dapat dimuat:", image.getAttribute("src"));
    });
  });
});

/* =========================================================
   APU DIGITAL PORTFOLIO V5
   Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ---------------------------------------------------------
     1. BASIC SETTINGS
  --------------------------------------------------------- */

  const root = document.documentElement;
  const body = document.body;

  const reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const desktopQuery = window.matchMedia
    ? window.matchMedia("(min-width: 851px)")
    : null;

  /* ---------------------------------------------------------
     2. FOOTER YEAR
  --------------------------------------------------------- */

  const yearElement = document.getElementById("tahun");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     3. MOBILE NAVIGATION
  --------------------------------------------------------- */

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    const navItems = navLinks.querySelectorAll("a");

    const closeMenu = ({ returnFocus = false } = {}) => {
      const wasOpen = menuToggle.getAttribute("aria-expanded") === "true";

      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Buka menu navigasi");

      if (returnFocus && wasOpen) {
        menuToggle.focus();
      }
    };

    const openMenu = () => {
      navLinks.classList.add("open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Tutup menu navigasi");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Tutup menu setelah navigasi dipilih.
    navItems.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Tutup menu dengan Escape dan kembalikan fokus.
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuToggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu({ returnFocus: true });
      }
    });

    // Tutup menu ketika area di luar navigasi diklik.
    document.addEventListener("click", (event) => {
      const clickedInsideMenu = navLinks.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        closeMenu();
      }
    });

    // Tutup menu ketika kembali ke ukuran desktop.
    if (desktopQuery) {
      const handleDesktopChange = (event) => {
        if (event.matches) {
          closeMenu();
        }
      };

      if (desktopQuery.addEventListener) {
        desktopQuery.addEventListener("change", handleDesktopChange);
      } else if (desktopQuery.addListener) {
        desktopQuery.addListener(handleDesktopChange);
      }
    }
  }

  /* ---------------------------------------------------------
     4. CERTIFICATE LIGHTBOX
  --------------------------------------------------------- */

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");

  const certificateButtons = document.querySelectorAll("[data-lightbox]");

  if (lightbox && lightboxImage && lightboxClose) {
    let lastFocusedElement = null;

    const openLightbox = (button) => {
      const imageSource = button.getAttribute("data-lightbox");

      if (!imageSource) {
        return;
      }

      const imageDescription =
        button.getAttribute("data-alt") || "Pratinjau sertifikat";

      lastFocusedElement = button;

      lightboxImage.src = imageSource;
      lightboxImage.alt = imageDescription;

      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      lightbox.inert = false;

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

    // Buka gambar sertifikat.
    certificateButtons.forEach((button) => {
      button.addEventListener("click", () => {
        openLightbox(button);
      });
    });

    // Tutup melalui tombol X.
    lightboxClose.addEventListener("click", closeLightbox);

    // Tutup ketika latar belakang diklik.
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    // Kontrol keyboard untuk lightbox.
    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "Tab") {
        // Hanya tombol tutup yang menjadi fokus keyboard
        // di dalam lightbox saat ini.
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     5. BACK TO TOP
  --------------------------------------------------------- */

  const backToTop = document.getElementById("backToTop");

  if (backToTop) {
    const updateBackToTop = () => {
      if (window.scrollY > 450) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", updateBackToTop, {
      passive: true,
    });

    // Periksa posisi awal halaman.
    updateBackToTop();

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------------------------------------------------------
     6. SCROLL REVEAL
  --------------------------------------------------------- */

  const revealElements = document.querySelectorAll(".js-reveal");

  const revealAll = () => {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // Tampilkan semua elemen tanpa animasi.
    revealAll();
  } else {
    try {
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
          rootMargin: "0px 0px -35px 0px",
        },
      );

      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });

      // Pengaman agar elemen tidak tertahan tersembunyi.
      window.setTimeout(() => {
        revealElements.forEach((element) => {
          const rect = element.getBoundingClientRect();

          if (rect.top < window.innerHeight + 100) {
            element.classList.add("is-visible");
            revealObserver.unobserve(element);
          }
        });
      }, 1200);
    } catch (error) {
      console.warn("Scroll reveal tidak dapat dijalankan:", error);
      revealAll();
    }
  }

  /* ---------------------------------------------------------
     7. ACTIVE NAVIGATION
  --------------------------------------------------------- */

  const pageSections = Array.from(
    document.querySelectorAll("main section[id]"),
  );

  const navigationItems = document.querySelectorAll('.nav-links a[href^="#"]');

  const setActiveNavigation = (sectionId) => {
    navigationItems.forEach((link) => {
      const targetId = link.getAttribute("href").slice(1);

      if (targetId === sectionId) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if (pageSections.length > 0 && navigationItems.length > 0) {
    let navigationFrame = null;

    const updateActiveNavigation = () => {
      navigationFrame = null;

      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.getBoundingClientRect().height : 0;

      const referencePosition = headerHeight + 80;
      let activeSection = pageSections[0];

      pageSections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= referencePosition) {
          activeSection = section;
        }
      });

      // Pastikan bagian terakhir aktif ketika sampai di bawah halaman.
      const atPageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atPageBottom) {
        activeSection = pageSections[pageSections.length - 1];
      }

      setActiveNavigation(activeSection.id);
    };

    const requestNavigationUpdate = () => {
      if (navigationFrame !== null) {
        return;
      }

      navigationFrame = window.requestAnimationFrame(updateActiveNavigation);
    };

    window.addEventListener("scroll", requestNavigationUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestNavigationUpdate);

    // Periksa bagian aktif saat halaman pertama kali dibuka.
    updateActiveNavigation();
  }

  /* ---------------------------------------------------------
     8. IMAGE ERROR HANDLING
  --------------------------------------------------------- */

  const images = document.querySelectorAll("img");

  images.forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-error");

      console.warn("Gambar tidak dapat dimuat:", image.getAttribute("src"));
    });
  });

  /* ---------------------------------------------------------
     9. INITIALIZE REVEAL SAFELY
  --------------------------------------------------------- */

  // Aktifkan animasi CSS setelah fitur dasar disiapkan.
  if (!reduceMotion && "IntersectionObserver" in window) {
    root.classList.add("js-enabled");
  } else {
    root.classList.remove("js-enabled");
    revealAll();
  }

  /* ---------------------------------------------------------
     10. CONSOLE INFORMATION
  --------------------------------------------------------- */

  console.log(
    "%c APU DIGITAL PORTFOLIO V5 ",
    "background: #718575; color: white; padding: 8px 12px; border-radius: 5px; font-weight: bold;",
  );
});

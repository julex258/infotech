"use strict";

/*
  InfoTech
  Funcionalidades:
  - Tema claro/escuro
  - Menu responsivo
  - Cartões expansíveis
  - Carrossel acessível
  - Validação e mensagem do formulário
*/

const toggleButton = document.querySelector("#theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#main-menu");
const expandButtons = document.querySelectorAll(".expand-btn");

/* =====================================================
   TEMA CLARO E ESCURO
===================================================== */

function getStoredTheme() {
  try {
    return localStorage.getItem("infotech-theme");
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("infotech-theme", theme);
  } catch {
    // O site continua a funcionar mesmo sem localStorage.
  }
}

function getInitialTheme() {
  const savedTheme = getStoredTheme();

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;

  return prefersLight ? "light" : "dark";
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);

  if (!toggleButton) {
    return;
  }

  const isLightTheme = theme === "light";

  toggleButton.textContent = isLightTheme ? "🌙" : "☀️";

  toggleButton.setAttribute(
    "aria-label",
    isLightTheme ? "Ativar tema escuro" : "Ativar tema claro",
  );

  toggleButton.setAttribute("aria-pressed", String(isLightTheme));
}

if (toggleButton) {
  const initialTheme = getInitialTheme();

  applyTheme(initialTheme);

  toggleButton.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme") || "dark";

    const nextTheme = currentTheme === "light" ? "dark" : "light";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });
}

/* =====================================================
   MENU RESPONSIVO
===================================================== */

function setMenuState(isOpen) {
  if (!menu || !menuToggle) {
    return;
  }

  menu.classList.toggle("open", isOpen);

  menuToggle.setAttribute("aria-expanded", String(isOpen));

  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
}

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("open");

    setMenuState(!isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu =
      menu.contains(event.target) || menuToggle.contains(event.target);

    if (!clickedInsideMenu) {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) {
      setMenuState(false);
    }
  });
}

/* =====================================================
   CARTÕES "LER MAIS"
===================================================== */

function setupExpandableCards() {
  expandButtons.forEach((button) => {
    const detailsId = button.getAttribute("aria-controls");
    const details = detailsId ? document.getElementById(detailsId) : null;

    const card = button.closest(".area-card");

    if (!card || !details) {
      return;
    }

    const initiallyExpanded = button.getAttribute("aria-expanded") === "true";

    details.hidden = !initiallyExpanded;
    card.classList.toggle("is-open", initiallyExpanded);

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";

      const nextState = !isExpanded;

      button.setAttribute("aria-expanded", String(nextState));

      button.textContent = nextState ? "Ler menos" : "Ler mais";

      details.hidden = !nextState;

      card.classList.toggle("is-open", nextState);
    });
  });
}

setupExpandableCards();

/* =====================================================
   CARROSSEL
===================================================== */

const carousel = document.querySelector("#tech-carousel");

function setupCarousel() {
  if (!carousel) {
    return;
  }

  const slides = carousel.querySelectorAll(".carousel-slide");
  const indicators = carousel.querySelectorAll(".carousel-indicator");
  const previousButton = carousel.querySelector("#carousel-prev");
  const nextButton = carousel.querySelector("#carousel-next");
  const pauseButton = carousel.querySelector("#carousel-pause");

  if (slides.length === 0 || !previousButton || !nextButton || !pauseButton) {
    return;
  }

  let currentSlide = 0;
  let carouselInterval = null;
  let isPaused = false;
  let isPointerInside = false;
  let isFocusedInside = false;

  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentSlide;

      slide.classList.toggle("is-active", isActive);

      slide.hidden = !isActive;

      slide.setAttribute("aria-hidden", String(!isActive));
    });

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === currentSlide;

      indicator.classList.toggle("is-active", isActive);

      indicator.setAttribute("aria-current", String(isActive));
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function previousSlide() {
    showSlide(currentSlide - 1);
  }

  function stopCarousel() {
    if (carouselInterval !== null) {
      window.clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  function canAutoPlay() {
    return (
      !isPaused &&
      !isPointerInside &&
      !isFocusedInside &&
      !motionPreference.matches &&
      !document.hidden
    );
  }

  function startCarousel() {
    stopCarousel();

    if (!canAutoPlay()) {
      return;
    }

    carouselInterval = window.setInterval(nextSlide, 2500);
  }

  function updatePauseButton() {
    pauseButton.textContent = isPaused ? "Iniciar" : "Pausar";

    pauseButton.setAttribute(
      "aria-label",
      isPaused ? "Iniciar carrossel" : "Pausar carrossel",
    );

    pauseButton.setAttribute("aria-pressed", String(isPaused));
  }

  function pauseAfterManualAction() {
    isPaused = true;
    updatePauseButton();
    stopCarousel();
  }

  previousButton.addEventListener("click", () => {
    pauseAfterManualAction();
    previousSlide();
  });

  nextButton.addEventListener("click", () => {
    pauseAfterManualAction();
    nextSlide();
  });

  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;

    updatePauseButton();

    if (isPaused) {
      stopCarousel();
    } else {
      startCarousel();
    }
  });

  indicators.forEach((indicator) => {
    indicator.addEventListener("click", () => {
      const slideIndex = Number(indicator.getAttribute("data-slide-to"));

      if (Number.isNaN(slideIndex)) {
        return;
      }

      pauseAfterManualAction();
      showSlide(slideIndex);
    });
  });

  carousel.addEventListener("mouseenter", () => {
    isPointerInside = true;
    stopCarousel();
  });

  carousel.addEventListener("mouseleave", () => {
    isPointerInside = false;
    startCarousel();
  });

  carousel.addEventListener("focusin", () => {
    isFocusedInside = true;
    stopCarousel();
  });

  carousel.addEventListener("focusout", (event) => {
    const focusMovedInside =
      event.relatedTarget && carousel.contains(event.relatedTarget);

    if (!focusMovedInside) {
      isFocusedInside = false;
      startCarousel();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCarousel();
    } else {
      startCarousel();
    }
  });

  function handleMotionPreferenceChange() {
    if (motionPreference.matches) {
      stopCarousel();
    } else {
      startCarousel();
    }
  }

  if (typeof motionPreference.addEventListener === "function") {
    motionPreference.addEventListener("change", handleMotionPreferenceChange);
  } else {
    motionPreference.addListener(handleMotionPreferenceChange);
  }

  showSlide(0);
  updatePauseButton();
  startCarousel();
}

setupCarousel();

/* =====================================================
   FORMULÁRIO DE CONTACTO
===================================================== */

const contactForm = document.querySelector('form[action^="mailto:"]');

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    if (!contactForm.checkValidity()) {
      event.preventDefault();
      contactForm.reportValidity();
      return;
    }

    const existingMessage = contactForm.querySelector(".form-success");

    if (existingMessage) {
      existingMessage.remove();
    }

    const successMessage = document.createElement("p");

    successMessage.className = "form-success";
    successMessage.setAttribute("role", "status");
    successMessage.textContent =
      "A mensagem está pronta para ser enviada através do seu programa de e-mail.";

    contactForm.prepend(successMessage);
  });
}

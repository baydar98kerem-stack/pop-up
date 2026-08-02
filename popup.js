(function () {
  "use strict";

  var CONFIG = {
    imageUrl:
      "https://res.cloudinary.com/ylbbwkdr/image/upload/f_auto,q_auto/Pop-up_ekv3is",

    targetUrl: "https://calixie.com/new-in",

    delayMs: 4000,

    repeatAfterDays: 3,

    storageKey: "calixie_welcome_popup_closed_at",

    overlayId: "calixie-welcome-popup-overlay",

    styleId: "calixie-welcome-popup-style"
  };

  if (window.calixieWelcomePopupInitialized) {
    return;
  }

  window.calixieWelcomePopupInitialized = true;

  function shouldShowPopup() {
    try {
      var closedAt = localStorage.getItem(CONFIG.storageKey);

      if (!closedAt) {
        return true;
      }

      var closedTime = Number(closedAt);

      if (!closedTime || Number.isNaN(closedTime)) {
        return true;
      }

      var repeatAfterMs =
        CONFIG.repeatAfterDays * 24 * 60 * 60 * 1000;

      return Date.now() - closedTime >= repeatAfterMs;
    } catch (error) {
      return true;
    }
  }

  function saveCloseTime() {
    try {
      localStorage.setItem(
        CONFIG.storageKey,
        String(Date.now())
      );
    } catch (error) {
      // localStorage kapalıysa popup yine çalışmaya devam eder.
    }
  }

  function removeExistingPopup() {
    var oldOverlay = document.getElementById(CONFIG.overlayId);
    var oldStyle = document.getElementById(CONFIG.styleId);

    if (oldOverlay) {
      oldOverlay.remove();
    }

    if (oldStyle) {
      oldStyle.remove();
    }

    document.documentElement.classList.remove(
      "calixie-popup-scroll-lock"
    );

    document.body.classList.remove(
      "calixie-popup-scroll-lock"
    );
  }

  function createPopup() {
    if (!document.body) {
      return;
    }

    if (document.getElementById(CONFIG.overlayId)) {
      return;
    }

    var style = document.createElement("style");
    style.id = CONFIG.styleId;

    style.textContent = `
      html.calixie-popup-scroll-lock,
      body.calixie-popup-scroll-lock {
        overflow: hidden !important;
        overscroll-behavior: none;
      }

      #${CONFIG.overlayId} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 28px;
        box-sizing: border-box;
        background: rgba(0, 0, 0, 0.70);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 380ms ease,
          visibility 380ms ease;
      }

      #${CONFIG.overlayId}.is-visible {
        opacity: 1;
        visibility: visible;
      }

      #calixie-welcome-popup-dialog {
        position: relative;
        width: min(760px, 86vw);
        max-height: 84vh;
        border-radius: 2px;
        background: #080808;
        box-shadow:
          0 28px 90px rgba(0, 0, 0, 0.62),
          0 0 0 1px rgba(205, 167, 93, 0.18);
        opacity: 0;
        transform: translateY(22px) scale(0.94);
        transition:
          opacity 420ms ease,
          transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform, opacity;
      }

      #${CONFIG.overlayId}.is-visible
      #calixie-welcome-popup-dialog {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      #calixie-welcome-popup-link {
        display: block;
        overflow: hidden;
        line-height: 0;
        border-radius: inherit;
        cursor: pointer;
      }

      #calixie-welcome-popup-image {
        display: block;
        width: 100%;
        height: auto;
        max-height: 84vh;
        object-fit: contain;
        user-select: none;
        -webkit-user-drag: none;
      }

      #calixie-welcome-popup-close {
        position: absolute;
        top: -14px;
        right: -14px;
        z-index: 3;
        width: 34px;
        height: 34px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(214, 177, 101, 0.88);
        border-radius: 50%;
        background: rgba(10, 10, 10, 0.96);
        color: #d6b165;
        font-family: Arial, sans-serif;
        font-size: 21px;
        font-weight: 300;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.46);
        transition:
          transform 220ms ease,
          background-color 220ms ease,
          color 220ms ease,
          border-color 220ms ease;
      }

      #calixie-welcome-popup-close:hover {
        transform: rotate(90deg) scale(1.04);
        background: #d6b165;
        color: #090909;
        border-color: #d6b165;
      }

      #calixie-welcome-popup-close:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 4px;
      }

      @media (max-width: 768px) {
        #${CONFIG.overlayId} {
          padding: 18px;
        }

        #calixie-welcome-popup-dialog {
          width: min(92vw, 620px);
          max-height: 82vh;
        }

        #calixie-welcome-popup-image {
          max-height: 82vh;
        }

        #calixie-welcome-popup-close {
          top: -11px;
          right: -8px;
          width: 33px;
          height: 33px;
          font-size: 20px;
        }
      }

      @media (max-width: 480px) {
        #${CONFIG.overlayId} {
          padding: 12px;
        }

        #calixie-welcome-popup-dialog {
          width: 94vw;
          max-height: 80vh;
        }

        #calixie-welcome-popup-image {
          max-height: 80vh;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${CONFIG.overlayId},
        #calixie-welcome-popup-dialog,
        #calixie-welcome-popup-close {
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);

    var overlay = document.createElement("div");
    overlay.id = CONFIG.overlayId;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute(
      "aria-label",
      "Calixie hoş geldin indirimi"
    );

    var dialog = document.createElement("div");
    dialog.id = "calixie-welcome-popup-dialog";

    var closeButton = document.createElement("button");
    closeButton.id = "calixie-welcome-popup-close";
    closeButton.type = "button";
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute(
      "aria-label",
      "Hoş geldin pop-up'ını kapat"
    );

    var link = document.createElement("a");
    link.id = "calixie-welcome-popup-link";
    link.href = CONFIG.targetUrl;
    link.setAttribute(
      "aria-label",
      "Calixie yeni gelenler koleksiyonunu keşfet"
    );

    var image = document.createElement("img");
    image.id = "calixie-welcome-popup-image";
    image.src = CONFIG.imageUrl;
    image.alt =
      "Calixie dünyasına hoş geldiniz. İlk alışverişinize özel yüzde 10 indirim.";
    image.decoding = "async";
    image.fetchPriority = "high";

    link.appendChild(image);
    dialog.appendChild(closeButton);
    dialog.appendChild(link);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    var isClosing = false;
    var previousFocusedElement = document.activeElement;

    function unlockPage() {
      document.documentElement.classList.remove(
        "calixie-popup-scroll-lock"
      );

      document.body.classList.remove(
        "calixie-popup-scroll-lock"
      );
    }

    function closePopup(rememberClose) {
      if (isClosing) {
        return;
      }

      isClosing = true;

      if (rememberClose !== false) {
        saveCloseTime();
      }

      overlay.classList.remove("is-visible");
      unlockPage();

      document.removeEventListener("keydown", handleKeydown);

      window.setTimeout(function () {
        overlay.remove();
        style.remove();

        if (
          previousFocusedElement &&
          typeof previousFocusedElement.focus === "function"
        ) {
          try {
            previousFocusedElement.focus({
              preventScroll: true
            });
          } catch (error) {
            previousFocusedElement.focus();
          }
        }
      }, 540);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        closePopup(true);
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        closeButton.focus();
      }
    }

    closeButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      closePopup(true);
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closePopup(true);
      }
    });

    link.addEventListener("click", function () {
      saveCloseTime();
      unlockPage();
    });

    image.addEventListener("error", function () {
      console.error(
        "Calixie pop-up görseli yüklenemedi."
      );

      closePopup(false);
    });

    document.addEventListener("keydown", handleKeydown);

    document.documentElement.classList.add(
      "calixie-popup-scroll-lock"
    );

    document.body.classList.add(
      "calixie-popup-scroll-lock"
    );

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("is-visible");

        try {
          closeButton.focus({
            preventScroll: true
          });
        } catch (error) {
          closeButton.focus();
        }
      });
    });
  }

  function initializePopup() {
    if (!shouldShowPopup()) {
      return;
    }

    window.setTimeout(createPopup, CONFIG.delayMs);
  }

  removeExistingPopup();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializePopup,
      { once: true }
    );
  } else {
    initializePopup();
  }
})();

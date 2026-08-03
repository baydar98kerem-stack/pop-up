(function () {
  "use strict";

  var CONFIG = {
    targetUrl: "https://calixie.com/new-in",

    // Hoş geldin popup'ı kapandıktan veya popup görünmüyorsa
    // sayfa açıldıktan 45 saniye sonra gösterilir.
    delayMs: 45000,

    cardId: "calixie-reminder-card-v2",
    styleId: "calixie-reminder-style-v2",

    welcomePopupId: "calixie-welcome-popup-overlay",
    welcomeClosedKey: "calixie_welcome_popup_closed_at",

    sessionShownKey: "calixie_reminder_v2_shown",
    sessionDismissedKey: "calixie_reminder_v2_dismissed"
  };

  if (window.calixieReminderV2Initialized) {
    return;
  }

  window.calixieReminderV2Initialized = true;

  function sessionGet(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function sessionSet(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // sessionStorage engellense bile kart çalışmaya devam eder.
    }
  }

  function hasAlreadyBeenShown() {
    return sessionGet(CONFIG.sessionShownKey) === "true";
  }

  function hasBeenDismissed() {
    return sessionGet(CONFIG.sessionDismissedKey) === "true";
  }

  function markAsShown() {
    sessionSet(CONFIG.sessionShownKey, "true");
  }

  function markAsDismissed() {
    sessionSet(CONFIG.sessionDismissedKey, "true");
  }

  function isWelcomePopupOpen() {
    var popup = document.getElementById(CONFIG.welcomePopupId);

    if (!popup) {
      return false;
    }

    return popup.classList.contains("is-visible");
  }

  function removeExistingCard() {
    var existingCard = document.getElementById(CONFIG.cardId);
    var existingStyle = document.getElementById(CONFIG.styleId);

    if (existingCard) {
      existingCard.remove();
    }

    if (existingStyle) {
      existingStyle.remove();
    }
  }

  function createReminderCard() {
    if (!document.body) {
      return;
    }

    if (
      document.getElementById(CONFIG.cardId) ||
      hasAlreadyBeenShown() ||
      hasBeenDismissed()
    ) {
      return;
    }

    // Hoş geldin popup'ı hâlâ açıksa kartı göstermeyip bekler.
    if (isWelcomePopupOpen()) {
      window.setTimeout(createReminderCard, 2000);
      return;
    }

    markAsShown();

    var style = document.createElement("style");
    style.id = CONFIG.styleId;

    style.textContent = `
      #${CONFIG.cardId} {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 2147483600;
        width: min(370px, calc(100vw - 48px));
        box-sizing: border-box;
        overflow: hidden;

        border: 1px solid rgba(211, 173, 96, 0.48);
        border-radius: 4px;

        background:
          radial-gradient(
            circle at top right,
            rgba(118, 22, 36, 0.22),
            transparent 45%
          ),
          linear-gradient(
            135deg,
            rgba(45, 5, 13, 0.985),
            rgba(13, 8, 9, 0.99)
          );

        box-shadow:
          0 25px 70px rgba(0, 0, 0, 0.46),
          0 0 0 1px rgba(255, 255, 255, 0.025);

        opacity: 0;
        visibility: hidden;
        transform: translateY(28px) scale(0.96);

        transition:
          opacity 420ms ease,
          visibility 420ms ease,
          transform 520ms cubic-bezier(0.22, 1, 0.36, 1);

        font-family: Arial, Helvetica, sans-serif;
      }

      #${CONFIG.cardId}.calixie-reminder-visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      #${CONFIG.cardId}::before {
        content: "";
        position: absolute;
        top: 0;
        left: 24px;
        right: 24px;
        height: 1px;

        background: linear-gradient(
          90deg,
          transparent,
          rgba(224, 190, 119, 0.98),
          transparent
        );
      }

      .calixie-reminder-v2-content {
        position: relative;
        padding: 25px 56px 23px 25px;
      }

      .calixie-reminder-v2-label {
        margin: 0 0 9px;

        color: #d9b66e;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.4;
        letter-spacing: 2.3px;
        text-transform: uppercase;
      }

      .calixie-reminder-v2-title {
        margin: 0 0 9px;

        color: #fff8ec;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 23px;
        font-weight: 400;
        line-height: 1.18;
      }

      .calixie-reminder-v2-text {
        margin: 0 0 18px;

        color: rgba(255, 248, 236, 0.76);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.55;
      }

      .calixie-reminder-v2-link {
        display: inline-flex;
        align-items: center;
        gap: 9px;

        color: #dab66e;
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 1.55px;
        text-decoration: none;
        text-transform: uppercase;

        transition:
          color 200ms ease,
          gap 200ms ease;
      }

      .calixie-reminder-v2-link::after {
        content: "→";
        font-size: 16px;
        font-weight: 400;
        line-height: 1;

        transition: transform 200ms ease;
      }

      .calixie-reminder-v2-link:hover {
        gap: 13px;
        color: #f0d392;
      }

      .calixie-reminder-v2-link:hover::after {
        transform: translateX(2px);
      }

      .calixie-reminder-v2-close {
        position: absolute;
        top: 15px;
        right: 15px;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 29px;
        height: 29px;
        padding: 0;

        border: 1px solid rgba(218, 182, 110, 0.42);
        border-radius: 50%;

        background: transparent;
        color: rgba(218, 182, 110, 0.9);

        font-family: Arial, sans-serif;
        font-size: 18px;
        font-weight: 300;
        line-height: 1;

        cursor: pointer;

        transition:
          color 200ms ease,
          background-color 200ms ease,
          border-color 200ms ease,
          transform 200ms ease;
      }

      .calixie-reminder-v2-close:hover {
        color: #1a090c;
        background: #d9b66e;
        border-color: #d9b66e;
        transform: rotate(90deg);
      }

      .calixie-reminder-v2-close:focus-visible,
      .calixie-reminder-v2-link:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
      }

      @media (max-width: 600px) {
        #${CONFIG.cardId} {
          right: 12px;
          bottom: calc(12px + env(safe-area-inset-bottom));
          left: 12px;
          width: auto;
        }

        .calixie-reminder-v2-content {
          padding: 21px 52px 21px 21px;
        }

        .calixie-reminder-v2-title {
          font-size: 21px;
        }

        .calixie-reminder-v2-text {
          font-size: 12.5px;
        }

        .calixie-reminder-v2-close {
          top: 13px;
          right: 13px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${CONFIG.cardId},
        .calixie-reminder-v2-close,
        .calixie-reminder-v2-link,
        .calixie-reminder-v2-link::after {
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);

    var card = document.createElement("aside");
    card.id = CONFIG.cardId;

    card.setAttribute(
      "aria-label",
      "Calixie hoş geldin indirimi hatırlatması"
    );

    card.innerHTML = `
      <div class="calixie-reminder-v2-content">
        <button
          class="calixie-reminder-v2-close"
          type="button"
          aria-label="Hatırlatma kartını kapat"
        >
          &times;
        </button>

        <p class="calixie-reminder-v2-label">
          Calixie ayrıcalığı
        </p>

        <h2 class="calixie-reminder-v2-title">
          Hoş geldin ayrıcalığın hazır.
        </h2>

        <p class="calixie-reminder-v2-text">
          İlk alışverişine özel %10 indirim ile
          Calixie'nin yeni parçalarını keşfet.
        </p>

        <a
          class="calixie-reminder-v2-link"
          href="${CONFIG.targetUrl}"
          aria-label="Calixie yeni gelenler koleksiyonunu keşfet"
        >
          Yeni Gelenleri Keşfet
        </a>
      </div>
    `;

    document.body.appendChild(card);

    var closeButton = card.querySelector(
      ".calixie-reminder-v2-close"
    );

    var link = card.querySelector(
      ".calixie-reminder-v2-link"
    );

    var isClosing = false;

    function closeCard() {
      if (isClosing) {
        return;
      }

      isClosing = true;
      markAsDismissed();

      card.classList.remove("calixie-reminder-visible");

      window.setTimeout(function () {
        card.remove();
        style.remove();
      }, 520);
    }

    closeButton.addEventListener("click", closeCard);

    link.addEventListener("click", function () {
      markAsDismissed();
    });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        card.classList.add("calixie-reminder-visible");
      });
    });
  }

  function initializeReminder() {
    removeExistingCard();

    if (hasAlreadyBeenShown() || hasBeenDismissed()) {
      return;
    }

    window.setTimeout(createReminderCard, CONFIG.delayMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeReminder,
      { once: true }
    );
  } else {
    initializeReminder();
  }
})();

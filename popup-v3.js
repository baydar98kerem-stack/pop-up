(function () {
  "use strict";

  var CONFIG = {
    cartUrl: window.location.origin + "/cart",

    showDelayMs: 1000,
    autoCloseMs: 8000,
    clickCooldownMs: 3000,
    maximumShowsPerSession: 3,

    cardId: "calixie-crosssell-card-v2",
    styleId: "calixie-crosssell-style-v2",

    showCountKey: "calixie_crosssell_v2_show_count",
    lastTriggerKey: "calixie_crosssell_v2_last_trigger",

    reminderCardId: "calixie-reminder-card-v2"
  };

  if (window.calixieCrossSellV2Initialized) {
    return;
  }

  window.calixieCrossSellV2Initialized = true;

  function sessionGet(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function sessionSet(key, value) {
    try {
      sessionStorage.setItem(key, String(value));
    } catch (error) {
      // sessionStorage kapalı olsa da bildirim çalışır.
    }
  }

  function getShowCount() {
    var count = Number(sessionGet(CONFIG.showCountKey));

    if (!Number.isFinite(count)) {
      return 0;
    }

    return count;
  }

  function increaseShowCount() {
    sessionSet(
      CONFIG.showCountKey,
      getShowCount() + 1
    );
  }

  function canShowAgain() {
    if (
      getShowCount() >=
      CONFIG.maximumShowsPerSession
    ) {
      return false;
    }

    var lastTrigger = Number(
      sessionGet(CONFIG.lastTriggerKey)
    );

    if (
      Number.isFinite(lastTrigger) &&
      Date.now() - lastTrigger <
        CONFIG.clickCooldownMs
    ) {
      return false;
    }

    return true;
  }

  function markTriggerTime() {
    sessionSet(
      CONFIG.lastTriggerKey,
      Date.now()
    );
  }

  function removeReminderCard() {
    var reminder = document.getElementById(
      CONFIG.reminderCardId
    );

    if (reminder) {
      reminder.classList.remove(
        "calixie-reminder-visible"
      );

      window.setTimeout(function () {
        if (reminder.parentNode) {
          reminder.remove();
        }
      }, 400);
    }
  }

  function removeExistingCrossSellCard() {
    var card = document.getElementById(
      CONFIG.cardId
    );

    var style = document.getElementById(
      CONFIG.styleId
    );

    if (card) {
      card.remove();
    }

    if (style) {
      style.remove();
    }
  }

  function createCrossSellCard() {
    if (
      !document.body ||
      !canShowAgain()
    ) {
      return;
    }

    removeExistingCrossSellCard();
    removeReminderCard();

    increaseShowCount();
    markTriggerTime();

    var style = document.createElement("style");
    style.id = CONFIG.styleId;

    style.textContent = `
      #${CONFIG.cardId} {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 2147483650;

        width: min(380px, calc(100vw - 48px));
        box-sizing: border-box;
        overflow: hidden;

        border: 1px solid rgba(215, 178, 105, 0.52);
        border-radius: 4px;

        background:
          radial-gradient(
            circle at top right,
            rgba(120, 20, 37, 0.24),
            transparent 46%
          ),
          linear-gradient(
            135deg,
            rgba(44, 5, 13, 0.99),
            rgba(12, 8, 9, 0.995)
          );

        box-shadow:
          0 25px 72px rgba(0, 0, 0, 0.48),
          0 0 0 1px rgba(255, 255, 255, 0.025);

        opacity: 0;
        visibility: hidden;
        transform: translateY(28px) scale(0.96);

        transition:
          opacity 400ms ease,
          visibility 400ms ease,
          transform 520ms
            cubic-bezier(0.22, 1, 0.36, 1);

        font-family:
          Arial,
          Helvetica,
          sans-serif;
      }

      #${CONFIG.cardId}.calixie-crosssell-visible {
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
          rgba(228, 193, 121, 0.98),
          transparent
        );
      }

      .calixie-crosssell-content {
        position: relative;
        padding: 25px 57px 23px 25px;
      }

      .calixie-crosssell-label {
        margin: 0 0 9px;

        color: #dcb971;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.4;
        letter-spacing: 2.3px;
        text-transform: uppercase;
      }

      .calixie-crosssell-title {
        margin: 0 0 9px;

        color: #fff8ed;
        font-family:
          Georgia,
          "Times New Roman",
          serif;
        font-size: 24px;
        font-weight: 400;
        line-height: 1.16;
      }

      .calixie-crosssell-text {
        margin: 0 0 18px;

        color: rgba(255, 248, 237, 0.78);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.55;
      }

      .calixie-crosssell-highlight {
        color: #e2bf77;
        font-weight: 600;
      }

      .calixie-crosssell-link {
        display: inline-flex;
        align-items: center;
        gap: 9px;

        color: #dcb971;
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

      .calixie-crosssell-link::after {
        content: "→";
        font-size: 16px;
        font-weight: 400;
        line-height: 1;

        transition: transform 200ms ease;
      }

      .calixie-crosssell-link:hover {
        gap: 13px;
        color: #f3d696;
      }

      .calixie-crosssell-link:hover::after {
        transform: translateX(2px);
      }

      .calixie-crosssell-close {
        position: absolute;
        top: 15px;
        right: 15px;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 29px;
        height: 29px;
        padding: 0;

        border:
          1px solid rgba(220, 185, 113, 0.42);
        border-radius: 50%;

        background: transparent;
        color: rgba(220, 185, 113, 0.92);

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

      .calixie-crosssell-close:hover {
        color: #19090c;
        background: #dcb971;
        border-color: #dcb971;
        transform: rotate(90deg);
      }

      .calixie-crosssell-progress {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;

        height: 2px;
        overflow: hidden;

        background: rgba(255, 255, 255, 0.05);
      }

      .calixie-crosssell-progress::after {
        content: "";
        display: block;

        width: 100%;
        height: 100%;

        background: linear-gradient(
          90deg,
          rgba(215, 178, 105, 0.5),
          #e4c179
        );

        transform-origin: left center;

        animation:
          calixieCrossSellProgress
          ${CONFIG.autoCloseMs}ms
          linear
          forwards;
      }

      @keyframes calixieCrossSellProgress {
        from {
          transform: scaleX(1);
        }

        to {
          transform: scaleX(0);
        }
      }

      .calixie-crosssell-close:focus-visible,
      .calixie-crosssell-link:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
      }

      @media (max-width: 600px) {
        #${CONFIG.cardId} {
          right: 12px;
          bottom:
            calc(
              12px +
              env(safe-area-inset-bottom)
            );
          left: 12px;
          width: auto;
        }

        .calixie-crosssell-content {
          padding: 21px 52px 21px 21px;
        }

        .calixie-crosssell-title {
          font-size: 21px;
        }

        .calixie-crosssell-text {
          font-size: 12.5px;
        }

        .calixie-crosssell-close {
          top: 13px;
          right: 13px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${CONFIG.cardId},
        .calixie-crosssell-close,
        .calixie-crosssell-link,
        .calixie-crosssell-link::after {
          transition: none !important;
        }

        .calixie-crosssell-progress::after {
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(style);

    var card = document.createElement("aside");
    card.id = CONFIG.cardId;

    card.setAttribute(
      "aria-label",
      "Calixie tamamlayıcı ürün hatırlatması"
    );

    card.innerHTML = `
      <div class="calixie-crosssell-content">
        <button
          class="calixie-crosssell-close"
          type="button"
          aria-label="Tamamlayıcı ürün hatırlatmasını kapat"
        >
          &times;
        </button>

        <p class="calixie-crosssell-label">
          Calixie dokunuşu
        </p>

        <h2 class="calixie-crosssell-title">
          Görünümünü tamamla.
        </h2>

        <p class="calixie-crosssell-text">
          Sepetine özel seçili tamamlayıcı
          ürünlerde
          <span class="calixie-crosssell-highlight">
            %10 avantaj
          </span>
          seni bekliyor.
        </p>

        <a
          class="calixie-crosssell-link"
          href="${CONFIG.cartUrl}"
          aria-label="Sepeti ve tamamlayıcı ürünleri incele"
        >
          Sepeti İncele
        </a>

        <div
          class="calixie-crosssell-progress"
          aria-hidden="true"
        ></div>
      </div>
    `;

    document.body.appendChild(card);

    var closeButton = card.querySelector(
      ".calixie-crosssell-close"
    );

    var isClosing = false;
    var autoCloseTimer;

    function closeCard() {
      if (isClosing) {
        return;
      }

      isClosing = true;

      window.clearTimeout(autoCloseTimer);

      card.classList.remove(
        "calixie-crosssell-visible"
      );

      window.setTimeout(function () {
        card.remove();
        style.remove();
      }, 520);
    }

    closeButton.addEventListener(
      "click",
      closeCard
    );

    card
      .querySelector(".calixie-crosssell-link")
      .addEventListener("click", function () {
        window.clearTimeout(autoCloseTimer);
      });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        card.classList.add(
          "calixie-crosssell-visible"
        );
      });
    });

    autoCloseTimer = window.setTimeout(
      closeCard,
      CONFIG.autoCloseMs
    );
  }

  function normalizeText(element) {
    return (
      element &&
      String(
        element.innerText ||
        element.textContent ||
        ""
      )
        .trim()
        .toLocaleLowerCase("tr-TR")
    );
  }

  function isAddToCartElement(element) {
    if (!element || !element.closest) {
      return false;
    }

    var clickable = element.closest(
      [
        "button",
        "a",
        "[role='button']",
        "input[type='submit']",
        "input[type='button']"
      ].join(",")
    );

    if (!clickable) {
      return false;
    }

    var text = normalizeText(clickable);

    var attributes = [
      clickable.id,
      clickable.className,
      clickable.getAttribute("name"),
      clickable.getAttribute("aria-label"),
      clickable.getAttribute("data-testid"),
      clickable.getAttribute("data-action")
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    var combinedValue =
      text + " " + attributes;

    var addToCartPatterns = [
      "sepete ekle",
      "sepete ekleyin",
      "add to cart",
      "add-to-cart",
      "addtocart",
      "add_cart",
      "addcart"
    ];

    return addToCartPatterns.some(
      function (pattern) {
        return combinedValue.indexOf(pattern) !== -1;
      }
    );
  }

  function handleDocumentClick(event) {
    if (!isAddToCartElement(event.target)) {
      return;
    }

    if (!canShowAgain()) {
      return;
    }

    markTriggerTime();

    /*
     * İkas'ın sepete ekleme işlemini tamamlaması için
     * kısa süre beklenir.
     */
    window.setTimeout(
      createCrossSellCard,
      CONFIG.showDelayMs
    );
  }

  document.addEventListener(
    "click",
    handleDocumentClick,
    true
  );
})();

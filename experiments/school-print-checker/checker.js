(function () {
  "use strict";

  const categories = [
    {
      id: "when",
      label: "いつ",
      icon: "日",
      patterns: [
        /(?:令和\s*\d{1,2}年)?\s*\d{1,2}月\s*\d{1,2}日/,
        /\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{1,2})?/,
        /\d{1,2}時(?:\d{1,2}分)?/,
        /午前|午後|日時|日程|期日|期間|当日|本日|明日|翌日|締切|〆切|しめきり|提出期限|期限|までに|集合時間|開始|終了/,
        /(?:月|火|水|木|金|土|日)(?:曜日|曜)/,
        /\d{1,2}分(?:集合|開始|終了|まで)?/,
      ],
    },
    {
      id: "where",
      label: "どこで",
      icon: "場",
      patterns: [/場所|会場|集合場所|行き先|目的地|校庭|運動場|体育館|教室|正門|玄関|昇降口|現地|受付|集合(?:場所|時刻|時間)?/],
    },
    {
      id: "items",
      label: "持ち物",
      icon: "物",
      patterns: [/持ち物|持参|ご?用意|準備|持って(?:くる|きて|来る|来て)|服装|弁当|水筒|上履き|雨具|タオル|筆記用具|名札|帽子|体操服|軍手|かばん|バッグ/],
    },
    {
      id: "submissions",
      label: "提出物",
      icon: "提",
      patterns: [/提出|提出物|提出期限|締切|〆切|しめきり|申込|申し込み|申請|参加申込書|同意書|確認票|調査票|承諾書|出欠票|用紙|封筒|アンケート|記入|署名|押印|捺印|担任.*(?:渡|出)|提出先/],
    },
    {
      id: "money",
      label: "お金",
      icon: "円",
      patterns: [/\d[\d,，]*\s*円|金額|費用|料金|参加費|教材費|給食費|集金|振込|引き落とし|支払|現金|おつり|釣り銭|金銭用の封筒|集金用の封筒/],
    },
    {
      id: "reply",
      label: "返信が必要か",
      icon: "返",
      patterns: [/返信|返事|回答|出欠|参加(?:・|または|／|\/)?不参加|参加.*(?:する|しない)|不参加|欠席|ご?連絡.*(?:ください|お願い|必要)|提出してください|提出を?お願い|記入.*(?:ください|お願い)|回答期限/],
    },
    {
      id: "guardian",
      label: "保護者がやること",
      icon: "保",
      patterns: [/保護者|ご?家庭|家庭で|記入|署名|押印|捺印|確認.*(?:ください|お願い)|提出.*(?:ください|お願い)|連絡.*(?:ください|お願い)|持たせてください|持たせて|準備.*(?:ください|お願い)|ご?用意.*(?:ください|お願い)|お迎え|送迎|付き添い|支払|振込|申し込/],
    },
  ];

  const sampleText = `遠足のお知らせ
日時：6月18日（水）午前8時30分集合、午後3時帰校予定
集合場所：学校の正門
行き先：みどり公園
持ち物：弁当、水筒、雨具、タオル、敷物
参加費：500円。当日、おつりのないように持たせてください。
参加申込書に保護者名を記入し、6月10日までに担任へ提出してください。欠席する場合もご連絡をお願いします。`;

  function normalizeText(text) {
    return text.replace(/\r\n?/g, "\n").replace(/[\t\u3000]+/g, " ").trim();
  }

  function splitIntoSegments(text) {
    return normalizeText(text)
      .split(/\n+|(?<=[。！？!?])\s*/u)
      .map((segment) => segment.trim().replace(/^[・●■□◆◇▶▷※]+\s*/, ""))
      .filter(Boolean);
  }

  function matchesCategory(segment, category) {
    return category.patterns.some((pattern) => pattern.test(segment));
  }

  function unique(items) {
    return items.filter((item, index) => items.indexOf(item) === index);
  }

  function analyzeText(text) {
    const segments = splitIntoSegments(text);
    const results = categories.map((category) => ({
      id: category.id,
      label: category.label,
      icon: category.icon,
      items: unique(segments.filter((segment) => matchesCategory(segment, category))).slice(0, 6),
    }));

    return {
      results,
      segmentCount: segments.length,
      matchCount: results.reduce((total, result) => total + result.items.length, 0),
      matchedCategoryCount: results.filter((result) => result.items.length > 0).length,
    };
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createResultCard(result) {
    const content = result.items.length
      ? `<ul>${result.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : '<p class="no-result">見つかりませんでした</p>';

    return `
      <section class="result-card ${result.items.length ? "has-result" : ""}">
        <div class="result-card-title"><span aria-hidden="true">${result.icon}</span><h3>${result.label}</h3></div>
        ${content}
      </section>
    `;
  }

  function initializeChecker() {
    const form = document.querySelector("#checker-form");
    if (!form) return;

    const textarea = document.querySelector("#letter-text");
    const count = document.querySelector("#character-count");
    const resultsSection = document.querySelector("#checker-results");
    const resultGrid = document.querySelector("#result-grid");
    const resultSummary = document.querySelector("#result-summary");
    const resultCount = document.querySelector("#result-count");
    const feedbackMessage = document.querySelector("#feedback-message");
    const feedbackButtons = document.querySelectorAll("[data-feedback]");

    function updateCount() {
      count.textContent = `${textarea.value.length.toLocaleString("ja-JP")} / 10,000文字`;
    }

    function resetFeedback() {
      feedbackMessage.textContent = "";
      feedbackButtons.forEach((button) => {
        button.disabled = false;
        button.removeAttribute("aria-pressed");
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = normalizeText(textarea.value);
      if (!text) {
        textarea.focus();
        return;
      }

      const analysis = analyzeText(text);
      resultGrid.innerHTML = analysis.results.map(createResultCard).join("");
      resultCount.textContent = `${analysis.matchedCategoryCount} / ${categories.length}項目`;
      resultSummary.textContent = analysis.matchCount
        ? `${analysis.segmentCount}個の文・行から、重要そうな記述を${analysis.matchCount}件見つけました。`
        : "重要そうな記述を見つけられませんでした。表現を変えず、元のプリントを確認してください。";
      resultsSection.hidden = false;
      resetFeedback();
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    textarea.addEventListener("input", updateCount);

    document.querySelector("#sample-button").addEventListener("click", () => {
      textarea.value = sampleText;
      updateCount();
      textarea.focus();
    });

    document.querySelector("#clear-button").addEventListener("click", () => {
      textarea.value = "";
      resultsSection.hidden = true;
      resultGrid.innerHTML = "";
      resetFeedback();
      updateCount();
      textarea.focus();
    });

    feedbackButtons.forEach((button) => {
      button.addEventListener("click", () => {
        feedbackButtons.forEach((item) => {
          item.disabled = true;
          item.setAttribute("aria-pressed", String(item === button));
        });
        feedbackMessage.textContent = "ありがとうございます。現在、この回答は送信・保存されません。";
      });
    });

    updateCount();
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initializeChecker);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { analyzeText, normalizeText, splitIntoSegments };
  }
})();

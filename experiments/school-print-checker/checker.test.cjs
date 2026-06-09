/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");

const { analyzeText, normalizeText, splitIntoSegments } = require("./checker.js");

function itemsByCategory(text) {
  return Object.fromEntries(analyzeText(text).results.map(({ id, items }) => [id, items]));
}

function assertCategoryIncludes(results, category, expectedText) {
  assert.ok(
    results[category].some((item) => item.includes(expectedText)),
    `${category} should include a segment containing: ${expectedText}`,
  );
}

test("normalizes line endings and splits school-print bullet points", () => {
  const text = "持ち物：水筒\r\n　・上履き。提出してください！";

  assert.equal(normalizeText(text), "持ち物：水筒\n ・上履き。提出してください！");
  assert.deepEqual(splitIntoSegments(text), ["持ち物：水筒", "上履き。", "提出してください！"]);
});

test("extracts excursion date, place, items, fee, reply, and guardian action", () => {
  const results = itemsByCategory(`遠足について
日時：6月18日（水）午前8時30分集合
集合場所：正門前
持ち物：弁当、水筒、帽子、タオル
参加費500円を集金用の封筒に入れてください。
参加申込書に保護者が記入し、6月10日までに担任へ提出してください。`);

  assertCategoryIncludes(results, "when", "6月18日");
  assertCategoryIncludes(results, "where", "集合場所");
  assertCategoryIncludes(results, "items", "持ち物");
  assertCategoryIncludes(results, "submissions", "参加申込書");
  assertCategoryIncludes(results, "money", "500円");
  assertCategoryIncludes(results, "reply", "提出してください");
  assertCategoryIncludes(results, "guardian", "保護者");
});

test("recognizes deadline variants and common consent-form wording", () => {
  const results = itemsByCategory(`授業参観の出欠確認
会場は各教室です。
出欠確認票へ参加・不参加を記入してください。
〆切は5月12日です。同意書の提出期限までにご回答ください。`);

  assertCategoryIncludes(results, "when", "〆切");
  assertCategoryIncludes(results, "where", "教室");
  assertCategoryIncludes(results, "submissions", "出欠確認票");
  assertCategoryIncludes(results, "reply", "参加・不参加");
  assertCategoryIncludes(results, "guardian", "記入してください");
});

test("recognizes preparation wording and school-event locations", () => {
  const results = itemsByCategory(`運動会のお知らせ
集合場所は校庭、雨天時は体育館です。
体操服、上履き、帽子をご用意ください。
水筒とタオルを持ってきてください。`);

  assertCategoryIncludes(results, "where", "校庭");
  assertCategoryIncludes(results, "items", "ご用意ください");
  assertCategoryIncludes(results, "items", "持ってきてください");
  assertCategoryIncludes(results, "guardian", "ご用意ください");
});

test("recognizes school fees and cash-handling instructions", () => {
  const results = itemsByCategory(`教材費の集金について
教材費1,280円を現金でご用意ください。
おつりのないよう、封筒に入れて持たせてください。`);

  assertCategoryIncludes(results, "money", "1,280円");
  assertCategoryIncludes(results, "money", "おつり");
  assertCategoryIncludes(results, "submissions", "封筒");
  assertCategoryIncludes(results, "guardian", "持たせてください");
});

test("recognizes an absence contact request without inventing unrelated categories", () => {
  const results = itemsByCategory("欠席する場合は、午前8時までに学校へ連絡してください。");

  assert.equal(results.items.length, 0);
  assert.equal(results.money.length, 0);
  assertCategoryIncludes(results, "when", "午前8時までに");
  assertCategoryIncludes(results, "reply", "連絡してください");
  assertCategoryIncludes(results, "guardian", "連絡してください");
});

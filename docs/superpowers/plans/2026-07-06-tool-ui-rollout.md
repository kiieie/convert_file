# 도구 UI 단순화 롤아웃 (17개 도구) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파일럿에서 검증된 `.tool-flow` + 접힌 고급 설정 패턴을 나머지 17개 영어판 도구 페이지에 적용한다.

**Architecture:** 순수 정적 사이트. 신규 CSS/JS 없음 — 파일럿 Task 1이 만든 `css/tools.css`의 `.tool-flow`/`.advanced-settings`/`.btn-convert-hero`/`.btn-download-hero`를 재사용해 각 도구 HTML의 `modern-tool-grid` 2컬럼을 단일 컬럼으로 재배치하고 설정 카드를 `<details>`로 접는다. **기존 DOM id는 절대 바꾸지 않는다** — 도구 JS와 ko/es/zh 로케일 페이지가 id를 공유하므로, id 보존 = JS 무수정 = 로케일 무수정.

**Tech Stack:** HTML/CSS만 (JS 무수정), Playwright E2E (`test/e2e.test.js`), Node 유닛 테스트 (`test/run-tests.js`).

## Global Constraints

- 스펙: `docs/superpowers/specs/2026-07-06-tool-ui-simplification-rollout-design.md`
- **기존 DOM id 변경/삭제 절대 금지.** 각 도구의 `js/tools/<tool>.js`가 `getElementById`로 조회하는 모든 id는 위치만 이동하고 id/name/value 속성은 그대로 유지. 위반 시 영어판+로케일 3개가 동시에 깨짐(파일럿 Task 2에서 실증된 버그 클래스).
- `js/tools/*.js`, `js/core/*` 수정 금지 (이번 계획 전체에서 JS 파일 변경 0건이어야 함)
- `ko/es/zh` 로케일 파일 수정 금지 (id가 안 바뀌므로 불필요)
- 기존 CSS 클래스 삭제 금지, 신규 CSS 클래스 추가 금지 (파일럿 CSS만 재사용)
- 하단 SEO 안내문/FAQ/광고 슬롯/head 메타/구조화 데이터 유지
- 각 수정 페이지의 도구 JS `?v=` 버전 +1 (HTML 구조 변경에 따른 안전 조치 — 파일럿 Task 4와 동일. 코어 스크립트 버전은 유지)
- E2E 전제: `npx http-server -p 8080 -c-1` 리포 루트에서 실행 중
- 참조 구현(살아있는 실물): `tools/compress.html` — JS 무수정으로 카드 접기만 한 파일럿 사례. 마크업 패턴이 불확실하면 이 파일을 열어 그대로 따른다.

## 공통 변환 레시피 (모든 Task가 사용)

각 도구 페이지에서 다음 절차를 적용한다. 이 레시피가 각 Task의 "Step: 마크업 재구성"의 실체다.

1. `<div class="modern-tool-grid">`와 그 2컬럼 자식 `<div style="display:flex; flex-direction:column; gap:12px;">` 래퍼들을 제거하고 `<div class="tool-flow">` 하나로 교체.
2. 자식 요소들을 아래 순서로 세로 배치 (각 Task의 표가 도구별 매핑을 지정):
   - 업로드 드롭존 (`#drop-zone` 등) — 원본 그대로
   - 미리보기/캔버스/결과 영역 — 원본 그대로
   - 파일 목록/상태 텍스트 (있으면) — 원본 그대로
   - **핵심 액션 버튼** — 기존 id 유지, 클래스만 교체:
     - 변환형 버튼: `class="btn-convert-hero"` (기존 `modern-btn modern-btn--primary` 등 제거, inline height/font 스타일 제거)
     - 다운로드형 버튼: `class="btn-convert-hero btn-download-hero"`
   - 상태 메시지 요소 (있으면)
   - **고급 설정**: 각 Task 표의 "접을 카드"를 아래 구조로 감싼다:

```html
<details class="advanced-settings" id="advanced-settings">
    <summary>Advanced settings</summary>
    <div class="advanced-settings__body">
        <!-- 접을 .modern-card 블록들을 원본 그대로 이곳으로 이동 -->
    </div>
</details>
```

3. 페이지 인라인 `<style>` 블록에서 제거된 래퍼 전용 규칙이 있으면 삭제 (공유 `css/tools.css`는 건드리지 않음).
4. 도구 JS `<script src="/js/tools/<tool>.js?v=N">` → `?v=N+1`.
5. 검증 (도구마다 실행):

```bash
# (a) JS가 조회하는 모든 id가 여전히 존재하는지
grep -o "getElementById('[^']*')" js/tools/<tool>.js | sed "s/getElementById('//;s/')//" | sort -u > /tmp/ids-needed.txt
while read id; do grep -q "id=\"$id\"" tools/<tool>.html || echo "MISSING: $id"; done < /tmp/ids-needed.txt
# 출력 없어야 통과. querySelector 사용 도구는 해당 셀렉터도 수동 확인.

# (b) 브라우저 로드 시 콘솔 에러 0건 (Playwright 스니펫, 각 Task의 스모크 테스트 참조)
```

**접기 판단 기준** (표에 명시 없는 카드를 만났을 때):
- 업로드 전 반드시 조작해야 하는 컨트롤(예: crop의 크롭 박스) → 접지 않음
- 결과 표시 카드(info/stats) → 접음
- 품질/포맷/색상/옵션 설정 → 접음
- 판단 애매하면 접지 않고 report에 concern으로 기록

## 공통 스모크 테스트 (각 Task 마지막에 실행)

Task별로 수정한 페이지 전부에 대해 아래 throwaway 스크립트로 검증 (`test/` 디렉토리에서 실행, 실행 후 삭제):

```js
// test/smoke-temp.js — node test/smoke-temp.js 로 실행 후 삭제
const { chromium } = require('playwright');
const pages = process.argv.slice(2); // 예: tools/crop.html tools/resize.html
(async () => {
  const browser = await chromium.launch();
  let failed = false;
  for (const url of pages) {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8080/' + url, { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const details = await page.$('#advanced-settings');
    const detailsOpen = details ? await details.getAttribute('open') : null;
    const ok = errors.length === 0 && sw <= 375 && (details === null || detailsOpen === null);
    console.log(`${url}: ${ok ? 'OK' : 'FAIL'} (errors=${errors.length}, scrollWidth=${sw}, detailsOpen=${detailsOpen})`);
    if (!ok) failed = true;
    await page.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
```

통과 기준: 페이지별 콘솔 에러 0, scrollWidth ≤ 375, 고급 설정 기본 접힘.

---

### Task A: GIF 계열 5종 (gif-maker, gif-optimize, gif-speed, gif-splitter, video-gif)

**Files:**
- Modify: `tools/gif-maker.html`, `tools/gif-optimize.html`, `tools/gif-speed.html`, `tools/gif-splitter.html`, `tools/video-gif.html`
- Test: 공통 스모크 테스트 (신규 영구 테스트 없음 — id 무변경이므로)

**Interfaces:**
- Consumes: 파일럿 CSS 클래스 (`css/tools.css:171-258` 근방), 공통 변환 레시피
- Produces: 없음 (후속 Task와 독립)

**도구별 매핑:**

| 도구 | 핵심 액션 (id 유지, hero 승격) | 접을 카드 | 접지 않는 것 |
|---|---|---|---|
| gif-maker | `#btn-render` → `.btn-convert-hero` | 딜레이/품질 설정 카드 | 업로드존, **프레임 목록(도구의 본질 — 순서 조작 필요)** |
| gif-optimize | `#btn-optimize` → `.btn-convert-hero` | 설정 카드 전부 (카드 2개 중 옵션 카드) | 업로드존, 미리보기 |
| gif-speed | `#btn-apply` → `.btn-convert-hero` | 속도 설정 외 부가 옵션 카드 | 업로드존, 미리보기, **속도 슬라이더는 도구의 본질 — 접지 않고 버튼 위 노출** |
| gif-splitter | `#btn-split` → `.btn-convert-hero` | 옵션 카드 전부 | 업로드존, 프레임 미리보기 |
| video-gif | `#btn-convert-all` → `.btn-convert-hero` (주), `#btn-convert`는 기존 위치·기존 보조 스타일 유지 | 변환 옵션 카드 | 업로드존, 비디오 큐 목록, `#btn-clear-videos` |

video-gif 주의: 두 버튼 **id 절대 불변**. `btn-convert-all`(전체 변환)이 주 흐름이므로 hero, `btn-convert`(선택 1개 변환)는 보조 버튼으로 큐 목록 근처 유지. JS 무수정.

- [ ] **Step 1: 5개 페이지 각각 공통 레시피 적용** (위 매핑 표 따름)
- [ ] **Step 2: id 보존 검증** — 레시피 5(a) 스크립트를 5개 도구 JS에 대해 실행, `MISSING` 출력 0건
- [ ] **Step 3: 스모크 테스트**

Run: `cd test && node smoke-temp.js tools/gif-maker.html tools/gif-optimize.html tools/gif-speed.html tools/gif-splitter.html tools/video-gif.html`
Expected: 5줄 전부 `OK`

- [ ] **Step 4: 기존 E2E 회귀 확인**

Run: `cd test && npx playwright test e2e.test.js --reporter=list`
Expected: 9 passed, 1 failed (jpg-png `#status-text` — 리포 최초 커밋부터 존재하는 무관 버그, 이 계획과 무관)

- [ ] **Step 5: Commit**

```bash
git add tools/gif-maker.html tools/gif-optimize.html tools/gif-speed.html tools/gif-splitter.html tools/video-gif.html
git commit -m "feat: apply simplified tool-flow layout to GIF tool pages"
```

---

### Task B: 이미지 편집 5종 (crop, resize, heic2jpg, img-pdf, bg-remove)

**Files:**
- Modify: `tools/crop.html`, `tools/resize.html`, `tools/heic2jpg.html`, `tools/img-pdf.html`, `tools/bg-remove.html`
- Test: 공통 스모크 + 기존 E2E의 resize 케이스 회귀 확인

**Interfaces:**
- Consumes: 파일럿 CSS 클래스, 공통 변환 레시피
- Produces: 없음

**도구별 매핑:**

| 도구 | 핵심 액션 (id 유지, hero 승격) | 접을 카드 | 접지 않는 것 |
|---|---|---|---|
| crop | `#btn-crop` → `.btn-convert-hero` | 출력 포맷/기타 옵션 카드 | 업로드존, 크롭 캔버스, **Aspect Ratio 프리셋(크롭의 본질)** |
| resize | `#btn-resize` → `.btn-convert-hero` | 보간 필터/포맷 옵션 카드 | 업로드존, 미리보기, **가로/세로 픽셀 입력(리사이즈의 본질)** |
| heic2jpg | `#btn-convert` → `.btn-convert-hero`, `#btn-download` → `.btn-convert-hero .btn-download-hero` | 품질/옵션 카드 전부 | 업로드존, 미리보기 |
| img-pdf | `#btn-generate` → `.btn-convert-hero` | 용지 규격/여백 옵션 카드 | 업로드존, 이미지 목록, `#btn-add-more`(보조 버튼 유지) |
| bg-remove | `#btn-remove-bg` → `.btn-convert-hero`, `#btn-download` → `.btn-convert-hero .btn-download-hero` | 허용오차/색상 옵션 카드 | 업로드존, 미리보기 |

**주의 — resize는 기존 E2E 커버 대상.** `test/e2e.test.js`의 "Image Resizer (resize.html)" 테스트가 조회하는 셀렉터(`#drop-zone` 클릭, 폭 입력 필드, `#btn-resize`)를 깨지 않아야 한다. 마크업 이동 전 해당 테스트 블록(`test/e2e.test.js:113` 근방)을 읽고 사용된 id를 "접지 않는 것"에 추가한다 — 테스트가 접힌 요소를 `fill()` 하려 하면 Playwright가 자동으로 요소를 보이게 하지 못해 실패할 수 있음. 폭/높이 입력이 접힘 대상이 되면 안 됨 (위 표에서 이미 본질로 분류).

- [ ] **Step 1: `test/e2e.test.js`의 resize 테스트 블록 읽고 사용 셀렉터 목록 확보**
- [ ] **Step 2: 5개 페이지 각각 공통 레시피 적용** (매핑 표 + Step 1 셀렉터는 비접힘)
- [ ] **Step 3: id 보존 검증** — 레시피 5(a), 5개 도구 JS, `MISSING` 0건
- [ ] **Step 4: 스모크 테스트**

Run: `cd test && node smoke-temp.js tools/crop.html tools/resize.html tools/heic2jpg.html tools/img-pdf.html tools/bg-remove.html`
Expected: 5줄 전부 `OK`

- [ ] **Step 5: 기존 E2E 회귀 확인 (resize 포함)**

Run: `cd test && npx playwright test e2e.test.js --reporter=list`
Expected: 9 passed, 1 failed (기존 jpg-png 무관 버그만)

- [ ] **Step 6: Commit**

```bash
git add tools/crop.html tools/resize.html tools/heic2jpg.html tools/img-pdf.html tools/bg-remove.html
git commit -m "feat: apply simplified tool-flow layout to image editing tool pages"
```

---

### Task C: 변환 유틸 3종 (base64, svg-convert, metadata)

**Files:**
- Modify: `tools/base64.html`, `tools/svg-convert.html`, `tools/metadata.html`
- Test: 공통 스모크

**Interfaces:**
- Consumes: 파일럿 CSS 클래스, 공통 변환 레시피
- Produces: 없음

**도구별 매핑:**

| 도구 | 핵심 액션 (id 유지, hero 승격) | 접을 카드 | 접지 않는 것 |
|---|---|---|---|
| base64 (2패널) | Panel 1: `#btn-copy` → `.btn-convert-hero .btn-download-hero` / Panel 2: `#btn-convert` → `.btn-convert-hero`, `#btn-download` → `.btn-convert-hero .btn-download-hero` | Panel 1: `#info-b64-block` 카드 / Panel 2: `#info-img-block` 카드 (버튼은 카드 밖으로 꺼내 hero로) | 업로드존, `#b64-output`/`#b64-input` textarea(도구의 본질), `#img-preview-container` |
| svg-convert | `#btn-convert` → `.btn-convert-hero` | 해상도/배율 등 옵션 카드 | 업로드존, 미리보기 |
| metadata | `#btn-strip` → `.btn-convert-hero` | 메타데이터 표시 카드 외 옵션 | 업로드존, **EXIF 정보 표시 영역(도구의 출력물 — 접지 않음)** |

**base64 주의:** 페이지는 `#panel-to-b64`/`#panel-to-img` 탭 패널 구조. 패널 전환 UI는 유지하고, **각 패널 내부의** `modern-tool-grid`만 각각 `.tool-flow`로 교체한다. `<details>`의 `id="advanced-settings"`는 페이지에 1개만 가능 — 패널이 2개이므로 Panel 1은 `id="advanced-settings"`, Panel 2는 `id="advanced-settings-2"` 사용 (스모크 스크립트는 `#advanced-settings`만 검사하므로 문제없음). `#btn-download`가 Panel 2의 info 카드 안에 있는데, 카드 밖 hero로 꺼내되 **id/disabled 속성 유지**.

- [ ] **Step 1: 3개 페이지 각각 공통 레시피 적용** (base64는 패널별 개별 적용)
- [ ] **Step 2: id 보존 검증** — 레시피 5(a), 3개 도구 JS, `MISSING` 0건
- [ ] **Step 3: 스모크 테스트**

Run: `cd test && node smoke-temp.js tools/base64.html tools/svg-convert.html tools/metadata.html`
Expected: 3줄 전부 `OK`

- [ ] **Step 4: 기존 E2E 회귀 확인**

Run: `cd test && npx playwright test e2e.test.js --reporter=list`
Expected: 9 passed, 1 failed (기존 무관 버그만)

- [ ] **Step 5: Commit**

```bash
git add tools/base64.html tools/svg-convert.html tools/metadata.html
git commit -m "feat: apply simplified tool-flow layout to converter utility pages"
```

---

### Task D: 옵션 많은 3종 (gif-effects, watermark, color-extractor)

**Files:**
- Modify: `tools/gif-effects.html`, `tools/watermark.html`, `tools/color-extractor.html`
- Test: 공통 스모크

**Interfaces:**
- Consumes: 파일럿 CSS 클래스, 공통 변환 레시피
- Produces: 없음

**도구별 매핑:**

| 도구 | 핵심 액션 (id 유지, hero 승격) | 접을 카드 | 접지 않는 것 |
|---|---|---|---|
| gif-effects | `#btn-run-effects` → `.btn-convert-hero` | 효과 파라미터 카드(자막 스타일 등 세부 옵션) | 업로드존, 미리보기, **효과 선택 자체(도구의 본질)** |
| watermark | `#btn-download` → `.btn-convert-hero .btn-download-hero` (변환 버튼 없음 — 라이브 미리보기형) | 위치/투명도/출력 포맷 카드 | 업로드존, 미리보기 캔버스, **워터마크 텍스트/로고 입력(본질)**, `#btn-select-logo`(보조 유지) |
| color-extractor | `#btn-copy-hex` → 위치 유지(팔레트 옆 보조 버튼 — hero 승격 대상 아님, 페이지에 주 액션 자체가 없음) | 추출 옵션 카드(색상 수 등) | 업로드존, **추출된 팔레트 표시(도구의 출력물)** |

**watermark 주의:** `js/tools/watermark.js`는 설정 `change` 이벤트마다 `drawWatermark()` 자동 실행(라이브 미리보기). 설정 카드를 `<details>` 안으로 옮겨도 change 이벤트는 정상 동작하지만, **사용자가 설정을 만지려면 펼쳐야 함** — 위치/포맷은 접되, 워터마크 텍스트 입력은 본질이므로 노출 유지.

**color-extractor 주의:** 주 액션 버튼이 없는 자동 실행형. hero 버튼 신설하지 않는다(YAGNI) — 레이아웃만 `.tool-flow`로 전환하고 옵션 카드만 접는다.

- [ ] **Step 1: 3개 페이지 각각 공통 레시피 적용** (매핑 표 따름)
- [ ] **Step 2: id 보존 검증** — 레시피 5(a), 3개 도구 JS, `MISSING` 0건
- [ ] **Step 3: 스모크 테스트**

Run: `cd test && node smoke-temp.js tools/gif-effects.html tools/watermark.html tools/color-extractor.html`
Expected: 3줄 전부 `OK`

- [ ] **Step 4: watermark 라이브 미리보기 동작 확인** — 스모크 스크립트에 임시 추가 또는 수동: 이미지 업로드 → 고급 설정 펼침 → 위치 select 변경 → 캔버스 갱신 확인 (JS 에러 0)
- [ ] **Step 5: 기존 E2E 회귀 확인**

Run: `cd test && npx playwright test e2e.test.js --reporter=list`
Expected: 9 passed, 1 failed (기존 무관 버그만)

- [ ] **Step 6: Commit**

```bash
git add tools/gif-effects.html tools/watermark.html tools/color-extractor.html
git commit -m "feat: apply simplified tool-flow layout to option-heavy tool pages"
```

---

### Task E: meme-generator (단독)

**Files:**
- Modify: `tools/meme-generator.html`
- Test: 공통 스모크

**Interfaces:**
- Consumes: 파일럿 CSS 클래스, 공통 변환 레시피
- Produces: 없음

캔버스 라이브 에디터. 카드 8개 — 편집 컨트롤(텍스트 입력, 폰트, 위치)은 도구의 본질이라 접지 않고, 부가 옵션만 접는다. 카드 제목 기준 분류:

| 분류 | 기준 |
|---|---|
| 본질(비접힘) | 밈 텍스트 입력(상/하단), 캔버스 미리보기, `#btn-download`(hero 승격: `.btn-convert-hero .btn-download-hero`) |
| 부가(접힘) | 폰트 크기/색상/외곽선 스타일, 출력 포맷, 기타 옵션 카드 |

분류가 애매한 카드는 접지 않고 report에 concern으로 기록 (공통 레시피의 접기 판단 기준 준수).

- [ ] **Step 1: 페이지에 공통 레시피 적용** (위 분류 기준)
- [ ] **Step 2: id 보존 검증** — 레시피 5(a), `js/tools/meme-generator.js`, `MISSING` 0건
- [ ] **Step 3: 스모크 테스트**

Run: `cd test && node smoke-temp.js tools/meme-generator.html`
Expected: `OK`

- [ ] **Step 4: 에디터 동작 확인** — 이미지 업로드 → 텍스트 입력 → 캔버스 반영 → 고급 설정 펼쳐 색상 변경 → 캔버스 갱신 (JS 에러 0)
- [ ] **Step 5: 기존 E2E 회귀 확인**

Run: `cd test && npx playwright test e2e.test.js --reporter=list`
Expected: 9 passed, 1 failed (기존 무관 버그만)

- [ ] **Step 6: Commit**

```bash
git add tools/meme-generator.html
git commit -m "feat: apply simplified tool-flow layout to meme generator"
```

---

### Task F: 최종 회귀 및 정리

**Files:**
- 없음 (검증만; 스모크 스크립트 삭제)

- [ ] **Step 1: 유닛 테스트**

Run: `node test/run-tests.js`
Expected: 10/11 (1 실패는 `gifuct-js` 목 누락 — 리포 최초 커밋부터 존재, 무관)

- [ ] **Step 2: E2E 전체**

Run: `cd test && npx playwright test e2e.test.js --reporter=list`
Expected: 9 passed, 1 failed (기존 jpg-png 무관 버그만)

- [ ] **Step 3: 17개 페이지 전체 스모크 일괄 실행**

Run: `cd test && node smoke-temp.js tools/gif-maker.html tools/gif-optimize.html tools/gif-speed.html tools/gif-splitter.html tools/video-gif.html tools/crop.html tools/resize.html tools/heic2jpg.html tools/img-pdf.html tools/bg-remove.html tools/base64.html tools/svg-convert.html tools/metadata.html tools/gif-effects.html tools/watermark.html tools/color-extractor.html tools/meme-generator.html`
Expected: 17줄 전부 `OK` (gif 5 + 편집 5 + 변환 3 + 옵션 3 + meme 1 = 17개 도구)

- [ ] **Step 4: 스모크 스크립트 삭제**

```bash
rm test/smoke-temp.js
```

- [ ] **Step 5: 테스트 부산물 원복**

```bash
git checkout -- test-results/.last-run.json test/e2e-report.md test/test-report.md 2>/dev/null; git status
```

Expected: working tree clean

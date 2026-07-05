# 도구 UI 단순화 (파일럿 3개) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 파일럿 3개 도구(webp-convert, jpg-png, compress)를 "업로드 → 클릭 1번 → 다운로드" 단일 컬럼 흐름으로 단순화하고 고급 옵션을 `<details>`로 접는다.

**Architecture:** 순수 정적 사이트. `css/tools.css`에 공통 패턴 클래스 4종 추가 후 각 도구 HTML 마크업을 단일 컬럼(`.tool-flow`)으로 재배치, 도구별 JS는 세그먼트 라디오 + 스마트 기본값 로직만 수정. 빌드 시스템 없음, 코어 모듈 변경 없음.

**Tech Stack:** Vanilla JS (IIFE), HTML5 Canvas, Playwright E2E (`test/e2e.test.js`), Node 유닛 테스트 (`test/run-tests.js`).

## Global Constraints

- 스펙: `docs/superpowers/specs/2026-07-03-tool-ui-simplification-design.md`
- 기존 CSS 클래스 삭제 금지 (미적용 21개 도구 페이지가 공유)
- `js/core/*` 코어 모듈 수정 금지
- 수정한 HTML의 도구 JS `?v=` 버전 +1 (`_headers` immutable 캐시 대응)
- 하단 SEO 안내문/FAQ/광고 슬롯/구조화 데이터 유지
- 페이지는 영어판만 수정 (`tools/*.html`) — ko/es/zh 번역본 건드리지 않음
- E2E 실행 전제: `npx http-server -p 8080 -c-1` 가 리포지토리 루트에서 실행 중

**스펙과의 의도적 차이 (구현 전 확인된 현실 반영):**
1. `jpg-png`는 배치(다중 파일) 변환기 — 출력 포맷 자동 선택은 **첫 번째 파일** 포맷 기준.
2. `compress`는 라이브 자동 압축 구조(변환 버튼 자체가 없음) — 변환 버튼을 신설하지 않고 자동 압축 유지, **다운로드 버튼을 hero CTA로 승격**. 클릭 수는 스펙 목표(1클릭)와 동일.
3. 배경색 카드 표시 조건: 스펙은 "JPG 출력 + 투명 입력"이나, 투명 채널 감지는 픽셀 스캔이 필요해 과함 — **JPG 출력 선택 시 표시**로 단순화 (카드는 고급 설정 안이라 노출 비용 없음).
4. compress E2E의 "출력 크기 < 원본" 검증(스펙)은 1×1 mock 이미지에서 무의미(오히려 커질 수 있음) — **다운로드 파일명 패턴 검증으로 대체**.

---

### Task 1: 공통 CSS 패턴 추가

**Files:**
- Modify: `css/tools.css` (파일 끝에 추가)

**Interfaces:**
- Produces: CSS 클래스 `.tool-flow`, `.segment-toggle`, `.btn-convert-hero`, `.btn-download-hero`, `.advanced-settings` — Task 2~4의 마크업이 사용

- [ ] **Step 1: tools.css 끝에 패턴 클래스 추가**

```css
/* ==========================================================================
   Simplified tool flow — 2026-07 UI simplification (spec: docs/superpowers/
   specs/2026-07-03-tool-ui-simplification-design.md)
   ========================================================================== */

/* Single-column vertical flow */
.tool-flow {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 720px;
    margin: 0 auto;
}

/* Segmented format toggle (pure radio + label, no JS needed for visuals) */
.segment-toggle {
    display: flex;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: #fff;
}
.segment-toggle input[type="radio"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
.segment-toggle label {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--slate-600);
    cursor: pointer;
    border-right: 1px solid var(--slate-200);
    transition: background 0.15s, color 0.15s;
    user-select: none;
}
.segment-toggle label:last-of-type { border-right: none; }
.segment-toggle input:checked + label {
    background: var(--blue-600);
    color: #fff;
}
.segment-toggle input:focus-visible + label {
    outline: 2px solid var(--blue-600);
    outline-offset: -2px;
}

/* Hero action buttons */
.btn-convert-hero {
    width: 100%;
    min-height: 48px;
    font-size: 15px;
    font-weight: 700;
    background: var(--blue-600);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
}
.btn-convert-hero:hover:not(:disabled) { filter: brightness(1.08); }
.btn-convert-hero:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-download-hero { background: #16a34a; }
.btn-download-hero.is-stale { opacity: 0.45; pointer-events: none; }

/* Collapsible advanced settings */
.advanced-settings {
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-sm);
    background: #fff;
}
.advanced-settings > summary {
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--slate-600);
    cursor: pointer;
    list-style: none;
    user-select: none;
}
.advanced-settings > summary::-webkit-details-marker { display: none; }
.advanced-settings > summary::before { content: "\25B8  "; color: var(--slate-400); }
.advanced-settings[open] > summary::before { content: "\25BE  "; }
.advanced-settings__body {
    padding: 0 14px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.advanced-settings__body .modern-card {
    border: none;
    box-shadow: none;
    padding: 0;
}
```

- [ ] **Step 2: 육안 회귀 확인**

Run: `npx http-server -p 8080 -c-1` (백그라운드) 후 브라우저로 `http://127.0.0.1:8080/tools/rotate.html` (미적용 페이지) 열기.
Expected: 기존 페이지 레이아웃 변화 없음 (추가 클래스는 아직 어떤 마크업도 사용 안 함).

- [ ] **Step 3: Commit**

```bash
git add css/tools.css
git commit -m "feat: add simplified tool-flow CSS patterns (segment toggle, hero buttons, advanced-settings)"
```

---

### Task 2: webp-convert 단순화

**Files:**
- Modify: `tools/webp-convert.html` (본문 `modern-tool-grid` 영역 + 스크립트 버전)
- Modify: `js/tools/webp-convert.js`
- Test: `test/e2e.test.js` (신규 테스트 추가)

**Interfaces:**
- Consumes: Task 1의 CSS 클래스
- Produces: DOM id 계약 — `#btn-convert`(변환 hero), `#btn-download`(다운로드 hero), `input[name="out-format"]` 라디오(`#fmt-webp`/`#fmt-jpg`/`#fmt-png`, value는 MIME), `#advanced-settings`. E2E 테스트가 이 id에 의존.

- [ ] **Step 1: 실패하는 E2E 테스트 작성**

`test/e2e.test.js` 파일 끝(마지막 test 블록 뒤)에 추가:

```js
test('WebP Converter (webp-convert.html) - Simplified One-Click Flow', async ({ page }) => {
    const mockImage = path.join(__dirname, 'mock-image.png');
    const mockPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
    );
    fs.writeFileSync(mockImage, mockPngBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/webp-convert.html');

        // 업로드
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#btn-select-file');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockImage);

        // 스마트 기본값: PNG 입력 → WebP 자동 선택
        await expect(page.locator('#fmt-webp')).toBeChecked();

        // 고급 설정은 접힌 상태
        await expect(page.locator('#advanced-settings')).not.toHaveAttribute('open', '');

        // 변환 버튼 1번 클릭
        await page.click('#btn-convert');

        // 다운로드 버튼 노출 → 클릭 → 파일명 검증
        await expect(page.locator('#btn-download')).toBeVisible();
        const downloadPromise = page.waitForEvent('download');
        await page.click('#btn-download');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('mock-image_converted.webp');
    } finally {
        if (fs.existsSync(mockImage)) fs.unlinkSync(mockImage);
    }
});
```

- [ ] **Step 2: 테스트 실행, 실패 확인**

Run: `cd test && npx playwright test e2e.test.js -g "Simplified One-Click Flow"`
Expected: FAIL — `#fmt-webp` 요소 없음 (아직 마크업 미변경).

- [ ] **Step 3: HTML 마크업 재구성**

`tools/webp-convert.html`에서 `<div class="modern-tool-grid">` ~ 그 닫는 `</div>` (기존 206~306행 영역)를 아래로 교체. 업로드존/미리보기/통계바 마크업은 기존 것 그대로 재사용하고 배치만 변경:

```html
<div class="tool-flow">
    <!-- Upload dropzone (기존 마크업 그대로) -->
    <div class="modern-upload-zone" id="drop-zone" style="border: 2px dashed var(--blue-500); background-color: var(--slate-50); transition: all 0.2s ease;">
        <div class="modern-upload-zone__icon" style="width: 48px; height: 48px; margin-bottom: 8px;"></div>
        <div class="modern-upload-zone__title" style="font-size: 15px; color: var(--slate-800);">Drop an image here</div>
        <div class="modern-upload-zone__desc" style="margin-bottom: 12px; color: var(--slate-500);">JPG, PNG, WebP, GIF, BMP supported (up to 25 MB)</div>
        <button type="button" class="modern-btn modern-btn--primary" id="btn-select-file" style="cursor:pointer; pointer-events:auto;">&#128194; Select Image</button>
        <input type="file" id="file-input" style="display:none;" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp">
    </div>

    <!-- Side-by-side preview (기존 마크업 그대로) -->
    <div class="preview-pair">
        <div class="preview-panel">
            <span class="preview-panel__label">Original</span>
            <img class="preview-panel__img" id="preview-original" alt="Original image">
            <div class="preview-panel__placeholder" id="placeholder-original">No image</div>
            <span id="info-original" style="font-size:11px; color:var(--slate-500); text-align:center;"></span>
        </div>
        <div class="preview-panel">
            <span class="preview-panel__label">Converted</span>
            <img class="preview-panel__img" id="preview-converted" alt="Converted image">
            <div class="preview-panel__placeholder" id="placeholder-converted">Convert to see preview</div>
            <span id="info-converted" style="font-size:11px; color:var(--slate-500); text-align:center;"></span>
        </div>
    </div>

    <!-- Stats bar (기존 마크업 그대로) -->
    <div class="stats-bar" id="stats-bar">
        <div class="stats-bar__item"><span>Original format</span><strong id="stat-original-fmt">—</strong></div>
        <div class="stats-bar__item"><span>Original size</span><strong id="stat-original-size">—</strong></div>
        <div class="stats-bar__item"><span>Output size</span><strong id="stat-output-size">—</strong></div>
        <div class="stats-bar__item"><span>Savings</span><strong id="stat-savings">—</strong></div>
    </div>

    <!-- Format segment toggle -->
    <div class="segment-toggle" id="format-toggle" role="radiogroup" aria-label="Output format">
        <input type="radio" name="out-format" id="fmt-webp" value="image/webp" checked>
        <label for="fmt-webp">WebP</label>
        <input type="radio" name="out-format" id="fmt-jpg" value="image/jpeg">
        <label for="fmt-jpg">JPG</label>
        <input type="radio" name="out-format" id="fmt-png" value="image/png">
        <label for="fmt-png">PNG</label>
    </div>

    <!-- Hero actions -->
    <button class="btn-convert-hero" id="btn-convert" disabled>&#10024; Convert</button>
    <button class="btn-convert-hero btn-download-hero" id="btn-download" style="display:none;">&#8595; Download</button>
    <div id="status-msg" style="font-size:12px; font-weight:600; color:var(--slate-600); text-align:center; min-height:18px;"></div>

    <!-- Advanced settings (collapsed) -->
    <details class="advanced-settings" id="advanced-settings">
        <summary>Advanced settings</summary>
        <div class="advanced-settings__body">
            <div class="modern-card">
                <h3 class="modern-card__title">Quality (WebP / JPG)</h3>
                <div class="modern-form-group">
                    <span class="modern-label">Compression quality: <strong id="quality-val" style="color:var(--blue-600);">85</strong>%</span>
                    <input type="range" min="50" max="100" value="85" style="width:100%; cursor:pointer;" id="quality-slider">
                </div>
                <div style="font-size:11px; color:var(--slate-400); margin-top:2px;">
                    Higher = better quality, larger file. PNG output is always lossless.
                </div>
            </div>
            <div class="modern-card" id="bg-color-card" style="display:none;">
                <h3 class="modern-card__title">Background Fill (JPG)</h3>
                <div class="modern-form-group">
                    <span class="modern-label">Transparent areas will be filled with:</span>
                    <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                        <input type="color" id="bg-color" value="#FFFFFF" style="border:1px solid var(--slate-200); border-radius:4px; width:45px; height:28px; padding:0; cursor:pointer;">
                        <span style="font-size:11px; color:var(--slate-400);">JPG does not support transparency</span>
                    </div>
                </div>
            </div>
            <div class="modern-card">
                <h3 class="modern-card__title">Image Info</h3>
                <div id="image-info-block" style="font-size:12px; color:var(--slate-500); line-height:1.8;">
                    No image loaded. Upload an image to begin.
                </div>
            </div>
        </div>
    </details>
</div>
```

제거되는 것: `modern-tool-grid` 2컬럼 래퍼, 버튼 3개(`btn-to-webp`/`btn-to-jpg`/`btn-to-png`), `convert-btn-row` div들. `<style>` 블록의 `.convert-btn-row` 규칙도 삭제.

- [ ] **Step 4: JS 수정**

`js/tools/webp-convert.js` 변경점:

DOM refs — 버튼 3개 ref 교체:

```js
    // 기존 btnToWebp/btnToJpg/btnToPng 3줄 삭제, 아래로 교체
    const btnConvert        = document.getElementById('btn-convert');
    const formatRadios      = document.querySelectorAll('input[name="out-format"]');
```

`loadFile()` 성공 콜백에서 버튼 활성화 부분(기존 `btnToWebp.removeAttribute...` 3줄 + `setStatus('Image loaded...')`) 교체:

```js
            // Smart default: WebP in → JPG out, everything else → WebP (spec mapping)
            const autoFormat = (file.type === 'image/webp') ? 'image/jpeg' : 'image/webp';
            document.querySelector(`input[name="out-format"][value="${autoFormat}"]`).checked = true;
            updateBgCardVisibility();

            btnConvert.removeAttribute('disabled');
            setStatus('Image loaded. Click Convert.');
```

`loadFile()` 끝의 `bgColorCard.style.display = 'block';` 줄 삭제 (아래 `updateBgCardVisibility`가 대체).

변환 버튼 리스너 — 기존 `btnToWebp/btnToJpg/btnToPng.addEventListener` 3줄 교체:

```js
    btnConvert.addEventListener('click', () => {
        const mime = document.querySelector('input[name="out-format"]:checked').value;
        const ext  = mime === 'image/jpeg' ? 'jpg' : (mime === 'image/webp' ? 'webp' : 'png');
        doConvert(mime, ext);
    });

    // Settings changed after a conversion → require re-convert
    function markStale() {
        if (!lastBlob) { updateBgCardVisibility(); return; }
        btnDownload.classList.add('is-stale');
        setStatus('Settings changed — click Convert again.');
        updateBgCardVisibility();
    }
    formatRadios.forEach(r => r.addEventListener('change', markStale));
    qualitySlider.addEventListener('change', markStale);
    bgColor.addEventListener('change', markStale);

    // Show bg-color card only when JPG output selected
    function updateBgCardVisibility() {
        const mime = document.querySelector('input[name="out-format"]:checked').value;
        bgColorCard.style.display = (mime === 'image/jpeg') ? 'block' : 'none';
    }
```

`doConvert()` 내 `canvas.toBlob` 성공 콜백에서 다운로드 버튼 표시 줄에 stale 해제 추가:

```js
                    btnDownload.style.display = '';
                    btnDownload.classList.remove('is-stale');
                    btnDownload.removeAttribute('disabled');
```

`disableButtons()` / `enableButtons()` 교체:

```js
    function disableButtons() {
        btnConvert.setAttribute('disabled', true);
    }

    function enableButtons() {
        if (!currentImage) return;
        btnConvert.removeAttribute('disabled');
    }
```

- [ ] **Step 5: 캐시버스팅 버전 증가**

`tools/webp-convert.html` 스크립트 태그: `/js/tools/webp-convert.js?v=1` → `?v=2`.

- [ ] **Step 6: 테스트 실행, 통과 확인**

Run: `cd test && npx playwright test e2e.test.js -g "Simplified One-Click Flow"`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add tools/webp-convert.html js/tools/webp-convert.js test/e2e.test.js
git commit -m "feat: simplify webp-convert to one-click flow with collapsed advanced settings"
```

---

### Task 3: jpg-png 단순화

**Files:**
- Modify: `tools/jpg-png.html`
- Modify: `js/tools/jpg-png.js`
- Test: `test/e2e.test.js` (기존 "Image Format Converter" 테스트 수정)

**Interfaces:**
- Consumes: Task 1의 CSS 클래스
- Produces: DOM id 계약 — `input[name="out-format"]` 라디오(`#fmt-jpg`/`#fmt-png`/`#fmt-webp`, value는 MIME), `#btn-convert`(기존 id 유지), `#advanced-settings`

- [ ] **Step 1: 기존 E2E 테스트를 새 흐름으로 수정**

`test/e2e.test.js`의 `Image Format Converter (jpg-png.html)` 테스트에서 포맷 선택 줄 교체:

```js
        // 기존: await page.selectOption('#target-format', 'image/jpeg');
        // 스마트 기본값 검증: PNG 입력 → JPG 자동 선택 (스펙 매핑)
        await expect(page.locator('#fmt-jpg')).toBeChecked();
```

나머지(업로드, `#btn-convert` 클릭, 다운로드 파일명 `mock-image_converted.jpg` 검증)는 그대로 유지.

- [ ] **Step 2: 테스트 실행, 실패 확인**

Run: `cd test && npx playwright test e2e.test.js -g "Image Format Converter"`
Expected: FAIL — `#fmt-jpg` 요소 없음.

- [ ] **Step 3: HTML 마크업 재구성**

`tools/jpg-png.html`의 `<div class="modern-tool-grid">` 영역을 교체. Column 1의 업로드존/배치 리스트/상태 텍스트 마크업은 그대로 재사용:

```html
<div class="tool-flow">
    <!-- Upload dropzone: 기존 #drop-zone 블록 그대로 -->
    <!-- Batch file list: 기존 #batch-container 블록 그대로 -->
    <!-- Status text: 기존 #status-text/#status-info 블록 그대로 -->

    <!-- Format segment toggle -->
    <div class="segment-toggle" id="format-toggle" role="radiogroup" aria-label="Output format">
        <input type="radio" name="out-format" id="fmt-jpg" value="image/jpeg">
        <label for="fmt-jpg">JPG</label>
        <input type="radio" name="out-format" id="fmt-png" value="image/png" checked>
        <label for="fmt-png">PNG</label>
        <input type="radio" name="out-format" id="fmt-webp" value="image/webp">
        <label for="fmt-webp">WebP</label>
    </div>

    <button class="btn-convert-hero" id="btn-convert" disabled>&#128260; Convert All Files</button>
    <div style="font-size:11px; color:var(--slate-500); text-align:center;">
        Files will be downloaded individually as each conversion completes.
    </div>

    <details class="advanced-settings" id="advanced-settings">
        <summary>Advanced settings</summary>
        <div class="advanced-settings__body">
            <div class="modern-card">
                <h3 class="modern-card__title">Quality Settings</h3>
                <!-- 기존 #quality-panel 블록 그대로 -->
                <!-- 기존 #alpha-panel 블록 그대로 -->
            </div>
        </div>
    </details>
</div>
```

제거되는 것: 2컬럼 래퍼, `Output Format` 카드의 `<select id="target-format">`.

주의: 주석 자리("기존 블록 그대로")에는 반드시 원본 HTML 블록을 복사해 넣는다. 이 계획 문서의 주석을 그대로 두면 안 됨.

- [ ] **Step 4: JS 수정**

`js/tools/jpg-png.js` 변경점:

```js
    // 기존: const targetFormatSelect = document.getElementById('target-format');
    const formatRadios = document.querySelectorAll('input[name="out-format"]');

    function getTargetFormat() {
        return document.querySelector('input[name="out-format"]:checked').value;
    }
```

기존 `targetFormatSelect.value` 참조 2곳(`toggleFormatSettings` 내부, 변환 시작부)을 `getTargetFormat()` 호출로 교체.

기존 `targetFormatSelect.addEventListener('change', toggleFormatSettings);` 교체:

```js
    formatRadios.forEach(r => r.addEventListener('change', toggleFormatSettings));
```

스마트 기본값 — `addFilesToQueue()` 함수 안 `renderBatchList();` 호출 바로 뒤에 삽입 (배열 변수명은 `fileQueue`, 요소는 `File` 객체):

```js
        // Smart default from first file: JPG in → PNG out, everything else → JPG (spec mapping)
        if (fileQueue.length > 0) {
            const autoFormat = (fileQueue[0].type === 'image/jpeg') ? 'image/png' : 'image/jpeg';
            document.querySelector(`input[name="out-format"][value="${autoFormat}"]`).checked = true;
            toggleFormatSettings();
        }
```

- [ ] **Step 5: 캐시버스팅 버전 증가**

`tools/jpg-png.html`: `/js/tools/jpg-png.js?v=4` → `?v=5`.

- [ ] **Step 6: 테스트 실행, 통과 확인**

Run: `cd test && npx playwright test e2e.test.js -g "Image Format Converter"`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add tools/jpg-png.html js/tools/jpg-png.js test/e2e.test.js
git commit -m "feat: simplify jpg-png batch converter with segment toggle and smart default"
```

---

### Task 4: compress 단순화

**Files:**
- Modify: `tools/compress.html`
- Test: `test/e2e.test.js` (신규 테스트 추가)

**Interfaces:**
- Consumes: Task 1의 CSS 클래스
- Produces: DOM id 계약 — `#btn-download`(hero, 기존 id 유지), `#advanced-settings`. JS(`js/tools/compress.js`)는 **수정 불필요** — id가 전부 유지되므로.

- [ ] **Step 1: 실패하는 E2E 테스트 작성**

`test/e2e.test.js` 끝에 추가:

```js
test('Image Compressor (compress.html) - Auto Compress One-Click Download', async ({ page }) => {
    const mockImage = path.join(__dirname, 'mock-image.png');
    const mockPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
    );
    fs.writeFileSync(mockImage, mockPngBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/compress.html');

        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#drop-zone');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockImage);

        // 라이브 자동 압축 완료 → 고급 설정은 접힘, 다운로드 활성화
        await expect(page.locator('#advanced-settings')).not.toHaveAttribute('open', '');
        await expect(page.locator('#btn-download')).toBeEnabled();

        const downloadPromise = page.waitForEvent('download');
        await page.click('#btn-download');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('_compressed_q');
    } finally {
        if (fs.existsSync(mockImage)) fs.unlinkSync(mockImage);
    }
});
```

- [ ] **Step 2: 테스트 실행, 실패 확인**

Run: `cd test && npx playwright test e2e.test.js -g "Auto Compress"`
Expected: FAIL — `#advanced-settings` 요소 없음.

- [ ] **Step 3: HTML 마크업 재구성**

`tools/compress.html`의 `<div class="modern-tool-grid">` 영역 교체. 업로드존/프리뷰/인디케이터/통계 마크업 그대로 재사용:

```html
<div class="tool-flow">
    <!-- 기존 #drop-zone 블록 그대로 -->
    <!-- 기존 #preview-container 블록 그대로 -->
    <!-- 기존 #processing-indicator 블록 그대로 -->
    <!-- 기존 #compress-stats 블록 그대로 -->

    <button class="btn-convert-hero btn-download-hero" id="btn-download" disabled>&#x1F4BE; Download Compressed Image</button>
    <div id="download-info" style="display:none; text-align:center; font-size:11px; color:var(--slate-500);">
        <span id="download-info-text"></span>
    </div>

    <details class="advanced-settings" id="advanced-settings">
        <summary>Advanced settings</summary>
        <div class="advanced-settings__body">
            <!-- 기존 Quality card (.modern-card, #quality-slider/#output-format 포함) 블록 그대로 -->
            <!-- 기존 #file-info-card 블록 그대로 -->
        </div>
    </details>
</div>
```

`#btn-download`의 기존 클래스 `modern-btn modern-btn--primary` → `btn-convert-hero btn-download-hero`로 교체, inline style 제거. JS 수정 없음.

주의: 주석 자리에는 원본 HTML 블록 복사. 계획 주석 그대로 두면 안 됨.

- [ ] **Step 4: 캐시버스팅 버전 증가**

`tools/compress.html`: `/js/tools/compress.js?v=1` → `?v=2`. (JS 내용 무변경이나 HTML 구조 변경에 따른 안전 조치 — 코어 스크립트 버전은 유지.)

- [ ] **Step 5: 테스트 실행, 통과 확인**

Run: `cd test && npx playwright test e2e.test.js -g "Auto Compress"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tools/compress.html test/e2e.test.js
git commit -m "feat: simplify compress page with hero download and collapsed settings"
```

---

### Task 5: 전체 회귀 검증

**Files:**
- 없음 (검증만)

- [ ] **Step 1: 유닛 테스트**

Run: `node test/run-tests.js`
Expected: 전체 PASS (변경 없어야 정상 — 코어 모듈 미수정).

- [ ] **Step 2: E2E 전체**

Run: `npx http-server -p 8080 -c-1` 실행 중인 상태에서 `cd test && npm run test:e2e`
Expected: 전체 PASS — 기존 케이스(엔진 테스트, resize, pdf) + 수정된 jpg-png + 신규 webp-convert/compress.

- [ ] **Step 3: 모바일 뷰포트 수동 확인**

브라우저 DevTools 375px 뷰포트로 파일럿 3개 페이지 확인:
- 세그먼트 토글 한 줄 유지, 터치 타깃 44px 이상
- `.tool-flow` 세로 흐름 정상, 가로 스크롤 없음
- 고급 설정 펼침/접힘 동작

- [ ] **Step 4: 최종 커밋 (필요 시)**

수동 확인에서 CSS 미세 조정 발생한 경우:

```bash
git add css/tools.css
git commit -m "fix: mobile viewport adjustments for simplified tool flow"
```

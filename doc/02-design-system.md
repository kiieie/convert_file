# 🎨 ConvertFile — Windows XP 디자인 시스템

> Windows XP Luna Blue 테마 기반 UI 컴포넌트 라이브러리
> 모든 CSS는 순수 CSS3 — 프레임워크 없음 · 저작권 있는 XP 자산 사용 안 함

---

## 목차

1. [디자인 시스템 개요](#1-디자인-시스템-개요)
2. [XP 컴포넌트 상세 스펙](#2-xp-컴포넌트-상세-스펙)
3. [레이아웃 구조](#3-레이아웃-구조)
4. [반응형 전략](#4-반응형-전략)
5. [아이콘 세트](#5-아이콘-세트)
6. [애니메이션 & 인터랙션](#6-애니메이션--인터랙션)
7. [CSS 아키텍처](#7-css-아키텍처)

---

## 1. 디자인 시스템 개요

### 1.1 비주얼 레퍼런스

**Windows XP Luna Blue** 테마를 정밀 재현. "Bliss" 바탕화면의 파란 하늘과 초록 언덕 느낌. 모든 컴포넌트는 XP 클래식 룩(3D 입체 효과, 그라데이션, 둥근 모서리)을 따름.

핵심 시각 특징:
- **3D 입체 효과** — `box-shadow`와 `border` 조합으로 볼록/오목 효과
- **부드러운 그라데이션** — 제목표시줄, 버튼, 탭에 `linear-gradient` 적용
- **둥근 모서리** — 창 프레임 상단 `border-radius: 8px 8px 0 0`
- **파란색 악센트** — 선택, 포커스, 활성 상태에 일관된 파란색 사용

### 1.2 컬러 팔레트

#### 기본 시스템 색상

| 토큰명 | 용도 | HEX | 미리보기 |
|---------|------|-----|----------|
| `--xp-titlebar-start` | 제목표시줄 그라데이션 시작 | `#0A246A` | 🟦 진한 남색 |
| `--xp-titlebar-end` | 제목표시줄 그라데이션 끝 | `#3A6EA5` | 🟦 중간 파랑 |
| `--xp-titlebar-inactive-start` | 비활성 제목표시줄 시작 | `#7A96DF` | 🟦 연한 파랑 |
| `--xp-titlebar-inactive-end` | 비활성 제목표시줄 끝 | `#A6CAF0` | 🟦 하늘색 |
| `--xp-border-active` | 활성 창 테두리 | `#0054E3` | 🔵 강조 파랑 |
| `--xp-border-inactive` | 비활성 창 테두리 | `#7A96DF` | 🔵 연한 파랑 |
| `--xp-button-face` | 버튼/툴바 배경 | `#ECE9D8` | ⬜ XP 회색 |
| `--xp-button-highlight` | 버튼 하이라이트 (상단/좌측) | `#FFFFFF` | ⬜ 흰색 |
| `--xp-button-shadow` | 버튼 그림자 (하단/우측) | `#ACA899` | 🟫 어두운 회색 |
| `--xp-button-dark-shadow` | 버튼 외곽 그림자 | `#716F64` | 🟫 진한 회색 |
| `--xp-desktop-bg` | 바탕화면 배경 | `#3A6EA5` | 🟦 Bliss 파랑 |
| `--xp-start-green` | 시작 버튼 녹색 | `#21A121` | 🟩 XP 녹색 |
| `--xp-start-green-dark` | 시작 버튼 어두운 녹색 | `#187018` | 🟩 진한 녹색 |
| `--xp-selection` | 선택 영역 배경 | `#316AC5` | 🔵 선택 파랑 |
| `--xp-selection-text` | 선택 영역 글자 | `#FFFFFF` | ⬜ 흰색 |
| `--xp-window-bg` | 창 내부 배경 | `#FFFFFF` | ⬜ 흰색 |
| `--xp-menu-bar` | 메뉴바 배경 | `#D6D2C2` | ⬜ 밝은 회색 |
| `--xp-menu-hover` | 메뉴 항목 호버 | `#316AC5` | 🔵 선택 파랑 |
| `--xp-scrollbar-track` | 스크롤바 트랙 | `#F1EFE2` | ⬜ 연한 베이지 |
| `--xp-scrollbar-thumb` | 스크롤바 썸 | `#C8C0B0` | 🟫 베이지 |
| `--xp-scrollbar-arrow` | 스크롤바 화살표 버튼 | `#ECE9D8` | ⬜ 버튼색 |

#### 상태 색상

| 토큰명 | 용도 | HEX |
|---------|------|-----|
| `--xp-error` | 오류 아이콘/텍스트 | `#CC0000` |
| `--xp-warning` | 경고 아이콘 | `#FFD700` |
| `--xp-info` | 정보 아이콘 | `#0054E3` |
| `--xp-success` | 성공/완료 | `#21A121` |
| `--xp-progress-bar` | 진행바 녹색 블록 | `#37B44A` |
| `--xp-progress-track` | 진행바 트랙 | `#FFFFFF` |
| `--xp-disabled-text` | 비활성 텍스트 | `#ACA899` |
| `--xp-disabled-bg` | 비활성 배경 | `#D6D2C2` |
| `--xp-link` | 하이퍼링크 | `#0066CC` |
| `--xp-link-visited` | 방문한 링크 | `#800080` |

#### CSS 변수 정의

```css
/* xp-theme.css — 색상 토큰 */
:root {
  /* === 제목표시줄 === */
  --xp-titlebar-start: #0A246A;
  --xp-titlebar-end: #3A6EA5;
  --xp-titlebar-inactive-start: #7A96DF;
  --xp-titlebar-inactive-end: #A6CAF0;

  /* === 테두리 === */
  --xp-border-active: #0054E3;
  --xp-border-inactive: #7A96DF;
  --xp-border-inner-light: #FFFFFF;
  --xp-border-inner-dark: #ACA899;

  /* === 버튼 === */
  --xp-button-face: #ECE9D8;
  --xp-button-highlight: #FFFFFF;
  --xp-button-shadow: #ACA899;
  --xp-button-dark-shadow: #716F64;
  --xp-button-hover-bg: #B6BDD2;

  /* === 바탕화면/시작메뉴 === */
  --xp-desktop-bg: #3A6EA5;
  --xp-start-green: #21A121;
  --xp-start-green-dark: #187018;

  /* === 선택/포커스 === */
  --xp-selection: #316AC5;
  --xp-selection-text: #FFFFFF;
  --xp-focus-ring: #0054E3;

  /* === 창/메뉴/스크롤바 === */
  --xp-window-bg: #FFFFFF;
  --xp-menu-bar: #D6D2C2;
  --xp-menu-hover: #316AC5;
  --xp-scrollbar-track: #F1EFE2;
  --xp-scrollbar-thumb: #C8C0B0;
  --xp-scrollbar-arrow: #ECE9D8;

  /* === 상태 === */
  --xp-error: #CC0000;
  --xp-warning: #FFD700;
  --xp-info: #0054E3;
  --xp-success: #21A121;
  --xp-progress-bar: #37B44A;
  --xp-progress-track: #FFFFFF;
  --xp-disabled-text: #ACA899;
  --xp-disabled-bg: #D6D2C2;

  /* === 링크 === */
  --xp-link: #0066CC;
  --xp-link-visited: #800080;

  /* === 타이포그래피 === */
  --xp-font-family: "Tahoma", "Segoe UI", "MS Sans Serif", "Arial", sans-serif;
  --xp-font-size: 11px;
  --xp-font-size-title: 13px;
  --xp-font-size-menu: 11px;
  --xp-font-size-small: 10px;
  --xp-font-weight-normal: 400;
  --xp-font-weight-bold: 700;

  /* === 간격 === */
  --xp-spacing-xs: 2px;
  --xp-spacing-sm: 4px;
  --xp-spacing-md: 8px;
  --xp-spacing-lg: 12px;
  --xp-spacing-xl: 16px;
  --xp-spacing-xxl: 24px;

  /* === 레이아웃 === */
  --xp-taskbar-height: 30px;
  --xp-titlebar-height: 25px;
  --xp-menubar-height: 20px;
  --xp-statusbar-height: 22px;
  --xp-border-width: 3px;
  --xp-border-radius-window: 8px;
}
```

### 1.3 타이포그래피

| 요소 | 폰트 | 크기 | 두께 | 색상 |
|------|------|------|------|------|
| 본문 텍스트 | Tahoma | 11px | 400 | `#000000` |
| 제목표시줄 텍스트 | Tahoma | 13px | 700 | `#FFFFFF` (text-shadow) |
| 메뉴 항목 | Tahoma | 11px | 400 | `#000000` |
| 버튼 텍스트 | Tahoma | 11px | 400 | `#000000` |
| 상태바 텍스트 | Tahoma | 10px | 400 | `#000000` |
| 비활성 텍스트 | Tahoma | 11px | 400 | `#ACA899` |
| 링크 | Tahoma | 11px | 400 | `#0066CC` (밑줄) |
| 툴팁 | Tahoma | 11px | 400 | `#000000` (노란배경) |
| 대화상자 제목 | Tahoma | 11px | 700 | `#000000` |

```css
/* xp-theme.css — 타이포그래피 */

/* 기본 폰트 리셋 - XP Tahoma 기준 */
body {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  font-weight: var(--xp-font-weight-normal);
  color: #000000;
  line-height: 1.3;
  -webkit-font-smoothing: none; /* XP 느낌: 안티앨리어싱 최소화 */
  -moz-osx-font-smoothing: auto;
}

/* 제목표시줄 텍스트 - 흰색 + 그림자로 입체감 */
.xp-titlebar-text {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size-title);
  font-weight: var(--xp-font-weight-bold);
  color: #FFFFFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  letter-spacing: 0;
}

/* 메뉴 텍스트 - 단축키 밑줄 표시 가능 */
.xp-menu-text {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size-menu);
  color: #000000;
}

/* 비활성 텍스트 - 흐린 회색 */
.xp-text-disabled {
  color: var(--xp-disabled-text);
}
```

---

## 2. XP 컴포넌트 상세 스펙

### 2.1 Window Frame (창 프레임)

XP 창의 핵심 요소. 둥근 상단 모서리 + 파란 그라데이션 제목표시줄 + 3D 입체 테두리.

#### HTML 구조

```html
<!-- XP 윈도우 프레임 - 기본 구조 -->
<div class="xp-window" data-state="active">
  <!-- 제목표시줄 영역 -->
  <div class="xp-titlebar">
    <!-- 앱 아이콘 (16x16) -->
    <span class="xp-titlebar-icon">
      <svg><!-- 도구 아이콘 SVG --></svg>
    </span>
    <!-- 창 제목 텍스트 -->
    <span class="xp-titlebar-text">Image Converter</span>
    <!-- 시스템 버튼 그룹: 최소화 / 최대화 / 닫기 -->
    <div class="xp-titlebar-buttons">
      <button class="xp-sys-btn xp-minimize" aria-label="최소화">
        <span class="xp-sys-icon">─</span>
      </button>
      <button class="xp-sys-btn xp-maximize" aria-label="최대화">
        <span class="xp-sys-icon">☐</span>
      </button>
      <button class="xp-sys-btn xp-close" aria-label="닫기">
        <span class="xp-sys-icon">✕</span>
      </button>
    </div>
  </div>

  <!-- 메뉴바 (선택 사항) -->
  <div class="xp-menubar">
    <button class="xp-menu-item">File</button>
    <button class="xp-menu-item">Edit</button>
    <button class="xp-menu-item">View</button>
    <button class="xp-menu-item">Help</button>
  </div>

  <!-- 창 본문 콘텐츠 -->
  <div class="xp-window-body">
    <!-- 도구 UI 콘텐츠 -->
  </div>

  <!-- 상태바 (선택 사항) -->
  <div class="xp-statusbar">
    <div class="xp-statusbar-panel">Ready</div>
    <div class="xp-statusbar-panel">1024 × 768</div>
    <div class="xp-statusbar-panel">245 KB</div>
  </div>
</div>
```

#### CSS 구현

```css
/* xp-components.css — 윈도우 프레임 */

/* === 창 외곽 컨테이너 === */
.xp-window {
  /* 3D 입체 테두리 - XP 스타일 4중 보더 */
  border: 3px solid var(--xp-border-active);
  border-radius: var(--xp-border-radius-window) var(--xp-border-radius-window) 0 0;
  /* 외곽 그림자 - 살짝 떠있는 느낌 */
  box-shadow:
    /* 외곽 검정 테두리 */
    0 0 0 1px rgba(0, 0, 0, 0.3),
    /* 부드러운 드롭 섀도우 */
    2px 4px 12px rgba(0, 0, 0, 0.35);
  background: var(--xp-button-face);
  /* 기본 크기 */
  min-width: 300px;
  min-height: 200px;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 비활성 창 - 테두리/제목표시줄 색상 변경 */
.xp-window[data-state="inactive"] {
  border-color: var(--xp-border-inactive);
}

/* === 제목표시줄 === */
.xp-titlebar {
  /* Luna Blue 그라데이션 - 좌→우 진한남색→중간파랑 */
  background: linear-gradient(
    180deg,
    /* 상단 밝은 악센트 라인 */
    #0997FF 0%,
    #0A246A 3%,
    /* 메인 그라데이션 */
    #3A6EA5 50%,
    #0A246A 97%,
    /* 하단 어두운 라인 */
    #063B73 100%
  );
  height: var(--xp-titlebar-height);
  padding: 0 3px 0 4px;
  display: flex;
  align-items: center;
  /* 상단 둥근 모서리 - 창 보더와 맞춤 */
  border-radius: 5px 5px 0 0;
  /* 드래그 커서 */
  cursor: default;
  user-select: none;
}

/* 비활성 제목표시줄 - 연한 파란 그라데이션 */
.xp-window[data-state="inactive"] .xp-titlebar {
  background: linear-gradient(
    180deg,
    #A6CAF0 0%,
    #7A96DF 3%,
    #A6CAF0 50%,
    #7A96DF 97%,
    #8CAAE6 100%
  );
}

/* 제목표시줄 아이콘 */
.xp-titlebar-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 제목 텍스트 - 남은 공간 차지 */
.xp-titlebar-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 2px;
}

/* === 시스템 버튼 그룹 (최소화/최대화/닫기) === */
.xp-titlebar-buttons {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

/* 시스템 버튼 공통 */
.xp-sys-btn {
  width: 21px;
  height: 21px;
  border: none;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* 기본 파란색 계열 */
  background: linear-gradient(
    180deg,
    #3A8FD7 0%,
    #2A6CB5 45%,
    #1A4C95 100%
  );
  /* 버튼 입체 효과 */
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.3),
    inset -1px -1px 0 rgba(0, 0, 0, 0.2);
  color: #FFFFFF;
  font-size: 10px;
  font-weight: bold;
  padding: 0;
}

/* 최소화/최대화 버튼 호버 */
.xp-sys-btn:hover {
  background: linear-gradient(
    180deg,
    #5AAFFF 0%,
    #3A8FD7 45%,
    #2A6CB5 100%
  );
}

/* 버튼 눌림 효과 */
.xp-sys-btn:active {
  background: linear-gradient(
    180deg,
    #1A4C95 0%,
    #2A6CB5 45%,
    #3A8FD7 100%
  );
  box-shadow:
    inset -1px -1px 0 rgba(255, 255, 255, 0.2),
    inset 1px 1px 0 rgba(0, 0, 0, 0.3);
}

/* 닫기 버튼 - 빨간색 계열 */
.xp-close {
  background: linear-gradient(
    180deg,
    #D7603A 0%,
    #C5402A 45%,
    #A5201A 100%
  );
}

.xp-close:hover {
  background: linear-gradient(
    180deg,
    #F7805A 0%,
    #D7603A 45%,
    #C5402A 100%
  );
}

.xp-close:active {
  background: linear-gradient(
    180deg,
    #A5201A 0%,
    #C5402A 45%,
    #D7603A 100%
  );
}

/* 시스템 아이콘 (최소화/최대화/닫기 기호) */
.xp-sys-icon {
  font-size: 9px;
  line-height: 1;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
}

/* === 리사이즈 핸들 === */
.xp-window::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;
  /* XP 스타일 대각선 점 패턴 */
  background-image:
    radial-gradient(circle, #716F64 1px, transparent 1px),
    radial-gradient(circle, #716F64 1px, transparent 1px),
    radial-gradient(circle, #716F64 1px, transparent 1px),
    radial-gradient(circle, #FFFFFF 1px, transparent 1px),
    radial-gradient(circle, #FFFFFF 1px, transparent 1px),
    radial-gradient(circle, #FFFFFF 1px, transparent 1px);
  background-size: 4px 4px;
  background-position:
    10px 10px, 6px 10px, 10px 6px,
    11px 11px, 7px 11px, 11px 7px;
  background-repeat: no-repeat;
}
```

### 2.2 Buttons (버튼)

XP 클래식 3D 입체 버튼. 볼록한 기본 상태, 호버시 강조, 클릭시 오목하게 눌림.

```css
/* xp-components.css — 버튼 */

/* === 기본 XP 버튼 === */
.xp-button {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: #000000;
  background-color: var(--xp-button-face);
  /* XP 3D 입체 테두리 — 상단+좌측 밝음, 하단+우측 어두움 */
  border: 2px solid;
  border-color:
    var(--xp-button-highlight)  /* top */
    var(--xp-button-dark-shadow) /* right */
    var(--xp-button-dark-shadow) /* bottom */
    var(--xp-button-highlight); /* left */
  /* 내부 입체 효과 (이중 보더 시뮬레이션) */
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px -1px 0 var(--xp-button-shadow);
  padding: 4px 16px;
  min-width: 75px;
  min-height: 23px;
  cursor: pointer;
  user-select: none;
  text-align: center;
  white-space: nowrap;
}

/* 호버 상태 - 약간 밝아짐 */
.xp-button:hover {
  background-color: #F0EDE1;
}

/* 눌림 상태 - 오목하게 들어감 (보더 반전) */
.xp-button:active {
  border-color:
    var(--xp-button-dark-shadow)
    var(--xp-button-highlight)
    var(--xp-button-highlight)
    var(--xp-button-dark-shadow);
  box-shadow:
    inset -1px -1px 0 var(--xp-button-highlight),
    inset 1px 1px 0 var(--xp-button-shadow);
  /* 텍스트 1px 이동 — 눌린 느낌 */
  padding: 5px 15px 3px 17px;
}

/* 포커스 상태 - 점선 내부 테두리 */
.xp-button:focus-visible {
  outline: none;
  /* XP 스타일 포커스 점선 */
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px -1px 0 var(--xp-button-shadow),
    inset 3px 3px 0 transparent,
    inset -3px -3px 0 transparent;
}
.xp-button:focus-visible::after {
  content: "";
  position: absolute;
  inset: 3px;
  border: 1px dotted #000000;
  pointer-events: none;
}

/* 비활성 상태 - 회색 텍스트 + 클릭 불가 */
.xp-button:disabled {
  color: var(--xp-disabled-text);
  cursor: not-allowed;
  /* 비활성 3D 효과 — 입체감 유지하되 흐리게 */
  text-shadow: 1px 1px 0 #FFFFFF;
}

/* === 기본(Default) 버튼 — 파란 강조 테두리 === */
.xp-button--default {
  border-color:
    var(--xp-button-highlight)
    var(--xp-button-dark-shadow)
    var(--xp-button-dark-shadow)
    var(--xp-button-highlight);
  /* 기본 버튼 외곽에 진한 파란 테두리 추가 */
  outline: 2px solid var(--xp-border-active);
  outline-offset: -1px;
}

/* === 작은 버튼 (도구바용) === */
.xp-button--small {
  padding: 2px 8px;
  min-width: auto;
  min-height: 20px;
  font-size: var(--xp-font-size-small);
}

/* === 아이콘 버튼 (도구바 아이콘만) === */
.xp-button--icon {
  padding: 2px;
  min-width: 24px;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* === 토글 버튼 (눌린 상태 유지) === */
.xp-button--toggle[aria-pressed="true"] {
  border-color:
    var(--xp-button-dark-shadow)
    var(--xp-button-highlight)
    var(--xp-button-highlight)
    var(--xp-button-dark-shadow);
  box-shadow:
    inset -1px -1px 0 var(--xp-button-highlight),
    inset 1px 1px 0 var(--xp-button-shadow);
  background-color: #DDD8C8;
}
```

### 2.3 Input Fields (입력 필드)

XP 스타일 오목한(Sunken) 3D 테두리 입력 필드.

```css
/* xp-components.css — 입력 필드 */

/* === 텍스트 입력 === */
.xp-input {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: #000000;
  background-color: var(--xp-window-bg);
  /* 오목한 3D 보더 — 상단+좌측 어두움, 하단+우측 밝음 (버튼과 반대) */
  border: 2px solid;
  border-color:
    var(--xp-button-shadow)     /* top: 어둡게 */
    var(--xp-button-highlight)  /* right: 밝게 */
    var(--xp-button-highlight)  /* bottom: 밝게 */
    var(--xp-button-shadow);    /* left: 어둡게 */
  box-shadow:
    inset 1px 1px 0 var(--xp-button-dark-shadow),
    inset -1px -1px 0 #F0EDE1;
  padding: 2px 4px;
  min-height: 21px;
}

/* 포커스 상태 - 파란 테두리 */
.xp-input:focus {
  outline: none;
  border-color: var(--xp-focus-ring);
  box-shadow:
    inset 1px 1px 0 var(--xp-focus-ring),
    inset -1px -1px 0 var(--xp-focus-ring);
}

/* 비활성 입력 필드 */
.xp-input:disabled {
  background-color: var(--xp-button-face);
  color: var(--xp-disabled-text);
  cursor: not-allowed;
}

/* 읽기 전용 */
.xp-input:read-only {
  background-color: #F5F3EB;
}

/* === 텍스트 에어리어 === */
.xp-textarea {
  /* xp-input과 동일한 스타일 상속 */
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: #000000;
  background-color: var(--xp-window-bg);
  border: 2px solid;
  border-color:
    var(--xp-button-shadow)
    var(--xp-button-highlight)
    var(--xp-button-highlight)
    var(--xp-button-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-dark-shadow),
    inset -1px -1px 0 #F0EDE1;
  padding: 2px 4px;
  resize: both;
}

/* === 숫자 입력 (리사이즈 수치 등) === */
.xp-input--number {
  width: 80px;
  text-align: right;
}
```

### 2.4 Dropdown / Select (드롭다운)

```css
/* xp-components.css — 드롭다운 */

/* === XP 스타일 셀렉트 래퍼 === */
.xp-select-wrapper {
  position: relative;
  display: inline-block;
}

/* 셀렉트 본체 */
.xp-select {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: #000000;
  background-color: var(--xp-window-bg);
  /* 오목한 보더 (입력 필드와 동일) */
  border: 2px solid;
  border-color:
    var(--xp-button-shadow)
    var(--xp-button-highlight)
    var(--xp-button-highlight)
    var(--xp-button-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-dark-shadow);
  padding: 2px 20px 2px 4px;
  min-height: 21px;
  min-width: 100px;
  cursor: pointer;
  /* 기본 화살표 제거 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* XP 스타일 드롭다운 화살표 버튼 — 우측에 별도 버튼 모양 */
.xp-select-wrapper::after {
  content: "▼";
  position: absolute;
  right: 2px;
  top: 2px;
  bottom: 2px;
  width: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #000000;
  background: var(--xp-button-face);
  /* 볼록한 3D 버튼 */
  border-left: 1px solid var(--xp-button-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px -1px 0 var(--xp-button-shadow);
  pointer-events: none;
}

/* 포커스 상태 */
.xp-select:focus {
  outline: none;
  border-color: var(--xp-focus-ring);
}

/* === 커스텀 드롭다운 메뉴 (JS 기반) === */
.xp-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 100%;
  background: var(--xp-window-bg);
  border: 1px solid var(--xp-button-dark-shadow);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

/* 드롭다운 항목 */
.xp-dropdown-item {
  padding: 2px 8px;
  cursor: pointer;
  white-space: nowrap;
  font-size: var(--xp-font-size);
}

/* 드롭다운 항목 호버 - 파란 배경 + 흰 텍스트 */
.xp-dropdown-item:hover,
.xp-dropdown-item--selected {
  background: var(--xp-selection);
  color: var(--xp-selection-text);
}
```

### 2.5 Tabs (탭)

XP 스타일 볼록한 탭. 활성 탭은 하단 보더가 사라지며 본문과 연결.

```css
/* xp-components.css — 탭 */

/* === 탭 컨테이너 === */
.xp-tabs {
  display: flex;
  align-items: flex-end;
  gap: 0;
  /* 탭 아래 보더라인 */
  border-bottom: 1px solid var(--xp-button-shadow);
  padding-left: 4px;
}

/* === 개별 탭 === */
.xp-tab {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: #000000;
  background: var(--xp-button-face);
  /* 볼록한 3D 테두리 (상단 + 좌우만) */
  border: 1px solid var(--xp-button-dark-shadow);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  padding: 4px 12px;
  margin-bottom: -1px; /* 하단 보더 겹침 */
  cursor: pointer;
  user-select: none;
  position: relative;
  /* 비활성 탭은 살짝 아래로 */
  top: 2px;
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px 0 0 var(--xp-button-shadow);
}

/* 활성 탭 - 위로 올라오고 하단 보더 없음 */
.xp-tab--active {
  top: 0;
  background: var(--xp-window-bg);
  /* 하단을 흰색으로 덮어서 본문과 연결된 느낌 */
  border-bottom: 1px solid var(--xp-window-bg);
  font-weight: var(--xp-font-weight-bold);
  z-index: 1;
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px 0 0 var(--xp-button-shadow);
}

/* 탭 호버 (비활성 탭만) */
.xp-tab:not(.xp-tab--active):hover {
  background: #F0EDE1;
}

/* === 탭 패널 (내용 영역) === */
.xp-tab-panel {
  background: var(--xp-window-bg);
  border: 1px solid var(--xp-button-dark-shadow);
  border-top: none; /* 탭과 연결 */
  padding: 12px;
  box-shadow:
    inset 1px 0 0 var(--xp-button-highlight),
    inset -1px -1px 0 var(--xp-button-shadow);
}
```

### 2.6 Progress Bar (진행바)

XP 스타일 — 흰 트랙 위에 녹색 블록이 한 칸씩 채워지는 애니메이션.

```css
/* xp-components.css — 진행바 */

/* === 진행바 트랙 (외곽) === */
.xp-progress {
  height: 17px;
  /* 오목한 3D 테두리 */
  border: 1px solid var(--xp-button-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-dark-shadow),
    inset -1px -1px 0 var(--xp-button-highlight);
  background: var(--xp-progress-track);
  padding: 1px;
  overflow: hidden;
}

/* === 진행바 채움 (녹색 블록들) === */
.xp-progress-bar {
  height: 100%;
  /* XP 녹색 블록 패턴 — repeating-linear-gradient로 구현 */
  background:
    repeating-linear-gradient(
      90deg,
      /* 녹색 블록 */
      var(--xp-progress-bar) 0px,
      var(--xp-progress-bar) 8px,
      /* 블록 사이 간격 (밝은 녹색) */
      #5CD66A 8px,
      #5CD66A 9px,
      /* 다음 블록 */
      var(--xp-progress-bar) 9px,
      var(--xp-progress-bar) 10px
    );
  /* 블록 내부 그라데이션 (입체감) */
  background-color: var(--xp-progress-bar);
  border-radius: 1px;
  transition: width 0.3s ease;
}

/* === 불확정 진행바 (로딩 중) === */
.xp-progress--indeterminate .xp-progress-bar {
  width: 30% !important;
  animation: xp-progress-slide 1.5s ease-in-out infinite;
}

@keyframes xp-progress-slide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

### 2.7 Scrollbars (스크롤바)

XP 스타일 커스텀 스크롤바. 화살표 버튼 + 베이지 트랙 + 3D 썸.

```css
/* xp-components.css — 스크롤바 */

/* === Webkit 기반 커스텀 스크롤바 === */
/* Chrome, Edge, Safari 지원 */

/* 스크롤바 전체 너비 */
.xp-scrollable::-webkit-scrollbar {
  width: 17px;  /* 세로 스크롤바 너비 */
  height: 17px; /* 가로 스크롤바 높이 */
}

/* 스크롤바 트랙 (배경) */
.xp-scrollable::-webkit-scrollbar-track {
  background: var(--xp-scrollbar-track);
  /* XP 스크롤바 트랙 체크무늬 패턴 */
  background-image:
    linear-gradient(45deg,
      #E8E4D6 25%, transparent 25%,
      transparent 75%, #E8E4D6 75%),
    linear-gradient(45deg,
      #E8E4D6 25%, transparent 25%,
      transparent 75%, #E8E4D6 75%);
  background-size: 2px 2px;
  background-position: 0 0, 1px 1px;
}

/* 스크롤바 썸 (드래그 가능 부분) */
.xp-scrollable::-webkit-scrollbar-thumb {
  background: var(--xp-button-face);
  /* 3D 입체 효과 */
  border: 1px solid;
  border-color:
    var(--xp-button-highlight)
    var(--xp-button-dark-shadow)
    var(--xp-button-dark-shadow)
    var(--xp-button-highlight);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px -1px 0 var(--xp-button-shadow);
  min-height: 20px;
}

/* 스크롤바 썸 호버 */
.xp-scrollable::-webkit-scrollbar-thumb:hover {
  background: #F0EDE1;
}

/* 스크롤바 화살표 버튼 */
.xp-scrollable::-webkit-scrollbar-button {
  background: var(--xp-scrollbar-arrow);
  border: 1px solid;
  border-color:
    var(--xp-button-highlight)
    var(--xp-button-dark-shadow)
    var(--xp-button-dark-shadow)
    var(--xp-button-highlight);
  width: 17px;
  height: 17px;
}

/* 스크롤바 모서리 (가로+세로 교차점) */
.xp-scrollable::-webkit-scrollbar-corner {
  background: var(--xp-button-face);
}

/* === Firefox용 대체 스크롤바 === */
.xp-scrollable {
  scrollbar-width: auto;
  scrollbar-color: var(--xp-button-face) var(--xp-scrollbar-track);
}
```

### 2.8 Checkboxes & Radio Buttons (체크박스 & 라디오 버튼)

```css
/* xp-components.css — 체크박스/라디오 */

/* === 체크박스 래퍼 === */
.xp-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
}

/* 기본 체크박스 숨김 */
.xp-checkbox input[type="checkbox"] {
  display: none;
}

/* XP 스타일 체크박스 박스 */
.xp-checkbox-box {
  width: 13px;
  height: 13px;
  background: var(--xp-window-bg);
  /* 오목한 3D 보더 */
  border: 1px solid var(--xp-button-dark-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-shadow),
    inset -1px -1px 0 var(--xp-button-highlight);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 체크 표시 — CSS로 ✓ 모양 그리기 */
.xp-checkbox input:checked + .xp-checkbox-box::after {
  content: "";
  position: absolute;
  left: 3px;
  top: 0px;
  width: 5px;
  height: 9px;
  border: solid #000000;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 포커스 상태 */
.xp-checkbox input:focus-visible + .xp-checkbox-box {
  outline: 1px dotted #000000;
  outline-offset: 1px;
}

/* 비활성 체크박스 */
.xp-checkbox input:disabled + .xp-checkbox-box {
  background: var(--xp-button-face);
}
.xp-checkbox input:disabled + .xp-checkbox-box::after {
  border-color: var(--xp-disabled-text);
}

/* === 라디오 버튼 — 원형 === */
.xp-radio {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
}

.xp-radio input[type="radio"] {
  display: none;
}

/* XP 스타일 라디오 원 */
.xp-radio-circle {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--xp-window-bg);
  border: 1px solid var(--xp-button-dark-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-shadow),
    inset -1px -1px 0 var(--xp-button-highlight);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 선택된 라디오 — 내부 검정 원 */
.xp-radio input:checked + .xp-radio-circle::after {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #000000;
}

/* 비활성 라디오 */
.xp-radio input:disabled + .xp-radio-circle {
  background: var(--xp-button-face);
}
.xp-radio input:disabled + .xp-radio-circle::after {
  background: var(--xp-disabled-text);
}
```

### 2.9 Slider (슬라이더 / 트랙바)

XP 트랙바 스타일. 오목한 트랙 + 3D 입체 썸.

```css
/* xp-components.css — 슬라이더 */

/* === XP 트랙바 래퍼 === */
.xp-slider {
  width: 100%;
  height: 24px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

/* 트랙 — 가느다란 오목한 라인 */
.xp-slider::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--xp-scrollbar-track);
  border: 1px solid;
  border-color:
    var(--xp-button-shadow)
    var(--xp-button-highlight)
    var(--xp-button-highlight)
    var(--xp-button-shadow);
  box-shadow: inset 1px 1px 0 var(--xp-button-dark-shadow);
}

/* 썸 (드래그 핸들) — XP 세로 직사각형 */
.xp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 11px;
  height: 21px;
  margin-top: -9px; /* 트랙 중앙 정렬 */
  background: var(--xp-button-face);
  border: 1px solid var(--xp-button-dark-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px -1px 0 var(--xp-button-shadow);
  cursor: pointer;
  /* XP 썸 가운데 그립 라인 */
  background-image:
    linear-gradient(90deg,
      transparent 3px,
      var(--xp-button-shadow) 3px, var(--xp-button-shadow) 4px,
      var(--xp-button-highlight) 4px, var(--xp-button-highlight) 5px,
      transparent 5px,
      transparent 6px,
      var(--xp-button-shadow) 6px, var(--xp-button-shadow) 7px,
      var(--xp-button-highlight) 7px, var(--xp-button-highlight) 8px,
      transparent 8px
    );
  background-repeat: no-repeat;
  background-position: center;
}

/* Firefox 지원 */
.xp-slider::-moz-range-track {
  height: 4px;
  background: var(--xp-scrollbar-track);
  border: 1px solid var(--xp-button-shadow);
}

.xp-slider::-moz-range-thumb {
  width: 11px;
  height: 21px;
  background: var(--xp-button-face);
  border: 1px solid var(--xp-button-dark-shadow);
  box-shadow:
    inset 1px 1px 0 var(--xp-button-highlight),
    inset -1px -1px 0 var(--xp-button-shadow);
  cursor: pointer;
  border-radius: 0;
}
```

### 2.10 Tooltips (툴팁 / 풍선 도움말)

XP 스타일 노란 풍선 도움말.

```css
/* xp-components.css — 툴팁 */

/* === XP 노란 풍선 툴팁 === */
.xp-tooltip {
  position: absolute;
  z-index: 9999;
  background: #FFFFE1; /* XP 특유의 연한 노란색 */
  border: 1px solid #000000;
  padding: 4px 8px;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: #000000;
  white-space: nowrap;
  pointer-events: none;
  /* 부드럽게 나타남 */
  opacity: 0;
  transition: opacity 0.15s ease;
  /* 약간의 지연 후 표시 */
  transition-delay: 0.5s;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.15);
}

/* 표시 상태 */
.xp-tooltip--visible {
  opacity: 1;
}

/* === 풍선 도움말 (XP Balloon Tip) === */
.xp-balloon {
  position: absolute;
  z-index: 9999;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 8px;
  padding: 8px 12px;
  max-width: 250px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
}

/* 풍선 꼬리 (아래 방향) */
.xp-balloon::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #FFFFFF;
}
.xp-balloon::before {
  content: "";
  position: absolute;
  bottom: -12px;
  left: 19px;
  width: 0;
  height: 0;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-top: 11px solid #000000;
}

/* 풍선 제목 */
.xp-balloon-title {
  font-weight: var(--xp-font-weight-bold);
  margin-bottom: 4px;
}
```

### 2.11 Dialog Boxes (대화상자)

XP 스타일 모달 대화상자. 확인/취소 버튼 + 아이콘.

```css
/* xp-components.css — 대화상자 */

/* === 모달 오버레이 (어두운 배경) === */
.xp-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* === 대화상자 창 (xp-window 확장) === */
.xp-dialog {
  /* xp-window 스타일 상속 */
  border: 3px solid var(--xp-border-active);
  border-radius: var(--xp-border-radius-window) var(--xp-border-radius-window) 0 0;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.3),
    4px 8px 24px rgba(0, 0, 0, 0.5);
  background: var(--xp-button-face);
  min-width: 300px;
  max-width: 500px;
  z-index: 9001;
}

/* 대화상자 본문 레이아웃 */
.xp-dialog-body {
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

/* 대화상자 아이콘 (경고/오류/정보/확인) */
.xp-dialog-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

/* 대화상자 메시지 텍스트 */
.xp-dialog-message {
  flex: 1;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  line-height: 1.4;
}

/* 대화상자 버튼 영역 */
.xp-dialog-footer {
  padding: 8px 16px 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid var(--xp-button-shadow);
}
```

### 2.12 Menu Bar (메뉴바)

XP 스타일 File / Edit / View / Help 메뉴.

```css
/* xp-components.css — 메뉴바 */

/* === 메뉴바 컨테이너 === */
.xp-menubar {
  background: var(--xp-menu-bar);
  height: var(--xp-menubar-height);
  display: flex;
  align-items: stretch;
  padding: 0;
  border-bottom: 1px solid var(--xp-button-shadow);
  user-select: none;
}

/* === 메뉴 항목 (최상위) === */
.xp-menu-item {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size-menu);
  color: #000000;
  background: transparent;
  border: none;
  padding: 2px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
}

/* 메뉴 항목 호버 */
.xp-menu-item:hover {
  background: var(--xp-selection);
  color: var(--xp-selection-text);
}

/* 메뉴 항목 활성 (드롭다운 열림) */
.xp-menu-item--active {
  background: var(--xp-selection);
  color: var(--xp-selection-text);
}

/* === 드롭다운 메뉴 패널 === */
.xp-menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: var(--xp-window-bg);
  border: 1px solid var(--xp-button-dark-shadow);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  padding: 2px 0;
  z-index: 2000;
  display: none;
}

.xp-menu-item--active .xp-menu-dropdown {
  display: block;
}

/* 메뉴 드롭다운 항목 */
.xp-menu-option {
  padding: 4px 24px 4px 28px;
  font-size: var(--xp-font-size);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
}

.xp-menu-option:hover {
  background: var(--xp-selection);
  color: var(--xp-selection-text);
}

/* 메뉴 구분선 */
.xp-menu-separator {
  height: 1px;
  background: var(--xp-button-shadow);
  margin: 2px 2px;
}

/* 메뉴 단축키 텍스트 (우측 정렬) */
.xp-menu-shortcut {
  margin-left: 24px;
  color: var(--xp-disabled-text);
  font-size: var(--xp-font-size);
}
.xp-menu-option:hover .xp-menu-shortcut {
  color: var(--xp-selection-text);
}

/* 메뉴 아이콘 영역 (좌측) */
.xp-menu-icon {
  width: 16px;
  height: 16px;
  position: absolute;
  left: 6px;
}

/* 비활성 메뉴 항목 */
.xp-menu-option--disabled {
  color: var(--xp-disabled-text);
  cursor: not-allowed;
}
.xp-menu-option--disabled:hover {
  background: transparent;
  color: var(--xp-disabled-text);
}
```

### 2.13 Status Bar (상태바)

```css
/* xp-components.css — 상태바 */

/* === 하단 상태바 === */
.xp-statusbar {
  height: var(--xp-statusbar-height);
  background: var(--xp-button-face);
  border-top: 1px solid var(--xp-button-highlight);
  display: flex;
  align-items: stretch;
  padding: 0 2px;
  gap: 2px;
}

/* 상태바 패널 (구분된 영역) */
.xp-statusbar-panel {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size-small);
  color: #000000;
  display: flex;
  align-items: center;
  padding: 0 6px;
  /* 오목한 보더 */
  border: 1px solid;
  border-color:
    var(--xp-button-shadow)
    var(--xp-button-highlight)
    var(--xp-button-highlight)
    var(--xp-button-shadow);
}

/* 첫 번째 패널 — 유연한 너비 */
.xp-statusbar-panel:first-child {
  flex: 1;
}

/* 고정 너비 패널 (크기, 파일 크기 등) */
.xp-statusbar-panel--fixed {
  min-width: 80px;
}
```

### 2.14 Taskbar (작업표시줄)

바탕화면 하단 고정. 시작 버튼 + 빠른 실행 + 열린 창 목록 + 시스템 트레이 + 시계.

```css
/* xp-components.css — 작업표시줄 */

/* === 작업표시줄 전체 === */
.xp-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--xp-taskbar-height);
  /* XP 작업표시줄 그라데이션 (위→아래) */
  background: linear-gradient(
    180deg,
    #3168D5 0%,
    #1941A5 3%,
    #245DDB 50%,
    #1941A5 97%,
    #183B9E 100%
  );
  display: flex;
  align-items: stretch;
  z-index: 10000;
  /* 상단 하이라이트 라인 */
  border-top: 1px solid #5A8AF7;
  padding: 0;
  user-select: none;
}

/* === 시작 버튼 === */
.xp-start-button {
  /* XP 녹색 그라데이션 */
  background: linear-gradient(
    180deg,
    #3BDA5C 0%,
    var(--xp-start-green) 8%,
    var(--xp-start-green-dark) 92%,
    #0E5E0E 100%
  );
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 0 12px 0 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #FFFFFF;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  font-weight: var(--xp-font-weight-bold);
  font-style: italic;
  /* 입체 효과 */
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.3),
    inset -1px -1px 0 rgba(0, 0, 0, 0.2);
  /* XP 로고 아이콘 대신 텍스트 */
  min-width: 100px;
}

.xp-start-button:hover {
  background: linear-gradient(
    180deg,
    #5BFA7C 0%,
    #31C131 8%,
    #21A121 92%,
    #187E18 100%
  );
}

.xp-start-button:active {
  background: linear-gradient(
    180deg,
    #0E5E0E 0%,
    var(--xp-start-green-dark) 8%,
    var(--xp-start-green) 92%,
    #3BDA5C 100%
  );
  box-shadow:
    inset -1px -1px 0 rgba(255, 255, 255, 0.2),
    inset 1px 1px 0 rgba(0, 0, 0, 0.3);
}

/* 시작 버튼 아이콘 (XP 로고 대체) */
.xp-start-icon {
  width: 20px;
  height: 20px;
}

/* === 빠른 실행 영역 === */
.xp-quick-launch {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 6px;
  /* 좌측 구분선 */
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  margin-left: 4px;
}

.xp-quick-launch-btn {
  width: 22px;
  height: 22px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}
.xp-quick-launch-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* === 열린 창 목록 영역 === */
.xp-task-list {
  flex: 1;
  display: flex;
  align-items: stretch;
  padding: 2px 4px;
  gap: 2px;
  overflow: hidden;
}

/* 개별 작업 버튼 */
.xp-task-button {
  flex: 0 1 160px;
  max-width: 160px;
  min-width: 80px;
  height: 100%;
  /* 3D 입체 버튼 */
  background: linear-gradient(
    180deg,
    #3C84E0 0%,
    #2560C0 50%,
    #1E50A0 100%
  );
  border: 1px solid;
  border-color:
    rgba(255, 255, 255, 0.3)
    rgba(0, 0, 0, 0.3)
    rgba(0, 0, 0, 0.3)
    rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #FFFFFF;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 활성(현재 포커스) 작업 — 눌린 상태 */
.xp-task-button--active {
  background: linear-gradient(
    180deg,
    #1E50A0 0%,
    #2560C0 50%,
    #3C84E0 100%
  );
  border-color:
    rgba(0, 0, 0, 0.3)
    rgba(255, 255, 255, 0.2)
    rgba(255, 255, 255, 0.2)
    rgba(0, 0, 0, 0.3);
}

/* 작업 버튼 아이콘 */
.xp-task-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* === 시스템 트레이 === */
.xp-system-tray {
  display: flex;
  align-items: center;
  padding: 0 8px;
  /* 좌측 구분선 */
  border-left: 1px solid rgba(0, 0, 0, 0.2);
  /* 배경 약간 다르게 */
  background: linear-gradient(
    180deg,
    #1290E9 0%,
    #0D6FCA 50%,
    #0856A8 100%
  );
}

/* 시계 */
.xp-clock {
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: #FFFFFF;
  font-weight: var(--xp-font-weight-bold);
  padding: 0 4px;
}

/* 트레이 아이콘 */
.xp-tray-icon {
  width: 16px;
  height: 16px;
  margin: 0 2px;
  cursor: pointer;
}
```

### 2.15 Group Box (그룹 박스)

XP 스타일 설정 그룹화 프레임.

```css
/* xp-components.css — 그룹 박스 */

.xp-groupbox {
  border: 1px solid var(--xp-button-shadow);
  border-radius: 4px;
  padding: 12px 8px 8px;
  margin: 8px 0;
  position: relative;
}

/* 그룹 박스 제목 (fieldset legend 스타일) */
.xp-groupbox-title {
  position: absolute;
  top: -8px;
  left: 8px;
  background: var(--xp-button-face);
  padding: 0 4px;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
  color: var(--xp-border-active);
  font-weight: var(--xp-font-weight-normal);
}
```

### 2.16 Tree View (트리뷰 — 탐색기 사이드바)

```css
/* xp-components.css — 트리뷰 */

/* === 트리뷰 컨테이너 === */
.xp-treeview {
  background: var(--xp-window-bg);
  border: 2px solid;
  border-color:
    var(--xp-button-shadow)
    var(--xp-button-highlight)
    var(--xp-button-highlight)
    var(--xp-button-shadow);
  box-shadow: inset 1px 1px 0 var(--xp-button-dark-shadow);
  padding: 4px;
  overflow-y: auto;
  font-family: var(--xp-font-family);
  font-size: var(--xp-font-size);
}

/* 트리뷰 리스트 */
.xp-treeview ul {
  list-style: none;
  padding-left: 16px;
  margin: 0;
}

.xp-treeview > ul {
  padding-left: 0;
}

/* 트리뷰 항목 */
.xp-treeview-item {
  padding: 1px 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.xp-treeview-item:hover {
  background: var(--xp-selection);
  color: var(--xp-selection-text);
}

/* 선택된 항목 */
.xp-treeview-item--selected {
  background: var(--xp-selection);
  color: var(--xp-selection-text);
}

/* 펼침/접힘 아이콘 (+/-) */
.xp-treeview-toggle {
  width: 9px;
  height: 9px;
  border: 1px solid var(--xp-button-dark-shadow);
  background: var(--xp-window-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  line-height: 1;
  flex-shrink: 0;
}

/* 점선 연결선 */
.xp-treeview li {
  position: relative;
}
.xp-treeview li::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 0;
  width: 1px;
  height: 100%;
  border-left: 1px dotted var(--xp-button-shadow);
}
.xp-treeview li::after {
  content: "";
  position: absolute;
  left: -8px;
  top: 10px;
  width: 8px;
  height: 1px;
  border-top: 1px dotted var(--xp-button-shadow);
}
/* 마지막 항목은 세로선 절반만 */
.xp-treeview li:last-child::before {
  height: 10px;
}

/* 아이콘 */
.xp-treeview-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
```

---

## 3. 레이아웃 구조

### 3.1 전체 레이아웃 다이어그램

```
┌────────────────────────────────────────────────────────────────┐
│ 바탕화면 (전체 뷰포트, background: var(--xp-desktop-bg))        │
│                                                                │
│  ┌─────────────── 광고 배너 (상단, 728x90) ───────────────┐    │
│  │  [AdSense 배너 영역 - .ad-banner-top]                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────┐ ┌─────────────────┐     │
│  │       메인 도구 창 (XP Window)    │ │  광고 사이드바    │     │
│  │  ┌──────────────────────────┐    │ │ (160x600)       │     │
│  │  │ 제목표시줄                │    │ │                 │     │
│  │  │ [아이콘] Image Editor [_][☐][✕]│ │ .ad-sidebar     │     │
│  │  ├──────────────────────────┤    │ │                 │     │
│  │  │ 메뉴바: File Edit View Help│   │ │                 │     │
│  │  ├──────────────────────────┤    │ │                 │     │
│  │  │ ┌────────┐ ┌───────────┐│    │ │                 │     │
│  │  │ │ 도구   │ │ 작업 영역  ││    │ │                 │     │
│  │  │ │ 사이드 │ │           ││    │ │                 │     │
│  │  │ │ 바     │ │ (캔버스   ││    │ │                 │     │
│  │  │ │ (트리  │ │  영역)    ││    │ │                 │     │
│  │  │ │  뷰)   │ │           ││    │ │                 │     │
│  │  │ │        │ │           ││    │ │                 │     │
│  │  │ │        │ ├───────────┤│    │ │                 │     │
│  │  │ │        │ │ 설정 패널  ││    │ │                 │     │
│  │  │ └────────┘ └───────────┘│    │ │                 │     │
│  │  ├──────────────────────────┤    │ └─────────────────┘     │
│  │  │ 상태바: Ready | 1024x768 │    │                          │
│  │  └──────────────────────────┘    │                          │
│  └──────────────────────────────────┘                          │
│                                                                │
│  ┌─────────────── 광고 배너 (하단, 728x90) ───────────────┐    │
│  │  [AdSense 배너 영역 - .ad-banner-bottom]              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ 작업표시줄 (fixed bottom)                                      │
│ [시작] | 🏠 🔧 | [Image Editor   ] | 🔊 🌐  오후 7:13      │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 CSS 레이아웃 구조

```css
/* xp-layout.css — 페이지 전체 구조 */

/* === 바탕화면 (최상위 컨테이너) === */
.xp-desktop {
  position: fixed;
  inset: 0;
  background-color: var(--xp-desktop-bg);
  /* 선택: Bliss 느낌의 그라데이션 배경 */
  background-image:
    linear-gradient(
      180deg,
      #3A8EC5 0%,    /* 하늘 */
      #5AAED5 40%,   /* 중간 */
      #7BCE85 60%,   /* 초원 전환 */
      #5CB85C 100%   /* 풀밭 */
    );
  overflow: auto;
  /* 작업표시줄 공간 확보 */
  padding-bottom: var(--xp-taskbar-height);
}

/* === 메인 콘텐츠 영역 === */
.xp-desktop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 16px;
  min-height: 100%;
}

/* === 도구 영역 (창 + 광고 사이드바) === */
.xp-workspace {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  max-width: 1200px;
  width: 100%;
}

/* === 메인 도구 창 === */
.xp-main-window {
  flex: 1;
  min-width: 0; /* flex 오버플로우 방지 */
}

/* === 창 본문 레이아웃 (사이드바 + 콘텐츠) === */
.xp-window-content {
  display: flex;
  min-height: 400px;
}

/* 도구 사이드바 (Explorer 트리뷰 스타일) */
.xp-tool-sidebar {
  width: 180px;
  min-width: 150px;
  border-right: 1px solid var(--xp-button-shadow);
  background: var(--xp-window-bg);
  overflow-y: auto;
  flex-shrink: 0;
}

/* 작업 영역 (도구 UI가 표시되는 곳) */
.xp-work-area {
  flex: 1;
  padding: 8px;
  background: var(--xp-window-bg);
  overflow-y: auto;
  min-width: 0;
}

/* === 광고 사이드바 === */
.xp-ad-sidebar {
  width: 160px;
  flex-shrink: 0;
}
```

### 3.3 Z-Index 계층

| 레이어 | Z-Index | 요소 |
|--------|---------|------|
| 바탕화면 | `1` | `.xp-desktop` |
| 바탕화면 아이콘 | `10` | `.xp-desktop-icon` |
| 일반 창 | `100~999` | `.xp-window` |
| 활성 창 | `1000` | `.xp-window[data-state="active"]` |
| 드롭다운 메뉴 | `2000` | `.xp-menu-dropdown` |
| 대화상자 오버레이 | `9000` | `.xp-dialog-overlay` |
| 대화상자 | `9001` | `.xp-dialog` |
| 툴팁 | `9999` | `.xp-tooltip` |
| 작업표시줄 | `10000` | `.xp-taskbar` |
| 시작 메뉴 | `10001` | `.xp-start-menu` |

---

## 4. 반응형 전략

### 4.1 브레이크포인트

| 브레이크포인트 | 범위 | 대상 기기 | 모드 |
|---------------|------|----------|------|
| Desktop (L) | `≥1200px` | 데스크톱 | 완전한 XP 경험 |
| Desktop (M) | `1024px ~ 1199px` | 작은 데스크톱 | XP 경험 (사이드 광고 숨김) |
| Tablet | `768px ~ 1023px` | 태블릿 | 간소화된 창 |
| Mobile | `< 768px` | 스마트폰 | 단일 컬럼 |

### 4.2 반응형 CSS

```css
/* xp-responsive.css — 반응형 */

/* === Desktop Medium (작은 데스크톱) === */
@media (max-width: 1199px) {
  /* 사이드 광고 숨김 — 공간 부족 */
  .xp-ad-sidebar {
    display: none;
  }

  /* 메인 창이 전체 너비 사용 */
  .xp-workspace {
    max-width: 100%;
  }
}

/* === Tablet (768px ~ 1023px) === */
@media (max-width: 1023px) {
  /* 작업표시줄 숨김 — 공간 절약 */
  .xp-taskbar {
    display: none;
  }

  /* 바탕화면 패딩 조정 (작업표시줄 없음) */
  .xp-desktop {
    padding-bottom: 0;
  }

  /* 도구 사이드바 접힘 가능 */
  .xp-tool-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 500;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  }

  .xp-tool-sidebar--open {
    transform: translateX(0);
  }

  /* 상단 광고 크기 축소 */
  .ad-banner-top {
    max-width: 468px;
  }

  /* 제목표시줄 시스템 버튼 크기 확대 (터치 대응) */
  .xp-sys-btn {
    width: 32px;
    height: 32px;
  }
}

/* === Mobile (< 768px) === */
@media (max-width: 767px) {
  /* 단일 컬럼 레이아웃 — XP 스타일 유지하되 간소화 */
  .xp-desktop {
    background: var(--xp-button-face); /* 바탕화면 대신 XP 회색 */
    position: relative; /* fixed 해제 */
    min-height: 100vh;
  }

  .xp-desktop-content {
    padding: 0;
    gap: 0;
  }

  /* 창이 전체 화면 차지 */
  .xp-window {
    border-radius: 0;
    border-width: 0;
    box-shadow: none;
    min-width: 100%;
    width: 100%;
  }

  /* 제목표시줄 유지 (XP 느낌) */
  .xp-titlebar {
    border-radius: 0;
  }

  /* 도구 사이드바 → 상단 가로 스크롤 */
  .xp-tool-sidebar {
    width: 100%;
    height: auto;
    max-height: 120px;
    border-right: none;
    border-bottom: 1px solid var(--xp-button-shadow);
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
  }

  .xp-window-content {
    flex-direction: column;
  }

  /* 하단 광고만 표시 */
  .ad-banner-top {
    display: none;
  }

  /* 모바일에서 메뉴바 → 햄버거 메뉴 */
  .xp-menubar {
    display: none;
  }

  .xp-mobile-menu-toggle {
    display: block;
  }

  /* 버튼/입력 터치 크기 확대 */
  .xp-button {
    min-height: 36px;
    padding: 8px 16px;
  }

  .xp-input,
  .xp-select {
    min-height: 36px;
    font-size: 14px;
  }

  /* 리사이즈 핸들 숨김 (모바일에서 불필요) */
  .xp-window::after {
    display: none;
  }
}

/* === 데스크톱에서 모바일 메뉴 토글 숨김 === */
@media (min-width: 768px) {
  .xp-mobile-menu-toggle {
    display: none;
  }
}
```

---

## 5. 아이콘 세트

> ⚠️ 저작권 문제로 실제 Windows XP 아이콘 사용 불가.
> 모든 아이콘은 **CSS + SVG**로 직접 제작.

### 5.1 도구 아이콘 (각 편집 기능별)

| 아이콘 ID | 도구명 | 설명 | SVG 스타일 |
|-----------|--------|------|-----------|
| `icon-resize` | 리사이즈 | 크기 변환 화살표 (↔ 대각선) | 16×16, 사각형 + 양방향 화살표 |
| `icon-crop` | 크롭 | 잘라내기 L자 모양 | 16×16, 두 개의 직각 프레임 |
| `icon-rotate` | 회전 | 곡선 화살표 (↻) | 16×16, 원호 + 화살표 머리 |
| `icon-flip-h` | 가로뒤집기 | 좌우 대칭 화살표 | 16×16, ↔ 세로축 기준 |
| `icon-flip-v` | 세로뒤집기 | 상하 대칭 화살표 | 16×16, ↕ 가로축 기준 |
| `icon-convert` | 포맷변환 | 파일 아이콘 → 파일 아이콘 | 16×16, 문서 + 화살표 + 문서 |
| `icon-compress` | 압축 | 파일 위에 아래화살표 | 16×16, 문서 + ↓ 가압 |
| `icon-filter` | 필터 | 원형 렌즈/마법봉 | 16×16, 별 + 광선 |
| `icon-text` | 텍스트추가 | 대문자 A | 16×16, 굵은 "A" 문자 |
| `icon-watermark` | 워터마크 | 반투명 스탬프 | 16×16, 물결 + 텍스트 |
| `icon-metadata` | 메타데이터 | 정보 i 아이콘 | 16×16, ⓘ 원형 |
| `icon-qrcode` | QR코드 | QR 패턴 | 16×16, 4개 코너 사각형 |
| `icon-gif-make` | GIF만들기 | 필름 + 재생 | 16×16, 필름스트립 |
| `icon-gif-split` | GIF분할 | 필름 + 가위 | 16×16, 프레임 분리 |
| `icon-gif-optimize` | GIF최적화 | 파일 + 작아지는 화살표 | 16×16, GIF + 축소 |
| `icon-gif-reverse` | GIF역재생 | ← 화살표 | 16×16, 역방향 재생 |
| `icon-gif-speed` | GIF속도 | 시계 + 화살표 | 16×16, 타이머 아이콘 |
| `icon-color-picker` | 색상추출 | 스포이드 | 16×16, 피펫 형태 |
| `icon-brightness` | 밝기 | 태양 | 16×16, ☀ 원 + 광선 |
| `icon-contrast` | 대비 | 반분할 원 | 16×16, ◑ 흑백 반원 |
| `icon-saturation` | 채도 | 컬러 팔레트 | 16×16, 🎨 색상환 |

### 5.2 파일 타입 아이콘

| 아이콘 ID | 파일 유형 | 설명 |
|-----------|----------|------|
| `icon-file-jpg` | JPEG | 문서 아이콘 + "JPG" 텍스트, 보라색 악센트 |
| `icon-file-png` | PNG | 문서 아이콘 + "PNG" 텍스트, 초록색 악센트 |
| `icon-file-gif` | GIF | 문서 아이콘 + "GIF" 텍스트, 파란색 악센트 |
| `icon-file-webp` | WebP | 문서 아이콘 + "WEBP" 텍스트, 노란색 악센트 |
| `icon-file-bmp` | BMP | 문서 아이콘 + "BMP" 텍스트, 회색 악센트 |
| `icon-file-ico` | ICO | 문서 아이콘 + "ICO" 텍스트, 주황색 악센트 |
| `icon-file-svg` | SVG | 문서 아이콘 + "SVG" 텍스트, 빨간색 악센트 |
| `icon-file-pdf` | PDF | 문서 아이콘 + "PDF" 텍스트, 빨간색 |

### 5.3 시스템 아이콘

| 아이콘 ID | 용도 | 설명 |
|-----------|------|------|
| `icon-folder` | 폴더 | XP 스타일 노란 폴더 |
| `icon-folder-open` | 열린 폴더 | 열린 노란 폴더 |
| `icon-file` | 일반 파일 | 흰 문서 + 접힌 모서리 |
| `icon-warning` | 경고 대화상자 | 노란 삼각형 + ! |
| `icon-error` | 오류 대화상자 | 빨간 원 + ✕ |
| `icon-info` | 정보 대화상자 | 파란 원 + i |
| `icon-question` | 확인 대화상자 | 파란 원 + ? |
| `icon-success` | 성공/완료 | 초록 원 + ✓ |
| `icon-upload` | 파일 업로드 | 위쪽 화살표 + 트레이 |
| `icon-download` | 파일 다운로드 | 아래쪽 화살표 + 트레이 |
| `icon-settings` | 설정 | 톱니바퀴 |
| `icon-help` | 도움말 | 물음표 책 |
| `icon-close` | 닫기 | ✕ 표시 |
| `icon-minimize` | 최소화 | ─ 표시 |
| `icon-maximize` | 최대화 | ☐ 표시 |
| `icon-restore` | 이전 크기 | ⧉ 겹친 창 |

### 5.4 SVG 아이콘 예시 코드

```html
<!-- 경고 아이콘 (32x32) — XP 대화상자용 -->
<svg class="xp-icon-warning" viewBox="0 0 32 32" width="32" height="32">
  <!-- 노란 삼각형 배경 -->
  <path d="M16 2 L30 28 L2 28 Z"
        fill="#FFD700" stroke="#000000" stroke-width="1.5"/>
  <!-- 느낌표 (!) -->
  <rect x="14.5" y="10" width="3" height="10" rx="1" fill="#000000"/>
  <rect x="14.5" y="22" width="3" height="3" rx="1" fill="#000000"/>
</svg>

<!-- 오류 아이콘 (32x32) -->
<svg class="xp-icon-error" viewBox="0 0 32 32" width="32" height="32">
  <!-- 빨간 원 배경 -->
  <circle cx="16" cy="16" r="14" fill="#CC0000" stroke="#800000" stroke-width="1"/>
  <!-- 흰색 X -->
  <line x1="10" y1="10" x2="22" y2="22" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <line x1="22" y1="10" x2="10" y2="22" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
</svg>

<!-- 정보 아이콘 (32x32) -->
<svg class="xp-icon-info" viewBox="0 0 32 32" width="32" height="32">
  <!-- 파란 원 배경 -->
  <circle cx="16" cy="16" r="14" fill="#0054E3" stroke="#003C9E" stroke-width="1"/>
  <!-- 흰색 i -->
  <circle cx="16" cy="10" r="2" fill="#FFFFFF"/>
  <rect x="14" y="14" width="4" height="10" rx="1" fill="#FFFFFF"/>
</svg>

<!-- 폴더 아이콘 (16x16) — 트리뷰용 -->
<svg class="xp-icon-folder" viewBox="0 0 16 16" width="16" height="16">
  <!-- 폴더 탭 -->
  <path d="M1 3 L1 13 L15 13 L15 5 L7 5 L6 3 Z"
        fill="#FFE680" stroke="#CC9900" stroke-width="0.5"/>
  <!-- 폴더 앞면 -->
  <rect x="1" y="5" width="14" height="8" rx="1"
        fill="#FFCC33" stroke="#CC9900" stroke-width="0.5"/>
</svg>

<!-- 파일 업로드 아이콘 (16x16) -->
<svg class="xp-icon-upload" viewBox="0 0 16 16" width="16" height="16">
  <!-- 트레이 -->
  <path d="M2 10 L2 14 L14 14 L14 10" stroke="#333" fill="none" stroke-width="1.5"/>
  <!-- 위쪽 화살표 -->
  <line x1="8" y1="11" x2="8" y2="3" stroke="#0054E3" stroke-width="2"/>
  <polyline points="5,6 8,3 11,6" stroke="#0054E3" fill="none" stroke-width="2"/>
</svg>
```

---

## 6. 애니메이션 & 인터랙션

### 6.1 창 열기/닫기 애니메이션

XP 스타일: 작업표시줄에서 올라오며 확대되는 느낌.

```css
/* xp-animations.css — 창 애니메이션 */

/* === 창 열기 애니메이션 === */
@keyframes xp-window-open {
  0% {
    /* 작업표시줄 위치에서 시작 */
    transform: scale(0.3) translateY(100vh);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.xp-window--opening {
  animation: xp-window-open 0.25s ease-out forwards;
}

/* === 창 닫기 애니메이션 === */
@keyframes xp-window-close {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.3) translateY(100vh);
    opacity: 0;
  }
}

.xp-window--closing {
  animation: xp-window-close 0.2s ease-in forwards;
}

/* === 최소화 애니메이션 === */
@keyframes xp-window-minimize {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.1) translateY(100vh);
    opacity: 0;
  }
}

.xp-window--minimizing {
  animation: xp-window-minimize 0.2s ease-in forwards;
}

/* === 최대화 애니메이션 === */
@keyframes xp-window-maximize {
  0% {
    /* 현재 위치/크기에서 */
  }
  100% {
    /* 전체 화면으로 */
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% - var(--xp-taskbar-height));
    border-radius: 0;
  }
}
```

### 6.2 버튼 눌림 피드백

```css
/* xp-animations.css — 버튼 피드백 */

/* 버튼 클릭 시 살짝 흔들림 (XP 느낌) */
@keyframes xp-button-press {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(1px); }
  100% { transform: translateY(0); }
}

/* 버튼 활성화 시 빠르게 적용 */
.xp-button:active {
  animation: xp-button-press 0.1s ease;
}
```

### 6.3 진행바 애니메이션

```css
/* xp-animations.css — 진행바 */

/* XP 스타일 녹색 블록이 반짝이는 효과 */
@keyframes xp-progress-shine {
  0%   { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}

.xp-progress-bar--animated {
  background-image:
    /* 반짝이는 흰색 하이라이트 */
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 45%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0.3) 55%,
      transparent 100%
    );
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: xp-progress-shine 2s ease-in-out infinite;
}

/* XP 블록 채움 애니메이션 (한 칸씩) */
@keyframes xp-progress-fill {
  from { width: 0; }
  to   { width: var(--progress-value, 0%); }
}

.xp-progress-bar--filling {
  animation: xp-progress-fill 0.5s ease-out forwards;
}
```

### 6.4 드래그 앤 드롭 시각 피드백

```css
/* xp-animations.css — 드래그 앤 드롭 */

/* === 드래그 영역 기본 상태 === */
.xp-drop-zone {
  border: 2px dashed var(--xp-button-shadow);
  border-radius: 4px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
  background: var(--xp-window-bg);
}

/* 파일이 드래그 영역 위에 올라왔을 때 */
.xp-drop-zone--active {
  border-color: var(--xp-selection);
  background: #E8F0FE;
  /* 파란 하이라이트 펄스 */
  animation: xp-drop-pulse 1s ease-in-out infinite;
}

@keyframes xp-drop-pulse {
  0%, 100% { background: #E8F0FE; }
  50%      { background: #D0E4FC; }
}

/* 드래그 중인 요소의 고스트 이미지 */
.xp-drag-ghost {
  opacity: 0.7;
  transform: rotate(3deg);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.3);
}

/* === 창 드래그 (제목표시줄 드래그) === */
.xp-window--dragging {
  opacity: 0.8;
  cursor: move;
  /* XP 스타일: 드래그 중 와이어프레임 표시 (선택) */
}
```

### 6.5 이스터 에그: XP 시작 사운드

```javascript
// xp-easter-egg.js — 시작 사운드 (선택적 이스터 에그)
// 사용자가 처음 방문하거나 특정 동작 시 XP 시작 사운드 유사음 재생
// 저작권 문제로 원본 사운드 사용 불가 — Web Audio API로 유사한 멜로디 생성

/**
 * XP 시작 사운드 유사 멜로디를 Web Audio API로 재생
 * 원본과 유사하되 저작권에 저촉되지 않는 오리지널 멜로디
 * localStorage에 플래그 저장하여 첫 방문 1회만 재생
 */
function playStartupChime() {
  // 이미 재생한 적 있으면 건너뜀
  if (localStorage.getItem('xp-chime-played')) return;

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [
    { freq: 523.25, start: 0,    dur: 0.3 }, // C5
    { freq: 659.25, start: 0.3,  dur: 0.3 }, // E5
    { freq: 783.99, start: 0.6,  dur: 0.3 }, // G5
    { freq: 1046.5, start: 0.9,  dur: 0.6 }, // C6 (길게)
  ];

  notes.forEach(n => {
    // 오실레이터 (음 생성기) 설정
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine'; // 부드러운 사인파
    osc.frequency.value = n.freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime + n.start);
    // 페이드아웃
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.start + n.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + n.start);
    osc.stop(ctx.currentTime + n.start + n.dur);
  });

  localStorage.setItem('xp-chime-played', 'true');
}
```

### 6.6 기타 전환 효과

```css
/* xp-animations.css — 기타 */

/* 메뉴 드롭다운 열림 */
@keyframes xp-menu-open {
  0% {
    opacity: 0;
    transform: scaleY(0.8);
    transform-origin: top;
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

.xp-menu-dropdown--opening {
  animation: xp-menu-open 0.1s ease-out forwards;
}

/* 대화상자 나타남 */
@keyframes xp-dialog-appear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.xp-dialog--opening {
  animation: xp-dialog-appear 0.15s ease-out forwards;
}

/* 트리뷰 항목 펼침 */
@keyframes xp-tree-expand {
  0% {
    max-height: 0;
    opacity: 0;
  }
  100% {
    max-height: 500px;
    opacity: 1;
  }
}

.xp-treeview-children--expanding {
  animation: xp-tree-expand 0.2s ease-out forwards;
  overflow: hidden;
}

/* 포커스 링 애니메이션 (접근성) */
@keyframes xp-focus-pulse {
  0%, 100% { outline-color: var(--xp-focus-ring); }
  50%      { outline-color: transparent; }
}
```

---

## 7. CSS 아키텍처

### 7.1 파일 구조

```
css/
├── xp-reset.css          # XP 기본 리셋 (브라우저 기본 스타일 초기화)
├── xp-theme.css          # 색상 토큰, CSS 변수, 타이포그래피
├── xp-components.css     # 모든 XP UI 컴포넌트
├── xp-layout.css         # 페이지 구조 (바탕화면, 창 배치)
├── xp-responsive.css     # 미디어 쿼리 (반응형)
├── xp-animations.css     # 전환, 키프레임 애니메이션
├── tools.css             # 도구별 특화 스타일
└── ads.css               # 광고 컨테이너 스타일
```

### 7.2 로드 순서

```html
<!-- HTML <head>에서 순서대로 로드 — 순서 중요! -->

<!-- 1단계: 리셋 → 브라우저 기본 스타일 제거 -->
<link rel="stylesheet" href="/css/xp-reset.css">

<!-- 2단계: 테마 → CSS 변수, 폰트 정의 -->
<link rel="stylesheet" href="/css/xp-theme.css">

<!-- 3단계: 컴포넌트 → 개별 UI 요소 스타일 -->
<link rel="stylesheet" href="/css/xp-components.css">

<!-- 4단계: 레이아웃 → 페이지 구조 -->
<link rel="stylesheet" href="/css/xp-layout.css">

<!-- 5단계: 도구/광고 → 기능별 스타일 -->
<link rel="stylesheet" href="/css/tools.css">
<link rel="stylesheet" href="/css/ads.css">

<!-- 6단계: 애니메이션 → 전환 효과 (마지막) -->
<link rel="stylesheet" href="/css/xp-animations.css">

<!-- 7단계: 반응형 → 미디어 쿼리 오버라이드 (가장 마지막) -->
<link rel="stylesheet" href="/css/xp-responsive.css">
```

### 7.3 각 파일 역할 상세

#### `xp-reset.css` — XP 기본 리셋

```css
/* xp-reset.css — 브라우저 기본 스타일 제거 + XP 기본값 설정 */

/* 모든 요소 box-sizing 통일 */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* HTML/Body 기본 */
html {
  height: 100%;
  overflow: hidden; /* 바탕화면이 스크롤 관리 */
}

body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  /* XP 기본 커서 */
  cursor: default;
  /* XP 선택 색상 */
  -webkit-tap-highlight-color: transparent;
}

/* 이미지/미디어 기본 */
img, svg, video, canvas {
  display: block;
  max-width: 100%;
}

/* 링크 기본 */
a {
  color: var(--xp-link);
  text-decoration: underline;
}
a:visited {
  color: var(--xp-link-visited);
}

/* 버튼/입력 리셋 */
button, input, select, textarea {
  font: inherit;
  color: inherit;
  border: none;
  background: none;
  outline: none;
}

button {
  cursor: pointer;
}

/* 리스트 리셋 */
ul, ol {
  list-style: none;
}

/* 테이블 리셋 */
table {
  border-collapse: collapse;
  border-spacing: 0;
}

/* XP 스타일 선택 색상 */
::selection {
  background: var(--xp-selection);
  color: var(--xp-selection-text);
}

/* 포커스 기본 제거 (커스텀 포커스 사용) */
:focus {
  outline: none;
}

/* 접근성: focus-visible만 표시 */
:focus-visible {
  outline: 1px dotted #000000;
  outline-offset: -1px;
}
```

#### `xp-theme.css`

→ 이미 [1.2 컬러 팔레트](#12-컬러-팔레트)와 [1.3 타이포그래피](#13-타이포그래피) 섹션에 코드 포함.

#### `xp-components.css`

→ 이미 [2. XP 컴포넌트 상세 스펙](#2-xp-컴포넌트-상세-스펙) 전체 섹션에 코드 포함.

#### `xp-layout.css`

→ 이미 [3.2 CSS 레이아웃 구조](#32-css-레이아웃-구조)에 코드 포함.

#### `xp-responsive.css`

→ 이미 [4.2 반응형 CSS](#42-반응형-css)에 코드 포함.

#### `xp-animations.css`

→ 이미 [6. 애니메이션 & 인터랙션](#6-애니메이션--인터랙션) 전체 섹션에 코드 포함.

#### `tools.css` — 도구별 스타일

```css
/* tools.css — 도구별 특화 스타일 */

/* === 파일 업로드 영역 === */
.tool-upload-zone {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
}

.tool-upload-icon {
  width: 48px;
  height: 48px;
  opacity: 0.6;
}

.tool-upload-text {
  font-size: var(--xp-font-size);
  color: var(--xp-disabled-text);
}

/* === 이미지 미리보기 캔버스 === */
.tool-canvas-wrapper {
  position: relative;
  background:
    /* 투명 체크보드 패턴 (PNG 투명 영역 표시) */
    repeating-conic-gradient(
      #CCCCCC 0% 25%,
      #FFFFFF 0% 50%
    ) 0 0 / 16px 16px;
  border: 1px solid var(--xp-button-shadow);
  overflow: auto;
  max-height: 500px;
}

.tool-canvas {
  display: block;
  image-rendering: pixelated; /* 확대 시 픽셀 유지 */
}

/* === 설정 패널 === */
.tool-settings {
  padding: 8px;
  border-top: 1px solid var(--xp-button-shadow);
  background: var(--xp-button-face);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 설정 행 (라벨 + 입력) */
.tool-setting-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-setting-label {
  min-width: 80px;
  font-size: var(--xp-font-size);
  text-align: right;
}

/* === 결과 다운로드 영역 === */
.tool-result {
  padding: 12px;
  border: 1px solid var(--xp-button-shadow);
  background: #F8F6EE;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-result-info {
  flex: 1;
  font-size: var(--xp-font-size-small);
}

.tool-result-size {
  color: var(--xp-disabled-text);
}

/* === 비교 슬라이더 (전/후) === */
.tool-compare {
  position: relative;
  overflow: hidden;
}

.tool-compare-slider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--xp-border-active);
  cursor: ew-resize;
  z-index: 10;
}

.tool-compare-handle {
  position: absolute;
  top: 50%;
  left: -12px;
  width: 27px;
  height: 27px;
  background: var(--xp-button-face);
  border: 2px solid var(--xp-border-active);
  border-radius: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}
```

#### `ads.css` — 광고 컨테이너 스타일

```css
/* ads.css — AdSense 광고 컨테이너 */

/* === 공통 광고 컨테이너 === */
.ad-container {
  /* AdSense 가이드라인 준수: 광고 주변 충분한 여백 */
  margin: 8px 0;
  text-align: center;
  /* 광고 로딩 전 최소 높이 유지 (CLS 방지) */
  min-height: 90px;
  /* "Advertisement" 라벨 (AdSense 권장) */
  position: relative;
}

.ad-container::before {
  content: "Advertisement";
  display: block;
  font-family: var(--xp-font-family);
  font-size: 9px;
  color: var(--xp-disabled-text);
  text-align: center;
  margin-bottom: 2px;
}

/* === 상단 배너 광고 (728x90 리더보드) === */
.ad-banner-top {
  width: 728px;
  max-width: 100%;
  min-height: 90px;
  margin: 8px auto;
  /* XP 스타일 테두리 (광고도 XP 느낌) */
  border: 1px solid var(--xp-button-shadow);
  background: var(--xp-button-face);
}

/* === 하단 배너 광고 (728x90) === */
.ad-banner-bottom {
  width: 728px;
  max-width: 100%;
  min-height: 90px;
  margin: 8px auto;
  border: 1px solid var(--xp-button-shadow);
  background: var(--xp-button-face);
}

/* === 사이드바 광고 (160x600 와이드 스카이스크래퍼) === */
.ad-sidebar {
  width: 160px;
  min-height: 600px;
  /* XP 창 스타일 광고 프레임 */
  border: 1px solid var(--xp-button-shadow);
  background: var(--xp-button-face);
  /* 고정 위치 (스크롤 시 따라감) */
  position: sticky;
  top: 16px;
}

/* === 인피드 광고 (도구 목록 사이) === */
.ad-infeed {
  width: 100%;
  min-height: 100px;
  margin: 12px 0;
  border: 1px solid var(--xp-button-shadow);
  background: var(--xp-button-face);
  padding: 4px;
}

/* === 광고 로딩 중 플레이스홀더 === */
.ad-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--xp-scrollbar-track);
  color: var(--xp-disabled-text);
  font-size: var(--xp-font-size-small);
}

/* === 반응형 광고 크기 === */
@media (max-width: 767px) {
  /* 모바일: 배너 → 모바일 배너 (320x50) */
  .ad-banner-top,
  .ad-banner-bottom {
    width: 320px;
    min-height: 50px;
  }

  /* 모바일: 사이드바 광고 숨김 */
  .ad-sidebar {
    display: none;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* 태블릿: 배너 크기 조정 (468x60) */
  .ad-banner-top,
  .ad-banner-bottom {
    width: 468px;
    min-height: 60px;
  }
}
```

### 7.4 CSS 네이밍 규칙

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `xp-` | XP UI 컴포넌트 | `.xp-button`, `.xp-window` |
| `xp-{component}--{modifier}` | BEM 수정자 | `.xp-button--default`, `.xp-tab--active` |
| `xp-{component}-{element}` | BEM 요소 | `.xp-titlebar-text`, `.xp-menu-item` |
| `tool-` | 도구별 스타일 | `.tool-canvas`, `.tool-settings` |
| `ad-` | 광고 컨테이너 | `.ad-banner-top`, `.ad-sidebar` |
| `--xp-` | CSS 변수 | `--xp-titlebar-start`, `--xp-font-size` |

### 7.5 CSS 변수 사용 원칙

1. **모든 색상은 CSS 변수** — 하드코딩 금지 (일부 그라데이션 제외)
2. **크기/간격도 변수 활용** — `--xp-spacing-*`, `--xp-*-height`
3. **테마 변경 대비** — 변수만 바꾸면 Silver/Olive Green 테마도 가능
4. **미디어 쿼리에서 변수 오버라이드** — 반응형 크기 조절

### 7.6 향후 테마 확장 (Silver, Olive Green)

```css
/* xp-theme-silver.css — Silver 테마 오버라이드 (미래 확장) */
:root[data-theme="silver"] {
  --xp-titlebar-start: #7A7A8E;
  --xp-titlebar-end: #A6A6B6;
  --xp-border-active: #8888A0;
  --xp-start-green: #5A7A5A;
  /* ... 나머지 색상 변수 오버라이드 ... */
}

/* xp-theme-olive.css — Olive Green 테마 오버라이드 (미래 확장) */
:root[data-theme="olive"] {
  --xp-titlebar-start: #5A6A1A;
  --xp-titlebar-end: #8A9A4A;
  --xp-border-active: #6A7A2A;
  --xp-desktop-bg: #7A8A3A;
  /* ... */
}
```

---

## 부록: XP 3D 보더 패턴 레퍼런스

XP UI에서 반복적으로 사용되는 3D 입체 효과 패턴:

### 볼록한 표면 (Raised — 버튼, 탭, 툴바)

```css
/* 볼록 효과: 상단/좌측 밝게, 하단/우측 어둡게 */
.raised {
  border: 2px solid;
  border-color:
    #FFFFFF   /* top: 밝은 하이라이트 */
    #716F64   /* right: 진한 그림자 */
    #716F64   /* bottom: 진한 그림자 */
    #FFFFFF;  /* left: 밝은 하이라이트 */
  box-shadow:
    inset 1px 1px 0 #FFFFFF,   /* 내부 밝은 라인 */
    inset -1px -1px 0 #ACA899; /* 내부 어두운 라인 */
}
```

### 오목한 표면 (Sunken — 입력 필드, 리스트)

```css
/* 오목 효과: 상단/좌측 어둡게, 하단/우측 밝게 (볼록과 반대) */
.sunken {
  border: 2px solid;
  border-color:
    #ACA899   /* top: 어두운 그림자 */
    #FFFFFF   /* right: 밝은 하이라이트 */
    #FFFFFF   /* bottom: 밝은 하이라이트 */
    #ACA899;  /* left: 어두운 그림자 */
  box-shadow:
    inset 1px 1px 0 #716F64,   /* 내부 더 어두운 라인 */
    inset -1px -1px 0 #F0EDE1; /* 내부 밝은 라인 */
}
```

### 평평한 구분선 (Etched — 그룹 박스, 구분선)

```css
/* 에칭 효과: 오목한 선 + 밝은 선 (2줄 조합) */
.etched {
  border: 1px solid var(--xp-button-shadow);
  box-shadow: 1px 1px 0 var(--xp-button-highlight);
}
```

---

> 📌 **다음 단계**: 이 디자인 시스템을 기반으로 `css/` 디렉토리에 실제 CSS 파일 생성.
> 참조: [03-tool-specs.md](./03-tool-specs.md) — 각 도구별 UI 상세 스펙

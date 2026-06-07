# 📄 ConvertFile — SEO & AdSense 전략

> Windows XP 테마 온라인 이미지/GIF 편집기의 SEO 최적화 및 Google AdSense 수익화 전략
> 정적 사이트 (Cloudflare Pages) 환경에 최적화된 가이드

---

## 목차

1. [Google AdSense 심사 준비](#1-google-adsense-심사-준비)
2. [SEO 전략](#2-seo-전략)
3. [쿠키 동의 배너](#3-쿠키-동의-배너)
4. [분석 도구](#4-분석-도구)
5. [법적 문서 템플릿](#5-법적-문서-템플릿)

---

## 1. Google AdSense 심사 준비

### 1.1 필수 페이지 (반드시 구현)

AdSense 심사 신청 전 **반드시** 아래 4개 페이지가 완성·배포되어야 한다.
각 페이지는 독립 HTML 파일로 생성하며, 공통 헤더/푸터 네비게이션에서 접근 가능해야 한다.

| 페이지 | 파일 경로 | 용도 | 최소 요건 |
|--------|-----------|------|-----------|
| **About Us** | `about.html` | 사이트 소개, 운영 목적, 운영자 정보 | 500자 이상, 운영자 이름/이메일, 사이트 미션 기술 |
| **개인정보처리방침** | `privacy.html` | GDPR + 한국 개인정보보호법 준수 | 쿠키 정책, 제3자 광고 네트워크 고지, 데이터 수집 항목 명시 |
| **이용약관** | `terms.html` | 서비스 이용 조건 | 면책 조항, 지적재산권, 금지 행위, 서비스 변경 조항 |
| **문의하기** | `contact.html` | 사용자 피드백 채널 | 이메일 주소 또는 문의 폼 제공 |

#### About Us (`about.html`) 필수 포함 항목

```
about.html
├── 사이트 소개 (ConvertFile이 무엇인지)
├── 운영 목적 (왜 만들었는지)
├── 핵심 가치 (무료, 개인정보 보호, 서버 업로드 없음)
├── 운영자/팀 정보 (이름, 이메일)
├── 기술 스택 간략 소개 (브라우저 기반 처리)
└── 연락처 (contact.html 링크)
```

#### 개인정보처리방침 (`privacy.html`) 필수 포함 항목

```
privacy.html
├── 수집하는 개인정보 항목
│   ├── 직접 수집: 없음 (서버 업로드 없음 명시)
│   ├── 자동 수집: 쿠키, IP 주소 (Analytics/AdSense 경유)
│   └── 제3자 수집: Google AdSense, Google Analytics
├── 개인정보 이용 목적
├── 개인정보 보유 기간
├── 제3자 제공 (Google AdSense 네트워크)
├── 쿠키 정책
│   ├── 필수 쿠키 목록
│   ├── 분석 쿠키 (GA4)
│   └── 광고 쿠키 (AdSense)
├── 이용자 권리 (열람, 삭제, 동의 철회)
├── GDPR 관련 조항 (EU 사용자 대상)
├── 한국 개인정보보호법 관련 조항
├── 개인정보보호 책임자 연락처
└── 시행일 및 변경 이력
```

#### 이용약관 (`terms.html`) 필수 포함 항목

```
terms.html
├── 서비스 정의
├── 이용 조건 (무료, 비상업적/상업적 이용 허용 범위)
├── 사용자 의무 (불법 콘텐츠 금지 등)
├── 지적재산권 (사이트 코드/디자인 vs 사용자 업로드 파일)
├── 면책 조항
│   ├── 파일 손상/손실 책임 제한
│   ├── 서비스 중단 가능성
│   └── 결과물 품질 보증 없음
├── 서비스 변경/종료 조항
├── 분쟁 해결 (준거법, 관할법원)
└── 시행일 및 변경 이력
```

#### 문의하기 (`contact.html`) 구현 방법

정적 사이트이므로 서버사이드 폼 처리 불가. 아래 3가지 방법 중 택 1:

| 방법 | 비용 | 난이도 | 장점 | 단점 |
|------|------|--------|------|------|
| **Formspree** | 월 50건 무료 | ⭐ 낮음 | 간단한 설정, AJAX 지원 | 무료 한도 제한 |
| **Cloudflare Workers** | 일 100K 무료 | ⭐⭐ 중간 | 같은 인프라, 커스텀 자유 | Workers 코드 작성 필요 |
| **mailto 링크 + 이메일 표시** | 무료 | ⭐ 낮음 | 가장 간단 | 사용자 경험 떨어짐, 스팸 노출 |

**권장: Formspree (Phase 1) → Cloudflare Workers (Phase 2 이후)**

Formspree 연동 HTML 예시:

```html
<!-- contact.html 폼 영역 -->
<form
  action="https://formspree.io/f/{YOUR_FORM_ID}"
  method="POST"
  class="xp-form contact-form"
>
  <!-- 이름 입력 필드 -->
  <div class="form-group">
    <label for="name">이름</label>
    <input type="text" id="name" name="name" required
           class="xp-input" placeholder="홍길동">
  </div>

  <!-- 이메일 입력 필드 -->
  <div class="form-group">
    <label for="email">이메일</label>
    <input type="email" id="email" name="email" required
           class="xp-input" placeholder="example@email.com">
  </div>

  <!-- 문의 유형 선택 -->
  <div class="form-group">
    <label for="subject">문의 유형</label>
    <select id="subject" name="subject" class="xp-select">
      <option value="bug">버그 신고</option>
      <option value="feature">기능 요청</option>
      <option value="general">일반 문의</option>
      <option value="partnership">제휴 문의</option>
    </select>
  </div>

  <!-- 메시지 본문 -->
  <div class="form-group">
    <label for="message">메시지</label>
    <textarea id="message" name="message" required
              class="xp-textarea" rows="6"
              placeholder="문의 내용을 입력해주세요"></textarea>
  </div>

  <!-- 스팸 방지 (Formspree 허니팟) -->
  <input type="text" name="_gotcha" style="display:none">

  <!-- 제출 버튼 -->
  <button type="submit" class="xp-button xp-button-primary">
    보내기
  </button>
</form>
```

---

### 1.2 AdSense 심사 통과 기준

Google AdSense 심사는 명시적 체크리스트가 아닌 종합 평가이다.
아래 항목은 **합격 확률을 최대화**하기 위한 실전 기준이다.

#### 콘텐츠 요건

| 기준 | 목표값 | 상세 설명 |
|------|--------|-----------|
| **고유 콘텐츠 페이지 수** | 최소 20~30개 | 각 도구 페이지 + 가이드 페이지가 합산됨 |
| **페이지당 텍스트 분량** | 최소 300자 (한글 기준) | 도구 설명, 사용법, 팁 등 고유 텍스트 |
| **중복 콘텐츠** | 0% | 다른 사이트에서 복사한 텍스트 절대 금지 |
| **저작권 위반** | 0건 | 이미지, 텍스트, 코드 모두 원본 또는 라이선스 준수 |

#### 콘텐츠 페이지 확보 전략

Phase 1 기준 최소 페이지 목록:

```
페이지 목록 (총 25+ 개)
─────────────────────────────────────────────
메인 페이지
├── index.html                    (홈, 도구 목록)
│
도구 페이지 (각 도구마다 사용법 텍스트 300자+ 포함)
├── tools/resize.html             이미지 리사이즈
├── tools/crop.html               이미지 크롭
├── tools/rotate.html             이미지 회전/뒤집기
├── tools/convert.html            포맷 변환 (JPG↔PNG↔WebP)
├── tools/compress.html           이미지 압축
├── tools/filters.html            필터/효과
├── tools/watermark.html          워터마크 추가
├── tools/text.html               텍스트 추가
├── tools/metadata.html           메타데이터 뷰어/제거
├── tools/qrcode.html             QR코드 생성
├── tools/gif-maker.html          GIF 만들기
├── tools/gif-splitter.html       GIF 분할
├── tools/gif-resize.html         GIF 리사이즈
├── tools/gif-optimize.html       GIF 최적화
├── tools/gif-reverse.html        GIF 역재생
├── tools/gif-speed.html          GIF 속도 조절
├── tools/gif-text.html           GIF 텍스트 추가
│
가이드/도움말 페이지
├── guides/how-to-resize.html     이미지 리사이즈 방법 가이드
├── guides/image-formats.html     이미지 포맷 비교 가이드
├── guides/gif-tips.html          GIF 최적화 팁
│
법적/정보 페이지
├── about.html                    사이트 소개
├── privacy.html                  개인정보처리방침
├── terms.html                    이용약관
├── contact.html                  문의하기
└── 404.html                      404 에러 페이지
```

#### 도구 페이지별 필수 텍스트 구조

각 도구 페이지(`tools/*.html`)에는 도구 UI 외에 아래 텍스트 섹션이 **반드시** 포함되어야 한다:

```html
<!-- 도구 UI 영역 (업로드, 설정, 결과) -->
<div class="tool-workspace">
  <!-- ... 도구 인터페이스 ... -->
</div>

<!-- SEO + AdSense 심사용 콘텐츠 영역 -->
<section class="tool-description" id="about-tool">
  <h2>온라인 이미지 리사이즈 도구</h2>
  <p>
    ConvertFile의 이미지 리사이즈 도구를 사용하면 브라우저에서 직접
    이미지 크기를 변경할 수 있습니다. 서버에 파일을 업로드하지 않으므로
    개인정보가 완벽하게 보호됩니다...
    (최소 300자 이상의 고유 설명 텍스트)
  </p>
</section>

<section class="tool-howto" id="how-to-use">
  <h2>사용 방법</h2>
  <ol>
    <li>이미지 파일을 드래그 앤 드롭하거나 "파일 선택" 버튼을 클릭합니다.</li>
    <li>원하는 너비와 높이를 입력합니다.</li>
    <li>"리사이즈" 버튼을 클릭합니다.</li>
    <li>결과를 확인하고 "다운로드" 버튼으로 저장합니다.</li>
  </ol>
</section>

<section class="tool-features" id="features">
  <h2>주요 기능</h2>
  <ul>
    <li>비율 유지 리사이즈</li>
    <li>커스텀 크기 지정 (px, %)</li>
    <li>다중 파일 일괄 리사이즈</li>
    <li>JPG, PNG, WebP, BMP 지원</li>
  </ul>
</section>

<!-- FAQ 섹션 (Schema.org FAQPage 마크업 포함) -->
<section class="tool-faq" id="faq">
  <h2>자주 묻는 질문</h2>
  <!-- FAQ 항목 (2.4절 참조) -->
</section>
```

#### 사이트 구조 요건

| 기준 | 요구사항 |
|------|----------|
| **네비게이션** | 모든 페이지에서 주요 섹션 접근 가능한 메뉴 |
| **반응형 디자인** | 모바일 (360px~) / 태블릿 (768px~) / 데스크톱 (1024px~) |
| **로딩 속도** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| **HTTPS** | Cloudflare Pages 자동 제공 ✅ |
| **사이트맵** | `sitemap.xml` 제출 (Google Search Console) |
| **robots.txt** | 크롤링 허용 설정 |

#### 도메인 관련 주의사항

| 상황 | 권장 사항 |
|------|-----------|
| **신규 도메인** | 등록 후 최소 3~6개월 경과 후 AdSense 신청 |
| **무료 서브도메인** (`*.pages.dev`) | AdSense 심사 불가 — 커스텀 도메인 필수 |
| **도메인 선택** | `.com`, `.net`, `.co.kr` 등 일반 TLD 권장 |
| **도메인 에이지 우회** | 콘텐츠 먼저 충분히 축적, 도메인 연결은 나중에 가능 |

> **⚠️ 중요**: `convertfile.pages.dev`는 AdSense 심사에 사용할 수 없다.
> 반드시 커스텀 도메인(예: `convertfile.com`)을 연결한 후 신청해야 한다.

---

### 1.3 광고 배치 전략

#### 광고 슬롯 정의

```
┌─────────────────────────────────────────────────────┐
│  [헤더 배너 광고]  728×90 / 반응형                    │  ← AD_SLOT_HEADER
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   도구 인터페이스     │  [사이드바 광고]              │  ← AD_SLOT_SIDEBAR
│   (메인 콘텐츠)      │  300×250 / 300×600           │
│                      │                              │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│  [결과 하단 광고]  728×90 / 반응형                    │  ← AD_SLOT_RESULT
├─────────────────────────────────────────────────────┤
│                                                     │
│   사용법 설명 / FAQ 텍스트                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [콘텐츠 하단 광고]  728×90 / 반응형                  │  ← AD_SLOT_BOTTOM
├─────────────────────────────────────────────────────┤
│  푸터                                               │
└─────────────────────────────────────────────────────┘
```

#### 광고 슬롯 상세

| 슬롯 ID | 위치 | 권장 크기 | 표시 조건 | 비고 |
|----------|------|-----------|-----------|------|
| `AD_SLOT_HEADER` | 헤더 아래, 도구 위 | 728×90 (데스크톱), 320×100 (모바일) | 모든 페이지 | 페이지 로드 시 즉시 표시 |
| `AD_SLOT_SIDEBAR` | 도구 영역 우측 | 300×250 또는 300×600 | 데스크톱만 (1024px+) | 모바일에서는 숨김 |
| `AD_SLOT_RESULT` | 도구 결과 출력 아래 | 728×90 반응형 | 결과 생성 후 표시 | 사용자 액션 후 노출 → 높은 가시성 |
| `AD_SLOT_BOTTOM` | 콘텐츠 하단, 푸터 위 | 728×90 반응형 | 모든 페이지 | 스크롤 후 노출 |

#### 광고 컨테이너 HTML/CSS

```html
<!-- 광고 컨테이너: 광고 로드 전 빈 공간 방지 + 최소 높이 확보 -->
<div class="ad-container ad-container--header" id="ad-header">
  <div class="ad-label">광고</div>
  <!-- AdSense 코드 삽입 위치 -->
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
       data-ad-slot="1234567890"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>
    // AdSense 광고 로드 실행
    (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

```css
/* =========================================
   광고 컨테이너 공통 스타일
   ========================================= */

/* 광고 영역 기본 스타일 — 빈 공간 방지, 최소 높이 확보 */
.ad-container {
  width: 100%;
  text-align: center;
  margin: 16px 0;
  min-height: 90px;           /* 광고 로드 전 레이아웃 시프트(CLS) 방지 */
  background-color: #f0f0f0;  /* 광고 미로드 시 배경색 */
  border: 1px solid #d4d0c8;  /* XP 테마 테두리 */
  overflow: hidden;
  position: relative;
}

/* "광고" 라벨 — AdSense 정책상 광고 영역 표시 권장 */
.ad-label {
  font-size: 10px;
  color: #999;
  text-align: left;
  padding: 2px 4px;
  position: absolute;
  top: 0;
  left: 0;
}

/* 헤더 배너 — 데스크톱 728×90, 모바일 320×100 */
.ad-container--header {
  max-width: 728px;
  min-height: 90px;
  margin: 8px auto;
}

/* 사이드바 — 300×250 또는 300×600 */
.ad-container--sidebar {
  width: 300px;
  min-height: 250px;
}

/* 결과 하단 */
.ad-container--result {
  max-width: 728px;
  min-height: 90px;
  margin: 16px auto;
}

/* 콘텐츠 하단 */
.ad-container--bottom {
  max-width: 728px;
  min-height: 90px;
  margin: 16px auto;
}

/* 모바일 반응형 — 사이드바 광고 숨김 */
@media (max-width: 1023px) {
  .ad-container--sidebar {
    display: none;
  }
  .ad-container--header {
    min-height: 100px;   /* 모바일 배너 크기 대응 */
  }
}

/* 광고 차단기 대응 — 광고 미로드 시 빈 영역 축소 */
.ad-container:empty,
.ad-container--fallback {
  min-height: 0;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
}
```

#### ads.txt 파일

`ads.txt`는 사이트 루트(`/ads.txt`)에 위치해야 한다. AdSense 승인 후 생성.

**파일 경로**: `ads.txt` (프로젝트 루트)

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

| 필드 | 설명 |
|------|------|
| `google.com` | 광고 네트워크 도메인 |
| `pub-XXXXXXXXXXXXXXXX` | AdSense 게시자 ID (승인 후 발급) |
| `DIRECT` | 직접 계약 관계 |
| `f08c47fec0942fa0` | Google TAG-ID (고정값) |

#### 광고 로딩 전략

```javascript
/**
 * AdSense 지연 로딩 — Core Web Vitals 보호
 * 페이지 메인 콘텐츠 로드 후 광고 스크립트 삽입
 */
function loadAdSense() {
  // 이미 로드된 경우 중복 방지
  if (document.querySelector('script[src*="adsbygoogle"]')) return;

  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  // AdSense 게시자 ID 설정
  script.dataset.adClient = 'ca-pub-XXXXXXXXXXXXXXXX';
  document.head.appendChild(script);
}

// 방법 1: 페이지 로드 완료 후 로딩 (권장)
window.addEventListener('load', () => {
  // 1.5초 지연 — LCP 보호
  setTimeout(loadAdSense, 1500);
});

// 방법 2: 사용자 인터랙션 시 로딩 (더 적극적 최적화)
['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event => {
  window.addEventListener(event, loadAdSense, { once: true });
});
```

---

### 1.4 AdSense 심사 체크리스트

심사 신청 전 아래 항목 전체 확인:

```
AdSense 심사 체크리스트
═══════════════════════════════════════════════════

콘텐츠
  □  고유 콘텐츠 페이지 20개 이상
  □  각 도구 페이지에 300자+ 설명 텍스트
  □  중복 콘텐츠 없음
  □  저작권 위반 콘텐츠 없음
  □  성인/폭력/불법 콘텐츠 없음

필수 페이지
  □  about.html 작성 완료
  □  privacy.html 작성 완료
  □  terms.html 작성 완료
  □  contact.html 작성 완료 + 폼 동작 확인

네비게이션
  □  모든 페이지에서 메인 메뉴 접근 가능
  □  푸터에 About/Privacy/Terms/Contact 링크
  □  breadcrumb 네비게이션 구현

기술
  □  커스텀 도메인 연결 완료 (*.pages.dev 불가)
  □  HTTPS 적용 확인
  □  모바일 반응형 동작 확인
  □  404 페이지 커스텀 완료
  □  페이지 로딩 속도 양호 (LCP < 2.5s)
  □  sitemap.xml 생성 및 제출
  □  robots.txt 설정
  □  Google Search Console 등록

도메인
  □  도메인 에이지 3개월+ (권장 6개월+)
  □  .com / .net / .co.kr 등 정식 TLD
  □  WHOIS 정보 정상

광고 준비
  □  ads.txt 생성 (승인 후)
  □  광고 슬롯 위치 확정
  □  광고 컨테이너 CSS 적용
  □  광고가 콘텐츠를 방해하지 않는 레이아웃 확인
```

---

## 2. SEO 전략

### 2.1 기본 메타 태그 설정

모든 HTML 페이지의 `<head>`에 아래 메타 태그를 포함한다.
도구별로 **고유한** title, description, keywords를 설정해야 한다.

#### 메타 태그 템플릿 (전체)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <!-- ============================================
       기본 메타 태그
       ============================================ -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 페이지 제목: 60자 이내, 핵심 키워드 포함 -->
  <title>온라인 이미지 리사이즈 - 무료 이미지 크기 변경 | ConvertFile</title>

  <!-- 페이지 설명: 155자 이내, 행동 유도 문구 포함 -->
  <meta name="description"
        content="브라우저에서 바로 이미지 크기를 변경하세요. 서버 업로드 없이 안전하게 JPG, PNG, WebP 이미지를 리사이즈합니다. 무료, 회원가입 불필요.">

  <!-- 키워드: 10개 이내, 콤마 구분 (SEO 직접 효과는 낮지만 참고용) -->
  <meta name="keywords"
        content="이미지 리사이즈, 이미지 크기 변경, 온라인 리사이즈, image resize, 사진 크기 줄이기, 무료 이미지 편집">

  <!-- 검색엔진 크롤링 지시 -->
  <meta name="robots" content="index, follow">

  <!-- 정규 URL (중복 페이지 방지) -->
  <link rel="canonical" href="https://convertfile.com/tools/resize.html">

  <!-- 파비콘 -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">

  <!-- ============================================
       Open Graph 태그 (Facebook, KakaoTalk 등)
       ============================================ -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ConvertFile">
  <meta property="og:title" content="온라인 이미지 리사이즈 - 무료 이미지 크기 변경">
  <meta property="og:description"
        content="브라우저에서 바로 이미지 크기를 변경하세요. 서버 업로드 없이 안전하게 리사이즈합니다.">
  <meta property="og:image" content="https://convertfile.com/images/og/resize-tool.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://convertfile.com/tools/resize.html">
  <meta property="og:locale" content="ko_KR">

  <!-- ============================================
       Twitter Card 태그
       ============================================ -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="온라인 이미지 리사이즈 - 무료 이미지 크기 변경">
  <meta name="twitter:description"
        content="브라우저에서 바로 이미지 크기를 변경하세요. 무료, 회원가입 불필요.">
  <meta name="twitter:image" content="https://convertfile.com/images/og/resize-tool.png">

  <!-- ============================================
       구조화 데이터: Schema.org WebApplication
       ============================================ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ConvertFile 이미지 리사이즈",
    "url": "https://convertfile.com/tools/resize.html",
    "description": "브라우저에서 바로 이미지 크기를 변경하는 무료 온라인 도구",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    },
    "creator": {
      "@type": "Organization",
      "name": "ConvertFile",
      "url": "https://convertfile.com"
    },
    "featureList": [
      "이미지 리사이즈",
      "비율 유지 크기 변경",
      "다중 포맷 지원 (JPG, PNG, WebP, BMP)",
      "서버 업로드 없는 브라우저 처리"
    ]
  }
  </script>

  <!-- ============================================
       구조화 데이터: BreadcrumbList
       ============================================ -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": "https://convertfile.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "이미지 도구",
        "item": "https://convertfile.com/tools/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "이미지 리사이즈",
        "item": "https://convertfile.com/tools/resize.html"
      }
    ]
  }
  </script>

  <!-- 스타일시트 -->
  <link rel="stylesheet" href="/css/xp-theme.css">
  <link rel="stylesheet" href="/css/tools.css">
</head>
```

#### 도구별 메타 태그 매핑 테이블

| 도구 페이지 | `<title>` (60자 이내) | `<meta description>` (155자 이내) |
|-------------|----------------------|----------------------------------|
| `resize.html` | `온라인 이미지 리사이즈 - 무료 이미지 크기 변경 \| ConvertFile` | `브라우저에서 바로 이미지 크기를 변경하세요. 서버 업로드 없이 안전하게 JPG, PNG, WebP 이미지를 리사이즈합니다.` |
| `crop.html` | `온라인 이미지 자르기 - 무료 이미지 크롭 도구 \| ConvertFile` | `이미지를 원하는 크기로 자르세요. 자유 비율, 정사각형, 16:9 등 다양한 비율로 크롭할 수 있습니다.` |
| `rotate.html` | `이미지 회전 & 뒤집기 - 온라인 무료 도구 \| ConvertFile` | `이미지를 90°, 180°, 270° 회전하거나 좌우/상하로 뒤집으세요. 브라우저에서 즉시 처리됩니다.` |
| `convert.html` | `이미지 포맷 변환 - JPG PNG WebP BMP 변환 \| ConvertFile` | `JPG, PNG, WebP, BMP, ICO 간 이미지 포맷을 변환하세요. 무료 온라인 이미지 컨버터입니다.` |
| `compress.html` | `이미지 압축 - 온라인 이미지 용량 줄이기 \| ConvertFile` | `이미지 파일 크기를 줄이세요. 품질 손실 최소화하면서 JPG, PNG, WebP 이미지를 압축합니다.` |
| `filters.html` | `이미지 필터 & 효과 - 흑백, 세피아, 밝기 조절 \| ConvertFile` | `이미지에 흑백, 세피아, 밝기, 대비, 채도 등 다양한 필터와 효과를 적용하세요.` |
| `watermark.html` | `이미지 워터마크 추가 - 온라인 무료 도구 \| ConvertFile` | `이미지에 텍스트 또는 이미지 워터마크를 추가하세요. 저작권 보호에 유용합니다.` |
| `text.html` | `이미지에 텍스트 추가 - 온라인 텍스트 삽입 \| ConvertFile` | `이미지 위에 텍스트를 추가하세요. 폰트, 크기, 색상, 위치를 자유롭게 설정할 수 있습니다.` |
| `metadata.html` | `이미지 EXIF 메타데이터 뷰어 & 제거 \| ConvertFile` | `이미지의 EXIF 메타데이터를 확인하고 제거하세요. 위치 정보, 카메라 정보 등을 관리합니다.` |
| `qrcode.html` | `QR코드 생성기 - 무료 온라인 QR코드 만들기 \| ConvertFile` | `텍스트, URL, 연락처 등을 QR코드로 변환하세요. 색상, 크기 커스텀 가능합니다.` |
| `gif-maker.html` | `GIF 만들기 - 이미지로 GIF 애니메이션 생성 \| ConvertFile` | `여러 이미지를 합쳐 GIF 애니메이션을 만드세요. 프레임 순서, 딜레이, 반복 설정 가능.` |
| `gif-splitter.html` | `GIF 분할 - GIF 프레임 추출 도구 \| ConvertFile` | `GIF 애니메이션을 개별 프레임 이미지로 분할하세요. PNG, JPG로 저장 가능합니다.` |
| `gif-resize.html` | `GIF 리사이즈 - GIF 크기 변경 \| ConvertFile` | `GIF 애니메이션의 크기를 변경하세요. 애니메이션을 유지하면서 해상도를 조절합니다.` |
| `gif-optimize.html` | `GIF 최적화 - GIF 파일 크기 줄이기 \| ConvertFile` | `GIF 파일 크기를 줄이세요. 색상 수 감소, 프레임 제거, 디더링 최적화를 지원합니다.` |
| `gif-reverse.html` | `GIF 역재생 - GIF 거꾸로 재생 \| ConvertFile` | `GIF 애니메이션을 거꾸로 재생하세요. 역방향 또는 부메랑 효과를 적용합니다.` |
| `gif-speed.html` | `GIF 속도 조절 - 빠르게/느리게 변경 \| ConvertFile` | `GIF 애니메이션의 재생 속도를 조절하세요. 배속 또는 프레임별 딜레이를 변경합니다.` |
| `gif-text.html` | `GIF 텍스트 추가 - GIF에 글자 넣기 \| ConvertFile` | `GIF 애니메이션 위에 텍스트를 추가하세요. 폰트, 색상, 위치, 표시 타이밍 설정 가능.` |

---

### 2.2 키워드 전략

#### 도구별 타겟 키워드 매핑

각 도구에 대해 **주 키워드 (1개)** + **보조 키워드 (3~5개)** + **long-tail 키워드 (2~3개)**를 설정한다.
한글 + 영문 병행으로 국내·해외 트래픽 모두 확보.

| 도구 | 주 키워드 | 보조 키워드 | Long-tail 키워드 |
|------|-----------|-------------|-----------------|
| 리사이즈 | `이미지 리사이즈` | `이미지 크기 변경`, `사진 크기 줄이기`, `image resize online`, `온라인 리사이즈` | `인스타그램 사진 크기 맞추기`, `여권사진 크기 조절 온라인` |
| 크롭 | `이미지 자르기` | `이미지 크롭`, `사진 자르기`, `image crop online`, `온라인 이미지 자르기` | `프로필 사진 원형 자르기`, `1:1 정사각형 사진 자르기` |
| 포맷 변환 | `이미지 변환` | `JPG to PNG`, `PNG to JPG`, `WebP 변환`, `image converter` | `투명 배경 PNG로 변환`, `HEIC to JPG 변환 무료` |
| 압축 | `이미지 압축` | `이미지 용량 줄이기`, `사진 용량 줄이기`, `image compress`, `JPG 압축` | `이메일 첨부 사진 용량 줄이기`, `1MB 이하로 이미지 압축` |
| GIF 만들기 | `GIF 만들기` | `GIF 생성`, `움짤 만들기`, `GIF maker`, `이미지 GIF 변환` | `사진으로 움짤 만들기 무료`, `카카오톡 이모티콘 GIF 만들기` |
| GIF 최적화 | `GIF 최적화` | `GIF 용량 줄이기`, `GIF 압축`, `GIF optimizer`, `움짤 용량 줄이기` | `디스코드 이모지 용량 줄이기`, `GIF 256KB 이하로 줄이기` |
| QR코드 | `QR코드 생성` | `QR코드 만들기`, `QR code generator`, `무료 QR코드` | `컬러 QR코드 생성 무료`, `명함 QR코드 만들기` |

#### 키워드 적용 위치

```
키워드 배치 우선순위
──────────────────────────────────────
1. <title> 태그           — 주 키워드 필수 포함
2. <meta description>     — 주 키워드 + 보조 키워드 1~2개
3. <h1> 태그              — 주 키워드 (페이지당 1개)
4. <h2> 태그              — 보조 키워드
5. 본문 첫 단락           — 주 키워드 자연스럽게 포함
6. 이미지 alt 속성         — 관련 키워드
7. URL 경로               — 영문 키워드 (tools/resize.html)
8. 내부 링크 앵커 텍스트    — 관련 키워드
```

---

### 2.3 기술적 SEO

#### sitemap.xml 생성

정적 사이트이므로 빌드 시 자동 생성 스크립트를 사용하거나 수동 관리한다.

**파일 경로**: `sitemap.xml` (프로젝트 루트)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- 메인 페이지 -->
  <url>
    <loc>https://convertfile.com/</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- 도구 페이지: 이미지 리사이즈 -->
  <url>
    <loc>https://convertfile.com/tools/resize.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- 도구 페이지: 이미지 크롭 -->
  <url>
    <loc>https://convertfile.com/tools/crop.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- ... (모든 도구 페이지 동일 패턴으로 추가) ... -->

  <!-- 법적 페이지 -->
  <url>
    <loc>https://convertfile.com/about.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://convertfile.com/privacy.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://convertfile.com/terms.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://convertfile.com/contact.html</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

</urlset>
```

#### sitemap.xml 자동 생성 스크립트

```javascript
// scripts/generate-sitemap.js
// Node.js 스크립트: HTML 파일 목록을 스캔하여 sitemap.xml 자동 생성
// 사용법: node scripts/generate-sitemap.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');  // npm install glob

// 사이트 기본 URL (배포 도메인)
const SITE_URL = 'https://convertfile.com';

// sitemap에서 제외할 파일 패턴
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  'doc/**',
  'scripts/**',
  '404.html',      // 404 페이지는 검색엔진에 노출 불필요
];

// 우선순위 매핑 — 페이지 유형별 priority 설정
const PRIORITY_MAP = {
  'index.html': '1.0',           // 메인 페이지 최고 우선순위
  'tools/': '0.9',               // 도구 페이지 높은 우선순위
  'guides/': '0.7',              // 가이드 페이지 중간 우선순위
  'about.html': '0.3',           // 법적 페이지 낮은 우선순위
  'privacy.html': '0.3',
  'terms.html': '0.3',
  'contact.html': '0.3',
};

/**
 * 파일 경로에 따른 우선순위 반환
 * @param {string} filePath - HTML 파일의 상대 경로
 * @returns {string} sitemap priority 값 (0.0 ~ 1.0)
 */
function getPriority(filePath) {
  for (const [pattern, priority] of Object.entries(PRIORITY_MAP)) {
    if (filePath.includes(pattern)) return priority;
  }
  return '0.5';  // 기본 우선순위
}

/**
 * 파일 경로에 따른 변경 빈도 반환
 * @param {string} filePath - HTML 파일의 상대 경로
 * @returns {string} sitemap changefreq 값
 */
function getChangeFreq(filePath) {
  if (filePath === 'index.html') return 'weekly';
  if (filePath.startsWith('tools/')) return 'monthly';
  if (filePath.startsWith('guides/')) return 'monthly';
  return 'yearly';
}

// HTML 파일 검색
const htmlFiles = glob.sync('**/*.html', {
  ignore: EXCLUDE_PATTERNS,
});

// 오늘 날짜 (ISO 형식)
const today = new Date().toISOString().split('T')[0];

// sitemap.xml 생성
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (const file of htmlFiles) {
  const url = `${SITE_URL}/${file === 'index.html' ? '' : file}`;
  xml += `  <url>\n`;
  xml += `    <loc>${url}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>${getChangeFreq(file)}</changefreq>\n`;
  xml += `    <priority>${getPriority(file)}</priority>\n`;
  xml += `  </url>\n`;
}

xml += '</urlset>\n';

// 파일 쓰기
fs.writeFileSync('sitemap.xml', xml);
console.log(`✅ sitemap.xml 생성 완료 (${htmlFiles.length}개 URL)`);
```

#### robots.txt

**파일 경로**: `robots.txt` (프로젝트 루트)

```
# ConvertFile robots.txt
# 모든 검색엔진 크롤러에게 크롤링 허용

User-agent: *
Allow: /

# 크롤링 제외 대상
Disallow: /scripts/
Disallow: /doc/

# sitemap 위치 명시
Sitemap: https://convertfile.com/sitemap.xml
```

#### 404 에러 페이지

Cloudflare Pages는 `404.html`을 프로젝트 루트에 두면 자동으로 404 응답에 사용한다.

**파일 경로**: `404.html`

필수 포함 요소:
- Windows XP 테마 에러 디자인 (블루스크린 또는 에러 다이얼로그)
- 홈으로 돌아가기 링크
- 인기 도구 링크 목록 (사용자 이탈 방지)
- 검색 기능 (선택)

```html
<!-- 404.html — XP 스타일 에러 페이지 -->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지를 찾을 수 없습니다 - 404 | ConvertFile</title>
  <meta name="robots" content="noindex, follow">
  <!-- noindex: 404 페이지는 검색엔진에 색인 안함 -->
  <!-- follow: 페이지 내 링크는 따라감 (도구 페이지 크롤링 유도) -->
  <link rel="stylesheet" href="/css/xp-theme.css">
</head>
<body>
  <!-- Windows XP 에러 다이얼로그 스타일 -->
  <div class="xp-window xp-error-dialog">
    <div class="xp-title-bar xp-title-bar--error">
      <span class="xp-title-bar__text">오류</span>
      <button class="xp-title-bar__close">✕</button>
    </div>
    <div class="xp-window__body">
      <div class="xp-error-content">
        <img src="/images/xp-error-icon.png" alt="오류 아이콘" class="xp-error-icon">
        <div class="xp-error-message">
          <h1>페이지를 찾을 수 없습니다</h1>
          <p>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        </div>
      </div>

      <!-- 이탈 방지: 인기 도구 바로가기 -->
      <div class="xp-error-links">
        <h2>인기 도구를 사용해 보세요:</h2>
        <ul>
          <li><a href="/tools/resize.html">이미지 리사이즈</a></li>
          <li><a href="/tools/convert.html">이미지 변환</a></li>
          <li><a href="/tools/compress.html">이미지 압축</a></li>
          <li><a href="/tools/gif-maker.html">GIF 만들기</a></li>
        </ul>
      </div>

      <div class="xp-error-actions">
        <a href="/" class="xp-button xp-button-primary">홈으로 돌아가기</a>
      </div>
    </div>
  </div>
</body>
</html>
```

#### Core Web Vitals 최적화

| 지표 | 목표 | 최적화 방법 |
|------|------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5초 | CSS 인라인화, 이미지 lazy loading, 폰트 preload |
| **FID** (First Input Delay) | < 100ms | JS 분할 로딩, Web Worker 활용, 광고 지연 로딩 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 이미지/광고 크기 예약, 폰트 `font-display: swap` |

```html
<!-- Core Web Vitals 최적화 — <head> 에 추가 -->

<!-- 폰트 프리로드 — LCP 개선 -->
<link rel="preload" href="/fonts/xp-tahoma.woff2" as="font"
      type="font/woff2" crossorigin>

<!-- 크리티컬 CSS 인라인화 — 첫 렌더링 속도 향상 -->
<style>
  /* 페이지 초기 렌더링에 필요한 최소 CSS만 인라인 */
  body { margin: 0; font-family: 'Tahoma', sans-serif; background: #3a6ea5; }
  .xp-desktop { min-height: 100vh; }
  /* ... 필수 레이아웃 CSS ... */
</style>

<!-- 나머지 CSS는 비동기 로딩 — 렌더 블로킹 방지 -->
<link rel="preload" href="/css/xp-theme.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/css/xp-theme.css"></noscript>
```

```html
<!-- 이미지 Lazy Loading — LCP 외 이미지에 적용 -->
<img src="/images/tool-preview.png"
     alt="이미지 리사이즈 도구 미리보기"
     loading="lazy"
     width="600" height="400"
     decoding="async">

<!-- LCP 대상 이미지는 lazy loading 하지 않음 -->
<img src="/images/hero-banner.png"
     alt="ConvertFile 메인 배너"
     loading="eager"
     width="1200" height="400"
     fetchpriority="high">
```

#### 내부 링크 전략

관련 도구 간 상호 링크로 크롤러 탐색성 + 사용자 체류시간 향상.

```
내부 링크 맵
═══════════════════════════════════════════════════

이미지 리사이즈 ←→ 이미지 크롭 ←→ 이미지 회전
      ↕                  ↕                 ↕
이미지 압축    ←→ 포맷 변환   ←→ 필터/효과
      ↕                  ↕
워터마크 추가  ←→ 텍스트 추가

GIF 만들기 ←→ GIF 리사이즈 ←→ GIF 최적화
     ↕               ↕              ↕
GIF 분할   ←→ GIF 역재생  ←→ GIF 속도 조절
                                     ↕
                              GIF 텍스트 추가
```

각 도구 페이지 하단에 "관련 도구" 섹션 추가:

```html
<!-- 관련 도구 섹션 — 각 도구 페이지 하단 -->
<section class="related-tools" id="related-tools">
  <h2>관련 도구</h2>
  <div class="related-tools-grid">
    <!-- 관련 도구 카드: 아이콘 + 이름 + 간단 설명 -->
    <a href="/tools/crop.html" class="related-tool-card">
      <img src="/images/icons/crop.svg" alt="이미지 자르기 아이콘"
           width="48" height="48" loading="lazy">
      <h3>이미지 자르기</h3>
      <p>원하는 영역만 잘라내세요</p>
    </a>

    <a href="/tools/compress.html" class="related-tool-card">
      <img src="/images/icons/compress.svg" alt="이미지 압축 아이콘"
           width="48" height="48" loading="lazy">
      <h3>이미지 압축</h3>
      <p>파일 크기를 줄이세요</p>
    </a>

    <a href="/tools/convert.html" class="related-tool-card">
      <img src="/images/icons/convert.svg" alt="포맷 변환 아이콘"
           width="48" height="48" loading="lazy">
      <h3>포맷 변환</h3>
      <p>JPG, PNG, WebP 변환</p>
    </a>
  </div>
</section>
```

#### Breadcrumb 네비게이션

```html
<!-- 브레드크럼 — 각 페이지 상단 -->
<nav class="breadcrumb" aria-label="breadcrumb">
  <ol class="breadcrumb__list">
    <li class="breadcrumb__item">
      <a href="/" class="breadcrumb__link">홈</a>
    </li>
    <li class="breadcrumb__separator" aria-hidden="true">›</li>
    <li class="breadcrumb__item">
      <a href="/tools/" class="breadcrumb__link">이미지 도구</a>
    </li>
    <li class="breadcrumb__separator" aria-hidden="true">›</li>
    <li class="breadcrumb__item breadcrumb__item--active" aria-current="page">
      이미지 리사이즈
    </li>
  </ol>
</nav>
```

```css
/* Breadcrumb 스타일 — Windows XP 테마 */
.breadcrumb {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #ece9d8;       /* XP 툴바 배경색 */
  border-bottom: 1px solid #aca899;
}

.breadcrumb__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.breadcrumb__item {
  display: inline;
}

.breadcrumb__link {
  color: #0066cc;                   /* XP 링크 색상 */
  text-decoration: none;
}

.breadcrumb__link:hover {
  text-decoration: underline;
}

.breadcrumb__separator {
  margin: 0 4px;
  color: #808080;
}

.breadcrumb__item--active {
  color: #333;
  font-weight: bold;
}
```

---

### 2.4 콘텐츠 SEO

#### FAQ 섹션 (Schema.org FAQPage 마크업)

각 도구 페이지에 FAQ 섹션을 추가하여 검색 결과에 리치 스니펫으로 표시한다.

```html
<!-- FAQ 섹션 + Schema.org FAQPage 구조화 데이터 -->
<section class="tool-faq" id="faq">
  <h2>자주 묻는 질문 (FAQ)</h2>

  <div class="faq-item">
    <h3 class="faq-question">이미지 파일이 서버에 업로드되나요?</h3>
    <div class="faq-answer">
      <p>아니요. ConvertFile은 모든 이미지 처리를 브라우저에서 직접 수행합니다.
         파일이 서버로 전송되지 않으므로 개인정보가 완벽하게 보호됩니다.</p>
    </div>
  </div>

  <div class="faq-item">
    <h3 class="faq-question">지원하는 이미지 포맷은 무엇인가요?</h3>
    <div class="faq-answer">
      <p>JPG(JPEG), PNG, WebP, BMP, GIF, ICO 포맷을 지원합니다.
         브라우저가 지원하는 모든 이미지 포맷을 처리할 수 있습니다.</p>
    </div>
  </div>

  <div class="faq-item">
    <h3 class="faq-question">최대 파일 크기 제한이 있나요?</h3>
    <div class="faq-answer">
      <p>서버 업로드가 없으므로 엄격한 제한은 없습니다. 다만 브라우저 메모리
         제한으로 인해 매우 큰 파일(100MB+)은 처리가 느려질 수 있습니다.</p>
    </div>
  </div>
</section>

<!-- FAQ 구조화 데이터 — 검색 결과 리치 스니펫 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "이미지 파일이 서버에 업로드되나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "아니요. ConvertFile은 모든 이미지 처리를 브라우저에서 직접 수행합니다. 파일이 서버로 전송되지 않으므로 개인정보가 완벽하게 보호됩니다."
      }
    },
    {
      "@type": "Question",
      "name": "지원하는 이미지 포맷은 무엇인가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JPG(JPEG), PNG, WebP, BMP, GIF, ICO 포맷을 지원합니다. 브라우저가 지원하는 모든 이미지 포맷을 처리할 수 있습니다."
      }
    },
    {
      "@type": "Question",
      "name": "최대 파일 크기 제한이 있나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "서버 업로드가 없으므로 엄격한 제한은 없습니다. 다만 브라우저 메모리 제한으로 인해 매우 큰 파일(100MB+)은 처리가 느려질 수 있습니다."
      }
    }
  ]
}
</script>
```

#### 도구별 FAQ 예시 목록

| 도구 | FAQ 질문 예시 (3개+) |
|------|---------------------|
| 리사이즈 | "비율을 유지하면서 크기를 변경할 수 있나요?", "여러 이미지를 한번에 리사이즈할 수 있나요?", "리사이즈 후 화질이 떨어지나요?" |
| 포맷 변환 | "PNG를 JPG로 변환하면 투명 배경은 어떻게 되나요?", "WebP 포맷의 장점은 무엇인가요?", "ICO 파일은 어디에 사용하나요?" |
| 압축 | "압축 후 원본 이미지가 변경되나요?", "손실 압축과 무손실 압축의 차이는?", "어느 정도까지 압축할 수 있나요?" |
| GIF 만들기 | "몇 개의 이미지로 GIF를 만들 수 있나요?", "GIF 프레임 속도를 조절할 수 있나요?", "투명 배경 GIF를 만들 수 있나요?" |
| QR코드 | "QR코드에 로고를 넣을 수 있나요?", "생성된 QR코드에 유효기간이 있나요?", "어떤 내용을 QR코드로 만들 수 있나요?" |

---

### 2.5 Google Search Console 등록 절차

AdSense 심사 전 **반드시** Google Search Console에 사이트를 등록해야 한다.

```
Google Search Console 등록 절차
═══════════════════════════════════════════════════

1. https://search.google.com/search-console 접속
2. "속성 추가" → "URL 접두사" → https://convertfile.com 입력
3. 소유권 확인 방법 (택 1):
   a) HTML 파일 업로드 (권장)
      → google{코드}.html 파일을 프로젝트 루트에 추가
   b) HTML 태그
      → <meta name="google-site-verification" content="..."> 추가
   c) DNS TXT 레코드 (Cloudflare DNS에서 설정)
4. sitemap.xml 제출
   → 사이트맵 메뉴 → https://convertfile.com/sitemap.xml 입력
5. 색인 요청
   → URL 검사 → 각 주요 페이지 URL 입력 → "색인 생성 요청"
```

```html
<!-- Google Search Console 소유권 확인 태그 — <head> 에 추가 -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE">
```

#### Naver Search Advisor 등록 (한국 SEO)

한국 트래픽 확보를 위해 네이버 검색 등록도 병행한다.

```
Naver Search Advisor 등록
═══════════════════════════════════════════════════

1. https://searchadvisor.naver.com 접속
2. 사이트 등록 → https://convertfile.com
3. 소유권 확인
   a) HTML 태그 방식 (권장):
      <meta name="naver-site-verification" content="...">
   b) HTML 파일 업로드 방식
4. sitemap.xml 제출
5. RSS 피드 제출 (블로그 섹션 추가 시)
```

```html
<!-- Naver Search Advisor 소유권 확인 태그 -->
<meta name="naver-site-verification" content="YOUR_NAVER_CODE">
```

---

## 3. 쿠키 동의 배너

### 3.1 GDPR 준수 쿠키 배너 구현 스펙

EU 사용자 대상으로 GDPR 쿠키 동의 배너가 필수이다.
AdSense 사용 시 쿠키 동의 없이 광고 쿠키를 설정하면 **정책 위반**이 된다.

#### 쿠키 분류

| 카테고리 | 설명 | 동의 필요 | 예시 |
|----------|------|-----------|------|
| **필수 쿠키** | 사이트 기본 기능에 필수 | ❌ (사전 동의 불필요) | 쿠키 동의 상태 저장, 테마 설정 |
| **분석 쿠키** | 사용 통계 수집 | ✅ (명시적 동의 필요) | Google Analytics `_ga`, `_gid` |
| **광고 쿠키** | 맞춤형 광고 제공 | ✅ (명시적 동의 필요) | Google AdSense, DoubleClick |

#### 쿠키 배너 HTML

```html
<!-- 쿠키 동의 배너 — Windows XP 다이얼로그 스타일 -->
<div class="cookie-banner xp-window" id="cookie-banner"
     role="dialog" aria-label="쿠키 동의" aria-modal="true"
     style="display: none;">
  <div class="xp-title-bar">
    <span class="xp-title-bar__text">🍪 쿠키 설정</span>
  </div>
  <div class="xp-window__body cookie-banner__body">
    <p class="cookie-banner__text">
      ConvertFile은 사이트 개선을 위해 쿠키를 사용합니다.
      필수 쿠키는 사이트 기능에 필요하며, 분석 및 광고 쿠키는
      선택적입니다.
      <a href="/privacy.html" class="cookie-banner__link">자세히 보기</a>
    </p>

    <!-- 쿠키 카테고리별 동의 토글 -->
    <div class="cookie-banner__options">
      <!-- 필수 쿠키: 항상 활성, 비활성화 불가 -->
      <label class="cookie-option">
        <input type="checkbox" checked disabled>
        <span class="cookie-option__label">필수 쿠키</span>
        <span class="cookie-option__desc">사이트 기본 기능 (항상 활성)</span>
      </label>

      <!-- 분석 쿠키: 기본 비활성 -->
      <label class="cookie-option">
        <input type="checkbox" id="cookie-analytics" value="analytics">
        <span class="cookie-option__label">분석 쿠키</span>
        <span class="cookie-option__desc">사이트 사용 통계 (Google Analytics)</span>
      </label>

      <!-- 광고 쿠키: 기본 비활성 -->
      <label class="cookie-option">
        <input type="checkbox" id="cookie-advertising" value="advertising">
        <span class="cookie-option__label">광고 쿠키</span>
        <span class="cookie-option__desc">맞춤형 광고 (Google AdSense)</span>
      </label>
    </div>

    <!-- 동의 버튼 -->
    <div class="cookie-banner__actions">
      <button class="xp-button" id="cookie-reject-all">
        필수만 허용
      </button>
      <button class="xp-button" id="cookie-save-preferences">
        선택 저장
      </button>
      <button class="xp-button xp-button-primary" id="cookie-accept-all">
        모두 허용
      </button>
    </div>
  </div>
</div>
```

#### 쿠키 동의 관리 JavaScript

```javascript
// js/cookie-consent.js
// 쿠키 동의 배너 관리 모듈
// GDPR + 한국 개인정보보호법 준수

/**
 * 쿠키 동의 매니저
 * - localStorage에 동의 상태 저장
 * - 동의 상태에 따라 Analytics/AdSense 스크립트 로드 제어
 * - 30일 후 재동의 요청 (GDPR 권장)
 */
const CookieConsent = (() => {
  // localStorage 키 이름
  const STORAGE_KEY = 'convertfile_cookie_consent';

  // 동의 만료 기간 (밀리초) — 30일
  const CONSENT_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

  /**
   * 저장된 동의 상태 불러오기
   * @returns {Object|null} 동의 상태 객체 또는 null
   */
  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const consent = JSON.parse(raw);

      // 만료 확인 — 만료 시 null 반환 (재동의 요청)
      if (Date.now() - consent.timestamp > CONSENT_EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return consent;
    } catch (e) {
      return null;
    }
  }

  /**
   * 동의 상태 저장
   * @param {Object} preferences - { analytics: boolean, advertising: boolean }
   */
  function saveConsent(preferences) {
    const consent = {
      analytics: preferences.analytics || false,
      advertising: preferences.advertising || false,
      timestamp: Date.now(),           // 동의 시점 기록
      version: '1.0',                  // 동의 버전 (정책 변경 시 증가)
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

    // 동의에 따라 스크립트 로드
    applyConsent(consent);
  }

  /**
   * 동의 상태에 따라 Analytics/AdSense 로드
   * @param {Object} consent - 동의 상태 객체
   */
  function applyConsent(consent) {
    // 분석 쿠키 동의 → Google Analytics 로드
    if (consent.analytics) {
      loadGoogleAnalytics();
    }

    // 광고 쿠키 동의 → AdSense 로드
    if (consent.advertising) {
      loadAdSense();
    }
  }

  /**
   * Google Analytics 4 스크립트 로드
   */
  function loadGoogleAnalytics() {
    if (document.querySelector('script[src*="gtag"]')) return;

    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', {
        anonymize_ip: true,            // IP 익명화 (GDPR 권장)
        cookie_flags: 'SameSite=None;Secure',
      });
      // 전역 접근용
      window.gtag = gtag;
    };
  }

  /**
   * Google AdSense 스크립트 로드
   */
  function loadAdSense() {
    if (document.querySelector('script[src*="adsbygoogle"]')) return;

    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.adClient = 'ca-pub-XXXXXXXXXXXXXXXX';
    document.head.appendChild(script);
  }

  /**
   * 쿠키 배너 초기화 — 페이지 로드 시 호출
   */
  function init() {
    const consent = getConsent();

    if (consent) {
      // 이미 동의한 사용자 → 배너 숨기고 동의에 따라 로드
      applyConsent(consent);
      return;
    }

    // 미동의 사용자 → 배너 표시
    showBanner();
  }

  /**
   * 쿠키 배너 표시 + 이벤트 핸들러 등록
   */
  function showBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    banner.style.display = 'block';

    // "모두 허용" 버튼
    document.getElementById('cookie-accept-all')
      ?.addEventListener('click', () => {
        saveConsent({ analytics: true, advertising: true });
        banner.style.display = 'none';
      });

    // "필수만 허용" 버튼
    document.getElementById('cookie-reject-all')
      ?.addEventListener('click', () => {
        saveConsent({ analytics: false, advertising: false });
        banner.style.display = 'none';
      });

    // "선택 저장" 버튼
    document.getElementById('cookie-save-preferences')
      ?.addEventListener('click', () => {
        const analytics = document.getElementById('cookie-analytics')?.checked || false;
        const advertising = document.getElementById('cookie-advertising')?.checked || false;
        saveConsent({ analytics, advertising });
        banner.style.display = 'none';
      });
  }

  /**
   * 동의 상태 초기화 (설정에서 사용) — 쿠키 설정 페이지에서 호출
   */
  function resetConsent() {
    localStorage.removeItem(STORAGE_KEY);
    showBanner();
  }

  // 공개 API
  return {
    init,
    getConsent,
    resetConsent,
  };
})();

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', CookieConsent.init);
```

#### 쿠키 배너 CSS

```css
/* 쿠키 동의 배너 스타일 — Windows XP 다이얼로그 */
.cookie-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;                    /* 최상위 레이어 */
  width: 90%;
  max-width: 600px;
  box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
}

.cookie-banner__body {
  padding: 16px;
}

.cookie-banner__text {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.cookie-banner__link {
  color: #0066cc;
}

/* 쿠키 옵션 체크박스 영역 */
.cookie-banner__options {
  margin: 12px 0;
  padding: 8px;
  background: #f5f5f5;
  border: 1px inset #d4d0c8;
}

.cookie-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  cursor: pointer;
}

.cookie-option__label {
  font-weight: bold;
  font-size: 12px;
  min-width: 80px;
}

.cookie-option__desc {
  font-size: 11px;
  color: #666;
}

/* 버튼 영역 */
.cookie-banner__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* 모바일 반응형 */
@media (max-width: 600px) {
  .cookie-banner {
    width: 95%;
    bottom: 10px;
  }

  .cookie-banner__actions {
    flex-direction: column;
  }

  .cookie-banner__actions .xp-button {
    width: 100%;
  }
}
```

---

## 4. 분석 도구

### 4.1 분석 도구 선택

| 도구 | 비용 | 쿠키 사용 | GDPR 영향 | 장점 | 단점 |
|------|------|-----------|-----------|------|------|
| **Cloudflare Web Analytics** | 무료 | ❌ (쿠키리스) | 없음 (쿠키 동의 불필요) | 가장 간단, 같은 인프라 | 기능 제한 |
| **Google Analytics 4** | 무료 | ✅ | 쿠키 동의 필수 | 풍부한 기능, 이벤트 추적 | GDPR 동의 필요 |
| **Plausible / Umami** | 유료/셀프호스팅 | ❌ | 없음 | 프라이버시 중심 | 비용 또는 서버 필요 |

**권장 조합**: Cloudflare Web Analytics (기본) + GA4 (쿠키 동의 후 선택적 로드)

### 4.2 Cloudflare Web Analytics 설정

쿠키를 사용하지 않으므로 GDPR 동의 없이 항상 로드 가능.

```html
<!-- Cloudflare Web Analytics — 모든 페이지 </body> 직전 -->
<!-- 쿠키 미사용, GDPR 동의 불필요 -->
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_CF_ANALYTICS_TOKEN"}'>
</script>
```

설정 절차:
```
Cloudflare Web Analytics 설정
═══════════════════════════════════════════════════

1. Cloudflare 대시보드 로그인
2. Web Analytics 메뉴 선택
3. 사이트 추가 → convertfile.com
4. 제공되는 스크립트 태그 복사
5. 모든 HTML 페이지 </body> 직전에 삽입
6. 배포 후 24시간 내 데이터 수집 시작
```

### 4.3 Google Analytics 4 설정

쿠키 동의 후에만 로드. (3.1절 `CookieConsent` 모듈에서 제어)

```html
<!-- GA4 — 쿠키 동의 후 동적 로드 (cookie-consent.js에서 처리) -->
<!-- 직접 삽입하지 않음! CookieConsent.loadGoogleAnalytics()에서 로드 -->
```

### 4.4 이벤트 추적 설계

사용자 행동을 추적하여 도구 사용 패턴, 인기 도구, 이탈 지점을 분석한다.

#### 추적 이벤트 목록

| 이벤트 이름 | 트리거 | 매개변수 | 설명 |
|-------------|--------|----------|------|
| `tool_view` | 도구 페이지 진입 | `tool_name` | 어떤 도구 페이지를 방문했는지 |
| `file_upload` | 파일 업로드 완료 | `tool_name`, `file_type`, `file_size_kb` | 어떤 도구에서 어떤 파일을 업로드했는지 |
| `tool_execute` | 도구 실행 (변환/리사이즈 등) | `tool_name`, `settings` | 실제 도구 사용 |
| `file_download` | 결과 파일 다운로드 | `tool_name`, `output_type`, `output_size_kb` | 결과물 다운로드 |
| `tool_error` | 도구 실행 중 에러 | `tool_name`, `error_type`, `error_message` | 에러 발생 추적 |
| `ad_impression` | 광고 노출 | `ad_slot`, `page` | 광고 노출 위치 추적 |
| `cookie_consent` | 쿠키 동의 | `analytics`, `advertising` | 동의 현황 추적 |

#### 이벤트 추적 JavaScript

```javascript
// js/analytics.js
// 사이트 이벤트 추적 모듈
// GA4 + Cloudflare Web Analytics 동시 지원

/**
 * 이벤트 추적 매니저
 * GA4가 로드되지 않은 경우에도 에러 없이 동작
 */
const Analytics = (() => {
  /**
   * GA4 이벤트 전송
   * @param {string} eventName - 이벤트 이름
   * @param {Object} params - 이벤트 매개변수
   */
  function trackEvent(eventName, params = {}) {
    // GA4가 로드된 경우에만 전송
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    // 디버그 모드 (개발 환경)
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.log('[Analytics]', eventName, params);
    }
  }

  /**
   * 도구 페이지 진입 추적
   * @param {string} toolName - 도구 이름 (예: 'resize', 'crop')
   */
  function trackToolView(toolName) {
    trackEvent('tool_view', {
      tool_name: toolName,
      page_title: document.title,
    });
  }

  /**
   * 파일 업로드 추적
   * @param {string} toolName - 도구 이름
   * @param {File} file - 업로드된 파일 객체
   */
  function trackFileUpload(toolName, file) {
    trackEvent('file_upload', {
      tool_name: toolName,
      file_type: file.type,                              // MIME 타입
      file_size_kb: Math.round(file.size / 1024),        // KB 단위 크기
      file_extension: file.name.split('.').pop(),        // 확장자
    });
  }

  /**
   * 도구 실행 추적
   * @param {string} toolName - 도구 이름
   * @param {Object} settings - 도구 실행 설정 (예: { width: 800, height: 600 })
   */
  function trackToolExecute(toolName, settings = {}) {
    trackEvent('tool_execute', {
      tool_name: toolName,
      settings: JSON.stringify(settings),
    });
  }

  /**
   * 파일 다운로드 추적
   * @param {string} toolName - 도구 이름
   * @param {string} outputType - 출력 포맷 (예: 'png', 'jpg')
   * @param {number} outputSizeKB - 출력 파일 크기 (KB)
   */
  function trackFileDownload(toolName, outputType, outputSizeKB) {
    trackEvent('file_download', {
      tool_name: toolName,
      output_type: outputType,
      output_size_kb: outputSizeKB,
    });
  }

  /**
   * 에러 추적
   * @param {string} toolName - 도구 이름
   * @param {string} errorType - 에러 유형
   * @param {string} errorMessage - 에러 메시지
   */
  function trackError(toolName, errorType, errorMessage) {
    trackEvent('tool_error', {
      tool_name: toolName,
      error_type: errorType,
      error_message: errorMessage,
    });
  }

  // 공개 API
  return {
    trackEvent,
    trackToolView,
    trackFileUpload,
    trackToolExecute,
    trackFileDownload,
    trackError,
  };
})();
```

---

## 5. 법적 문서 템플릿

### 5.1 About Us 페이지 (`about.html`) 한글 템플릿

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ConvertFile 소개 - 무료 온라인 이미지 편집 도구 | ConvertFile</title>
  <meta name="description"
        content="ConvertFile은 브라우저에서 바로 사용하는 무료 이미지/GIF 편집 도구입니다. 서버 업로드 없이 안전하게 이미지를 편집하세요.">
  <link rel="canonical" href="https://convertfile.com/about.html">
  <link rel="stylesheet" href="/css/xp-theme.css">
</head>
<body>
  <!-- 공통 헤더/네비게이션 -->

  <main class="xp-window about-page">
    <div class="xp-title-bar">
      <span class="xp-title-bar__text">ConvertFile 소개</span>
    </div>
    <div class="xp-window__body">

      <section id="about">
        <h1>ConvertFile 소개</h1>
        <p>
          <strong>ConvertFile</strong>은 브라우저에서 바로 사용할 수 있는
          무료 온라인 이미지·GIF 편집 도구 모음입니다.
        </p>
        <p>
          이미지 리사이즈, 크롭, 포맷 변환, 압축, 필터 적용, GIF 생성 등
          다양한 이미지 편집 기능을 제공합니다. 모든 처리는 사용자의
          브라우저에서 직접 수행되며, 파일이 외부 서버로 전송되지 않습니다.
        </p>
      </section>

      <section id="mission">
        <h2>운영 목적</h2>
        <p>
          ConvertFile의 목표는 누구나 쉽고 안전하게 이미지를 편집할 수 있는
          환경을 제공하는 것입니다. 회원가입, 소프트웨어 설치, 파일 업로드
          없이도 전문적인 이미지 편집 기능을 무료로 이용할 수 있습니다.
        </p>
        <ul>
          <li><strong>무료 사용</strong> — 모든 도구를 무료로 제한 없이 사용</li>
          <li><strong>개인정보 보호</strong> — 파일이 서버에 업로드되지 않음</li>
          <li><strong>설치 불필요</strong> — 웹 브라우저만 있으면 바로 사용</li>
          <li><strong>빠른 처리</strong> — 브라우저에서 직접 처리하여 대기 시간 최소화</li>
        </ul>
      </section>

      <section id="technology">
        <h2>기술 소개</h2>
        <p>
          ConvertFile은 HTML5 Canvas API, Web Workers 등 최신 웹 기술을
          활용하여 모든 이미지 처리를 클라이언트 사이드에서 수행합니다.
          서버에 파일을 전송하지 않으므로 개인정보가 완벽하게 보호되며,
          인터넷 연결이 불안정한 환경에서도 안정적으로 동작합니다.
        </p>
      </section>

      <section id="operator">
        <h2>운영자 정보</h2>
        <table class="xp-table">
          <tr>
            <th>사이트명</th>
            <td>ConvertFile</td>
          </tr>
          <tr>
            <th>운영자</th>
            <td>[운영자 이름]</td>
          </tr>
          <tr>
            <th>이메일</th>
            <td><a href="mailto:contact@convertfile.com">contact@convertfile.com</a></td>
          </tr>
          <tr>
            <th>문의</th>
            <td><a href="/contact.html">문의하기 페이지</a></td>
          </tr>
        </table>
      </section>

    </div>
  </main>

  <!-- 공통 푸터 -->
</body>
</html>
```

---

### 5.2 개인정보처리방침 (`privacy.html`) 한글 템플릿

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>개인정보처리방침 | ConvertFile</title>
  <meta name="description"
        content="ConvertFile의 개인정보처리방침입니다. 쿠키 정책, 데이터 수집, 이용자 권리에 대해 안내합니다.">
  <link rel="canonical" href="https://convertfile.com/privacy.html">
  <link rel="stylesheet" href="/css/xp-theme.css">
</head>
<body>
  <main class="xp-window privacy-page">
    <div class="xp-title-bar">
      <span class="xp-title-bar__text">개인정보처리방침</span>
    </div>
    <div class="xp-window__body legal-document">

      <h1>개인정보처리방침</h1>
      <p class="legal-date">시행일: 2026년 6월 7일 | 최종 수정: 2026년 6월 7일</p>

      <p>
        ConvertFile(이하 "사이트")은 이용자의 개인정보를 중요시하며,
        「개인정보 보호법」 및 EU 일반 데이터 보호 규정(GDPR)을 준수합니다.
        본 개인정보처리방침은 사이트가 수집하는 정보, 이용 목적,
        이용자의 권리에 대해 설명합니다.
      </p>

      <!-- 1. 수집하는 개인정보 -->
      <h2>1. 수집하는 개인정보 항목</h2>

      <h3>1.1 직접 수집 정보</h3>
      <p>
        ConvertFile은 이미지 편집 도구를 제공하는 정적 웹사이트로,
        <strong>사용자의 파일을 서버에 업로드하거나 저장하지 않습니다.</strong>
        모든 이미지 처리는 사용자의 브라우저(클라이언트)에서 수행됩니다.
      </p>
      <p>문의 폼(contact.html)을 통해 자발적으로 제공한 정보:</p>
      <ul>
        <li>이름</li>
        <li>이메일 주소</li>
        <li>문의 내용</li>
      </ul>

      <h3>1.2 자동 수집 정보</h3>
      <p>사이트 방문 시 아래 정보가 자동으로 수집될 수 있습니다:</p>
      <table class="xp-table">
        <thead>
          <tr>
            <th>수집 항목</th>
            <th>수집 주체</th>
            <th>목적</th>
            <th>동의 필요</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>페이지 조회수, 방문 시간</td>
            <td>Cloudflare Web Analytics</td>
            <td>사이트 이용 통계</td>
            <td>❌ (쿠키 미사용)</td>
          </tr>
          <tr>
            <td>IP 주소 (익명화), 브라우저 정보, 방문 페이지</td>
            <td>Google Analytics 4</td>
            <td>사이트 이용 분석</td>
            <td>✅ (쿠키 동의 필요)</td>
          </tr>
          <tr>
            <td>광고 관심사, 쿠키 식별자</td>
            <td>Google AdSense</td>
            <td>맞춤형 광고 제공</td>
            <td>✅ (쿠키 동의 필요)</td>
          </tr>
        </tbody>
      </table>

      <!-- 2. 개인정보 이용 목적 -->
      <h2>2. 개인정보 이용 목적</h2>
      <ul>
        <li>사이트 이용 통계 분석 및 서비스 개선</li>
        <li>사용자 문의 응대</li>
        <li>광고 게재 (Google AdSense)</li>
      </ul>

      <!-- 3. 개인정보 보유 기간 -->
      <h2>3. 개인정보 보유 기간</h2>
      <ul>
        <li>문의 폼 데이터: 문의 처리 완료 후 6개월간 보관 후 파기</li>
        <li>쿠키 데이터: 쿠키 만료일까지 (최대 2년)</li>
        <li>분석 데이터: Google Analytics 보관 정책에 따름 (기본 14개월)</li>
      </ul>

      <!-- 4. 쿠키 정책 -->
      <h2>4. 쿠키 정책</h2>

      <h3>4.1 쿠키란?</h3>
      <p>
        쿠키는 웹사이트가 사용자의 브라우저에 저장하는 작은 텍스트 파일입니다.
        사이트 기능 개선, 사용 통계 수집, 맞춤형 광고 제공에 사용됩니다.
      </p>

      <h3>4.2 사용하는 쿠키</h3>
      <table class="xp-table">
        <thead>
          <tr>
            <th>카테고리</th>
            <th>쿠키 이름</th>
            <th>제공자</th>
            <th>목적</th>
            <th>만료</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>필수</td>
            <td>convertfile_cookie_consent</td>
            <td>ConvertFile</td>
            <td>쿠키 동의 상태 저장</td>
            <td>30일</td>
          </tr>
          <tr>
            <td>분석</td>
            <td>_ga, _gid</td>
            <td>Google Analytics</td>
            <td>방문자 통계</td>
            <td>2년 / 24시간</td>
          </tr>
          <tr>
            <td>광고</td>
            <td>__gads, __gpi</td>
            <td>Google AdSense</td>
            <td>맞춤형 광고</td>
            <td>13개월</td>
          </tr>
          <tr>
            <td>광고</td>
            <td>IDE, DSID</td>
            <td>DoubleClick (Google)</td>
            <td>광고 타겟팅</td>
            <td>1년 / 2주</td>
          </tr>
        </tbody>
      </table>

      <h3>4.3 쿠키 관리</h3>
      <p>
        사이트 첫 방문 시 쿠키 동의 배너를 통해 분석·광고 쿠키 사용 여부를
        선택할 수 있습니다. 또한 브라우저 설정에서 쿠키를 삭제하거나
        차단할 수 있습니다.
      </p>
      <p>
        <button onclick="CookieConsent.resetConsent()" class="xp-button">
          쿠키 설정 변경하기
        </button>
      </p>

      <!-- 5. 제3자 제공 -->
      <h2>5. 제3자 제공</h2>
      <p>사이트는 아래 제3자 서비스를 이용하며, 해당 서비스의 개인정보처리방침이 적용됩니다:</p>
      <ul>
        <li><strong>Google Analytics</strong>:
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
            Google 개인정보처리방침</a></li>
        <li><strong>Google AdSense</strong>:
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">
            Google 광고 정책</a></li>
        <li><strong>Cloudflare</strong>:
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">
            Cloudflare 개인정보처리방침</a></li>
        <li><strong>Formspree</strong> (문의 폼):
          <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener">
            Formspree 개인정보처리방침</a></li>
      </ul>

      <!-- 6. 이용자 권리 -->
      <h2>6. 이용자의 권리</h2>
      <p>이용자는 다음과 같은 권리를 행사할 수 있습니다:</p>
      <ul>
        <li><strong>열람권</strong>: 수집된 개인정보 확인 요청</li>
        <li><strong>정정·삭제권</strong>: 부정확한 정보 수정 또는 삭제 요청</li>
        <li><strong>동의 철회권</strong>: 쿠키 동의를 언제든 철회 가능</li>
        <li><strong>이의 제기권</strong> (GDPR): 개인정보 처리에 대한 이의 제기</li>
        <li><strong>이동권</strong> (GDPR): 개인정보를 구조화된 형식으로 수령 요청</li>
      </ul>
      <p>
        권리 행사를 원하시면
        <a href="mailto:contact@convertfile.com">contact@convertfile.com</a>으로
        연락해 주세요.
      </p>

      <!-- 7. GDPR 관련 (EU 사용자) -->
      <h2>7. EU 사용자 (GDPR)</h2>
      <p>
        유럽 경제 지역(EEA)에 거주하는 사용자에게는 EU 일반 데이터 보호
        규정(GDPR)이 적용됩니다. 본 사이트는 분석·광고 쿠키에 대해
        사전 동의(opt-in)를 받으며, 동의 없이는 해당 쿠키를 설정하지 않습니다.
      </p>
      <p>
        GDPR에 따른 추가 권리(잊힐 권리, 처리 제한권 등)는
        위 이메일로 요청해 주시기 바랍니다.
      </p>

      <!-- 8. 한국 개인정보보호법 -->
      <h2>8. 한국 개인정보보호법</h2>
      <p>
        대한민국 「개인정보 보호법」에 따라 개인정보보호 책임자를 지정합니다.
      </p>
      <table class="xp-table">
        <tr>
          <th>개인정보보호 책임자</th>
          <td>[책임자 이름]</td>
        </tr>
        <tr>
          <th>이메일</th>
          <td><a href="mailto:privacy@convertfile.com">privacy@convertfile.com</a></td>
        </tr>
      </table>

      <!-- 9. 변경 이력 -->
      <h2>9. 변경 이력</h2>
      <table class="xp-table">
        <thead>
          <tr>
            <th>버전</th>
            <th>시행일</th>
            <th>변경 내용</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1.0</td>
            <td>2026.06.07</td>
            <td>최초 제정</td>
          </tr>
        </tbody>
      </table>

    </div>
  </main>
</body>
</html>
```

---

### 5.3 이용약관 (`terms.html`) 한글 템플릿

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>이용약관 | ConvertFile</title>
  <meta name="description"
        content="ConvertFile 서비스 이용약관입니다. 서비스 이용 조건, 면책 조항, 지적재산권 안내.">
  <link rel="canonical" href="https://convertfile.com/terms.html">
  <link rel="stylesheet" href="/css/xp-theme.css">
</head>
<body>
  <main class="xp-window terms-page">
    <div class="xp-title-bar">
      <span class="xp-title-bar__text">이용약관</span>
    </div>
    <div class="xp-window__body legal-document">

      <h1>이용약관</h1>
      <p class="legal-date">시행일: 2026년 6월 7일 | 최종 수정: 2026년 6월 7일</p>

      <!-- 제1조 -->
      <h2>제1조 (목적)</h2>
      <p>
        본 약관은 ConvertFile(이하 "사이트")이 제공하는 온라인 이미지 편집
        서비스(이하 "서비스")의 이용 조건 및 절차, 이용자와 사이트의
        권리·의무 및 책임사항을 규정함을 목적으로 합니다.
      </p>

      <!-- 제2조 -->
      <h2>제2조 (서비스 정의)</h2>
      <p>사이트는 다음과 같은 서비스를 제공합니다:</p>
      <ul>
        <li>이미지 리사이즈, 크롭, 회전, 뒤집기</li>
        <li>이미지 포맷 변환 (JPG, PNG, WebP, BMP, ICO)</li>
        <li>이미지 압축 및 최적화</li>
        <li>이미지 필터 및 효과 적용</li>
        <li>GIF 생성, 편집, 최적화</li>
        <li>QR코드 생성</li>
        <li>기타 이미지 관련 도구</li>
      </ul>
      <p>
        모든 서비스는 사용자의 웹 브라우저에서 실행되며, 파일이
        사이트 서버로 업로드되지 않습니다.
      </p>

      <!-- 제3조 -->
      <h2>제3조 (이용 조건)</h2>
      <ol>
        <li>서비스는 별도의 회원가입 없이 무료로 이용할 수 있습니다.</li>
        <li>서비스 이용에 별도의 소프트웨어 설치가 필요하지 않습니다.</li>
        <li>서비스는 개인적 목적 및 상업적 목적 모두에 사용할 수 있습니다.</li>
        <li>서비스 이용 시 본 약관에 동의한 것으로 간주합니다.</li>
      </ol>

      <!-- 제4조 -->
      <h2>제4조 (사용자 의무)</h2>
      <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
      <ol>
        <li>불법적인 콘텐츠(아동 착취물, 저작권 침해물 등)의 처리에
            서비스를 이용하는 행위</li>
        <li>사이트의 정상적인 운영을 방해하는 행위
            (과도한 자동화 요청, DDoS 등)</li>
        <li>타인의 권리를 침해하는 목적으로 서비스를 이용하는 행위</li>
        <li>사이트의 코드, 디자인, 콘텐츠를 무단으로 복제·배포하는 행위</li>
        <li>광고 클릭 조작, 광고 코드 무단 수정 등 광고 정책 위반 행위</li>
      </ol>

      <!-- 제5조 -->
      <h2>제5조 (지적재산권)</h2>
      <ol>
        <li><strong>사이트 콘텐츠</strong>: 사이트의 디자인, 코드, 텍스트,
            아이콘 등 콘텐츠에 대한 지적재산권은 사이트 운영자에게 있습니다.</li>
        <li><strong>사용자 파일</strong>: 사용자가 서비스를 통해 처리하는
            이미지 파일에 대한 모든 권리는 사용자에게 있습니다.
            사이트는 사용자 파일에 대한 어떠한 권리도 주장하지 않습니다.</li>
        <li><strong>오픈소스</strong>: 사이트에서 사용하는 오픈소스
            라이브러리는 각각의 라이선스를 따릅니다.</li>
      </ol>

      <!-- 제6조 -->
      <h2>제6조 (면책 조항)</h2>
      <ol>
        <li><strong>파일 손상/손실</strong>: 서비스 이용 중 발생하는
            파일 손상 또는 데이터 손실에 대해 사이트는 책임을 지지 않습니다.
            중요한 파일은 반드시 사전에 백업해 주시기 바랍니다.</li>
        <li><strong>결과물 품질</strong>: 서비스의 이미지 처리 결과물에
            대한 품질을 보증하지 않습니다. 결과물은 브라우저 및
            시스템 환경에 따라 달라질 수 있습니다.</li>
        <li><strong>서비스 중단</strong>: 사이트는 서버 장애, 보안,
            기타 운영상의 이유로 사전 통지 없이 서비스를 일시 중단하거나
            종료할 수 있습니다.</li>
        <li><strong>제3자 서비스</strong>: 사이트에 포함된 광고, 외부 링크 등
            제3자 서비스에 의한 손해에 대해 책임을 지지 않습니다.</li>
      </ol>

      <!-- 제7조 -->
      <h2>제7조 (광고)</h2>
      <p>
        사이트는 Google AdSense를 통해 광고를 게재합니다. 광고 내용은
        Google의 광고 정책에 의해 결정되며, 사이트 운영자가 개별 광고
        내용을 통제하지 않습니다. 광고에 대한 책임은 해당 광고주에게 있습니다.
      </p>

      <!-- 제8조 -->
      <h2>제8조 (서비스 변경 및 종료)</h2>
      <ol>
        <li>사이트는 서비스의 내용을 변경하거나 새로운 기능을 추가·제거할 수
            있습니다.</li>
        <li>서비스의 전부 또는 일부를 종료할 경우, 사이트에 공지합니다.</li>
      </ol>

      <!-- 제9조 -->
      <h2>제9조 (약관 변경)</h2>
      <p>
        본 약관은 사이트의 사정에 따라 변경될 수 있습니다. 변경 시 사이트에
        공지하며, 변경된 약관은 공지일로부터 7일 후 적용됩니다.
      </p>

      <!-- 제10조 -->
      <h2>제10조 (분쟁 해결)</h2>
      <ol>
        <li>본 약관은 대한민국 법률에 따라 해석됩니다.</li>
        <li>서비스 이용과 관련하여 발생한 분쟁은 대한민국 법원을
            관할법원으로 합니다.</li>
      </ol>

      <!-- 변경 이력 -->
      <h2>변경 이력</h2>
      <table class="xp-table">
        <thead>
          <tr>
            <th>버전</th>
            <th>시행일</th>
            <th>변경 내용</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1.0</td>
            <td>2026.06.07</td>
            <td>최초 제정</td>
          </tr>
        </tbody>
      </table>

    </div>
  </main>
</body>
</html>
```

---

## 부록: 파일 체크리스트

구현 시 생성해야 할 파일 목록:

```
프로젝트 루트
├── ads.txt                          AdSense ads.txt (승인 후)
├── robots.txt                       검색엔진 크롤링 설정
├── sitemap.xml                      사이트맵
├── 404.html                         404 에러 페이지
├── about.html                       사이트 소개
├── privacy.html                     개인정보처리방침
├── terms.html                       이용약관
├── contact.html                     문의하기
├── js/
│   ├── cookie-consent.js            쿠키 동의 관리
│   └── analytics.js                 이벤트 추적
├── scripts/
│   └── generate-sitemap.js          sitemap 자동 생성
└── images/
    └── og/                          Open Graph 이미지
        ├── default.png              기본 OG 이미지 (1200×630)
        ├── resize-tool.png          도구별 OG 이미지
        ├── crop-tool.png
        └── ...
```

---

## 부록: OG 이미지 사양

Open Graph 이미지는 SNS 공유 시 썸네일로 표시된다.

| 항목 | 사양 |
|------|------|
| 크기 | 1200 × 630 px |
| 포맷 | PNG 또는 JPG |
| 파일 크기 | 300KB 이하 |
| 내용 | 도구 이름 + ConvertFile 로고 + 도구 미리보기 스크린샷 |
| 경로 | `/images/og/{도구명}-tool.png` |

---

> **📌 문서 버전**: v1.0
> **최종 수정**: 2026-06-07
> **담당**: SEO & Content 에이전트

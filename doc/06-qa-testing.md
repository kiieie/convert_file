# 🧪 ConvertFile — QA & 테스트 전략

> Windows XP 테마 이미지/GIF 편집기의 품질 보증 및 테스트 가이드
> Phase 1~3: 수동 테스트 · Phase 4: 자동화 도입

---

## 목차

1. [테스트 전략](#1-테스트-전략)
2. [브라우저 호환성](#2-브라우저-호환성)
3. [기능별 테스트 케이스](#3-기능별-테스트-케이스)
4. [성능 기준](#4-성능-기준)
5. [접근성 (Accessibility)](#5-접근성-accessibility)
6. [보안 체크리스트](#6-보안-체크리스트)
7. [에러 처리 가이드](#7-에러-처리-가이드)
8. [테스트 데이터 세트](#8-테스트-데이터-세트)
9. [릴리스 체크리스트](#9-릴리스-체크리스트)

---

## 1. 테스트 전략

### 1.1 테스트 접근 방식

| 단계 | 방식 | 설명 |
|------|------|------|
| **Phase 1~3** | 수동 테스트 | 브라우저에서 직접 기능 확인, 체크리스트 기반 |
| **Phase 4** | 자동화 테스트 | Playwright/Puppeteer 기반 E2E 테스트 도입 |

```
테스트 피라미드 (Phase 4 최종 목표):

    ┌──────────┐
    │  E2E     │  ← Playwright (브라우저 자동화)
    │  테스트   │     파일 업로드 → 처리 → 다운로드 흐름
    ├──────────┤
    │  통합     │  ← 모듈 간 연동 테스트
    │  테스트   │     Canvas + Worker + UI 연동
    ├──────────┤
    │  단위     │  ← Jest/Vitest
    │  테스트   │     유틸리티 함수, 변환 로직
    └──────────┘

Phase 1~3 현재:
    ┌────────────────────────────────┐
    │  수동 테스트 체크리스트         │
    │  + 브라우저 DevTools 검증      │
    │  + Lighthouse 점수 확인        │
    └────────────────────────────────┘
```

### 1.2 수동 테스트 체크리스트 (매 배포 전 실행)

#### 기본 동작 체크리스트

| # | 항목 | 확인 방법 | Pass/Fail |
|---|------|----------|-----------|
| 1 | 메인 페이지 로딩 | `https://convertfile.pages.dev` 접속 | ☐ |
| 2 | Windows XP 테마 렌더링 | 제목표시줄, 버튼, 창 테두리 시각 확인 | ☐ |
| 3 | 네비게이션 동작 | 모든 도구 링크 클릭 → 해당 페이지 이동 | ☐ |
| 4 | 시작 메뉴 동작 | 시작 버튼 클릭 → 메뉴 표시/숨김 | ☐ |
| 5 | 파일 업로드 (드래그 앤 드롭) | 이미지 파일 드래그 → 업로드 영역 드롭 | ☐ |
| 6 | 파일 업로드 (클릭) | "파일 선택" 버튼 → 파일 선택 다이얼로그 | ☐ |
| 7 | 이미지 미리보기 | 업로드 후 원본 이미지 표시 확인 | ☐ |
| 8 | 도구 설정 UI | 슬라이더, 입력 필드, 드롭다운 동작 확인 | ☐ |
| 9 | 처리 실행 | "변환" / "적용" 버튼 → 처리 시작 | ☐ |
| 10 | 진행률 표시 | 처리 중 프로그레스 바 또는 로딩 표시 확인 | ☐ |
| 11 | 결과 미리보기 | 처리 완료 후 결과 이미지 표시 | ☐ |
| 12 | 다운로드 동작 | "저장" 버튼 → 파일 다운로드 | ☐ |
| 13 | 다운로드 파일명 | `convertfile_[도구명]_[타임스탬프].[확장자]` 형식 확인 | ☐ |
| 14 | 반응형 레이아웃 | DevTools → 모바일 뷰포트 (375px, 768px) 확인 | ☐ |
| 15 | 광고 영역 표시 | AdSense 슬롯 영역 존재 확인 (빈 영역이라도 레이아웃 유지) | ☐ |

#### 페이지별 체크리스트

| # | 페이지 | URL 경로 | 확인 항목 | Pass/Fail |
|---|--------|---------|----------|-----------|
| 1 | 메인 | `/` | 도구 목록 표시, 카테고리 분류 | ☐ |
| 2 | About | `/about.html` | 내용 표시, 레이아웃 정상 | ☐ |
| 3 | 개인정보처리방침 | `/privacy.html` | 전문 표시, 스크롤 정상 | ☐ |
| 4 | 이용약관 | `/terms.html` | 전문 표시, 스크롤 정상 | ☐ |
| 5 | 문의/연락처 | `/contact.html` | 이메일 링크 동작 | ☐ |
| 6 | 404 페이지 | `/nonexistent` | XP 에러 다이얼로그 스타일 표시 | ☐ |

### 1.3 테스트 환경

```
개발 환경:
├── 로컬 서버: VS Code Live Server (localhost:5500)
├── 브라우저 DevTools: 콘솔 에러 0건 확인
├── Lighthouse: 각 카테고리 90+ 목표
└── 네트워크 쓰로틀링: "Fast 3G" 모드로 저속 환경 테스트

스테이징 환경:
├── Cloudflare Pages Preview (PR별 자동 배포)
└── URL: https://<branch>.<project>.pages.dev

프로덕션 환경:
├── Cloudflare Pages Production
└── URL: https://convertfile.pages.dev
```

---

## 2. 브라우저 호환성

### 2.1 지원 브라우저 매트릭스

#### Tier 1 — 완전 지원 (모든 기능 동작 보장)

| 브라우저 | 최소 버전 | 엔진 | 비고 |
|----------|----------|------|------|
| **Chrome** | 90+ | Blink | 주 개발/테스트 브라우저 |
| **Edge** | 90+ | Blink (Chromium) | Chrome과 동일 엔진 |
| **Firefox** | 88+ | Gecko | `OffscreenCanvas` 지원 확인 필요 |

#### Tier 2 — 부분 지원 (핵심 기능 동작, 일부 제한)

| 브라우저 | 최소 버전 | 엔진 | 제한 사항 |
|----------|----------|------|----------|
| **Safari** | 15+ | WebKit | WebP 인코딩 제한, SharedArrayBuffer 조건부 |
| **iOS Safari** | 15+ | WebKit | 터치 이벤트 별도 처리, 파일 API 제한 |
| **Chrome Android** | 90+ | Blink | 메모리 제한 (대용량 파일 처리 주의) |

#### Tier 3 — 미지원

| 브라우저 | 사유 |
|----------|------|
| IE 11 | ES6+ 미지원, Canvas API 불완전 |
| Opera Mini | JavaScript 실행 제한 |
| Samsung Internet < 15 | 구버전 Chromium 기반 |

### 2.2 기능별 브라우저 호환성 매트릭스

| 기능 | Chrome 90+ | Firefox 88+ | Safari 15+ | Edge 90+ | iOS Safari | Chrome Android |
|------|:----------:|:-----------:|:----------:|:--------:|:----------:|:--------------:|
| Canvas 2D API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `canvas.toBlob()` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WebP 인코딩 (`toBlob('image/webp')`) | ✅ | ✅ | ⚠️ 16.4+ | ✅ | ⚠️ 16.4+ | ✅ |
| AVIF 인코딩 | ⚠️ 실험적 | ❌ | ❌ | ⚠️ 실험적 | ❌ | ⚠️ 실험적 |
| Web Workers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `OffscreenCanvas` | ✅ | ✅ 105+ | ❌ | ✅ | ❌ | ✅ |
| SharedArrayBuffer | ✅ | ✅ | ⚠️ 조건부 | ✅ | ⚠️ 조건부 | ✅ |
| File API (FileReader) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop API | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `<input type="file">` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `URL.createObjectURL()` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `<a download>` | ✅ | ✅ | ✅ | ✅ | ⚠️ 제한적 | ✅ |
| Clipboard API (이미지 붙여넣기) | ✅ | ✅ 87+ | ✅ | ✅ | ⚠️ | ⚠️ |
| ffmpeg.wasm | ✅ | ✅ | ⚠️ COOP/COEP 필요 | ✅ | ❌ 불안정 | ⚠️ 메모리 제한 |
| `structuredClone()` | ✅ | ✅ | ✅ 15.4+ | ✅ | ✅ 15.4+ | ✅ |
| CSS `backdrop-filter` | ✅ | ✅ 103+ | ✅ | ✅ | ✅ | ✅ |

> **범례**: ✅ 완전 지원 · ⚠️ 조건부/제한 · ❌ 미지원

### 2.3 ffmpeg.wasm 브라우저 요구사항

ffmpeg.wasm은 `SharedArrayBuffer`를 필수로 사용하며, 이를 위해 **보안 헤더**가 반드시 설정되어야 함.

#### 필수 HTTP 헤더 (COOP/COEP)

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

#### Cloudflare Pages `_headers` 파일 설정

```
# 파일 위치: /public/_headers (또는 루트 _headers)

# ffmpeg.wasm 사용 페이지에만 적용
/tools/video-to-gif*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp

/tools/gif-to-video*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

#### COOP/COEP 영향 범위

| 항목 | 영향 |
|------|------|
| Google AdSense | ⚠️ COEP 하에서 로딩 실패 가능 → `credentialless` 모드 또는 광고 제외 |
| 외부 이미지 로딩 | `crossorigin` 속성 필수 |
| 외부 스크립트 (CDN) | `crossorigin="anonymous"` 필수 |
| Google Analytics | COEP 호환 여부 확인 필요 |

#### 대응 전략

```javascript
// ffmpeg.wasm 페이지 진입 시 SharedArrayBuffer 지원 확인
// ffmpeg.wasm이 필요한 페이지에서 사용
function checkFFmpegSupport() {
  const supported = typeof SharedArrayBuffer !== 'undefined';

  if (!supported) {
    // Windows XP 스타일 에러 다이얼로그 표시
    showXPErrorDialog({
      title: '기능 제한',
      icon: 'warning',
      message: '이 브라우저에서는 비디오 변환 기능을 사용할 수 없습니다.\n'
             + 'Chrome, Edge, Firefox 최신 버전을 사용해 주세요.',
      buttons: ['확인']
    });
    return false;
  }
  return true;
}
```

### 2.4 Canvas API 호환성 이슈

| 이슈 | 영향 브라우저 | 대응 방법 |
|------|-------------|----------|
| `toBlob('image/webp')` 미지원 | Safari < 16.4 | PNG로 폴백, 사용자에게 안내 메시지 |
| `canvas.toDataURL()` 메모리 제한 | 모바일 전체 | 큰 이미지는 `toBlob()` 사용 |
| CORS 오염된 Canvas | 외부 이미지 로딩 시 | `crossorigin` 속성 + 프록시 불가(정적 사이트) |
| `drawImage()` 최대 해상도 | iOS Safari | 4096×4096 제한 → 리사이즈 경고 |
| `getImageData()` 성능 | Firefox | 큰 이미지에서 느림 → Web Worker 위임 |
| `ImageData` 생성자 | IE 11 | 미지원 (Tier 3이므로 무시) |

### 2.5 Web Worker 지원 확인

```javascript
// Worker 지원 확인 및 폴백 패턴
// Worker 미지원 시 메인 스레드에서 직접 처리
function createImageWorker(scriptPath) {
  if (typeof Worker !== 'undefined') {
    return new Worker(scriptPath);
  }

  // 폴백: 메인 스레드에서 처리 (UI 블록 가능)
  console.warn('Web Worker 미지원. 메인 스레드에서 처리합니다.');
  return {
    postMessage: (data) => {
      // 동기 처리 폴백 로직
      const result = processImageSync(data);
      this.onmessage?.({ data: result });
    },
    terminate: () => {}
  };
}
```

### 2.6 브라우저 테스트 실행 가이드

각 브라우저에서 아래 순서로 테스트 실행:

```
1. 메인 페이지 로딩 → Windows XP 테마 렌더링 확인
2. DevTools 콘솔 열기 → 에러/경고 0건 확인
3. 이미지 업로드 (JPG 1MB) → 미리보기 표시 확인
4. 리사이즈 도구 → 50% 축소 → 다운로드 → 파일 크기 감소 확인
5. 포맷 변환 → JPG → PNG → 다운로드 → 확장자/파일 확인
6. GIF 도구 (Phase 2) → GIF 업로드 → 프레임 추출 확인
7. 반응형: DevTools에서 375px, 768px, 1024px 뷰포트 전환
8. 네트워크 탭 → 404 요청 0건 확인
9. Lighthouse 실행 → Performance 90+, Accessibility 90+
```

---

## 3. 기능별 테스트 케이스

### 3.1 공통 테스트 패턴

모든 도구는 아래 공통 플로우를 따름:

```
[파일 업로드] → [미리보기] → [설정 조정] → [처리 실행] → [결과 미리보기] → [다운로드]
     │              │            │              │               │              │
     ▼              ▼            ▼              ▼               ▼              ▼
  검증:           검증:        검증:          검증:           검증:          검증:
  - 포맷 체크    - 렌더링    - 범위 제한    - 진행률       - 품질 확인    - 파일 저장
  - 크기 체크    - 크기 표시  - 기본값      - 에러 처리    - 크기 표시    - 파일명
  - 중복 업로드  - 정보 표시  - 실시간 반영  - 타임아웃     - 비교 뷰     - 올바른 포맷
```

### 3.2 이미지 리사이즈 도구

#### 정상 케이스

| TC-ID | 테스트 케이스 | 입력 | 동작 | 기대 결과 |
|-------|-------------|------|------|----------|
| RS-001 | 비율 유지 리사이즈 | 1920×1080 JPG | 너비 960 입력, 비율 잠금 ON | 960×540 이미지 출력 |
| RS-002 | 자유 리사이즈 | 1920×1080 JPG | 800×600 입력, 비율 잠금 OFF | 800×600 이미지 출력 |
| RS-003 | 퍼센트 리사이즈 | 2000×2000 PNG | 50% 선택 | 1000×1000 이미지 출력 |
| RS-004 | 확대 리사이즈 | 100×100 PNG | 200% 선택 | 200×200 이미지 출력 |
| RS-005 | WebP 리사이즈 | 1280×720 WebP | 너비 640 | 640×360 WebP 출력 |
| RS-006 | 투명 배경 보존 | 500×500 PNG (투명) | 너비 250 | 250×250 PNG, 투명 배경 유지 |

#### 예외 케이스

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| RS-E01 | 지원하지 않는 포맷 | `.psd` 파일 업로드 | XP 에러 다이얼로그: "지원하지 않는 파일 형식입니다" |
| RS-E02 | 0바이트 파일 | 빈 `.jpg` 파일 | XP 에러 다이얼로그: "파일이 손상되었거나 비어 있습니다" |
| RS-E03 | 손상된 파일 | 확장자만 `.jpg`인 텍스트 파일 | XP 에러 다이얼로그: "이미지를 읽을 수 없습니다" |
| RS-E04 | 너비/높이에 0 입력 | 너비: 0, 높이: 0 | 입력 필드 빨간 테두리, "1 이상 입력하세요" |
| RS-E05 | 너비/높이에 음수 | 너비: -100 | 입력 필드 빨간 테두리, "양수만 입력 가능합니다" |
| RS-E06 | 너비/높이에 문자 | 너비: "abc" | 입력 무시, 숫자만 허용 |
| RS-E07 | 50MB 초과 파일 | 60MB JPG | XP 에러 다이얼로그: "파일 크기가 너무 큽니다 (최대 50MB)" |

#### 경계값 테스트

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| RS-B01 | 1×1 이미지 | 1×1 PNG | 리사이즈 동작 (최소 1×1 유지) |
| RS-B02 | 최대 해상도 | 10000×10000 PNG | 경고 메시지 후 처리 (또는 4096×4096 제한 안내) |
| RS-B03 | 너비 1px | 1920×1080 → 너비 1 | 1×1 출력 (비율 유지 시) |
| RS-B04 | 99999px 입력 | 너비: 99999 | 최대 10000px 제한 경고 |
| RS-B05 | 소수점 입력 | 너비: 100.5 | 반올림하여 101px 또는 정수만 허용 |

#### UI 확인

| TC-ID | 항목 | 기대 동작 |
|-------|------|----------|
| RS-U01 | 비율 잠금 토글 | 🔒 아이콘 클릭 시 잠금/해제 전환, 시각적 피드백 |
| RS-U02 | 너비 입력 시 높이 자동 계산 | 비율 잠금 ON → 너비 변경 → 높이 자동 업데이트 |
| RS-U03 | "원본 크기" 버튼 | 클릭 시 원래 해상도로 복원 |
| RS-U04 | 프리셋 버튼 | "HD(1280×720)", "FHD(1920×1080)" 등 클릭 시 자동 입력 |
| RS-U05 | 처리 중 버튼 비활성화 | 처리 중 "적용" 버튼 disabled + 로딩 스피너 |

### 3.3 이미지 크롭 도구

#### 정상 케이스

| TC-ID | 테스트 케이스 | 입력 | 동작 | 기대 결과 |
|-------|-------------|------|------|----------|
| CR-001 | 자유 영역 크롭 | 1920×1080 JPG | 마우스로 영역 드래그 | 선택 영역만 잘린 이미지 출력 |
| CR-002 | 비율 고정 크롭 | 1920×1080 JPG | 1:1 비율 선택, 영역 드래그 | 정사각형 이미지 출력 |
| CR-003 | 16:9 비율 크롭 | 2000×2000 PNG | 16:9 비율 선택 | 16:9 비율 이미지 출력 |
| CR-004 | 좌표 입력 크롭 | 1000×1000 PNG | X:100 Y:100 W:500 H:500 | 500×500 이미지, (100,100)부터 잘림 |
| CR-005 | 투명 배경 크롭 | 800×800 PNG (투명) | 400×400 영역 선택 | 투명 배경 보존 |

#### 예외 케이스

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| CR-E01 | 선택 영역 없이 크롭 | 영역 미선택 상태에서 "자르기" 클릭 | "크롭 영역을 선택해 주세요" 메시지 |
| CR-E02 | 이미지 밖 드래그 | 이미지 경계 밖으로 드래그 | 이미지 경계 내로 자동 제한 |
| CR-E03 | 좌표가 이미지 범위 초과 | X:900 Y:900 W:500 H:500 (1000×1000 이미지) | "선택 영역이 이미지를 벗어납니다" |

### 3.4 이미지 회전/뒤집기 도구

#### 정상 케이스

| TC-ID | 테스트 케이스 | 입력 | 동작 | 기대 결과 |
|-------|-------------|------|------|----------|
| RT-001 | 90° 시계방향 회전 | 1920×1080 JPG | "90° →" 버튼 클릭 | 1080×1920 이미지, 시계방향 회전 |
| RT-002 | 90° 반시계방향 회전 | 1920×1080 JPG | "90° ←" 버튼 클릭 | 1080×1920 이미지, 반시계방향 회전 |
| RT-003 | 180° 회전 | 1920×1080 JPG | "180°" 버튼 클릭 | 1920×1080 이미지, 상하좌우 반전 |
| RT-004 | 자유 각도 회전 | 1000×1000 PNG | 슬라이더로 45° 설정 | 캔버스 확장, 45° 회전 |
| RT-005 | 수평 뒤집기 | 500×500 PNG | "좌우 반전" 클릭 | 좌우 미러 이미지 |
| RT-006 | 수직 뒤집기 | 500×500 PNG | "상하 반전" 클릭 | 상하 미러 이미지 |
| RT-007 | 투명 배경 회전 | 500×500 PNG (투명) | 45° 회전 | 확장 영역 투명 유지 |

### 3.5 포맷 변환 도구

#### 정상 케이스

| TC-ID | 입력 포맷 | 출력 포맷 | 기대 결과 |
|-------|----------|----------|----------|
| FV-001 | JPG | PNG | 무손실 PNG 출력, 투명 배경 없음 |
| FV-002 | PNG | JPG | 손실 압축, 투명→흰색 배경 |
| FV-003 | JPG | WebP | WebP 출력, 파일 크기 감소 |
| FV-004 | PNG | WebP | WebP 출력, 투명 배경 보존 |
| FV-005 | WebP | PNG | PNG 출력 |
| FV-006 | WebP | JPG | JPG 출력, 투명→흰색 |
| FV-007 | BMP | PNG | PNG 출력, 파일 크기 대폭 감소 |
| FV-008 | JPG | BMP | BMP 출력, 파일 크기 증가 |
| FV-009 | PNG | ICO | ICO 출력, 적절한 크기(16/32/48/64/128/256) |
| FV-010 | JPG | ICO | ICO 출력 |
| FV-011 | GIF (정지) | PNG | 단일 프레임 PNG 출력 |
| FV-012 | GIF (애니) | PNG | 첫 번째 프레임만 PNG 출력, 경고 표시 |

#### 예외 케이스

| TC-ID | 테스트 케이스 | 기대 결과 |
|-------|-------------|----------|
| FV-E01 | Safari에서 WebP 인코딩 | Safari < 16.4: "이 브라우저에서 WebP 변환이 지원되지 않습니다" |
| FV-E02 | AVIF 인코딩 시도 | 미지원 브라우저: "AVIF 변환은 Chrome 최신 버전에서만 지원됩니다" |
| FV-E03 | 입력=출력 동일 포맷 | "입력과 동일한 포맷입니다. 다른 포맷을 선택해 주세요" 또는 그대로 처리 |

### 3.6 이미지 압축/최적화 도구

#### 정상 케이스

| TC-ID | 테스트 케이스 | 입력 | 동작 | 기대 결과 |
|-------|-------------|------|------|----------|
| CM-001 | JPG 품질 조정 | 2MB JPG | 품질 60% 설정 | 출력 파일 크기 < 입력 크기, 시각적 차이 미미 |
| CM-002 | PNG 최적화 | 5MB PNG | 최적화 실행 | 파일 크기 감소 (무손실) |
| CM-003 | WebP 압축 | 3MB WebP | 품질 75% | 출력 < 입력 |
| CM-004 | 품질 슬라이더 | 1MB JPG | 1%~100% 범위 조정 | 실시간 예상 크기 표시 |
| CM-005 | 압축 전후 비교 | 2MB JPG | 처리 후 | 원본/결과 나란히 표시, 크기 비교 |

### 3.7 필터/효과 도구

#### 정상 케이스

| TC-ID | 필터 | 입력 | 기대 결과 |
|-------|------|------|----------|
| FL-001 | 흑백 (Grayscale) | 컬러 JPG | 완전한 흑백 이미지 |
| FL-002 | 세피아 (Sepia) | 컬러 JPG | 세피아 톤 이미지 |
| FL-003 | 밝기 +50 | JPG | 전체적으로 밝아진 이미지 |
| FL-004 | 밝기 -50 | JPG | 전체적으로 어두워진 이미지 |
| FL-005 | 대비 +50 | JPG | 명암 차이 증가 |
| FL-006 | 채도 +50 | JPG | 색상 더 선명 |
| FL-007 | 채도 0 | 컬러 JPG | 흑백과 유사 |
| FL-008 | 블러 | JPG | 전체 흐림 효과 |
| FL-009 | 샤픈 | 흐릿한 JPG | 선명도 증가 |
| FL-010 | 반전 (Invert) | JPG | 색상 반전 (네거티브) |
| FL-011 | 복합 필터 | JPG | 밝기+대비+채도 동시 적용 |
| FL-012 | 필터 초기화 | 필터 적용 상태 | "초기화" 버튼 → 원본 복원 |

### 3.8 텍스트 추가 / 워터마크 도구

#### 정상 케이스

| TC-ID | 테스트 케이스 | 입력 | 동작 | 기대 결과 |
|-------|-------------|------|------|----------|
| TX-001 | 텍스트 추가 | 1000×1000 JPG | "Hello World" 입력, 중앙 배치 | 텍스트가 중앙에 표시된 이미지 |
| TX-002 | 폰트 크기 변경 | JPG | 폰트 크기 48px 설정 | 해당 크기로 텍스트 렌더링 |
| TX-003 | 폰트 색상 변경 | JPG | 빨간색 (#FF0000) 선택 | 빨간색 텍스트 |
| TX-004 | 텍스트 위치 드래그 | JPG | 텍스트를 우하단으로 드래그 | 우하단에 텍스트 배치 |
| TX-005 | 반투명 워터마크 | JPG | 투명도 50% 설정 | 반투명 텍스트 오버레이 |
| TX-006 | 타일 워터마크 | JPG | "타일" 모드 선택 | 이미지 전체에 반복 패턴 |
| TX-007 | 한글 텍스트 | JPG | "안녕하세요" 입력 | 한글 정상 렌더링 |
| TX-008 | 이모지 텍스트 | JPG | "🎉🔥" 입력 | 이모지 렌더링 (브라우저 의존) |

### 3.9 메타데이터 뷰어/제거 도구

#### 정상 케이스

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| MD-001 | EXIF 메타데이터 표시 | EXIF 포함 JPG | 카메라, 날짜, GPS 등 정보 표시 |
| MD-002 | EXIF 제거 | EXIF 포함 JPG | EXIF 제거된 JPG 출력, 이미지 품질 유지 |
| MD-003 | GPS 정보만 제거 | GPS 포함 JPG | GPS 제거, 다른 EXIF 보존 |
| MD-004 | 메타데이터 없는 이미지 | PNG (메타데이터 없음) | "메타데이터가 없습니다" 표시 |

### 3.10 QR코드/바코드 생성 도구

#### 정상 케이스

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| QR-001 | URL QR코드 | `https://example.com` | QR 이미지 생성, 스캔 시 URL 이동 |
| QR-002 | 텍스트 QR코드 | "Hello World" | QR 이미지 생성, 스캔 시 텍스트 표시 |
| QR-003 | QR 크기 설정 | 크기: 500×500 | 500×500px QR 이미지 |
| QR-004 | QR 색상 변경 | 전경: 빨간색, 배경: 흰색 | 빨간색 QR코드 |
| QR-005 | 빈 텍스트 입력 | 입력 필드 비움 | "텍스트를 입력해 주세요" 메시지 |
| QR-006 | 매우 긴 텍스트 | 4000자 텍스트 | QR 생성 또는 "텍스트가 너무 깁니다" 경고 |

### 3.11 GIF 도구 (Phase 2)

#### GIF 만들기 (이미지 → GIF)

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| GF-001 | 기본 GIF 생성 | JPG 5장 업로드 | 5프레임 애니메이션 GIF |
| GF-002 | 프레임 속도 설정 | JPG 3장, 딜레이 500ms | 0.5초 간격 애니메이션 |
| GF-003 | 프레임 순서 변경 | JPG 5장, 드래그로 순서 변경 | 변경된 순서로 GIF 생성 |
| GF-004 | 프레임 삭제 | JPG 5장 중 2장 삭제 | 3프레임 GIF |
| GF-005 | 루프 설정 | 무한 루프 / 1회 / 3회 | 설정대로 반복 |
| GF-006 | 서로 다른 크기 이미지 | 100×100, 200×200, 300×300 | 가장 큰 크기로 통일 또는 사용자 선택 |

#### GIF 분할 (프레임 추출)

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| GS-001 | 전체 프레임 추출 | 30프레임 GIF | 30개의 개별 PNG 이미지 |
| GS-002 | 선택 프레임 추출 | 30프레임 GIF, 1·5·10 선택 | 3개 이미지 |
| GS-003 | ZIP 다운로드 | 프레임 추출 후 | 모든 프레임을 ZIP으로 다운로드 |

#### GIF 편집

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| GE-001 | GIF 리사이즈 | 500×500 GIF | 250×250 GIF, 애니메이션 유지 |
| GE-002 | GIF 크롭 | 500×500 GIF | 선택 영역으로 모든 프레임 크롭 |
| GE-003 | GIF 역재생 | 순방향 GIF | 역방향 애니메이션 |
| GE-004 | GIF 속도 2배 | 딜레이 100ms GIF | 딜레이 50ms GIF |
| GE-005 | GIF 속도 0.5배 | 딜레이 100ms GIF | 딜레이 200ms GIF |
| GE-006 | GIF 최적화 | 2MB GIF | 파일 크기 감소, 시각적 차이 최소 |
| GE-007 | GIF 텍스트 추가 | GIF | 모든 프레임에 텍스트 오버레이 |

### 3.12 비디오 도구 (Phase 3)

| TC-ID | 테스트 케이스 | 입력 | 기대 결과 |
|-------|-------------|------|----------|
| VD-001 | 비디오 → GIF | 10초 MP4 | 애니메이션 GIF 출력 |
| VD-002 | GIF → MP4 | 애니메이션 GIF | MP4 비디오 출력 |
| VD-003 | 비디오 자르기 | 30초 MP4, 5~15초 선택 | 10초 MP4 출력 |
| VD-004 | ffmpeg 미지원 브라우저 | Safari iOS | 기능 비활성화 + 안내 메시지 |

---

## 4. 성능 기준

### 4.1 페이지 로딩 성능 (Core Web Vitals)

| 지표 | 목표 | 측정 도구 | 기준 |
|------|------|----------|------|
| **First Contentful Paint (FCP)** | < 1.5초 | Lighthouse | Good: < 1.8s |
| **Largest Contentful Paint (LCP)** | < 2.5초 | Lighthouse | Good: < 2.5s |
| **First Input Delay (FID)** | < 100ms | Web Vitals JS | Good: < 100ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse | Good: < 0.1 |
| **Interaction to Next Paint (INP)** | < 200ms | Web Vitals JS | Good: < 200ms |
| **Time to Interactive (TTI)** | < 3.5초 | Lighthouse | — |
| **Total Blocking Time (TBT)** | < 300ms | Lighthouse | — |

### 4.2 이미지 처리 성능

| 작업 | 입력 크기 | 목표 시간 | 측정 환경 |
|------|----------|----------|----------|
| 리사이즈 (50% 축소) | 1MB JPG (3000×2000) | < 1초 | Chrome, M1 Mac / i5 PC |
| 리사이즈 (50% 축소) | 5MB JPG (5000×4000) | < 3초 | 〃 |
| 리사이즈 (50% 축소) | 10MB JPG (8000×6000) | < 5초 | 〃 |
| 포맷 변환 (JPG→PNG) | 1MB JPG | < 2초 | 〃 |
| 포맷 변환 (JPG→WebP) | 1MB JPG | < 2초 | 〃 |
| 필터 적용 (흑백) | 1MB JPG | < 1초 | 〃 |
| 필터 적용 (블러) | 1MB JPG | < 2초 | 〃 |
| GIF 생성 (10프레임) | 500KB JPG × 10장 | < 5초 | 〃 |
| GIF 리사이즈 | 2MB GIF (30프레임) | < 5초 | 〃 |
| GIF 최적화 | 5MB GIF | < 10초 | 〃 |
| 비디오→GIF (ffmpeg) | 10초 MP4 (720p) | < 30초 | 〃 |

### 4.3 메모리 사용량

| 항목 | 최대 허용량 | 모니터링 방법 |
|------|-----------|-------------|
| 단일 이미지 처리 | 500MB | DevTools → Performance → Memory |
| GIF 처리 (30프레임) | 800MB | 〃 |
| ffmpeg.wasm 로딩 + 처리 | 1GB | 〃 |
| 유휴 상태 (도구 페이지) | 50MB 이내 | 〃 |
| 메모리 누수 (반복 처리) | 10회 반복 후 초기 대비 +20% 이내 | 〃 |

#### 메모리 누수 테스트 절차

```
1. DevTools → Performance → Memory 탭 열기
2. 초기 Heap 스냅샷 촬영 → 크기 기록
3. 이미지 업로드 → 처리 → 다운로드 → 새 이미지 업로드 (10회 반복)
4. 최종 Heap 스냅샷 촬영
5. 초기 대비 +20% 이내인지 확인
6. Detached DOM 노드 0개 확인
```

### 4.4 파일 크기 예산 (Asset Budget)

| 리소스 | 최대 크기 | 비고 |
|--------|---------|------|
| HTML (개별 페이지) | 30KB | gzip 압축 후 |
| CSS 전체 (XP 테마 포함) | 50KB | gzip 압축 후 |
| JS 번들 (공통) | 30KB | gzip 압축 후 |
| JS 도구별 모듈 | 20KB/모듈 | 지연 로딩 |
| XP 테마 이미지 | 100KB 전체 | CSS 스프라이트 또는 CSS-only |
| gif.js | 100KB | 외부 라이브러리, GIF 페이지만 로딩 |
| qrcode.js | 30KB | QR 페이지만 로딩 |
| ffmpeg.wasm | ~25MB | 비디오 페이지만 로딩, CDN 캐시 |
| 총 초기 로딩 (메인 페이지) | < 200KB | HTML + CSS + JS + 이미지 |

### 4.5 Lighthouse 목표 점수

| 카테고리 | 목표 점수 | 최소 허용 |
|----------|---------|----------|
| Performance | 95+ | 90 |
| Accessibility | 95+ | 90 |
| Best Practices | 95+ | 90 |
| SEO | 100 | 95 |

### 4.6 성능 측정 코드

```javascript
// 이미지 처리 성능 측정 유틸리티
// 개발 모드에서만 콘솔에 타이밍 출력
class PerformanceTracker {
  constructor(operationName) {
    this.name = operationName;
    this.startTime = 0;
    this.startMemory = 0;
  }

  // 측정 시작
  start() {
    this.startTime = performance.now();
    if (performance.memory) {
      // Chrome 전용 메모리 측정
      this.startMemory = performance.memory.usedJSHeapSize;
    }
  }

  // 측정 종료 및 결과 출력
  end() {
    const elapsed = performance.now() - this.startTime;
    const result = {
      operation: this.name,
      duration: `${elapsed.toFixed(2)}ms`,
      durationSec: `${(elapsed / 1000).toFixed(2)}s`
    };

    if (performance.memory) {
      const memUsed = performance.memory.usedJSHeapSize - this.startMemory;
      result.memoryDelta = `${(memUsed / 1024 / 1024).toFixed(2)}MB`;
    }

    console.table(result);
    return result;
  }
}

// 사용 예시:
// const tracker = new PerformanceTracker('image-resize');
// tracker.start();
// await resizeImage(canvas, 960, 540);
// tracker.end();
```

---

## 5. 접근성 (Accessibility)

### 5.1 WCAG 2.1 AA 준수 항목

| 카테고리 | 항목 | 기준 | 확인 방법 |
|----------|------|------|----------|
| **텍스트 대안** | 모든 `<img>`에 `alt` 속성 | WCAG 1.1.1 | Lighthouse, axe DevTools |
| **텍스트 대안** | 장식 이미지에 `alt=""` | WCAG 1.1.1 | 수동 검토 |
| **텍스트 대안** | `<canvas>` fallback 텍스트 | WCAG 1.1.1 | `<canvas>` 내 텍스트 확인 |
| **색상 대비** | 텍스트 대비율 4.5:1 이상 | WCAG 1.4.3 | Chrome DevTools 색상 대비 |
| **색상 대비** | 큰 텍스트 대비율 3:1 이상 | WCAG 1.4.3 | 〃 |
| **색상 대비** | UI 컴포넌트 대비율 3:1 이상 | WCAG 1.4.11 | 〃 |
| **키보드** | 모든 기능 키보드로 접근 가능 | WCAG 2.1.1 | Tab 키로 순회 테스트 |
| **키보드** | 포커스 표시 가시적 | WCAG 2.4.7 | Tab 키 → 포커스 링 확인 |
| **키보드** | 키보드 트랩 없음 | WCAG 2.1.2 | 모달 열기/닫기 → Tab 순회 |
| **키보드** | 논리적 탭 순서 | WCAG 2.4.3 | Tab 순서가 시각 순서와 일치 |
| **스크린 리더** | 페이지 랜드마크 (`<header>`, `<main>`, `<nav>`) | WCAG 1.3.1 | NVDA/VoiceOver 테스트 |
| **스크린 리더** | 폼 요소 `<label>` 연결 | WCAG 1.3.1 | 〃 |
| **스크린 리더** | 버튼/링크 접근 가능한 이름 | WCAG 4.1.2 | axe DevTools |
| **스크린 리더** | `aria-live` 영역 (처리 상태 알림) | WCAG 4.1.3 | 〃 |
| **동적 콘텐츠** | 에러 메시지 `role="alert"` | WCAG 4.1.3 | 〃 |
| **동적 콘텐츠** | 로딩 상태 `aria-busy` | WCAG 4.1.3 | 〃 |

### 5.2 Windows XP 테마 접근성 고려사항

XP 테마는 시각적 디자인이 핵심이지만, 접근성을 저해하면 안 됨.

| XP 요소 | 접근성 위험 | 대응 |
|---------|-----------|------|
| 제목표시줄 버튼 (최소화/최대화/닫기) | 아이콘만 → 스크린 리더 불가 | `aria-label="닫기"` 추가 |
| 시작 메뉴 | 복잡한 메뉴 구조 | `role="menu"`, `role="menuitem"` |
| 시작 메뉴 | 키보드 네비게이션 | 화살표 키 지원 |
| 에러 다이얼로그 | 모달 포커스 트랩 | `role="alertdialog"`, 포커스 관리 |
| 작업 표시줄 | 비표준 네비게이션 | `role="navigation"`, `aria-label` |
| 프로그레스 바 | 시각 전용 | `role="progressbar"`, `aria-valuenow` |
| 슬라이더 (필터) | 커스텀 UI | `role="slider"`, 키보드 조작 지원 |
| 도구 아이콘 | 아이콘만 표시 | `alt` 텍스트 또는 `aria-label` |

### 5.3 접근성 테스트 체크리스트

```
키보드 테스트:
  ☐ Tab 키로 모든 인터랙티브 요소 순회 가능
  ☐ Shift+Tab 역순 이동
  ☐ Enter/Space로 버튼 활성화
  ☐ Escape로 모달/메뉴 닫기
  ☐ 화살표 키로 슬라이더 조작
  ☐ 파일 업로드 영역 키보드 접근 (Enter → 파일 다이얼로그)

색상 대비 테스트:
  ☐ XP 테마 제목표시줄 텍스트 (흰색 on 파란색 = 8.59:1 ✅)
  ☐ 메뉴 텍스트 (검정 on 흰색/회색)
  ☐ 버튼 텍스트 (검정 on XP 회색 버튼)
  ☐ 에러 메시지 (빨간색 텍스트 → 4.5:1 이상 확인)
  ☐ 비활성 상태 텍스트 (회색 on 회색 → 대비 주의)
  ☐ 링크 텍스트 (파란색 on 흰색)

스크린 리더 테스트 (기본 수준):
  ☐ NVDA (Windows) 또는 VoiceOver (Mac)로 페이지 읽기
  ☐ 주요 기능 순서대로 음성 출력 확인
  ☐ 이미지 업로드 후 상태 변화 알림
  ☐ 처리 완료 알림
  ☐ 에러 발생 시 알림
```

### 5.4 접근성 관련 HTML 패턴

```html
<!-- 파일 업로드 영역 접근성 마크업 예시 -->
<div
  class="xp-upload-area"
  role="button"
  tabindex="0"
  aria-label="이미지 파일 업로드 — 클릭하거나 파일을 드래그하세요"
  aria-describedby="upload-help"
>
  <input
    type="file"
    id="file-input"
    accept="image/*"
    aria-hidden="true"
    tabindex="-1"
  >
  <p id="upload-help">
    지원 포맷: JPG, PNG, WebP, BMP, GIF (최대 50MB)
  </p>
</div>

<!-- 처리 상태 라이브 영역 -->
<div
  id="status-region"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  <!-- JS로 동적 업데이트: "처리 중... 50%", "완료!" 등 -->
</div>

<!-- XP 에러 다이얼로그 접근성 마크업 -->
<div
  class="xp-dialog xp-error-dialog"
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-message"
>
  <div class="xp-titlebar">
    <span id="dialog-title">오류</span>
    <button aria-label="닫기" class="xp-close-btn">✕</button>
  </div>
  <div class="xp-dialog-body">
    <img src="xp-error-icon.png" alt="" aria-hidden="true">
    <p id="dialog-message">지원하지 않는 파일 형식입니다.</p>
  </div>
  <div class="xp-dialog-footer">
    <button class="xp-btn" autofocus>확인</button>
  </div>
</div>

<!-- 프로그레스 바 접근성 -->
<div
  class="xp-progress-bar"
  role="progressbar"
  aria-valuenow="45"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="이미지 처리 진행률"
>
  <div class="xp-progress-fill" style="width: 45%"></div>
</div>

<!-- 스크린 리더 전용 텍스트 유틸리티 클래스 -->
<!-- CSS: .sr-only { position:absolute; width:1px; height:1px; ... } -->
```

---

## 6. 보안 체크리스트

### 6.1 파일 업로드 보안

이 프로젝트는 **100% 클라이언트 사이드**이므로 서버 보안은 해당 없음. 그러나 클라이언트 측 보안 조치는 필요.

| # | 항목 | 설명 | 구현 방법 |
|---|------|------|----------|
| 1 | **파일 서버 전송 없음** | 모든 파일은 브라우저 메모리에서만 처리 | `fetch`/`XMLHttpRequest`로 파일 전송하는 코드 없음 확인 |
| 2 | **파일 타입 검증** | MIME 타입 + 매직 바이트 확인 | 확장자만 믿지 않고 `FileReader`로 헤더 바이트 확인 |
| 3 | **파일 크기 제한** | 최대 50MB (이미지), 100MB (비디오) | 업로드 즉시 크기 확인, 초과 시 거부 |
| 4 | **메모리 해제** | 처리 완료 후 ObjectURL 해제 | `URL.revokeObjectURL()` 호출 확인 |
| 5 | **Web Worker 격리** | 무거운 처리는 Worker에서 실행 | 메인 스레드 블록 방지 |

#### 파일 타입 검증 코드

```javascript
// 매직 바이트를 확인하여 실제 파일 타입 검증
// 확장자 변조를 방지하는 이중 검증 로직
const FILE_SIGNATURES = {
  // JPEG: FF D8 FF
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  // GIF: 47 49 46 38
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  // WebP: 52 49 46 46 ... 57 45 42 50
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  // BMP: 42 4D
  'image/bmp': [0x42, 0x4D],
  // ICO: 00 00 01 00
  'image/x-icon': [0x00, 0x00, 0x01, 0x00]
};

/**
 * 파일의 매직 바이트를 읽어 실제 이미지 파일인지 검증
 * @param {File} file - 검증할 파일 객체
 * @returns {Promise<boolean>} 유효한 이미지 파일이면 true
 */
async function validateFileSignature(file) {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  for (const [mimeType, signature] of Object.entries(FILE_SIGNATURES)) {
    const match = signature.every((byte, i) => bytes[i] === byte);
    if (match) return true;
  }
  return false;
}
```

### 6.2 XSS 방지

| # | 항목 | 위험 | 대응 |
|---|------|------|------|
| 1 | 파일명 표시 | 파일명에 `<script>` 포함 가능 | `textContent` 사용, `innerHTML` 금지 |
| 2 | 텍스트 워터마크 입력 | 사용자 입력을 Canvas에 렌더링 | Canvas API는 XSS 안전 (DOM 아님) |
| 3 | QR코드 텍스트 입력 | 사용자 입력 | Canvas에 렌더링 → XSS 안전 |
| 4 | 메타데이터 표시 | EXIF 데이터에 악성 문자열 가능 | `textContent`로 표시 |
| 5 | URL 파라미터 | `?file=xxx` 등 | URL 파라미터 사용하지 않음 |
| 6 | `localStorage` | 설정 저장 시 | JSON.parse 사용, 직접 DOM 삽입 금지 |

#### XSS 방지 유틸리티

```javascript
// 사용자 입력을 DOM에 안전하게 표시하는 유틸리티
// innerHTML 대신 항상 이 함수 또는 textContent 사용

/**
 * HTML 특수문자를 이스케이프하여 XSS 방지
 * @param {string} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 안전한 문자열
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 안전하게 텍스트 설정 — innerHTML 대신 사용
 * @param {HTMLElement} element - 대상 요소
 * @param {string} text - 표시할 텍스트
 */
function safeSetText(element, text) {
  element.textContent = text;
}

// ❌ 금지: element.innerHTML = userInput;
// ✅ 사용: element.textContent = userInput;
// ✅ 사용: safeSetText(element, userInput);
```

### 6.3 Content Security Policy (CSP)

#### Cloudflare Pages `_headers` 파일

```
# 파일 위치: /_headers

/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://cdnjs.cloudflare.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://pagead2.googlesyndication.com; frame-src https://googleads.g.doubleclick.net; worker-src 'self' blob:; child-src blob:;
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

#### CSP 항목별 설명

| 디렉티브 | 값 | 사유 |
|----------|------|------|
| `default-src` | `'self'` | 기본: 같은 출처만 허용 |
| `script-src` | `'self'` + AdSense + CDN + `'unsafe-eval'` | ffmpeg.wasm이 eval 필요 |
| `style-src` | `'self' 'unsafe-inline'` | 인라인 스타일 (Canvas 동적 사이즈 등) |
| `img-src` | `'self' data: blob:` | ObjectURL, Data URL 이미지 필요 |
| `worker-src` | `'self' blob:` | Web Worker, gif.js blob Worker |
| `connect-src` | `'self'` + AdSense | AdSense 네트워크 요청 |
| `frame-src` | `googleads...` | AdSense iframe |

### 6.4 외부 라이브러리 무결성 (SRI)

CDN에서 로딩하는 모든 외부 스크립트에 **Subresource Integrity** 해시 적용.

```html
<!-- gif.js — SRI 해시 적용 예시 -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js"
  integrity="sha384-실제해시값을여기에입력"
  crossorigin="anonymous"
></script>

<!-- qrcode.js — SRI 해시 적용 -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
  integrity="sha384-실제해시값을여기에입력"
  crossorigin="anonymous"
></script>
```

#### SRI 해시 생성 방법

```bash
# SRI 해시 생성 커맨드 (sha384)
# 다운로드 후 해시 생성
curl -s https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

# 또는 https://www.srihash.org/ 에서 URL 입력
```

### 6.5 보안 테스트 체크리스트

```
파일 보안:
  ☐ 서버로 파일 전송하는 네트워크 요청 없음 (DevTools Network 탭 확인)
  ☐ 확장자 변조 파일 (text.jpg → 실제 .txt) 업로드 → 적절한 에러 메시지
  ☐ HTML 파일 업로드 시 이미지로 처리되지 않음
  ☐ SVG 파일 (내장 스크립트 가능) 직접 렌더링 안 함 → Canvas 변환

XSS 방지:
  ☐ 파일명에 <script>alert(1)</script> → 안전하게 표시
  ☐ 텍스트 워터마크에 HTML 태그 입력 → 태그 그대로 텍스트로 렌더링
  ☐ QR코드에 javascript: URL 입력 → QR코드 생성은 되지만 실행 안 됨
  ☐ console에서 document.cookie 접근 → HttpOnly 쿠키 없음 (쿠키 미사용)

CSP:
  ☐ DevTools Console에서 CSP 위반 경고 0건
  ☐ 인라인 스크립트 (<script>태그 내 코드) 사용하지 않음
  ☐ eval() 사용은 ffmpeg.wasm 페이지에서만 (CSP에 명시)

헤더:
  ☐ X-Content-Type-Options: nosniff 설정 확인
  ☐ X-Frame-Options: SAMEORIGIN 설정 확인
  ☐ Referrer-Policy 설정 확인
  ☐ DevTools → Network → 응답 헤더에서 확인
```

---

## 7. 에러 처리 가이드

### 7.1 에러 메시지 디자인 원칙

모든 에러 메시지는 **Windows XP 에러 다이얼로그** 스타일로 표시.

```
┌──────────────────────────────────────────────┐
│ ⊞ 오류                              [─][□][✕]│
├──────────────────────────────────────────────┤
│                                              │
│   ⚠️  지원하지 않는 파일 형식입니다.          │
│                                              │
│   '.psd' 파일은 지원되지 않습니다.            │
│   지원 포맷: JPG, PNG, WebP, BMP, GIF, ICO   │
│                                              │
│                         [  확인  ]            │
│                                              │
└──────────────────────────────────────────────┘
```

#### 에러 다이얼로그 구성 요소

| 요소 | 설명 | XP 스타일 |
|------|------|----------|
| 제목 표시줄 | 에러 카테고리 | 파란색 그라데이션, 흰색 텍스트 |
| 아이콘 | 에러 심각도 표시 | ❌ 오류, ⚠️ 경고, ℹ️ 정보, ❓ 질문 |
| 메시지 제목 | 무엇이 잘못됐는지 (1줄) | 굵은 텍스트 |
| 메시지 상세 | 왜 발생했고 어떻게 해결하는지 | 일반 텍스트 |
| 버튼 | 사용자 액션 | XP 스타일 3D 버튼 |

### 7.2 에러 유형별 메시지

#### 파일 형식 미지원

| 상황 | 아이콘 | 제목 | 메시지 | 버튼 |
|------|--------|------|--------|------|
| 지원하지 않는 포맷 업로드 | ⚠️ | 파일 형식 오류 | `'.{ext}' 파일은 지원되지 않습니다.\n지원 포맷: JPG, PNG, WebP, BMP, GIF` | 확인 |
| 이미지 도구에 비디오 업로드 | ⚠️ | 파일 형식 오류 | `비디오 파일은 이 도구에서 사용할 수 없습니다.\n비디오 도구를 이용해 주세요.` | 확인 · 비디오 도구로 이동 |
| GIF 도구에 정지 이미지 업로드 | ℹ️ | 알림 | `이 파일은 애니메이션 GIF가 아닙니다.\n일부 기능이 제한될 수 있습니다.` | 계속 · 취소 |

#### 파일 크기 초과

| 상황 | 아이콘 | 제목 | 메시지 | 버튼 |
|------|--------|------|--------|------|
| 이미지 50MB 초과 | ⚠️ | 파일 크기 초과 | `파일 크기가 {size}MB입니다.\n최대 50MB까지 지원합니다.\n이미지를 압축하거나 크기를 줄여 주세요.` | 확인 |
| 비디오 100MB 초과 | ⚠️ | 파일 크기 초과 | `비디오 파일 크기가 {size}MB입니다.\n최대 100MB까지 지원합니다.` | 확인 |
| GIF 프레임 100개 초과 | ⚠️ | 프레임 수 초과 | `GIF 프레임이 {count}개입니다.\n100개 이하의 GIF를 사용해 주세요.\n처리 시간이 매우 길어질 수 있습니다.` | 그래도 계속 · 취소 |

#### 처리 실패

| 상황 | 아이콘 | 제목 | 메시지 | 버튼 |
|------|--------|------|--------|------|
| Canvas 처리 오류 | ❌ | 처리 실패 | `이미지 처리 중 오류가 발생했습니다.\n다른 이미지로 다시 시도해 주세요.` | 다시 시도 · 닫기 |
| 메모리 부족 | ❌ | 메모리 부족 | `이미지가 너무 커서 처리할 수 없습니다.\n브라우저 탭을 닫고 다시 시도하거나,\n더 작은 이미지를 사용해 주세요.` | 확인 |
| Worker 오류 | ❌ | 처리 실패 | `백그라운드 처리 중 오류가 발생했습니다.\n페이지를 새로고침하고 다시 시도해 주세요.` | 새로고침 · 닫기 |
| GIF 인코딩 실패 | ❌ | GIF 생성 실패 | `GIF 생성 중 오류가 발생했습니다.\n프레임 수를 줄이거나 크기를 축소해 주세요.` | 다시 시도 · 닫기 |
| ffmpeg 오류 | ❌ | 비디오 처리 실패 | `비디오 변환 중 오류가 발생했습니다.\n지원되는 포맷: MP4, WebM, AVI` | 다시 시도 · 닫기 |
| 타임아웃 (60초 초과) | ⚠️ | 처리 시간 초과 | `처리 시간이 너무 오래 걸립니다.\n파일 크기를 줄이고 다시 시도해 주세요.` | 계속 대기 · 취소 |

#### 브라우저 미지원 기능

| 상황 | 아이콘 | 제목 | 메시지 | 버튼 |
|------|--------|------|--------|------|
| Safari WebP 인코딩 제한 | ⚠️ | 브라우저 제한 | `이 브라우저에서는 WebP 변환이 지원되지 않습니다.\nPNG로 변환됩니다.\nChrome 또는 Edge를 사용하면 WebP 변환이 가능합니다.` | PNG로 변환 · 취소 |
| SharedArrayBuffer 미지원 | ⚠️ | 기능 제한 | `이 브라우저에서는 비디오 변환 기능을 사용할 수 없습니다.\nChrome, Edge, Firefox 최신 버전을 사용해 주세요.` | 확인 |
| OffscreenCanvas 미지원 | ℹ️ | 알림 | `이 브라우저에서는 처리 속도가 느릴 수 있습니다.\nChrome 또는 Edge를 권장합니다.` | 확인 |
| iOS Safari 다운로드 제한 | ℹ️ | 알림 | `iOS에서는 파일이 새 탭에서 열립니다.\n길게 눌러 "이미지 저장"을 선택해 주세요.` | 확인 |
| 드래그 앤 드롭 미지원 (모바일) | ℹ️ | — | 드래그 영역 대신 "파일 선택" 버튼을 눈에 띄게 표시 | — |

### 7.3 에러 다이얼로그 구현

```javascript
/**
 * Windows XP 스타일 에러 다이얼로그 표시 함수
 * 모든 에러/경고/정보 메시지를 XP 다이얼로그로 표시
 *
 * @param {Object} options - 다이얼로그 옵션
 * @param {string} options.type - 'error' | 'warning' | 'info' | 'question'
 * @param {string} options.title - 다이얼로그 제목표시줄 텍스트
 * @param {string} options.message - 메인 메시지 (줄바꿈 \n 지원)
 * @param {Array<Object>} options.buttons - 버튼 배열 [{text, action, primary}]
 * @returns {Promise<string>} 클릭된 버튼 텍스트
 */
function showXPDialog({ type = 'error', title, message, buttons = [{ text: '확인' }] }) {
  return new Promise((resolve) => {
    // 아이콘 선택
    const icons = {
      error: 'xp-icon-error.png',     // ❌ 빨간 X
      warning: 'xp-icon-warning.png',  // ⚠️ 노란 삼각형
      info: 'xp-icon-info.png',        // ℹ️ 파란 i
      question: 'xp-icon-question.png' // ❓ 파란 ?
    };

    // 오버레이 생성 (모달 배경)
    const overlay = document.createElement('div');
    overlay.className = 'xp-dialog-overlay';

    // 다이얼로그 생성
    const dialog = document.createElement('div');
    dialog.className = 'xp-dialog';
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'xp-dialog-title');
    dialog.setAttribute('aria-describedby', 'xp-dialog-msg');

    dialog.innerHTML = `
      <div class="xp-titlebar">
        <span id="xp-dialog-title">${escapeHTML(title)}</span>
        <button class="xp-close-btn" aria-label="닫기">✕</button>
      </div>
      <div class="xp-dialog-body">
        <img src="/assets/icons/${icons[type]}" alt="" class="xp-dialog-icon">
        <p id="xp-dialog-msg">${escapeHTML(message).replace(/\n/g, '<br>')}</p>
      </div>
      <div class="xp-dialog-footer">
        ${buttons.map((btn, i) =>
          `<button class="xp-btn${btn.primary ? ' xp-btn-primary' : ''}"
                   ${i === 0 ? 'autofocus' : ''}>${escapeHTML(btn.text)}</button>`
        ).join('')}
      </div>
    `;

    // 이벤트 바인딩
    const closeDialog = (result) => {
      overlay.remove();
      resolve(result);
    };

    // 닫기 버튼
    dialog.querySelector('.xp-close-btn').addEventListener('click', () => {
      closeDialog('close');
    });

    // 액션 버튼들
    dialog.querySelectorAll('.xp-dialog-footer .xp-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        closeDialog(buttons[i].text);
        if (buttons[i].action) buttons[i].action();
      });
    });

    // Escape 키로 닫기
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDialog('close');
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 포커스 트랩: 첫 번째 버튼에 포커스
    dialog.querySelector('button[autofocus]')?.focus();
  });
}

// 사용 예시:
// const result = await showXPDialog({
//   type: 'warning',
//   title: '파일 형식 오류',
//   message: "'.psd' 파일은 지원되지 않습니다.\n지원 포맷: JPG, PNG, WebP, BMP, GIF",
//   buttons: [{ text: '확인', primary: true }]
// });
```

### 7.4 에러 코드 체계

| 코드 | 카테고리 | 설명 |
|------|----------|------|
| `E1xx` | 파일 입력 | 파일 관련 에러 |
| `E100` | 파일 입력 | 지원하지 않는 파일 형식 |
| `E101` | 파일 입력 | 파일 크기 초과 |
| `E102` | 파일 입력 | 파일 손상/읽기 불가 |
| `E103` | 파일 입력 | 0바이트 파일 |
| `E104` | 파일 입력 | 파일 타입 불일치 (확장자 vs 내용) |
| `E2xx` | 처리 | 이미지/GIF 처리 에러 |
| `E200` | 처리 | Canvas 렌더링 실패 |
| `E201` | 처리 | 메모리 부족 |
| `E202` | 처리 | Worker 통신 실패 |
| `E203` | 처리 | 타임아웃 |
| `E204` | 처리 | GIF 인코딩 실패 |
| `E205` | 처리 | ffmpeg 실행 실패 |
| `E3xx` | 브라우저 | 브라우저 호환성 에러 |
| `E300` | 브라우저 | WebP 인코딩 미지원 |
| `E301` | 브라우저 | SharedArrayBuffer 미지원 |
| `E302` | 브라우저 | OffscreenCanvas 미지원 |
| `E303` | 브라우저 | Web Worker 미지원 |
| `E4xx` | 다운로드 | 파일 저장 관련 에러 |
| `E400` | 다운로드 | Blob 생성 실패 |
| `E401` | 다운로드 | 다운로드 트리거 실패 |

### 7.5 에러 로깅

```javascript
// 에러 로깅 유틸리티
// localStorage에 최근 20건 에러 저장 (디버깅용)
// 프로덕션에서는 콘솔 출력만, 외부 전송 없음

const ErrorLogger = {
  MAX_LOGS: 20,
  STORAGE_KEY: 'convertfile_error_logs',

  /**
   * 에러 기록
   * @param {string} code - 에러 코드 (예: 'E100')
   * @param {string} message - 에러 메시지
   * @param {Object} context - 추가 컨텍스트 (파일명, 크기 등)
   */
  log(code, message, context = {}) {
    const entry = {
      code,
      message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // 콘솔 출력
    console.error(`[ConvertFile ${code}]`, message, context);

    // localStorage에 저장
    try {
      const logs = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      logs.unshift(entry);
      // 최근 20건만 유지
      if (logs.length > this.MAX_LOGS) logs.length = this.MAX_LOGS;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      // localStorage 접근 불가 시 무시
    }
  },

  /**
   * 저장된 에러 로그 조회 (DevTools 콘솔에서 디버깅용)
   * @returns {Array} 에러 로그 배열
   */
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  /** 로그 초기화 */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

// 전역 에러 핸들러
// 예상치 못한 에러도 XP 다이얼로그로 표시
window.addEventListener('error', (event) => {
  ErrorLogger.log('E999', event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Promise 거부 핸들러
window.addEventListener('unhandledrejection', (event) => {
  ErrorLogger.log('E998', 'Unhandled Promise Rejection', {
    reason: String(event.reason)
  });
});
```

---

## 8. 테스트 데이터 세트

### 8.1 필수 테스트 이미지 목록

테스트용 이미지는 `/test/fixtures/` 디렉토리에 준비.

| 파일명 | 포맷 | 크기 | 해상도 | 용도 |
|--------|------|------|--------|------|
| `test-photo.jpg` | JPEG | ~1MB | 3000×2000 | 기본 이미지 처리 테스트 |
| `test-small.jpg` | JPEG | ~50KB | 640×480 | 소형 이미지 테스트 |
| `test-large.jpg` | JPEG | ~10MB | 8000×6000 | 대용량 이미지 테스트 |
| `test-transparent.png` | PNG | ~500KB | 1000×1000 | 투명 배경 테스트 |
| `test-opaque.png` | PNG | ~2MB | 2000×2000 | PNG 기본 테스트 |
| `test-photo.webp` | WebP | ~300KB | 1920×1080 | WebP 처리 테스트 |
| `test-photo.bmp` | BMP | ~5MB | 1024×768 | BMP 변환 테스트 |
| `test-1x1.png` | PNG | ~100B | 1×1 | 경계값 (최소 크기) |
| `test-10000x10000.png` | PNG | ~30MB | 10000×10000 | 경계값 (최대 크기) |
| `test-exif.jpg` | JPEG | ~2MB | 4000×3000 | EXIF 메타데이터 포함 |
| `test-no-exif.jpg` | JPEG | ~1MB | 3000×2000 | EXIF 없는 이미지 |
| `test-animated.gif` | GIF | ~2MB | 500×500 | 애니메이션 GIF (30프레임) |
| `test-static.gif` | GIF | ~50KB | 300×300 | 정적 GIF (1프레임) |
| `test-long.gif` | GIF | ~10MB | 400×400 | 100프레임 이상 GIF |
| `test-corrupt.jpg` | — | ~1KB | — | 손상된 파일 (에러 테스트) |
| `test-fake.jpg` | — | ~1KB | — | 확장자만 .jpg인 텍스트 파일 |
| `test-zero.jpg` | — | 0B | — | 0바이트 파일 |
| `test-video.mp4` | MP4 | ~5MB | 1280×720 | 비디오 도구 테스트 (Phase 3) |

### 8.2 테스트 이미지 생성 스크립트

```javascript
// 테스트용 이미지를 Canvas로 생성하는 유틸리티
// 실제 사진 대신 컬러 패턴으로 테스트 이미지 생성

/**
 * 지정 크기의 테스트 이미지 Blob 생성
 * 체크무늬 패턴 + 크기 텍스트 표시
 *
 * @param {number} width - 이미지 너비
 * @param {number} height - 이미지 높이
 * @param {string} format - 'image/jpeg' | 'image/png' | 'image/webp'
 * @returns {Promise<Blob>} 이미지 Blob
 */
function createTestImage(width, height, format = 'image/png') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 체크무늬 배경
  const tileSize = Math.max(width, height) / 10;
  for (let y = 0; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isEven ? '#FFFFFF' : '#CCCCCC';
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  // 크기 텍스트 표시
  ctx.fillStyle = '#333333';
  ctx.font = `${Math.min(width, height) / 10}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${width}×${height}`, width / 2, height / 2);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, format, 0.9);
  });
}
```

---

## 9. 릴리스 체크리스트

### 9.1 배포 전 최종 확인

매 배포 전 아래 항목을 모두 확인한 후 `main` 브랜치에 머지.

#### 기능 확인

| # | 항목 | 확인 |
|---|------|------|
| 1 | 모든 도구 페이지 로딩 정상 | ☐ |
| 2 | 각 도구 정상 케이스 1건 이상 통과 | ☐ |
| 3 | 파일 업로드 → 처리 → 다운로드 전체 플로우 | ☐ |
| 4 | 에러 케이스 1건 이상 (잘못된 파일 업로드) | ☐ |
| 5 | 모바일 레이아웃 확인 (375px) | ☐ |
| 6 | Windows XP 테마 렌더링 정상 | ☐ |

#### 성능 확인

| # | 항목 | 기준 | 확인 |
|---|------|------|------|
| 1 | Lighthouse Performance | ≥ 90 | ☐ |
| 2 | Lighthouse Accessibility | ≥ 90 | ☐ |
| 3 | Lighthouse Best Practices | ≥ 90 | ☐ |
| 4 | Lighthouse SEO | ≥ 95 | ☐ |
| 5 | 콘솔 에러 0건 | — | ☐ |
| 6 | 네트워크 404 요청 0건 | — | ☐ |

#### 보안 확인

| # | 항목 | 확인 |
|---|------|------|
| 1 | CSP 위반 0건 | ☐ |
| 2 | 외부 스크립트 SRI 해시 적용 | ☐ |
| 3 | 파일 서버 전송 없음 | ☐ |
| 4 | innerHTML 직접 사용 없음 | ☐ |

#### 콘텐츠 확인

| # | 항목 | 확인 |
|---|------|------|
| 1 | About 페이지 내용 정상 | ☐ |
| 2 | 개인정보처리방침 내용 정상 | ☐ |
| 3 | 이용약관 내용 정상 | ☐ |
| 4 | 메타 태그 (title, description) | ☐ |
| 5 | OG 태그 | ☐ |
| 6 | favicon 표시 | ☐ |

### 9.2 브라우저별 최종 스모크 테스트

| 브라우저 | 메인 로딩 | 이미지 리사이즈 | 포맷 변환 | 다운로드 | 모바일 |
|----------|:--------:|:-------------:|:--------:|:-------:|:------:|
| Chrome (최신) | ☐ | ☐ | ☐ | ☐ | — |
| Firefox (최신) | ☐ | ☐ | ☐ | ☐ | — |
| Safari (최신) | ☐ | ☐ | ☐ | ☐ | — |
| Edge (최신) | ☐ | ☐ | ☐ | ☐ | — |
| iOS Safari | ☐ | ☐ | ☐ | ☐ | ☐ |
| Chrome Android | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 부록: Phase 4 자동화 테스트 계획 (예정)

### 자동화 도구 선정

| 도구 | 용도 | 사유 |
|------|------|------|
| **Playwright** | E2E 테스트 | 다중 브라우저 지원, 파일 업로드 API |
| **Vitest** | 단위 테스트 | 빠른 실행, ESM 지원 |
| **axe-core** | 접근성 자동 테스트 | WCAG 위반 자동 탐지 |
| **Lighthouse CI** | 성능 자동 측정 | PR마다 성능 회귀 감지 |

### E2E 테스트 예시 (Playwright)

```javascript
// tests/resize.spec.js
// Phase 4에서 구현 예정

import { test, expect } from '@playwright/test';

// 이미지 리사이즈 E2E 테스트
test('이미지 리사이즈 — 50% 축소', async ({ page }) => {
  // 1. 도구 페이지 접속
  await page.goto('/tools/resize.html');

  // 2. 파일 업로드
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test/fixtures/test-photo.jpg');

  // 3. 미리보기 표시 확인
  await expect(page.locator('.preview-image')).toBeVisible();

  // 4. 리사이즈 설정
  await page.fill('#width-input', '960');
  // 비율 잠금 → 높이 자동 계산
  await expect(page.locator('#height-input')).toHaveValue('540');

  // 5. 처리 실행
  await page.click('#apply-btn');

  // 6. 결과 확인
  await expect(page.locator('.result-image')).toBeVisible();
  await expect(page.locator('.result-size')).toContainText('960 × 540');

  // 7. 다운로드 확인
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#download-btn')
  ]);
  expect(download.suggestedFilename()).toMatch(/convertfile_resize_.*\.jpg/);
});
```

### CI/CD 통합 (예정)

```yaml
# .github/workflows/test.yml (Phase 4)
name: QA Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test          # Vitest 단위 테스트
      - run: npm run test:e2e  # Playwright E2E
      - run: npm run lighthouse # Lighthouse CI
```

---

> **문서 버전**: v1.0
> **최종 수정**: 2026-06-07
> **담당**: QA 에이전트
> **다음 문서**: [07-agent-tasks.md](./07-agent-tasks.md) — 멀티 에이전트 작업 명세

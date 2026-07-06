# 도구 페이지 UI 단순화 롤아웃 (17개 도구) 설계

날짜: 2026-07-06
상태: 승인 대기
범위: 17개 영어판 도구 (`tools/*.html`) — 파일럿 스펙(`2026-07-03-tool-ui-simplification-design.md`)의 후속 단계

## 배경

파일럿(webp-convert, jpg-png, compress — 완료, main에 merge됨)에서 `.tool-flow`/`.segment-toggle`/`.btn-convert-hero`/`.advanced-settings` CSS 패턴을 검증했다. 파일럿 도구들은 **경쟁하는 변환 버튼 여러 개**(예: To WebP/To JPG/To PNG)를 1개로 통합하는 것이 핵심 과제였다.

나머지 20개 도구를 조사한 결과, 대부분은 이미 액션 버튼이 1개뿐이다(`btn-crop`, `btn-resize`, `btn-strip` 등). 이들의 복잡함은 버튼 개수가 아니라 **2컬럼 레이아웃 + 여러 설정 카드(2~10개)가 항상 노출**되는 데서 온다. 따라서 이번 롤아웃의 핵심 작업은 파일럿과 다르다: **버튼 재구성이 아니라 설정 카드를 `<details class="advanced-settings">`로 접는 것**이 기본형이다.

구조가 근본적으로 다른 3개(`rotate` — 즉시실행 버튼 6개짜리 툴바, `barcode` — 생성/스캔 듀얼모드, `pdf` — 이미지→PDF/병합/기타 3모드)는 이번 롤아웃에서 제외하고 이후 별도 스펙으로 처리한다.

## 목표

1. 파일럿과 동일한 시각적 언어(단일 컬럼 `.tool-flow`, 접힌 고급 설정)를 17개 도구에 적용
2. 기본 원칙: **기존 DOM id를 바꾸지 않는다** — 대부분의 도구는 JS 수정이 전혀 필요 없어야 한다 (파일럿의 Task 4/compress와 동일한 저위험 패턴)
3. id를 바꾸지 않으므로 **ko/es/zh 로케일 동기화도 원칙적으로 불필요** — 파일럿에서 겪은 "공유 JS가 로케일 마크업과 어긋나 깨지는" 문제를 애초에 피한다
4. 예외적으로 버튼 통합이 필요한 도구(`video-gif`)만 파일럿의 Task 2/3 절차(JS 수정 + 로케일 동기화 + 별도 리뷰)를 따른다

비목표:
- `rotate`/`barcode`/`pdf` (별도 스펙)
- ko/es/zh 번역본의 하단 SEO 안내문/FAQ 수정
- 신규 유틸리티 추가 (별도 브레인스토밍)
- `js/core/*` 변경

## 조사 결과 요약

| 도구 | 액션 버튼 | 설정 카드 수 | 비고 |
|---|---|---|---|
| gif-optimize | 1 (`btn-optimize`) | 2 | |
| gif-speed | 1 (`btn-apply`) | 2 | |
| gif-splitter | 1 (`btn-split`) | 2 | |
| video-gif | 2 (`btn-convert`/`btn-convert-all`) | 2 | **예외** — 버튼 통합 필요 |
| crop | 1 (`btn-crop`) | 4 | |
| resize | 1 (`btn-resize`) | 4 | |
| heic2jpg | 1 (`btn-convert`) | 4 | |
| img-pdf | 1 (`btn-generate`) | 4 | |
| bg-remove | 1 (`btn-remove-bg`) | 4 | |
| base64 | 1 (`btn-convert`) ×2 섹션 | 8 (섹션당 4) | **예외** — 페이지 내 인코드/디코드 2섹션 |
| svg-convert | 1 (`btn-convert`) | 6 | |
| metadata | 1 (`btn-strip`) | 2 | |
| gif-effects | 1 (`btn-run-effects`) | 6 | |
| watermark | 0 (라이브 미리보기, `change`시 자동 갱신) | 6 | 다운로드 버튼만 hero로 승격 |
| color-extractor | 0 (업로드시 자동 추출) | 6 | 다운로드/복사 버튼만 정리 |
| meme-generator | 0 (캔버스 라이브 에디터, `btn-download`만) | 8 | 단독 처리 |

## 접근법

파일럿과 동일하게 **공통 CSS 패턴 재사용 + 페이지별 마크업 수정**(파일럿의 승인된 접근법 A를 계승). 신규 CSS 클래스는 원칙적으로 추가하지 않는다 — Task 1에서 만든 `.tool-flow`/`.advanced-settings`/`.btn-convert-hero`/`.btn-download-hero`를 그대로 재사용한다.

## 공통 레이아웃 패턴 (버튼 1개 도구 — 15개 중 13개 + watermark/color-extractor)

```
[헤더/광고 슬롯]                — 유지
[업로드 드롭존]                — 유지
[미리보기/캔버스/프리뷰 영역]  — 유지
[핵심 액션 버튼]                — .btn-convert-hero (또는 .btn-download-hero) 로 승격, 그대로 1개
▸ 고급 설정                     — <details class="advanced-settings"> 안에 기존 설정 카드 전부 이동
[하단 SEO 안내문]              — 유지
```

- 액션 버튼이 원래 있던 도구(`btn-crop`, `btn-resize` 등): id 유지, 클래스만 `.btn-convert-hero`로 교체
- 라이브 미리보기형(watermark, color-extractor): 별도 변환 버튼 없음 — 기존 다운로드/복사 버튼을 `.btn-download-hero`로 승격, 나머지 설정 카드는 고급 설정으로 이동
- 캔버스 에디터(meme-generator): 텍스트/스티커 편집 컨트롤은 도구의 본질이라 접지 않음. 배경/필터 등 부가 옵션만 고급 설정으로 분리 — Task E 구현 시 어떤 카드가 "핵심"이고 어떤 게 "부가"인지는 각 카드 제목을 근거로 implementer가 판단 후 보고

## 예외 처리

### video-gif (버튼 통합)
`btn-convert`(단일 파일) + `btn-convert-all`(배치)를 jpg-png 패턴처럼 큐 상태 기반 1버튼으로 통합할지, 혹은 단일/배치 두 흐름이 근본적으로 다른 액션이라 통합이 부적절한지 — **구현 전 현재 `js/tools/video-gif.js` 로직을 읽고 판단**. 통합이 부적절하다고 판단되면 두 버튼을 나란히 두되 `.btn-convert-hero` 스타일만 적용(파일럿 예외 처리와 동일한 "판단 후 보고" 원칙). 만약 id가 바뀌면 `ko/es/zh/tools/video-gif.html` 공유 여부 확인 후 동기화까지 같은 커밋에 포함(파일럿 Task 3에서 확립된 절차).

### base64 (2섹션)
인코드/디코드 각각을 독립된 `.tool-flow`로 감싼다. 두 섹션 다 액션 버튼 1개(`btn-convert`이지만 실제로는 인코드/디코드용으로 각각 다른 id일 가능성 있음 — 구현 시 실제 id 확인) + 자체 설정만 있으면 고급 설정으로. 페이지 전체를 하나의 `.tool-flow`로 합치지 않는다.

## 배치 (Task 분할)

| Task | 대상 도구 | 근거 |
|---|---|---|
| A | gif-optimize, gif-speed, gif-splitter, video-gif | 카드 2개, GIF 계열 — video-gif만 예외 처리 포함 |
| B | crop, resize, heic2jpg, img-pdf, bg-remove | 카드 4개, 순수 카드 접기 |
| C | base64, svg-convert, metadata | base64는 2섹션 예외 처리 |
| D | gif-effects, watermark, color-extractor | 카드 6개, 옵션 많음 |
| E | meme-generator | 캔버스 에디터, 카드 8개, 단독 |

각 Task는 여러 파일을 한 커밋으로 묶어 처리(파일럿의 1도구=1태스크보다 세분화 수준 낮춤 — dispatch 비용 절감 목적, 사용자 승인됨).

## 테스트

- 기존 E2E 테스트가 있는 도구(jpg-png/webp-convert/compress 외 다른 도구는 `test/e2e.test.js`에 개별 케이스 없음 — resize/pdf만 있음)는 그대로 통과해야 함. id를 바꾸지 않으므로 회귀 없어야 정상.
- video-gif가 버튼 id를 바꾸는 경우, 신규 E2E 케이스 1개 추가.
- 각 Task 완료 후 모바일 375px 뷰포트에서 가로 스크롤 없음 + 고급 설정 펼침/접힘 확인(파일럿 Task 5와 동일 기준).
- `node test/run-tests.js` 유닛 테스트 회귀 없음(코어 모듈 미변경이므로 자동 보장).

## 완료 기준

- 17개 도구 전부 단일 컬럼 `.tool-flow` + 핵심 액션 1개(또는 근거 있는 예외) + 접힌 고급 설정으로 전환
- 기존 DOM id 보존(video-gif 제외) → ko/es/zh 로케일 무손상, 동기화 불필요
- 전체 유닛/E2E 회귀 없음
- 모바일 375px 확인 완료

## 후속 단계 (이 스펙 범위 외)

1. `rotate`/`barcode`/`pdf` 3개 도구 — 구조가 달라 별도 스펙 필요
2. ko/es/zh 번역본 중 이번에 id가 바뀐 도구(video-gif 등)만이 아니라 전체 시각적 일관성 맞추는 작업(선택 사항)
3. 신규 유틸리티 추가 (별도 브레인스토밍)

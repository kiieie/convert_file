# 🖼️ ConvertFile — 프로젝트 개요

> Windows XP 테마 온라인 이미지/GIF 편집기 (ezgif.com 클론)
> 정적 사이트 · Cloudflare Pages · 서버 비용 $0

---

## 1. 프로젝트 목적

| 항목 | 내용 |
|------|------|
| **제품** | 브라우저 기반 이미지/GIF/비디오 변환·편집 도구 |
| **디자인** | Windows XP 클래식 테마 (제목표시줄, 버튼, 창 테두리, 시작 메뉴 등) |
| **호스팅** | Cloudflare Pages (무료 플랜, 무제한 대역폭) |
| **수익화** | Google AdSense (심사 대비 구조 포함) |
| **기술 스택** | 순수 HTML + CSS + JavaScript (정적 사이트) |
| **참고 사이트** | https://ezgif.com/ |

---

## 2. 핵심 원칙

1. **서버 비용 $0** — 모든 처리는 클라이언트(브라우저)에서 수행
2. **정적 배포** — Cloudflare Pages + GitHub 연동, CI/CD 자동 배포
3. **유지보수 용이** — 모듈 기반 아키텍처, 도구별 독립 파일
4. **SEO 최적화** — 도구별 개별 HTML 페이지, 메타 태그, 시맨틱 마크업
5. **AdSense 심사 통과** — 개인정보처리방침, 이용약관, About 페이지 필수 포함

---

## 3. 기술 스택

```
┌─────────────────────────────────────────────────┐
│  Frontend (100% 클라이언트 사이드)               │
├─────────────────────────────────────────────────┤
│  HTML5          구조 · 시맨틱 마크업 · SEO       │
│  CSS3           Windows XP 테마 · 반응형         │
│  Vanilla JS     도구 로직 · Canvas API           │
│  Canvas API     이미지 편집 · 필터 · 크롭        │
│  Web Workers    무거운 처리 비동기화              │
│  FFmpeg.wasm    비디오/오디오 변환 (Phase 2)     │
│  gif.js         GIF 인코딩/디코딩                │
│  qrcode.js      QR코드 생성                     │
│  pdf-lib        PDF 생성/편집                    │
├─────────────────────────────────────────────────┤
│  Hosting & CI/CD                                │
├─────────────────────────────────────────────────┤
│  Cloudflare Pages   무료 정적 호스팅             │
│  GitHub             소스 관리 + 자동 배포         │
├─────────────────────────────────────────────────┤
│  수익화                                         │
├─────────────────────────────────────────────────┤
│  Google AdSense     광고 수익                    │
└─────────────────────────────────────────────────┘
```

---

## 4. 배포 파이프라인

```
GitHub (main 브랜치)
    │ push
    ▼
Cloudflare Pages (자동 빌드)
    │
    ▼
https://convertfile.pages.dev  (또는 커스텀 도메인)
```

- **빌드 명령**: 없음 (정적 파일 직접 서빙)
- **출력 디렉토리**: `/` (루트)
- **브랜치**: `main`

---

## 5. 개발 단계 (Phases)

### Phase 1 — MVP (핵심 이미지 도구)
- 이미지 리사이즈, 크롭, 회전, 뒤집기
- 포맷 변환 (JPG ↔ PNG ↔ WebP ↔ BMP ↔ ICO)
- 이미지 압축/최적화
- 필터/효과 (흑백, 세피아, 밝기, 대비, 채도)
- 텍스트 추가, 워터마크
- 메타데이터 뷰어/제거
- QR코드/바코드 생성
- Windows XP 테마 UI 완성
- AdSense 심사 필수 페이지 (About, Privacy, Terms)
- SEO 기본 설정

### Phase 2 — GIF 도구
- GIF 만들기 (이미지 → GIF)
- GIF 분할 (프레임 추출)
- GIF 리사이즈/크롭/회전
- GIF 최적화 (파일 크기 줄이기)
- GIF 역재생
- GIF 속도 조절
- GIF 텍스트 추가

### Phase 3 — 고급 변환
- ffmpeg.wasm 기반 비디오 → GIF 변환
- GIF → MP4 변환
- 비디오 자르기/회전/리사이즈
- 오디오 추출/변환
- APNG, AVIF, JXL, SVG 도구
- PDF 관련 도구 (JPG→PDF, PDF 크롭)

### Phase 4 — 폴리시 & 성장
- PWA (오프라인 지원)
- 다국어 지원 (i18n)
- 사용자 설정 기억 (localStorage)
- 성능 최적화
- 추가 광고 슬롯 최적화

---

## 6. 멀티 에이전트 역할 분담

| 에이전트 | 역할 | 담당 파일/영역 |
|----------|------|---------------|
| **🏗️ Architect** | 폴더 구조, 라우팅, 공통 모듈 설계 | `doc/01-architecture.md` |
| **🎨 Designer** | Windows XP 테마 CSS, 컴포넌트 디자인 | `doc/02-design-system.md` |
| **🔧 Tool Builder** | 개별 도구 구현 (이미지 편집, 변환 등) | `doc/03-tool-specs.md` |
| **📄 SEO & Content** | SEO, 메타 태그, AdSense 준비, 법적 페이지 | `doc/04-seo-adsense.md` |
| **🚀 DevOps** | Cloudflare Pages 배포, GitHub 설정, CI/CD | `doc/05-deployment.md` |
| **🧪 QA** | 테스트 전략, 브라우저 호환성, 성능 기준 | `doc/06-qa-testing.md` |

---

## 7. 참조 문서

- [01-architecture.md](./01-architecture.md) — 프로젝트 구조 & 아키텍처
- [02-design-system.md](./02-design-system.md) — Windows XP 디자인 시스템
- [03-tool-specs.md](./03-tool-specs.md) — 도구별 상세 스펙
- [04-seo-adsense.md](./04-seo-adsense.md) — SEO & AdSense 전략
- [05-deployment.md](./05-deployment.md) — 배포 & 인프라
- [06-qa-testing.md](./06-qa-testing.md) — QA & 테스트
- [07-agent-tasks.md](./07-agent-tasks.md) — 멀티 에이전트 작업 명세

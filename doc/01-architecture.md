# 🏗️ ConvertFile — 아키텍처 설계서

> Windows XP 테마 온라인 이미지/GIF 편집기  
> 정적 사이트 · Cloudflare Pages · 순수 HTML/CSS/JS · 서버 비용 $0

---

## 목차

1. [프로젝트 디렉토리 구조](#1-프로젝트-디렉토리-구조)
2. [모듈 아키텍처](#2-모듈-아키텍처)
3. [파일 처리 플로우](#3-파일-처리-플로우)
4. [공통 컴포넌트 설계](#4-공통-컴포넌트-설계)
5. [라우팅 전략](#5-라우팅-전략)
6. [성능 최적화 전략](#6-성능-최적화-전략)

---

## 1. 프로젝트 디렉토리 구조

### 1.1 전체 트리 다이어그램

```
convert_file/
├── index.html                          # 메인 랜딩 페이지 (도구 목록, 소개)
│
├── tools/                              # ── 각 도구별 독립 HTML 페이지 ──
│   ├── resize.html                     #   이미지 리사이즈
│   ├── crop.html                       #   이미지 크롭
│   ├── rotate.html                     #   회전/뒤집기
│   ├── convert.html                    #   포맷 변환 (JPG↔PNG↔WebP↔BMP↔ICO)
│   ├── compress.html                   #   이미지 압축/최적화
│   ├── filters.html                    #   필터/효과 (흑백, 세피아, 밝기 등)
│   ├── text.html                       #   텍스트/워터마크 추가
│   ├── metadata.html                   #   메타데이터 뷰어/제거 (EXIF)
│   ├── qrcode.html                     #   QR코드/바코드 생성
│   ├── gif-maker.html                  #   GIF 만들기 (이미지 → GIF)
│   ├── gif-splitter.html               #   GIF 프레임 분할
│   ├── gif-resize.html                 #   GIF 리사이즈
│   ├── gif-optimize.html               #   GIF 최적화
│   ├── gif-reverse.html                #   GIF 역재생
│   ├── gif-speed.html                  #   GIF 속도 조절
│   └── gif-text.html                   #   GIF 텍스트 추가
│
├── css/                                # ── 스타일시트 ──
│   ├── xp-theme.css                    #   Windows XP 테마 (창, 버튼, 제목표시줄 등)
│   ├── tools.css                       #   도구 페이지 공통 레이아웃
│   ├── layout.css                      #   전체 레이아웃 (헤더, 푸터, 그리드)
│   └── ads.css                         #   광고 슬롯 스타일 (AdSense 대비)
│
├── js/                                 # ── 자바스크립트 ──
│   ├── core/                           #   공통 코어 모듈
│   │   ├── image-loader.js             #     이미지 로딩 (File, URL, Drag&Drop)
│   │   ├── canvas-utils.js             #     Canvas 유틸리티 (그리기, 변환, 필터)
│   │   ├── file-utils.js               #     파일 I/O (다운로드, 포맷 변환, Blob)
│   │   ├── ui-components.js            #     XP 테마 UI 컴포넌트 (동적 생성)
│   │   ├── event-bus.js                #     이벤트 버스 (모듈 간 통신)
│   │   ├── memory-manager.js           #     메모리 관리 (Canvas/Blob 해제)
│   │   └── worker-manager.js           #     Web Worker 관리자
│   │
│   ├── tools/                          #   도구별 비즈니스 로직 모듈
│   │   ├── resize.js                   #     리사이즈 로직
│   │   ├── crop.js                     #     크롭 로직
│   │   ├── rotate.js                   #     회전/뒤집기 로직
│   │   ├── convert.js                  #     포맷 변환 로직
│   │   ├── compress.js                 #     압축/최적화 로직
│   │   ├── filters.js                  #     필터/효과 로직
│   │   ├── text.js                     #     텍스트/워터마크 로직
│   │   ├── metadata.js                 #     EXIF 메타데이터 로직
│   │   ├── qrcode.js                   #     QR코드 생성 로직
│   │   ├── gif-maker.js                #     GIF 생성 로직
│   │   ├── gif-splitter.js             #     GIF 분할 로직
│   │   ├── gif-resize.js               #     GIF 리사이즈 로직
│   │   ├── gif-optimize.js             #     GIF 최적화 로직
│   │   ├── gif-reverse.js              #     GIF 역재생 로직
│   │   ├── gif-speed.js                #     GIF 속도 조절 로직
│   │   └── gif-text.js                 #     GIF 텍스트 로직
│   │
│   ├── workers/                        #   Web Worker 스크립트 (별도 스레드)
│   │   ├── image-process.worker.js     #     이미지 처리 워커
│   │   └── gif-process.worker.js       #     GIF 처리 워커
│   │
│   └── vendors/                        #   외부 라이브러리 (CDN 대신 로컬)
│       ├── gif.js                      #     GIF 인코딩 라이브러리
│       ├── gif.worker.js               #     gif.js 전용 워커
│       ├── qrcode.min.js               #     QR코드 생성 라이브러리
│       └── pdf-lib.min.js              #     PDF 생성/편집 라이브러리
│
├── assets/                             # ── 정적 리소스 ──
│   ├── icons/                          #   아이콘 파일
│   │   ├── favicon.ico                 #     파비콘
│   │   ├── logo.png                    #     사이트 로고
│   │   ├── tool-resize.png             #     도구별 아이콘
│   │   ├── tool-crop.png               #     ...
│   │   ├── tool-rotate.png             #     ...
│   │   ├── tool-convert.png            #     ...
│   │   └── ...                         #     기타 도구 아이콘
│   │
│   ├── xp/                             #   Windows XP 테마 이미지
│   │   ├── titlebar-left.png           #     제목표시줄 좌측
│   │   ├── titlebar-center.png         #     제목표시줄 중앙 (반복)
│   │   ├── titlebar-right.png          #     제목표시줄 우측
│   │   ├── btn-close.png               #     닫기 버튼
│   │   ├── btn-maximize.png            #     최대화 버튼
│   │   ├── btn-minimize.png            #     최소화 버튼
│   │   ├── btn-normal.png              #     기본 버튼 배경
│   │   ├── btn-hover.png               #     버튼 호버 배경
│   │   ├── btn-pressed.png             #     버튼 클릭 배경
│   │   ├── scrollbar-track.png         #     스크롤바 트랙
│   │   ├── scrollbar-thumb.png         #     스크롤바 썸
│   │   ├── progress-bar.png            #     진행 바
│   │   ├── window-border.png           #     창 테두리
│   │   ├── taskbar-bg.png              #     작업표시줄 배경
│   │   ├── start-button.png            #     시작 버튼
│   │   └── wallpaper.jpg               #     배경 바탕화면 (블리스)
│   │
│   └── og/                             #   OG 이미지 (소셜 공유)
│       └── og-default.png              #     기본 OG 이미지 (1200×630)
│
├── pages/                              # ── 정적 정보 페이지 (AdSense 심사 필수) ──
│   ├── about.html                      #   사이트 소개 페이지
│   ├── privacy.html                    #   개인정보처리방침
│   ├── terms.html                      #   이용약관
│   └── contact.html                    #   문의/연락처 페이지
│
├── doc/                                # ── 개발 문서 (배포 미포함) ──
│   ├── 00-project-overview.md          #   프로젝트 개요
│   ├── 01-architecture.md              #   아키텍처 설계서 (본 문서)
│   ├── 02-design-system.md             #   Windows XP 디자인 시스템
│   ├── 03-tool-specs.md                #   도구별 상세 스펙
│   ├── 04-seo-adsense.md               #   SEO & AdSense 전략
│   ├── 05-deployment.md                #   배포 & 인프라
│   └── 06-qa-testing.md                #   QA & 테스트
│
├── _headers                            # Cloudflare Pages 커스텀 헤더
├── _redirects                          # Cloudflare Pages 리다이렉트 규칙
├── robots.txt                          # 검색엔진 크롤러 지시
├── sitemap.xml                         # 사이트맵
└── 404.html                            # 커스텀 404 페이지 (XP 스타일)
```

### 1.2 디렉토리 역할 요약

| 디렉토리 | 역할 | 배포 포함 | 비고 |
|-----------|------|:---------:|------|
| `/` | 루트 — 메인 페이지, 설정 파일 | ✅ | `index.html`, `robots.txt`, `sitemap.xml` |
| `/tools/` | 도구별 독립 HTML 페이지 | ✅ | 1 도구 = 1 HTML 파일, SEO 최적화 단위 |
| `/css/` | 스타일시트 | ✅ | XP 테마 + 도구 + 레이아웃 + 광고 |
| `/js/core/` | 공통 코어 모듈 | ✅ | 모든 도구 페이지가 공유하는 기능 |
| `/js/tools/` | 도구별 로직 모듈 | ✅ | 각 도구 페이지가 자기 모듈만 로드 |
| `/js/workers/` | Web Worker 스크립트 | ✅ | 별도 스레드에서 무거운 처리 수행 |
| `/js/vendors/` | 외부 라이브러리 | ✅ | CDN 장애 방지, 로컬 서빙 |
| `/assets/` | 아이콘, XP 테마 이미지, OG 이미지 | ✅ | 정적 리소스 |
| `/pages/` | 법적/정보 페이지 | ✅ | AdSense 심사 필수 |
| `/doc/` | 개발 문서 | ❌ | `.gitignore` 또는 배포 제외 |

### 1.3 파일 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| HTML 파일 | 케밥 케이스, 소문자 | `gif-maker.html`, `resize.html` |
| CSS 파일 | 케밥 케이스, 역할 기반 | `xp-theme.css`, `tools.css` |
| JS 코어 모듈 | 케밥 케이스 | `image-loader.js`, `canvas-utils.js` |
| JS 도구 모듈 | 도구 HTML과 동일한 이름 | `resize.js` → `resize.html` |
| Worker 파일 | `*.worker.js` 접미사 | `image-process.worker.js` |
| 이미지 리소스 | 케밥 케이스, 접두사로 분류 | `tool-resize.png`, `btn-close.png` |

---

## 2. 모듈 아키텍처

### 2.1 모듈 관계도

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTML 페이지                               │
│  tools/resize.html  tools/crop.html  tools/convert.html  ...    │
└────────┬──────────────────┬──────────────────┬──────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JS 도구 모듈 (js/tools/)                      │
│  resize.js          crop.js          convert.js          ...     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │ loadImage() │   │ loadImage() │   │ loadImage() │           │
│  │ process()   │   │ process()   │   │ process()   │           │
│  │ download()  │   │ download()  │   │ download()  │           │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘           │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    JS 코어 모듈 (js/core/)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ image-loader │ │ canvas-utils │ │ file-utils   │            │
│  │              │ │              │ │              │            │
│  │ • loadFile() │ │ • drawImage()│ │ • download() │            │
│  │ • loadURL()  │ │ • applyFilter│ │ • toBlob()   │            │
│  │ • loadDrop() │ │ • resize()   │ │ • toDataURL()│            │
│  └──────────────┘ └──────┬───────┘ └──────────────┘            │
│  ┌──────────────┐        │        ┌──────────────┐             │
│  │ ui-components│        │        │ event-bus    │             │
│  │              │        │        │              │             │
│  │ • XPWindow() │        │        │ • emit()     │             │
│  │ • XPButton() │        │        │ • on()       │             │
│  │ • Progress() │        │        │ • off()      │             │
│  └──────────────┘        │        └──────────────┘             │
│  ┌──────────────┐        │        ┌──────────────┐             │
│  │memory-manager│        │        │worker-manager│             │
│  │              │        │        │              │             │
│  │ • track()    │        │        │ • run()      │             │
│  │ • release()  │        │        │ • terminate()│             │
│  │ • cleanup()  │        │        │ • onMessage()│             │
│  └──────────────┘        │        └──────┬───────┘             │
└──────────────────────────┼───────────────┼─────────────────────┘
                           │               │
                           ▼               ▼
                ┌─────────────────────────────────┐
                │      Web Workers (js/workers/)   │
                │  image-process.worker.js         │
                │  gif-process.worker.js           │
                └──────────────┬──────────────────┘
                               │
                               ▼
                ┌─────────────────────────────────┐
                │   외부 라이브러리 (js/vendors/)    │
                │  gif.js  qrcode.min.js           │
                │  pdf-lib.min.js                  │
                └─────────────────────────────────┘
```

### 2.2 공통 도구 인터페이스

**모든 도구 모듈은 동일한 인터페이스를 따른다.** 이를 통해 코어 모듈과의 일관된 연동, 테스트 용이성, 신규 도구 추가 시 학습 비용 최소화를 달성한다.

```javascript
/**
 * 도구 모듈 공통 인터페이스 (js/tools/의 모든 파일이 이 패턴을 따름)
 * 
 * 핵심 원칙:
 *   1. 각 모듈은 즉시실행함수(IIFE)로 캡슐화 → 전역 오염 방지
 *   2. 3단계 파이프라인: 로드 → 처리 → 다운로드
 *   3. 이벤트 버스를 통한 UI 업데이트 → DOM 직접 조작 최소화
 */

// js/tools/resize.js — 리사이즈 도구 예시
const ResizeTool = (function() {
    'use strict';

    // ──── 내부 상태 ────
    // 현재 로드된 원본 이미지 데이터
    let _originalImage = null;
    // 처리된 결과 이미지 데이터
    let _processedImage = null;
    // 현재 도구 설정값
    let _settings = {
        width: 0,       // 목표 너비 (px)
        height: 0,      // 목표 높이 (px)
        maintainRatio: true,  // 종횡비 유지 여부
        method: 'bilinear'    // 보간법: 'nearest' | 'bilinear' | 'bicubic'
    };

    // ──── 1단계: 이미지 로드 ────
    /**
     * 이미지 로드 — File 객체, URL, Drag&Drop 모두 지원
     * @param {File|string} source - File 객체 또는 이미지 URL
     * @returns {Promise<HTMLImageElement>} 로드된 이미지 엘리먼트
     */
    async function loadImage(source) {
        // 코어 모듈의 이미지 로더 사용
        _originalImage = await ImageLoader.load(source);

        // 원본 크기를 설정값 초기화에 사용
        _settings.width = _originalImage.naturalWidth;
        _settings.height = _originalImage.naturalHeight;

        // UI에 원본 이미지 표시 이벤트 발행
        EventBus.emit('image:loaded', {
            image: _originalImage,
            width: _settings.width,
            height: _settings.height,
            fileSize: source.size || 0
        });

        return _originalImage;
    }

    // ──── 2단계: 이미지 처리 ────
    /**
     * 이미지 리사이즈 처리
     * @param {Object} options - { width, height, maintainRatio, method }
     * @returns {Promise<ImageData>} 처리된 이미지 데이터
     */
    async function processImage(options = {}) {
        // 설정값 병합
        Object.assign(_settings, options);

        // 진행 상태 이벤트 발행
        EventBus.emit('process:start', { tool: 'resize' });

        try {
            // Canvas에서 리사이즈 수행
            _processedImage = await CanvasUtils.resize(
                _originalImage,
                _settings.width,
                _settings.height,
                _settings.method
            );

            // 처리 완료 이벤트 발행 — UI에 결과 미리보기 표시
            EventBus.emit('process:complete', {
                tool: 'resize',
                result: _processedImage,
                width: _settings.width,
                height: _settings.height
            });

            return _processedImage;
        } catch (error) {
            // 에러 이벤트 발행 — UI에 에러 메시지 표시
            EventBus.emit('process:error', {
                tool: 'resize',
                error: error.message
            });
            throw error;
        }
    }

    // ──── 3단계: 결과 다운로드 ────
    /**
     * 처리된 이미지를 파일로 다운로드
     * @param {string} format - 출력 포맷 ('png' | 'jpeg' | 'webp')
     * @param {number} quality - 품질 (0.0 ~ 1.0, JPEG/WebP만 해당)
     * @param {string} filename - 다운로드 파일명
     */
    async function downloadResult(format = 'png', quality = 0.92, filename = '') {
        if (!_processedImage) {
            throw new Error('처리된 이미지 없음. processImage()를 먼저 호출하세요.');
        }

        // 파일명 자동 생성: 원본파일명_resized.포맷
        const outputName = filename ||
            FileUtils.generateFilename('resized', format);

        // Blob 생성 후 다운로드 트리거
        await FileUtils.downloadCanvas(
            _processedImage,
            outputName,
            `image/${format}`,
            quality
        );

        // 다운로드 완료 이벤트 발행
        EventBus.emit('download:complete', {
            tool: 'resize',
            filename: outputName
        });
    }

    // ──── 정리 ────
    /**
     * 메모리 해제 — 페이지 이탈 또는 새 이미지 로드 시 호출
     */
    function cleanup() {
        MemoryManager.release(_originalImage);
        MemoryManager.release(_processedImage);
        _originalImage = null;
        _processedImage = null;
    }

    // ──── 공개 API ────
    return {
        loadImage,
        processImage,
        downloadResult,
        cleanup,
        // 현재 설정값 읽기 (읽기 전용)
        getSettings: () => ({ ..._settings })
    };
})();
```

### 2.3 Canvas 파이프라인 패턴

모든 이미지 처리는 **Canvas 파이프라인**을 통해 수행된다. 이 패턴은 여러 변환을 체인으로 연결할 수 있다.

```javascript
/**
 * Canvas 파이프라인 — 변환을 순차 체이닝하는 패턴
 * 
 * 원리:
 *   소스 Canvas → 변환1 → 임시 Canvas → 변환2 → ... → 최종 Canvas
 *   각 변환 단계에서 새 Canvas를 생성하고, 이전 Canvas는 해제
 */

// js/core/canvas-utils.js — Canvas 파이프라인 핵심
const CanvasUtils = (function() {
    'use strict';

    /**
     * 이미지를 Canvas에 그리기
     * @param {HTMLImageElement} img - 소스 이미지
     * @returns {HTMLCanvasElement} 이미지가 그려진 Canvas
     */
    function imageToCanvas(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas;
    }

    /**
     * 리사이즈 변환
     * @param {HTMLImageElement|HTMLCanvasElement} source - 소스
     * @param {number} width - 목표 너비
     * @param {number} height - 목표 높이
     * @param {string} method - 보간법
     * @returns {HTMLCanvasElement} 리사이즈된 Canvas
     */
    function resize(source, width, height, method = 'bilinear') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 보간법 설정 — 브라우저 imageSmoothingQuality 사용
        ctx.imageSmoothingEnabled = (method !== 'nearest');
        ctx.imageSmoothingQuality = method === 'bicubic' ? 'high' : 'medium';

        ctx.drawImage(source, 0, 0, width, height);
        return canvas;
    }

    /**
     * 크롭 변환
     * @param {HTMLImageElement|HTMLCanvasElement} source - 소스
     * @param {Object} rect - { x, y, width, height } 크롭 영역
     * @returns {HTMLCanvasElement} 크롭된 Canvas
     */
    function crop(source, rect) {
        const canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        // 소스의 (x, y) 위치에서 (width, height) 크기만큼 잘라서 그리기
        ctx.drawImage(
            source,
            rect.x, rect.y, rect.width, rect.height,  // 소스 영역
            0, 0, rect.width, rect.height               // 대상 영역
        );
        return canvas;
    }

    /**
     * 회전 변환
     * @param {HTMLImageElement|HTMLCanvasElement} source - 소스
     * @param {number} degrees - 회전 각도 (90, 180, 270 또는 임의 각도)
     * @returns {HTMLCanvasElement} 회전된 Canvas
     */
    function rotate(source, degrees) {
        const radians = (degrees * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        // 회전 후 Canvas 크기 계산
        const newWidth = Math.floor(source.width * cos + source.height * sin);
        const newHeight = Math.floor(source.width * sin + source.height * cos);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');

        // 중심을 기준으로 회전
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);
        ctx.drawImage(source, -source.width / 2, -source.height / 2);

        return canvas;
    }

    /**
     * 필터 적용 — ImageData 픽셀 직접 조작
     * @param {HTMLCanvasElement} sourceCanvas - 소스 Canvas
     * @param {string} filterName - 필터 이름 ('grayscale'|'sepia'|'invert' 등)
     * @param {number} intensity - 필터 강도 (0.0 ~ 1.0)
     * @returns {HTMLCanvasElement} 필터 적용된 Canvas
     */
    function applyFilter(sourceCanvas, filterName, intensity = 1.0) {
        const canvas = document.createElement('canvas');
        canvas.width = sourceCanvas.width;
        canvas.height = sourceCanvas.height;
        const ctx = canvas.getContext('2d');

        // 소스 픽셀 데이터 가져오기
        const srcCtx = sourceCanvas.getContext('2d');
        const imageData = srcCtx.getImageData(
            0, 0, sourceCanvas.width, sourceCanvas.height
        );
        const data = imageData.data;  // Uint8ClampedArray [R,G,B,A, R,G,B,A, ...]

        // 필터별 픽셀 변환 로직
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];      // 빨강
            const g = data[i + 1];  // 초록
            const b = data[i + 2];  // 파랑
            // data[i + 3]은 알파 (투명도) — 변경하지 않음

            switch (filterName) {
                case 'grayscale': {
                    // ITU-R BT.601 가중 평균 (인간 시각 특성 반영)
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    data[i]     = r + (gray - r) * intensity;
                    data[i + 1] = g + (gray - g) * intensity;
                    data[i + 2] = b + (gray - b) * intensity;
                    break;
                }
                case 'sepia': {
                    // 세피아 톤 매트릭스
                    const sr = Math.min(255, 0.393*r + 0.769*g + 0.189*b);
                    const sg = Math.min(255, 0.349*r + 0.686*g + 0.168*b);
                    const sb = Math.min(255, 0.272*r + 0.534*g + 0.131*b);
                    data[i]     = r + (sr - r) * intensity;
                    data[i + 1] = g + (sg - g) * intensity;
                    data[i + 2] = b + (sb - b) * intensity;
                    break;
                }
                case 'invert': {
                    data[i]     = r + (255 - 2 * r) * intensity;
                    data[i + 1] = g + (255 - 2 * g) * intensity;
                    data[i + 2] = b + (255 - 2 * b) * intensity;
                    break;
                }
                // 밝기, 대비, 채도 등 추가 필터는 여기에 확장
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    /**
     * 파이프라인 실행 — 여러 변환을 순차 적용
     * @param {HTMLImageElement} sourceImage - 원본 이미지
     * @param {Array<Function>} transforms - 변환 함수 배열
     * @returns {HTMLCanvasElement} 최종 결과 Canvas
     *
     * 사용 예:
     *   pipeline(img, [
     *     (canvas) => resize(canvas, 800, 600),
     *     (canvas) => applyFilter(canvas, 'grayscale', 0.5),
     *     (canvas) => rotate(canvas, 90)
     *   ]);
     */
    function pipeline(sourceImage, transforms) {
        let current = imageToCanvas(sourceImage);

        for (const transform of transforms) {
            const previous = current;
            current = transform(current);
            // 이전 단계의 Canvas 메모리 해제
            MemoryManager.release(previous);
        }

        return current;
    }

    return {
        imageToCanvas,
        resize,
        crop,
        rotate,
        applyFilter,
        pipeline
    };
})();
```

### 2.4 Web Worker 패턴

무거운 이미지 처리(필터 픽셀 조작, GIF 인코딩 등)는 **Web Worker**에서 수행하여 UI 스레드 블로킹을 방지한다.

```javascript
/**
 * Worker 관리자 — Worker 생성/통신/종료를 추상화
 * 
 * 설계 원칙:
 *   1. Worker 생성 비용 최소화 — 재사용 풀 관리
 *   2. Promise 기반 API — 콜백 대신 async/await
 *   3. 진행률 콜백 지원 — Worker에서 중간 상태 보고
 *   4. 타임아웃 처리 — 무한 대기 방지
 */

// js/core/worker-manager.js
const WorkerManager = (function() {
    'use strict';

    // 활성 Worker 맵 — 키: 작업 ID, 값: Worker 인스턴스
    const _activeWorkers = new Map();
    // 작업 ID 카운터
    let _taskIdCounter = 0;

    /**
     * Worker에서 작업 실행
     * @param {string} workerPath - Worker 스크립트 경로
     * @param {Object} data - Worker에 전달할 데이터
     * @param {Function} onProgress - 진행률 콜백 (0~100)
     * @param {number} timeout - 타임아웃 (밀리초, 기본 30초)
     * @returns {Promise<any>} Worker 처리 결과
     */
    function run(workerPath, data, onProgress = null, timeout = 30000) {
        const taskId = ++_taskIdCounter;

        return new Promise((resolve, reject) => {
            const worker = new Worker(workerPath);
            _activeWorkers.set(taskId, worker);

            // 타임아웃 타이머
            const timer = setTimeout(() => {
                worker.terminate();
                _activeWorkers.delete(taskId);
                reject(new Error(`Worker 타임아웃: ${timeout}ms 초과`));
            }, timeout);

            // Worker 메시지 수신 핸들러
            worker.onmessage = function(e) {
                const { type, payload } = e.data;

                switch (type) {
                    case 'progress':
                        // 진행률 업데이트 — UI에 반영
                        if (onProgress) onProgress(payload.percent);
                        break;
                    case 'complete':
                        // 처리 완료 — 정리 후 결과 반환
                        clearTimeout(timer);
                        worker.terminate();
                        _activeWorkers.delete(taskId);
                        resolve(payload.result);
                        break;
                    case 'error':
                        // 에러 발생 — 정리 후 에러 전파
                        clearTimeout(timer);
                        worker.terminate();
                        _activeWorkers.delete(taskId);
                        reject(new Error(payload.message));
                        break;
                }
            };

            // Worker 에러 핸들러
            worker.onerror = function(error) {
                clearTimeout(timer);
                worker.terminate();
                _activeWorkers.delete(taskId);
                reject(error);
            };

            // Worker에 작업 데이터 전송
            // Transferable 객체 사용 — 대용량 ArrayBuffer 복사 방지
            const transferables = data.transferables || [];
            worker.postMessage(
                { type: 'process', taskId, payload: data },
                transferables
            );
        });
    }

    /**
     * 모든 활성 Worker 강제 종료
     * — 페이지 이탈 시 호출
     */
    function terminateAll() {
        for (const [id, worker] of _activeWorkers) {
            worker.terminate();
        }
        _activeWorkers.clear();
    }

    return { run, terminateAll };
})();
```

**Worker 스크립트 예시:**

```javascript
// js/workers/image-process.worker.js
// — 메인 스레드와 분리된 별도 스크립트 파일

self.onmessage = function(e) {
    const { type, taskId, payload } = e.data;

    if (type !== 'process') return;

    try {
        const { operation, imageData, options } = payload;

        switch (operation) {
            case 'applyFilter':
                // 픽셀 단위 필터 적용 — 무거운 연산
                const result = applyFilterWorker(
                    imageData, options.filterName, options.intensity
                );
                // Transferable로 결과 반환 — 복사 대신 소유권 이전
                self.postMessage(
                    { type: 'complete', payload: { result } },
                    [result.data.buffer]
                );
                break;
            // 기타 연산...
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            payload: { message: error.message }
        });
    }
};

/**
 * Worker 내부 필터 적용 함수
 * — 메인 스레드의 CanvasUtils.applyFilter와 동일한 로직
 * — 단, ImageData를 직접 받아 처리
 */
function applyFilterWorker(imageData, filterName, intensity) {
    const data = imageData.data;
    const totalPixels = data.length / 4;
    let lastProgress = 0;

    for (let i = 0; i < data.length; i += 4) {
        // 10% 단위로 진행률 보고
        const progress = Math.floor((i / data.length) * 100);
        if (progress >= lastProgress + 10) {
            lastProgress = progress;
            self.postMessage({
                type: 'progress',
                payload: { percent: progress }
            });
        }

        // 필터 로직 (그레이스케일 예시)
        if (filterName === 'grayscale') {
            const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
            data[i]   = data[i]   + (gray - data[i])   * intensity;
            data[i+1] = data[i+1] + (gray - data[i+1]) * intensity;
            data[i+2] = data[i+2] + (gray - data[i+2]) * intensity;
        }
    }

    return imageData;
}
```

### 2.5 이벤트 버스 패턴

모듈 간 통신은 **이벤트 버스**를 통해 느슨한 결합(loose coupling)을 유지한다.

```javascript
/**
 * 이벤트 버스 — Pub/Sub 패턴으로 모듈 간 통신
 * 
 * 사용 이벤트 목록:
 *   'image:loaded'       — 이미지 로드 완료 시
 *   'process:start'      — 처리 시작 시 (프로그레스바 표시)
 *   'process:progress'   — 처리 진행률 업데이트
 *   'process:complete'   — 처리 완료 시 (결과 미리보기 표시)
 *   'process:error'      — 에러 발생 시 (에러 토스트 표시)
 *   'download:complete'  — 다운로드 완료 시
 *   'settings:changed'   — 도구 설정값 변경 시
 *   'memory:warning'     — 메모리 사용량 임계값 초과 시
 */

// js/core/event-bus.js
const EventBus = (function() {
    'use strict';

    // 이벤트명 → 핸들러 배열 맵
    const _listeners = {};

    /**
     * 이벤트 구독
     * @param {string} event - 이벤트명
     * @param {Function} handler - 핸들러 함수
     */
    function on(event, handler) {
        if (!_listeners[event]) {
            _listeners[event] = [];
        }
        _listeners[event].push(handler);
    }

    /**
     * 이벤트 구독 해제
     * @param {string} event - 이벤트명
     * @param {Function} handler - 제거할 핸들러
     */
    function off(event, handler) {
        if (!_listeners[event]) return;
        _listeners[event] = _listeners[event].filter(h => h !== handler);
    }

    /**
     * 이벤트 일회성 구독 — 한 번 호출 후 자동 해제
     */
    function once(event, handler) {
        const wrapper = function(data) {
            handler(data);
            off(event, wrapper);
        };
        on(event, wrapper);
    }

    /**
     * 이벤트 발행 — 등록된 모든 핸들러 호출
     * @param {string} event - 이벤트명
     * @param {any} data - 전달할 데이터
     */
    function emit(event, data) {
        if (!_listeners[event]) return;
        // 핸들러 배열 복사 후 순회 — 핸들러 내에서 off 호출 시 안전
        [..._listeners[event]].forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`EventBus 핸들러 에러 [${event}]:`, error);
            }
        });
    }

    return { on, off, once, emit };
})();
```

### 2.6 도구 페이지 HTML 스크립트 로딩 순서

각 도구 페이지의 `<script>` 태그 로딩 순서는 의존성 순서를 따른다:

```html
<!-- tools/resize.html — 스크립트 로딩 순서 예시 -->

<!-- 1단계: 코어 모듈 (순서 중요) -->
<script src="/js/core/event-bus.js"></script>        <!-- 최우선 — 다른 모듈이 의존 -->
<script src="/js/core/memory-manager.js"></script>   <!-- 메모리 관리 -->
<script src="/js/core/image-loader.js"></script>     <!-- 이미지 로딩 -->
<script src="/js/core/canvas-utils.js"></script>     <!-- Canvas 유틸리티 -->
<script src="/js/core/file-utils.js"></script>       <!-- 파일 I/O -->
<script src="/js/core/worker-manager.js"></script>   <!-- Worker 관리 -->
<script src="/js/core/ui-components.js"></script>     <!-- XP UI 컴포넌트 -->

<!-- 2단계: 해당 도구 모듈 -->
<script src="/js/tools/resize.js"></script>          <!-- 리사이즈 도구 로직 -->

<!-- 3단계: 외부 라이브러리 (필요한 도구만 로드, lazy) -->
<!-- resize는 vendor 불필요. gif-maker.html에서만 gif.js 로드 -->

<!-- 4단계: 페이지 초기화 -->
<script>
    // DOM 로드 완료 후 도구 초기화
    document.addEventListener('DOMContentLoaded', function() {
        // XP 윈도우 컴포넌트 초기화
        UIComponents.initXPWindow();
        // 드롭존 초기화
        UIComponents.initDropzone('dropzone', ResizeTool.loadImage);
        // 페이지 이탈 시 정리
        window.addEventListener('beforeunload', ResizeTool.cleanup);
    });
</script>
```

---

## 3. 파일 처리 플로우

### 3.1 전체 플로우 다이어그램

```
┌──────────────────────────────────────────────────────────────────────┐
│                          사용자 액션                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                     │
│  │ 파일 선택   │  │ 드래그&드롭 │  │  URL 붙여넣기│                     │
│  │ (클릭)     │  │            │  │            │                     │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                     │
│        │               │               │                            │
└────────┼───────────────┼───────────────┼────────────────────────────┘
         │               │               │
         ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     image-loader.js (입력 통합)                       │
│                                                                      │
│  1. File 객체 / URL 수신                                             │
│  2. MIME 타입 검증 (허용된 포맷만 통과)                                │
│  3. 파일 크기 검증 (50MB 제한)                                        │
│  4. FileReader / fetch로 데이터 로드                                  │
│  5. new Image()로 디코딩                                             │
│  6. EventBus.emit('image:loaded') 발행                               │
│                                                                      │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     미리보기 표시 (UI 업데이트)                        │
│                                                                      │
│  • 원본 이미지 미리보기 렌더링                                        │
│  • 파일 정보 표시 (크기, 해상도, 포맷, 파일 용량)                      │
│  • 도구 설정 패널 활성화                                              │
│  • 초기 설정값 자동 채움 (예: 리사이즈 → 원본 크기 표시)               │
│                                                                      │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     사용자 설정 조정                                   │
│                                                                      │
│  • 도구별 파라미터 입력 (예: 너비/높이, 크롭 영역, 필터 강도)           │
│  • 실시간 미리보기 업데이트 (디바운스 적용, 300ms)                     │
│  • EventBus.emit('settings:changed') 발행                            │
│                                                                      │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  "적용" 버튼 클릭 → processImage()                    │
│                                                                      │
│  ┌─────────────────────────────────────────────┐                     │
│  │ 소규모 처리 (< 2MP)         대규모 처리 (≥ 2MP) │                  │
│  │                             또는 GIF 처리       │                  │
│  │ → 메인 스레드 Canvas        → Web Worker         │                  │
│  │   CanvasUtils.resize()      WorkerManager.run()  │                  │
│  │   CanvasUtils.crop()        image-process.worker  │                  │
│  │   CanvasUtils.rotate()      gif-process.worker    │                  │
│  └──────────┬──────────────────────────┬────────────┘                │
│             │                          │                             │
│             │   ← progress 이벤트 →    │                             │
│             │   (XP 프로그레스바 업데이트)│                            │
│             │                          │                             │
│             ▼                          ▼                             │
│  ┌──────────────────────────────────────────┐                        │
│  │     결과 Canvas / ImageData 생성          │                        │
│  │     EventBus.emit('process:complete')     │                        │
│  └──────────────────────────────────────────┘                        │
│                                                                      │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     결과 미리보기                                     │
│                                                                      │
│  • Before/After 비교 슬라이더 표시                                   │
│  • 결과 이미지 정보 (새 해상도, 예상 파일 크기)                       │
│  • 출력 포맷 선택 (PNG / JPEG / WebP)                                │
│  • 품질 슬라이더 (JPEG/WebP: 0~100%)                                 │
│                                                                      │
└────────────────────────┬─────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  "다운로드" 버튼 클릭 → downloadResult()              │
│                                                                      │
│  1. Canvas → Blob 변환 (canvas.toBlob())                             │
│  2. Blob → Object URL 생성 (URL.createObjectURL())                   │
│  3. <a download> 태그 동적 생성 → 클릭 트리거                        │
│  4. Object URL 해제 (URL.revokeObjectURL()) — 메모리 회수            │
│  5. EventBus.emit('download:complete') 발행                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 입력 방식 상세

#### 3.2.1 파일 선택 (File Picker)

```javascript
/**
 * 파일 선택 입력 — <input type="file"> 활용
 * — 다중 선택 지원 (GIF 만들기 도구에서 사용)
 */

// js/core/image-loader.js — loadFromFile()
const ImageLoader = (function() {
    'use strict';

    // 허용 MIME 타입 목록
    const ALLOWED_TYPES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/bmp',
        'image/gif', 'image/svg+xml', 'image/x-icon',
        'image/avif', 'image/apng'
    ];

    // 최대 파일 크기 (50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * File 객체에서 이미지 로드
     * @param {File} file - 사용자가 선택한 파일
     * @returns {Promise<HTMLImageElement>} 로드된 이미지
     * @throws {Error} 지원하지 않는 포맷 또는 크기 초과 시
     */
    async function loadFromFile(file) {
        // ── 검증 ──
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error(
                `지원하지 않는 포맷: ${file.type}\n` +
                `허용: ${ALLOWED_TYPES.join(', ')}`
            );
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                `파일 크기 초과: ${(file.size / 1024 / 1024).toFixed(1)}MB\n` +
                `최대: ${MAX_FILE_SIZE / 1024 / 1024}MB`
            );
        }

        // ── 로드 ──
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('이미지 디코딩 실패'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * URL에서 이미지 로드
     * @param {string} url - 이미지 URL
     * @returns {Promise<HTMLImageElement>} 로드된 이미지
     */
    async function loadFromURL(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';  // CORS 허용 — Canvas taint 방지
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`URL 로드 실패: ${url}`));
            img.src = url;
        });
    }

    /**
     * 통합 로드 함수 — File 또는 URL 자동 판별
     * @param {File|string} source - File 객체 또는 URL 문자열
     * @returns {Promise<HTMLImageElement>}
     */
    async function load(source) {
        if (source instanceof File) {
            return loadFromFile(source);
        }
        if (typeof source === 'string') {
            return loadFromURL(source);
        }
        throw new Error('지원하지 않는 소스 타입');
    }

    return { load, loadFromFile, loadFromURL, ALLOWED_TYPES, MAX_FILE_SIZE };
})();
```

#### 3.2.2 드래그 & 드롭

```javascript
/**
 * 드래그 & 드롭 처리
 * — 드롭존 영역에 파일 드래그 시 시각적 피드백 제공
 * — XP 테마 스타일의 드롭 오버레이 표시
 */

// js/core/ui-components.js 내 initDropzone() 일부
function initDropzone(elementId, onFileCallback) {
    const dropzone = document.getElementById(elementId);

    // 드래그 진입 — 시각적 하이라이트
    dropzone.addEventListener('dragenter', function(e) {
        e.preventDefault();
        dropzone.classList.add('xp-dropzone--active');
    });

    // 드래그 오버 — 기본 동작 방지 (필수)
    dropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';  // 복사 커서 표시
    });

    // 드래그 이탈 — 하이라이트 제거
    dropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropzone.classList.remove('xp-dropzone--active');
    });

    // 드롭 — 파일 처리
    dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropzone.classList.remove('xp-dropzone--active');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // 첫 번째 파일만 처리 (단일 파일 도구)
            // GIF 만들기 도구는 여러 파일 처리
            onFileCallback(files[0]);
        }
    });

    // 클릭 시 파일 선택 대화상자 열기
    const fileInput = dropzone.querySelector('input[type="file"]');
    dropzone.addEventListener('click', function() {
        fileInput.click();
    });
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            onFileCallback(e.target.files[0]);
        }
    });
}
```

#### 3.2.3 URL 붙여넣기

```javascript
/**
 * URL 붙여넣기 입력
 * — 입력 필드에 이미지 URL을 붙여넣으면 자동 로드
 * — CORS 제한 시 안내 메시지 표시
 */

function initURLInput(inputId, onLoadCallback) {
    const input = document.getElementById(inputId);

    input.addEventListener('paste', async function(e) {
        // 약간의 지연 — paste 이벤트 후 input.value 업데이트 대기
        setTimeout(async () => {
            const url = input.value.trim();
            if (!url) return;

            // URL 형식 검증
            try {
                new URL(url);  // 유효한 URL인지 검사
            } catch {
                EventBus.emit('process:error', {
                    error: '유효한 URL을 입력하세요.'
                });
                return;
            }

            try {
                const img = await ImageLoader.loadFromURL(url);
                onLoadCallback(img);
            } catch (error) {
                EventBus.emit('process:error', {
                    error: 'URL에서 이미지를 불러올 수 없습니다.\n' +
                           'CORS 정책으로 차단되었을 수 있습니다.'
                });
            }
        }, 100);
    });
}
```

### 3.3 지원 포맷 매트릭스

#### 3.3.1 입력 포맷

| 포맷 | MIME 타입 | 확장자 | 용도 | 브라우저 지원 |
|------|-----------|--------|------|:------------:|
| JPEG | `image/jpeg` | `.jpg`, `.jpeg` | 사진 | ✅ 전체 |
| PNG | `image/png` | `.png` | 투명 이미지 | ✅ 전체 |
| WebP | `image/webp` | `.webp` | 웹 최적화 | ✅ 전체 |
| GIF | `image/gif` | `.gif` | 애니메이션 | ✅ 전체 |
| BMP | `image/bmp` | `.bmp` | 비압축 | ✅ 전체 |
| ICO | `image/x-icon` | `.ico` | 파비콘 | ⚠️ 부분 |
| SVG | `image/svg+xml` | `.svg` | 벡터 | ✅ 전체 |
| AVIF | `image/avif` | `.avif` | 차세대 | ⚠️ Chrome/Firefox |
| APNG | `image/apng` | `.apng` | 애니메이션 PNG | ⚠️ 부분 |

#### 3.3.2 출력 포맷

| 포맷 | Canvas 지원 | 품질 조절 | 투명도 | 주요 용도 |
|------|:-----------:|:---------:|:------:|-----------|
| PNG | ✅ `toBlob('image/png')` | ❌ 무손실 | ✅ | 투명 이미지, 스크린샷, 아이콘 |
| JPEG | ✅ `toBlob('image/jpeg', q)` | ✅ 0~1.0 | ❌ | 사진, 저용량 |
| WebP | ✅ `toBlob('image/webp', q)` | ✅ 0~1.0 | ✅ | 웹 최적화, 만능 |
| GIF | ❌ gif.js 사용 | ❌ 색상 수 | ✅ | 애니메이션 |
| BMP | ❌ 수동 인코딩 | ❌ 무손실 | ❌ | 레거시 호환 |
| ICO | ❌ 수동 인코딩 | ❌ | ✅ | 파비콘 |

#### 3.3.3 도구별 입출력 매트릭스

| 도구 | 입력 | 출력 | 비고 |
|------|------|------|------|
| 리사이즈 | JPEG, PNG, WebP, BMP, GIF(정지) | PNG, JPEG, WebP | |
| 크롭 | JPEG, PNG, WebP, BMP | PNG, JPEG, WebP | |
| 회전/뒤집기 | JPEG, PNG, WebP, BMP | PNG, JPEG, WebP | |
| 포맷 변환 | 전체 입력 포맷 | PNG, JPEG, WebP, BMP, ICO | 핵심 도구 |
| 압축 | JPEG, PNG, WebP | JPEG, PNG, WebP | 품질 조절 |
| 필터/효과 | JPEG, PNG, WebP, BMP | PNG, JPEG, WebP | |
| 텍스트 | JPEG, PNG, WebP | PNG, JPEG, WebP | |
| 메타데이터 | JPEG | JPEG(EXIF 제거) | EXIF는 JPEG만 |
| QR코드 | — (텍스트 입력) | PNG, SVG | 입력은 텍스트 |
| GIF 만들기 | JPEG, PNG, WebP (다중) | GIF | gif.js 사용 |
| GIF 분할 | GIF | PNG (프레임별) | |
| GIF 리사이즈 | GIF | GIF | |
| GIF 최적화 | GIF | GIF (축소) | |
| GIF 역재생 | GIF | GIF | |
| GIF 속도 | GIF | GIF | |
| GIF 텍스트 | GIF | GIF | |

### 3.4 메모리 관리

대용량 이미지 처리 시 메모리 누수를 방지하기 위한 체계적 관리 패턴:

```javascript
/**
 * 메모리 관리자 — Canvas, Blob URL, ImageData 추적 및 해제
 * 
 * 문제:
 *   - Canvas 엘리먼트는 width×height×4 바이트의 메모리 사용
 *   - 4000×3000 이미지 = 48MB (Canvas 1장)
 *   - 파이프라인에서 중간 Canvas를 해제하지 않으면 OOM 발생
 * 
 * 해결:
 *   - 생성된 리소스를 추적 레지스트리에 등록
 *   - 사용 완료 시 명시적 해제
 *   - 페이지 이탈 시 전체 해제
 */

// js/core/memory-manager.js
const MemoryManager = (function() {
    'use strict';

    // 추적 중인 리소스 목록
    const _tracked = new Set();
    // 생성된 Object URL 목록
    const _objectURLs = new Set();

    /**
     * Canvas 리소스 추적 등록
     * @param {HTMLCanvasElement} canvas - 추적할 Canvas
     */
    function track(canvas) {
        if (canvas instanceof HTMLCanvasElement) {
            _tracked.add(canvas);
        }
    }

    /**
     * 리소스 해제 — Canvas의 메모리를 즉시 해제
     * @param {HTMLCanvasElement|null} canvas - 해제할 Canvas
     */
    function release(canvas) {
        if (!canvas) return;
        if (canvas instanceof HTMLCanvasElement) {
            // Canvas 크기를 0으로 설정 → 내부 버퍼 해제
            canvas.width = 0;
            canvas.height = 0;
            // 추적 목록에서 제거
            _tracked.delete(canvas);
        }
    }

    /**
     * Object URL 추적 및 해제
     */
    function trackURL(url) {
        _objectURLs.add(url);
    }

    function revokeURL(url) {
        URL.revokeObjectURL(url);
        _objectURLs.delete(url);
    }

    /**
     * 전체 정리 — 모든 추적 리소스 해제
     * — 페이지 이탈 시 또는 새 이미지 로드 시 호출
     */
    function cleanup() {
        // 모든 Canvas 해제
        for (const canvas of _tracked) {
            canvas.width = 0;
            canvas.height = 0;
        }
        _tracked.clear();

        // 모든 Object URL 해제
        for (const url of _objectURLs) {
            URL.revokeObjectURL(url);
        }
        _objectURLs.clear();
    }

    /**
     * 현재 메모리 사용량 추정 (디버그용)
     * @returns {Object} { canvasCount, estimatedMB }
     */
    function getUsage() {
        let totalBytes = 0;
        for (const canvas of _tracked) {
            // RGBA 4바이트 × 픽셀 수
            totalBytes += canvas.width * canvas.height * 4;
        }
        return {
            canvasCount: _tracked.size,
            objectURLCount: _objectURLs.size,
            estimatedMB: (totalBytes / 1024 / 1024).toFixed(1)
        };
    }

    // 페이지 이탈 시 자동 정리
    window.addEventListener('beforeunload', cleanup);

    return { track, release, trackURL, revokeURL, cleanup, getUsage };
})();
```

---

## 4. 공통 컴포넌트 설계

### 4.1 컴포넌트 목록

| 컴포넌트 | 설명 | 사용 위치 |
|----------|------|-----------|
| `XPWindow` | XP 창 컴포넌트 (제목표시줄 + 본문) | 모든 도구 페이지 |
| `XPButton` | XP 스타일 버튼 | 전체 |
| `XPInput` | XP 스타일 입력 필드 | 도구 설정 |
| `XPSelect` | XP 스타일 드롭다운 | 포맷 선택 등 |
| `XPSlider` | XP 스타일 슬라이더 | 품질, 강도 조절 |
| `XPProgressBar` | XP 스타일 진행 바 | 처리 중 표시 |
| `XPToast` | XP 풍선 알림 | 성공/에러 알림 |
| `FileDropzone` | 파일 업로드 드롭존 | 모든 도구 페이지 |
| `ImagePreview` | 이미지 미리보기 (줌) | 모든 도구 페이지 |
| `BeforeAfter` | 비교 슬라이더 | 필터, 리사이즈 등 |

### 4.2 XP Window 컴포넌트

```
┌──────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════╗ │ ← 제목표시줄
│ ║ 🖼️ 이미지 리사이즈            [_] [□] [X] ║ │    (파란 그라데이션)
│ ╚══════════════════════════════════════════════╝ │
│ ┌──────────────────────────────────────────────┐ │
│ │                                              │ │
│ │              콘텐츠 영역                      │ │ ← 창 내용
│ │              (도구 UI)                        │ │    (흰색 배경)
│ │                                              │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │  상태 바: 준비 완료                 800×600  │ │ ← 상태 바
│ └──────────────────────────────────────────────┘ │    (회색, 정보 표시)
└──────────────────────────────────────────────────┘
  ↑ 창 테두리 (3D 효과, 둥근 모서리)
```

```javascript
/**
 * XP Window 컴포넌트 — 프로그래밍 방식으로 XP 창 생성
 * 
 * 구조:
 *   .xp-window                — 최외곽 컨테이너
 *     .xp-window__titlebar    — 제목표시줄 (파란 그라데이션)
 *       .xp-window__icon      — 창 아이콘 (16×16)
 *       .xp-window__title     — 창 제목 텍스트
 *       .xp-window__controls  — 최소화/최대화/닫기 버튼
 *     .xp-window__content     — 콘텐츠 영역
 *     .xp-window__statusbar   — 상태 바 (선택적)
 */

// js/core/ui-components.js — XPWindow 부분
const UIComponents = (function() {
    'use strict';

    /**
     * XP Window 생성
     * @param {Object} config - 설정 객체
     * @param {string} config.title - 창 제목
     * @param {string} config.icon - 아이콘 경로
     * @param {string} config.contentId - 콘텐츠 영역 ID
     * @param {boolean} config.statusBar - 상태 바 표시 여부
     * @param {boolean} config.maximized - 최대화 상태로 시작
     * @returns {HTMLElement} 생성된 창 엘리먼트
     */
    function createXPWindow(config) {
        const {
            title = 'ConvertFile',
            icon = '/assets/icons/logo.png',
            contentId = 'tool-content',
            statusBar = true,
            maximized = true
        } = config;

        const window = document.createElement('div');
        window.className = 'xp-window' + (maximized ? ' xp-window--maximized' : '');

        window.innerHTML = `
            <div class="xp-window__titlebar">
                <img class="xp-window__icon" src="${icon}" alt="" width="16" height="16">
                <span class="xp-window__title">${title}</span>
                <div class="xp-window__controls">
                    <button class="xp-window__btn xp-window__btn--minimize"
                            aria-label="최소화" title="최소화">
                        <span>_</span>
                    </button>
                    <button class="xp-window__btn xp-window__btn--maximize"
                            aria-label="최대화" title="최대화">
                        <span>□</span>
                    </button>
                    <button class="xp-window__btn xp-window__btn--close"
                            aria-label="닫기" title="닫기">
                        <span>×</span>
                    </button>
                </div>
            </div>
            <div class="xp-window__content" id="${contentId}">
                <!-- 도구 UI가 여기에 들어감 -->
            </div>
            ${statusBar ? `
            <div class="xp-window__statusbar">
                <span class="xp-window__status-text">준비 완료</span>
                <span class="xp-window__status-info"></span>
            </div>
            ` : ''}
        `;

        // 제목표시줄 버튼 이벤트
        const closeBtn = window.querySelector('.xp-window__btn--close');
        closeBtn.addEventListener('click', () => {
            // 메인 페이지로 이동 (닫기 = 도구 종료)
            location.href = '/';
        });

        return window;
    }

    // ... (다른 컴포넌트들)

    return { createXPWindow /* ... */ };
})();
```

### 4.3 XP 버튼 컴포넌트

```html
<!-- XP 버튼 HTML 구조 -->
<!-- 기본 버튼 -->
<button class="xp-btn">적용</button>

<!-- 기본 강조 버튼 (파란 테두리) -->
<button class="xp-btn xp-btn--primary">다운로드</button>

<!-- 비활성화 버튼 -->
<button class="xp-btn" disabled>처리 중...</button>

<!-- 아이콘 + 텍스트 버튼 -->
<button class="xp-btn">
    <img src="/assets/icons/download.png" alt="" width="16" height="16">
    <span>다운로드</span>
</button>
```

```css
/* css/xp-theme.css — XP 버튼 스타일 (핵심 부분) */

.xp-btn {
    /* XP 클래식 버튼: 3D 입체 효과 */
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 16px;
    min-height: 23px;
    font-family: 'Tahoma', 'Segoe UI', sans-serif;
    font-size: 11px;
    color: #000;
    background: #ECE9D8;                            /* XP 기본 회색 */
    border: 1px solid #003C74;
    border-radius: 3px;
    /* 3D 입체감: 상단/좌측 밝게, 하단/우측 어둡게 */
    box-shadow:
        inset 1px 1px 0 #fff,                      /* 내부 상단 하이라이트 */
        inset -1px -1px 0 #ACA899;                  /* 내부 하단 그림자 */
    cursor: pointer;
    user-select: none;
}

.xp-btn:hover {
    background: #F1EFE2;                            /* 호버: 약간 밝게 */
}

.xp-btn:active {
    /* 클릭: 3D 효과 반전 (눌린 느낌) */
    box-shadow:
        inset -1px -1px 0 #fff,
        inset 1px 1px 0 #ACA899;
    padding: 5px 15px 3px 17px;                     /* 텍스트 1px 이동 */
}

.xp-btn--primary {
    /* 기본 버튼: 파란 테두리로 강조 */
    border: 2px solid #003C74;
    box-shadow:
        inset 1px 1px 0 #fff,
        inset -1px -1px 0 #ACA899,
        0 0 0 1px #003C74;                          /* 외부 파란 테두리 */
}

.xp-btn:disabled {
    color: #ACA899;                                 /* 비활성: 회색 텍스트 */
    cursor: default;
    box-shadow: inset 1px 1px 0 #fff;
}
```

### 4.4 토스트/알림 컴포넌트 (XP 풍선 스타일)

```
          ┌──────────────────────────────────┐
          │ ✅ 다운로드 완료!                 │
          │                                  │
          │ resized_image.png (245KB)        │
          └──────────┬───────────────────────┘
                     │  ← 꼬리표 (XP 풍선 스타일)
                     ▼
            ─────────────── (작업표시줄)
```

```javascript
/**
 * XP 풍선 토스트 알림
 * 
 * 타입:
 *   'success' — 초록 아이콘, 성공 메시지
 *   'error'   — 빨강 아이콘, 에러 메시지
 *   'info'    — 파랑 아이콘, 정보 메시지
 *   'warning' — 노랑 아이콘, 경고 메시지
 */

function showToast(message, type = 'info', duration = 3000) {
    // 토스트 컨테이너 (없으면 생성)
    let container = document.getElementById('xp-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'xp-toast-container';
        container.className = 'xp-toast-container';
        document.body.appendChild(container);
    }

    // 아이콘 맵
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    // 토스트 엘리먼트 생성
    const toast = document.createElement('div');
    toast.className = `xp-toast xp-toast--${type}`;
    toast.innerHTML = `
        <div class="xp-toast__icon">${icons[type]}</div>
        <div class="xp-toast__message">${message}</div>
        <button class="xp-toast__close" aria-label="닫기">×</button>
    `;

    // 닫기 버튼
    toast.querySelector('.xp-toast__close').addEventListener('click', () => {
        toast.classList.add('xp-toast--hiding');
        setTimeout(() => toast.remove(), 300);  // 애니메이션 후 제거
    });

    // 자동 사라짐
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('xp-toast--hiding');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);

    container.appendChild(toast);
}

// EventBus 연동 — 처리 결과에 따라 자동 토스트 표시
EventBus.on('process:complete', (data) => {
    showToast('처리 완료!', 'success');
});

EventBus.on('process:error', (data) => {
    showToast(data.error, 'error', 5000);
});

EventBus.on('download:complete', (data) => {
    showToast(`다운로드 완료: ${data.filename}`, 'success');
});
```

### 4.5 프로그레스바 컴포넌트 (XP 스타일)

```javascript
/**
 * XP 프로그레스바 — 처리 진행 상태 표시
 * 
 * 모드:
 *   'determinate'   — 정확한 퍼센트 표시 (0~100%)
 *   'indeterminate' — 무한 루프 애니메이션 (처리 시간 불명 시)
 */

function createProgressBar(containerId) {
    const container = document.getElementById(containerId);

    container.innerHTML = `
        <div class="xp-progress" role="progressbar"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="xp-progress__track">
                <div class="xp-progress__fill"></div>
            </div>
            <span class="xp-progress__text">0%</span>
        </div>
    `;

    const fill = container.querySelector('.xp-progress__fill');
    const text = container.querySelector('.xp-progress__text');
    const progress = container.querySelector('.xp-progress');

    return {
        /** 퍼센트 업데이트 (0~100) */
        update(percent) {
            const clamped = Math.max(0, Math.min(100, percent));
            fill.style.width = clamped + '%';
            text.textContent = Math.round(clamped) + '%';
            progress.setAttribute('aria-valuenow', clamped);
        },

        /** 불확정 모드 (무한 애니메이션) */
        setIndeterminate() {
            fill.classList.add('xp-progress__fill--indeterminate');
            text.textContent = '처리 중...';
        },

        /** 완료 상태 */
        complete() {
            fill.style.width = '100%';
            fill.classList.remove('xp-progress__fill--indeterminate');
            text.textContent = '완료!';
        },

        /** 숨기기 */
        hide() {
            container.style.display = 'none';
        },

        /** 표시 */
        show() {
            container.style.display = 'block';
        }
    };
}
```

### 4.6 파일 업로드 드롭존 레이아웃

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                     📁                                       │
│                                                              │
│           이미지를 드래그 & 드롭하세요                         │
│                 또는                                         │
│          ┌──────────────────────┐                             │
│          │   파일 선택하기       │  ← XP 버튼                 │
│          └──────────────────────┘                             │
│                                                              │
│     지원 포맷: JPG, PNG, WebP, GIF, BMP (최대 50MB)          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  또는 이미지 URL 붙여넣기:                              │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ https://example.com/image.jpg                    │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.7 Before/After 비교 슬라이더

```javascript
/**
 * Before/After 비교 슬라이더
 * — 처리 전/후 이미지를 슬라이더로 비교
 * — 슬라이더를 좌우로 드래그하면 경계선 이동
 *
 * 구조:
 *   .ba-slider
 *     .ba-slider__before  (원본 이미지, clip으로 잘림)
 *     .ba-slider__after   (결과 이미지, 전체)
 *     .ba-slider__handle  (드래그 핸들 — 수직선 + 원형 손잡이)
 */

function createBeforeAfter(containerId, beforeSrc, afterSrc) {
    const container = document.getElementById(containerId);

    container.innerHTML = `
        <div class="ba-slider">
            <img class="ba-slider__after" src="${afterSrc}" alt="처리 후">
            <div class="ba-slider__before-wrapper">
                <img class="ba-slider__before" src="${beforeSrc}" alt="처리 전">
            </div>
            <div class="ba-slider__handle">
                <div class="ba-slider__line"></div>
                <div class="ba-slider__circle">◀ ▶</div>
            </div>
        </div>
    `;

    const slider = container.querySelector('.ba-slider');
    const beforeWrapper = container.querySelector('.ba-slider__before-wrapper');
    const handle = container.querySelector('.ba-slider__handle');

    let isDragging = false;

    // 슬라이더 위치 업데이트
    function updatePosition(clientX) {
        const rect = slider.getBoundingClientRect();
        // 슬라이더 내 상대 X 위치 (0~1)
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        // Before 이미지 클리핑 — 슬라이더 왼쪽만 보이게
        beforeWrapper.style.clipPath =
            `inset(0 ${(1 - percent) * 100}% 0 0)`;
        // 핸들 위치 업데이트
        handle.style.left = (percent * 100) + '%';
    }

    // 마우스 이벤트
    handle.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mousemove', (e) => {
        if (isDragging) updatePosition(e.clientX);
    });
    document.addEventListener('mouseup', () => isDragging = false);

    // 터치 이벤트 (모바일 지원)
    handle.addEventListener('touchstart', () => isDragging = true);
    document.addEventListener('touchmove', (e) => {
        if (isDragging) updatePosition(e.touches[0].clientX);
    });
    document.addEventListener('touchend', () => isDragging = false);

    // 초기 위치: 50%
    updatePosition(
        slider.getBoundingClientRect().left +
        slider.getBoundingClientRect().width / 2
    );
}
```

### 4.8 이미지 프리뷰 (줌 기능)

```javascript
/**
 * 이미지 프리뷰 — 줌 인/아웃, 패닝 지원
 * 
 * 기능:
 *   - 마우스 휠: 줌 인/아웃 (0.1x ~ 10x)
 *   - 드래그: 패닝 (줌 상태에서 이미지 이동)
 *   - 더블 클릭: 1:1 원본 크기 / 맞춤 크기 토글
 *   - 핀치 줌 (모바일)
 */

function createImagePreview(containerId) {
    const container = document.getElementById(containerId);

    let scale = 1;       // 현재 줌 배율
    let offsetX = 0;     // 패닝 X 오프셋
    let offsetY = 0;     // 패닝 Y 오프셋
    let isDragging = false;
    let lastX, lastY;

    const canvas = document.createElement('canvas');
    canvas.className = 'preview-canvas';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let _image = null;   // 현재 표시 중인 이미지

    /** 이미지 설정 */
    function setImage(img) {
        _image = img;
        // 컨테이너에 맞춤 크기 계산
        fitToContainer();
        render();
    }

    /** 컨테이너에 맞춤 */
    function fitToContainer() {
        if (!_image) return;
        const containerRect = container.getBoundingClientRect();
        const scaleX = containerRect.width / _image.naturalWidth;
        const scaleY = containerRect.height / _image.naturalHeight;
        scale = Math.min(scaleX, scaleY, 1);  // 1 초과 시 원본 크기 유지
        offsetX = 0;
        offsetY = 0;
    }

    /** 렌더링 */
    function render() {
        if (!_image) return;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // 중앙 정렬 + 줌 + 패닝 적용
        const cx = canvas.width / 2 + offsetX;
        const cy = canvas.height / 2 + offsetY;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.drawImage(
            _image,
            -_image.naturalWidth / 2,
            -_image.naturalHeight / 2
        );

        ctx.restore();
    }

    // 마우스 휠 줌
    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;   // 아래=축소, 위=확대
        scale = Math.max(0.1, Math.min(10, scale * delta));
        render();
    });

    // 더블 클릭: 1:1 ↔ 맞춤 토글
    canvas.addEventListener('dblclick', function() {
        if (Math.abs(scale - 1) < 0.01) {
            fitToContainer();
        } else {
            scale = 1;
            offsetX = 0;
            offsetY = 0;
        }
        render();
    });

    return { setImage, fitToContainer, render };
}
```

---

## 5. 라우팅 전략

### 5.1 멀티 페이지 아키텍처 (MPA)

**SPA를 사용하지 않는 이유:**

| 항목 | SPA (React 등) | MPA (정적 HTML) |
|------|:--------------:|:---------------:|
| 번들 크기 | 200KB+ | 0 (번들러 불필요) |
| SEO | SSR 필요 | ✅ 네이티브 |
| 초기 로딩 | JS 파싱 대기 | ✅ 즉시 렌더링 |
| Cloudflare Pages | 빌드 필요 | ✅ 그대로 서빙 |
| 도구 독립성 | 전체 앱 번들 | ✅ 필요한 JS만 로드 |
| 서버 비용 | $0 | $0 |
| 유지보수 | 프레임워크 의존 | ✅ 순수 웹 표준 |

### 5.2 URL 구조

```
https://convertfile.pages.dev/                     # 메인 페이지 (도구 목록)
https://convertfile.pages.dev/tools/resize.html    # 리사이즈 도구
https://convertfile.pages.dev/tools/crop.html      # 크롭 도구
https://convertfile.pages.dev/tools/rotate.html    # 회전 도구
https://convertfile.pages.dev/tools/convert.html   # 포맷 변환 도구
https://convertfile.pages.dev/tools/compress.html  # 압축 도구
https://convertfile.pages.dev/tools/filters.html   # 필터/효과 도구
https://convertfile.pages.dev/tools/text.html      # 텍스트 도구
https://convertfile.pages.dev/tools/metadata.html  # 메타데이터 도구
https://convertfile.pages.dev/tools/qrcode.html    # QR코드 도구
https://convertfile.pages.dev/tools/gif-maker.html # GIF 만들기
https://convertfile.pages.dev/tools/gif-splitter.html  # GIF 분할
...
https://convertfile.pages.dev/pages/about.html     # 소개 페이지
https://convertfile.pages.dev/pages/privacy.html   # 개인정보처리방침
https://convertfile.pages.dev/pages/terms.html     # 이용약관
https://convertfile.pages.dev/pages/contact.html   # 문의
```

### 5.3 공유 헤더/푸터 (JS 인클루드)

SPA 없이 헤더/푸터를 공유하는 방법: **JS로 동적 삽입**.

```javascript
/**
 * 공유 레이아웃 인클루드
 * — 각 HTML 페이지에서 헤더/푸터를 JS로 동적 삽입
 * — 이점: 헤더/푸터 수정 시 1곳만 변경
 * — 단점: JS 비활성화 시 안 보임 (극소수)
 */

// js/core/ui-components.js — 레이아웃 인클루드 부분

/**
 * 사이트 헤더 삽입
 * — XP 작업표시줄 스타일의 네비게이션
 */
function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    // 현재 페이지 경로로 활성 메뉴 판별
    const currentPath = window.location.pathname;

    header.innerHTML = `
        <nav class="xp-taskbar" role="navigation" aria-label="메인 네비게이션">
            <a href="/" class="xp-taskbar__start" aria-label="홈">
                <img src="/assets/xp/start-button.png" alt="시작">
            </a>
            <div class="xp-taskbar__tools">
                <a href="/tools/resize.html"
                   class="xp-taskbar__item ${currentPath.includes('resize') ? 'active' : ''}">
                    리사이즈
                </a>
                <a href="/tools/crop.html"
                   class="xp-taskbar__item ${currentPath.includes('crop') ? 'active' : ''}">
                    크롭
                </a>
                <a href="/tools/convert.html"
                   class="xp-taskbar__item ${currentPath.includes('convert') ? 'active' : ''}">
                    변환
                </a>
                <!-- 더 많은 도구는 드롭다운 메뉴로 -->
                <div class="xp-taskbar__dropdown">
                    <button class="xp-taskbar__item">더 보기 ▾</button>
                    <div class="xp-taskbar__dropdown-menu">
                        <a href="/tools/rotate.html">회전</a>
                        <a href="/tools/compress.html">압축</a>
                        <a href="/tools/filters.html">필터</a>
                        <a href="/tools/text.html">텍스트</a>
                        <a href="/tools/metadata.html">메타데이터</a>
                        <a href="/tools/qrcode.html">QR코드</a>
                        <hr>
                        <a href="/tools/gif-maker.html">GIF 만들기</a>
                        <a href="/tools/gif-splitter.html">GIF 분할</a>
                    </div>
                </div>
            </div>
            <div class="xp-taskbar__tray">
                <span class="xp-taskbar__clock" id="xp-clock"></span>
            </div>
        </nav>
    `;

    // XP 시계 업데이트 (시:분 형식)
    function updateClock() {
        const clock = document.getElementById('xp-clock');
        if (clock) {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    updateClock();
    setInterval(updateClock, 60000);  // 1분마다 갱신
}

/**
 * 사이트 푸터 삽입
 */
function initFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    footer.innerHTML = `
        <footer class="xp-footer">
            <div class="xp-footer__links">
                <a href="/pages/about.html">소개</a>
                <a href="/pages/privacy.html">개인정보처리방침</a>
                <a href="/pages/terms.html">이용약관</a>
                <a href="/pages/contact.html">문의</a>
            </div>
            <p class="xp-footer__copyright">
                © ${new Date().getFullYear()} ConvertFile. All rights reserved.
            </p>
        </footer>
    `;
}
```

### 5.4 도구 페이지 HTML 템플릿

모든 도구 페이지는 동일한 HTML 구조를 따른다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO 메타 태그 — 도구별 고유 -->
    <title>이미지 리사이즈 — 온라인 무료 | ConvertFile</title>
    <meta name="description"
          content="이미지 크기를 변경하세요. JPG, PNG, WebP 지원. 무료 온라인 도구.">
    <link rel="canonical" href="https://convertfile.pages.dev/tools/resize.html">

    <!-- OG 태그 -->
    <meta property="og:title" content="이미지 리사이즈 — ConvertFile">
    <meta property="og:description"
          content="브라우저에서 바로 이미지 크기를 변경하세요.">
    <meta property="og:image" content="/assets/og/og-default.png">
    <meta property="og:type" content="website">

    <!-- 파비콘 -->
    <link rel="icon" href="/assets/icons/favicon.ico">

    <!-- 스타일시트 -->
    <link rel="stylesheet" href="/css/layout.css">
    <link rel="stylesheet" href="/css/xp-theme.css">
    <link rel="stylesheet" href="/css/tools.css">
    <link rel="stylesheet" href="/css/ads.css">
</head>
<body>
    <!-- 공유 헤더 (JS로 삽입) -->
    <header id="site-header"></header>

    <!-- 광고 슬롯 (상단) -->
    <div class="ad-slot ad-slot--top" id="ad-top">
        <!-- AdSense 코드가 여기에 삽입됨 -->
    </div>

    <!-- 메인 콘텐츠: XP 윈도우 -->
    <main class="tool-page">
        <div class="tool-page__sidebar">
            <!-- 광고 슬롯 (사이드) -->
            <div class="ad-slot ad-slot--sidebar" id="ad-sidebar"></div>
        </div>

        <div class="tool-page__main" id="tool-window">
            <!-- XP Window가 JS로 여기에 삽입됨 -->
            <!-- 기본 구조 (JS 비활성화 시 폴백) -->
            <noscript>
                <p>이 도구는 JavaScript가 필요합니다. 브라우저 설정에서 활성화하세요.</p>
            </noscript>
        </div>

        <div class="tool-page__sidebar tool-page__sidebar--right">
            <!-- 광고 슬롯 (사이드 우측) -->
            <div class="ad-slot ad-slot--sidebar" id="ad-sidebar-right"></div>
        </div>
    </main>

    <!-- 광고 슬롯 (하단) -->
    <div class="ad-slot ad-slot--bottom" id="ad-bottom"></div>

    <!-- 공유 푸터 (JS로 삽입) -->
    <footer id="site-footer"></footer>

    <!-- 스크립트 로딩 -->
    <script src="/js/core/event-bus.js"></script>
    <script src="/js/core/memory-manager.js"></script>
    <script src="/js/core/image-loader.js"></script>
    <script src="/js/core/canvas-utils.js"></script>
    <script src="/js/core/file-utils.js"></script>
    <script src="/js/core/worker-manager.js"></script>
    <script src="/js/core/ui-components.js"></script>
    <script src="/js/tools/resize.js"></script>

    <script>
        // 페이지 초기화
        document.addEventListener('DOMContentLoaded', function() {
            UIComponents.initHeader();
            UIComponents.initFooter();
            UIComponents.initXPWindow({
                title: '이미지 리사이즈',
                icon: '/assets/icons/tool-resize.png',
                containerId: 'tool-window'
            });
        });
    </script>
</body>
</html>
```

---

## 6. 성능 최적화 전략

### 6.1 최적화 목표

| 메트릭 | 목표값 | 측정 도구 |
|--------|--------|-----------|
| **FCP** (First Contentful Paint) | < 1.5초 | Lighthouse |
| **LCP** (Largest Contentful Paint) | < 2.5초 | Lighthouse |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| **TTI** (Time to Interactive) | < 3초 | Lighthouse |
| **전체 페이지 크기** | < 500KB (초기) | DevTools |
| **이미지 처리 시간** | < 2초 (4MP 이하) | 자체 측정 |

### 6.2 외부 라이브러리 지연 로딩

무거운 외부 라이브러리는 **실제 필요한 시점**에만 로딩:

```javascript
/**
 * 지연 로딩 (Lazy Loading) — 스크립트를 필요 시점에 동적 로드
 * 
 * 이점:
 *   - gif.js (200KB+) → GIF 도구 페이지에서만, 사용자가 파일 업로드 후 로드
 *   - pdf-lib (400KB+) → PDF 도구에서만 로드
 *   - 초기 페이지 로딩 크기 대폭 감소
 */

function lazyLoadScript(src) {
    return new Promise((resolve, reject) => {
        // 이미 로드된 경우 즉시 resolve
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;  // 비동기 로드 — 렌더링 차단 방지
        script.onload = resolve;
        script.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`));
        document.head.appendChild(script);
    });
}

// 사용 예: GIF 만들기 도구에서 gif.js 지연 로딩
async function initGifMaker() {
    // 사용자가 이미지를 업로드한 후에야 gif.js 로딩 시작
    EventBus.on('image:loaded', async () => {
        try {
            await lazyLoadScript('/js/vendors/gif.js');
            console.log('gif.js 로드 완료');
            // gif.js 사용 가능
        } catch (error) {
            showToast('GIF 라이브러리 로드 실패', 'error');
        }
    });
}
```

### 6.3 Web Worker 활용 기준

| 조건 | 메인 스레드 | Web Worker |
|------|:-----------:|:----------:|
| 이미지 < 2 메가픽셀 | ✅ | ❌ |
| 이미지 ≥ 2 메가픽셀 | ❌ | ✅ |
| 간단한 변환 (리사이즈, 크롭, 회전) | ✅ | ❌ |
| 픽셀 단위 필터 (그레이스케일, 세피아) | ❌ | ✅ |
| GIF 인코딩/디코딩 | ❌ | ✅ (항상) |
| 다중 프레임 처리 | ❌ | ✅ (항상) |

```javascript
/**
 * 처리 전략 자동 결정 — 이미지 크기와 연산 유형에 따라
 * 메인 스레드 또는 Worker 사용 자동 판별
 */

async function smartProcess(image, operation, options) {
    const megapixels = (image.naturalWidth * image.naturalHeight) / 1000000;
    const isHeavyOp = ['applyFilter', 'gifEncode', 'gifDecode'].includes(operation);

    if (megapixels >= 2 || isHeavyOp) {
        // Worker에서 처리 — UI 스레드 블로킹 방지
        const canvas = CanvasUtils.imageToCanvas(image);
        const imageData = canvas.getContext('2d')
            .getImageData(0, 0, canvas.width, canvas.height);

        const result = await WorkerManager.run(
            '/js/workers/image-process.worker.js',
            {
                operation,
                imageData,
                options,
                transferables: [imageData.data.buffer]  // 제로카피 전송
            },
            (percent) => EventBus.emit('process:progress', { percent })
        );

        MemoryManager.release(canvas);
        return result;
    } else {
        // 메인 스레드에서 직접 처리 — Worker 오버헤드 방지
        return CanvasUtils[operation](image, ...Object.values(options));
    }
}
```

### 6.4 Canvas OffscreenCanvas 활용

OffscreenCanvas를 지원하는 브라우저에서는 **Worker 내에서 Canvas를 직접 사용**:

```javascript
/**
 * OffscreenCanvas 지원 여부 확인 및 활용
 * 
 * 장점:
 *   - Worker 내에서 Canvas API 직접 사용 가능
 *   - 메인 스레드 ↔ Worker 간 ImageData 복사 불필요
 *   - 렌더링 성능 향상
 * 
 * 지원: Chrome 69+, Firefox 105+, Safari 16.4+
 */

const supportsOffscreen = typeof OffscreenCanvas !== 'undefined';

// Worker 내에서 OffscreenCanvas 사용 예시
// js/workers/image-process.worker.js (OffscreenCanvas 분기)

self.onmessage = function(e) {
    const { operation, bitmap, options } = e.data;

    if (typeof OffscreenCanvas !== 'undefined' && bitmap) {
        // OffscreenCanvas 사용 — bitmap을 직접 그리기
        const canvas = new OffscreenCanvas(options.width, options.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, options.width, options.height);

        // Blob으로 변환 후 반환
        canvas.convertToBlob({ type: 'image/png' }).then(blob => {
            self.postMessage(
                { type: 'complete', payload: { result: blob } }
            );
        });
    } else {
        // 폴백: ImageData 사용
        // ... (기존 방식)
    }
};
```

### 6.5 메모리 정리 패턴

```javascript
/**
 * 메모리 정리 체크리스트 — 각 도구 모듈에서 반드시 구현
 *
 * 정리 시점:
 *   1. 새 이미지 로드 시 → 이전 이미지 해제
 *   2. 처리 완료 시 → 중간 Canvas 해제
 *   3. 다운로드 완료 시 → Object URL 해제
 *   4. 페이지 이탈 시 → 전체 해제
 */

// 도구 모듈 정리 패턴
const ToolTemplate = (function() {
    let _currentCanvas = null;
    let _resultCanvas = null;

    async function loadImage(source) {
        // ★ 이전 리소스 해제 후 새 이미지 로드
        cleanup();
        // ... 새 이미지 로드 로직
    }

    async function processImage(options) {
        // ★ 이전 결과 해제 후 새 처리
        if (_resultCanvas) {
            MemoryManager.release(_resultCanvas);
        }
        _resultCanvas = await CanvasUtils.resize(/*...*/);
        MemoryManager.track(_resultCanvas);
    }

    async function downloadResult(format, quality) {
        const blob = await new Promise(resolve => {
            _resultCanvas.toBlob(resolve, `image/${format}`, quality);
        });
        const url = URL.createObjectURL(blob);
        MemoryManager.trackURL(url);

        // 다운로드 트리거
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.' + format;
        a.click();

        // ★ 다운로드 후 즉시 Object URL 해제
        setTimeout(() => MemoryManager.revokeURL(url), 1000);
    }

    function cleanup() {
        MemoryManager.release(_currentCanvas);
        MemoryManager.release(_resultCanvas);
        _currentCanvas = null;
        _resultCanvas = null;
    }

    // ★ 페이지 이탈 시 자동 정리
    window.addEventListener('beforeunload', cleanup);
    // ★ Worker도 정리
    window.addEventListener('beforeunload', WorkerManager.terminateAll);

    return { loadImage, processImage, downloadResult, cleanup };
})();
```

### 6.6 정적 리소스 최적화

| 기법 | 대상 | 방법 | 효과 |
|------|------|------|------|
| **이미지 압축** | `/assets/` 전체 | TinyPNG, WebP 변환 | 60~80% 크기 감소 |
| **CSS 미니파이** | `/css/*.css` | cssnano | 30~50% 감소 |
| **JS 미니파이** | `/js/**/*.js` | terser | 40~60% 감소 |
| **Gzip/Brotli** | 전체 | Cloudflare 자동 적용 | 60~70% 전송 감소 |
| **Cache-Control** | 정적 리소스 | `_headers` 파일 설정 | 재방문 시 0 로드 |
| **preload** | 코어 CSS/JS | `<link rel="preload">` | 초기 로딩 최적화 |

**Cloudflare Pages `_headers` 설정:**

```
# _headers — Cloudflare Pages 커스텀 헤더

# CSS, JS — 1년 캐시 (파일명에 해시 추가 시)
/css/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=31536000, immutable

# 이미지 — 1년 캐시
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML — 캐시하지 않음 (항상 최신 버전)
/*.html
  Cache-Control: no-cache

/tools/*.html
  Cache-Control: no-cache

/pages/*.html
  Cache-Control: no-cache

# 보안 헤더
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## 부록 A: 기술 결정 기록 (ADR)

### ADR-001: 순수 HTML/CSS/JS (프레임워크 미사용)

- **결정**: React/Vue/Svelte 등 프레임워크를 사용하지 않는다
- **이유**: 빌드 단계 불필요, 번들 크기 0, Cloudflare Pages 직접 서빙, 유지보수 장기 안정성
- **트레이드오프**: 컴포넌트 재사용성 낮음 → JS IIFE 패턴으로 보완

### ADR-002: MPA (Multi Page App) 구조

- **결정**: 각 도구를 별도 HTML 파일로 구성한다
- **이유**: SEO 최적화 (도구별 고유 URL/메타), 도구 독립성 (1도구 장애가 전체에 영향 없음), 필요한 JS만 로드
- **트레이드오프**: 헤더/푸터 중복 → JS include로 해결

### ADR-003: CDN 대신 로컬 벤더 번들

- **결정**: 외부 라이브러리를 `/js/vendors/`에 로컬 복사한다
- **이유**: CDN 장애 시 서비스 가용성 유지, Cloudflare 엣지 캐시 활용, CSP 정책 단순화
- **트레이드오프**: 라이브러리 업데이트 수동 관리 필요

### ADR-004: IIFE 모듈 패턴

- **결정**: ES Module 대신 IIFE(즉시실행함수) 패턴을 사용한다
- **이유**: 빌드 도구 없이 `<script>` 태그 순서만으로 의존성 관리, 전역 오염 방지, 브라우저 호환성
- **트레이드오프**: import/export 구문 사용 불가 → 전역 변수로 모듈 노출

---

## 부록 B: 추가 고려사항

### B.1 접근성 (Accessibility)

- 모든 버튼에 `aria-label` 속성 필수
- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- 이미지 미리보기에 `alt` 텍스트 제공
- 색상 대비 비율 4.5:1 이상 (WCAG AA)
- `role` 속성으로 시맨틱 보강

### B.2 에러 처리 전략

| 에러 유형 | 처리 방법 | UI 표시 |
|-----------|-----------|---------|
| 지원하지 않는 포맷 | `image:loaded` 전 검증 | 토스트 (에러) |
| 파일 크기 초과 | `loadFromFile()` 내 검증 | 토스트 (경고) |
| Canvas 메모리 부족 | try/catch + cleanup | 토스트 + 리셋 버튼 |
| Worker 타임아웃 | WorkerManager 내부 처리 | 프로그레스바 에러 상태 |
| CORS 차단 (URL 로드) | loadFromURL() catch | 토스트 (안내 메시지) |
| 브라우저 미지원 기능 | feature detection | noscript / 안내 메시지 |

### B.3 브라우저 호환성 목표

| 브라우저 | 최소 버전 | 비고 |
|----------|:---------:|------|
| Chrome | 80+ | ✅ 주요 타겟 |
| Firefox | 78+ | ✅ |
| Safari | 14+ | ⚠️ WebP 출력 제한 확인 |
| Edge | 80+ (Chromium) | ✅ |
| IE | ❌ 미지원 | |
| Mobile Chrome | 80+ | ✅ |
| Mobile Safari | 14+ | ⚠️ Worker 제한 확인 |

# 🔧 ConvertFile — 도구별 상세 명세서 (Tool Specifications)

> 브라우저 기반(Client-side) 이미지/GIF/비디오/PDF 처리 도구별 상세 동작 사양 및 구현 가이드.  
> 모든 작업은 서버 없이 사용자의 웹 브라우저 내에서 100% 처리됩니다.

---

## 1. 개요 및 공통 제약사항

### 1.1 기본 기술 스택
- **HTML5 Canvas API**: 이미지 디코딩, 크기 조정, 크롭, 회전, 필터 효과 적용, 워터마크 합성 등 기본 이미지 처리에 사용.
- **gifshot / gif.js**: 이미지 프레임들을 병합하여 브라우저 내에서 애니메이션 GIF를 생성하는 외부 라이브러리.
- **gifuct-js**: 애니메이션 GIF의 LZW 압축 바이너리를 해독하여 개별 PNG 프레임으로 분할 파싱하는 라이브러리.
- **ffmpeg.wasm (Phase 3)**: WebAssembly 기반 FFmpeg로 비디오 디코딩/인코딩 및 GIF 변환 처리에 사용. (SharedArrayBuffer 활성화를 위한 COOP/COEP 헤더 설정 필수)
- **pdf-lib / pdfjs-dist**: PDF 생성 및 PDF에서 개별 이미지로의 추출(렌더링)을 위한 JavaScript 라이브러리.
- **html5-qrcode / jsQR / Quagga2**: 브라우저 로컬에서 업로드된 이미지 혹은 카메라 스트림으로부터 QR코드 및 바코드 값을 디코딩하는 라이브러리.

### 1.2 공통 제약조건
- **최대 파일 크기**: 일반 이미지 25MB (Cloudflare Pages 무료 플랜 단일 파일 및 브라우저 메모리 한계 고려), GIF 및 비디오 50MB 제한.
- **에러 핸들링**: 파일 로딩 실패, 메모리 부족, 지원하지 않는 형식 입력 시 모던 에러 모달 노출 및 원인 메시지 표시.

---

## 2. 카테고리별 도구 명세

### 카테고리 1: 이미지 편집 및 변환

#### 1. 이미지 크기 조절 (Resize)
- **URL**: `/tools/resize.html`
- **입력**: `.jpg`, `.png`, `.webp`, `.bmp`, `.avif`, `.svg` / 최대 25MB
- **UI 컨트롤**: 픽셀/퍼센트 선택 라디오, 가로세로 입력창, 비율고정 체크박스, 보간 필터 선택(Bilinear/Nearest), 출력 포맷 선택.
- **처리 로직**: Canvas 2D 컨텍스트의 이미지 스케일링 필터 적용. Nearest Neighbor의 경우 수동 픽셀 버퍼 맵핑 루프 실행.
- **출력**: 선택한 이미지 포맷 / `[original_name]_resized.[ext]`

#### 2. 이미지 자르기 (Crop)
- **URL**: `/tools/crop.html`
- **입력**: `.jpg`, `.png`, `.webp`, `.avif` / 최대 25MB
- **UI 컨트롤**: 드래그 핸들이 위치한 오버레이 크롭 박스, 화면 비율 프리셋(Free, 1:1, 4:3, 16:9) 선택, 좌표 수치 입력 상자.
- **처리 로직**: 드래그 좌표에 대응해 원본 해상도 대비 스케일 팩터를 곱한 영역을 Canvas `drawImage(sx, sy, sw, sh)`로 획득.
- **출력**: 원본 포맷 그대로 저장 / `[original_name]_cropped.[ext]`

#### 3. 회전 및 반전 (Rotate & Flip)
- **URL**: `/tools/rotate.html`
- **입력**: `.jpg`, `.png`, `.webp`, `.avif` / 최대 25MB
- **UI 컨트롤**: 시계/반시계 90도, 180도, 좌우 반전, 상하 반전, 미세 수평 각도 조절 슬라이더 (-180° ~ 180°).
- **처리 로직**: Canvas `translate`, `rotate` 행렬 수식 연산 및 뒤집기는 `scale(-1, 1)` 활용.
- **출력**: 원본 포맷 유지 / `[original_name]_rotated.[ext]`

#### 4. 포맷 변환 (Image Converter)
- **URL**: `/tools/jpg-png.html`
- **입력**: 모든 이미지 포맷 (PNG, JPG, WebP, BMP, AVIF, HEIC, SVG) / 최대 25MB
- **UI 컨트롤**: 출력 대상 포맷(PNG, JPG, WebP, BMP, ICO), 압축 퀄리티 슬라이더, 투명 이미지 JPG 변환 시 알파 대체색 선택기.
- **처리 로직**: Canvas에 이미지를 로드한 뒤 `canvas.toBlob` 인수를 타겟 마임(MIME) 형식으로 넘겨 브라우저 네이티브 인코더 작동. ICO의 경우 단일/멀티 해상도 비트맵 패킹 알고리즘 적용.
- **출력**: 변환된 타겟 포맷 / `[original_name]_converted.[ext]`

---

### 카테고리 2: GIF 및 애니메이션 도구 (ezgif 클론)

#### 1. GIF 메이커 (GIF Maker)
- **URL**: `/tools/gif-maker.html`
- **입력**: 복수의 `.jpg`, `.png`, `.webp`, `.avif` 이미지 / 총합 최대 50MB
- **UI 컨트롤**: 프레임 배열 관리자, 전체 및 개별 재생 딜레이(ms) 입력창, 출력 해상도 지정 박스.
- **처리 로직**: `gifshot` Web Worker 비동기 루프로 복수의 비트맵 프레임을 읽어 LZW로 결합한 단일 GIF 애니메이션 생성.
- **출력**: `.gif` / `animation.gif`

#### 2. GIF 프레임 분할기 (GIF Splitter)
- **URL**: `/tools/gif-splitter.html`
- **입력**: 애니메이션 `.gif` 파일 / 최대 30MB
- **UI 컨트롤**: GIF 업로드존, 개별 프레임 그리드 뷰, 일괄 다운로드 버튼.
- **처리 로직**: GIF 바이너리 구조를 파싱해 프레임별 로컬 이미지 디스크립터 및 그래픽 컨트롤 확장 세그먼트를 획득, 각각을 PNG 파일 데이터로 묶어 JSZip 라이브러리로 패킹 다운로드.
- **출력**: 분할된 PNG들을 담은 `.zip` 파일 / `[original_name]_frames.zip`

#### 3. GIF 최적화 및 압축기 (GIF Optimizer)
- **URL**: `/tools/gif-optimize.html`
- **입력**: 애니메이션 `.gif` 파일 / 최대 30MB
- **UI 컨트롤**: 압축 기법 라디오 (컬러 팔레트 감축, LZW 압축률 상향, 프레임 드롭(Drop frames)), 압축 수준 제어 슬라이더.
- **처리 로직**: GIF 파일을 디코딩하여 프레임을 분리한 뒤, 중복 픽셀을 투명 처리하는 차분(Difference) 최적화 알고리즘 또는 전역 컬러 맵(Color Map) 크기를 절반 이하(128, 64색)로 축소하여 다시 GIF 인코딩.
- **출력**: 압축 최적화된 `.gif` / `[original_name]_optimized.gif`

#### 4. GIF 속도 및 역재생 (GIF Speed & Reverse)
- **URL**: `/tools/gif-speed.html`
- **입력**: 애니메이션 `.gif` 파일 / 최대 30MB
- **UI 컨트롤**: 재생 속도 조정 슬라이더 (0.25x ~ 4x 배속), 역재생(Reverse) 활성화 토글 체크박스.
- **처리 로직**: GIF 프레임을 분해하여 프레임 간 지연 시간(Delay Time) 데이터 배열을 배속 비율에 비례하게 승제산하여 재매핑함. 역재생의 경우 해독된 프레임 이미지 배열의 인덱스를 역순(`reverse()`)으로 뒤집어 재합성.
- **출력**: 변형된 `.gif` / `[original_name]_speed.[ext]`

#### 5. GIF 효과 및 텍스트 추가 (GIF Effects & Caption)
- **URL**: `/tools/gif-effects.html`
- **입력**: 애니메이션 `.gif` 파일 / 최대 30MB
- **UI 컨트롤**: 텍스트 입력, 폰트 스타일/크기/색상 선택기, 캡션 위치(상단/하단/자유), 이미지 필터 효과(그레이스케일, 세피아, 색상 반전, 흐림 효과), 워터마크 이미지 업로드.
- **처리 로직**: GIF의 각 프레임을 분할 디코딩하여 가상 Canvas에 올린 뒤, Canvas 2D API를 활용해 필터 효과 연산 및 텍스트/워터마크 오버레이를 렌더링하고 `gifshot`으로 최종 합성 및 인코딩.
- **출력**: 변형된 `.gif` / `[original_name]_effects.gif`

---

### 카테고리 3: 비디오 도구

#### 1. 비디오 to GIF 변환기 (Video to GIF)
- **URL**: `/tools/video-gif.html`
- **입력**: `.mp4`, `.webm` 동영상 / 최대 50MB
- **UI 컨트롤**: 시작 시간 / 종료 시간 지정 슬라이더, 출력 프레임 레이트 (FPS: 5 ~ 20 FPS) 제어바, 출력 해상도 가로 너비 상자.
- **처리 로직**: `<video>` 태그의 재생 시간 축을 스크립트로 순차 탐색하며 지정된 FPS 간격으로 캔버스를 통해 비트맵 프레임을 드로잉 캡처한 뒤, `gifshot` 인코더 모듈을 돌려 GIF로 변환.
- **출력**: `.gif` / `[original_name].gif`

---

### 카테고리 4: PDF 도구

#### 1. PDF 이미지 변환 패키지 (PDF Tools)
- **URL**: `/tools/pdf.html`
- **입력**: `.pdf` 파일 또는 여러 장의 이미지 (`.jpg`, `.png`, `.webp`) / 최대 50MB
- **UI 컨트롤**: 탭 전환(PDF to Image / Image to PDF), 품질 및 페이지 옵션, PDF에 묶을 이미지 순서 편집.
- **처리 로직**: 
  - **Image to PDF**: `pdf-lib` 라이브러리를 사용해 업로드된 이미지 프레임을 PDF 페이지에 순차 바인딩하여 바이너리 묶음 파일로 익스포트.
  - **PDF to Image**: `pdfjs-dist` 라이브러리를 통해 PDF 내 각 페이지를 Canvas API로 렌더링하여 각각 개별 PNG 파일로 추출 및 `.zip` 압축 전송.
- **출력**: `.pdf` 파일 또는 이미지들의 `.zip` 압축파일

---

### 카테고리 5: QR코드 & 바코드 유틸리티

#### 1. QR코드 & 바코드 생성/인식기 (QR & Barcode Scanner & Generator)
- **URL**: `/tools/barcode.html`
- **입력**: (생성 시) 인코딩 텍스트/숫자, (스캔 시) 바코드/QR코드 이미지 파일 또는 카메라 스트림
- **UI 컨트롤**: 모드 선택 탭 (생성하기 / 스캔하기), 스캔할 이미지 파일 업로드존 (스캔 모드), 바코드 종류 선택기, 스캔 결과 텍스트창 및 클립보드 복사 버튼.
- **처리 로직**: 
  - **생성**: qrcodejs, JsBarcode CDN을 사용하여 Canvas 또는 SVG에 실시간 드로잉.
  - **스캔**: jsQR 및 Quagga2 라이브러리를 사용해 드롭존에 업로드된 코드 이미지를 Canvas 픽셀 데이터로 읽어 디코딩 분석.
- **출력**: 생성된 코드 이미지 (`.png`) 또는 스캔 디코딩 결과 텍스트.

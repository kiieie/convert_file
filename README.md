# 🖼️ ConvertFile — 클라이언트 사이드 이미지 & GIF/PDF 편집 플랫폼

> **서버 통신 없는 100% 브라우저 메모리 기반의 고성능 멀티 이미지 프로세싱 정적 웹 서비스.**  
> 본 서비스는 사용자 데이터를 서버에 전혀 업로드하지 않아 완벽한 프라이버시 보호가 가능하며, Cloudflare Pages로 호스팅되어 트래픽 비용 없이 안정적으로 작동합니다.
> Windows XP 레트로 테마와 현대적인 모던 미니멀 테마를 동시에 지원합니다.

---

## ✨ 핵심 기능 (Features)

### 1. 이미지 포맷 변환 및 가공 (Image Transforming)
* **포맷 상호 변환 (`tools/jpg-png.html`)**: JPG, PNG, WebP 간의 고속 상호 변환 제공.
* **해상도 조절 (`tools/resize.html`)**: 종횡비 비율 유지 여부 선택, 픽셀 및 백분율 조절, Bilinear/Nearest Neighbor 보간 필터 적용.
* **크롭/회전/반전 (`tools/crop.html`, `tools/rotate.html`)**: 캔버스 기반의 유연한 자르기 조작(Aspect Ratio 프리셋 포함), 직각 및 정밀 각도 회전, 상하좌우 대칭 반전.
* **EXIF 메타데이터 제거 (`tools/metadata.html`)**: 사생활 침해 예방을 위한 이미지 헤더 매직 바이트 EXIF 영역 무손실 제거.

### 2. PDF 변환 도구 (PDF Tools)
* **이미지 → PDF 병합 (`tools/pdf.html`)**: 여러 장의 PNG/JPG/WebP 이미지를 불러와 A4 규격화 또는 원본 종횡비 자동 맞춤을 적용하여 단일 PDF 문서 파일로 통합 및 저장.
* **PDF → 이미지 추출 (`tools/pdf.html`)**: 다량의 페이지를 내포한 PDF 문서의 렌더링 트리를 해독해 고화질 이미지 묶음 ZIP 아카이브로 추출 및 포장 다운로드.

### 3. GIF 애니메이션 도구 (GIF Tools)
* **움짤 GIF 메이커 (`tools/gif-maker.html`)**: 여러 프레임 이미지를 병합해 딜레이 및 인코딩 품질을 설정하여 움직이는 GIF 애니메이션 생성.
* **프레임 분할 (`tools/gif-splitter.html`)**: GIF 파일의 압축 프레임을 전부 해제하여 개별 컷 이미지로 쪼갠 후 ZIP 패키징 다운로드.
* **속도 및 역재생 (`tools/gif-speed.html`)**: GIF 재생 배율 조절 및 역재생 기능 탑재.
* **최적화 및 효과 (`tools/gif-optimize.html`, `tools/gif-effects.html`)**: 투명도 최적화, 컬러 팔레트 감축, 자막 필터 기능.

### 4. QR/바코드 유틸리티 (`tools/barcode.html`)
* **바코드/QR 코드 생성**: Code128, EAN-13, UPC-A 및 다용도 QR 코드 생성 지원.
* **바코드/QR 코드 스캔**: 웹캠 또는 이미지 업로드를 통한 실시간 디코딩 스캔.

---

## 🛠️ 핵심 아키텍처 및 공통 엔진 (Architecture)

모든 개별 도구는 `js/core/`에 위치한 독립된 모듈형 엔진 패키지를 공통 상속 및 결합하여 연산 파이프라인을 이행합니다.

1. **`js/core/canvas-utils.js`**
   - 캔버스 픽셀 데이터의 보간 연산 처리(Bilinear 보간 알고리즘), 회전 종횡비 자동 변환, 필터 적용 필터 파이프라인.
2. **`js/core/file-utils.js`**
   - **MIME 파일 스푸핑 방지**: 업로드 파일의 매직 바이트(바이너리 시그니처) 검사를 통해 실제 파일 포맷을 판독.
   - **브라우저 다이렉트 다운로드**: 임의의 URL 또는 `Blob` 객체를 가상 기기 클릭 이벤트를 유발하여 자동 로컬 세션 다운로드 처리 (`downloadFile`, `downloadBlob`).
3. **`js/core/image-loader.js`**
   - 파일 드롭존 및 업로드 입력을 통합 처리하는 로더 바인딩.
4. **`js/core/ui-components.js`**
   - 모달 에러 다이얼로그(XP/Modern 양식) 및 백그라운드 태스크 처리를 시각화하는 프로그레스 바 제어 모듈.

---

## 🧪 테스트 시스템 (Automated Test Suite)

안정적인 기능 배포 및 브라우저 성능 충돌 방지를 위해 이중화된 검증 파이프라인을 탑재하고 있습니다.

### 1. 가상 DOM 유닛 테스트 (`test/run-tests.js`)
* Node.js 환경에서 브라우저 API(Canvas, Document Proxy)를 모킹하여 로컬 VM 컨텍스트 상에서 핵심 수학 공식, 검증 정규식, 알고리즘 연산을 고속 실행합니다.
* **실행 명령**:
  ```bash
  node test/run-tests.js
  ```

### 2. 브라우저 실환경 E2E 자동화 테스트 (`test/e2e.test.js`)
* Playwright 프레임워크를 기반으로 가동되어, 실제 Chromium 브라우저를 백그라운드에서 실행하고 사용자 행위를 시뮬레이션합니다.
* **검증 케이스**:
  - `test/index.html` 진입 후 엔진 단위 테스트 11종 검증 수행.
  - `tools/jpg-png.html` 포맷 변환기에 1x1 투명 이미지를 실제 파일 업로드하고 포맷 변경 후 다운로드된 변환 파일명의 패턴 일치 검증.
  - `tools/resize.html` 리사이저 기기 조작 및 가로 100px 조절 다운로드 확인.
  - `tools/pdf.html` 이미지 다중 업로드 후 단일 PDF 빌딩 및 다운로드 확인.
* **실행 명령**:
  ```bash
  # 로컬 웹 서버 시작 (무제한 무캐시 모드)
  npx http-server -p 8080 -c-1
  
  # E2E 테스트 러너 기동
  npm run test:e2e
  ```

---

## 🚀 배포 및 로컬 가동 가이드

1. **로컬 실행**
   ```bash
   npx http-server -p 8080 -c-1
   ```
   이후 브라우저로 `http://127.0.0.1:8080`에 접속하여 로컬 테스트 가능.

2. **브라우저 캐시 방지 정책 (Cache Busting)**
   - 애드센스 규격상 `_headers`에 설정된 강력한 파일 캐싱 정책(`max-age=31536000, immutable`)으로 인해, 코어 스크립트 수정 시 이전 버전을 그대로 사용하는 문제를 우회하고자 모든 HTML 스크립트 결합 주소 뒤에 버전 파라미터 `?v=3`을 추가하여 배포하고 있습니다. 스크립트 변경 시 버전 파라미터 증설을 권장합니다.

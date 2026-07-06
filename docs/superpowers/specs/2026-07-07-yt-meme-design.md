# YouTube 밈 생성기 (yt-meme) 설계

날짜: 2026-07-07
상태: 승인 대기
범위: 신규 도구 1종 — YouTube 구간 기반 밈 생성 (공유 클립 + GIF 파일 출력)

## 배경

기존 도구 자산:
- `meme-generator` — 이미지 업로드 → 상/하단 텍스트 canvas 렌더 (Impact 폰트, 외곽선, 줄바꿈 래핑) → 이미지 다운로드
- `video-gif` — 영상 파일 업로드 → 시작/끝 구간 지정 → 프레임 canvas 캡처 → `gifshot.createGIF({images: framesData})` → GIF 다운로드

사용자 요구: YouTube 링크에서 특정 구간을 골라 밈을 만들고 싶다.

핵심 제약 (설계를 결정하는 사실들):
1. **YouTube 영상 픽셀은 브라우저에서 획득 불가.** 스트림 URL은 서명 암호화로 보호되고, 알아내도 CORS로 차단된다. 서버 중계(yt-dlp)는 YouTube ToS 위반 + 백엔드 신설 필요라 제외.
2. **iframe 내부 픽셀은 읽을 수 없다.** YouTube IFrame Player API로 가능한 것은 재생 제어(재생/정지/seek/현재 시간 읽기)뿐.
3. **YouTube 개발자 정책은 플레이어 위 오버레이를 금지한다.** 텍스트를 플레이어 화면 위에 겹치면 정책 위반 — 텍스트는 플레이어 바깥(위아래 바)에 배치해야 한다.

따라서 두 가지 출력을 지원한다:
- **B. 공유 클립** (기본, 업로드 불필요): YouTube 공식 embed의 `start`/`end` 파라미터로 구간 재생 + 플레이어 위아래에 밈 텍스트 바. 결과물은 파일이 아니라 **링크** — 모든 데이터(영상 ID, 구간, 텍스트)가 URL 쿼리 파라미터에 담기며 서버 저장은 없다.
- **A. GIF 파일** (선택 단계, 파일 업로드 필요): 사용자가 해당 영상 파일을 직접 업로드하면 선택한 구간을 자동 적용해 텍스트 입힌 GIF를 생성한다. 이 과정은 YouTube 서버와 무접촉 — 기존 video-gif와 동일한 성격.

## 목표

1. URL 붙여넣기 → iframe 재생 → 구간 선택 → 텍스트 입력 → 공유 링크 생성까지 업로드 없이 완결 (B)
2. 같은 화면에서 영상 파일 업로드 시 선택 구간·텍스트를 그대로 적용한 GIF 다운로드 (A)
3. 기존 코드 최대 재사용: meme-generator의 텍스트 렌더 로직, video-gif의 프레임 캡처→gifshot 파이프라인
4. 파일럿 UI 패턴 준수: `.tool-flow` 단일 컬럼, `.advanced-settings` 접힘, hero 버튼 (2026-07-06 롤아웃 스펙과 동일 시각 언어)

비목표:
- 서버 사이드 다운로드/저장 일체 (yt-dlp, 클립 DB 등)
- 플레이어 화면 위 텍스트 오버레이 (정책 위반)
- 기존 `meme-generator`(이미지용) 변경 — 별도 도구로 신설
- MP4 출력, 오디오 (GIF는 무음)

## 신규 파일

| 파일 | 역할 |
|---|---|
| `tools/yt-meme.html` | 메인 도구 페이지 (영어판) |
| `js/tools/yt-meme.js` | 비즈니스 로직 |
| `tools/clip-view.html` | 공유 클립 뷰어 (파라미터 읽어 렌더) |
| `js/tools/clip-view.js` | 뷰어 로직 |
| `ko/es/zh/tools/` 로케일 복사본 | 사이트 관례 따름 |

등록: `js/core/sidebar.js` 메뉴 항목(4개 언어 라벨), `sitemap.xml` hreflang 세트.

## 흐름

### 1단계 — URL 입력 + 구간 선택
- 입력창에 YouTube URL 붙여넣기. 파싱 지원 형식: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/` (+ `t=` 타임스탬프 파라미터가 있으면 시작점 초기값으로)
- YouTube IFrame Player API 로드(공식 `https://www.youtube.com/iframe_api`) → 플레이어 생성
- 재생하며 **[시작점 설정] [끝점 설정]** 버튼 → `player.getCurrentTime()` 캡처. 초 단위 숫자 입력 필드로 미세조정 가능
- **[구간 미리보기]**: `seekTo(start)` + 타이머로 end 도달 시 다시 seek — 구간 루프 재생
- 제약: end > start, 구간 길이 하한 0.5초

### 2단계 — 텍스트
- 상단/하단 텍스트, 폰트 크기, 글자색, 외곽선색/두께, 대문자 토글 — meme-generator와 동일한 컨트롤 구성
- 라이브 미리보기: 플레이어 **위아래에 밈 텍스트 바** (흰 배경 + Impact 스타일 텍스트, CSS 렌더). 플레이어 화면을 가리지 않음

### 3단계-B — 공유 클립 (기본 출력)
- **[링크 복사]**: `https://2convert.org/tools/clip-view.html?v={id}&s={start}&e={end}&t={top}&b={bottom}`
  - 텍스트는 `encodeURIComponent` (한글/이모지 안전)
  - 스타일 파라미터는 넣지 않는다 — 클립 바 스타일은 고정 (YAGNI; GIF 쪽만 스타일 커스텀)
- **[embed 코드 복사]**: clip-view를 가리키는 `<iframe>` 스니펫
- clip-view.html 동작: 파라미터 검증(id 형식 `[A-Za-z0-9_-]{11}`, s/e 숫자, e>s) → IFrame Player 생성(`start`/`end` 적용) → 위아래 텍스트 바 렌더 → 종료 시 구간 루프(IFrame API `onStateChange` ENDED → seekTo)
- 저장소 없음: 링크 = 데이터. 원본 영상이 삭제/비공개되면 클립도 재생 불가 — 뷰어에 에러 안내 표시

### 3단계-A — GIF 파일 (접힌 확장 섹션)
- "진짜 GIF 파일이 필요하면 이 구간을 담은 영상 파일을 업로드하세요" 섹션 (`.advanced-settings` 접힘 패턴)
- 파일 업로드 → `<video>` 요소 로드 → 1단계에서 고른 구간 자동 적용 (파일 타임라인 기준 재조정 입력 제공 — 업로드 파일이 클립 일부만 담을 수 있으므로)
- 변환 파이프라인 (video-gif 방식 계승 + 텍스트 추가):
  1. 구간 내에서 FPS 간격으로 `video.currentTime` seek → canvas에 `drawImage`
  2. 같은 canvas에 meme-generator의 `drawWrappedText` 로직으로 상/하단 텍스트 렌더 (GIF는 영상 안에 텍스트 — 자체 픽셀이므로 정책 무관)
  3. 프레임 dataURL 배열 → `gifshot.createGIF({images, interval})`
  4. GIF 다운로드 (`FileUtils` 활용)
- gifshot 내장 `text` 옵션은 사용하지 않는다 (단일 문자열만 지원, 스타일 제한)
- 폭/FPS 옵션은 video-gif와 동일 기본값. 구간 15초 초과 시 용량/메모리 경고 표시(차단 아님)

## 공용 텍스트 렌더 모듈

`drawWrappedText`가 meme-generator.js 내부 함수로 갇혀 있음 → `js/core/` 관례에 따라 공용 헬퍼로 추출(`js/core/meme-text.js` 신설, meme-generator.js와 yt-meme.js가 공유). meme-generator.js는 추출된 함수를 쓰도록 최소 수정 — DOM id/동작 변화 없음.

## 에러 처리

| 상황 | 처리 |
|---|---|
| URL 파싱 실패 | 입력창 아래 인라인 에러, 지원 형식 예시 |
| 임베드 차단 영상 | IFrame API `onError` 101/150 → "이 영상은 소유자가 퍼가기를 막았습니다" 안내 |
| 존재하지 않는 영상 | `onError` 100 → 안내 |
| clip-view 파라미터 불량 | 검증 실패 시 에러 화면 + 도구 페이지 링크 |
| 업로드 파일 길이 < 구간 | 구간을 파일 길이로 클램프 + 경고 |
| gifshot 미로드 | 기존 video-gif와 동일한 라이브러리 에러 다이얼로그 |

## 테스트

- URL 파싱: watch/youtu.be/shorts/embed/타임스탬프 포함/불량 URL 케이스 (유닛)
- clip-view 파라미터: 인코딩 라운드트립(한글·이모지), 불량 파라미터 거부 (유닛)
- GIF 파이프라인: 기존 video-gif e2e 패턴 따라 소형 mp4 fixture로 변환 검증
- 정책 체크: 텍스트 바가 플레이어 영역과 겹치지 않음 (레이아웃 e2e)

## 리스크

- IFrame Player API는 외부 스크립트 — CSP/`_headers` 확인 필요, 오프라인(PWA) 시 B 기능 불가 안내
- gifshot 메모리: 긴 구간 × 큰 폭 조합에서 모바일 크래시 가능 → 경고 및 기본값 보수적으로

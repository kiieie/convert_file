# 🚀 ConvertFile — 배포 & 인프라 가이드

> Cloudflare Pages + GitHub 기반 정적 사이트 배포 완전 가이드
> 빌드 서버 없음 · 서버 비용 $0 · 자동 CI/CD

---

## 목차

1. [GitHub 저장소 설정](#1-github-저장소-설정)
2. [Cloudflare Pages 설정 가이드](#2-cloudflare-pages-설정-가이드)
3. [커스텀 도메인 설정 (선택)](#3-커스텀-도메인-설정-선택)
4. [Cloudflare Pages 무료 플랜 제한](#4-cloudflare-pages-무료-플랜-제한)
5. [성능 최적화 (Cloudflare)](#5-성능-최적화-cloudflare)
6. [`_headers` 파일 설정](#6-_headers-파일-설정)
7. [`ads.txt` 파일](#7-adstxt-파일)
8. [모니터링](#8-모니터링)

---

## 1. GitHub 저장소 설정

### 1.1 Repository 생성 절차

#### Step 1: GitHub 저장소 생성

```
1. https://github.com/new 접속
2. Repository name: "convert-file" 입력
3. Description: "Windows XP themed online image/GIF editor" 입력
4. Public 선택 (Cloudflare Pages 무료 플랜은 Public/Private 모두 지원)
5. "Add a README file" 체크
6. "Add .gitignore" → 템플릿 선택하지 않음 (직접 작성)
7. License: MIT License 선택
8. "Create repository" 클릭
```

> [!NOTE]
> Cloudflare Pages 무료 플랜은 Private 저장소도 지원한다. 하지만 오픈소스 프로젝트로 운영할 경우 Public 권장.

#### Step 2: 로컬에 클론

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/convert-file.git

# 디렉토리 이동
cd convert-file
```

#### Step 3: 초기 디렉토리 구조 생성

```bash
# 디렉토리 구조 생성 (Windows PowerShell)
mkdir css, js, assets, tools, pages, lib

# 또는 Git Bash / Linux / macOS
mkdir -p css js assets tools pages lib
```

```
convert-file/
├── index.html              # 메인 페이지
├── css/
│   ├── xp-theme.css        # Windows XP 테마 스타일
│   ├── layout.css           # 레이아웃
│   └── tools.css            # 도구 페이지 공통 스타일
├── js/
│   ├── app.js               # 앱 초기화
│   ├── xp-ui.js             # XP UI 컴포넌트
│   └── tools/               # 도구별 JS
├── assets/
│   ├── icons/               # XP 아이콘
│   ├── cursors/             # XP 커서
│   └── sounds/              # XP 효과음 (선택)
├── tools/
│   ├── resize.html          # 이미지 리사이즈
│   ├── crop.html            # 이미지 크롭
│   └── ...                  # 기타 도구 페이지
├── pages/
│   ├── about.html           # About 페이지 (AdSense 필수)
│   ├── privacy.html         # 개인정보처리방침 (AdSense 필수)
│   ├── terms.html           # 이용약관 (AdSense 필수)
│   └── contact.html         # 연락처
├── lib/                     # 외부 라이브러리 (gif.js 등)
├── _headers                 # Cloudflare 보안/캐시 헤더
├── _redirects               # Cloudflare URL 리다이렉트
├── ads.txt                  # AdSense 인증 파일
├── robots.txt               # 크롤러 설정
├── sitemap.xml              # 사이트맵
├── 404.html                 # 커스텀 404 페이지
├── .gitignore               # Git 제외 파일
└── README.md                # 프로젝트 설명
```

---

### 1.2 `.gitignore` 파일

```gitignore
# ===========================
# OS 생성 파일
# ===========================
.DS_Store              # macOS 폴더 메타데이터
.DS_Store?
._*
Thumbs.db              # Windows 썸네일 캐시
ehthumbs.db
Desktop.ini            # Windows 폴더 설정

# ===========================
# 에디터 / IDE 설정
# ===========================
.vscode/               # VS Code 설정 (팀 공유 시 제거)
.idea/                 # JetBrains IDE 설정
*.swp                  # Vim 스왑 파일
*.swo
*~                     # 백업 파일

# ===========================
# Node.js (개발 도구 사용 시)
# ===========================
node_modules/          # npm 패키지 (개발 도구용)
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json      # 정적 사이트이므로 불필요할 수 있음

# ===========================
# 환경 변수 / 시크릿
# ===========================
.env                   # 환경 변수
.env.local
.env.*.local

# ===========================
# 빌드 산출물
# ===========================
dist/                  # 빌드 출력 (사용 안 함)
build/
*.min.js.map           # 소스맵 (배포 시 제외 가능)
*.min.css.map

# ===========================
# 로그 파일
# ===========================
*.log
logs/

# ===========================
# 테스트 / 임시 파일
# ===========================
coverage/              # 테스트 커버리지
*.tmp
*.temp
temp/
```

> [!IMPORTANT]
> `_headers`, `_redirects`, `ads.txt`는 Cloudflare Pages 배포에 필수 파일이므로 `.gitignore`에 절대 추가하지 않는다.

---

### 1.3 Branch 전략

```
main (production)
  │
  └── dev (development)
        │
        ├── feature/resize-tool     # 기능 개발
        ├── feature/gif-editor      # 기능 개발
        ├── fix/crop-bug            # 버그 수정
        └── hotfix/xss-patch        # 긴급 수정
```

#### 브랜치 규칙

| 브랜치 | 용도 | Cloudflare 배포 | 보호 설정 |
|--------|------|------------------|-----------|
| `main` | 프로덕션 배포 | ✅ 자동 배포 (Production) | ✅ PR 필수, 직접 push 금지 |
| `dev` | 개발 통합 | ✅ 프리뷰 배포 (Preview) | ⚠️ PR 권장 |
| `feature/*` | 기능 개발 | ✅ 프리뷰 배포 (Preview) | ❌ 자유 push |
| `fix/*` | 버그 수정 | ✅ 프리뷰 배포 (Preview) | ❌ 자유 push |
| `hotfix/*` | 긴급 수정 | ✅ 프리뷰 배포 (Preview) | ❌ 자유 push → main 직접 병합 가능 |

#### 브랜치 생성 명령

```bash
# dev 브랜치 생성 및 전환
git checkout -b dev
git push -u origin dev

# 기능 브랜치 생성 (dev에서 분기)
git checkout dev
git checkout -b feature/resize-tool

# 작업 완료 후 dev에 병합 (GitHub PR 사용 권장)
git push -u origin feature/resize-tool
# → GitHub에서 PR 생성: feature/resize-tool → dev

# dev → main 병합 (릴리즈)
# → GitHub에서 PR 생성: dev → main
```

#### GitHub Branch Protection 설정

```
GitHub → Settings → Branches → Add rule

Branch name pattern: main
☑ Require a pull request before merging
☑ Require approvals: 1 (협업 시)
☑ Require status checks to pass before merging
☑ Require branches to be up to date before merging
☑ Do not allow bypassing the above settings
```

> [!TIP]
> 1인 개발 시에도 `main` 브랜치 보호 설정을 권장한다. 실수로 직접 push하여 프로덕션에 미완성 코드가 배포되는 것을 방지한다.

---

### 1.4 README.md 템플릿

```markdown
# 🖼️ ConvertFile

> Windows XP themed online image & GIF editor — 100% client-side, zero server cost.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-orange?logo=cloudflare)](https://convertfile.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- 🎨 **Windows XP Classic Theme** — Nostalgic retro UI
- 🖼️ **Image Tools** — Resize, crop, rotate, flip, compress, convert
- 🎞️ **GIF Tools** — Create, split, optimize, reverse, speed control
- 🔒 **100% Client-Side** — All processing in your browser, nothing uploaded
- 📱 **Responsive** — Works on desktop & mobile
- 💰 **Free** — No signup, no watermarks, no limits

## 🛠️ Tech Stack

- Pure HTML5 + CSS3 + Vanilla JavaScript
- Canvas API for image processing
- gif.js for GIF encoding
- Hosted on Cloudflare Pages (free tier)

## 📁 Project Structure

```
├── index.html          # Main page
├── css/                # Stylesheets (XP theme)
├── js/                 # Application scripts
├── tools/              # Tool pages (one per tool)
├── pages/              # Static pages (about, privacy, terms)
├── assets/             # Icons, cursors, images
└── lib/                # Third-party libraries
```

## 🚀 Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/convert-file.git
cd convert-file

# Start a local server (any static server works)
npx serve .
# or
python -m http.server 8000
```

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
```

> [!NOTE]
> `YOUR_USERNAME`과 `convertfile.pages.dev`는 실제 값으로 교체한다.

---

### 1.5 커밋 컨벤션 (Conventional Commits)

#### 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### 타입 정의

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 추가 | `feat(resize): add image resize tool` |
| `fix` | 버그 수정 | `fix(crop): fix aspect ratio calculation` |
| `style` | XP 테마/CSS 변경 (기능 변화 없음) | `style(xp-theme): adjust title bar gradient` |
| `refactor` | 코드 리팩토링 | `refactor(canvas): extract filter functions` |
| `docs` | 문서 수정 | `docs: update deployment guide` |
| `chore` | 빌드/설정 변경 | `chore: update .gitignore` |
| `perf` | 성능 개선 | `perf(gif): optimize frame encoding` |
| `test` | 테스트 추가 | `test(resize): add unit tests` |
| `a11y` | 접근성 개선 | `a11y(toolbar): add ARIA labels` |
| `seo` | SEO 개선 | `seo(meta): add Open Graph tags` |

#### 스코프(scope) 정의

| 스코프 | 설명 |
|--------|------|
| `resize` | 이미지 리사이즈 도구 |
| `crop` | 이미지 크롭 도구 |
| `convert` | 포맷 변환 도구 |
| `gif` | GIF 관련 도구 |
| `xp-theme` | Windows XP 테마 |
| `layout` | 레이아웃/구조 |
| `adsense` | AdSense 관련 |
| `deploy` | 배포 설정 |
| `seo` | SEO 관련 |

#### 커밋 예시

```bash
# 기능 추가
git commit -m "feat(resize): add drag-and-drop image upload"

# 버그 수정
git commit -m "fix(crop): prevent negative width values

When user drags selection area from right to left,
width becomes negative causing canvas error.
Added Math.abs() to normalize dimensions."

# 스타일 변경
git commit -m "style(xp-theme): match exact Windows XP title bar colors"

# 배포 설정
git commit -m "chore(deploy): add _headers file with security policies"
```

#### 커밋 규칙

```
1. subject는 50자 이내
2. subject 첫 글자 소문자
3. subject 끝에 마침표(.) 없음
4. body는 72자에서 줄 바꿈
5. body는 "왜(why)" 변경했는지 설명
6. Breaking Change는 footer에 BREAKING CHANGE: 표기
```

---

## 2. Cloudflare Pages 설정 가이드

### 2.1 계정 생성

#### Step 1: Cloudflare 가입

```
1. https://dash.cloudflare.com/sign-up 접속
2. 이메일 주소 입력
3. 비밀번호 설정 (최소 8자, 영문+숫자+특수문자 권장)
4. "Sign up" 클릭
5. 이메일 인증 링크 확인 → 클릭하여 인증 완료
```

> [!NOTE]
> 가입 시 도메인 등록 단계가 나타날 수 있다. 커스텀 도메인이 없으면 "Skip" 가능. Pages는 도메인 없이도 `*.pages.dev` 주소로 서비스된다.

#### Step 2: Pages 서비스 위치 확인

```
Cloudflare Dashboard 좌측 사이드바:
┌─────────────────────────────┐
│ 📊 Home                     │
│ 🌐 Websites                 │
│ ⚡ Workers & Pages   ← 클릭  │
│    ├── Overview              │
│    └── Create        ← 여기  │
│ 📧 Email                    │
│ ...                         │
└─────────────────────────────┘
```

경로: **Workers & Pages** → **Create** → **Pages** 탭 선택

---

### 2.2 GitHub 연동

#### Step 1: Pages 프로젝트 생성

```
1. Cloudflare Dashboard → Workers & Pages → Create
2. "Pages" 탭 클릭
3. "Connect to Git" 클릭

   ┌─────────────────────────────────────┐
   │         Connect to Git              │
   │                                     │
   │  [🔗 Connect GitHub]  ← 클릭       │
   │  [🔗 Connect GitLab]               │
   │                                     │
   └─────────────────────────────────────┘
```

#### Step 2: GitHub 인증 및 권한 설정

```
4. GitHub 로그인 페이지로 리다이렉트
5. "Authorize Cloudflare Pages" 클릭

   ┌─────────────────────────────────────────────┐
   │     Install Cloudflare Pages                │
   │                                             │
   │  ○ All repositories        (전체 저장소)     │
   │  ● Only select repositories (특정 저장소)    │  ← 권장!
   │     └── [v] convert-file                    │
   │                                             │
   │  [Install]                                  │
   └─────────────────────────────────────────────┘
```

> [!WARNING]
> **"Only select repositories"를 반드시 선택한다.**
> "All repositories"를 선택하면 Cloudflare가 모든 저장소에 접근 권한을 갖게 된다. 보안을 위해 필요한 저장소만 선택하는 것이 원칙이다.

#### Step 3: 저장소 선택

```
6. 저장소 목록에서 "convert-file" 선택
7. "Begin setup" 클릭

   ┌─────────────────────────────────────┐
   │  Select a repository               │
   │                                     │
   │  🔍 Search repositories...          │
   │                                     │
   │  [•] YOUR_USERNAME/convert-file     │  ← 선택
   │  [ ] YOUR_USERNAME/other-repo       │
   │                                     │
   │  [Begin setup]                      │
   └─────────────────────────────────────┘
```

---

### 2.3 빌드 설정

#### Step 4: 빌드 및 배포 설정

```
   ┌─────────────────────────────────────────────────┐
   │  Set up builds and deployments                  │
   │                                                 │
   │  Project name: [convert-file        ]           │
   │  Production branch: [main           ]           │
   │                                                 │
   │  ── Build settings ──                           │
   │                                                 │
   │  Framework preset: [None            ]  ← None!  │
   │  Build command:    [                ]  ← 빈칸!  │
   │  Build output directory: [/         ]  ← 루트!  │
   │  Root directory (Advanced): [/      ]  ← 루트!  │
   │                                                 │
   │  ── Environment variables (Advanced) ──         │
   │  (추가 안 함)                                    │
   │                                                 │
   │  [Save and Deploy]                              │
   └─────────────────────────────────────────────────┘
```

#### 빌드 설정 상세

| 설정 항목 | 값 | 이유 |
|-----------|-----|------|
| **Project name** | `convert-file` | URL에 사용됨: `convert-file.pages.dev` |
| **Production branch** | `main` | 프로덕션 배포 브랜치 |
| **Framework preset** | `None` | 빌드 프레임워크 사용 안 함 (순수 HTML/CSS/JS) |
| **Build command** | *(빈칸)* | 정적 사이트이므로 빌드 과정 불필요 |
| **Build output directory** | `/` | 루트 디렉토리 전체가 배포 대상 |
| **Root directory** | `/` (기본값) | 저장소 루트 = 프로젝트 루트 |
| **Environment variables** | *(없음)* | 서버사이드 처리 없으므로 환경 변수 불필요 |

> [!IMPORTANT]
> **Build command는 반드시 빈칸으로 둔다.** 이 프로젝트는 순수 정적 파일이므로 빌드 단계가 없다. 빌드 명령을 입력하면 해당 명령이 없어 배포가 실패한다.

> [!TIP]
> **Project name은 URL에 직접 영향을 준다.** `convert-file`로 설정하면 `https://convert-file.pages.dev`가 기본 도메인이 된다. 한 번 설정하면 변경 불가하므로 신중히 결정한다.

---

### 2.4 배포 확인

#### Step 5: 첫 배포 확인

```
"Save and Deploy" 클릭 후:

   ┌─────────────────────────────────────────────────┐
   │  🚀 Deploying convert-file                      │
   │                                                 │
   │  ✅ Initializing build environment              │
   │  ✅ Cloning repository                          │
   │  ✅ Building application                        │
   │  ✅ Deploying to Cloudflare's global network    │
   │                                                 │
   │  🎉 Success! Your site is live at:              │
   │  https://convert-file.pages.dev                 │
   │                                                 │
   │  [Continue to project]                          │
   └─────────────────────────────────────────────────┘
```

#### 기본 도메인

```
프로덕션:  https://convert-file.pages.dev
프리뷰:    https://<commit-hash>.convert-file.pages.dev
```

#### 프리뷰 배포 (Preview Deployments)

```
PR(Pull Request) 생성 시 자동으로 프리뷰 URL 생성:

   GitHub PR #3: "feat(resize): add resize tool"
   ↓
   Cloudflare 자동 배포:
   https://abc1234.convert-file.pages.dev
   ↓
   GitHub PR 코멘트에 프리뷰 URL 자동 게시

   ┌─────────────────────────────────────────────────┐
   │  🤖 Cloudflare Pages bot                        │
   │                                                 │
   │  Deploying with Cloudflare Pages                │
   │                                                 │
   │  Latest commit: abc1234                         │
   │  Status: ✅ Deploy successful!                  │
   │  Preview URL: https://abc1234.convert-file...   │
   │  Branch Preview URL: https://feature-resize...  │
   └─────────────────────────────────────────────────┘
```

> [!TIP]
> 프리뷰 배포는 코드 리뷰 시 매우 유용하다. PR의 변경 사항을 실제 배포된 상태에서 확인할 수 있다. 별도 설정 없이 자동 활성화되어 있다.

#### 배포 로그 확인 방법

```
Cloudflare Dashboard → Workers & Pages → convert-file → Deployments

   ┌─────────────────────────────────────────────────────────┐
   │  Deployments                                           │
   │                                                        │
   │  🟢 Production  abc1234  main   2 min ago   Success    │
   │  🔵 Preview     def5678  dev    5 min ago   Success    │
   │  🔴 Preview     ghi9012  dev    1 hr ago    Failed     │
   │                                                        │
   │  각 항목 클릭 → 상세 빌드 로그 확인 가능                   │
   └─────────────────────────────────────────────────────────┘
```

배포 실패 시 로그에서 원인 확인 가능:
- 파일 크기 초과 (25MB 이상)
- 파일 수 초과 (20,000개 이상)
- 잘못된 `_redirects` / `_headers` 문법

---

## 3. 커스텀 도메인 설정 (선택)

> 기본 `*.pages.dev` 도메인으로도 충분하다. 커스텀 도메인은 브랜딩과 SEO를 위해 선택적으로 설정한다.

### 3.1 도메인 확보

#### 옵션 A: Cloudflare에서 도메인 구매 (권장)

```
1. Cloudflare Dashboard → Domain Registration → Register Domains
2. 원하는 도메인 검색: "convertfile.com"
3. 가격 확인 (Cloudflare는 원가에 판매, 마진 없음)
4. 결제 진행

장점:
- DNS 설정 자동 완료
- SSL 즉시 적용
- 추가 설정 최소화
```

#### 옵션 B: 외부 도메인 연결 (Namecheap, GoDaddy 등)

```
1. 외부 레지스트라에서 도메인 구매
2. Cloudflare에 사이트 추가:
   Dashboard → Websites → Add a Site → 도메인 입력
3. Cloudflare 네임서버로 변경:
   외부 레지스트라 DNS 설정에서 네임서버를 Cloudflare 제공 값으로 변경
   예: aria.ns.cloudflare.com
       brad.ns.cloudflare.com
4. 네임서버 전파 대기 (최대 24시간, 보통 수 분)
```

### 3.2 Pages에 커스텀 도메인 연결

```
1. Workers & Pages → convert-file → Custom domains → Set up a custom domain
2. 도메인 입력: "convertfile.com"
3. "Continue" 클릭
4. DNS 레코드 자동 생성 확인:

   ┌───────────────────────────────────────────────┐
   │  DNS Record                                   │
   │                                               │
   │  Type: CNAME                                  │
   │  Name: convertfile.com                        │
   │  Target: convert-file.pages.dev               │
   │  Proxy: ☁️ Proxied                            │
   │                                               │
   │  [Activate domain]                            │
   └───────────────────────────────────────────────┘

5. "Activate domain" 클릭
6. SSL 인증서 자동 발급 (수 분 소요)
```

### 3.3 DNS 설정 (CNAME)

#### 필수 레코드

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| `CNAME` | `@` (루트) | `convert-file.pages.dev` | ☁️ Proxied |
| `CNAME` | `www` | `convert-file.pages.dev` | ☁️ Proxied |

> [!NOTE]
> Cloudflare는 루트 도메인에도 CNAME을 지원한다 (CNAME flattening). 일반적으로 루트 도메인에는 A 레코드만 가능하지만, Cloudflare의 Proxy 모드에서는 CNAME flattening으로 이 제한을 우회한다.

### 3.4 SSL 자동 적용

```
Cloudflare Dashboard → SSL/TLS

SSL/TLS encryption mode: Full (strict)  ← 권장

   ┌────────────────────────────────────────────┐
   │  SSL/TLS Encryption Mode                   │
   │                                            │
   │  ○ Off (not secure)                        │
   │  ○ Flexible                                │
   │  ○ Full                                    │
   │  ● Full (strict)         ← 선택           │
   │                                            │
   └────────────────────────────────────────────┘
```

추가 SSL 설정:

| 설정 | 값 | 설명 |
|------|-----|------|
| Always Use HTTPS | ✅ ON | HTTP → HTTPS 자동 리다이렉트 |
| Automatic HTTPS Rewrites | ✅ ON | 혼합 콘텐츠(mixed content) 자동 수정 |
| Minimum TLS Version | TLS 1.2 | 보안 최소 버전 |
| TLS 1.3 | ✅ ON | 최신 TLS 지원 |
| HSTS | ✅ ON | HTTP Strict Transport Security |

### 3.5 www 리다이렉트

```
Cloudflare Dashboard → Rules → Redirect Rules → Create rule

규칙 설정:
  Rule name: "www to non-www redirect"
  When incoming requests match:
    Field: Hostname
    Operator: equals
    Value: www.convertfile.com

  Then:
    Type: Dynamic
    Expression: concat("https://convertfile.com", http.request.uri.path)
    Status code: 301 (Permanent Redirect)
```

> [!TIP]
> SEO 관점에서 `www`와 non-`www` 중 하나로 통일해야 한다. 이 프로젝트는 `convertfile.com` (non-www)을 정규 URL로 사용한다.

---

## 4. Cloudflare Pages 무료 플랜 제한

### 4.1 제한 사항 요약

| 항목 | 무료 플랜 제한 | 프로 플랜 ($20/월) |
|------|---------------|-------------------|
| **대역폭** | ♾️ 무제한 | ♾️ 무제한 |
| **요청 수** | ♾️ 무제한 | ♾️ 무제한 |
| **빌드 횟수** | 월 500회 | 월 5,000회 |
| **동시 빌드** | 1개 | 5개 |
| **파일 수** | 프로젝트당 20,000개 | 프로젝트당 20,000개 |
| **파일 크기** | 단일 파일 25MB | 단일 파일 25MB |
| **사이트 수** | 무제한 | 무제한 |
| **커스텀 도메인** | 무제한 | 무제한 |
| **프리뷰 배포** | ✅ | ✅ |
| **Web Analytics** | ✅ | ✅ |
| **DDoS 보호** | ✅ | ✅ |

### 4.2 이 프로젝트에 미치는 영향 분석

#### ✅ 대역폭 — 전혀 문제 없음

```
우리 프로젝트 특성:
- 모든 이미지 처리는 클라이언트(브라우저)에서 수행
- 사용자가 업로드한 이미지는 서버에 전송되지 않음
- 서버에서 전송하는 것은 HTML/CSS/JS/아이콘 파일뿐

예상 페이지 크기:
- HTML: ~15KB
- CSS (XP 테마): ~50KB
- JS: ~100KB
- 아이콘/이미지: ~200KB
- 외부 라이브러리 (gif.js 등): ~500KB
─────────────────────────
총: ~865KB / 페이지 로드

→ 무제한 대역폭이므로 트래픽 걱정 없음
```

#### ✅ 빌드 횟수 (월 500회) — 충분

```
빌드 = GitHub main 브랜치 push 또는 PR 생성 시 발생

예상 사용량:
- 1인 개발: 하루 3~5회 배포 × 30일 = 90~150회/월
- 2인 팀: 하루 5~10회 배포 × 30일 = 150~300회/월
- PR 프리뷰: PR당 1~3회 빌드

→ 월 500회는 1~2인 개발팀에게 매우 충분
→ 주의: 불필요한 커밋 push 남발 시 빌드 낭비
```

#### ✅ 파일 수 (20,000개) — 여유

```
예상 파일 수:
- HTML 페이지: ~30개 (도구별 1개 + 정적 페이지)
- CSS 파일: ~10개
- JS 파일: ~40개
- 아이콘/이미지: ~100개
- 외부 라이브러리: ~20개
- 기타 (robots.txt, sitemap 등): ~10개
─────────────────────────
총: ~210개

→ 20,000개 제한 대비 1% 수준, 전혀 문제 없음
```

#### ⚠️ 파일 크기 (25MB) — 주의 필요

```
주의가 필요한 파일:
- ffmpeg.wasm (Phase 3): 약 25MB → 제한에 근접!
  → 해결: CDN에서 동적 로드 (unpkg, jsdelivr)
  → 또는: 사용자 브라우저에서 직접 다운로드

- 기타 대용량 라이브러리는 외부 CDN 활용 권장

우리 자체 파일은 모두 1MB 미만이므로 문제 없음
```

#### ✅ 동시 빌드 (1개) — 문제 없음

```
1인 개발: 동시 빌드 필요 없음
소규모 팀: 빌드 큐에 쌓이지만, 빌드 자체가 수 초 (정적 사이트이므로)
→ 실질적 영향 없음
```

### 4.3 제한 대응 전략 요약

| 제한 | 상태 | 대응 |
|------|------|------|
| 대역폭 | 🟢 안전 | 대응 불필요 |
| 빌드 횟수 | 🟢 안전 | 불필요한 push 자제 |
| 파일 수 | 🟢 안전 | 대응 불필요 |
| 파일 크기 | 🟡 주의 | ffmpeg.wasm은 외부 CDN 로드 |
| 동시 빌드 | 🟢 안전 | 대응 불필요 |

---

## 5. 성능 최적화 (Cloudflare)

### 5.1 Auto Minify (자동 압축)

> [!WARNING]
> Cloudflare의 Auto Minify 기능은 2024년부터 점진적으로 폐지(deprecated) 중이다. 대신 Cloudflare의 **Speed → Optimization → Content Optimization** 에서 유사 기능을 확인한다. 프로젝트 자체에서 minified 파일을 직접 배포하는 것을 권장한다.

#### 직접 Minify (권장 방식)

개발 시에는 읽기 쉬운 원본 파일을 사용하고, 배포할 때는 minified 버전을 사용하는 전략:

```bash
# 간단한 minify 도구 (npx로 설치 없이 사용)
# HTML
npx html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html

# CSS
npx csso css/xp-theme.css -o css/xp-theme.min.css

# JS
npx terser js/app.js -o js/app.min.js --compress --mangle
```

> [!TIP]
> 이 프로젝트는 빌드 과정이 없으므로, 초기 단계에서는 minify 없이 원본 파일을 직접 배포해도 된다. 트래픽이 증가하면 그때 minify 도입을 고려한다.

### 5.2 Brotli 압축

```
Cloudflare Dashboard → Speed → Optimization → Content Optimization

Brotli: ✅ ON (기본 활성화)
```

| 압축 방식 | 압축률 | 지원 브라우저 |
|-----------|--------|--------------|
| Brotli | ~20-25% 더 작음 (vs gzip) | 모든 최신 브라우저 |
| Gzip | 기본 | 모든 브라우저 |

```
Cloudflare는 자동으로 최적의 압축을 선택:
1. 브라우저가 Brotli 지원 → Brotli로 전송
2. 브라우저가 Brotli 미지원 → Gzip으로 전송
3. 둘 다 미지원 → 원본 전송

→ 별도 설정 불필요. Cloudflare가 자동 처리.
```

### 5.3 브라우저 캐싱 설정

```
Cloudflare Dashboard → Caching → Configuration

Browser Cache TTL: Respect Existing Headers  ← 권장

→ 우리가 _headers 파일에서 설정한 Cache-Control 값을 사용
→ Cloudflare 대시보드에서 덮어쓰지 않음
```

#### 캐시 전략

| 리소스 유형 | Cache-Control | 이유 |
|-------------|---------------|------|
| HTML | `no-cache` | 항상 최신 버전 확인 |
| CSS/JS (해시 없음) | `public, max-age=604800` (7일) | 변경 가능성 있음 |
| CSS/JS (해시 포함) | `public, max-age=31536000, immutable` (1년) | 파일명에 해시 → 변경 시 새 URL |
| 이미지/아이콘 | `public, max-age=31536000, immutable` (1년) | 거의 변경 안 됨 |
| 외부 라이브러리 | `public, max-age=31536000, immutable` (1년) | 버전 고정 |

### 5.4 `_headers` 파일 설정

> 섹션 6에서 상세 설명

### 5.5 `_redirects` 파일 설정

프로젝트 루트에 `_redirects` 파일 생성:

```
# _redirects
# Cloudflare Pages 리다이렉트 규칙
# 형식: [source] [destination] [status_code]

# 이전 URL → 새 URL (도구 이름 변경 시)
/tools/image-resize    /tools/resize    301
/tools/image-crop      /tools/crop      301

# 짧은 URL 지원
/resize                /tools/resize    301
/crop                  /tools/crop      301
/convert               /tools/convert   301
/gif                   /tools/gif       301

# 404 fallback (SPA가 아니므로 사용 안 함)
# /* /index.html 200  ← 사용하지 않음!
```

#### `_redirects` 규칙

```
1. 파일은 프로젝트 루트(/)에 위치
2. 한 줄에 하나의 규칙
3. 형식: [원본 경로] [대상 경로] [HTTP 상태 코드]
4. 상태 코드:
   - 301: 영구 리다이렉트 (SEO에 유리)
   - 302: 임시 리다이렉트
   - 200: 리라이트 (URL은 유지, 내용만 변경)
5. 최대 2,000개 규칙
6. 정적 리다이렉트가 동적 리다이렉트보다 우선
7. # 으로 시작하는 줄은 주석
```

> [!IMPORTANT]
> 이 프로젝트는 SPA(Single Page Application)가 아니라 MPA(Multi Page Application)이다. `/* /index.html 200` 같은 SPA fallback 규칙은 사용하지 않는다. 각 도구 페이지가 독립적인 HTML 파일이다.

---

## 6. `_headers` 파일 설정

프로젝트 루트에 `_headers` 파일 생성:

### 6.1 전체 `_headers` 파일

```
# ============================================
# 전역 보안 헤더 (모든 페이지에 적용)
# ============================================
/*
  # 클릭재킹 방지: 이 페이지를 iframe에 삽입 불가
  X-Frame-Options: DENY
  # MIME 타입 스니핑 방지: 브라우저가 Content-Type을 추측하지 않음
  X-Content-Type-Options: nosniff
  # Referrer 정보 제한: 같은 origin에서만 전체 referrer 전송
  Referrer-Policy: strict-origin-when-cross-origin
  # 권한 정책: 카메라, 마이크, 위치 정보 사용 차단
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  # XSS 보호 (레거시 브라우저용)
  X-XSS-Protection: 1; mode=block

# ============================================
# JavaScript 파일 캐시 (장기 캐시)
# ============================================
/js/*
  # 1년 캐시, 변경 불가 표시
  # 파일 변경 시 파일명에 해시 추가 필요 (예: app.abc123.js)
  Cache-Control: public, max-age=31536000, immutable

# ============================================
# CSS 파일 캐시 (장기 캐시)
# ============================================
/css/*
  Cache-Control: public, max-age=31536000, immutable

# ============================================
# 정적 에셋 캐시 (아이콘, 이미지, 커서 등)
# ============================================
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# ============================================
# 외부 라이브러리 캐시
# ============================================
/lib/*
  Cache-Control: public, max-age=31536000, immutable

# ============================================
# HTML 페이지 (항상 최신 확인)
# ============================================
/*.html
  # no-cache: 캐시는 하되, 매 요청마다 서버에 유효성 확인
  Cache-Control: no-cache

# ============================================
# 메인 페이지
# ============================================
/
  Cache-Control: no-cache

# ============================================
# robots.txt, sitemap.xml (매일 확인)
# ============================================
/robots.txt
  Cache-Control: public, max-age=86400

/sitemap.xml
  Cache-Control: public, max-age=86400

# ============================================
# ads.txt (AdSense 인증 — 매일 확인)
# ============================================
/ads.txt
  Cache-Control: public, max-age=86400
```

### 6.2 헤더 상세 설명

#### 보안 헤더

| 헤더 | 값 | 설명 |
|------|-----|------|
| `X-Frame-Options` | `DENY` | 이 사이트를 `<iframe>`에 삽입 불가. 클릭재킹(clickjacking) 공격 방지 |
| `X-Content-Type-Options` | `nosniff` | 브라우저가 MIME 타입을 추측하지 않음. 악성 파일 실행 방지 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 외부 사이트로 이동 시 origin만 전달, 전체 URL 미전달 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 불필요한 브라우저 API 사용 차단 |
| `X-XSS-Protection` | `1; mode=block` | XSS 감지 시 페이지 렌더링 차단 (레거시 브라우저용) |

#### 캐시 헤더

| 값 | 의미 |
|----|------|
| `public` | CDN과 브라우저 모두 캐시 가능 |
| `max-age=31536000` | 365일 (1년) 캐시 유지 |
| `immutable` | 파일이 변경되지 않음을 브라우저에 알림 (재검증 요청 없음) |
| `no-cache` | 캐시는 하되, 매번 서버에 유효성 확인 (ETag/Last-Modified) |

### 6.3 CSP (Content Security Policy) — 향후 추가

> [!NOTE]
> CSP는 AdSense 적용 후에 설정한다. AdSense 스크립트 도메인을 허용 목록에 추가해야 하기 때문이다.

AdSense 적용 후 추가할 CSP 예시:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://www.googletagservices.com 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://pagead2.googlesyndication.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; connect-src 'self' https://pagead2.googlesyndication.com;
```

> [!WARNING]
> CSP를 잘못 설정하면 AdSense 광고가 표시되지 않는다. AdSense 승인 후 단계적으로 적용하고, 브라우저 콘솔에서 CSP 위반 로그를 확인하며 조정한다.

---

## 7. `ads.txt` 파일

### 7.1 ads.txt란?

```
ads.txt (Authorized Digital Sellers)
- Google이 권장하는 광고 사기 방지 표준
- 이 파일이 없으면 AdSense 승인이 어려울 수 있음
- 도메인 루트(/)에 위치해야 함: https://convertfile.com/ads.txt
- 반드시 정확한 Publisher ID를 입력해야 함
```

### 7.2 파일 내용

프로젝트 루트에 `ads.txt` 파일 생성:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

#### 각 필드 설명

| 필드 | 값 | 설명 |
|------|-----|------|
| 도메인 | `google.com` | 광고 시스템 도메인 |
| Publisher ID | `pub-XXXXXXXXXXXXXXXX` | 본인의 AdSense Publisher ID |
| 관계 | `DIRECT` | 직접 계약 (중개인이 아님) |
| 인증 ID | `f08c47fec0942fa0` | Google의 TAG ID (고정값) |

### 7.3 Publisher ID 확인 방법

```
1. Google AdSense 로그인: https://www.google.com/adsense/
2. 좌측 메뉴 → 계정 → 계정 정보
3. "게시자 ID" 확인: pub-XXXXXXXXXXXXXXXX
4. 위 ads.txt의 XXXXXXXXXXXXXXXX 부분을 실제 ID로 교체
```

### 7.4 ads.txt 배치 및 확인

```
프로젝트 루트/
├── index.html
├── ads.txt          ← 여기!
├── _headers
├── _redirects
└── ...
```

#### 확인 방법

```
배포 후 접속 테스트:
https://convert-file.pages.dev/ads.txt

응답 내용:
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

HTTP Status: 200 OK
Content-Type: text/plain
```

> [!IMPORTANT]
> **ads.txt는 반드시 루트 경로에 위치해야 한다.** `/pages/ads.txt`나 `/public/ads.txt`에 두면 Google 크롤러가 인식하지 못한다. Cloudflare Pages에서는 저장소 루트에 파일을 두면 자동으로 `/ads.txt`로 접근 가능하다.

### 7.5 AdSense 승인 전 주의사항

```
ads.txt 파일은 AdSense 계정 승인 후에 추가하는 것이 정확하다.
승인 전에는 Publisher ID를 모르기 때문이다.

순서:
1. 사이트 콘텐츠 완성 (최소 10~15페이지)
2. 필수 페이지 작성 (About, Privacy Policy, Terms)
3. AdSense 신청
4. 승인 후 Publisher ID 확인
5. ads.txt 파일 생성 및 배포
6. AdSense 대시보드에서 ads.txt 상태 확인 ("승인됨" 표시)
```

---

## 8. 모니터링

### 8.1 Cloudflare Web Analytics (무료)

```
Cloudflare Dashboard → Workers & Pages → convert-file → Analytics

또는

Cloudflare Dashboard → Analytics & Logs → Web Analytics
```

#### 제공 지표

| 지표 | 설명 |
|------|------|
| **총 방문 수** | 페이지 방문 횟수 |
| **고유 방문자** | 중복 제거된 방문자 수 |
| **페이지뷰** | 조회된 페이지 수 |
| **상위 페이지** | 가장 많이 방문한 페이지 순위 |
| **국가별 트래픽** | 방문자의 국가 분포 |
| **브라우저 분포** | Chrome, Firefox, Safari 등 비율 |
| **디바이스 분포** | Desktop, Mobile, Tablet 비율 |
| **성능 (Core Web Vitals)** | LCP, FID, CLS 측정 |

#### Web Analytics 스크립트 삽입 (선택)

```html
<!-- Cloudflare Web Analytics -->
<!-- 모든 HTML 페이지의 </body> 직전에 삽입 -->
<script
  defer
  src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "YOUR_ANALYTICS_TOKEN"}'
></script>
```

> [!TIP]
> Pages에 배포된 사이트는 기본적으로 서버 측 분석이 활성화되어 있다. JavaScript 스크립트를 추가하면 클라이언트 측 성능 지표(Core Web Vitals)까지 수집할 수 있다. Analytics 토큰은 Cloudflare Dashboard → Web Analytics에서 확인한다.

### 8.2 에러 페이지 모니터링

#### 커스텀 404 페이지

`404.html`을 프로젝트 루트에 생성:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지를 찾을 수 없습니다 - ConvertFile</title>
    <link rel="stylesheet" href="/css/xp-theme.css">
    <style>
        /* 404 페이지 전용 스타일 */
        .error-container {
            /* Windows XP 에러 다이얼로그 스타일 */
            max-width: 500px;
            margin: 100px auto;
            text-align: center;
        }
        .error-icon {
            /* XP 에러 아이콘 (빨간 X) */
            font-size: 64px;
            margin-bottom: 20px;
        }
        .error-code {
            font-size: 48px;
            font-weight: bold;
            color: #003399;
        }
        .error-message {
            font-size: 14px;
            margin: 20px 0;
            color: #333;
        }
        .error-button {
            /* XP 스타일 버튼 */
            padding: 6px 20px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <!-- Windows XP 에러 다이얼로그 재현 -->
        <div class="error-icon">❌</div>
        <div class="error-code">404</div>
        <p class="error-message">
            요청하신 페이지를 찾을 수 없습니다.<br>
            URL을 확인하거나 홈으로 돌아가세요.
        </p>
        <a href="/" class="error-button">홈으로 돌아가기</a>
    </div>
</body>
</html>
```

> [!NOTE]
> Cloudflare Pages는 자동으로 `404.html` 파일을 커스텀 에러 페이지로 인식한다. 별도 설정 없이 프로젝트 루트에 `404.html`을 두면 된다.

#### 에러 발생 확인

```
Cloudflare Dashboard → Workers & Pages → convert-file → Deployments

배포별 로그에서 확인 가능:
- 빌드 에러
- 파일 누락
- 설정 오류
```

### 8.3 배포 실패 알림 설정

#### GitHub 알림 (기본 활성화)

```
GitHub → Settings → Notifications

배포 봇이 PR에 자동으로 댓글:
- ✅ 배포 성공: 프리뷰 URL 제공
- ❌ 배포 실패: 에러 메시지 표시
```

#### Cloudflare 이메일 알림

```
Cloudflare Dashboard → Notifications → Add notification

추천 알림 설정:
┌─────────────────────────────────────────────┐
│  Create Notification                        │
│                                             │
│  Event type:                                │
│  ☑ Pages project deployment failure         │
│  ☑ Pages project deployment success         │
│                                             │
│  Delivery method:                           │
│  ● Email                                    │
│  ○ Webhook (PagerDuty, Slack 등)            │
│                                             │
│  Email: your-email@example.com              │
│                                             │
│  [Create]                                   │
└─────────────────────────────────────────────┘
```

#### Discord / Slack 웹훅 알림 (선택)

```
Cloudflare Dashboard → Notifications → Add notification

Event type: Pages project deployment failure
Delivery method: Webhook

Webhook URL: https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
또는
Webhook URL: https://hooks.slack.com/services/YOUR_WEBHOOK_URL
```

### 8.4 Google Search Console 연동 (SEO 모니터링)

```
1. https://search.google.com/search-console/ 접속
2. "URL prefix" 선택 → 사이트 URL 입력
3. 소유권 확인 방법: "HTML 파일 업로드" 또는 "DNS 레코드"
4. Cloudflare DNS 사용 시: TXT 레코드 추가로 간편 인증

확인 가능 항목:
- 색인 상태 (어떤 페이지가 Google에 등록되었는지)
- 검색 쿼리 (어떤 키워드로 유입되는지)
- 크롤링 에러 (404, 500 등)
- Core Web Vitals (성능 점수)
- 모바일 사용성
```

---

## 부록 A: 배포 체크리스트

### 첫 배포 전 체크리스트

```
[ ] .gitignore 파일 생성 및 확인
[ ] README.md 작성
[ ] index.html 생성 (최소한의 콘텐츠)
[ ] 404.html 생성
[ ] _headers 파일 생성
[ ] _redirects 파일 생성 (필요 시)
[ ] robots.txt 생성
[ ] sitemap.xml 생성
[ ] ads.txt 생성 (AdSense 승인 후)
[ ] GitHub 저장소 생성 및 push
[ ] Cloudflare Pages 프로젝트 생성
[ ] GitHub 연동 완료
[ ] 빌드 설정 확인 (Framework: None, Build command: 빈칸)
[ ] 첫 배포 성공 확인
[ ] https://convert-file.pages.dev 접속 테스트
```

### 릴리즈 전 체크리스트

```
[ ] 모든 도구 페이지 정상 동작 확인
[ ] 보안 헤더 적용 확인 (개발자 도구 → Network → Response Headers)
[ ] 404 페이지 정상 표시 확인
[ ] 모바일 반응형 확인
[ ] 브라우저 호환성 확인 (Chrome, Firefox, Safari, Edge)
[ ] 필수 페이지 확인 (About, Privacy, Terms)
[ ] SEO 메타 태그 확인
[ ] robots.txt / sitemap.xml 확인
[ ] 페이지 로딩 속도 확인 (Lighthouse)
[ ] HTTPS 정상 작동 확인
```

### 커스텀 도메인 체크리스트

```
[ ] 도메인 구매 완료
[ ] Cloudflare DNS에 CNAME 레코드 추가
[ ] Pages에 커스텀 도메인 연결
[ ] SSL 인증서 발급 확인
[ ] HTTPS 리다이렉트 활성화
[ ] www → non-www 리다이렉트 설정
[ ] 커스텀 도메인 접속 테스트
[ ] Google Search Console에 새 도메인 등록
```

---

## 부록 B: 자주 발생하는 문제 & 해결

### 문제 1: 배포 후 404 에러

```
원인: Build output directory 설정 오류
해결:
  1. Cloudflare Pages → Settings → Builds & deployments
  2. Build output directory를 "/" 로 설정
  3. 재배포: Deployments → 최근 배포 → Retry deployment
```

### 문제 2: CSS/JS 변경이 반영되지 않음

```
원인: 브라우저 캐시 또는 Cloudflare 엣지 캐시
해결:
  방법 1: 강제 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
  방법 2: Cloudflare 캐시 퍼지
    Dashboard → Caching → Configuration → Purge Everything
  방법 3: 파일명에 버전/해시 추가
    <link rel="stylesheet" href="/css/xp-theme.css?v=1.0.1">
    <script src="/js/app.js?v=1.0.1"></script>
```

### 문제 3: `_headers` 파일이 적용되지 않음

```
원인: 파일 위치 또는 문법 오류
확인:
  1. _headers 파일이 Build output directory 루트에 있는지 확인
  2. 문법 확인: 경로 아래 헤더는 반드시 2칸 들여쓰기
  3. 개발자 도구 → Network → 응답 헤더에서 확인

잘못된 예:
/*
X-Frame-Options: DENY     ← 들여쓰기 없음!

올바른 예:
/*
  X-Frame-Options: DENY   ← 2칸 들여쓰기!
```

### 문제 4: 파일 크기 초과 에러

```
원인: 25MB 이상 파일 포함
해결:
  1. 대용량 파일 확인: git ls-files -l | sort -k1 -rn | head
  2. 25MB 이상 파일은 .gitignore에 추가
  3. 대용량 라이브러리는 외부 CDN에서 로드
     <script src="https://cdn.jsdelivr.net/npm/ffmpeg.wasm@0.12.6/dist/ffmpeg.min.js"></script>
```

### 문제 5: 프리뷰 배포가 생성되지 않음

```
원인: GitHub App 권한 문제
해결:
  1. GitHub → Settings → Applications → Cloudflare Pages
  2. "Repository access" 확인
  3. 해당 저장소가 선택되어 있는지 확인
  4. 필요 시 "Reconfigure" 클릭
```

---

## 부록 C: 유용한 명령어 모음

```bash
# ===========================
# Git 기본 명령어
# ===========================

# 상태 확인
git status

# 전체 스테이지 & 커밋
git add .
git commit -m "feat(resize): add image resize tool"

# main 브랜치에 push (배포 트리거)
git push origin main

# dev 브랜치에 push (프리뷰 배포 트리거)
git push origin dev

# ===========================
# 로컬 개발 서버
# ===========================

# Node.js (npx)
npx serve . -p 8080

# Python
python -m http.server 8080

# PHP
php -S localhost:8080

# ===========================
# 파일 크기 확인 (25MB 제한 확인용)
# ===========================

# Windows PowerShell
Get-ChildItem -Recurse -File | Sort-Object Length -Descending | Select-Object -First 10 Name, @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}}

# Git Bash / Linux / macOS
find . -type f -exec du -h {} + | sort -rh | head -20

# ===========================
# 파일 수 확인 (20,000개 제한 확인용)
# ===========================

# Windows PowerShell
(Get-ChildItem -Recurse -File).Count

# Git Bash / Linux / macOS
find . -type f | wc -l
```

---

## 참조 링크

| 리소스 | URL |
|--------|-----|
| Cloudflare Pages 문서 | https://developers.cloudflare.com/pages/ |
| Pages 빌드 설정 | https://developers.cloudflare.com/pages/configuration/build-configuration/ |
| `_headers` 설정 | https://developers.cloudflare.com/pages/configuration/headers/ |
| `_redirects` 설정 | https://developers.cloudflare.com/pages/configuration/redirects/ |
| Pages 제한 사항 | https://developers.cloudflare.com/pages/platform/limits/ |
| Conventional Commits | https://www.conventionalcommits.org/ |
| ads.txt 사양 | https://iabtechlab.com/ads-txt/ |
| Google AdSense | https://www.google.com/adsense/ |
| Google Search Console | https://search.google.com/search-console/ |

---

> **관련 문서**
> - [00-project-overview.md](./00-project-overview.md) — 프로젝트 개요
> - [01-architecture.md](./01-architecture.md) — 프로젝트 구조 & 아키텍처
> - [04-seo-adsense.md](./04-seo-adsense.md) — SEO & AdSense 전략
> - [06-qa-testing.md](./06-qa-testing.md) — QA & 테스트

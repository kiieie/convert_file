/**
 * ==========================================================================
 * ConvertFile - Dynamic Sidebar Injection Module (sidebar.js)
 * ==========================================================================
 * 모든 페이지의 좌측 사이드바 구조를 동적 렌더링하고 활성 상태를 자동 감지합니다.
 * 이를 통해 중복 마크업을 제거하고 사이트 전체의 유지보수 효율을 극대화합니다.
 */

document.addEventListener("DOMContentLoaded", () => {
    const sidebarEl = document.querySelector('.modern-sidebar');
    if (!sidebarEl) return;

    // 현재 브라우저의 상대 경로 경로 정보 감지
    const currentPath = window.location.pathname;

    const sidebarHtml = `
        <div class="modern-sidebar__logo" onclick="location.href='/'" style="cursor:pointer;">
            <span>⚡ ConvertFile</span>
        </div>
        
        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">이미지 편집</div>
            <a href="/tools/resize.html" class="modern-sidebar__item" id="menu-resize">
                <span>📐</span> 이미지 크기 조절
            </a>
            <a href="/tools/crop.html" class="modern-sidebar__item" id="menu-crop">
                <span>✂️</span> 이미지 자르기
            </a>
            <a href="/tools/rotate.html" class="modern-sidebar__item" id="menu-rotate">
                <span>🔄</span> 회전 및 반전
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">포맷 변환</div>
            <a href="/tools/jpg-png.html" class="modern-sidebar__item" id="menu-jpg-png">
                <span>🔁</span> 포맷 변환 (JPG/PNG/WebP)
            </a>
            <a href="/tools/gif-maker.html" class="modern-sidebar__item" id="menu-gif-maker">
                <span>🎞️</span> 움짤 GIF 메이커
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">GIF 도구 (ezgif 클론)</div>
            <a href="/tools/gif-splitter.html" class="modern-sidebar__item" id="menu-gif-splitter">
                <span>✂️</span> GIF 프레임 분할
            </a>
            <a href="/tools/gif-optimize.html" class="modern-sidebar__item" id="menu-gif-optimize">
                <span>📉</span> GIF 최적화 및 압축
            </a>
            <a href="/tools/gif-speed.html" class="modern-sidebar__item" id="menu-gif-speed">
                <span>⏳</span> GIF 속도 및 역재생
            </a>
            <a href="/tools/gif-effects.html" class="modern-sidebar__item" id="menu-gif-effects">
                <span>🎨</span> GIF 효과 및 캡션
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">비디오 도구</div>
            <a href="/tools/video-gif.html" class="modern-sidebar__item" id="menu-video-gif">
                <span>🎞️</span> 비디오 to GIF 변환
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">PDF 도구</div>
            <a href="/tools/pdf.html" class="modern-sidebar__item" id="menu-pdf">
                <span>📄</span> PDF ↔ 이미지 변환
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">유틸리티</div>
            <a href="/tools/barcode.html" class="modern-sidebar__item" id="menu-barcode">
                <span>📊</span> QR & 바코드 스캔/생성
            </a>
            <a href="/tools/metadata.html" class="modern-sidebar__item" id="menu-metadata">
                <span>🛡️</span> 사진 EXIF 지우개
            </a>
        </div>

        <div class="modern-sidebar__group" style="margin-top:auto;">
            <div class="modern-sidebar__group-title">고객 및 정책</div>
            <a href="/pages/about.html" class="modern-sidebar__item" id="menu-about">소개 (About)</a>
            <a href="/pages/privacy.html" class="modern-sidebar__item" id="menu-privacy">개인정보처리방침</a>
            <a href="/pages/terms.html" class="modern-sidebar__item" id="menu-terms">이용약관</a>
            <a href="/pages/contact.html" class="modern-sidebar__item" id="menu-contact">문의하기</a>
        </div>
    `;

    // 사이드바 구조 렌더링
    sidebarEl.innerHTML = sidebarHtml;

    // 경로 매치 기반 active 하이라이트 클래스 적용
    const items = sidebarEl.querySelectorAll('.modern-sidebar__item');
    items.forEach(item => {
        const href = item.getAttribute('href');
        // 정확히 매칭되거나, 서브페이지 경로일 경우 활성화 처리
        if (currentPath === href || (href !== '/' && currentPath.indexOf(href) === 0)) {
            item.classList.add('modern-sidebar__item--active');
        }
    });
});

/**
 * ==========================================================================
 * ConvertFile - Multi-language Auto Detection & Redirect System (lang-detector.js)
 * ==========================================================================
 * 브라우저의 기본 설정 언어 또는 사용자의 기존 선택 기록(localStorage)을 기반으로
 * 영어(기본 루트), 한국어(/ko/), 스페인어(/es/) 경로로 자동 유도합니다.
 */

(function() {
    const LANG_KEY = 'convertfile-user-lang';
    const currentPath = window.location.pathname;

    // 다국어 페이지 이주가 완료된 대상 목록 (이 외의 페이지는 404 방지를 위해 리다이렉트 생략)
    const supportedPages = ['/', '/index.html', '/tools/pdf.html'];
    const isSupported = supportedPages.some(page => {
        return currentPath === page || 
               currentPath === '/ko' + page || 
               currentPath === '/es' + page ||
               (page === '/' && (currentPath === '/ko/' || currentPath === '/es/'));
    });

    // 무한 루프 리다이렉트 방지를 위해 이미 다국어 경로에 진입했는지 검사
    const isKoreanPath = currentPath.startsWith('/ko/');
    const isSpanishPath = currentPath.startsWith('/es/');
    const isLangSpecificPath = isKoreanPath || isSpanishPath;

    // 사용자 수동 지정 언어 로드 또는 브라우저 언어 자동 감지
    function detectLanguage() {
        const savedLang = localStorage.getItem(LANG_KEY);
        if (savedLang) return savedLang;

        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        if (browserLang.startsWith('ko')) {
            return 'ko';
        } else if (browserLang.startsWith('es')) {
            return 'es';
        }
        return 'en'; // 기본값 영어
    }

    const targetLang = detectLanguage();

    // 다국어 주소 전환 라우팅 함수
    function routeLanguage() {
        if (!isSupported) return;
        let cleanPath = currentPath;
        
        // 기존 언어 프리픽스 제거하여 순수 상대경로 획득
        if (isKoreanPath) cleanPath = currentPath.substring(3);
        if (isSpanishPath) cleanPath = currentPath.substring(3);
        if (cleanPath === '') cleanPath = '/';

        let targetPath = cleanPath;
        if (targetLang === 'ko') {
            targetPath = '/ko' + cleanPath;
        } else if (targetLang === 'es') {
            targetPath = '/es' + cleanPath;
        } else {
            targetPath = cleanPath; // 영어는 루트 유지
        }

        // 현재 주소와 타겟 주소가 다를 때만 리다이렉트 실행
        if (window.location.pathname !== targetPath) {
            window.location.href = targetPath + window.location.search + window.location.hash;
        }
    }

    // 만약 사용자가 명시적으로 언어를 수동 변경한 경우 호출할 전역 함수 바인딩
    window.changeLanguage = function(lang) {
        localStorage.setItem(LANG_KEY, lang);
        routeLanguage();
    };

    // 최초 로드 시 감지 및 분기 실행 (수동 언어 설정을 따름)
    routeLanguage();
})();

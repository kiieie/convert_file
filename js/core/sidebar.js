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

    // 현재 진입한 다국어 경로 감지 및 프리픽스 설정
    const isKorean = currentPath.startsWith('/ko/');
    const isSpanish = currentPath.startsWith('/es/');
    const langPrefix = isKorean ? '/ko' : (isSpanish ? '/es' : '');
    const currentLang = isKorean ? 'ko' : (isSpanish ? 'es' : 'en');

    // 다국어 텍스트 정의
    const textMenu = {
        en: {
            editor: "Image Editor",
            resize: "Resize Image",
            crop: "Crop Image",
            rotate: "Rotate & Flip",
            convertGroup: "Format Convert",
            convert: "Format Convert (JPG/PNG)",
            gifMaker: "GIF Maker",
            gifGroup: "GIF Tools (ezgif clone)",
            gifSplit: "GIF Frame Splitter",
            gifOpt: "GIF Optimizer",
            gifSpeed: "GIF Speed & Reverse",
            gifEffects: "GIF Effects & Caption",
            videoGroup: "Video Tools",
            videoGif: "Video to GIF",
            pdfGroup: "PDF Tools",
            pdfImgToPdf: "Images → PDF",
            pdfPdfToImg: "PDF → Images",
            pdfMerge: "PDF Merge",
            pdfSplit: "PDF Split",
            pdfEdit: "PDF Edit",
            utilGroup: "Utilities",
            barcode: "QR & Barcode Scanner/Gen",
            metadata: "Photo EXIF Remover",
            policyGroup: "Policy & Contact",
            about: "About Us",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
            contact: "Contact Us"
        },
        ko: {
            editor: "이미지 편집",
            resize: "이미지 크기 조절",
            crop: "이미지 자르기",
            rotate: "회전 및 반전",
            convertGroup: "포맷 변환",
            convert: "포맷 변환 (JPG/PNG/WebP)",
            gifMaker: "움짤 GIF 메이커",
            gifGroup: "GIF 도구 (ezgif 클론)",
            gifSplit: "GIF 프레임 분할",
            gifOpt: "GIF 최적화 및 압축",
            gifSpeed: "GIF 속도 및 역재생",
            gifEffects: "GIF 효과 및 캡션",
            videoGroup: "비디오 도구",
            videoGif: "비디오 to GIF 변환",
            pdfGroup: "PDF 도구",
            pdfImgToPdf: "이미지 → PDF 병합",
            pdfPdfToImg: "PDF → 이미지 추출",
            pdfMerge: "PDF 끼리 병합",
            pdfSplit: "PDF 페이지 분할",
            pdfEdit: "PDF 편집 (삭제/회전/압축)",
            utilGroup: "유틸리티",
            barcode: "QR & 바코드 스캔/생성",
            metadata: "사진 EXIF 지우개",
            policyGroup: "고객 및 정책",
            about: "소개 (About)",
            privacy: "개인정보처리방침",
            terms: "이용약관",
            contact: "문의하기"
        },
        es: {
            editor: "Editor de Imagen",
            resize: "Redimensionar Imagen",
            crop: "Recortar Imagen",
            rotate: "Rotar y Voltear",
            convertGroup: "Convertir Formato",
            convert: "Convertidor (JPG/PNG/WebP)",
            gifMaker: "Creador de GIF",
            gifGroup: "Herramientas GIF (clon ezgif)",
            gifSplit: "Dividir fotogramas GIF",
            gifOpt: "Optimizar y Comprimir GIF",
            gifSpeed: "Velocidad y Reverso de GIF",
            gifEffects: "Efectos y Subtítulos de GIF",
            videoGroup: "Herramientas de Video",
            videoGif: "Video a GIF",
            pdfGroup: "Herramientas PDF",
            pdfImgToPdf: "Imágenes → PDF",
            pdfPdfToImg: "PDF → Imágenes",
            pdfMerge: "Combinar PDF",
            pdfSplit: "Dividir PDF",
            pdfEdit: "Editar PDF (Rotar/Borrar)",
            utilGroup: "Utilidades",
            barcode: "Escáner/Gen de QR y Barras",
            metadata: "Eliminador de EXIF",
            policyGroup: "Políticas y Soporte",
            about: "Sobre Nosotros",
            privacy: "Política de Privacidad",
            terms: "Términos de Servicio",
            contact: "Contáctenos"
        }
    };

    const t = textMenu[currentLang];

    const sidebarHtml = `
        <div class="modern-sidebar__logo" onclick="location.href='${langPrefix}/'" style="cursor:pointer;">
            <span>⚡ ConvertFile</span>
        </div>
        
        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.editor}</div>
            <a href="${langPrefix}/tools/resize.html" class="modern-sidebar__item" id="menu-resize">
                <span>📐</span> ${t.resize}
            </a>
            <a href="${langPrefix}/tools/crop.html" class="modern-sidebar__item" id="menu-crop">
                <span>✂️</span> ${t.crop}
            </a>
            <a href="${langPrefix}/tools/rotate.html" class="modern-sidebar__item" id="menu-rotate">
                <span>🔄</span> ${t.rotate}
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.convertGroup}</div>
            <a href="${langPrefix}/tools/jpg-png.html" class="modern-sidebar__item" id="menu-jpg-png">
                <span>🔁</span> ${t.convert}
            </a>
            <a href="${langPrefix}/tools/gif-maker.html" class="modern-sidebar__item" id="menu-gif-maker">
                <span>🎞️</span> ${t.gifMaker}
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.gifGroup}</div>
            <a href="${langPrefix}/tools/gif-splitter.html" class="modern-sidebar__item" id="menu-gif-splitter">
                <span>✂️</span> ${t.gifSplit}
            </a>
            <a href="${langPrefix}/tools/gif-optimize.html" class="modern-sidebar__item" id="menu-gif-optimize">
                <span>📉</span> ${t.gifOpt}
            </a>
            <a href="${langPrefix}/tools/gif-speed.html" class="modern-sidebar__item" id="menu-gif-speed">
                <span>⏳</span> ${t.gifSpeed}
            </a>
            <a href="${langPrefix}/tools/gif-effects.html" class="modern-sidebar__item" id="menu-gif-effects">
                <span>🎨</span> ${t.gifEffects}
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.videoGroup}</div>
            <a href="${langPrefix}/tools/video-gif.html" class="modern-sidebar__item" id="menu-video-gif">
                <span>🎞️</span> ${t.videoGif}
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.pdfGroup}</div>
            <a href="${langPrefix}/tools/pdf.html?tab=img-to-pdf" class="modern-sidebar__item" id="menu-pdf-img-to-pdf">
                <span>🖼️</span> ${t.pdfImgToPdf}
            </a>
            <a href="${langPrefix}/tools/pdf.html?tab=pdf-to-img" class="modern-sidebar__item" id="menu-pdf-pdf-to-img">
                <span>🖼️</span> ${t.pdfPdfToImg}
            </a>
            <a href="${langPrefix}/tools/pdf.html?tab=pdf-merge" class="modern-sidebar__item" id="menu-pdf-merge">
                <span>🔗</span> ${t.pdfMerge}
            </a>
            <a href="${langPrefix}/tools/pdf.html?tab=pdf-split" class="modern-sidebar__item" id="menu-pdf-split">
                <span>✂️</span> ${t.pdfSplit}
            </a>
            <a href="${langPrefix}/tools/pdf.html?tab=pdf-edit" class="modern-sidebar__item" id="menu-pdf-edit">
                <span>🛠️</span> ${t.pdfEdit}
            </a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.utilGroup}</div>
            <a href="${langPrefix}/tools/barcode.html" class="modern-sidebar__item" id="menu-barcode">
                <span>📊</span> ${t.barcode}
            </a>
            <a href="${langPrefix}/tools/metadata.html" class="modern-sidebar__item" id="menu-metadata">
                <span>🛡️</span> ${t.metadata}
            </a>
        </div>

        <div class="modern-sidebar__group" style="margin-top:auto;">
            <div class="modern-sidebar__group-title">${t.policyGroup}</div>
            <a href="${langPrefix}/pages/about.html" class="modern-sidebar__item" id="menu-about">${t.about}</a>
            <a href="${langPrefix}/pages/privacy.html" class="modern-sidebar__item" id="menu-privacy">${t.privacy}</a>
            <a href="${langPrefix}/pages/terms.html" class="modern-sidebar__item" id="menu-terms">${t.terms}</a>
            <a href="${langPrefix}/pages/contact.html" class="modern-sidebar__item" id="menu-contact">${t.contact}</a>
        </div>

        <div class="modern-sidebar__group" style="margin-top:15px; border-top:1px solid var(--slate-200); padding-top:10px;">
            <div class="modern-sidebar__group-title">🌐 Language / 언어</div>
            <select class="modern-select" onchange="window.changeLanguage ? window.changeLanguage(this.value) : null" style="width:100%; height:28px; font-size:11px; padding:2px 6px;">
                <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English (Global)</option>
                <option value="ko" ${currentLang === 'ko' ? 'selected' : ''}>한국어 (Korean)</option>
                <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español (Spanish)</option>
            </select>
        </div>
    `;

    // 사이드바 구조 렌더링
    sidebarEl.innerHTML = sidebarHtml;

    // 경로 및 쿼리 매치 기반 active 하이라이트 클래스 적용
    const items = sidebarEl.querySelectorAll('.modern-sidebar__item');
    const currentFull = currentPath + window.location.search;

    items.forEach(item => {
        const href = item.getAttribute('href');
        let isActive = false;

        if (href.includes('?')) {
            // 쿼리 매개변수가 포함된 경로의 경우 full URL 비교 수행
            isActive = (currentFull === href);
        } else {
            // 일반 경로의 경우 pathname만 매치
            isActive = (currentPath === href);
        }

        if (isActive) {
            item.classList.add('modern-sidebar__item--active');
        }
    });
});

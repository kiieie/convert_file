/**
 * ==========================================================================
 * ConvertFile - Dynamic Sidebar Injection Module (sidebar.js)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    const sidebarEl = document.querySelector('.modern-sidebar');
    if (!sidebarEl) return;

    const currentPath = window.location.pathname;
    const isKorean = currentPath.startsWith('/ko/');
    const isSpanish = currentPath.startsWith('/es/');
    const langPrefix = isKorean ? '/ko' : (isSpanish ? '/es' : '');
    const currentLang = isKorean ? 'ko' : (isSpanish ? 'es' : 'en');

    const t = {
        en: {
            imageTools: "Image Tools",
            resize:     "Resize",
            crop:       "Crop",
            rotate:     "Rotate & Flip",
            compress:   "Compress",
            heic:       "HEIC to JPG",
            webp:       "WebP Convert",
            bgRemove:   "Background Remover",
            gifTools:   "GIF Tools",
            gifMaker:   "GIF Maker",
            gifSplit:   "GIF Splitter",
            gifOpt:     "GIF Optimizer",
            gifSpeed:   "GIF Speed",
            gifEffects: "GIF Effects",
            videoTools: "Video & PDF",
            videoGif:   "Video to GIF",
            imgPdf:     "Images to PDF",
            pdfTools:   "PDF Tools",
            utils:      "Utilities",
            convert:    "Format Convert",
            barcode:    "QR & Barcode",
            metadata:   "EXIF Remover",
            lang:       "Language",
            about:      "About",
            privacy:    "Privacy",
            terms:      "Terms",
            contact:    "Contact",
        },
        ko: {
            imageTools: "이미지 도구",
            resize:     "크기 조절",
            crop:       "자르기",
            rotate:     "회전/반전",
            compress:   "이미지 압축",
            heic:       "HEIC → JPG",
            webp:       "WebP 변환",
            bgRemove:   "배경 제거 AI",
            gifTools:   "GIF 도구",
            gifMaker:   "GIF 메이커",
            gifSplit:   "GIF 프레임 분할",
            gifOpt:     "GIF 최적화",
            gifSpeed:   "GIF 속도 조절",
            gifEffects: "GIF 효과",
            videoTools: "비디오 & PDF",
            videoGif:   "비디오 → GIF",
            imgPdf:     "이미지 → PDF",
            pdfTools:   "PDF 도구",
            utils:      "유틸리티",
            convert:    "포맷 변환",
            barcode:    "QR & 바코드",
            metadata:   "EXIF 삭제",
            lang:       "언어",
            about:      "소개",
            privacy:    "개인정보",
            terms:      "이용약관",
            contact:    "문의",
        },
        es: {
            imageTools: "Imagen",
            resize:     "Redimensionar",
            crop:       "Recortar",
            rotate:     "Rotar y Voltear",
            compress:   "Comprimir",
            heic:       "HEIC a JPG",
            webp:       "Convertir WebP",
            bgRemove:   "Quitar Fondo IA",
            gifTools:   "GIF",
            gifMaker:   "Crear GIF",
            gifSplit:   "Dividir GIF",
            gifOpt:     "Optimizar GIF",
            gifSpeed:   "Velocidad GIF",
            gifEffects: "Efectos GIF",
            videoTools: "Video & PDF",
            videoGif:   "Video a GIF",
            imgPdf:     "Imágenes a PDF",
            pdfTools:   "Herr. PDF",
            utils:      "Utilidades",
            convert:    "Convertir Formato",
            barcode:    "QR & Barras",
            metadata:   "Quitar EXIF",
            lang:       "Idioma",
            about:      "Nosotros",
            privacy:    "Privacidad",
            terms:      "Términos",
            contact:    "Contacto",
        }
    }[currentLang];

    const html = `
        <div class="modern-sidebar__logo" onclick="location.href='${langPrefix}/'" style="cursor:pointer;">
            <span>⚡ 2convert</span>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.imageTools}</div>
            <a href="${langPrefix}/tools/resize.html"   class="modern-sidebar__item" id="menu-resize">📐 ${t.resize}</a>
            <a href="${langPrefix}/tools/crop.html"     class="modern-sidebar__item" id="menu-crop">✂️ ${t.crop}</a>
            <a href="${langPrefix}/tools/rotate.html"   class="modern-sidebar__item" id="menu-rotate">🔄 ${t.rotate}</a>
            <a href="${langPrefix}/tools/compress.html"              class="modern-sidebar__item" id="menu-compress">🗜️ ${t.compress}</a>
            <a href="${langPrefix}/tools/heic2jpg.html"              class="modern-sidebar__item" id="menu-heic">📱 ${t.heic}</a>
            <a href="${langPrefix}/tools/webp-convert.html"          class="modern-sidebar__item" id="menu-webp">⚡ ${t.webp}</a>
            <a href="${langPrefix}/tools/bg-remove.html"             class="modern-sidebar__item" id="menu-bg-remove">✨ ${t.bgRemove}</a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.gifTools}</div>
            <a href="${langPrefix}/tools/gif-maker.html"    class="modern-sidebar__item" id="menu-gif-maker">🎞️ ${t.gifMaker}</a>
            <a href="${langPrefix}/tools/gif-splitter.html" class="modern-sidebar__item" id="menu-gif-splitter">✂️ ${t.gifSplit}</a>
            <a href="${langPrefix}/tools/gif-optimize.html" class="modern-sidebar__item" id="menu-gif-optimize">📉 ${t.gifOpt}</a>
            <a href="${langPrefix}/tools/gif-speed.html"    class="modern-sidebar__item" id="menu-gif-speed">⏩ ${t.gifSpeed}</a>
            <a href="${langPrefix}/tools/gif-effects.html"  class="modern-sidebar__item" id="menu-gif-effects">🎨 ${t.gifEffects}</a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.videoTools}</div>
            <a href="${langPrefix}/tools/video-gif.html" class="modern-sidebar__item" id="menu-video-gif">🎬 ${t.videoGif}</a>
            <a href="${langPrefix}/tools/img-pdf.html"                class="modern-sidebar__item" id="menu-img-pdf">📑 ${t.imgPdf}</a>
            <a href="${langPrefix}/tools/pdf.html"       class="modern-sidebar__item" id="menu-pdf">📄 ${t.pdfTools}</a>
        </div>

        <div class="modern-sidebar__group">
            <div class="modern-sidebar__group-title">${t.utils}</div>
            <a href="${langPrefix}/tools/jpg-png.html"  class="modern-sidebar__item" id="menu-jpg-png">🔁 ${t.convert}</a>
            <a href="${langPrefix}/tools/barcode.html"  class="modern-sidebar__item" id="menu-barcode">📊 ${t.barcode}</a>
            <a href="${langPrefix}/tools/metadata.html" class="modern-sidebar__item" id="menu-metadata">🛡️ ${t.metadata}</a>
        </div>

        <div class="modern-sidebar__group" style="margin-top:auto; border-top:1px solid var(--slate-100); padding-top:10px;">
            <div class="modern-sidebar__group-title">🌐 ${t.lang}</div>
            <select class="modern-select" onchange="window.changeLanguage ? window.changeLanguage(this.value) : null"
                    style="width:100%; height:28px; font-size:11px; padding:2px 6px;">
                <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                <option value="ko" ${currentLang === 'ko' ? 'selected' : ''}>한국어</option>
                <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español</option>
            </select>
        </div>

        <div style="padding:10px 8px 4px; display:flex; gap:10px; flex-wrap:wrap;">
            <a href="${langPrefix}/pages/privacy.html" style="font-size:10px; color:var(--slate-400); text-decoration:none;">${t.privacy}</a>
            <a href="${langPrefix}/pages/terms.html"   style="font-size:10px; color:var(--slate-400); text-decoration:none;">${t.terms}</a>
            <a href="${langPrefix}/pages/contact.html" style="font-size:10px; color:var(--slate-400); text-decoration:none;">${t.contact}</a>
            <a href="${langPrefix}/pages/about.html"   style="font-size:10px; color:var(--slate-400); text-decoration:none;">${t.about}</a>
        </div>
    `;

    sidebarEl.innerHTML = html;

    // Active highlight
    const items = sidebarEl.querySelectorAll('.modern-sidebar__item');
    const currentFull = currentPath + window.location.search;

    items.forEach(item => {
        const href = item.getAttribute('href');
        const isActive = href.includes('?')
            ? currentFull === href
            : currentPath === href;
        if (isActive) item.classList.add('modern-sidebar__item--active');
    });
});

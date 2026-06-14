/**
 * ==========================================================================
 * 2convert.org — WebP Converter
 * ==========================================================================
 * Single-image converter with side-by-side preview and live stats.
 * Supports: JPG/PNG/WebP/GIF/BMP → WebP, JPG, or PNG.
 * Transparency: WebP/PNG preserve alpha; JPG fills with user-chosen color.
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // DOM refs
    // -------------------------------------------------------------------------
    const dropZone          = document.getElementById('drop-zone');
    const fileInput         = document.getElementById('file-input');
    const btnSelectFile     = document.getElementById('btn-select-file');

    const previewOriginal   = document.getElementById('preview-original');
    const previewConverted  = document.getElementById('preview-converted');
    const placeholderOrig   = document.getElementById('placeholder-original');
    const placeholderConv   = document.getElementById('placeholder-converted');
    const infoOriginal      = document.getElementById('info-original');
    const infoConverted     = document.getElementById('info-converted');

    const statsBar          = document.getElementById('stats-bar');
    const statOrigFmt       = document.getElementById('stat-original-fmt');
    const statOrigSize      = document.getElementById('stat-original-size');
    const statOutSize       = document.getElementById('stat-output-size');
    const statSavings       = document.getElementById('stat-savings');

    const imageInfoBlock    = document.getElementById('image-info-block');
    const qualitySlider     = document.getElementById('quality-slider');
    const qualityVal        = document.getElementById('quality-val');
    const bgColorCard       = document.getElementById('bg-color-card');
    const bgColor           = document.getElementById('bg-color');

    const btnToWebp         = document.getElementById('btn-to-webp');
    const btnToJpg          = document.getElementById('btn-to-jpg');
    const btnToPng          = document.getElementById('btn-to-png');
    const btnDownload       = document.getElementById('btn-download');
    const statusMsg         = document.getElementById('status-msg');

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    let currentImage = null;   // HTMLImageElement
    let currentMeta  = null;   // { name, size, type, width, height }
    let lastBlob     = null;   // most recent converted Blob
    let lastFilename = '';     // download filename for lastBlob
    let lastBlobUrl  = null;   // object URL for converted preview

    // -------------------------------------------------------------------------
    // Quality slider
    // -------------------------------------------------------------------------
    qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value;
    });

    // -------------------------------------------------------------------------
    // File select button
    // -------------------------------------------------------------------------
    btnSelectFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadFile(e.target.files[0]);
            fileInput.value = '';
        }
    });

    // -------------------------------------------------------------------------
    // Drag & Drop
    // -------------------------------------------------------------------------
    const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, preventDefaults));

    ['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, () => {
        dropZone.style.borderColor = 'var(--blue-600)';
        dropZone.style.backgroundColor = '#EFF6FF';
    }));
    ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, () => {
        dropZone.style.borderColor = 'var(--blue-500)';
        dropZone.style.backgroundColor = 'var(--slate-50)';
    }));

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) loadFile(files[0]);
    });

    // -------------------------------------------------------------------------
    // Load image
    // -------------------------------------------------------------------------
    function loadFile(file) {
        if (!file.type.startsWith('image/')) {
            setStatus('Please select a valid image file.', true);
            return;
        }

        const objUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(objUrl);
            currentImage = img;
            currentMeta = {
                name:   file.name,
                size:   file.size,
                type:   file.type,
                width:  img.naturalWidth,
                height: img.naturalHeight,
            };

            // Reset converted side
            resetConvertedSide();

            // Show original preview
            const thumbUrl = URL.createObjectURL(file);
            previewOriginal.src = thumbUrl;
            previewOriginal.onload = () => URL.revokeObjectURL(thumbUrl);
            previewOriginal.style.display = 'block';
            placeholderOrig.style.display = 'none';
            infoOriginal.textContent = `${img.naturalWidth} × ${img.naturalHeight} px · ${formatBytes(file.size)}`;

            // Update info block
            const fmtLabel = mimeToLabel(file.type);
            imageInfoBlock.innerHTML = `
                <div><b>Filename:</b> ${escHtml(file.name)}</div>
                <div><b>Format:</b> ${fmtLabel}</div>
                <div><b>Dimensions:</b> ${img.naturalWidth} × ${img.naturalHeight} px</div>
                <div><b>File size:</b> ${formatBytes(file.size)}</div>
            `;

            // Enable buttons
            btnToWebp.removeAttribute('disabled');
            btnToJpg.removeAttribute('disabled');
            btnToPng.removeAttribute('disabled');
            setStatus('Image loaded. Choose a conversion below.');

            // Show bg-color card hint (always potentially needed for JPG)
            bgColorCard.style.display = 'block';
        };

        img.onerror = () => {
            URL.revokeObjectURL(objUrl);
            setStatus('Failed to load image. Please try another file.', true);
        };

        img.src = objUrl;
    }

    // -------------------------------------------------------------------------
    // Reset converted preview side
    // -------------------------------------------------------------------------
    function resetConvertedSide() {
        previewConverted.style.display = 'none';
        previewConverted.src = '';
        placeholderConv.style.display = 'flex';
        infoConverted.textContent = '';
        statsBar.style.display = 'none';
        btnDownload.style.display = 'none';
        lastBlob = null;
        lastFilename = '';
        if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null; }
    }

    // -------------------------------------------------------------------------
    // Convert buttons
    // -------------------------------------------------------------------------
    btnToWebp.addEventListener('click', () => doConvert('image/webp', 'webp'));
    btnToJpg.addEventListener('click',  () => doConvert('image/jpeg', 'jpg'));
    btnToPng.addEventListener('click',  () => doConvert('image/png',  'png'));

    function doConvert(mimeType, ext) {
        if (!currentImage || !currentMeta) return;

        setStatus('Converting…');
        disableButtons();

        // Use rAF to allow UI to repaint before heavy canvas work
        requestAnimationFrame(() => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width  = currentImage.naturalWidth;
                canvas.height = currentImage.naturalHeight;
                const ctx = canvas.getContext('2d');

                // JPG has no alpha — fill background
                if (mimeType === 'image/jpeg') {
                    ctx.fillStyle = bgColor.value;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(currentImage, 0, 0);

                const quality = parseInt(qualitySlider.value, 10) / 100;

                canvas.toBlob((blob) => {
                    if (!blob) {
                        setStatus('Conversion failed. Your browser may not support this format.', true);
                        enableButtons();
                        return;
                    }

                    // Store for download
                    lastBlob = blob;
                    const baseName = currentMeta.name.replace(/\.[^.]+$/, '');
                    lastFilename = `${baseName}_converted.${ext}`;

                    // Show converted preview
                    if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
                    lastBlobUrl = URL.createObjectURL(blob);
                    previewConverted.src = lastBlobUrl;
                    previewConverted.style.display = 'block';
                    placeholderConv.style.display = 'none';
                    infoConverted.textContent = `${mimeToLabel(mimeType)} · ${formatBytes(blob.size)}`;

                    // Stats
                    updateStats(mimeType, blob.size);

                    // Show download button
                    btnDownload.style.display = '';
                    btnDownload.removeAttribute('disabled');

                    setStatus(`\u2705 Converted to ${mimeToLabel(mimeType)}. Click Download to save.`);
                    enableButtons();
                }, mimeType, quality);
            } catch (err) {
                console.error('WebP convert error:', err);
                setStatus('An error occurred during conversion.', true);
                enableButtons();
            }
        });
    }

    // -------------------------------------------------------------------------
    // Download button
    // -------------------------------------------------------------------------
    btnDownload.addEventListener('click', () => {
        if (!lastBlob || !lastFilename) return;
        FileUtils.downloadBlob(lastBlob, lastFilename);
    });

    // -------------------------------------------------------------------------
    // Stats bar
    // -------------------------------------------------------------------------
    function updateStats(outMime, outSize) {
        if (!currentMeta) return;

        const origSize = currentMeta.size;
        const diff = origSize - outSize;
        const pct  = origSize > 0 ? (diff / origSize * 100) : 0;

        statOrigFmt.textContent  = mimeToLabel(currentMeta.type);
        statOrigSize.textContent = formatBytes(origSize);
        statOutSize.textContent  = formatBytes(outSize);

        if (diff > 0) {
            statSavings.className = 'stats-bar__savings';
            statSavings.textContent = `\u2212${pct.toFixed(1)}% saved`;
        } else if (diff < 0) {
            statSavings.className = 'stats-bar__bigger';
            statSavings.textContent = `+${Math.abs(pct).toFixed(1)}% larger`;
        } else {
            statSavings.className = '';
            statSavings.textContent = 'Same size';
        }

        statsBar.style.display = 'flex';
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function setStatus(msg, isError) {
        statusMsg.textContent = msg;
        statusMsg.style.color = isError ? '#dc2626' : 'var(--slate-600)';
    }

    function disableButtons() {
        btnToWebp.setAttribute('disabled', true);
        btnToJpg.setAttribute('disabled', true);
        btnToPng.setAttribute('disabled', true);
    }

    function enableButtons() {
        if (!currentImage) return;
        btnToWebp.removeAttribute('disabled');
        btnToJpg.removeAttribute('disabled');
        btnToPng.removeAttribute('disabled');
    }

    function mimeToLabel(mime) {
        const map = {
            'image/webp': 'WebP',
            'image/jpeg': 'JPG',
            'image/png':  'PNG',
            'image/gif':  'GIF',
            'image/bmp':  'BMP',
        };
        return map[mime] || mime.split('/')[1].toUpperCase();
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function escHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

})();

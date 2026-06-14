/**
 * ==========================================================================
 * 2Convert - HEIC to JPG Converter
 * ==========================================================================
 * Converts HEIC/HEIF files using the heic2any library (CDN).
 * Falls back to canvas-based conversion for regular image formats.
 *
 * Strategy:
 *   - HEIC/HEIF detected by file extension (.heic, .heif)
 *     → read as ArrayBuffer → heic2any() → Blob (image/jpeg) → ObjectURL → <img>
 *   - Non-HEIC files
 *     → ObjectURL → <img> → canvas → toBlob(image/jpeg)
 * ==========================================================================
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // DOM refs
    // -------------------------------------------------------------------------
    const dropZone         = document.getElementById('drop-zone');
    const fileInput        = document.getElementById('file-input');
    const btnSelectFile    = document.getElementById('btn-select-file');
    const previewContainer = document.getElementById('preview-container');
    const previewImg       = document.getElementById('preview-img');
    const sizeCompareRow   = document.getElementById('size-compare-row');
    const badgeBefore      = document.getElementById('badge-before');
    const badgeAfter       = document.getElementById('badge-after');
    const badgeSavings     = document.getElementById('badge-savings');
    const statusText       = document.getElementById('status-text');
    const statusInfo       = document.getElementById('status-info');
    const qualitySlider    = document.getElementById('quality-slider');
    const qualityVal       = document.getElementById('quality-val');
    const fileInfoCard     = document.getElementById('file-info-card');
    const infoName         = document.getElementById('info-name');
    const infoSize         = document.getElementById('info-size');
    const infoDims         = document.getElementById('info-dims');
    const infoType         = document.getElementById('info-type');
    const btnConvert       = document.getElementById('btn-convert');
    const btnDownload      = document.getElementById('btn-download');

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    let currentFile    = null;   // the original File object
    let convertedBlob  = null;   // the converted JPG Blob (set after conversion)
    let previewObjUrl  = null;   // ObjectURL for preview <img>
    let isHeic         = false;  // whether the current file is HEIC/HEIF

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function formatBytes(bytes) {
        if (bytes < 1024)       return bytes + ' B';
        if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    }

    function isHeicFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        return ext === 'heic' || ext === 'heif';
    }

    function setStatus(main, sub) {
        statusText.textContent = main || '';
        statusInfo.textContent = sub  || '';
    }

    function revokePreview() {
        if (previewObjUrl) {
            URL.revokeObjectURL(previewObjUrl);
            previewObjUrl = null;
        }
    }

    function resetDownload() {
        convertedBlob = null;
        btnDownload.style.display = 'none';
        sizeCompareRow.style.display = 'none';
    }

    // -------------------------------------------------------------------------
    // Drag & Drop
    // -------------------------------------------------------------------------
    const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev =>
        dropZone.addEventListener(ev, preventDefaults)
    );

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
        if (files && files.length > 0) handleFile(files[0]);
    });

    // -------------------------------------------------------------------------
    // File input
    // -------------------------------------------------------------------------
    btnSelectFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            fileInput.value = ''; // allow re-selecting same file
        }
    });

    // -------------------------------------------------------------------------
    // Quality slider
    // -------------------------------------------------------------------------
    qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value;
        // Reset converted blob when quality changes (need to re-convert)
        if (convertedBlob) resetDownload();
    });

    // -------------------------------------------------------------------------
    // Handle incoming file
    // -------------------------------------------------------------------------
    function handleFile(file) {
        currentFile   = file;
        convertedBlob = null;
        isHeic        = isHeicFile(file);

        revokePreview();
        resetDownload();
        btnConvert.removeAttribute('disabled');
        btnConvert.textContent = '\u{1F504} Convert to JPG';

        // Update file info card
        infoName.textContent  = file.name;
        infoName.title        = file.name;
        infoSize.textContent  = formatBytes(file.size);
        infoDims.textContent  = '\u2014';
        infoType.textContent  = isHeic ? 'HEIC / HEIF' : (file.type || 'image');
        fileInfoCard.style.display = 'block';

        setStatus('\u23F3 Loading preview\u2026', '');

        if (isHeic) {
            loadHeicPreview(file);
        } else {
            loadRegularPreview(file);
        }
    }

    // -------------------------------------------------------------------------
    // Preview: HEIC → heic2any → ObjectURL → <img>
    // -------------------------------------------------------------------------
    function loadHeicPreview(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const blob = new Blob([arrayBuffer], { type: 'image/heic' });

                setStatus('\u23F3 Decoding HEIC for preview\u2026', '');

                const jpegBlob = await heic2any({
                    blob,
                    toType: 'image/jpeg',
                    quality: 0.7  // lower quality just for preview speed
                });

                previewObjUrl = URL.createObjectURL(jpegBlob);
                showPreview(previewObjUrl);
                setStatus('\u2705 HEIC file loaded', formatBytes(file.size));
            } catch (err) {
                console.error('HEIC preview error:', err);
                setStatus('\u26A0\uFE0F Could not decode preview', 'File may not be a valid HEIC');
                // Still allow conversion attempt
            }
        };
        reader.onerror = () => {
            setStatus('\u274C Failed to read file', '');
        };
        reader.readAsArrayBuffer(file);
    }

    // -------------------------------------------------------------------------
    // Preview: Regular image → ObjectURL → <img>
    // -------------------------------------------------------------------------
    function loadRegularPreview(file) {
        previewObjUrl = URL.createObjectURL(file);
        showPreview(previewObjUrl);
        setStatus('\u2705 Image loaded', formatBytes(file.size));
    }

    function showPreview(url) {
        previewImg.onload = () => {
            infoDims.textContent = previewImg.naturalWidth + ' \u00D7 ' + previewImg.naturalHeight + ' px';
        };
        previewImg.src = url;
        previewContainer.style.display = 'block';
    }

    // -------------------------------------------------------------------------
    // Convert button
    // -------------------------------------------------------------------------
    btnConvert.addEventListener('click', async () => {
        if (!currentFile) return;

        const quality = parseInt(qualitySlider.value, 10) / 100;

        btnConvert.setAttribute('disabled', true);
        btnConvert.textContent = '\u23F3 Converting\u2026';
        setStatus('\u23F3 Converting to JPG\u2026', '');
        resetDownload();

        try {
            if (isHeic) {
                convertedBlob = await convertHeic(currentFile, quality);
            } else {
                convertedBlob = await convertRegular(currentFile, quality);
            }

            // Show size comparison
            const beforeSize = currentFile.size;
            const afterSize  = convertedBlob.size;
            const delta      = beforeSize - afterSize;
            const pct        = beforeSize > 0 ? Math.abs(Math.round((delta / beforeSize) * 100)) : 0;

            badgeBefore.textContent = 'Before: ' + formatBytes(beforeSize);
            badgeAfter.textContent  = 'After: '  + formatBytes(afterSize);

            if (delta > 0) {
                badgeSavings.textContent = '\u2193 ' + pct + '% smaller';
                badgeSavings.style.color = '#16a34a';
            } else if (delta < 0) {
                badgeSavings.textContent = '\u2191 ' + pct + '% larger';
                badgeSavings.style.color = 'var(--slate-500)';
            } else {
                badgeSavings.textContent = 'Same size';
                badgeSavings.style.color = 'var(--slate-400)';
            }

            sizeCompareRow.style.display = 'flex';
            btnDownload.style.display = 'block';

            setStatus('\u2705 Conversion complete!', formatBytes(afterSize) + ' JPG ready');
            btnConvert.textContent = '\u{1F504} Re-Convert';
        } catch (err) {
            console.error('Conversion failed:', err);
            setStatus('\u274C Conversion failed', err.message || 'Unknown error');
            btnConvert.textContent = '\u{1F504} Convert to JPG';
        }

        btnConvert.removeAttribute('disabled');
    });

    // -------------------------------------------------------------------------
    // Convert HEIC → JPG Blob via heic2any
    // -------------------------------------------------------------------------
    async function convertHeic(file, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const inputBlob = new Blob([arrayBuffer], { type: 'image/heic' });

                    const result = await heic2any({
                        blob: inputBlob,
                        toType: 'image/jpeg',
                        quality: quality
                    });

                    // heic2any may return an array if the HEIC is a burst
                    const outputBlob = Array.isArray(result) ? result[0] : result;
                    resolve(outputBlob);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // -------------------------------------------------------------------------
    // Convert regular image → JPG Blob via Canvas
    // -------------------------------------------------------------------------
    function convertRegular(file, quality) {
        return new Promise((resolve, reject) => {
            const img    = new Image();
            const objUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objUrl);

                const canvas = document.createElement('canvas');
                canvas.width  = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');

                // JPG doesn't support transparency → fill white
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) { reject(new Error('Canvas toBlob returned null')); return; }
                    resolve(blob);
                }, 'image/jpeg', quality);
            };

            img.onerror = () => {
                URL.revokeObjectURL(objUrl);
                reject(new Error('Failed to load image: ' + file.name));
            };

            img.src = objUrl;
        });
    }

    // -------------------------------------------------------------------------
    // Download button
    // -------------------------------------------------------------------------
    btnDownload.addEventListener('click', () => {
        if (!convertedBlob || !currentFile) return;

        const baseName    = currentFile.name.replace(/\.[^.]+$/, '');
        const downloadName = baseName + '.jpg';

        // Use FileUtils if available, else manual anchor
        if (typeof FileUtils !== 'undefined' && FileUtils.downloadBlob) {
            FileUtils.downloadBlob(convertedBlob, downloadName);
        } else {
            const url = URL.createObjectURL(convertedBlob);
            const a   = document.createElement('a');
            a.href    = url;
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        }

        setStatus('\u2705 Downloaded: ' + downloadName, formatBytes(convertedBlob.size));
    });

})();

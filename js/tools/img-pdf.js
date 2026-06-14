/**
 * img-pdf.js — Image to PDF Converter tool logic
 * Converts multiple images (JPG/PNG/WebP/GIF) into a single PDF via jsPDF.
 * All processing is done client-side. No server uploads.
 */

(function () {
    'use strict';

    // ─── Constants ────────────────────────────────────────────────────────────
    const MAX_IMAGES = 20;

    // jsPDF page dimensions in mm [width, height] (portrait reference)
    const PAGE_DIMS = {
        a4:     [210, 297],
        letter: [215.9, 279.4]
    };

    // ─── State ────────────────────────────────────────────────────────────────
    /**
     * Each entry: { file: File, dataURL: string, width: number, height: number }
     */
    let imageEntries = [];
    let dragSrcIndex = null;

    // ─── DOM refs ─────────────────────────────────────────────────────────────
    const dropZone        = document.getElementById('drop-zone');
    const fileInput       = document.getElementById('file-input');
    const btnSelectImages = document.getElementById('btn-select-images');
    const btnAddMore      = document.getElementById('btn-add-more');
    const imagesCard      = document.getElementById('images-card');
    const thumbGrid       = document.getElementById('thumb-grid');
    const pageCountText   = document.getElementById('page-count-text');
    const statusBar       = document.getElementById('status-bar');

    const selPageSize    = document.getElementById('sel-page-size');
    const selOrientation = document.getElementById('sel-orientation');
    const selQuality     = document.getElementById('sel-quality');
    const inpFilename    = document.getElementById('inp-filename');
    const btnGenerate    = document.getElementById('btn-generate');
    const progressWrap   = document.getElementById('progress-wrap');
    const progressBar    = document.getElementById('progress-bar');
    const progressText   = document.getElementById('progress-text');
    const orientationGroup = document.getElementById('orientation-group');

    // ─── Utility helpers ──────────────────────────────────────────────────────

    function showStatus(msg, type) {
        // type: 'info' | 'error' | 'ok'
        statusBar.textContent = msg;
        statusBar.className = type;
        statusBar.style.display = 'block';
    }

    function hideStatus() {
        statusBar.style.display = 'none';
    }

    function setProgress(pct, label) {
        progressWrap.style.display = 'block';
        progressBar.style.width = pct + '%';
        progressText.textContent = label || '';
    }

    function hideProgress() {
        progressWrap.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = '';
    }

    function updatePageCount() {
        const n = imageEntries.length;
        pageCountText.textContent = n === 1 ? '1 page' : n + ' pages';
    }

    function updateGenerateBtn() {
        btnGenerate.disabled = imageEntries.length === 0;
    }

    function updateOrientationVisibility() {
        const isOriginal = selPageSize.value === 'original';
        orientationGroup.style.opacity = isOriginal ? '0.4' : '1';
        selOrientation.disabled = isOriginal;
    }

    // ─── File reading ──────────────────────────────────────────────────────────

    /**
     * Read a File as a data URL and resolve image dimensions.
     * Returns Promise<{file, dataURL, width, height}>
     */
    function readImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const dataURL = e.target.result;
                const img = new Image();
                img.onload = function () {
                    resolve({ file, dataURL, width: img.naturalWidth, height: img.naturalHeight });
                };
                img.onerror = function () {
                    reject(new Error('Cannot decode image: ' + file.name));
                };
                img.src = dataURL;
            };
            reader.onerror = function () {
                reject(new Error('Cannot read file: ' + file.name));
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Process a FileList — filter, limit, read, add to state.
     */
    async function processFiles(fileList) {
        const files = Array.from(fileList);

        // Filter images only
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            showStatus('No image files found. Please select JPG, PNG, WebP, or GIF files.', 'error');
            return;
        }

        const remaining = MAX_IMAGES - imageEntries.length;
        if (remaining <= 0) {
            showStatus('Maximum of ' + MAX_IMAGES + ' images already added.', 'error');
            return;
        }

        const toAdd = imageFiles.slice(0, remaining);
        const skipped = imageFiles.length - toAdd.length;

        hideStatus();
        showStatus('Loading ' + toAdd.length + ' image(s)…', 'info');

        const results = [];
        for (const file of toAdd) {
            try {
                const entry = await readImageFile(file);
                results.push(entry);
            } catch (err) {
                console.warn(err.message);
            }
        }

        if (results.length === 0) {
            showStatus('Failed to load images. Files may be corrupted.', 'error');
            return;
        }

        imageEntries = imageEntries.concat(results);
        renderThumbs();
        updatePageCount();
        updateGenerateBtn();
        imagesCard.style.display = 'block';

        let msg = results.length + ' image(s) added.';
        if (skipped > 0) msg += ' ' + skipped + ' skipped (limit: ' + MAX_IMAGES + ').';
        showStatus(msg, 'ok');
    }

    // ─── Thumbnail rendering ───────────────────────────────────────────────────

    function renderThumbs() {
        thumbGrid.innerHTML = '';
        imageEntries.forEach((entry, i) => {
            const item = document.createElement('div');
            item.className = 'img-thumb-item';
            item.draggable = true;
            item.dataset.index = i;

            // Page index badge
            const badge = document.createElement('div');
            badge.className = 'img-thumb-item__index';
            badge.textContent = i + 1;

            // Thumbnail image
            const img = document.createElement('img');
            img.src = entry.dataURL;
            img.alt = entry.file.name;

            // Filename label
            const name = document.createElement('div');
            name.className = 'img-thumb-item__name';
            name.textContent = entry.file.name;
            name.title = entry.file.name;

            // Remove button
            const removeBtn = document.createElement('div');
            removeBtn.className = 'img-thumb-item__remove';
            removeBtn.textContent = '✕';
            removeBtn.title = 'Remove this image';
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeEntry(i);
            });

            item.appendChild(badge);
            item.appendChild(img);
            item.appendChild(name);
            item.appendChild(removeBtn);

            // Drag events for reorder
            item.addEventListener('dragstart', onDragStart);
            item.addEventListener('dragover',  onDragOver);
            item.addEventListener('dragenter', onDragEnter);
            item.addEventListener('dragleave', onDragLeave);
            item.addEventListener('drop',      onDrop);
            item.addEventListener('dragend',   onDragEnd);

            thumbGrid.appendChild(item);
        });
    }

    function removeEntry(index) {
        imageEntries.splice(index, 1);
        renderThumbs();
        updatePageCount();
        updateGenerateBtn();

        if (imageEntries.length === 0) {
            imagesCard.style.display = 'none';
            hideStatus();
        } else {
            showStatus(imageEntries.length + ' image(s) remaining.', 'info');
        }
    }

    // ─── Drag-to-reorder ──────────────────────────────────────────────────────

    function getItemIndex(el) {
        return parseInt(el.dataset.index, 10);
    }

    function onDragStart(e) {
        dragSrcIndex = getItemIndex(e.currentTarget);
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrcIndex);
    }

    function onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function onDragEnter(e) {
        e.preventDefault();
        const target = e.currentTarget;
        if (getItemIndex(target) !== dragSrcIndex) {
            target.classList.add('drag-over');
        }
    }

    function onDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function onDrop(e) {
        e.preventDefault();
        const targetIndex = getItemIndex(e.currentTarget);
        e.currentTarget.classList.remove('drag-over');

        if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;

        // Reorder imageEntries
        const moved = imageEntries.splice(dragSrcIndex, 1)[0];
        imageEntries.splice(targetIndex, 0, moved);

        dragSrcIndex = null;
        renderThumbs();
        updatePageCount();
    }

    function onDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        // Clean up any stray drag-over classes
        document.querySelectorAll('.img-thumb-item.drag-over').forEach(el => el.classList.remove('drag-over'));
        dragSrcIndex = null;
    }

    // ─── Drop zone events ──────────────────────────────────────────────────────

    dropZone.addEventListener('click', function (e) {
        if (e.target === btnSelectImages || btnSelectImages.contains(e.target)) return;
        fileInput.click();
    });

    btnSelectImages.addEventListener('click', function (e) {
        e.stopPropagation();
        fileInput.value = '';
        fileInput.click();
    });

    btnAddMore.addEventListener('click', function () {
        fileInput.value = '';
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files.length > 0) {
            processFiles(fileInput.files);
        }
    });

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropZone.classList.add('drag-active');
    });

    dropZone.addEventListener('dragleave', function (e) {
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-active');
        }
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    });

    // ─── Settings change handlers ──────────────────────────────────────────────

    selPageSize.addEventListener('change', updateOrientationVisibility);

    // ─── PDF generation ────────────────────────────────────────────────────────

    btnGenerate.addEventListener('click', async function () {
        if (imageEntries.length === 0) return;

        if (!window.jspdf || !window.jspdf.jsPDF) {
            showStatus('jsPDF library not loaded. Check your internet connection and reload.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;

        const pageSizeVal  = selPageSize.value;     // 'a4' | 'letter' | 'original'
        const orientMode   = selOrientation.value;   // 'auto' | 'portrait' | 'landscape'
        const quality      = parseFloat(selQuality.value);
        const filename     = (inpFilename.value.trim() || 'converted') + '.pdf';

        btnGenerate.disabled = true;
        setProgress(0, 'Preparing…');
        hideStatus();

        try {
            let doc = null;

            for (let i = 0; i < imageEntries.length; i++) {
                const entry = imageEntries[i];
                const imgW = entry.width;
                const imgH = entry.height;

                // Determine orientation for this image
                let orientation;
                if (pageSizeVal === 'original') {
                    orientation = imgW >= imgH ? 'landscape' : 'portrait';
                } else {
                    if (orientMode === 'auto') {
                        orientation = imgW >= imgH ? 'landscape' : 'portrait';
                    } else {
                        orientation = orientMode;
                    }
                }

                // Determine page size in mm [pageW, pageH]
                let pageW, pageH;
                if (pageSizeVal === 'original') {
                    // Convert pixels to mm at 96 dpi: px * 25.4 / 96
                    pageW = imgW * 25.4 / 96;
                    pageH = imgH * 25.4 / 96;
                } else {
                    const dims = PAGE_DIMS[pageSizeVal]; // [w, h] portrait reference
                    if (orientation === 'portrait') {
                        pageW = dims[0];
                        pageH = dims[1];
                    } else {
                        pageW = dims[1];
                        pageH = dims[0];
                    }
                }

                // Create or add page
                if (doc === null) {
                    doc = new jsPDF({
                        orientation: pageSizeVal === 'original' ? 'portrait' : orientation,
                        unit: 'mm',
                        format: pageSizeVal === 'original' ? [pageW, pageH] : pageSizeVal
                    });
                } else {
                    if (pageSizeVal === 'original') {
                        doc.addPage([pageW, pageH], 'portrait');
                    } else {
                        doc.addPage(pageSizeVal, orientation);
                    }
                }

                // Calculate image placement (fit inside page with margin 0)
                let drawX, drawY, drawW, drawH;
                if (pageSizeVal === 'original') {
                    drawX = 0;
                    drawY = 0;
                    drawW = pageW;
                    drawH = pageH;
                } else {
                    // Fit image proportionally inside page
                    const scaleX = pageW / imgW;
                    const scaleY = pageH / imgH;
                    const scale  = Math.min(scaleX, scaleY);
                    drawW = imgW * scale;
                    drawH = imgH * scale;
                    drawX = (pageW - drawW) / 2;
                    drawY = (pageH - drawH) / 2;
                }

                // Render image to canvas to get JPEG data at target quality
                const canvas = document.createElement('canvas');
                canvas.width  = imgW;
                canvas.height = imgH;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, imgW, imgH);

                // Draw source image onto canvas
                const sourceImg = new Image();
                await new Promise((resolve) => {
                    sourceImg.onload = resolve;
                    sourceImg.src = entry.dataURL;
                });
                ctx.drawImage(sourceImg, 0, 0);

                const jpegDataURL = canvas.toDataURL('image/jpeg', quality);
                // Strip the data URI prefix to get raw base64
                const base64Data = jpegDataURL.split(',')[1];

                doc.addImage(base64Data, 'JPEG', drawX, drawY, drawW, drawH);

                const pct = Math.round(((i + 1) / imageEntries.length) * 90);
                setProgress(pct, 'Processing image ' + (i + 1) + ' of ' + imageEntries.length + '…');

                // Yield to browser to keep UI responsive
                await new Promise(r => setTimeout(r, 0));
            }

            setProgress(95, 'Building PDF…');
            await new Promise(r => setTimeout(r, 20));

            doc.save(filename);

            setProgress(100, 'Done!');
            showStatus('PDF created successfully — ' + imageEntries.length + ' page(s).', 'ok');

            setTimeout(hideProgress, 1500);

        } catch (err) {
            console.error(err);
            showStatus('Error generating PDF: ' + err.message, 'error');
            hideProgress();
        } finally {
            btnGenerate.disabled = imageEntries.length === 0;
        }
    });

    // ─── Init ──────────────────────────────────────────────────────────────────

    updateOrientationVisibility();
    updateGenerateBtn();

})();

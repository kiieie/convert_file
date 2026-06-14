/**
 * ==========================================================================
 * 2convert.org - Image Compressor Business Logic
 * ==========================================================================
 * Uses Canvas API to compress images via toBlob quality parameter.
 * Shows actual before/after file sizes and savings percentage.
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // DOM handles
    // -------------------------------------------------------------------------
    const dropZone           = document.getElementById('drop-zone');
    const fileInput          = document.getElementById('file-input');
    const previewContainer   = document.getElementById('preview-container');
    const previewCanvas      = document.getElementById('preview-canvas');

    const qualitySlider      = document.getElementById('quality-slider');
    const qualityLabel       = document.getElementById('quality-label');
    const outputFormat       = document.getElementById('output-format');
    const pngQualityNote     = document.getElementById('png-quality-note');

    const btnDownload        = document.getElementById('btn-download');
    const downloadInfo       = document.getElementById('download-info');
    const downloadInfoText   = document.getElementById('download-info-text');

    const fileInfoCard       = document.getElementById('file-info-card');
    const infoName           = document.getElementById('info-name');
    const infoDims           = document.getElementById('info-dims');
    const infoSize           = document.getElementById('info-size');
    const infoType           = document.getElementById('info-type');

    const compressStats      = document.getElementById('compress-stats');
    const statOrigSize       = document.getElementById('stat-orig-size');
    const statOrigDim        = document.getElementById('stat-orig-dim');
    const statCompSize       = document.getElementById('stat-comp-size');
    const statCompFormat     = document.getElementById('stat-comp-format');
    const statSavingsPct     = document.getElementById('stat-savings-pct');
    const statSavingsBadge   = document.getElementById('stat-savings-badge');

    const processingIndicator = document.getElementById('processing-indicator');

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    let originalImage  = null;  // HTMLImageElement
    let fileMeta       = null;  // { name, size, type, width, height }
    let compressedBlob = null;  // last computed Blob (for download)
    let debounceTimer  = null;

    const DEBOUNCE_MS = 300;

    // -------------------------------------------------------------------------
    // ImageLoader binding
    // -------------------------------------------------------------------------
    ImageLoader.bind(
        dropZone,
        fileInput,
        function (img, meta) {
            originalImage = img;
            fileMeta      = meta;

            // Show / hide UI regions
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';
            fileInfoCard.style.display = 'block';

            // Populate file info card
            infoName.textContent = meta.name;
            infoDims.textContent = meta.width + ' × ' + meta.height + ' px';
            infoSize.textContent = FileUtils.formatBytes(meta.size);
            infoType.textContent = meta.type || 'unknown';

            // Enable controls
            qualitySlider.removeAttribute('disabled');
            outputFormat.removeAttribute('disabled');
            btnDownload.removeAttribute('disabled');

            // Initial draw on preview canvas
            drawPreview(img);

            // Trigger first compression pass
            scheduleCompress();
        },
        function (errorMsg) {
            UIComponents.showErrorDialog('File Load Error', errorMsg);
        }
    );

    // -------------------------------------------------------------------------
    // Quality slider — live label + debounced compress
    // -------------------------------------------------------------------------
    qualitySlider.addEventListener('input', function () {
        qualityLabel.textContent = this.value + '%';
        scheduleCompress();
    });

    // -------------------------------------------------------------------------
    // Output format change — update PNG note + debounced compress
    // -------------------------------------------------------------------------
    outputFormat.addEventListener('change', function () {
        const effectiveMime = getEffectiveMime();
        pngQualityNote.style.display = (effectiveMime === 'image/png') ? 'block' : 'none';
        scheduleCompress();
    });

    // -------------------------------------------------------------------------
    // Download button
    // -------------------------------------------------------------------------
    btnDownload.addEventListener('click', function () {
        if (!compressedBlob || !fileMeta) return;

        const ext      = mimeToExt(getEffectiveMime());
        const quality  = parseInt(qualitySlider.value);
        const dlName   = FileUtils.getDownloadName(fileMeta.name, '_compressed_q' + quality, ext);

        FileUtils.downloadBlob(compressedBlob, dlName);

        // Show confirmation
        downloadInfo.style.display = 'block';
        downloadInfoText.textContent = 'Saved as ' + dlName;
    });

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Draw the original image onto the preview canvas.
     * @param {HTMLImageElement} img
     */
    function drawPreview(img) {
        previewCanvas.width  = img.naturalWidth;
        previewCanvas.height = img.naturalHeight;
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.drawImage(img, 0, 0);
    }

    /**
     * Return the resolved MIME type to use for compression.
     * @returns {string}
     */
    function getEffectiveMime() {
        const val = outputFormat.value;
        if (val === 'match') {
            // Fall back to jpeg for formats canvas doesn't handle well
            const t = fileMeta ? fileMeta.type : 'image/jpeg';
            return (t === 'image/jpeg' || t === 'image/png' || t === 'image/webp') ? t : 'image/jpeg';
        }
        return val;
    }

    /**
     * Map MIME type to file extension string.
     * @param {string} mime
     * @returns {string}
     */
    function mimeToExt(mime) {
        if (mime === 'image/jpeg') return 'jpg';
        if (mime === 'image/webp') return 'webp';
        return 'png';
    }

    /**
     * Schedule a debounced compression run.
     */
    function scheduleCompress() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runCompress, DEBOUNCE_MS);
    }

    /**
     * Run the actual canvas → toBlob compression and update all stats.
     */
    function runCompress() {
        if (!originalImage || !fileMeta) return;

        const mime    = getEffectiveMime();
        const quality = parseInt(qualitySlider.value) / 100;

        // Show processing indicator
        processingIndicator.classList.add('visible');
        compressStats.classList.remove('visible');

        // Build a temporary offscreen canvas at original resolution
        const offCanvas = document.createElement('canvas');
        offCanvas.width  = originalImage.naturalWidth;
        offCanvas.height = originalImage.naturalHeight;
        const ctx = offCanvas.getContext('2d');

        // For JPEG output, fill with white background (no alpha)
        if (mime === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);
        }

        ctx.drawImage(originalImage, 0, 0);

        // Use quality param for jpeg/webp; PNG ignores it (lossless)
        const blobQuality = (mime === 'image/png') ? undefined : quality;

        offCanvas.toBlob(function (blob) {
            processingIndicator.classList.remove('visible');

            if (!blob) {
                UIComponents.showErrorDialog('Compression Error', 'Failed to encode the image. Try a different format.');
                return;
            }

            compressedBlob = blob;

            // Update stats
            updateStats(mime, blob.size);

            // Update the preview canvas with compressed result
            const blobUrl = URL.createObjectURL(blob);
            const previewImg = new Image();
            previewImg.onload = function () {
                drawPreview(previewImg);
                URL.revokeObjectURL(blobUrl);
            };
            previewImg.onerror = function () {
                URL.revokeObjectURL(blobUrl);
            };
            previewImg.src = blobUrl;

        }, mime, blobQuality);
    }

    /**
     * Update the before/after stats panel.
     * @param {string} mime        - effective output MIME type
     * @param {number} compSize    - compressed blob size in bytes
     */
    function updateStats(mime, compSize) {
        const origSize  = fileMeta.size;
        const ext       = mimeToExt(mime).toUpperCase();
        const savedPct  = ((origSize - compSize) / origSize * 100);
        const savedAbs  = origSize - compSize;
        const isSmaller = compSize < origSize;

        // Original column
        statOrigSize.textContent = FileUtils.formatBytes(origSize);
        statOrigDim.textContent  = fileMeta.width + ' × ' + fileMeta.height + ' px';

        // Compressed column
        statCompSize.textContent   = FileUtils.formatBytes(compSize);
        statCompFormat.textContent = ext + ' · quality ' + qualitySlider.value + '%';

        // Savings column
        if (isSmaller) {
            statSavingsPct.textContent = '−' + Math.abs(savedPct).toFixed(1) + '%';
            statSavingsBadge.innerHTML =
                '<span class="compress-savings-badge">Saved ' +
                FileUtils.formatBytes(Math.abs(savedAbs)) + '</span>';
        } else {
            statSavingsPct.textContent = '+' + Math.abs(savedPct).toFixed(1) + '%';
            statSavingsBadge.innerHTML =
                '<span class="compress-savings-badge worse">+' +
                FileUtils.formatBytes(Math.abs(savedAbs)) + ' larger</span>';
        }

        // Show panel
        compressStats.classList.add('visible');

        // Update download info
        if (isSmaller) {
            downloadInfoText.textContent =
                'Saved ' + Math.abs(savedPct).toFixed(0) + '% · ' +
                FileUtils.formatBytes(origSize) + ' → ' + FileUtils.formatBytes(compSize);
            downloadInfo.style.display = 'block';
        }
    }

})();

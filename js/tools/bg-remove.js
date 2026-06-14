/**
 * ==========================================================================
 * ConvertFile - AI Background Remover
 * ==========================================================================
 * Uses @huggingface/transformers (Transformers.js) with RMBG-1.4 model.
 * Runs 100% in browser via WebAssembly — no server upload.
 */

(function () {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const previewOriginal = document.getElementById('preview-original');
    const previewResult = document.getElementById('preview-result');
    const processingOverlay = document.getElementById('processing-overlay');
    const procText = document.getElementById('proc-text');
    const procTime = document.getElementById('proc-time');
    const imgInfo = document.getElementById('img-info');
    const btnRemoveBg = document.getElementById('btn-remove-bg');
    const btnDownload = document.getElementById('btn-download');
    const outputFormat = document.getElementById('output-format');
    const modelStatus = document.getElementById('model-status');
    const modelStatusText = document.getElementById('model-status-text');
    const modelProgressWrap = document.getElementById('model-progress-wrap');
    const modelProgressBar = document.getElementById('model-progress-bar');
    const customBgColor = document.getElementById('custom-bg-color');

    let currentFile = null;
    let originalImg = null;
    let resultMask = null; // ImageData with alpha mask
    let selectedBg = 'transparent';
    let pipeline = null;
    let pipelineLoading = false;

    // ── Background swatch selection ──────────────────────────────────────
    document.querySelectorAll('.bg-color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            document.querySelectorAll('.bg-color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            selectedBg = swatch.dataset.bg;
            if (resultMask) renderResult();
        });
    });

    customBgColor.addEventListener('input', () => {
        document.querySelectorAll('.bg-color-swatch').forEach(s => s.classList.remove('active'));
        selectedBg = customBgColor.value;
        if (resultMask) renderResult();
    });

    outputFormat.addEventListener('change', () => {
        if (resultMask) renderResult();
    });

    // ── File upload handling ─────────────────────────────────────────────
    function handleFile(file) {
        if (!file || !file.type.match(/image\/(jpeg|png|webp)/)) {
            alert('Please select a JPG, PNG, or WebP image.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Max 10MB.');
            return;
        }

        currentFile = file;
        resultMask = null;
        btnDownload.disabled = true;

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            originalImg = img;
            previewOriginal.src = url;
            previewArea.style.display = 'block';
            processingOverlay.style.display = 'flex';
            procText.textContent = 'Ready — click Remove Background';
            imgInfo.textContent = `${file.name} · ${img.naturalWidth}×${img.naturalHeight} · ${FileUtils.formatBytes(file.size)}`;
            btnRemoveBg.disabled = false;
        };
        img.src = url;
    }

    // Drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
        dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); });
    });
    ['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.add('modern-upload-zone--dragover')));
    ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('modern-upload-zone--dragover')));
    dropZone.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) handleFile(f); });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
    document.addEventListener('paste', e => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.kind === 'file' && item.type.match(/image/)) {
                handleFile(item.getAsFile());
                break;
            }
        }
    });

    // ── Load Transformers.js pipeline ────────────────────────────────────
    async function loadPipeline() {
        if (pipeline) return pipeline;
        if (pipelineLoading) return null;
        pipelineLoading = true;

        modelStatus.style.display = 'block';
        modelProgressWrap.style.display = 'block';
        modelStatusText.textContent = 'Loading AI model (first use ~60MB)...';

        try {
            // Wait for Transformers.js module to be ready (loaded via <script type="module">)
            if (!window.__HF) {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Transformers.js load timeout')), 30000);
                    window.addEventListener('transformers-ready', () => {
                        clearTimeout(timeout);
                        resolve();
                    }, { once: true });
                });
            }

            const { pipeline: createPipeline } = window.__HF;

            pipeline = await createPipeline('image-segmentation', 'briaai/RMBG-1.4', {
                progress_callback: (info) => {
                    if (info.status === 'downloading' && info.total) {
                        const pct = Math.round((info.loaded / info.total) * 100);
                        modelProgressBar.style.width = pct + '%';
                        modelStatusText.textContent = `Downloading model: ${pct}%`;
                    }
                }
            });

            modelStatusText.textContent = '✅ AI model ready';
            document.getElementById('model-spinner').style.display = 'none';
            modelProgressWrap.style.display = 'none';
            return pipeline;
        } catch (err) {
            modelStatusText.textContent = '❌ Failed to load AI model: ' + err.message;
            console.error('Transformers.js load error:', err);
            pipelineLoading = false;
            return null;
        }
    }


    // ── Remove background ────────────────────────────────────────────────
    btnRemoveBg.addEventListener('click', async () => {
        if (!originalImg || !currentFile) return;

        btnRemoveBg.disabled = true;
        processingOverlay.style.display = 'flex';
        procText.textContent = 'Loading AI model...';
        const t0 = performance.now();

        try {
            const pl = await loadPipeline();
            if (!pl) {
                procText.textContent = 'Failed to load AI model. Check browser console.';
                btnRemoveBg.disabled = false;
                return;
            }

            procText.textContent = 'Removing background...';

            // Run segmentation
            const fileUrl = URL.createObjectURL(currentFile);
            const output = await pl(fileUrl, { return_mask: true });

            // output is array of segments; first mask is the subject
            const mask = Array.isArray(output) ? output[0] : output;

            // Draw original + apply mask
            const canvas = previewResult;
            canvas.width = originalImg.naturalWidth;
            canvas.height = originalImg.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(originalImg, 0, 0);

            // Get pixel data
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // mask.mask is a RawImage — get pixel values
            const maskData = mask.mask;
            const maskWidth = maskData.width;
            const maskHeight = maskData.height;

            // Scale mask to image size if needed
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = maskWidth;
            tempCanvas.height = maskHeight;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw mask as grayscale (mask data is Uint8ClampedArray with values 0-255)
            const maskImageData = tempCtx.createImageData(maskWidth, maskHeight);
            const maskPixels = maskData.data;
            for (let i = 0; i < maskPixels.length; i++) {
                const v = maskPixels[i];
                maskImageData.data[i * 4] = v;
                maskImageData.data[i * 4 + 1] = v;
                maskImageData.data[i * 4 + 2] = v;
                maskImageData.data[i * 4 + 3] = 255;
            }
            tempCtx.putImageData(maskImageData, 0, 0);

            // Scale mask to original image size
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = canvas.width;
            scaledCanvas.height = canvas.height;
            const scaledCtx = scaledCanvas.getContext('2d');
            scaledCtx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            const scaledMaskData = scaledCtx.getImageData(0, 0, canvas.width, canvas.height);

            // Apply mask as alpha
            for (let i = 0; i < imgData.data.length / 4; i++) {
                imgData.data[i * 4 + 3] = scaledMaskData.data[i * 4]; // use R channel as alpha
            }

            resultMask = imgData;
            renderResult();

            const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
            procTime.textContent = `Processed in ${elapsed}s`;
            processingOverlay.style.display = 'none';
            btnDownload.disabled = false;
            btnRemoveBg.disabled = false;

        } catch (err) {
            console.error('Background removal error:', err);
            procText.textContent = 'Error: ' + err.message;
            btnRemoveBg.disabled = false;
        }
    });

    // ── Render result with chosen background ─────────────────────────────
    function renderResult() {
        if (!resultMask) return;

        const canvas = previewResult;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill background if not transparent
        if (selectedBg !== 'transparent') {
            ctx.fillStyle = selectedBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Put masked image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(resultMask, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    // ── Download ─────────────────────────────────────────────────────────
    btnDownload.addEventListener('click', () => {
        if (!resultMask || !currentFile) return;
        const format = outputFormat.value;
        const ext = format === 'image/jpeg' ? 'jpg' : (format === 'image/webp' ? 'webp' : 'png');
        const quality = format === 'image/png' ? 1.0 : 0.92;
        const baseName = currentFile.name.replace(/\.[^.]+$/, '');
        FileUtils.downloadCanvas(previewResult, format, `${baseName}_no-bg.${ext}`, quality);
    });

    // Pre-warm model on page load (optional — comment out to load on demand)
    // loadPipeline();
})();

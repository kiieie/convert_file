/**
 * ==========================================================================
 * ConvertFile - SVG to PNG/JPG Converter Business Logic (svg-convert.js)
 * ==========================================================================
 */

(function () {
    'use strict';

    // DOM Refs
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('preview-img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Controls
    const widthInput = document.getElementById('output-width');
    const heightInput = document.getElementById('output-height');
    const aspectRatioCheckbox = document.getElementById('aspect-ratio');
    const outputFormatSelect = document.getElementById('output-format');
    const btnConvert = document.getElementById('btn-convert');
    const fileInfoBlock = document.getElementById('image-info-block');

    let svgText = '';
    let originalWidth = 300;
    let originalHeight = 150;
    let aspect = 2.0;
    let fileMeta = null;

    // Handle File Drop/Select
    ImageLoader.bind(
        dropZone,
        fileInput,
        function (img, meta) {
            // Note: Since ImageLoader reads as an Image element, let's verify if it's SVG
            const isSvg = meta.name.toLowerCase().endsWith('.svg') || meta.type === 'image/svg+xml';
            if (!isSvg) {
                UIComponents.showErrorDialog('Invalid File', 'Please upload an SVG vector file.');
                return;
            }

            fileMeta = meta;

            // Load SVG file text to get viewbox or dimensions
            const reader = new FileReader();
            reader.onload = function (e) {
                svgText = e.target.result;
                
                // Parse dimensions from SVG text
                parseSvgDimensions();

                // Show preview
                previewImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
                dropZone.style.display = 'none';
                previewContainer.style.display = 'flex';

                // Set inputs
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                enableControls(true);

                // Update Info
                fileInfoBlock.innerHTML = `
                    <div><strong>File Name:</strong> ${meta.name}</div>
                    <div><strong>Original Size:</strong> ${originalWidth} × ${originalHeight} (Vector)</div>
                `;
            };
            reader.readAsText(meta.file);
        },
        function (err) {
            UIComponents.showErrorDialog('Upload Error', err);
        }
    );

    // Parse SVG dimensions or viewBox from string
    function parseSvgDimensions() {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');

        if (!svgEl) return;

        let w = parseFloat(svgEl.getAttribute('width'));
        let h = parseFloat(svgEl.getAttribute('height'));
        const viewBox = svgEl.getAttribute('viewBox');

        if (isNaN(w) || isNaN(h)) {
            if (viewBox) {
                const parts = viewBox.split(/\s+/).map(parseFloat);
                if (parts.length === 4) {
                    w = parts[2];
                    h = parts[3];
                }
            }
        }

        // Fallbacks
        originalWidth = w || 800;
        originalHeight = h || 600;
        aspect = originalWidth / originalHeight;
    }

    // Input listeners
    widthInput.addEventListener('input', () => {
        let val = parseInt(widthInput.value, 10) || 0;
        if (aspectRatioCheckbox.checked && val > 0) {
            heightInput.value = Math.round(val / aspect);
        }
    });

    heightInput.addEventListener('input', () => {
        let val = parseInt(heightInput.value, 10) || 0;
        if (aspectRatioCheckbox.checked && val > 0) {
            widthInput.value = Math.round(val * aspect);
        }
    });

    function enableControls(enable) {
        widthInput.disabled = !enable;
        heightInput.disabled = !enable;
        aspectRatioCheckbox.disabled = !enable;
        outputFormatSelect.disabled = !enable;
        btnConvert.disabled = !enable;
    }

    // Convert SVG to PNG/JPG using Canvas
    btnConvert.addEventListener('click', () => {
        if (!svgText) return;

        const w = parseInt(widthInput.value, 10) || originalWidth;
        const h = parseInt(heightInput.value, 10) || originalHeight;

        if (w <= 0 || h <= 0) {
            UIComponents.showErrorDialog('Value Error', 'Width and height must be positive numbers.');
            return;
        }

        const prog = UIComponents.showProgressDialog('Converting SVG', 'Rendering vector graphics onto raster canvas...');

        setTimeout(() => {
            try {
                prog.updateProgress(40, 'Loading vector image...');

                const img = new Image();
                img.onload = function () {
                    prog.updateProgress(70, 'Drawing onto canvas...');

                    canvas.width = w;
                    canvas.height = h;

                    // Fill white background for JPG
                    const format = outputFormatSelect.value;
                    if (format === 'image/jpeg') {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, w, h);
                    } else {
                        ctx.clearRect(0, 0, w, h);
                    }

                    // Draw
                    ctx.drawImage(img, 0, 0, w, h);

                    prog.updateProgress(90, 'Encoding download file...');

                    const baseName = fileMeta.name.replace(/\.[^.]+$/, '');
                    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
                    const dlName = `${baseName}_converted.${ext}`;

                    FileUtils.downloadCanvas(canvas, format, dlName, 0.95);

                    prog.updateProgress(100, 'Conversion Complete!');
                    setTimeout(() => prog.close(), 400);
                };

                img.onerror = function () {
                    prog.close();
                    UIComponents.showErrorDialog('Render Error', 'Could not render SVG onto canvas.');
                };

                img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog('Execution Error', err.message);
            }
        }, 300);
    });

})();

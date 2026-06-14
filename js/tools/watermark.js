/**
 * ==========================================================================
 * ConvertFile - Image Watermark Business Logic (watermark.js)
 * ==========================================================================
 */

(function () {
    'use strict';

    // DOM Refs
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');

    // Control elements
    const watermarkTypeRadios = document.querySelectorAll('input[name="watermark-type"]');
    const textGroup = document.getElementById('text-watermark-group');
    const imageGroup = document.getElementById('image-watermark-group');

    // Text options
    const watermarkText = document.getElementById('watermark-text');
    const fontSizeSlider = document.getElementById('font-size');
    const fontSizeLabel = document.getElementById('font-size-label');
    const textColorInput = document.getElementById('text-color');
    const textOpacitySlider = document.getElementById('text-opacity');
    const textOpacityLabel = document.getElementById('text-opacity-label');

    // Logo options
    const logoFileInput = document.getElementById('logo-file-input');
    const btnSelectLogo = document.getElementById('btn-select-logo');
    const logoNameLabel = document.getElementById('logo-name-label');
    const logoOpacitySlider = document.getElementById('logo-opacity');
    const logoOpacityLabel = document.getElementById('logo-opacity-label');
    const logoScaleSlider = document.getElementById('logo-scale');
    const logoScaleLabel = document.getElementById('logo-scale-label');

    // Position options
    const positionSelect = document.getElementById('watermark-position');
    const outputFormatSelect = document.getElementById('output-format');
    const btnDownload = document.getElementById('btn-download');
    const fileInfoBlock = document.getElementById('image-info-block');

    let mainImage = null;
    let fileMeta = null;
    let logoImage = null;
    let logoMeta = null;
    let watermarkType = 'text'; // 'text' or 'image'

    // Initialize Main Image Loader
    ImageLoader.bind(
        dropZone,
        fileInput,
        function (img, meta) {
            mainImage = img;
            fileMeta = meta;

            // Hide drop zone, show preview
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';

            // Enable controls & download button
            enableControls(true);

            // Update info
            fileInfoBlock.innerHTML = `
                <div><strong>Name:</strong> ${meta.name}</div>
                <div><strong>Dimensions:</strong> ${meta.width} × ${meta.height} px</div>
                <div><strong>Size:</strong> ${FileUtils.formatBytes(meta.size)}</div>
            `;

            // Draw watermark
            drawWatermark();
        },
        function (err) {
            UIComponents.showErrorDialog('Upload Error', err);
        }
    );

    // Toggle Watermark Type
    watermarkTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            watermarkType = e.target.value;
            if (watermarkType === 'text') {
                textGroup.style.display = 'block';
                imageGroup.style.display = 'none';
            } else {
                textGroup.style.display = 'none';
                imageGroup.style.display = 'block';
            }
            drawWatermark();
        });
    });

    // Event listeners for real-time text updates
    watermarkText.addEventListener('input', drawWatermark);
    fontSizeSlider.addEventListener('input', (e) => {
        fontSizeLabel.textContent = `${e.target.value}px`;
        drawWatermark();
    });
    textColorInput.addEventListener('input', drawWatermark);
    textOpacitySlider.addEventListener('input', (e) => {
        textOpacityLabel.textContent = `${Math.round(e.target.value * 100)}%`;
        drawWatermark();
    });

    // Event listeners for real-time logo updates
    btnSelectLogo.addEventListener('click', () => logoFileInput.click());
    logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.match(/image.*/)) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    logoImage = img;
                    logoMeta = { name: file.name, width: img.naturalWidth, height: img.naturalHeight };
                    logoNameLabel.textContent = file.name;
                    drawWatermark();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    logoOpacitySlider.addEventListener('input', (e) => {
        logoOpacityLabel.textContent = `${Math.round(e.target.value * 100)}%`;
        drawWatermark();
    });
    logoScaleSlider.addEventListener('input', (e) => {
        logoScaleLabel.textContent = `${e.target.value}%`;
        drawWatermark();
    });

    positionSelect.addEventListener('change', drawWatermark);
    outputFormatSelect.addEventListener('change', drawWatermark);

    function enableControls(enable) {
        watermarkTypeRadios.forEach(r => r.disabled = !enable);
        watermarkText.disabled = !enable;
        fontSizeSlider.disabled = !enable;
        textColorInput.disabled = !enable;
        textOpacitySlider.disabled = !enable;
        btnSelectLogo.disabled = !enable;
        logoOpacitySlider.disabled = !enable;
        logoScaleSlider.disabled = !enable;
        positionSelect.disabled = !enable;
        outputFormatSelect.disabled = !enable;
        btnDownload.disabled = !enable;
    }

    // Main Draw Watermark Function
    function drawWatermark() {
        if (!mainImage) return;

        // Reset canvas to main image dimensions
        canvas.width = mainImage.naturalWidth;
        canvas.height = mainImage.naturalHeight;

        // Draw background white if outputting JPG (doesn't support transparency)
        if (outputFormatSelect.value === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw main image
        ctx.drawImage(mainImage, 0, 0);

        // Apply Watermark
        ctx.save();

        if (watermarkType === 'text') {
            const text = watermarkText.value.trim();
            if (text.length > 0) {
                const size = parseInt(fontSizeSlider.value, 10);
                const opacity = parseFloat(textOpacitySlider.value);
                const color = textColorInput.value;
                const pos = positionSelect.value;

                ctx.font = `bold ${size}px sans-serif`;
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color;
                ctx.textBaseline = 'middle';

                const textWidth = ctx.measureText(text).width;
                const margin = Math.max(20, Math.floor(canvas.width * 0.03));

                if (pos === 'tiled') {
                    // Repeat tiled text pattern
                    const stepX = textWidth + 100;
                    const stepY = size + 100;
                    ctx.rotate(-Math.PI / 6); // rotate 30 degrees
                    for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
                        for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
                            ctx.fillText(text, x, y);
                        }
                    }
                } else {
                    let tx = margin;
                    let ty = margin + size / 2;

                    if (pos === 'top-right') {
                        tx = canvas.width - textWidth - margin;
                    } else if (pos === 'center') {
                        tx = (canvas.width - textWidth) / 2;
                        ty = canvas.height / 2;
                    } else if (pos === 'bottom-left') {
                        ty = canvas.height - size / 2 - margin;
                    } else if (pos === 'bottom-right') {
                        tx = canvas.width - textWidth - margin;
                        ty = canvas.height - size / 2 - margin;
                    }

                    ctx.fillText(text, tx, ty);
                }
            }
        } else if (watermarkType === 'image' && logoImage) {
            const opacity = parseFloat(logoOpacitySlider.value);
            const scale = parseInt(logoScaleSlider.value, 10) / 100;
            const pos = positionSelect.value;

            ctx.globalAlpha = opacity;

            const lw = Math.round(logoImage.naturalWidth * scale);
            const lh = Math.round(logoImage.naturalHeight * scale);
            const margin = Math.max(20, Math.floor(canvas.width * 0.03));

            if (pos === 'tiled') {
                const stepX = lw + 120;
                const stepY = lh + 120;
                ctx.rotate(-Math.PI / 6);
                for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
                    for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
                        ctx.drawImage(logoImage, x, y, lw, lh);
                    }
                }
            } else {
                let lx = margin;
                let ly = margin;

                if (pos === 'top-right') {
                    lx = canvas.width - lw - margin;
                } else if (pos === 'center') {
                    lx = (canvas.width - lw) / 2;
                    ly = (canvas.height - lh) / 2;
                } else if (pos === 'bottom-left') {
                    ly = canvas.height - lh - margin;
                } else if (pos === 'bottom-right') {
                    lx = canvas.width - lw - margin;
                    ly = canvas.height - lh - margin;
                }

                ctx.drawImage(logoImage, lx, ly, lw, lh);
            }
        }

        ctx.restore();
    }

    // Download Watermarked Image
    btnDownload.addEventListener('click', () => {
        if (!mainImage) return;

        const format = outputFormatSelect.value;
        const ext = format === 'image/jpeg' ? 'jpg' : (format === 'image/webp' ? 'webp' : 'png');
        const quality = format === 'image/png' ? 1.0 : 0.92;
        const baseName = fileMeta.name.replace(/\.[^.]+$/, '');
        const dlName = `${baseName}_watermarked.${ext}`;

        FileUtils.downloadCanvas(canvas, format, dlName, quality);
    });

})();

/**
 * ==========================================================================
 * ConvertFile - Meme Generator Business Logic (meme-generator.js)
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

    // Controls
    const topText = document.getElementById('top-text');
    const bottomText = document.getElementById('bottom-text');
    const fontSizeSlider = document.getElementById('font-size');
    const fontSizeLabel = document.getElementById('font-size-label');
    const textColorInput = document.getElementById('text-color');
    const strokeColorInput = document.getElementById('stroke-color');
    const strokeWidthSlider = document.getElementById('stroke-width');
    const strokeWidthLabel = document.getElementById('stroke-width-label');
    const uppercaseCheckbox = document.getElementById('uppercase-text');
    const outputFormatSelect = document.getElementById('output-format');
    const btnDownload = document.getElementById('btn-download');
    const fileInfoBlock = document.getElementById('image-info-block');

    let mainImage = null;
    let fileMeta = null;

    // Initialize ImageLoader
    ImageLoader.bind(
        dropZone,
        fileInput,
        function (img, meta) {
            mainImage = img;
            fileMeta = meta;

            // Hide drop zone, show preview
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';

            // Enable control states
            enableControls(true);

            // Update info
            fileInfoBlock.innerHTML = `
                <div><strong>Name:</strong> ${meta.name}</div>
                <div><strong>Dimensions:</strong> ${meta.width} × ${meta.height} px</div>
            `;

            // Draw initial meme
            drawMeme();
        },
        function (err) {
            UIComponents.showErrorDialog('Upload Error', err);
        }
    );

    // Event listeners
    topText.addEventListener('input', drawMeme);
    bottomText.addEventListener('input', drawMeme);
    uppercaseCheckbox.addEventListener('change', drawMeme);
    outputFormatSelect.addEventListener('change', drawMeme);

    fontSizeSlider.addEventListener('input', (e) => {
        fontSizeLabel.textContent = `${e.target.value}px`;
        drawMeme();
    });

    textColorInput.addEventListener('input', drawMeme);
    strokeColorInput.addEventListener('input', drawMeme);

    strokeWidthSlider.addEventListener('input', (e) => {
        strokeWidthLabel.textContent = `${e.target.value}px`;
        drawMeme();
    });

    function enableControls(enable) {
        topText.disabled = !enable;
        bottomText.disabled = !enable;
        fontSizeSlider.disabled = !enable;
        textColorInput.disabled = !enable;
        strokeColorInput.disabled = !enable;
        strokeWidthSlider.disabled = !enable;
        uppercaseCheckbox.disabled = !enable;
        outputFormatSelect.disabled = !enable;
        btnDownload.disabled = !enable;
    }

    // Wrap text helper to draw text on multiple lines if it's too long
    function drawWrappedText(text, x, y, maxWidth, lineHeight, isTop) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        // Render lines
        if (isTop) {
            lines.forEach((line, index) => {
                ctx.fillText(line, x, y + (index * lineHeight));
                ctx.strokeText(line, x, y + (index * lineHeight));
            });
        } else {
            // Render from bottom up
            const totalH = (lines.length - 1) * lineHeight;
            lines.forEach((line, index) => {
                ctx.fillText(line, x, y - totalH + (index * lineHeight));
                ctx.strokeText(line, x, y - totalH + (index * lineHeight));
            });
        }
    }

    function drawMeme() {
        if (!mainImage) return;

        // Reset canvas size to match image
        canvas.width = mainImage.naturalWidth;
        canvas.height = mainImage.naturalHeight;

        // Fill background white for JPG
        if (outputFormatSelect.value === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw main image
        ctx.drawImage(mainImage, 0, 0);

        // Setup font styles
        const fontSize = parseInt(fontSizeSlider.value, 10);
        const textColor = textColorInput.value;
        const strokeColor = strokeColorInput.value;
        const strokeWidth = parseInt(strokeWidthSlider.value, 10);

        // Impact font is standard for memes, fallback to sans-serif
        ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = 'round';

        const padding = Math.max(10, Math.floor(canvas.height * 0.02));
        const maxWidth = canvas.width - 40;
        const lineHeight = fontSize + 6;

        // Top Text
        let topVal = topText.value;
        if (uppercaseCheckbox.checked) topVal = topVal.toUpperCase();
        if (topVal.trim().length > 0) {
            ctx.textBaseline = 'top';
            drawWrappedText(topVal, canvas.width / 2, padding, maxWidth, lineHeight, true);
        }

        // Bottom Text
        let bottomVal = bottomText.value;
        if (uppercaseCheckbox.checked) bottomVal = bottomVal.toUpperCase();
        if (bottomVal.trim().length > 0) {
            ctx.textBaseline = 'bottom';
            drawWrappedText(bottomVal, canvas.width / 2, canvas.height - padding, maxWidth, lineHeight, false);
        }
    }

    // Download meme
    btnDownload.addEventListener('click', () => {
        if (!mainImage) return;

        const format = outputFormatSelect.value;
        const ext = format === 'image/jpeg' ? 'jpg' : (format === 'image/webp' ? 'webp' : 'png');
        const quality = format === 'image/png' ? 1.0 : 0.92;
        const baseName = fileMeta.name.replace(/\.[^.]+$/, '');
        const dlName = `${baseName}_meme.${ext}`;

        FileUtils.downloadCanvas(canvas, format, dlName, quality);
    });

})();

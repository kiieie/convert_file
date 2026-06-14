/**
 * ==========================================================================
 * ConvertFile - Color Palette Extractor Business Logic (color-extractor.js)
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

    const dominantContainer = document.getElementById('dominant-palette');
    const pickerPreview = document.getElementById('picker-preview');
    const colorHex = document.getElementById('color-hex');
    const colorRgb = document.getElementById('color-rgb');
    const colorHsl = document.getElementById('color-hsl');
    const btnCopyHex = document.getElementById('btn-copy-hex');
    const fileInfoBlock = document.getElementById('image-info-block');

    let originalImage = null;
    let fileMeta = null;

    // Initialize ImageLoader
    ImageLoader.bind(
        dropZone,
        fileInput,
        function (img, meta) {
            originalImage = img;
            fileMeta = meta;

            // Draw to canvas
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);

            // Hide drop zone, show preview
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';

            // Update info
            fileInfoBlock.innerHTML = `
                <div><strong>Name:</strong> ${meta.name}</div>
                <div><strong>Size:</strong> ${meta.width} × ${meta.height} px (${FileUtils.formatBytes(meta.size)})</div>
            `;

            // Extract Palette
            extractPalette();
            
            // Set default picked color (center pixel)
            pickColor(Math.floor(img.naturalWidth / 2), Math.floor(img.naturalHeight / 2));
        },
        function (err) {
            UIComponents.showErrorDialog('Upload Error', err);
        }
    );

    // Canvas click event for color picking
    canvas.addEventListener('click', function (e) {
        if (!originalImage) return;

        const rect = canvas.getBoundingClientRect();
        // Scale client coordinates to canvas internal size
        const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
        const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

        pickColor(x, y);
    });

    function rgbToHex(r, g, b) {
        const toHex = val => {
            const h = val.toString(16);
            return h.length === 1 ? '0' + h : h;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [
            Math.round(h * 360),
            Math.round(s * 100) + '%',
            Math.round(l * 100) + '%'
        ];
    }

    function pickColor(x, y) {
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        const hex = rgbToHex(r, g, b);
        const rgb = `rgb(${r}, ${g}, ${b})`;
        const [h, s, l] = rgbToHsl(r, g, b);
        const hsl = `hsl(${h}, ${s}, ${l})`;

        // Update UI
        pickerPreview.style.backgroundColor = hex;
        colorHex.textContent = hex;
        colorRgb.textContent = rgb;
        colorHsl.textContent = hsl;
    }

    // Copy to clipboard
    btnCopyHex.addEventListener('click', () => {
        const text = colorHex.textContent;
        if (text && text !== '—') {
            navigator.clipboard.writeText(text).then(() => {
                const prev = btnCopyHex.textContent;
                btnCopyHex.textContent = 'Copied!';
                setTimeout(() => btnCopyHex.textContent = prev, 1500);
            });
        }
    });

    // Extract dominant palette using simple grid sampling
    function extractPalette() {
        const w = canvas.width;
        const h = canvas.height;

        // Sample in a 30x30 grid
        const cols = 30;
        const rows = 30;
        const dx = Math.floor(w / cols) || 1;
        const dy = Math.floor(h / rows) || 1;

        const colorCounts = {};

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const px = i * dx;
                const py = j * dy;
                if (px >= w || py >= h) continue;

                const pixel = ctx.getImageData(px, py, 1, 1).data;
                // Skip fully transparent pixels
                if (pixel[3] < 128) continue;

                // Round values to group similar colors (quantize to 16 values per channel)
                const r = Math.round(pixel[0] / 16) * 16;
                const g = Math.round(pixel[1] / 16) * 16;
                const b = Math.round(pixel[2] / 16) * 16;

                const hex = rgbToHex(r, g, b);
                colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            }
        }

        // Sort by frequency
        const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

        // Take top 6 dominant colors
        const topColors = sortedColors.slice(0, 6);

        dominantContainer.innerHTML = '';
        if (topColors.length === 0) {
            dominantContainer.innerHTML = '<span style="font-size:12px;color:var(--slate-400);">No colors found</span>';
            return;
        }

        topColors.forEach(hex => {
            const swatch = document.createElement('div');
            swatch.className = 'swatch-item';
            swatch.style.display = 'flex';
            swatch.style.flexDirection = 'column';
            swatch.style.alignItems = 'center';
            swatch.style.gap = '4px';
            swatch.style.cursor = 'pointer';

            swatch.innerHTML = `
                <div style="width:40px;height:40px;border-radius:50%;background-color:${hex};border:1px solid var(--slate-200);"></div>
                <span style="font-size:10px;font-weight:600;color:var(--slate-600);">${hex}</span>
            `;

            swatch.addEventListener('click', () => {
                // Parse hex back to RGB to update Picked panel
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);

                const rgb = `rgb(${r}, ${g}, ${b})`;
                const [hVal, sVal, lVal] = rgbToHsl(r, g, b);
                const hsl = `hsl(${hVal}, ${sVal}, ${lVal})`;

                pickerPreview.style.backgroundColor = hex;
                colorHex.textContent = hex;
                colorRgb.textContent = rgb;
                colorHsl.textContent = hsl;
            });

            dominantContainer.appendChild(swatch);
        });
    }
})();

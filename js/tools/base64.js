/**
 * ==========================================================================
 * ConvertFile - Image ↔ Base64 Converter Business Logic (base64.js)
 * ==========================================================================
 */

(function () {
    'use strict';

    // DOM Refs
    const tabToB64 = document.getElementById('tab-to-b64');
    const tabToImg = document.getElementById('tab-to-img');
    const panelToB64 = document.getElementById('panel-to-b64');
    const panelToImg = document.getElementById('panel-to-img');

    // Image to Base64
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const b64Output = document.getElementById('b64-output');
    const btnCopy = document.getElementById('btn-copy');
    const infoB64Block = document.getElementById('info-b64-block');
    const b64ResultCard = document.getElementById('b64-result-card');

    // Base64 to Image
    const b64Input = document.getElementById('b64-input');
    const btnConvert = document.getElementById('btn-convert');
    const imgPreviewContainer = document.getElementById('img-preview-container');
    const imgPreview = document.getElementById('img-preview');
    const btnDownload = document.getElementById('btn-download');
    const infoImgBlock = document.getElementById('info-img-block');

    // Tab switcher
    tabToB64.addEventListener('click', () => switchTab('to-b64'));
    tabToImg.addEventListener('click', () => switchTab('to-img'));

    function switchTab(tab) {
        if (tab === 'to-b64') {
            tabToB64.classList.add('modern-tabs__item--active');
            tabToImg.classList.remove('modern-tabs__item--active');
            panelToB64.style.display = 'block';
            panelToImg.style.display = 'none';
        } else {
            tabToB64.classList.remove('modern-tabs__item--active');
            tabToImg.classList.add('modern-tabs__item--active');
            panelToB64.style.display = 'none';
            panelToImg.style.display = 'block';
        }
    }

    // --- Image to Base64 Logic ---
    ImageLoader.bind(
        dropZone,
        fileInput,
        function (img, meta) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const base64String = e.target.result;
                b64Output.value = base64String;
                b64ResultCard.style.display = 'block';

                // Update Stats
                const len = base64String.length;
                const sizeKb = (len * 0.75 / 1024).toFixed(1);
                infoB64Block.innerHTML = `
                    <div><strong>Image Format:</strong> ${meta.type}</div>
                    <div><strong>Image Dimensions:</strong> ${meta.width} × ${meta.height} px</div>
                    <div><strong>Base64 Length:</strong> ${len.toLocaleString()} characters</div>
                    <div><strong>Estimated File Size:</strong> ${sizeKb} KB</div>
                `;
            };
            reader.readAsDataURL(meta.file);
        },
        function (err) {
            UIComponents.showErrorDialog('Upload Error', err);
        }
    );

    // Copy to clipboard
    btnCopy.addEventListener('click', () => {
        const text = b64Output.value;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                const prev = btnCopy.textContent;
                btnCopy.textContent = 'Copied!';
                setTimeout(() => btnCopy.textContent = prev, 1500);
            });
        }
    });

    // --- Base64 to Image Logic ---
    btnConvert.addEventListener('click', () => {
        let rawStr = b64Input.value.trim();
        if (!rawStr) {
            UIComponents.showErrorDialog('Input Error', 'Please paste a Base64 string first.');
            return;
        }

        // Add standard data URI header if not present (defaults to PNG)
        if (!rawStr.startsWith('data:image/')) {
            // Check if it looks like JPEG or GIF by checking first characters
            let mime = 'image/png';
            if (rawStr.startsWith('/9j/')) {
                mime = 'image/jpeg';
            } else if (rawStr.startsWith('R0lG')) {
                mime = 'image/gif';
            } else if (rawStr.startsWith('UklGR')) {
                mime = 'image/webp';
            }
            rawStr = `data:${mime};base64,` + rawStr;
        }

        // Validate structure roughly
        const parts = rawStr.split(';base64,');
        if (parts.length !== 2) {
            UIComponents.showErrorDialog('Parsing Error', 'Invalid Base64 format. Make sure it contains base64 encoded image data.');
            return;
        }

        imgPreview.onload = function () {
            imgPreviewContainer.style.display = 'block';
            btnDownload.disabled = false;

            // Guess size from string length
            const len = parts[1].length;
            const sizeKb = (len * 0.75 / 1024).toFixed(1);
            const mime = parts[0].replace('data:', '');
            
            infoImgBlock.innerHTML = `
                <div><strong>Detected Format:</strong> ${mime}</div>
                <div><strong>Resolution:</strong> ${imgPreview.naturalWidth} × ${imgPreview.naturalHeight} px</div>
                <div><strong>Estimated Size:</strong> ${sizeKb} KB</div>
            `;
        };

        imgPreview.onerror = function () {
            UIComponents.showErrorDialog('Decoding Error', 'Could not decode image. Make sure the Base64 string is correct.');
            imgPreviewContainer.style.display = 'none';
            btnDownload.disabled = true;
            infoImgBlock.innerHTML = '';
        };

        imgPreview.src = rawStr;
    });

    // Download from Base64
    btnDownload.addEventListener('click', () => {
        const src = imgPreview.src;
        if (!src) return;

        // Extract mime type
        const match = src.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mime = match ? match[1] : 'image/png';
        const ext = mime.split('/')[1] || 'png';

        const link = document.createElement('a');
        link.href = src;
        link.download = `decoded_base64.${ext === 'jpeg' ? 'jpg' : ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

})();

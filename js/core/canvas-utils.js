/**
 * ==========================================================================
 * ConvertFile - Canvas Utilities Module
 * ==========================================================================
 * HTML5 Canvas API를 이용한 이미지 리사이즈, 크롭, 회전, 뒤집기 및
 * 필터 적용 처리를 대행하는 공통 연산 모듈.
 */

window.CanvasUtils = {
    /**
     * 원본 이미지를 지정된 가로/세로 크기의 새로운 Canvas로 스케일링합니다.
     * @param {HTMLImageElement|HTMLCanvasElement} source - 변환할 원본 요소
     * @param {number} width - 출력 가로 픽셀
     * @param {number} height - 출력 세로 픽셀
     * @param {string} interpolation - 보간 방식 ('bilinear'|'nearest')
     * @returns {HTMLCanvasElement} 생성된 캔버스
     */
    resize: function(source, width, height, interpolation = 'bilinear') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (interpolation === 'nearest') {
            // Nearest Neighbor 수동 픽셀 맵핑 (도트 그래픽용)
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = source.naturalWidth || source.width;
            tempCanvas.height = source.naturalHeight || source.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(source, 0, 0);
            
            const srcData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const dstData = ctx.createImageData(width, height);
            
            const xRatio = tempCanvas.width / width;
            const yRatio = tempCanvas.height / height;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const px = Math.floor(x * xRatio);
                    const py = Math.floor(y * yRatio);
                    const srcIdx = (py * tempCanvas.width + px) * 4;
                    const dstIdx = (y * width + x) * 4;
                    
                    dstData.data[dstIdx] = srcData.data[srcIdx];         // R
                    dstData.data[dstIdx+1] = srcData.data[srcIdx+1];     // G
                    dstData.data[dstIdx+2] = srcData.data[srcIdx+2];     // B
                    dstData.data[dstIdx+3] = srcData.data[srcIdx+3];     // A
                }
            }
            ctx.putImageData(dstData, 0, 0);
        } else {
            // Bilinear / Bicubic (브라우저 기본 2D 가속 하드웨어 연산 활용)
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(source, 0, 0, width, height);
        }

        return canvas;
    },

    /**
     * 이미지 캔버스를 특정 영역 기준으로 크롭(잘라내기)합니다.
     * @param {HTMLCanvasElement} canvas - 원본 캔버스
     * @param {number} x - 시작 X 좌표
     * @param {number} y - 시작 Y 좌표
     * @param {number} width - 잘라낼 가로 크기
     * @param {number} height - 잘라낼 세로 크기
     * @returns {HTMLCanvasElement} 잘라낸 결과 캔버스
     */
    crop: function(canvas, x, y, width, height) {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        const ctx = croppedCanvas.getContext('2d');
        
        ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
        return croppedCanvas;
    },

    /**
     * 캔버스를 회전시키거나 좌우/상하 뒤집기 처리를 수행합니다.
     * @param {HTMLCanvasElement|HTMLImageElement} source - 원본 요소
     * @param {number} degrees - 회전 각도 (0, 90, 180, 270 등)
     * @param {boolean} flipH - 좌우 대칭 여부
     * @param {boolean} flipV - 상하 대칭 여부
     * @returns {HTMLCanvasElement} 결과 캔버스
     */
    rotateAndFlip: function(source, degrees, flipH = false, flipV = false) {
        const canvas = document.createElement('canvas');
        const srcWidth = source.naturalWidth || source.width;
        const srcHeight = source.naturalHeight || source.height;

        // 90도 또는 270도 회전 시 캔버스 가로세로 바꿈
        const angleRad = (degrees * Math.PI) / 180;
        const isOrthogonal = Math.abs(Math.sin(angleRad)) > 0.9; // 90도, 270도 감지
        
        const width = isOrthogonal ? srcHeight : srcWidth;
        const height = isOrthogonal ? srcWidth : srcHeight;

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // 중심점 기준으로 원점 이동
        ctx.translate(width / 2, height / 2);
        
        // 회전
        ctx.rotate(angleRad);
        
        // 대칭(Flip)
        const scaleX = flipH ? -1 : 1;
        const scaleY = flipV ? -1 : 1;
        ctx.scale(scaleX, scaleY);
        
        // 이미지 드로잉
        ctx.drawImage(source, -srcWidth / 2, -srcHeight / 2);
        
        return canvas;
    },

    /**
     * 캔버스 픽셀 연산을 거쳐 밝기, 대비, 채도 및 반전 등의 필터를 수동 적용합니다.
     * @param {HTMLCanvasElement} canvas - 필터를 입힐 캔버스
     * @param {object} options - { brightness, contrast, saturation, invert, grayscale, sepia }
     * @returns {HTMLCanvasElement} 픽셀 변경 처리된 새로운 캔버스
     */
    applyFilters: function(canvas, options) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);

        const imgData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
        const data = imgData.data;

        const b = options.brightness || 0;     // -255 ~ 255
        const c = options.contrast || 0;       // -128 ~ 128
        const s = options.saturation || 0;     // -100 ~ 100
        const inv = options.invert || false;
        const gray = options.grayscale || false;
        const sepia = options.sepia || false;

        const factor = (259 * (c + 255)) / (255 * (259 - c));

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i+1];
            let bVal = data[i+2];

            // 1. 밝기 (Brightness)
            if (b !== 0) {
                r += b;
                g += b;
                bVal += b;
            }

            // 2. 대비 (Contrast)
            if (c !== 0) {
                r = factor * (r - 128) + 128;
                g = factor * (g - 128) + 128;
                bVal = factor * (bVal - 128) + 128;
            }

            // 3. 채도 (Saturation)
            if (s !== 0) {
                const grayVal = 0.2989 * r + 0.5870 * g + 0.1140 * bVal;
                const alpha = (s + 100) / 100;
                r = grayVal + (r - grayVal) * alpha;
                g = grayVal + (g - grayVal) * alpha;
                bVal = grayVal + (bVal - grayVal) * alpha;
            }

            // 4. 반전 (Invert)
            if (inv) {
                r = 255 - r;
                g = 255 - g;
                bVal = 255 - bVal;
            }

            // 5. 그레이스케일 (Grayscale)
            if (gray) {
                const grayVal = 0.299 * r + 0.587 * g + 0.114 * bVal;
                r = grayVal;
                g = grayVal;
                bVal = grayVal;
            }

            // 6. 세피아 (Sepia)
            if (sepia) {
                const tr = 0.393 * r + 0.769 * g + 0.189 * bVal;
                const tg = 0.349 * r + 0.686 * g + 0.168 * bVal;
                const tb = 0.272 * r + 0.534 * g + 0.131 * bVal;
                r = tr > 255 ? 255 : tr;
                g = tg > 255 ? 255 : tg;
                bVal = tb > 255 ? 255 : tb;
            }

            // 바운더리 클램핑 (0 ~ 255)
            data[i]   = Math.min(255, Math.max(0, r));
            data[i+1] = Math.min(255, Math.max(0, g));
            data[i+2] = Math.min(255, Math.max(0, bVal));
        }

        ctx.putImageData(imgData, 0, 0);
        return newCanvas;
    }
};

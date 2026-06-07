/**
 * ==========================================================================
 * ConvertFile - Image Format Converter (Batch Processing)
 * ==========================================================================
 * 다중 이미지 파일을 동시에 지정 포맷으로 변환 및 자동 다운로드합니다.
 */

(function() {
    // DOM elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const batchContainer = document.getElementById('batch-container');
    const batchFileList = document.getElementById('batch-file-list');
    const batchCount = document.getElementById('batch-count');
    const batchSummary = document.getElementById('batch-summary');
    const btnClearBatch = document.getElementById('btn-clear-batch');

    const targetFormatSelect = document.getElementById('target-format');
    const qualityPanel = document.getElementById('quality-panel');
    const compressQuality = document.getElementById('compress-quality');
    const qualityVal = document.getElementById('quality-val');
    const alphaPanel = document.getElementById('alpha-panel');
    const bgFillerColor = document.getElementById('bg-filler-color');

    const btnConvert = document.getElementById('btn-convert');
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    // 파일 선택 버튼
    const btnSelectFile = document.getElementById('btn-select-file');
    btnSelectFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // 변환 대기 파일 큐
    let fileQueue = [];

    // -------------------------
    // Drag & Drop 핸들러
    // -------------------------
    const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, preventDefaults));

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
        if (files.length > 0) addFilesToQueue(Array.from(files));
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addFilesToQueue(Array.from(e.target.files));
            fileInput.value = ''; // 동일 파일 재추가 허용
        }
    });

    // 전체 초기화
    btnClearBatch.addEventListener('click', () => {
        fileQueue = [];
        renderBatchList();
        btnConvert.setAttribute('disabled', true);
        batchContainer.style.display = 'none';
        statusText.textContent = '';
        statusInfo.textContent = '';
    });

    /**
     * 큐에 파일 추가 (중복 제거)
     * @param {File[]} newFiles
     */
    function addFilesToQueue(newFiles) {
        newFiles.forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const isDuplicate = fileQueue.some(f => f.name === file.name && f.size === file.size);
            if (!isDuplicate) fileQueue.push(file);
        });
        renderBatchList();
        if (fileQueue.length > 0) {
            btnConvert.removeAttribute('disabled');
            batchContainer.style.display = 'block';
        }
    }

    /**
     * 파일 목록 UI 렌더링
     */
    function renderBatchList() {
        batchFileList.innerHTML = '';
        batchCount.textContent = `${fileQueue.length} file${fileQueue.length !== 1 ? 's' : ''} selected`;

        fileQueue.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'batch-file-item';
            item.dataset.index = index;

            // 썸네일 미리보기
            const thumb = document.createElement('img');
            thumb.className = 'batch-file-item__thumb';
            const thumbUrl = URL.createObjectURL(file);
            thumb.src = thumbUrl;
            thumb.alt = file.name;
            thumb.onload = () => URL.revokeObjectURL(thumbUrl); // 메모리 해제

            // 파일 정보
            const info = document.createElement('div');
            info.className = 'batch-file-item__info';
            info.innerHTML = `
                <div class="batch-file-item__name" title="${file.name}">${file.name}</div>
                <div class="batch-file-item__meta">${(file.size / 1024).toFixed(1)} KB &middot; ${file.type.split('/')[1].toUpperCase()}</div>
            `;

            // 상태 배지
            const status = document.createElement('span');
            status.className = 'batch-file-item__status batch-file-item__status--pending';
            status.textContent = 'Waiting';
            status.id = `status-${index}`;

            // 제거 버튼
            const removeBtn = document.createElement('button');
            removeBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--slate-400);font-size:16px;padding:0;line-height:1;';
            removeBtn.textContent = '\u00d7';
            removeBtn.title = 'Remove';
            removeBtn.addEventListener('click', () => {
                fileQueue.splice(index, 1);
                renderBatchList();
                if (fileQueue.length === 0) {
                    btnConvert.setAttribute('disabled', true);
                    batchContainer.style.display = 'none';
                }
            });

            item.appendChild(thumb);
            item.appendChild(info);
            item.appendChild(status);
            item.appendChild(removeBtn);
            batchFileList.appendChild(item);
        });

        // 요약 정보
        const totalSize = fileQueue.reduce((sum, f) => sum + f.size, 0);
        batchSummary.textContent = fileQueue.length > 0
            ? `Total: ${fileQueue.length} files \u00b7 ${(totalSize / 1024).toFixed(1)} KB`
            : '';
    }

    // -------------------------
    // 포맷 설정 토글
    // -------------------------
    targetFormatSelect.addEventListener('change', toggleFormatSettings);
    compressQuality.addEventListener('input', (e) => { qualityVal.textContent = e.target.value; });

    function toggleFormatSettings() {
        const fmt = targetFormatSelect.value;
        qualityPanel.style.display = (fmt === 'image/jpeg' || fmt === 'image/webp') ? 'block' : 'none';
        alphaPanel.style.display = (fmt === 'image/jpeg') ? 'block' : 'none';
    }
    toggleFormatSettings(); // 초기 상태 적용

    // -------------------------
    // 배치 변환 실행
    // -------------------------
    btnConvert.addEventListener('click', async () => {
        if (fileQueue.length === 0) return;

        const targetFormat = targetFormatSelect.value;
        const quality = parseInt(compressQuality.value) / 100;
        const bgColor = bgFillerColor.value;

        let ext = 'png';
        if (targetFormat === 'image/jpeg') ext = 'jpg';
        else if (targetFormat === 'image/webp') ext = 'webp';

        btnConvert.setAttribute('disabled', true);
        btnConvert.textContent = '\u23f3 Converting...';
        statusText.textContent = `Converting ${fileQueue.length} files...`;
        statusInfo.textContent = '';

        let doneCount = 0;
        let errorCount = 0;

        // 순차 처리 (메모리 과부하 방지)
        for (let i = 0; i < fileQueue.length; i++) {
            const file = fileQueue[i];
            const statusEl = document.getElementById(`status-${i}`);

            if (statusEl) {
                statusEl.className = 'batch-file-item__status batch-file-item__status--processing';
                statusEl.textContent = 'Processing...';
            }

            try {
                await convertSingleFile(file, targetFormat, quality, bgColor, ext);
                doneCount++;
                if (statusEl) {
                    statusEl.className = 'batch-file-item__status batch-file-item__status--done';
                    statusEl.textContent = '\u2713 Done';
                }
            } catch (err) {
                errorCount++;
                if (statusEl) {
                    statusEl.className = 'batch-file-item__status batch-file-item__status--error';
                    statusEl.textContent = '\u2717 Error';
                }
                console.error(`Convert error for ${file.name}:`, err);
            }

            statusText.textContent = `Converted ${doneCount + errorCount} / ${fileQueue.length} files`;
        }

        statusText.textContent = `\u2705 Complete: ${doneCount} converted, ${errorCount} errors`;
        statusInfo.textContent = `Output format: ${ext.toUpperCase()}`;
        btnConvert.removeAttribute('disabled');
        btnConvert.textContent = '\ud83d\udd04 Convert All Files';
    });

    /**
     * 단일 이미지 파일 변환 후 다운로드
     * @param {File} file
     * @param {string} format - MIME type
     * @param {number} quality - 0.0~1.0
     * @param {string} bgColor - 배경색 hex
     * @param {string} ext - 출력 확장자
     * @returns {Promise<void>}
     */
    function convertSingleFile(file, format, quality, bgColor, ext) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objUrl);

                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');

                // JPG는 투명 배경 미지원 → 배경색으로 채우기
                if (format === 'image/jpeg') {
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);

                const baseName = file.name.replace(/\.[^.]+$/, '');
                const downloadName = `${baseName}_converted.${ext}`;

                try {
                    FileUtils.downloadCanvas(canvas, format, downloadName, quality);
                    resolve();
                } catch (e) {
                    // Fallback: blob URL 다운로드
                    canvas.toBlob((blob) => {
                        if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = downloadName;
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                        resolve();
                    }, format, quality);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(objUrl);
                reject(new Error(`Failed to load image: ${file.name}`));
            };

            img.src = objUrl;
        });
    }
})();

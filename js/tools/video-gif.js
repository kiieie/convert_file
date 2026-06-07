/**
 * ==========================================================================
 * ConvertFile - Video to GIF Converter with Batch Support (video-gif.js)
 * ==========================================================================
 * 단일 또는 여러 비디오 파일을 GIF 애니메이션으로 변환합니다.
 * gifshot 라이브러리를 사용하여 브라우저 내에서 완전히 처리합니다.
 */

(function() {
    // DOM elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const batchVideoContainer = document.getElementById('batch-video-container');
    const videoBatchList = document.getElementById('video-batch-list');
    const batchVideoCount = document.getElementById('batch-video-count');
    const btnClearVideos = document.getElementById('btn-clear-videos');
    const previewContainer = document.getElementById('preview-container');
    const previewLabel = document.getElementById('preview-label');
    const sourceVideo = document.getElementById('source-video');
    const previewGif = document.getElementById('preview-gif');

    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const gifWidthInput = document.getElementById('gif-width');
    const gifFpsSelect = document.getElementById('gif-fps');

    const btnConvert = document.getElementById('btn-convert');
    const btnConvertAll = document.getElementById('btn-convert-all');
    const btnSelectFile = document.getElementById('btn-select-file');
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    // 상태 변수
    let videoQueue = []; // File 객체 배열
    let selectedIndex = -1; // 현재 미리보기 중인 인덱스

    // 파일 선택 버튼
    btnSelectFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

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
        addVideosToQueue(Array.from(e.dataTransfer.files));
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addVideosToQueue(Array.from(e.target.files));
            fileInput.value = '';
        }
    });

    // 전체 초기화
    if (btnClearVideos) {
        btnClearVideos.addEventListener('click', () => {
            videoQueue = [];
            selectedIndex = -1;
            renderVideoList();
            previewContainer.style.display = 'none';
            if (batchVideoContainer) batchVideoContainer.style.display = 'none';
            btnConvert.setAttribute('disabled', true);
            if (btnConvertAll) btnConvertAll.setAttribute('disabled', true);
            statusText.textContent = '';
            statusInfo.textContent = '';
        });
    }

    /**
     * 큐에 비디오 추가 (유효성 검사, 중복 제거)
     * @param {File[]} files
     */
    function addVideosToQueue(files) {
        files.forEach(file => {
            if (!file.type.startsWith('video/')) return;
            if (file.size > 50 * 1024 * 1024) {
                UIComponents.showErrorDialog('Size Limit', `${file.name} exceeds 50MB limit.`);
                return;
            }
            const isDuplicate = videoQueue.some(f => f.name === file.name && f.size === file.size);
            if (!isDuplicate) videoQueue.push(file);
        });
        renderVideoList();
        if (videoQueue.length > 0) {
            if (batchVideoContainer) batchVideoContainer.style.display = 'block';
            if (btnConvertAll) btnConvertAll.removeAttribute('disabled');
            // 첫 번째 비디오 자동 선택
            if (selectedIndex < 0) selectVideo(0);
        }
    }

    /**
     * 비디오 배치 목록 UI 렌더링
     */
    function renderVideoList() {
        if (!videoBatchList) return;
        videoBatchList.innerHTML = '';
        if (batchVideoCount) batchVideoCount.textContent = `${videoQueue.length} video${videoQueue.length !== 1 ? 's' : ''} selected`;

        videoQueue.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'video-batch-item';
            item.style.cursor = 'pointer';
            if (index === selectedIndex) {
                item.style.borderColor = 'var(--blue-500)';
                item.style.backgroundColor = '#EFF6FF';
            }

            const icon = document.createElement('div');
            icon.className = 'video-batch-item__icon';
            icon.textContent = '\ud83c\udfac';

            const info = document.createElement('div');
            info.className = 'video-batch-item__info';
            info.innerHTML = `
                <div class="video-batch-item__name" title="${file.name}">${file.name}</div>
                <div class="video-batch-item__meta">${(file.size / 1024 / 1024).toFixed(1)} MB</div>
            `;

            const status = document.createElement('span');
            status.className = 'video-batch-item__status video-batch-item__status--pending';
            status.textContent = index === selectedIndex ? '\u25b6 Selected' : 'Waiting';
            status.id = `vstatus-${index}`;

            const removeBtn = document.createElement('button');
            removeBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--slate-400);font-size:16px;padding:0;line-height:1;';
            removeBtn.textContent = '\u00d7';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                videoQueue.splice(index, 1);
                if (selectedIndex === index) { selectedIndex = -1; previewContainer.style.display = 'none'; }
                else if (selectedIndex > index) selectedIndex--;
                renderVideoList();
                if (videoQueue.length === 0) {
                    if (batchVideoContainer) batchVideoContainer.style.display = 'none';
                    btnConvert.setAttribute('disabled', true);
                    if (btnConvertAll) btnConvertAll.setAttribute('disabled', true);
                }
            });

            // 클릭 시 해당 비디오 선택/미리보기
            item.addEventListener('click', () => selectVideo(index));

            item.appendChild(icon);
            item.appendChild(info);
            item.appendChild(status);
            item.appendChild(removeBtn);
            videoBatchList.appendChild(item);
        });
    }

    /**
     * 특정 비디오 로드 및 미리보기
     * @param {number} index
     */
    function selectVideo(index) {
        if (index < 0 || index >= videoQueue.length) return;
        selectedIndex = index;
        const file = videoQueue[index];

        const videoUrl = URL.createObjectURL(file);
        sourceVideo.src = videoUrl;
        if (previewGif) previewGif.style.display = 'none';
        previewContainer.style.display = 'flex';
        if (previewLabel) previewLabel.textContent = `Preview: ${file.name}`;

        sourceVideo.onloadedmetadata = () => {
            const duration = sourceVideo.duration;
            startTimeInput.value = 0;
            endTimeInput.value = Math.min(5, duration).toFixed(1);
            btnConvert.removeAttribute('disabled');
            statusText.textContent = `Selected: ${file.name}`;
            statusInfo.textContent = `Duration: ${duration.toFixed(1)}s`;
        };

        sourceVideo.onerror = () => {
            UIComponents.showErrorDialog('Video Load Error', 'Cannot decode video codec in browser.');
        };

        renderVideoList(); // 하이라이트 갱신
    }

    // 선택된 비디오 변환
    btnConvert.addEventListener('click', () => {
        if (selectedIndex < 0 || selectedIndex >= videoQueue.length) return;
        const statusEl = document.getElementById(`vstatus-${selectedIndex}`);
        convertVideoToGif(videoQueue[selectedIndex], selectedIndex, statusEl);
    });

    // 전체 비디오 변환 (같은 설정 적용)
    if (btnConvertAll) {
        btnConvertAll.addEventListener('click', async () => {
            if (videoQueue.length === 0) return;
            btnConvertAll.setAttribute('disabled', true);
            btnConvert.setAttribute('disabled', true);
            statusText.textContent = `Converting ${videoQueue.length} videos...`;

            for (let i = 0; i < videoQueue.length; i++) {
                await selectVideoAsync(i);
                const statusEl = document.getElementById(`vstatus-${i}`);
                await convertVideoToGif(videoQueue[i], i, statusEl);
            }

            statusText.textContent = `\u2705 All ${videoQueue.length} videos converted!`;
            btnConvertAll.removeAttribute('disabled');
            btnConvert.removeAttribute('disabled');
        });
    }

    /**
     * 비동기 비디오 선택 (메타데이터 로드 대기)
     * @param {number} index
     * @returns {Promise<void>}
     */
    function selectVideoAsync(index) {
        return new Promise((resolve) => {
            selectedIndex = index;
            const file = videoQueue[index];
            const videoUrl = URL.createObjectURL(file);
            sourceVideo.src = videoUrl;
            sourceVideo.onloadedmetadata = () => {
                const duration = sourceVideo.duration;
                endTimeInput.value = Math.min(5, duration).toFixed(1);
                startTimeInput.value = 0;
                renderVideoList();
                resolve();
            };
        });
    }

    /**
     * 비디오 -> GIF 변환 및 다운로드
     * @param {File} file
     * @param {number} index
     * @param {HTMLElement|null} statusEl
     * @returns {Promise<void>}
     */
    function convertVideoToGif(file, index, statusEl) {
        return new Promise((resolve) => {
            if (typeof gifshot === 'undefined') {
                UIComponents.showErrorDialog('Library Error', 'gifshot library not loaded. Please refresh the page.');
                resolve();
                return;
            }

            const start = parseFloat(startTimeInput.value);
            const end = parseFloat(endTimeInput.value);
            const width = parseInt(gifWidthInput.value) || 320;
            const fps = parseInt(gifFpsSelect.value) || 10;

            if (start < 0 || end <= start) {
                UIComponents.showErrorDialog('Invalid Range', 'End time must be greater than start time.');
                resolve();
                return;
            }
            const duration = end - start;
            if (duration > 15) {
                UIComponents.showErrorDialog('Duration Limit', 'Max clip length is 15 seconds to protect browser memory.');
                resolve();
                return;
            }

            if (statusEl) {
                statusEl.className = 'video-batch-item__status video-batch-item__status--processing';
                statusEl.textContent = '\u23f3 Converting...';
            }

            const frameInterval = 1 / fps;
            const totalFrames = Math.ceil(duration * fps);
            const captureTimes = [];
            for (let i = 0; i < totalFrames; i++) captureTimes.push(start + (i * frameInterval));

            const prog = UIComponents.showProgressDialog('Converting Video', `Extracting frames... (0/${totalFrames})`);

            let currentFrameIndex = 0;
            const framesData = [];

            const captureCanvas = document.createElement('canvas');
            const ctx = captureCanvas.getContext('2d');
            let videoRatio = sourceVideo.videoWidth / sourceVideo.videoHeight;
            if (!videoRatio || !isFinite(videoRatio) || videoRatio <= 0) videoRatio = 16 / 9;
            captureCanvas.width = width > 0 ? width : 320;
            captureCanvas.height = Math.round(captureCanvas.width / videoRatio) || 180;

            // 재귀 프레임 캡처
            function captureNextFrame() {
                if (currentFrameIndex >= captureTimes.length) {
                    prog.updateProgress(90, 'Building GIF animation...');
                    gifshot.createGIF({
                        images: framesData,
                        gifWidth: captureCanvas.width,
                        gifHeight: captureCanvas.height,
                        interval: frameInterval,
                        numWorkers: 2,
                        frameDuration: fps
                    }, function(obj) {
                        prog.updateProgress(100, 'Done!');
                        setTimeout(() => {
                            prog.close();
                            if (!obj.error) {
                                if (previewGif) {
                                    previewGif.src = obj.image;
                                    previewGif.style.display = 'block';
                                }
                                const downloadName = file.name.replace(/\.[^.]+$/, '') + '_converted.gif';
                                FileUtils.downloadFile(obj.image, downloadName);
                                if (statusEl) {
                                    statusEl.className = 'video-batch-item__status video-batch-item__status--done';
                                    statusEl.textContent = '\u2713 Done';
                                }
                            } else {
                                if (statusEl) {
                                    statusEl.className = 'video-batch-item__status video-batch-item__status--error';
                                    statusEl.textContent = '\u2717 Error';
                                }
                                UIComponents.showErrorDialog('GIF Error', 'GIF encoder failed.');
                            }
                            resolve();
                        }, 400);
                    });
                    return;
                }

                sourceVideo.currentTime = captureTimes[currentFrameIndex];
                sourceVideo.onseeked = () => {
                    try {
                        ctx.drawImage(sourceVideo, 0, 0, captureCanvas.width, captureCanvas.height);
                        framesData.push(captureCanvas.toDataURL('image/jpeg', 0.9));
                        currentFrameIndex++;
                        const pct = Math.round((currentFrameIndex / totalFrames) * 85);
                        prog.updateProgress(pct, `Extracting frames... (${currentFrameIndex}/${totalFrames})`);
                        captureNextFrame();
                    } catch (err) {
                        prog.close();
                        if (statusEl) {
                            statusEl.className = 'video-batch-item__status video-batch-item__status--error';
                            statusEl.textContent = '\u2717 Error';
                        }
                        let tip = '';
                        if (err.name === 'SecurityError') {
                            tip = ' (CORS error: run via http server, not file://)';
                        }
                        UIComponents.showErrorDialog('Capture Error', `Frame capture failed: ${err.message}${tip}`);
                        resolve();
                    }
                };
            }

            sourceVideo.pause();
            captureNextFrame();
        });
    }
})();

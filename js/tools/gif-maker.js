/**
 * ==========================================================================
 * ConvertFile - GIF Maker Business Logic
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const framesContainer = document.getElementById('frames-container');
    const frameList = document.getElementById('frame-list');
    const previewContainer = document.getElementById('preview-container');
    const previewGif = document.getElementById('preview-gif');
    
    const gifDelayInput = document.getElementById('gif-delay');
    const gifWidthInput = document.getElementById('gif-width');
    const gifHeightInput = document.getElementById('gif-height');
    const btnRender = document.getElementById('btn-render');
    const statusText = document.getElementById('status-text');

    // 2. 상태 변수
    const frameImages = []; // 각 프레임의 Base64 Data URL 목록

    // 3. 파일 로드 이벤트 바인딩 (다중 선택 대응 수동 바인딩)
    if (dropZone) {
        dropZone.addEventListener('dragenter', dragHandler);
        dropZone.addEventListener('dragover', dragHandler);
        dropZone.addEventListener('dragleave', dragHandler);
        dropZone.addEventListener('drop', dropHandler);
        dropZone.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                loadFiles(e.target.files);
            }
        });
    }

    function dragHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            dropZone.classList.add('modern-upload-zone--dragover');
        } else {
            dropZone.classList.remove('modern-upload-zone--dragover');
        }
    }

    function dropHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('modern-upload-zone--dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            loadFiles(files);
        }
    }

    /**
     * 다중 이미지들을 비동기 루프로 차례대로 읽어 들여 프레임 리스트에 적재합니다.
     */
    function loadFiles(files) {
        let loadedCount = 0;
        const total = files.length;
        
        const checkRenderState = () => {
            loadedCount++;
            if (loadedCount === total) {
                renderFrameList();
                statusText.textContent = `총 ${frameImages.length}개의 프레임이 로드되었습니다.`;
            }
        };

        for (let i = 0; i < total; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;

            const reader = new FileReader();
            reader.onload = function(e) {
                frameImages.push(e.target.result);
                checkRenderState();
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * 현재 프레임 배열 상태에 따라 UI 리스트 썸네일을 동적으로 생성합니다.
     */
    function renderFrameList() {
        if (frameImages.length === 0) {
            framesContainer.style.display = 'none';
            btnRender.setAttribute('disabled', 'true');
            return;
        }

        framesContainer.style.display = 'block';
        frameList.innerHTML = "";

        frameImages.forEach((src, idx) => {
            const item = document.createElement('div');
            item.className = 'modern-frame-item';
            item.innerHTML = `
                <div class="modern-frame-item__badge">#${idx + 1}</div>
                <button class="modern-frame-item__remove" data-index="${idx}">X</button>
                <img src="${src}">
                <div class="modern-frame-item__delay">${gifDelayInput.value} ms</div>
            `;
            frameList.appendChild(item);
        });

        // 프레임이 2개 이상일 때만 GIF 인코딩 가능
        if (frameImages.length >= 2) {
            btnRender.removeAttribute('disabled');
        } else {
            btnRender.setAttribute('disabled', 'true');
        }

        // 프레임 삭제 이벤트 위임 바인딩
        const removeButtons = frameList.querySelectorAll('.modern-frame-item__remove');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const removeIdx = parseInt(e.target.getAttribute('data-index'));
                frameImages.splice(removeIdx, 1); // 배열에서 제외
                renderFrameList();
                statusText.textContent = `프레임이 제거되었습니다. 남은 프레임: ${frameImages.length}개`;
            });
        });
    }

    // 지연 시간 일괄 필드 수치 변경 시 목록 레이블 업데이트
    gifDelayInput.addEventListener('change', () => {
        const delays = frameList.querySelectorAll('.modern-frame-item__delay');
        delays.forEach(el => {
            el.textContent = `${gifDelayInput.value} ms`;
        });
    });

    // 4. GIFshot 인코더 호출 및 애니메이션 빌딩 실행
    btnRender.addEventListener('click', () => {
        if (frameImages.length < 2) return;

        // gifshot 라이브러리 안전성 검증
        if (typeof gifshot === 'undefined') {
            UIComponents.showErrorDialog("Library Load Fail", "GIF 생성 인코더(gifshot)를 발견하지 못했습니다. 인터넷 연결이 원활한지 확인한 후 페이지를 새로고침해 주십시오.");
            return;
        }

        const delayMs = parseInt(gifDelayInput.value) || 200;
        const width = parseInt(gifWidthInput.value) || 320;
        const height = parseInt(gifHeightInput.value) || 240;

        // 연두색 XP 진행률 다이얼로그 호출
        const prog = UIComponents.showProgressDialog("움짤 GIF 애니메이션 생성 중", "각 프레임 비트맵 규격 픽셀 변환 연산을 기동하고 있습니다...");

        setTimeout(() => {
            try {
                prog.updateProgress(30, "Web Worker 비동기 코어 엔진 할당 중...");
                
                // gifshot API 호출
                gifshot.createGIF({
                    images: frameImages,
                    gifWidth: width,
                    gifHeight: height,
                    interval: delayMs / 1000, // ms를 초 단위로 변환 (예: 200ms -> 0.2초)
                    numFrames: frameImages.length,
                    keepCameraOn: false,
                    progressCallback: function(captureProgress) {
                        // gifshot이 진행률을 0 ~ 1 사이의 소수로 알려줌
                        const pct = 30 + Math.round(captureProgress * 60);
                        prog.updateProgress(pct, `인코더 조립 연산 중 (${Math.round(captureProgress * 100)}%)...`);
                    }
                }, function(obj) {
                    if (obj.error) {
                        prog.close();
                        UIComponents.showErrorDialog("GIF Coding Exception", `인코딩 실패: ${obj.errorMsg}`);
                        return;
                    }

                    prog.updateProgress(95, "움짤 생성 완료! 뷰바인딩 대기...");

                    const base64Gif = obj.image;
                    
                    // 프리뷰 업데이트
                    previewContainer.style.display = 'flex';
                    previewGif.src = base64Gif;

                    // 스크롤 포커스 아래로 스크롤
                    previewContainer.scrollIntoView({ behavior: 'smooth' });

                    prog.updateProgress(100, "조립 완수!");
                    
                    // 다운로드 즉시 실행 가능하도록 가상화 이벤트 맵핑
                    setTimeout(() => {
                        prog.close();
                        statusText.textContent = "GIF 애니메이션 생성이 성공적으로 완료되었습니다.";
                        
                        // 결과 base64 데이터를 Blob으로 변환하여 안전하게 저장
                        saveGeneratedGif(base64Gif);
                    }, 450);
                });

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("GIF Engine Crash", `엔진 기동 예외: ${err.message}`);
            }
        }, 300);
    });

    /**
     * 인코딩 완료된 base64 GIF 소스를 바이너리 블롭으로 변환해 사용자 디스크 다운로드를 개시합니다.
     */
    function saveGeneratedGif(base64Data) {
        // "data:image/gif;base64,xxxx" 포맷 파싱
        const split = base64Data.split(',');
        const contentType = split[0].split(':')[1].split(';')[0];
        const raw = window.atob(split[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        const gifBlob = new Blob([uInt8Array], { type: contentType });
        
        // 다운로드 개시
        FileUtils.downloadBlob(gifBlob, "animation.gif");
    }
})();

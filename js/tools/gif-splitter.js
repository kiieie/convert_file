/**
 * ==========================================================================
 * ConvertFile - GIF Splitter Business Logic (gif-splitter.js)
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const framesGrid = document.getElementById('frames-grid');
    const frameCountVal = document.getElementById('frame-count-val');
    const btnSplit = document.getElementById('btn-split');
    const statusText = document.getElementById('status-text');

    // 2. 상태 변수
    let rawFile = null;
    let gifFrames = []; // gifuct-js 프레임 결과 객체들
    const pngFrameUrls = []; // 변환된 개별 png data url들

    // 3. 파일 업로드 수동 연동 ( ArrayBuffer 파싱 전용 )
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
                processGifFile(e.target.files[0]);
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
            processGifFile(files[0]);
        }
    }

    /**
     * GIF 파일을 파싱하고 개별 프레임 PNG로 스플리팅합니다.
     */
    function processGifFile(file) {
        if (!file.name.endsWith('.gif') && file.type !== 'image/gif') {
            UIComponents.showErrorDialog("GIF Format Constraint", "오직 애니메이션 GIF(.gif) 파일만 업로드할 수 있습니다.");
            return;
        }

        rawFile = file;
        gifFrames = [];
        pngFrameUrls.length = 0;

        const prog = UIComponents.showProgressDialog("GIF 바이너리 해독 중", "Lzw 압축 세그먼트를 캔버스 화소로 복원하고 있습니다...");

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                prog.updateProgress(30, "GIF 프레임 디스크립터 파싱 중...");
                
                // gifuct-js로 GIF 해독
                const gifReader = new window.GIF(e.target.result);
                gifFrames = gifReader.decompressFrames(true);

                if (gifFrames.length === 0) {
                    throw new Error("분할할 프레임을 찾을 수 없습니다.");
                }

                prog.updateProgress(65, "프레임 비트맵 PNG 렌더링 중...");

                // 프레임 캔버스 드로잉 & PNG 변환 루프
                // GIF는 각 프레임이 이전 프레임의 델타(변화량) 패치만 가지는 구조일 수 있으므로 누적 도화지 필요
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 첫 프레임의 크기로 마스터 캔버스 설정
                const width = gifFrames[0].dims.width;
                const height = gifFrames[0].dims.height;
                canvas.width = width;
                canvas.height = height;

                // 프레임 썸네일 그리드 청소
                framesGrid.innerHTML = "";

                gifFrames.forEach((frame, idx) => {
                    const dims = frame.dims;
                    
                    // 프레임 복원 드로잉 (오프셋 맵핑)
                    // frame.patch는 RGBA 픽셀 배열입니다.
                    const frameImageData = ctx.createImageData(dims.width, dims.height);
                    frameImageData.data.set(frame.patch);
                    
                    // 임시 캔버스에 패치 드로잉
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = dims.width;
                    tempCanvas.height = dims.height;
                    tempCanvas.getContext('2d').putImageData(frameImageData, 0, 0);

                    // 마스터 누적 캔버스에 델타 패치 적용
                    // Disposal method에 따라 지워야 하지만 일반적인 클론 분할에서는 누적으로 충분함
                    ctx.drawImage(tempCanvas, dims.left, dims.top);

                    // PNG URL 화
                    const pngUrl = canvas.toDataURL('image/png');
                    pngFrameUrls.push(pngUrl);

                    // 화면 썸네일 노출
                    const thumb = document.createElement('div');
                    thumb.className = 'modern-frame-thumb';
                    thumb.innerHTML = `
                        <img src="${pngUrl}">
                        <div class="modern-frame-thumb__label">#${idx + 1} (${frame.delay}ms)</div>
                    `;
                    framesGrid.appendChild(thumb);
                });

                prog.updateProgress(90, "UI 뷰바인딩 업데이트 중...");

                // UI 스위칭
                dropZone.style.display = 'none';
                previewContainer.style.display = 'flex';
                frameCountVal.textContent = `${gifFrames.length} Frames`;
                btnSplit.removeAttribute('disabled');

                prog.updateProgress(100, "분석 완료!");
                
                setTimeout(() => {
                    prog.close();
                    statusText.textContent = `성공: 총 ${gifFrames.length}개의 프레임을 추출했습니다.`;
                }, 300);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Split Fail", `GIF 디코딩 오류: ${err.message}`);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // 4. ZIP 압축 파일 저장 이벤트
    btnSplit.addEventListener('click', () => {
        if (pngFrameUrls.length === 0) return;

        const prog = UIComponents.showProgressDialog("ZIP 파일 압축 중", "디코딩 완료된 PNG 프레임 스트림을 패킹하고 있습니다...");
        
        setTimeout(() => {
            try {
                const zip = new JSZip();
                
                pngFrameUrls.forEach((url, idx) => {
                    // "data:image/png;base64,xxxx" 에서 헤더 제거
                    const base64Data = url.split(',')[1];
                    zip.file(`frame_${(idx + 1).toString().padStart(3, '0')}.png`, base64Data, { base64: true });
                });

                prog.updateProgress(75, "ZIP 바이너리 해시 빌딩 중...");

                zip.generateAsync({ type: 'blob' }).then(function(content) {
                    const downloadName = FileUtils.getDownloadName(rawFile.name, '_frames', 'zip');
                    
                    // 파일 다운로드
                    FileUtils.downloadBlob(content, downloadName);
                    
                    prog.updateProgress(100, "패킹 다운로드 완료!");
                    
                    setTimeout(() => {
                        prog.close();
                    }, 400);
                });

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("ZIP Packaging Failed", `압축 중 예외 발생: ${err.message}`);
            }
        }, 200);
    });
})();

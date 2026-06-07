/**
 * ==========================================================================
 * ConvertFile - GIF Speed & Reverse Business Logic (gif-speed.js)
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewGif = document.getElementById('preview-gif');
    
    const gifSpeed = document.getElementById('gif-speed');
    const speedVal = document.getElementById('speed-val');
    const gifReverse = document.getElementById('gif-reverse');
    const btnApply = document.getElementById('btn-apply');
    const statusText = document.getElementById('status-text');

    // 2. 상태 변수
    let rawFile = null;
    let decodedFrames = []; // { canvas, delay }

    // 3. 파일 업로드 수동 연동
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
     * GIF 파일 바이너리를 디코딩하여 메모리에 프레임 비트맵 배열로 변환 적재합니다.
     */
    function processGifFile(file) {
        if (!file.name.endsWith('.gif') && file.type !== 'image/gif') {
            UIComponents.showErrorDialog("GIF Format Constraint", "오직 GIF 애니메이션 파일만 지원됩니다.");
            return;
        }

        rawFile = file;
        decodedFrames = [];

        const prog = UIComponents.showProgressDialog("GIF 움짤 디코딩 중", "개별 장면 프레임들의 재생 타임라인 및 화소 데이터를 스캔하고 있습니다...");

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                prog.updateProgress(30, "GIF 내부 프레임 파싱 중...");
                
                // gifuct-js 활용해 프레임 분해
                const gifReader = new window.GIF(e.target.result);
                const rawFrames = gifReader.decompressFrames(true);

                if (rawFrames.length === 0) {
                    throw new Error("분할할 프레임 정보가 없습니다.");
                }

                prog.updateProgress(70, "프레임 비트맵 데이터 복원 중...");

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const width = rawFrames[0].dims.width;
                const height = rawFrames[0].dims.height;
                canvas.width = width;
                canvas.height = height;

                rawFrames.forEach(frame => {
                    const dims = frame.dims;
                    const frameImageData = ctx.createImageData(dims.width, dims.height);
                    frameImageData.data.set(frame.patch);
                    
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = dims.width;
                    tempCanvas.height = dims.height;
                    tempCanvas.getContext('2d').putImageData(frameImageData, 0, 0);

                    // 누적 드로잉
                    ctx.drawImage(tempCanvas, dims.left, dims.top);

                    // 캔버스 복제
                    const frameCanvas = document.createElement('canvas');
                    frameCanvas.width = width;
                    frameCanvas.height = height;
                    frameCanvas.getContext('2d').drawImage(canvas, 0, 0);

                    decodedFrames.push({
                        canvas: frameCanvas,
                        delay: frame.delay
                    });
                });

                prog.updateProgress(95, "UI 바인딩 갱신 중...");

                // 업로드 뷰 전환
                dropZone.style.display = 'none';
                previewContainer.style.display = 'flex';
                previewGif.src = URL.createObjectURL(file); // 원본 우선 로드
                
                gifSpeed.removeAttribute('disabled');
                gifReverse.removeAttribute('disabled');
                btnApply.removeAttribute('disabled');

                prog.updateProgress(100, "분석 완료!");
                
                setTimeout(() => {
                    prog.close();
                    statusText.textContent = `불러온 파일: ${file.name} (총 ${decodedFrames.length} 프레임)`;
                }, 300);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Parser Exception", `GIF 분석 실패: ${err.message}`);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // 슬라이더 배속 변경 시 수치 라벨 갱신
    gifSpeed.addEventListener('input', (e) => {
        speedVal.textContent = parseFloat(e.target.value).toFixed(2);
    });

    // 4. 배속/역재생 가공 실행 및 인코딩
    btnApply.addEventListener('click', () => {
        if (decodedFrames.length === 0) return;

        const speed = parseFloat(gifSpeed.value);
        const reverse = gifReverse.checked;

        const prog = UIComponents.showProgressDialog("움짤 가공 처리 중", "장면 재생 순서 재정렬 및 배속 딜레이 연산을 가동 중입니다...");

        setTimeout(() => {
            try {
                prog.updateProgress(20, "배속 및 시퀀스 재배열 중...");

                // 역재생 여부에 따라 프레임 배열 뒤집기
                const processedFrames = reverse ? [...decodedFrames].reverse() : [...decodedFrames];
                
                const targetFrames = [];
                const originalWidth = decodedFrames[0].canvas.width;
                const originalHeight = decodedFrames[0].canvas.height;

                processedFrames.forEach((frame) => {
                    // 배속 역비례하여 재생 딜레이 재연산 (배속이 높을수록 딜레이는 짧아져야 함)
                    // 최소 딜레이 40ms 제한 (브라우저 연산 안전성 한계)
                    const newDelay = Math.max(40, Math.round(frame.delay / speed));
                    
                    targetFrames.push({
                        image: frame.canvas.toDataURL('image/png'),
                        delay: newDelay
                    });
                });

                prog.updateProgress(50, "GIF 움짤 합치기 인코딩 중...");

                // gifshot으로 GIF 빌딩
                gifshot.createGIF({
                    images: targetFrames.map(f => f.image),
                    gifWidth: originalWidth,
                    gifHeight: originalHeight,
                    interval: (targetFrames[0].delay || 100) / 1000,
                    numFrames: targetFrames.length,
                    keepCameraOn: false,
                    progressCallback: function(captureProgress) {
                        const pct = 50 + Math.round(captureProgress * 40);
                        prog.updateProgress(pct, `인코더 조립 연산 중 (${Math.round(captureProgress * 100)}%)...`);
                    }
                }, function(obj) {
                    if (obj.error) {
                        prog.close();
                        UIComponents.showErrorDialog("GIF Speed Exception", `인코딩 실패: ${obj.errorMsg}`);
                        return;
                    }

                    prog.updateProgress(95, "가공 완료! 결과 파일 쓰는 중...");

                    const base64Gif = obj.image;
                    previewGif.src = base64Gif; // 미리보기 교체

                    // 다운로드용 바이트 슬라이싱 실행
                    saveSpeedModifiedGif(base64Gif);

                    prog.updateProgress(100, "작업 완료!");
                    
                    setTimeout(() => {
                        prog.close();
                        statusText.textContent = "속도 및 방향 변경 완료! 새 파일이 생성되어 저장되었습니다.";
                    }, 400);
                });

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Speed Modify Failed", `에러: ${err.message}`);
            }
        }, 300);
    });

    /**
     * base64 데이터를 Blob으로 변환하여 저장합니다.
     */
    function saveSpeedModifiedGif(base64Data) {
        const split = base64Data.split(',');
        const contentType = split[0].split(':')[1].split(';')[0];
        const raw = window.atob(split[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        const gifBlob = new Blob([uInt8Array], { type: contentType });
        
        // 접미사 구성
        const speed = parseFloat(gifSpeed.value);
        const reverse = gifReverse.checked;
        const suffix = `_speed_${speed}x${reverse ? '_reversed' : ''}`;
        
        const dlName = FileUtils.getDownloadName(rawFile.name, suffix);
        
        FileUtils.downloadBlob(gifBlob, dlName);
    }
})();

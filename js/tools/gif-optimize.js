/**
 * ==========================================================================
 * ConvertFile - GIF Optimizer Business Logic (gif-optimize.js)
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewGif = document.getElementById('preview-gif');
    
    const optimizeModeSelect = document.getElementById('optimize-mode');
    const btnOptimize = document.getElementById('btn-optimize');
    const statusText = document.getElementById('status-text');

    // 2. 상태 변수
    let rawFile = null;
    let decodedFrames = []; // { canvas, delay } 객체 배열

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

        const prog = UIComponents.showProgressDialog("GIF 최적화 준비 중", "바이너리에서 이미지 장면에 들어있는 프레임 화소들을 추출하고 있습니다...");

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                prog.updateProgress(30, "GIF 내부 프레임 파싱 중...");
                
                // gifuct-js 활용해 프레임 분해
                const gifReader = new window.GIF(e.target.result);
                const rawFrames = gifReader.decompressFrames(true);

                if (rawFrames.length === 0) {
                    throw new Error("최적화 가능한 프레임 정보가 없습니다.");
                }

                prog.updateProgress(70, "프레임 비트맵 데이터 캔버스화 작업 중...");

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

                    // 각 프레임별로 크기가 복원된 새로운 Canvas를 복제해서 배열에 누적
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
                previewGif.src = URL.createObjectURL(file); // 우선 원본 로드
                
                optimizeModeSelect.removeAttribute('disabled');
                btnOptimize.removeAttribute('disabled');

                prog.updateProgress(100, "분석 완료!");
                
                setTimeout(() => {
                    prog.close();
                    statusText.textContent = `불러온 파일: ${file.name} (총 ${decodedFrames.length} 프레임)`;
                }, 300);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Parser Exception", `GIF 최적화 분석 실패: ${err.message}`);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // 4. 최적화 압축 및 재인코딩 구동
    btnOptimize.addEventListener('click', () => {
        if (decodedFrames.length === 0) return;

        const mode = optimizeModeSelect.value;
        const prog = UIComponents.showProgressDialog("GIF 압축 최적화 진행 중", "최적화 필터 가동 및 LZW 인코딩을 준비하고 있습니다...");

        setTimeout(() => {
            try {
                prog.updateProgress(20, "최적화 필터 적용 중...");

                let targetFrames = []; // { imageSrc, delay }

                // 프레임 원본 정보 추출
                const originalWidth = decodedFrames[0].canvas.width;
                const originalHeight = decodedFrames[0].canvas.height;
                let targetWidth = originalWidth;
                let targetHeight = originalHeight;

                if (mode === 'drop2') {
                    // 홀수 프레임만 스킵하여 재생 딜레이를 2배로 계산 (재생 속도 싱크 보존)
                    decodedFrames.forEach((frame, idx) => {
                        if (idx % 2 === 0) {
                            targetFrames.push({
                                image: frame.canvas.toDataURL('image/png'),
                                delay: frame.delay * 2 // 재생 속도 동기화용 2배 보정
                            });
                        }
                    });
                } else {
                    // 해상도 비율 스케일링 (80% 또는 60%)
                    const scaleFactor = mode === 'scale80' ? 0.8 : 0.6;
                    targetWidth = Math.round(originalWidth * scaleFactor);
                    targetHeight = Math.round(originalHeight * scaleFactor);

                    decodedFrames.forEach((frame) => {
                        // 스케일링된 임시 캔버스 생성
                        const scaledCanvas = document.createElement('canvas');
                        scaledCanvas.width = targetWidth;
                        scaledCanvas.height = targetHeight;
                        scaledCanvas.getContext('2d').drawImage(frame.canvas, 0, 0, targetWidth, targetHeight);

                        targetFrames.push({
                            image: scaledCanvas.toDataURL('image/png'),
                            delay: frame.delay
                        });
                    });
                }

                prog.updateProgress(50, "움짤 프레임 재결합 및 압축 인코딩 중...");

                // gifshot으로 GIF 빌딩 시작
                gifshot.createGIF({
                    images: targetFrames.map(f => f.image),
                    gifWidth: targetWidth,
                    gifHeight: targetHeight,
                    interval: (targetFrames[0].delay || 100) / 1000, // 초 단위 변환
                    numFrames: targetFrames.length,
                    keepCameraOn: false,
                    progressCallback: function(captureProgress) {
                        const pct = 50 + Math.round(captureProgress * 40);
                        prog.updateProgress(pct, `인코더 조립 연산 중 (${Math.round(captureProgress * 100)}%)...`);
                    }
                }, function(obj) {
                    if (obj.error) {
                        prog.close();
                        UIComponents.showErrorDialog("GIF Re-Encoding Failed", `인코딩 실패: ${obj.errorMsg}`);
                        return;
                    }

                    prog.updateProgress(95, "압축 완료! 결과 파일 내보내기 중...");

                    const base64Gif = obj.image;
                    previewGif.src = base64Gif; // 미리보기 교체

                    // 다운로드용 바이트 슬라이싱 실행
                    saveOptimizedGif(base64Gif);

                    prog.updateProgress(100, "작업 성공!");
                    
                    setTimeout(() => {
                        prog.close();
                        statusText.textContent = "최적화 압축 완료! 새 파일이 생성되어 저장되었습니다.";
                    }, 400);
                });

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Optimization Failed", `에러: ${err.message}`);
            }
        }, 300);
    });

    /**
     * base64 데이터를 Blob으로 변환하여 저장합니다.
     */
    function saveOptimizedGif(base64Data) {
        const split = base64Data.split(',');
        const contentType = split[0].split(':')[1].split(';')[0];
        const raw = window.atob(split[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        const gifBlob = new Blob([uInt8Array], { type: contentType });
        const dlName = FileUtils.getDownloadName(rawFile.name, '_optimized');
        
        FileUtils.downloadBlob(gifBlob, dlName);
    }
})();

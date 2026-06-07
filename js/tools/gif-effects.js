/**
 * ==========================================================================
 * ConvertFile - GIF Effects and Captions Business Logic (gif-effects.js)
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const sourceGifImg = document.getElementById('source-gif-img');
    const resultGifImg = document.getElementById('result-gif-img');

    const captionText = document.getElementById('caption-text');
    const captionSize = document.getElementById('caption-size');
    const captionColor = document.getElementById('caption-color');
    const captionPosition = document.getElementById('caption-position');
    const captionOutline = document.getElementById('caption-outline');

    const filterType = document.getElementById('filter-type');

    const watermarkInput = document.getElementById('watermark-input');
    const watermarkOpacity = document.getElementById('watermark-opacity');
    const watermarkPosition = document.getElementById('watermark-position');

    const btnRunEffects = document.getElementById('btn-run-effects');

    // 2. 상태 변수
    let gifFile = null;
    let gifWidth = 0;
    let gifHeight = 0;
    let originalFrames = [];     // 파싱된 오리지널 프레임 데이터 [{patchCanvas, delay, left, top}]
    let watermarkImg = null;     // 업로드된 워터마크 이미지 홀더

    // 3. GIF 파일 업로드 바인딩
    dropZone.addEventListener('click', () => fileInput.click());

    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.borderColor = 'var(--blue-600)';
            dropZone.style.backgroundColor = '#EFF6FF';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.borderColor = 'var(--blue-500)';
            dropZone.style.backgroundColor = 'var(--slate-50)';
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) loadGifFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) loadGifFile(e.target.files[0]);
    });

    // GIF 파일 로드 및 프레임 분해
    function loadGifFile(file) {
        // gifuct-js 라이브러리 안전성 검증
        if (typeof GIF === 'undefined') {
            UIComponents.showErrorDialog("Library Load Fail", "GIF 구조 분석 인코더(gifuct-js)를 로드하지 못했습니다. 인터넷 연결 상태를 확인 후 페이지를 새로고침하십시오.");
            return;
        }

        if (file.type !== 'image/gif' && !file.name.endsWith('.gif')) {
            UIComponents.showErrorDialog("Invalid File Format", "움짤 GIF 파일만 사용하실 수 있습니다.");
            return;
        }

        if (file.size > 30 * 1024 * 1024) {
            UIComponents.showErrorDialog("Size Limit Exceeded", "GIF 파일 용량이 30MB를 초과하여 변환할 수 없습니다.");
            return;
        }

        gifFile = file;
        const fileUrl = URL.createObjectURL(file);
        
        // 미리보기 레이아웃 갱신
        sourceGifImg.src = fileUrl;
        dropZone.style.display = 'none';
        previewContainer.style.display = 'flex';
        resultGifImg.style.display = 'none';

        const prog = UIComponents.showProgressDialog(
            "GIF 구조 파싱 중",
            "바이너리에서 압축 해제된 이미지 프레임을 추출하고 있습니다..."
        );

        const fileReader = new FileReader();
        fileReader.onload = function() {
            const arrayBuffer = this.result;

            setTimeout(() => {
                try {
                    // gifuct-js 활용해 프레임 추출
                    const gif = new GIF(arrayBuffer);
                    const frames = gif.decompressFrames(true);
                    
                    if (frames.length === 0) {
                        throw new Error("추출된 프레임이 존재하지 않습니다.");
                    }

                    // GIF 캔버스 규격 확보
                    gifWidth = gif.lsd.width;
                    gifHeight = gif.lsd.height;

                    originalFrames = [];

                    // 각 프레임별 patch Canvas 생성해 캐싱
                    for (let i = 0; i < frames.length; i++) {
                        const frame = frames[i];
                        
                        const patchCanvas = document.createElement('canvas');
                        patchCanvas.width = frame.dims.width;
                        patchCanvas.height = frame.dims.height;
                        const patchCtx = patchCanvas.getContext('2d');
                        
                        const patchData = patchCtx.createImageData(frame.dims.width, frame.dims.height);
                        patchData.data.set(frame.patch);
                        patchCtx.putImageData(patchData, 0, 0);

                        originalFrames.push({
                            patchCanvas: patchCanvas,
                            delay: frame.delay,
                            left: frame.dims.left,
                            top: frame.dims.top,
                            disposalMethod: frame.disposalMethod
                        });
                    }

                    prog.updateProgress(100, "추출 완료!");

                    // UI 컨트롤 활성화
                    captionText.removeAttribute('disabled');
                    captionSize.removeAttribute('disabled');
                    captionColor.removeAttribute('disabled');
                    captionPosition.removeAttribute('disabled');
                    captionOutline.removeAttribute('disabled');
                    filterType.removeAttribute('disabled');
                    watermarkInput.removeAttribute('disabled');
                    watermarkOpacity.removeAttribute('disabled');
                    watermarkPosition.removeAttribute('disabled');
                    btnRunEffects.removeAttribute('disabled');

                    setTimeout(() => prog.close(), 300);

                } catch (err) {
                    prog.close();
                    UIComponents.showErrorDialog("GIF Decode Fail", `GIF 파일을 파싱하지 못했습니다: ${err.message}`);
                }
            }, 100);
        };
        fileReader.readAsArrayBuffer(file);
    }

    // 워터마크 이미지 파일 선택기 바인딩
    watermarkInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    watermarkImg = img;
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // ==========================================================================
    // GIF 변환 및 합성 처리 엔진
    // ==========================================================================
    btnRunEffects.addEventListener('click', () => {
        if (originalFrames.length === 0) return;

        // gifshot 라이브러리 안전성 검증
        if (typeof gifshot === 'undefined') {
            UIComponents.showErrorDialog("Library Load Fail", "GIF 생성 인코더(gifshot)를 발견하지 못했습니다. 인터넷 연결이 원활한지 확인한 후 페이지를 새로고침해 주십시오.");
            return;
        }

        const prog = UIComponents.showProgressDialog(
            "GIF 합성 이행 중",
            "자막 및 필터 효과를 각 프레임에 일괄 코팅하는 중..."
        );

        setTimeout(async () => {
            try {
                const processedFrames = [];
                const delays = [];

                // 각 프레임 합성용 공용 가상 캔버스
                const renderCanvas = document.createElement('canvas');
                renderCanvas.width = gifWidth;
                renderCanvas.height = gifHeight;
                const ctx = renderCanvas.getContext('2d');

                const filter = filterType.value;
                const caption = captionText.value.trim();
                const fontSize = parseInt(captionSize.value);
                const fontColor = captionColor.value;
                const position = captionPosition.value;
                const outline = captionOutline.checked;

                const wmOpacity = parseFloat(watermarkOpacity.value);
                const wmPosition = watermarkPosition.value;

                // 프레임 순회 합성 루프
                for (let i = 0; i < originalFrames.length; i++) {
                    const frame = originalFrames[i];

                    // disposalMethod 대응 (보통 2일 때 지워야 하나, 덧그림으로 우회 처리)
                    if (frame.disposalMethod === 2) {
                        ctx.clearRect(0, 0, gifWidth, gifHeight);
                    }

                    // 1단계: 캔버스에 프레임 그리기
                    ctx.drawImage(frame.patchCanvas, frame.left, frame.top);

                    // 2단계: 임시 캔버스를 하나 만들어 필터만 적용 (filter 속성은 drawImage를 통해 먹히므로)
                    const filterCanvas = document.createElement('canvas');
                    filterCanvas.width = gifWidth;
                    filterCanvas.height = gifHeight;
                    const fCtx = filterCanvas.getContext('2d');

                    if (filter !== 'none') {
                        if (filter === 'grayscale') fCtx.filter = 'grayscale(100%)';
                        else if (filter === 'sepia') fCtx.filter = 'sepia(100%)';
                        else if (filter === 'invert') fCtx.filter = 'invert(100%)';
                        else if (filter === 'blur') fCtx.filter = 'blur(2px)';
                    }
                    fCtx.drawImage(renderCanvas, 0, 0);

                    // 3단계: 자막 자국 합성 (filterCanvas 위에 자막 합성)
                    if (caption) {
                        fCtx.font = `bold ${fontSize}px sans-serif`;
                        fCtx.textAlign = 'center';
                        fCtx.textBaseline = 'middle';

                        let textX = gifWidth / 2;
                        let textY = gifHeight - (fontSize * 1.5); // 기본 bottom

                        if (position === 'top') {
                            textY = fontSize * 1.5;
                        } else if (position === 'center') {
                            textY = gifHeight / 2;
                        }

                        // 가독성을 위한 아웃라인
                        if (outline) {
                            fCtx.strokeStyle = '#000000';
                            fCtx.lineWidth = 4;
                            fCtx.strokeText(caption, textX, textY);
                        }

                        fCtx.fillStyle = fontColor;
                        fCtx.fillText(caption, textX, textY);
                    }

                    // 4단계: 워터마크 이미지 추가
                    if (watermarkImg) {
                        fCtx.save();
                        fCtx.globalAlpha = wmOpacity;

                        // 워터마크 크기 축소 스케일링 (가로 폭의 25% 이내로 유지)
                        const wmScale = (gifWidth * 0.25) / watermarkImg.width;
                        const wmW = watermarkImg.width * wmScale;
                        const wmH = watermarkImg.height * wmScale;

                        let wmX = gifWidth - wmW - 10; // 기본 bottom-right
                        let wmY = gifHeight - wmH - 10;

                        if (wmPosition === 'top-left') {
                            wmX = 10;
                            wmY = 10;
                        } else if (wmPosition === 'center') {
                            wmX = (gifWidth - wmW) / 2;
                            wmY = (gifHeight - wmH) / 2;
                        }

                        fCtx.drawImage(watermarkImg, wmX, wmY, wmW, wmH);
                        fCtx.restore();
                    }

                    // 가공된 이미지 수집
                    processedFrames.push(filterCanvas.toDataURL('image/jpeg', 0.95));
                    delays.push(frame.delay / 1000); // gifshot은 초 단위 딜레이 수용
                }

                prog.updateProgress(80, "GIF 인코더를 가동하여 바이너리 묶음을 결합하고 있습니다...");

                // gifshot 비동기 빌드 호출
                gifshot.createGIF({
                    images: processedFrames,
                    gifWidth: gifWidth,
                    gifHeight: gifHeight,
                    imagesGiftDelays: delays,
                    numWorkers: 2
                }, function(obj) {
                    prog.updateProgress(100, "완료!");

                    setTimeout(() => {
                        prog.close();
                        if (!obj.error) {
                            // 결과 화면 로드
                            resultGifImg.src = obj.image;
                            resultGifImg.style.display = 'block';
                            sourceGifImg.style.display = 'none';
                            resultGifImg.scrollIntoView({ behavior: 'smooth' });

                            // 다이렉트 브라우저 다운로드
                            const downloadName = FileUtils.getDownloadName(gifFile.name, '_effects', 'gif');
                            FileUtils.downloadFile(obj.image, downloadName);
                        } else {
                            UIComponents.showErrorDialog("Encoder Exception", "GIF 파일 합성 생성 도중 장애가 발견되었습니다.");
                        }
                    }, 400);
                });

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Effects Fail", `가공 과정 중 예외가 발생했습니다: ${err.message}`);
            }
        }, 100);
    });
})();

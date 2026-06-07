/**
 * ==========================================================================
 * ConvertFile - Image Resizer Business Logic
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 핸들
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewCanvas = document.getElementById('preview-canvas');
    
    // 조작 컴포넌트들
    const resizeModeRadios = document.querySelectorAll('input[name="resize-mode"]');
    const pixelForm = document.getElementById('pixel-form');
    const percentForm = document.getElementById('percent-form');
    
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const aspectRatioCheckbox = document.getElementById('aspect-ratio');
    
    const percentSlider = document.getElementById('resize-percent');
    const percentVal = document.getElementById('percent-val');
    
    const interpolationFilter = document.getElementById('interpolation-filter');
    const outputFormat = document.getElementById('output-format');
    const btnResize = document.getElementById('btn-resize');
    
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    // 2. 상태 변수
    let originalImage = null; // HTMLImageElement
    let fileMeta = null;      // name, size, type, width, height
    let targetWidth = 0;
    let targetHeight = 0;

    // 3. 파일 업로드 리스너 바인딩
    ImageLoader.bind(
        dropZone, 
        fileInput, 
        function(img, meta) {
            // 성공 콜백
            originalImage = img;
            fileMeta = meta;
            
            // UI 컨트롤 활성화 및 노출
            enableControls();
            
            // 입력 폼에 초기 크기 바인딩
            targetWidth = meta.width;
            targetHeight = meta.height;
            widthInput.value = targetWidth;
            heightInput.value = targetHeight;
            
            // 프리뷰 컨테이너 업데이트
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';
            
            // 프리뷰 캔버스에 이미지 일단 그리기
            drawPreview(img);
            
            // 상태 표시줄 업데이트
            statusText.textContent = `불러온 파일: ${meta.name}`;
            statusInfo.textContent = `${meta.width} x ${meta.height} (${FileUtils.formatBytes(meta.size)})`;
        }, 
        function(errorMsg) {
            // 에러 콜백
            UIComponents.showErrorDialog("File Open Error", errorMsg);
        }
    );

    // 4. 모드 토글 (Pixel vs Percent)
    resizeModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'pixel') {
                pixelForm.style.display = 'block';
                percentForm.style.display = 'none';
                updateDimensionsFromPixelInputs();
            } else {
                pixelForm.style.display = 'none';
                percentForm.style.display = 'block';
                updateDimensionsFromPercentSlider();
            }
        });
    });

    // 가로/세로 픽셀 입력 수치 변경 시
    widthInput.addEventListener('input', () => {
        if (!originalImage) return;
        targetWidth = parseInt(widthInput.value) || 0;
        if (aspectRatioCheckbox.checked && targetWidth > 0) {
            const ratio = fileMeta.height / fileMeta.width;
            targetHeight = Math.round(targetWidth * ratio);
            heightInput.value = targetHeight;
        }
    });

    heightInput.addEventListener('input', () => {
        if (!originalImage) return;
        targetHeight = parseInt(heightInput.value) || 0;
        if (aspectRatioCheckbox.checked && targetHeight > 0) {
            const ratio = fileMeta.width / fileMeta.height;
            targetWidth = Math.round(targetHeight * ratio);
            widthInput.value = targetWidth;
        }
    });

    // 슬라이더 변경 시
    percentSlider.addEventListener('input', (e) => {
        const pct = parseInt(e.target.value);
        percentVal.textContent = pct;
        updateDimensionsFromPercentSlider();
    });

    function updateDimensionsFromPixelInputs() {
        targetWidth = parseInt(widthInput.value) || fileMeta.width;
        targetHeight = parseInt(heightInput.value) || fileMeta.height;
    }

    function updateDimensionsFromPercentSlider() {
        if (!fileMeta) return;
        const pct = parseInt(percentSlider.value) / 100;
        targetWidth = Math.round(fileMeta.width * pct);
        targetHeight = Math.round(fileMeta.height * pct);
    }

    // 5. 컨트롤 컴포넌트 활성화 처리 함수
    function enableControls() {
        widthInput.removeAttribute('disabled');
        heightInput.removeAttribute('disabled');
        aspectRatioCheckbox.removeAttribute('disabled');
        percentSlider.removeAttribute('disabled');
        interpolationFilter.removeAttribute('disabled');
        outputFormat.removeAttribute('disabled');
        btnResize.removeAttribute('disabled');
    }

    // 6. 프리뷰 캔버스 렌더러
    function drawPreview(image) {
        const ctx = previewCanvas.getContext('2d');
        previewCanvas.width = image.naturalWidth;
        previewCanvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
    }

    // 7. 리사이즈 및 다운로드 실행 이벤트 바인딩
    btnResize.addEventListener('click', () => {
        if (!originalImage) return;

        // 경계 조건 유효성 검사
        if (targetWidth <= 0 || targetHeight <= 0) {
            UIComponents.showErrorDialog("Input Range Error", "가로 및 세로 해상도는 1px 이상이어야 합니다.");
            return;
        }

        if (targetWidth > 10000 || targetHeight > 10000) {
            UIComponents.showErrorDialog("Out of Range.exe", "브라우저 메모리 한계로 인해 10,000px 이상의 크기 변환은 불가합니다.");
            return;
        }

        // 연두색 XP 진행바 작동 알림 소환
        const prog = UIComponents.showProgressDialog("이미지 변경 작업 중", "선택하신 크기로 보간 계산을 수행하고 있습니다...");
        
        setTimeout(() => {
            try {
                prog.updateProgress(35, "보간 알고리즘 필터 적용 중...");
                
                // Canvas 리사이징 연산 실행
                const resizedCanvas = CanvasUtils.resize(
                    originalImage, 
                    targetWidth, 
                    targetHeight, 
                    interpolationFilter.value
                );
                
                prog.updateProgress(75, "바이너리 스트림 인코딩 중...");
                
                // 포맷 매핑
                let format = fileMeta.type; // 기본 원본 포맷
                if (outputFormat.value !== 'match') {
                    format = outputFormat.value;
                }
                
                let ext = 'png';
                if (format === 'image/jpeg') ext = 'jpg';
                else if (format === 'image/webp') ext = 'webp';
                
                const dlName = FileUtils.getDownloadName(fileMeta.name, `_resized_${targetWidth}x${targetHeight}`, ext);
                
                // 최종 파일 다운로드
                FileUtils.downloadCanvas(resizedCanvas, format, dlName, 0.92);
                
                prog.updateProgress(100, "다운로드 완료!");
                
                setTimeout(() => {
                    prog.close();
                }, 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Processing Crash", `변환 중 캔버스 크래시가 일어났습니다: ${err.message}`);
            }
        }, 300); // UI 갱신 체감을 위해 딜레이 부여
    });
})();

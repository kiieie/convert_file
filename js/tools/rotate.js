/**
 * ==========================================================================
 * ConvertFile - Image Rotator Business Logic
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 취득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewCanvas = document.getElementById('preview-canvas');
    
    // 제어 버튼 및 슬라이더
    const btnRot90cw = document.getElementById('btn-rot-90cw');
    const btnRot90ccw = document.getElementById('btn-rot-90ccw');
    const btnRot180 = document.getElementById('btn-rot-180');
    const btnResetRot = document.getElementById('btn-reset-rot');
    const btnFlipH = document.getElementById('btn-flip-h');
    const btnFlipV = document.getElementById('btn-flip-v');
    const rotAngleSlider = document.getElementById('rot-angle');
    const angleValLabel = document.getElementById('angle-val');
    const btnDownload = document.getElementById('btn-download');
    
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    // 2. 상태 상태 변수들
    let originalImage = null;
    let fileMeta = null;

    // 변환 누적 상태값
    let currentAngle = 0; // -180 ~ 180
    let flipH = false;
    let flipV = false;

    // 3. 파일 바인딩
    ImageLoader.bind(
        dropZone, 
        fileInput, 
        function(img, meta) {
            originalImage = img;
            fileMeta = meta;
            
            // 컨트롤 패널 활성화
            enableControls();
            
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';
            
            // 초기화 후 렌더링
            resetState();
            
            statusText.textContent = `불러온 파일: ${meta.name}`;
            statusInfo.textContent = `${meta.width} x ${meta.height} (${FileUtils.formatBytes(meta.size)})`;
        }, 
        function(errorMsg) {
            UIComponents.showErrorDialog("Image Loader Error", errorMsg);
        }
    );

    function enableControls() {
        btnRot90cw.removeAttribute('disabled');
        btnRot90ccw.removeAttribute('disabled');
        btnRot180.removeAttribute('disabled');
        btnResetRot.removeAttribute('disabled');
        btnFlipH.removeAttribute('disabled');
        btnFlipV.removeAttribute('disabled');
        rotAngleSlider.removeAttribute('disabled');
        btnDownload.removeAttribute('disabled');
    }

    function resetState() {
        currentAngle = 0;
        flipH = false;
        flipV = false;
        rotAngleSlider.value = 0;
        angleValLabel.textContent = "0";
        applyTransformation();
    }

    // 4. 상태 변경 이벤트 바인딩
    btnRot90cw.addEventListener('click', () => {
        currentAngle = (currentAngle + 90) % 360;
        // 각도를 -180 ~ 180 범위로 노멀라이징
        if (currentAngle > 180) currentAngle -= 360;
        rotAngleSlider.value = currentAngle;
        angleValLabel.textContent = currentAngle;
        applyTransformation();
    });

    btnRot90ccw.addEventListener('click', () => {
        currentAngle = (currentAngle - 90) % 360;
        if (currentAngle < -180) currentAngle += 360;
        rotAngleSlider.value = currentAngle;
        angleValLabel.textContent = currentAngle;
        applyTransformation();
    });

    btnRot180.addEventListener('click', () => {
        currentAngle = (currentAngle + 180) % 360;
        if (currentAngle > 180) currentAngle -= 360;
        if (currentAngle < -180) currentAngle += 360;
        rotAngleSlider.value = currentAngle;
        angleValLabel.textContent = currentAngle;
        applyTransformation();
    });

    btnFlipH.addEventListener('click', () => {
        flipH = !flipH;
        applyTransformation();
    });

    btnFlipV.addEventListener('click', () => {
        flipV = !flipV;
        applyTransformation();
    });

    rotAngleSlider.addEventListener('input', (e) => {
        currentAngle = parseInt(e.target.value);
        angleValLabel.textContent = currentAngle;
        applyTransformation();
    });

    btnResetRot.addEventListener('click', resetState);

    // 5. 누적 상태 기반 실시간 프리뷰 캔버스 변환 렌더링
    function applyTransformation() {
        if (!originalImage) return;

        // CanvasUtils 공통 회전/반전 로직 호출
        const transformedCanvas = CanvasUtils.rotateAndFlip(
            originalImage, 
            currentAngle, 
            flipH, 
            flipV
        );

        // 화면 렌더링 캔버스 리사이즈 뷰 매핑
        const maxDisplayWidth = Math.min(500, previewContainer.clientWidth - 40);
        let displayWidth = transformedCanvas.width;
        let displayHeight = transformedCanvas.height;

        if (displayWidth > maxDisplayWidth) {
            const ratio = maxDisplayWidth / displayWidth;
            displayWidth = maxDisplayWidth;
            displayHeight = transformedCanvas.height * ratio;
        }

        previewCanvas.width = displayWidth;
        previewCanvas.height = displayHeight;
        
        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(transformedCanvas, 0, 0, displayWidth, displayHeight);

        // 하단 상태 표시줄의 가로세로 픽셀 해상도 동적 수정
        statusInfo.textContent = `${transformedCanvas.width} x ${transformedCanvas.height} (${FileUtils.formatBytes(fileMeta.size)})`;
    }

    // 6. 결과 캔버스 바이너리 다운로드 실행
    btnDownload.addEventListener('click', () => {
        if (!originalImage) return;

        const prog = UIComponents.showProgressDialog("회전 처리 적용 중", "회전 및 반전 각도를 도화지에 투영하고 있습니다...");

        setTimeout(() => {
            try {
                prog.updateProgress(50, "캔버스 래스터 변환 작업 중...");
                
                const finalCanvas = CanvasUtils.rotateAndFlip(
                    originalImage, 
                    currentAngle, 
                    flipH, 
                    flipV
                );

                prog.updateProgress(85, "압축 인코딩 파일 전송 준비...");

                const suffix = `_rotated_${currentAngle}deg${flipH ? '_fliph' : ''}${flipV ? '_flipv' : ''}`;
                const dlName = FileUtils.getDownloadName(fileMeta.name, suffix);

                // 다운로드 실행
                FileUtils.downloadCanvas(finalCanvas, fileMeta.type, dlName);

                prog.updateProgress(100, "회전 결과물 저장 완료!");
                
                setTimeout(() => {
                    prog.close();
                }, 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Rotation Failed", `변환 중 실패했습니다: ${err.message}`);
            }
        }, 300);
    });
})();

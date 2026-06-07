/**
 * ==========================================================================
 * ConvertFile - Image Cropper Business Logic
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 취득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewCanvas = document.getElementById('preview-canvas');
    const cropOverlay = document.getElementById('crop-overlay');
    const cropBox = document.getElementById('crop-box');
    const cropViewport = document.getElementById('crop-viewport');
    
    // 조작 폼 필드
    const aspectRatioPreset = document.getElementById('aspect-ratio-preset');
    const cropWidthInput = document.getElementById('crop-width');
    const cropHeightInput = document.getElementById('crop-height');
    const cropXInput = document.getElementById('crop-x');
    const cropYInput = document.getElementById('crop-y');
    const btnCrop = document.getElementById('btn-crop');
    
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    // 2. 상태 상태 변수들
    let originalImage = null;
    let fileMeta = null;
    
    // 화면 렌더링 이미지 대비 실제 이미지 비율 팩터
    let scaleX = 1;
    let scaleY = 1;

    // 크롭 박스 절대 좌표 정보 (오버레이 컨테이너 내 픽셀 단위)
    let boxLeft = 0;
    let boxTop = 0;
    let boxWidth = 0;
    let boxHeight = 0;

    // 드래그 조작 제어 인터랙션 변수
    let isDragging = false;
    let dragMode = ''; // 'move' | 'tl' | 'tr' | 'bl' | 'br'
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let startWidth = 0;
    let startHeight = 0;

    // 3. 파일 업로드 설정
    ImageLoader.bind(
        dropZone, 
        fileInput, 
        function(img, meta) {
            originalImage = img;
            fileMeta = meta;
            
            // 컨트롤 패널 활성화
            aspectRatioPreset.removeAttribute('disabled');
            cropWidthInput.removeAttribute('disabled');
            cropHeightInput.removeAttribute('disabled');
            cropXInput.removeAttribute('disabled');
            cropYInput.removeAttribute('disabled');
            btnCrop.removeAttribute('disabled');
            
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';
            cropOverlay.style.display = 'block';

            // 프리뷰 로드 및 렌더링 스케일링 설정
            drawPreview(img);
            
            statusText.textContent = `불러온 파일: ${meta.name}`;
            statusInfo.textContent = `${meta.width} x ${meta.height} (${FileUtils.formatBytes(meta.size)})`;
        }, 
        function(errorMsg) {
            UIComponents.showErrorDialog("Image Loading Error", errorMsg);
        }
    );

    // 4. 프리뷰 캔버스 렌더링 및 크롭박스 초기 위치 설정
    function drawPreview(image) {
        const ctx = previewCanvas.getContext('2d');
        
        // 화면 너비 한계값 (예: 500px)에 맞춰 CSS 스케일 렌더링을 위해 가로세로 계산
        const maxDisplayWidth = Math.min(500, previewContainer.clientWidth - 40);
        let displayWidth = image.naturalWidth;
        let displayHeight = image.naturalHeight;

        if (displayWidth > maxDisplayWidth) {
            const ratio = maxDisplayWidth / displayWidth;
            displayWidth = maxDisplayWidth;
            displayHeight = image.naturalHeight * ratio;
        }

        previewCanvas.width = displayWidth;
        previewCanvas.height = displayHeight;
        
        // 원본 이미지 대비 화면 렌더링 비율 역산 팩터 계산
        scaleX = image.naturalWidth / displayWidth;
        scaleY = image.naturalHeight / displayHeight;

        ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

        // 초기 크롭 박스 설정 (전체 화면의 80% 크기로 중앙 정렬)
        boxWidth = Math.round(displayWidth * 0.8);
        boxHeight = Math.round(displayHeight * 0.8);
        boxLeft = Math.round((displayWidth - boxWidth) / 2);
        boxTop = Math.round((displayHeight - boxHeight) / 2);

        updateCropBoxUI();
    }

    // 5. 크롭 오버레이 드래그 앤 드롭 조작 로직 (Vanilla Mouse & Touch Events)
    cropOverlay.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMoveAction);
    document.addEventListener('mouseup', dragEnd);

    // 터치 모바일 대응
    cropOverlay.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) dragStart(e.touches[0]);
    });
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) dragMoveAction(e.touches[0]);
    });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (!originalImage) return;

        // 타겟 요소 감지 (조절 핸들이냐, 크롭 박스 내부냐)
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return;

        if (target.classList.contains('modern-crop-handle')) {
            isDragging = true;
            dragMode = target.getAttribute('data-handle'); // tl, tr, bl, br
        } else if (target === cropBox || cropBox.contains(target)) {
            isDragging = true;
            dragMode = 'move';
        } else {
            // 박스 바깥 클릭 시 드래그 하지 않음
            return;
        }

        startX = e.clientX;
        startY = e.clientY;
        startLeft = boxLeft;
        startTop = boxTop;
        startWidth = boxWidth;
        startHeight = boxHeight;
    }

    function dragMoveAction(e) {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const viewportWidth = previewCanvas.width;
        const viewportHeight = previewCanvas.height;

        const preset = aspectRatioPreset.value;

        if (dragMode === 'move') {
            // 1) 전체 위치 이동
            boxLeft = Math.max(0, Math.min(viewportWidth - boxWidth, startLeft + dx));
            boxTop = Math.max(0, Math.min(viewportHeight - boxHeight, startTop + dy));
        } else {
            // 2) 리사이즈 조작 (모서리 핸들)
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            if (dragMode.includes('r')) { // 우측 경계 조정
                newWidth = Math.max(20, Math.min(viewportWidth - startLeft, startWidth + dx));
            }
            if (dragMode.includes('l')) { // 좌측 경계 조정
                const tempWidth = startWidth - dx;
                if (tempWidth >= 20) {
                    newLeft = Math.max(0, startLeft + dx);
                    newWidth = startWidth + (startLeft - newLeft);
                }
            }
            if (dragMode.includes('b')) { // 하단 경계 조정
                newHeight = Math.max(20, Math.min(viewportHeight - startTop, startHeight + dy));
            }
            if (dragMode.includes('t')) { // 상단 경계 조정
                const tempHeight = startHeight - dy;
                if (tempHeight >= 20) {
                    newTop = Math.max(0, startTop + dy);
                    newHeight = startHeight + (startTop - newTop);
                }
            }

            // 비율 고정 계산 처리 (Aspect Ratio Lock)
            if (preset !== 'free') {
                let ratio = 1;
                if (preset === '1:1') ratio = 1;
                else if (preset === '4:3') ratio = 4 / 3;
                else if (preset === '16:9') ratio = 16 / 9;

                // 드래그된 가로 기준으로 세로 계산
                newHeight = Math.round(newWidth / ratio);
                
                // 화면 경계를 벗어날 시 리사이징 제약
                if (newTop + newHeight > viewportHeight) {
                    newHeight = viewportHeight - newTop;
                    newWidth = Math.round(newHeight * ratio);
                }
            }

            boxLeft = newLeft;
            boxTop = newTop;
            boxWidth = newWidth;
            boxHeight = newHeight;
        }

        updateCropBoxUI();
    }

    function dragEnd() {
        isDragging = false;
        dragMode = '';
    }

    /**
     * 현재 상태의 좌표 정보에 맞게 화면의 크롭박스 위치와 속성창 수치들을 리렌더링합니다.
     */
    function updateCropBoxUI() {
        cropBox.style.left = `${boxLeft}px`;
        cropBox.style.top = `${boxTop}px`;
        cropBox.style.width = `${boxWidth}px`;
        cropBox.style.height = `${boxHeight}px`;

        // 원본 해상도 픽셀 크기로 복원하여 입력창에 업데이트
        cropXInput.value = Math.round(boxLeft * scaleX);
        cropYInput.value = Math.round(boxTop * scaleY);
        cropWidthInput.value = Math.round(boxWidth * scaleX);
        cropHeightInput.value = Math.round(boxHeight * scaleY);
    }

    // 6. 수치 폼 입력값 수동 업데이트 이벤트 연동
    [cropXInput, cropYInput, cropWidthInput, cropHeightInput].forEach(input => {
        input.addEventListener('change', () => {
            if (!fileMeta) return;

            const rx = parseInt(cropXInput.value) || 0;
            const ry = parseInt(cropYInput.value) || 0;
            const rw = parseInt(cropWidthInput.value) || 20;
            const rh = parseInt(cropHeightInput.value) || 20;

            // 렌더링 좌표계로 다시 역변환
            boxLeft = Math.max(0, Math.min(previewCanvas.width, Math.round(rx / scaleX)));
            boxTop = Math.max(0, Math.min(previewCanvas.height, Math.round(ry / scaleY)));
            boxWidth = Math.max(10, Math.min(previewCanvas.width - boxLeft, Math.round(rw / scaleX)));
            boxHeight = Math.max(10, Math.min(previewCanvas.height - boxTop, Math.round(rh / scaleY)));

            updateCropBoxUI();
        });
    });

    // 비율 프리셋 토글 트리거
    aspectRatioPreset.addEventListener('change', () => {
        const preset = aspectRatioPreset.value;
        if (preset !== 'free') {
            let ratio = 1;
            if (preset === '1:1') ratio = 1;
            else if (preset === '4:3') ratio = 4 / 3;
            else if (preset === '16:9') ratio = 16 / 9;

            // 기존 너비에 맞춰 세로 강제 동기화
            boxHeight = Math.round(boxWidth / ratio);
            
            // 경계 복구
            if (boxTop + boxHeight > previewCanvas.height) {
                boxHeight = previewCanvas.height - boxTop;
                boxWidth = Math.round(boxHeight * ratio);
            }
            updateCropBoxUI();
        }
    });

    // 7. 잘라내기 실행 및 저장
    btnCrop.addEventListener('click', () => {
        if (!originalImage) return;

        const rx = Math.round(boxLeft * scaleX);
        const ry = Math.round(boxTop * scaleY);
        const rw = Math.round(boxWidth * scaleX);
        const rh = Math.round(boxHeight * scaleY);

        if (rw <= 0 || rh <= 0) {
            UIComponents.showErrorDialog("Crop Coordinate Error", "선택된 자르기 영역 크기가 부적절합니다.");
            return;
        }

        const prog = UIComponents.showProgressDialog("이미지 자르기 처리 중", "원본 이미지 해상도를 읽어 영역 절단을 준비하고 있습니다...");

        setTimeout(() => {
            try {
                prog.updateProgress(45, "Canvas 비트맵 절단 수행 중...");
                
                // 가상 Canvas 생성 및 크롭 헬퍼 호출
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = fileMeta.width;
                tempCanvas.height = fileMeta.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(originalImage, 0, 0);

                const croppedCanvas = CanvasUtils.crop(tempCanvas, rx, ry, rw, rh);

                prog.updateProgress(85, "결과 바이너리 다운로드 준비 중...");

                const dlName = FileUtils.getDownloadName(fileMeta.name, `_cropped_${rw}x${rh}`);
                
                // 다운로드 실행
                FileUtils.downloadCanvas(croppedCanvas, fileMeta.type, dlName);

                prog.updateProgress(100, "잘라내기 완료!");
                
                setTimeout(() => {
                    prog.close();
                }, 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Crop Exception", `처리 중 오류가 일어났습니다: ${err.message}`);
            }
        }, 300);
    });
})();

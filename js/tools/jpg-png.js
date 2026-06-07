/**
 * ==========================================================================
 * ConvertFile - Image Format Converter Business Logic
 * ==========================================================================
 */

(function() {
    // 1. DOM 핸들러
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewCanvas = document.getElementById('preview-canvas');
    
    const targetFormatSelect = document.getElementById('target-format');
    const qualityPanel = document.getElementById('quality-panel');
    const compressQuality = document.getElementById('compress-quality');
    const qualityVal = document.getElementById('quality-val');
    const alphaPanel = document.getElementById('alpha-panel');
    const bgFillerColor = document.getElementById('bg-filler-color');
    
    const btnConvert = document.getElementById('btn-convert');
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    // 2. 상태 인스턴스
    let originalImage = null;
    let fileMeta = null;

    // 3. 이미지 업로드 리스너
    ImageLoader.bind(
        dropZone, 
        fileInput, 
        function(img, meta) {
            originalImage = img;
            fileMeta = meta;
            
            // 컨트롤 패널 활성화
            targetFormatSelect.removeAttribute('disabled');
            btnConvert.removeAttribute('disabled');
            
            // 프리뷰 컨테이너 노출 및 렌더링
            dropZone.style.display = 'none';
            previewContainer.style.display = 'flex';
            drawPreview(img);
            
            // 타겟 포맷 선택 상태에 따라 세부 패널 토글 트리거
            toggleFormatSettings();
            
            statusText.textContent = `불러온 파일: ${meta.name}`;
            statusInfo.textContent = `${meta.width} x ${meta.height} (${FileUtils.formatBytes(meta.size)})`;
        }, 
        function(errorMsg) {
            UIComponents.showErrorDialog("Format Load Exception", errorMsg);
        }
    );

    // 4. 변환 포맷 선택 이벤트 리스너
    targetFormatSelect.addEventListener('change', () => {
        toggleFormatSettings();
    });

    compressQuality.addEventListener('input', (e) => {
        qualityVal.textContent = e.target.value;
    });

    /**
     * 선택된 타겟 포맷 종류에 따라 압축 퀄리티 슬라이더 및 투명 채우기 패널의 보임 여부를 조정합니다.
     */
    function toggleFormatSettings() {
        if (!originalImage) return;

        const targetFormat = targetFormatSelect.value;
        
        // JPG 변환일 때만 화질 조절 슬라이더 및 투명 배경 채우기 도구 노출
        if (targetFormat === 'image/jpeg') {
            qualityPanel.style.display = 'block';
            alphaPanel.style.display = 'block';
        } else if (targetFormat === 'image/webp') {
            qualityPanel.style.display = 'block'; // WebP도 퀄리티 압축 지원 가능
            alphaPanel.style.display = 'none';
        } else {
            // PNG 변환
            qualityPanel.style.display = 'none';
            alphaPanel.style.display = 'none';
        }
    }

    // 5. 프리뷰 드로잉
    function drawPreview(image) {
        const ctx = previewCanvas.getContext('2d');
        previewCanvas.width = image.naturalWidth;
        previewCanvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
    }

    // 6. 변환 처리 및 저장
    btnConvert.addEventListener('click', () => {
        if (!originalImage) return;

        const targetFormat = targetFormatSelect.value;
        const quality = parseInt(compressQuality.value) / 100;

        // 연두색 XP 진행률 다이얼로그 호출
        const prog = UIComponents.showProgressDialog("이미지 변환 진행 중", "파일 버퍼에서 픽셀 스트림을 로드하고 있습니다...");

        setTimeout(() => {
            try {
                prog.updateProgress(40, "포맷 인코딩 파이프라인 가동 중...");
                
                // 새로운 도화지(Canvas) 생성
                const outCanvas = document.createElement('canvas');
                outCanvas.width = fileMeta.width;
                outCanvas.height = fileMeta.height;
                const ctx = outCanvas.getContext('2d');

                // 만약 타겟 포맷이 JPG(투명 미지원)이고 원본 파일에 투명이 존재할 수 있는 경우
                if (targetFormat === 'image/jpeg') {
                    prog.updateProgress(60, "투명 알파 채널에 배경색 채우는 중...");
                    // 사용자가 지정한 배경색으로 도화지 전체 채우기
                    ctx.fillStyle = bgFillerColor.value;
                    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
                }

                // 이미지 그리기
                ctx.drawImage(originalImage, 0, 0);

                prog.updateProgress(80, "브라우저 파일 스트림 수동 수집 중...");

                // 파일 확장자 매핑
                let ext = 'png';
                if (targetFormat === 'image/jpeg') ext = 'jpg';
                else if (targetFormat === 'image/webp') ext = 'webp';

                const downloadName = FileUtils.getDownloadName(fileMeta.name, '_converted', ext);

                // 가상 기기 다운로드 트리거
                FileUtils.downloadCanvas(outCanvas, targetFormat, downloadName, quality);

                prog.updateProgress(100, "변환 완료!");
                
                setTimeout(() => {
                    prog.close();
                }, 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Converter Exception", `변환 중 치명적 예외가 발생했습니다: ${err.message}`);
            }
        }, 300);
    });
})();

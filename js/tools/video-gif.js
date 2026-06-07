/**
 * ==========================================================================
 * ConvertFile - Video to GIF Converter Business Logic (video-gif.js)
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const sourceVideo = document.getElementById('source-video');
    const previewGif = document.getElementById('preview-gif');
    
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const gifWidthInput = document.getElementById('gif-width');
    const gifFpsSelect = document.getElementById('gif-fps');
    
    const btnConvert = document.getElementById('btn-convert');

    // 2. 상태 변수
    let videoFile = null;
    let videoDuration = 0;

    // 3. 비디오 파일 업로드 리스너
    // 드롭존 클릭 시 파일 브라우저 실행
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

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
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            loadVideoFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadVideoFile(e.target.files[0]);
        }
    });

    // 비디오 로딩 및 세팅
    function loadVideoFile(file) {
        // 비디오 파일 유형 검증
        if (!file.type.startsWith('video/')) {
            UIComponents.showErrorDialog("Invalid File Format", "비디오 파일 형식이 유효하지 않습니다. MP4 또는 WebM 동영상을 업로드하십시오.");
            return;
        }

        // 최대 파일 크기 체크 (50MB)
        if (file.size > 50 * 1024 * 1024) {
            UIComponents.showErrorDialog("Size Limit Exceeded", "비디오 용량이 50MB를 초과했습니다. 더 작은 크기의 동영상을 이용해 주십시오.");
            return;
        }

        videoFile = file;

        // 비디오 소스 셋업
        const videoUrl = URL.createObjectURL(file);
        sourceVideo.src = videoUrl;

        // 미리보기 레이아웃 갱신
        dropZone.style.display = 'none';
        previewContainer.style.display = 'flex';
        previewGif.style.display = 'none';

        // 비디오 메타데이터가 로딩되었을 때 범위 입력창 초기화
        sourceVideo.onloadedmetadata = () => {
            videoDuration = sourceVideo.duration;
            
            // UI 컨트롤 활성화 및 기본값 바인딩
            startTimeInput.removeAttribute('disabled');
            endTimeInput.removeAttribute('disabled');
            gifWidthInput.removeAttribute('disabled');
            gifFpsSelect.removeAttribute('disabled');
            btnConvert.removeAttribute('disabled');

            startTimeInput.value = 0;
            startTimeInput.max = videoDuration;
            
            // 기본 추출 길이는 최대 5초로 초기 제약
            endTimeInput.value = Math.min(5, videoDuration).toFixed(1);
            endTimeInput.max = videoDuration;

            // 비디오 프레임 가독을 위해 0초로 강제 탐색
            sourceVideo.currentTime = 0;
        };

        sourceVideo.onerror = () => {
            UIComponents.showErrorDialog("Video Load Crash", "브라우저에서 비디오 코덱을 해독하여 불러올 수 없습니다.");
        };
    }

    // 4. 비디오 -> GIF 변환 파이프라인
    btnConvert.addEventListener('click', () => {
        if (!videoFile || videoDuration <= 0) return;

        // gifshot 라이브러리 안전성 검증
        if (typeof gifshot === 'undefined') {
            UIComponents.showErrorDialog("Library Load Fail", "GIF 생성 인코더(gifshot)를 발견하지 못했습니다. 인터넷 연결이 원활한지 확인한 후 페이지를 새로고침해 주십시오.");
            return;
        }

        const start = parseFloat(startTimeInput.value);
        const end = parseFloat(endTimeInput.value);
        const width = parseInt(gifWidthInput.value);
        const fps = parseInt(gifFpsSelect.value);

        // 정밀 유효성 검사
        if (start < 0 || end <= start || end > videoDuration) {
            UIComponents.showErrorDialog("Invalid Duration Settings", "시작 및 종료 시간이 올바르지 않습니다. 동영상 구간 범위 내로 정확히 설정해 주십시오.");
            return;
        }

        const duration = end - start;
        if (duration > 15) {
            // 브라우저 힙 메모리 폭증 방지를 위해 프레임 추출을 15초 이내로 제약
            UIComponents.showErrorDialog("Duration Constraint", "움짤 GIF 변환 구간은 성능 향상 및 브라우저 보호를 위해 최대 15초까지만 허용됩니다.");
            return;
        }

        // 프레임 추출 타임스탬프 계산
        const frameInterval = 1 / fps;
        const totalFrames = Math.ceil(duration * fps);
        const captureTimes = [];

        for (let i = 0; i < totalFrames; i++) {
            captureTimes.push(start + (i * frameInterval));
        }

        // 변환 작업 모달 다이얼로그 호출
        const prog = UIComponents.showProgressDialog(
            "비디오 캡처 중", 
            `타임라인에서 프레임을 추출하고 있습니다... (0 / ${totalFrames})`
        );

        let currentFrameIndex = 0;
        const framesData = [];

        // 추출 전용 가상 캔버스 인스턴스 빌드
        const captureCanvas = document.createElement('canvas');
        const ctx = captureCanvas.getContext('2d');
        
        // 원본 비율에 맞는 해상도 가로/세로 매핑 (NaN/Infinity 대비 방어 코드 주입)
        let videoRatio = sourceVideo.videoWidth / sourceVideo.videoHeight;
        if (isNaN(videoRatio) || !isFinite(videoRatio) || videoRatio <= 0) {
            videoRatio = 16 / 9; // 기본 16:9 비율 대체
        }
        
        // 가상 캔버스 규격 확보 (0 또는 음수 방지)
        captureCanvas.width = width > 0 ? width : 320;
        captureCanvas.height = Math.round(captureCanvas.width / videoRatio) || 180;

        // 타임라인 검색 탐색 프레임 캡처 재귀함수
        function captureNextFrame() {
            if (currentFrameIndex >= captureTimes.length) {
                // 프레임 캡처 취합 완료 -> GIF 빌드 시작
                prog.updateProgress(90, "추출된 프레임을 병합하여 GIF 애니메이션을 생성하고 있습니다...");
                
                // gifshot 비동기 생성기 구동
                gifshot.createGIF({
                    images: framesData,
                    gifWidth: captureCanvas.width,
                    gifHeight: captureCanvas.height,
                    interval: frameInterval, // 초 단위 프레임 딜레이
                    numWorkers: 2,
                    frameDuration: fps
                }, function(obj) {
                    prog.updateProgress(100, "변환 완료!");
                    
                    setTimeout(() => {
                        prog.close();
                        if (!obj.error) {
                            // 결과물 렌더링
                            previewGif.src = obj.image;
                            previewGif.style.display = 'block';
                            previewGif.scrollIntoView({ behavior: 'smooth' });

                            // 자동 다운로드 처리
                            const downloadName = FileUtils.getDownloadName(videoFile.name, '_converted', 'gif');
                            FileUtils.downloadFile(obj.image, downloadName);
                        } else {
                            UIComponents.showErrorDialog("GIF Builder Crash", "GIF 인코더가 작동을 중지했습니다.");
                        }
                    }, 400);
                });
                return;
            }

            // 비디오 타임라인 특정 초로 강제 도프
            const seekTime = captureTimes[currentFrameIndex];
            sourceVideo.currentTime = seekTime;

            // seeked 이벤트 대기 (해당 재생 시간의 버퍼가 비디오에 정확히 로드되는 타이밍 인터셉트)
            sourceVideo.onseeked = () => {
                try {
                    // 가상 캔버스에 비디오 재생 화면 복제
                    ctx.drawImage(sourceVideo, 0, 0, captureCanvas.width, captureCanvas.height);
                    
                    // 화질과 로딩 타협을 위해 jpeg 포맷으로 추출
                    const frameDataUrl = captureCanvas.toDataURL('image/jpeg', 0.9);
                    framesData.push(frameDataUrl);

                    // 진행률 업데이트
                    currentFrameIndex++;
                    const percent = Math.round((currentFrameIndex / totalFrames) * 85); // 캡처는 85%까지
                    prog.updateProgress(percent, `타임라인에서 프레임을 추출하고 있습니다... (${currentFrameIndex} / ${totalFrames})`);

                    // 꼬리 물기 재귀 호출
                    captureNextFrame();
                } catch (err) {
                    prog.close();
                    let tip = "";
                    if (err.name === "SecurityError") {
                        tip = " (보안 정책 차단: 로컬 file:// 경로로 직접 실행한 경우 CORS 보안 제한으로 인해 Canvas 캡처가 불가할 수 있습니다. http://127.0.0.1 서버를 기동해 구동해 주십시오.)";
                    }
                    UIComponents.showErrorDialog("Capture Buffer Fail", `프레임을 캔버스로 복제하지 못했습니다: ${err.message}${tip}`);
                }
            };
        }

        // 비디오 재생을 멈추고 프레임 시퀀스 추출 작동
        sourceVideo.pause();
        captureNextFrame();
    });
})();

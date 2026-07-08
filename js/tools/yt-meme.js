/**
 * ==========================================================================
 * ConvertFile - YouTube Clip Meme Maker (yt-meme.js)
 * ==========================================================================
 * 구간 선택은 YouTube IFrame Player API(재생 제어 전용). 플레이어 픽셀은 읽지
 * 않으며, GIF 픽셀은 사용자가 업로드한 파일에서만 추출한다.
 */

(function () {
    'use strict';

    // --- DOM refs ---
    const urlInput = document.getElementById('yt-url');
    const btnLoad = document.getElementById('btn-load-video');
    const urlError = document.getElementById('url-error');
    const memeFrame = document.getElementById('meme-frame');
    const segmentCard = document.getElementById('segment-card');
    const textCard = document.getElementById('text-card');
    const shareCard = document.getElementById('share-card');
    const btnSetStart = document.getElementById('btn-set-start');
    const btnSetEnd = document.getElementById('btn-set-end');
    const segStartInput = document.getElementById('seg-start');
    const segEndInput = document.getElementById('seg-end');
    const btnPreviewLoop = document.getElementById('btn-preview-loop');

    // --- state ---
    let player = null;
    let videoId = null;
    let apiRequested = false;
    let previewTimer = null;

    function getSegment() {
        return { s: parseFloat(segStartInput.value) || 0, e: parseFloat(segEndInput.value) || 0 };
    }

    function segmentValid() {
        const seg = getSegment();
        return seg.s >= 0 && seg.e - seg.s >= 0.5;
    }

    function loadIframeApi() {
        return new Promise(function (resolve) {
            if (window.YT && window.YT.Player) { resolve(); return; }
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function () {
                if (prev) prev();
                resolve();
            };
            if (!apiRequested) {
                apiRequested = true;
                const s = document.createElement('script');
                s.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(s);
            }
        });
    }

    function showUrlError(msg) {
        urlError.textContent = msg;
        urlError.hidden = false;
    }

    function onPlayerError(e) {
        let msg = 'This video cannot be played.';
        if (e.data === 101 || e.data === 150) msg = 'The owner of this video has disabled embedding. Try another video.';
        if (e.data === 100) msg = 'Video not found or private.';
        if (e.data === 2) msg = 'Invalid video id.';
        showUrlError(msg);
    }

    btnLoad.addEventListener('click', function () {
        stopPreviewLoop();
        const parsed = YTUtils.parseYouTubeUrl(urlInput.value);
        if (!parsed) {
            showUrlError('Invalid YouTube URL. Supported: youtube.com/watch, youtu.be, shorts, embed links.');
            return;
        }
        urlError.hidden = true;
        videoId = parsed.id;
        if (parsed.start !== null) {
            segStartInput.value = parsed.start;
            segEndInput.value = parsed.start + 5;
        }
        loadIframeApi().then(function () {
            if (player) {
                player.loadVideoById(videoId);
            } else {
                player = new YT.Player('yt-player', {
                    videoId: videoId,
                    playerVars: { rel: 0 },
                    events: { onError: onPlayerError }
                });
            }
            memeFrame.hidden = false;
            segmentCard.hidden = false;
            textCard.hidden = false;
            shareCard.hidden = false;
            updateShareState(); // Task 5에서 정의
        });
    });

    urlInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') btnLoad.click();
    });

    // --- segment selection ---
    btnSetStart.addEventListener('click', function () {
        if (!player || !player.getCurrentTime) return;
        segStartInput.value = (Math.round(player.getCurrentTime() * 10) / 10).toFixed(1);
        if (parseFloat(segEndInput.value) <= parseFloat(segStartInput.value)) {
            segEndInput.value = (parseFloat(segStartInput.value) + 5).toFixed(1);
        }
        updateShareState();
    });

    btnSetEnd.addEventListener('click', function () {
        if (!player || !player.getCurrentTime) return;
        segEndInput.value = (Math.round(player.getCurrentTime() * 10) / 10).toFixed(1);
        updateShareState();
    });

    segStartInput.addEventListener('input', updateShareState);
    segEndInput.addEventListener('input', updateShareState);

    function stopPreviewLoop() {
        if (previewTimer) {
            clearInterval(previewTimer);
            previewTimer = null;
            btnPreviewLoop.textContent = '🔁 Preview loop';
            if (player && player.pauseVideo) player.pauseVideo();
        }
    }

    btnPreviewLoop.addEventListener('click', function () {
        if (!player || !segmentValid()) return;
        if (previewTimer) { stopPreviewLoop(); return; }
        const seg = getSegment();
        player.seekTo(seg.s, true);
        player.playVideo();
        btnPreviewLoop.textContent = '⏹ Stop preview';
        previewTimer = setInterval(function () {
            const cur = getSegment(); // 입력 변경 실시간 반영
            if (player.getCurrentTime() >= cur.e) player.seekTo(cur.s, true);
        }, 200);
    });

    // --- meme text bars (player 밖 위/아래 — 플레이어 위 오버레이 금지 정책 준수) ---
    const topTextInput = document.getElementById('top-text');
    const bottomTextInput = document.getElementById('bottom-text');
    const uppercaseCheckbox = document.getElementById('uppercase-text');
    const barTop = document.getElementById('bar-top');
    const barBottom = document.getElementById('bar-bottom');
    const btnCopyLink = document.getElementById('btn-copy-link');
    const btnCopyEmbed = document.getElementById('btn-copy-embed');
    const clipUrlOutput = document.getElementById('clip-url-output');

    function displayText(raw) {
        const v = (raw || '').trim();
        return uppercaseCheckbox.checked ? v.toUpperCase() : v;
    }

    function updateBars() {
        const t = displayText(topTextInput.value);
        const b = displayText(bottomTextInput.value);
        barTop.textContent = t;
        barTop.hidden = t.length === 0;
        barBottom.textContent = b;
        barBottom.hidden = b.length === 0;
    }

    function updateShareState() {
        updateBars();
        btnCopyLink.disabled = !(videoId && segmentValid());
    }

    topTextInput.addEventListener('input', updateShareState);
    bottomTextInput.addEventListener('input', updateShareState);
    uppercaseCheckbox.addEventListener('change', updateShareState);

    function currentClipUrl() {
        const seg = getSegment();
        return YTUtils.buildClipUrl(location.origin + '/tools/clip-view.html', {
            v: videoId,
            s: Math.round(seg.s * 10) / 10,
            e: Math.round(seg.e * 10) / 10,
            t: displayText(topTextInput.value),
            b: displayText(bottomTextInput.value)
        });
    }

    function copyWithFeedback(btn, text, doneLabel) {
        const original = btn.textContent;
        navigator.clipboard.writeText(text).then(function () {
            btn.textContent = doneLabel;
            setTimeout(function () { btn.textContent = original; }, 1500);
        }).catch(function () {
            UIComponents.showErrorDialog('Clipboard Error', 'Copy failed. The link is shown in the box below — copy it manually.');
        });
    }

    btnCopyLink.addEventListener('click', function () {
        if (btnCopyLink.disabled) return;
        const url = currentClipUrl();
        clipUrlOutput.value = url;
        copyWithFeedback(btnCopyLink, url, '✅ Copied!');
    });

    btnCopyEmbed.addEventListener('click', function () {
        if (!videoId || !segmentValid()) return;
        const url = currentClipUrl();
        clipUrlOutput.value = url;
        const embed = '<iframe src="' + url + '" width="560" height="420" frameborder="0" allowfullscreen loading="lazy"></iframe>';
        copyWithFeedback(btnCopyEmbed, embed, '✅ Copied!');
    });

    // --- A output: real GIF from user-uploaded file (YouTube 서버 무접촉) ---
    const gifFileInput = document.getElementById('gif-file-input');
    const gifSourceVideo = document.getElementById('gif-source-video');
    const gifStartInput = document.getElementById('gif-start');
    const gifEndInput = document.getElementById('gif-end');
    const gifWidthInput = document.getElementById('gif-width');
    const gifFpsSelect = document.getElementById('gif-fps');
    const gifFontSize = document.getElementById('gif-font-size');
    const gifTextColor = document.getElementById('gif-text-color');
    const gifStrokeColor = document.getElementById('gif-stroke-color');
    const gifStrokeWidth = document.getElementById('gif-stroke-width');
    const btnMakeGif = document.getElementById('btn-make-gif');
    const gifPreview = document.getElementById('gif-preview');
    const gifClampWarning = document.getElementById('gif-clamp-warning');

    let gifFileName = null;

    gifFileInput.addEventListener('change', function () {
        const file = gifFileInput.files[0];
        if (!file) return;
        gifFileName = file.name;
        gifSourceVideo.src = URL.createObjectURL(file);
        gifSourceVideo.hidden = false;
        gifSourceVideo.onloadedmetadata = function () {
            const dur = gifSourceVideo.duration;
            // 1단계에서 고른 구간을 기본값으로, 파일 길이에 클램프
            const seg = getSegment();
            let s = Math.min(seg.s, Math.max(0, dur - 0.5));
            let e = Math.min(seg.e, dur);
            if (e - s < 0.5) { s = 0; e = Math.min(5, dur); }
            gifStartInput.value = s.toFixed(1);
            gifEndInput.value = e.toFixed(1);
            const clamped = seg.e > dur;
            gifClampWarning.hidden = !clamped;
            if (clamped) {
                gifClampWarning.textContent = 'Uploaded file is shorter than the selected segment — range clamped to ' + dur.toFixed(1) + 's.';
            }
            btnMakeGif.disabled = false;
        };
    });

    btnMakeGif.addEventListener('click', function () {
        if (typeof gifshot === 'undefined') {
            UIComponents.showErrorDialog('Library Error', 'gifshot library not loaded. Please refresh the page.');
            return;
        }
        const start = parseFloat(gifStartInput.value);
        const end = Math.min(parseFloat(gifEndInput.value), gifSourceVideo.duration || Infinity);
        const width = parseInt(gifWidthInput.value, 10) || 320;
        const fps = parseInt(gifFpsSelect.value, 10) || 10;

        if (!(start >= 0) || end <= start) {
            UIComponents.showErrorDialog('Invalid Range', 'End time must be greater than start time.');
            return;
        }
        if (end - start > 15) {
            UIComponents.showErrorDialog('Duration Limit', 'Max clip length is 15 seconds to protect browser memory.');
            return;
        }

        const frameInterval = 1 / fps;
        const totalFrames = Math.ceil((end - start) * fps);
        const captureTimes = [];
        for (let i = 0; i < totalFrames; i++) captureTimes.push(start + (i * frameInterval));

        const captureCanvas = document.createElement('canvas');
        const cctx = captureCanvas.getContext('2d');
        let ratio = gifSourceVideo.videoWidth / gifSourceVideo.videoHeight;
        if (!ratio || !isFinite(ratio) || ratio <= 0) ratio = 16 / 9;
        captureCanvas.width = width;
        captureCanvas.height = Math.round(width / ratio) || 180;

        const topVal = displayText(topTextInput.value);
        const bottomVal = displayText(bottomTextInput.value);
        const fontSize = parseInt(gifFontSize.value, 10) || 28;
        const padding = Math.max(6, Math.floor(captureCanvas.height * 0.03));
        const maxWidth = captureCanvas.width - 16;
        const lineHeight = fontSize + 4;

        function drawTexts() {
            cctx.font = 'bold ' + fontSize + 'px Impact, "Arial Black", sans-serif';
            cctx.textAlign = 'center';
            cctx.fillStyle = gifTextColor.value;
            cctx.strokeStyle = gifStrokeColor.value;
            cctx.lineWidth = parseInt(gifStrokeWidth.value, 10) || 0;
            cctx.lineJoin = 'round';
            if (topVal) {
                cctx.textBaseline = 'top';
                MemeText.drawWrappedText(cctx, topVal, captureCanvas.width / 2, padding, maxWidth, lineHeight, true);
            }
            if (bottomVal) {
                cctx.textBaseline = 'bottom';
                MemeText.drawWrappedText(cctx, bottomVal, captureCanvas.width / 2, captureCanvas.height - padding, maxWidth, lineHeight, false);
            }
        }

        const prog = UIComponents.showProgressDialog('Making GIF', 'Extracting frames... (0/' + totalFrames + ')');
        const framesData = [];
        let frameIdx = 0;

        function captureNextFrame() {
            if (frameIdx >= captureTimes.length) {
                prog.updateProgress(90, 'Building GIF animation...');
                gifshot.createGIF({
                    images: framesData,
                    gifWidth: captureCanvas.width,
                    gifHeight: captureCanvas.height,
                    interval: frameInterval,
                    numWorkers: 2
                }, function (obj) {
                    prog.updateProgress(100, 'Done!');
                    setTimeout(function () {
                        prog.close();
                        if (obj.error) {
                            UIComponents.showErrorDialog('GIF Error', 'GIF encoder failed.');
                            return;
                        }
                        gifPreview.src = obj.image;
                        gifPreview.hidden = false;
                        const base = (gifFileName || 'clip').replace(/\.[^.]+$/, '');
                        FileUtils.downloadFile(obj.image, base + '_meme.gif');
                    }, 400);
                });
                return;
            }
            gifSourceVideo.currentTime = captureTimes[frameIdx];
            gifSourceVideo.onseeked = function () {
                try {
                    cctx.drawImage(gifSourceVideo, 0, 0, captureCanvas.width, captureCanvas.height);
                    drawTexts();
                    framesData.push(captureCanvas.toDataURL('image/jpeg', 0.9));
                    frameIdx++;
                    prog.updateProgress(Math.round((frameIdx / totalFrames) * 85),
                        'Extracting frames... (' + frameIdx + '/' + totalFrames + ')');
                    captureNextFrame();
                } catch (err) {
                    prog.close();
                    let tip = (err.name === 'SecurityError') ? ' (CORS error: run via http server, not file://)' : '';
                    UIComponents.showErrorDialog('Capture Error', 'Frame capture failed: ' + err.message + tip);
                }
            };
        }

        gifSourceVideo.pause();
        // 일부 브라우저는 currentTime을 동일 값으로 재설정하면 'seeked'를 발화하지 않음.
        // 첫 프레임(특히 start=0 기본값)에서 캡처가 영원히 멈추는 것을 막기 위해
        // 목표 시각과 다른 값으로 살짝 옮겨둔 뒤 captureNextFrame()이 실제 seek을 수행하게 한다.
        const firstTarget = captureTimes[0];
        const nudged = firstTarget > 0.001 ? Math.max(0, firstTarget - 0.05) : firstTarget + 0.05;
        gifSourceVideo.currentTime = nudged;
        captureNextFrame();
    });
})();

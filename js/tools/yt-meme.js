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
})();

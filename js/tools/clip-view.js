/**
 * ==========================================================================
 * ConvertFile - Shared Clip Viewer (clip-view.js)
 * ==========================================================================
 * 저장소 없음: 클립 데이터(영상 ID/구간/텍스트)는 전부 URL 파라미터.
 */

(function () {
    'use strict';

    const frame = document.getElementById('clip-frame');
    const errBox = document.getElementById('clip-error');
    const params = YTUtils.validateClipParams(new URLSearchParams(location.search));

    if (!params) {
        errBox.hidden = false;
        return;
    }

    const barTop = document.getElementById('bar-top');
    const barBottom = document.getElementById('bar-bottom');
    barTop.textContent = params.t;
    barTop.hidden = params.t.length === 0;
    barBottom.textContent = params.b;
    barBottom.hidden = params.b.length === 0;
    frame.hidden = false;

    let player = null;
    let loopTimer = null;

    window.onYouTubeIframeAPIReady = function () {
        player = new YT.Player('yt-player', {
            videoId: params.v,
            playerVars: { start: Math.floor(params.s), rel: 0 },
            events: {
                onStateChange: function (e) {
                    // end 파라미터는 seek 후 무시되므로 인터벌로 구간 루프 유지
                    if (e.data === YT.PlayerState.PLAYING && !loopTimer) {
                        loopTimer = setInterval(function () {
                            if (player.getCurrentTime() >= params.e) player.seekTo(params.s, true);
                        }, 200);
                    }
                },
                onError: function () {
                    frame.hidden = true;
                    errBox.textContent = 'This video is unavailable, private, or embedding is disabled.';
                    errBox.hidden = false;
                }
            }
        });
    };

    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
})();

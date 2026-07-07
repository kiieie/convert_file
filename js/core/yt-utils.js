/**
 * ==========================================================================
 * ConvertFile - YouTube URL & Clip Param Utilities (yt-utils.js)
 * ==========================================================================
 */

(function (global) {
    'use strict';

    const ID_RE = /^[A-Za-z0-9_-]{11}$/;

    function parseTimeParam(v) {
        if (!v || typeof v !== 'string') return null;
        if (/^\d+$/.test(v)) return parseInt(v, 10);
        const m = v.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
        if (!m || (!m[1] && !m[2] && !m[3])) return null;
        return (parseInt(m[1] || 0, 10) * 3600) + (parseInt(m[2] || 0, 10) * 60) + parseInt(m[3] || 0, 10);
    }

    function parseYouTubeUrl(input) {
        if (!input || typeof input !== 'string') return null;
        let url;
        try {
            url = new URL(input.trim());
        } catch (e) {
            return null;
        }
        const host = url.hostname.replace(/^(www\.|m\.)/, '');
        let id = null;
        if (host === 'youtu.be') {
            id = url.pathname.slice(1).split('/')[0];
        } else if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
            if (url.pathname === '/watch') {
                id = url.searchParams.get('v');
            } else {
                const m = url.pathname.match(/^\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
                if (m) id = m[2];
            }
        }
        if (!id || !ID_RE.test(id)) return null;
        return { id: id, start: parseTimeParam(url.searchParams.get('t') || url.searchParams.get('start')) };
    }

    function validateClipParams(sp) {
        const v = sp.get('v');
        const s = parseFloat(sp.get('s'));
        const e = parseFloat(sp.get('e'));
        if (!v || !ID_RE.test(v)) return null;
        if (!isFinite(s) || !isFinite(e) || s < 0 || e <= s) return null;
        return { v: v, s: s, e: e, t: sp.get('t') || '', b: sp.get('b') || '' };
    }

    function buildClipUrl(base, p) {
        const q = new URLSearchParams();
        q.set('v', p.v);
        q.set('s', String(p.s));
        q.set('e', String(p.e));
        if (p.t) q.set('t', p.t);
        if (p.b) q.set('b', p.b);
        return base + '?' + q.toString();
    }

    global.YTUtils = {
        parseYouTubeUrl: parseYouTubeUrl,
        parseTimeParam: parseTimeParam,
        validateClipParams: validateClipParams,
        buildClipUrl: buildClipUrl
    };
})(typeof window !== 'undefined' ? window : globalThis);

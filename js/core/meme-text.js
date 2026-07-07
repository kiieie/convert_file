/**
 * ==========================================================================
 * ConvertFile - Meme Text Rendering Helpers (meme-text.js)
 * ==========================================================================
 */

(function (global) {
    'use strict';

    function wrapLines(measure, text, maxWidth) {
        const words = String(text).split(' ');
        const lines = [];
        let current = words[0] || '';
        for (let i = 1; i < words.length; i++) {
            if (measure(current + ' ' + words[i]) < maxWidth) {
                current += ' ' + words[i];
            } else {
                lines.push(current);
                current = words[i];
            }
        }
        lines.push(current);
        return lines;
    }

    function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, isTop) {
        const lines = wrapLines(function (s) { return ctx.measureText(s).width; }, text, maxWidth);
        if (isTop) {
            lines.forEach(function (line, i) {
                ctx.fillText(line, x, y + (i * lineHeight));
                ctx.strokeText(line, x, y + (i * lineHeight));
            });
        } else {
            const totalH = (lines.length - 1) * lineHeight;
            lines.forEach(function (line, i) {
                ctx.fillText(line, x, y - totalH + (i * lineHeight));
                ctx.strokeText(line, x, y - totalH + (i * lineHeight));
            });
        }
    }

    global.MemeText = { wrapLines: wrapLines, drawWrappedText: drawWrappedText };
})(typeof window !== 'undefined' ? window : globalThis);

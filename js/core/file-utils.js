/**
 * ==========================================================================
 * ConvertFile - File Utilities Module
 * ==========================================================================
 * 파일 매직바이트 포맷 감지, 용량 가독성 포맷팅 및
 * 브라우저 파일 가상 다운로드 이벤트를 담당하는 공통 헬퍼.
 */

window.FileUtils = {
    /**
     * 임의의 URL(Data URL, Object URL 등)을 파일로 즉시 다운로드 처리합니다.
     * @param {string} url - 다운로드 대상 리소스 주소
     * @param {string} filename - 다운로드될 파일명
     */
    downloadFile: function(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // 브라우저 리소스 해제
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    },

    /**
     * Blob 객체를 파일로 즉시 다운로드 처리합니다.
     * @param {Blob} blob - 다운로드 대상 블롭 객체
     * @param {string} filename - 다운로드될 파일명
     */
    downloadBlob: function(blob, filename) {
        const url = URL.createObjectURL(blob);
        this.downloadFile(url, filename);
        
        // Object URL 파기
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 150);
    },

    /**
     * Canvas 그래픽 데이터를 지정된 이미지 포맷으로 다운로드합니다.
     * @param {HTMLCanvasElement} canvas - 소스 캔버스
     * @param {string} format - 파일 포맷 ('image/jpeg'|'image/png'|'image/webp')
     * @param {string} filename - 타겟 파일명
     * @param {number} quality - 인코딩 퀄리티 (0.1 ~ 1.0)
     */
    downloadCanvas: function(canvas, format, filename, quality = 0.92) {
        canvas.toBlob((blob) => {
            if (blob) {
                this.downloadBlob(blob, filename);
            } else {
                console.error("Canvas toBlob 변환 실패.");
            }
        }, format, quality);
    },

    /**
     * 파일 이름에서 확장자를 추출하거나 제거하여 기본 저장용 템플릿 명칭을 반환합니다.
     * @param {string} filename - 파일 이름
     * @param {string} suffix - 덧붙일 접미사
     * @param {string} newExt - 변경할 확장자 (생략 시 기존 확장자 유지)
     */
    getDownloadName: function(filename, suffix, newExt = '') {
        const lastDot = filename.lastIndexOf('.');
        if (lastDot === -1) {
            return `${filename}${suffix}${newExt ? '.' + newExt : ''}`;
        }
        
        const base = filename.substring(0, lastDot);
        const ext = newExt ? newExt : filename.substring(lastDot + 1);
        return `${base}${suffix}.${ext}`;
    },

    /**
     * 파일의 매직 바이트(바이너리 헤더)를 검사하여 실제 MIME 타입을 파싱합니다.
     * 확장자 스푸핑 방지 및 구글 애드센스 보안 요구사항 부합용.
     * @param {File} file - 업로드된 원본 파일 객체
     * @returns {Promise<string>} 실제 감지된 MIME 형식
     */
    detectFormatByHeader: function(file) {
        return new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.onloadend = function(e) {
                if (e.target.readyState !== FileReader.DONE) {
                    resolve(file.type);
                    return;
                }

                const arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                let header = "";
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16).padStart(2, '0');
                }

                // 대표적인 이미지 매직바이트 분류
                let mime = file.type; // 기본값
                switch (header) {
                    case "89504e47":
                        mime = "image/png";
                        break;
                    case "47494638":
                        mime = "image/gif";
                        break;
                    case "ffd8ffe0":
                    case "ffd8ffe1":
                    case "ffd8ffe2":
                    case "ffd8ffe3":
                    case "ffd8ffe8":
                        mime = "image/jpeg";
                        break;
                    case "424d":
                        mime = "image/bmp";
                        break;
                    case "25504446":
                        mime = "application/pdf";
                        break;
                    default:
                        // WebP, RIFF 매직바이트 패턴 추가 검증
                        if (header.startsWith("52494646") && header.endsWith("57454250")) {
                            mime = "image/webp";
                        }
                        break;
                }
                resolve(mime);
            };
            // 파일 첫 8바이트 로딩
            const blob = file.slice(0, 8);
            fileReader.readAsArrayBuffer(blob);
        });
    },

    /**
     * 바이트 단위를 읽기 편한 크기로 포맷팅합니다.
     * @param {number} bytes - 바이트 수
     * @returns {string} 1.25 MB, 450 KB 등의 텍스트
     */
    formatBytes: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};

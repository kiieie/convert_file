/**
 * ==========================================================================
 * ConvertFile - Image Loader Core Module
 * ==========================================================================
 * 드래그 앤 드롭, 파일 선택, URL 입력 및 클립보드 붙여넣기를 처리하여
 * 이미지를 HTMLImageElement로 로드하고 콜백하는 공통 유틸리티.
 */

window.ImageLoader = {
    /**
     * 드롭존 및 파일 선택기에 이벤트를 바인딩합니다.
     * @param {HTMLElement} dropZone - 드래그앤드롭 타겟 엘리먼트
     * @param {HTMLElement} fileInput - 파일 input 태그 엘리먼트
     * @param {Function} onImageLoaded - 이미지 로드 완료 시 콜백 (imgElement, fileInfo)
     * @param {Function} onError - 에러 발생 시 콜백
     */
    bind: function(dropZone, fileInput, onImageLoaded, onError) {
        if (!dropZone) return;

        // 드래그 상태 이벤트 정의
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('modern-upload-zone--dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('modern-upload-zone--dragover');
            }, false);
        });

        // 파일 드롭 핸들러
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                this.loadFile(files[0], onImageLoaded, onError);
            }
        });

        // 드롭존 클릭 시 파일 선택기 작동
        dropZone.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });

        // 파일 선택기 변경 이벤트
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.loadFile(e.target.files[0], onImageLoaded, onError);
                }
            });
        }

        // 전역 클립보드 붙여넣기 바인딩 (선택 사항)
        document.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                    const blob = item.getAsFile();
                    this.loadFile(blob, onImageLoaded, onError);
                }
            }
        });
    },

    /**
     * 개별 File(또는 Blob)을 읽어 HTMLImageElement로 가공 후 로딩을 수행합니다.
     * @param {File|Blob} file - 업로드된 이미지 파일
     * @param {Function} successCallback - 성공 핸들러
     * @param {Function} errorCallback - 에러 핸들러
     */
    loadFile: function(file, successCallback, errorCallback) {
        // 이미지 포맷 검사
        if (!file.type.match('image.*') && !file.name.endsWith('.heic') && !file.name.endsWith('.avif')) {
            if (errorCallback) {
                errorCallback("지원하지 않는 파일 형식입니다. 이미지 파일을 선택하십시오.");
            }
            return;
        }

        // 파일 크기 체크 (25MB 제한)
        const maxBytes = 25 * 1024 * 1024;
        if (file.size > maxBytes) {
            if (errorCallback) {
                errorCallback("파일 크기가 너무 큽니다. 25MB 이하의 파일만 지원됩니다.");
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const fileInfo = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    width: img.naturalWidth,
                    height: img.naturalHeight
                };
                successCallback(img, fileInfo);
            };
            img.onerror = () => {
                if (errorCallback) errorCallback("이미지를 디코딩하는 중에 오류가 발생했습니다.");
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            if (errorCallback) errorCallback("파일을 읽는 중에 오류가 발생했습니다.");
        };
        reader.readAsDataURL(file);
    }
};

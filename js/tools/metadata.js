/**
 * ==========================================================================
 * ConvertFile - EXIF Metadata Viewer & Stripper Business Logic
 * ==========================================================================
 */

(function() {
    // 1. DOM 핸들러
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewCanvas = document.getElementById('preview-canvas');
    
    const noTagsMsg = document.getElementById('no-tags-msg');
    const metadataTable = document.getElementById('metadata-table');
    const metadataTbody = document.getElementById('metadata-tbody');
    const btnStrip = document.getElementById('btn-strip');
    
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    // 2. 상태 변수
    let rawFile = null;          // 원본 File 객체
    let rawArrayBuffer = null;  // 원본 ArrayBuffer

    // 테스트 및 모듈 단위 처리를 위한 EXIF 파서/스트리퍼 전역 노출
    const MetadataParser = {
        parseExif: function(view) {
            return parseExif(view);
        },
        stripExifBytes: function(arrayBuffer) {
            return stripExifBytes(arrayBuffer);
        }
    };
    window.MetadataParser = MetadataParser;

    // 3. 파일 로드 이벤트 바인딩 (이 툴은 바이너리 스캔이 필수이므로 직접 이벤트 가로챔)
    if (dropZone) {
        dropZone.addEventListener('dragenter', dragHandler);
        dropZone.addEventListener('dragover', dragHandler);
        dropZone.addEventListener('dragleave', dragHandler);
        dropZone.addEventListener('drop', dropHandler);
        dropZone.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processRawFile(e.target.files[0]);
            }
        });
    }

    function dragHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            dropZone.classList.add('xp-upload-zone--dragover');
        } else {
            dropZone.classList.remove('xp-upload-zone--dragover');
        }
    }

    function dropHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('xp-upload-zone--dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processRawFile(files[0]);
        }
    }

    /**
     * 파일 업로드 시 이미지를 Canvas에 드로잉하고, 동시에 ArrayBuffer로 로드하여 EXIF 분석을 진행합니다.
     */
    function processRawFile(file) {
        if (!file.type.match('image/jpeg') && !file.name.endsWith('.jpg') && !file.name.endsWith('.jpeg')) {
            UIComponents.showErrorDialog("JPEG Format Constraint", "본 도구는 EXIF 파싱 사양에 따라 JPEG(.jpg/.jpeg) 포맷의 사진만 지원합니다.");
            return;
        }

        rawFile = file;

        // 1) 프리뷰 그리기
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                dropZone.style.display = 'none';
                previewContainer.style.display = 'flex';
                
                // 프리뷰 캔버스 렌더링
                const maxDisplayWidth = Math.min(450, previewContainer.clientWidth - 40);
                let displayWidth = img.naturalWidth;
                let displayHeight = img.naturalHeight;
                if (displayWidth > maxDisplayWidth) {
                    const ratio = maxDisplayWidth / displayWidth;
                    displayWidth = maxDisplayWidth;
                    displayHeight = img.naturalHeight * ratio;
                }
                
                previewCanvas.width = displayWidth;
                previewCanvas.height = displayHeight;
                previewCanvas.getContext('2d').drawImage(img, 0, 0, displayWidth, displayHeight);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 2) 바이너리 분석 진행
        const binReader = new FileReader();
        binReader.onload = function(e) {
            rawArrayBuffer = e.target.result;
            
            // EXIF 데이터 구조 스캔 및 파싱
            const exifTags = parseExif(new DataView(rawArrayBuffer));
            
            renderTags(exifTags);
            
            btnStrip.removeAttribute('disabled');
            statusText.textContent = `불러온 파일: ${file.name}`;
            statusInfo.textContent = `${FileUtils.formatBytes(file.size)}`;
        };
        binReader.readAsArrayBuffer(file);
    }

    /**
     * JPEG DataView를 스캔하여 주요 EXIF 촬영 속성 목록을 분석합니다.
     * (TIFF 헤더 및 태그 오프셋 계산 수동 구현)
     */
    function parseExif(view) {
        const tags = {};
        
        // 1) JPEG SOI(0xFFD8) 마커 검사
        if (view.getUint16(0) !== 0xFFD8) {
            return { "Error": "유효한 JPEG 이미지 파일이 아닙니다." };
        }

        let offset = 2;
        let length = view.byteLength;
        let app1Offset = 0;

        // 2) APP1 (0xFFE1) 세그먼트 스캔 루프
        while (offset < length) {
            if (view.getUint16(offset) === 0xFFE1) {
                // APP1 마커 발견!
                app1Offset = offset;
                break;
            }
            // 세그먼트 스킵 (마커 2바이트 + 길이 지시자 2바이트 값)
            const segLength = view.getUint16(offset + 2);
            offset += 2 + segLength;
        }

        if (app1Offset === 0) {
            return { "안내": "이 사진에는 EXIF 메타데이터(APP1 세그먼트)가 존재하지 않습니다. 이미 보안이 안전한 상태입니다." };
        }

        // 3) APP1 데이터 파싱 ("Exif\0\0" 헤더 6바이트 체크)
        let exifOffset = app1Offset + 4; // 마커(2) + 길이(2)
        if (view.getUint32(exifOffset) === 0x45786966 && view.getUint16(exifOffset + 4) === 0x0000) {
            // TIFF 헤더 시작점
            const tiffOffset = exifOffset + 6;
            
            // 바이트 오더 확인 ("II" = 리틀엔디안(0x4949), "MM" = 빅엔디안(0x4d4d))
            const byteOrder = view.getUint16(tiffOffset);
            const littleEndian = (byteOrder === 0x4949);
            
            if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002A) {
                return { "Error": "올바른 TIFF 헤더 검증에 실패했습니다." };
            }

            // 첫 IFD(Image File Directory) 오프셋
            const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);
            let dirOffset = tiffOffset + firstIFDOffset;

            // IFD0 항목 개수
            const entriesCount = view.getUint16(dirOffset, littleEndian);
            dirOffset += 2;

            // 주요 EXIF 태그 맵핑 테이블
            const tagMap = {
                0x010F: "제조사 (Make)",
                0x0110: "카메라 기종 (Model)",
                0x0132: "촬영 일시 (DateTime)",
                0x8825: "GPS 정보 오프셋"
            };

            for (let i = 0; i < entriesCount; i++) {
                const tag = view.getUint16(dirOffset + (i * 12), littleEndian);
                if (tagMap[tag]) {
                    const type = view.getUint16(dirOffset + (i * 12) + 2, littleEndian);
                    const count = view.getUint32(dirOffset + (i * 12) + 4, littleEndian);
                    const valOffset = view.getUint32(dirOffset + (i * 12) + 8, littleEndian) + tiffOffset;

                    // 텍스트 ASCII 형식 태그 정보 추출
                    if (type === 2) { 
                        let str = "";
                        for (let j = 0; j < count - 1; j++) {
                            str += String.fromCharCode(view.getUint8(valOffset + j));
                        }
                        tags[tagMap[tag]] = str.trim();
                    }
                }
            }
        }

        // 태그가 아무것도 검출되지 않은 경우 기본 안내 제공
        if (Object.keys(tags).length === 0) {
            return { "EXIF 상태": "세그먼트는 있으나 주요 카메라 제조 태그 정보가 누락되어 있습니다." };
        }

        return tags;
    }

    /**
     * 메타데이터 분석 딕셔너리를 받아서 HTML 테이블에 주입 렌더링합니다.
     */
    function renderTags(tags) {
        noTagsMsg.style.display = 'none';
        metadataTable.style.display = 'table';
        metadataTbody.innerHTML = "";

        for (let key in tags) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${key}</b></td>
                <td>${tags[key]}</td>
            `;
            metadataTbody.appendChild(tr);
        }
    }

    /**
     * JPEG ArrayBuffer로부터 EXIF APP1 세그먼트를 발라내고 무손실 가공된 새 Uint8Array를 반환합니다.
     */
    function stripExifBytes(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const bytes = new Uint8Array(arrayBuffer);
        
        let offset = 2;
        let length = bytes.length;
        let app1Segments = [];

        // 세그먼트 스캔하여 지울 EXIF APP1 세그먼트 좌표 획득
        while (offset < length) {
            const marker = view.getUint16(offset);
            if (marker === 0xFFD9) break; // EOI (End of Image) 도달 시 종료

            // 세그먼트 길이 파싱
            const segLength = view.getUint16(offset + 2);
            
            if (marker === 0xFFE1) {
                // APP1 (EXIF) 마커 발견 시 제거 리스트에 영역 추가
                app1Segments.push({
                    start: offset,
                    end: offset + 2 + segLength
                });
            }
            offset += 2 + segLength;
        }

        if (app1Segments.length === 0) {
            return bytes;
        }

        // 슬라이싱 조각들을 담을 배열 생성
        const cleanChunks = [];
        let lastIndex = 0;

        app1Segments.forEach(seg => {
            // 제거할 세그먼트 이전 범위까지를 정상 청크로 합침
            if (seg.start > lastIndex) {
                cleanChunks.push(bytes.subarray(lastIndex, seg.start));
            }
            lastIndex = seg.end; // 지울 세그먼트 종료점을 마지막 인덱스로 건너뜀
        });

        // 마지막 세그먼트 이후부터 파일 끝까지의 데이터 결합
        if (lastIndex < length) {
            cleanChunks.push(bytes.subarray(lastIndex, length));
        }

        // 청크 병합
        const totalLength = cleanChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const cleanBytes = new Uint8Array(totalLength);
        let currentOffset = 0;
        cleanChunks.forEach(chunk => {
            cleanBytes.set(chunk, currentOffset);
            currentOffset += chunk.length;
        });

        return cleanBytes;
    }

    // 7. 무손실 EXIF 세그먼트 바이트 제거 실행 및 저장
    btnStrip.addEventListener('click', () => {
        if (!rawArrayBuffer) return;

        const prog = UIComponents.showProgressDialog("메타데이터 영구 박멸 중", "무손실 바이트 슬라이싱 작업을 개시하고 있습니다...");

        setTimeout(() => {
            try {
                prog.updateProgress(40, "바이트 배열 오프셋 검출 중...");
                
                prog.updateProgress(70, "무손실 바이트 슬라이싱 결합 중...");
                const cleanBytes = stripExifBytes(rawArrayBuffer);
                const cleanBlob = new Blob([cleanBytes], { type: 'image/jpeg' });

                prog.updateProgress(90, "보안 사진 파일 생성 배포 중...");

                const dlName = FileUtils.getDownloadName(rawFile.name, '_stripped');
                
                // 최종 내보내기 다운로드
                FileUtils.downloadBlob(cleanBlob, dlName);

                prog.updateProgress(100, "개인정보 보호 작업 완료!");
                
                setTimeout(() => {
                    prog.close();
                    
                    // UI 상태도 초기화
                    noTagsMsg.style.display = 'block';
                    noTagsMsg.textContent = "메타데이터가 안전하게 제거되어 새 파일이 다운로드되었습니다.";
                    metadataTable.style.display = 'none';
                    btnStrip.setAttribute('disabled', 'true');
                }, 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Stripping Exception", `바이너리 슬라이싱 중 결함: ${err.message}`);
            }
        }, 300);
    });
})();

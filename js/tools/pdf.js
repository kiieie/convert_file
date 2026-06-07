/**
 * ==========================================================================
 * ConvertFile - PDF to/from Image Converter Business Logic (pdf.js)
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const imgDropZone = document.getElementById('img-drop-zone');
    const imgFileInput = document.getElementById('img-file-input');
    const addedImagesCard = document.getElementById('added-images-card');
    const addedImagesList = document.getElementById('added-images-list');

    const pdfDropZone = document.getElementById('pdf-drop-zone');
    const pdfFileInput = document.getElementById('pdf-file-input');
    const pdfInfoCard = document.getElementById('pdf-info-card');
    const pdfFileSummary = document.getElementById('pdf-file-summary');

    const pdfPageSize = document.getElementById('pdf-page-size');
    const pdfPageOrientation = document.getElementById('pdf-page-orientation');
    const pdfPageMargin = document.getElementById('pdf-page-margin');

    const pdfOutFormat = document.getElementById('pdf-out-format');
    const pdfOutScale = document.getElementById('pdf-out-scale');

    const btnRunPdf = document.getElementById('btn-run-pdf');

    // PDF 끼리 병합 요소
    const pdfMergeDropZone = document.getElementById('pdf-merge-drop-zone');
    const pdfMergeFileInput = document.getElementById('pdf-merge-file-input');
    const addedPdfsCard = document.getElementById('added-pdfs-card');
    const addedPdfsList = document.getElementById('added-pdfs-list');

    // PDF 분할 요소
    const splitModeRadios = document.querySelectorAll('input[name="pdf-split-mode"]');
    const splitRangeGroup = document.getElementById('split-range-group');
    const splitRangeInput = document.getElementById('split-range-input');

    // PDF 편집 요소
    const editCompress = document.getElementById('edit-compress');
    const editDeleteRange = document.getElementById('edit-delete-range');
    const editRotateRange = document.getElementById('edit-rotate-range');
    const editRotateAngle = document.getElementById('edit-rotate-angle');
    const editWatermarkText = document.getElementById('edit-watermark-text');
    const editWatermarkSize = document.getElementById('edit-watermark-size');
    const editWatermarkOpacity = document.getElementById('edit-watermark-opacity');
    const editPageNumber = document.getElementById('edit-page-number');

    // 2. 상태 변수
    let pdfMode = 'img-to-pdf'; // 'img-to-pdf' | 'pdf-to-img' | 'pdf-merge' | 'pdf-split' | 'pdf-edit'
    let selectedImages = [];     // 이미지 병합 타겟 파일 어레이 [{file, dataUrl, name}]
    let selectedPdfFile = null;  // PDF 분할/추출/편집 타겟 파일
    let selectedPdfMergeFiles = []; // PDF 끼리 병합 타겟 파일 어레이 [{file, name}]

    // 전역 스위칭 바인딩
    window.setPdfMode = function(mode) {
        pdfMode = mode;
        updateSubmitButtonState();
    };

    function updateSubmitButtonState() {
        if (pdfMode === 'img-to-pdf') {
            btnRunPdf.disabled = selectedImages.length === 0;
        } else if (pdfMode === 'pdf-merge') {
            btnRunPdf.disabled = selectedPdfMergeFiles.length === 0;
        } else {
            btnRunPdf.disabled = !selectedPdfFile;
        }
    }

    // ==========================================================================
    // 탭 1: 이미지 -> PDF 로직
    // ==========================================================================
    if (imgDropZone && imgFileInput) {
        imgDropZone.addEventListener('click', () => imgFileInput.click());

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            imgDropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            imgDropZone.addEventListener(eventName, () => {
                imgDropZone.style.borderColor = 'var(--blue-600)';
                imgDropZone.style.backgroundColor = '#EFF6FF';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            imgDropZone.addEventListener(eventName, () => {
                imgDropZone.style.borderColor = 'var(--blue-500)';
                imgDropZone.style.backgroundColor = 'var(--slate-50)';
            }, false);
        });

        imgDropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) addImageFiles(files);
        });

        imgFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) addImageFiles(e.target.files);
        });
    }

    function addImageFiles(files) {
        let loadedCount = 0;
        const targetCount = files.length;
        
        for (let i = 0; i < targetCount; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImages.push({
                    file: file,
                    dataUrl: e.target.result,
                    name: file.name
                });
                loadedCount++;

                if (loadedCount === targetCount || i === targetCount - 1) {
                    renderImageThumbnails();
                    updateSubmitButtonState();
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function renderImageThumbnails() {
        if (selectedImages.length === 0) {
            addedImagesCard.style.display = 'none';
            return;
        }

        addedImagesCard.style.display = 'block';
        addedImagesList.innerHTML = '';

        selectedImages.forEach((imgObj, idx) => {
            const item = document.createElement('div');
            item.className = 'image-file-item';
            item.innerHTML = `
                <div class="image-file-item__remove" data-index="${idx}">×</div>
                <img src="${imgObj.dataUrl}" alt="Thumb">
                <div class="image-file-item__name">${imgObj.name}</div>
            `;
            addedImagesList.appendChild(item);
        });

        // 썸네일 지우기 액션 바인딩
        const deleteButtons = addedImagesList.querySelectorAll('.image-file-item__remove');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 드롭존 클릭 유발 방지
                const idx = parseInt(btn.getAttribute('data-index'));
                selectedImages.splice(idx, 1);
                renderImageThumbnails();
                updateSubmitButtonState();
            });
        });
    }

    // ==========================================================================
    // 탭 2: PDF -> 이미지 로직
    // ==========================================================================
    if (pdfDropZone && pdfFileInput) {
        pdfDropZone.addEventListener('click', () => pdfFileInput.click());

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            pdfDropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            pdfDropZone.addEventListener(eventName, () => {
                pdfDropZone.style.borderColor = 'var(--blue-600)';
                pdfDropZone.style.backgroundColor = '#EFF6FF';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            pdfDropZone.addEventListener(eventName, () => {
                pdfDropZone.style.borderColor = 'var(--blue-500)';
                pdfDropZone.style.backgroundColor = 'var(--slate-50)';
            }, false);
        });

        pdfDropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) loadPdfFile(files[0]);
        });

        pdfFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) loadPdfFile(e.target.files[0]);
        });
    }

    function loadPdfFile(file) {
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
            UIComponents.showErrorDialog("Invalid File Format", "PDF 문서 파일 규격이 아닙니다. 정확한 확장자 파일을 선택하십시오.");
            return;
        }

        selectedPdfFile = file;

        // 메타데이터 요약 출력
        pdfInfoCard.style.display = 'block';
        pdfFileSummary.textContent = `${file.name} (${FileUtils.formatBytes(file.size)})`;

        updateSubmitButtonState();
    }

    // ==========================================================================
    // 탭 3: PDF 끼리 병합 로직
    // ==========================================================================
    if (pdfMergeDropZone && pdfMergeFileInput) {
        pdfMergeDropZone.addEventListener('click', () => pdfMergeFileInput.click());

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            pdfMergeDropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            pdfMergeDropZone.addEventListener(eventName, () => {
                pdfMergeDropZone.style.borderColor = 'var(--blue-600)';
                pdfMergeDropZone.style.backgroundColor = '#EFF6FF';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            pdfMergeDropZone.addEventListener(eventName, () => {
                pdfMergeDropZone.style.borderColor = 'var(--blue-500)';
                pdfMergeDropZone.style.backgroundColor = 'var(--slate-50)';
            }, false);
        });

        pdfMergeDropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) addMergePdfs(files);
        });

        pdfMergeFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) addMergePdfs(e.target.files);
        });
    }

    function addMergePdfs(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) continue;
            selectedPdfMergeFiles.push({
                file: file,
                name: file.name
            });
        }
        renderMergePdfs();
        updateSubmitButtonState();
    }

    function renderMergePdfs() {
        if (selectedPdfMergeFiles.length === 0) {
            addedPdfsCard.style.display = 'none';
            return;
        }

        addedPdfsCard.style.display = 'block';
        addedPdfsList.innerHTML = '';

        selectedPdfMergeFiles.forEach((pdfObj, idx) => {
            const item = document.createElement('div');
            item.className = 'image-file-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.width = '100%';
            item.style.padding = '8px';
            item.style.border = '1px solid var(--slate-200)';
            item.style.borderRadius = 'var(--radius-sm)';
            item.style.backgroundColor = '#FFFFFF';
            item.innerHTML = `
                <div style="font-size:12px; color:var(--slate-700); font-weight:500; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:80%;">${idx + 1}. ${pdfObj.name}</div>
                <div class="pdf-file-item__remove" data-index="${idx}" style="color:var(--error); font-weight:bold; cursor:pointer; font-size:14px; padding:0 6px;">×</div>
            `;
            addedPdfsList.appendChild(item);
        });

        const deleteButtons = addedPdfsList.querySelectorAll('.pdf-file-item__remove');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                selectedPdfMergeFiles.splice(idx, 1);
                renderMergePdfs();
                updateSubmitButtonState();
            });
        });
    }

    // ==========================================================================
    // 탭 4: PDF 분할 라디오 제어
    // ==========================================================================
    if (splitModeRadios) {
        splitModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'range') {
                    splitRangeGroup.style.display = 'block';
                } else {
                    splitRangeGroup.style.display = 'none';
                }
            });
        });
    }

    // ==========================================================================
    // 변환 실행 및 트리거 공통 리스너
    // ==========================================================================
    btnRunPdf.addEventListener('click', () => {
        if (pdfMode === 'img-to-pdf') {
            runImageToPdf();
        } else if (pdfMode === 'pdf-to-img') {
            runPdfToImage();
        } else if (pdfMode === 'pdf-merge') {
            runPdfMerge();
        } else if (pdfMode === 'pdf-split') {
            runPdfSplit();
        } else if (pdfMode === 'pdf-edit') {
            runPdfEdit();
        }
    });

    // 1. 이미지들을 하나의 PDF 파일로 병합
    async function runImageToPdf() {
        if (selectedImages.length === 0) return;

        const prog = UIComponents.showProgressDialog(
            "PDF 병합 가동 중",
            "가상 도화지에 이미지를 재배치하여 PDF로 결합하는 중..."
        );

        setTimeout(async () => {
            try {
                // PDF Document 인스턴스 빌드 (pdf-lib)
                const pdfDoc = await PDFLib.PDFDocument.create();

                const pageSize = pdfPageSize.value;
                const orientation = pdfPageOrientation.value;
                const margin = parseInt(pdfPageMargin.value);

                for (let i = 0; i < selectedImages.length; i++) {
                    prog.updateProgress(
                        Math.round((i / selectedImages.length) * 80),
                        `이미지 프레임 인코딩 중... (${i + 1} / ${selectedImages.length})`
                    );

                    const imgObj = selectedImages[i];
                    
                    // 이미지 바이트 바이너리 추출
                    const imgBytes = await fetch(imgObj.dataUrl).then(res => res.arrayBuffer());
                    
                    let pdfImage = null;
                    if (imgObj.file.type === 'image/png') {
                        pdfImage = await pdfDoc.embedPng(imgBytes);
                    } else {
                        // jpeg 및 기타 포맷 (JPG 보정 지원)
                        pdfImage = await pdfDoc.embedJpg(imgBytes);
                    }

                    // 원본 사이즈 획득
                    const imgWidth = pdfImage.width;
                    const imgHeight = pdfImage.height;

                    let pageWidth = imgWidth;
                    let pageHeight = imgHeight;

                    // A4 표준 규격 대응 (A4 기준 포인트: 595.27 x 841.89)
                    if (pageSize === 'A4') {
                        if (orientation === 'portrait') {
                            pageWidth = 595.27;
                            pageHeight = 841.89;
                        } else {
                            pageWidth = 841.89;
                            pageHeight = 595.27;
                        }
                    }

                    // 여백을 뺀 실제 이미지 탑재 영역 계산
                    const fitWidth = pageWidth - (margin * 2);
                    const fitHeight = pageHeight - (margin * 2);

                    // 종횡비 보존 비율 스케일 팩터 계산
                    const scaleFactor = Math.min(fitWidth / imgWidth, fitHeight / imgHeight);
                    const drawWidth = imgWidth * scaleFactor;
                    const drawHeight = imgHeight * scaleFactor;

                    // 여백 정중앙 배치를 위한 오프셋 연산
                    const offsetX = margin + (fitWidth - drawWidth) / 2;
                    const offsetY = margin + (fitHeight - drawHeight) / 2;

                    // PDF 페이지 추가
                    const page = pdfDoc.addPage([pageWidth, pageHeight]);
                    
                    // 이미지 드로잉
                    page.drawImage(pdfImage, {
                        x: offsetX,
                        y: offsetY,
                        width: drawWidth,
                        height: drawHeight
                    });
                }

                prog.updateProgress(90, "PDF 바이너리 스트림 취합 중...");

                const pdfBytes = await pdfDoc.save();
                
                // Blob 다운로드 트리거
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                FileUtils.downloadFile(URL.createObjectURL(blob), 'merged_images.pdf');

                prog.updateProgress(100, "병합 완료!");
                setTimeout(() => prog.close(), 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("PDF Merge Fail", `PDF 문서 묶기 도중 에러가 일어났습니다: ${err.message}`);
            }
        }, 100);
    }

    // 2. PDF 문서를 각 페이지별 이미지로 분할 및 ZIP 패키징
    function runPdfToImage() {
        if (!selectedPdfFile) return;

        const prog = UIComponents.showProgressDialog(
            "PDF 디코딩 중",
            "PDF 문서의 렌더 트리를 빌드하고 있습니다..."
        );

        const fileReader = new FileReader();
        fileReader.onload = function() {
            const arrayBuffer = this.result;

            setTimeout(async () => {
                try {
                    // pdfjs-dist 라이브러리 가동
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    const totalPages = pdf.numPages;

                    if (totalPages === 0) {
                        throw new Error("문서 내에 추출 가능한 페이지가 비어 있습니다.");
                    }

                    // JSZip 인스턴스 빌드
                    const zip = new JSZip();
                    const format = pdfOutFormat.value;
                    const scale = parseFloat(pdfOutScale.value);
                    const ext = format === 'image/png' ? 'png' : 'jpg';

                    // 페이지별 순차 Canvas 렌더 추출 루프
                    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                        prog.updateProgress(
                            Math.round((pageNum / totalPages) * 85),
                            `페이지 디코딩 및 이미지 렌더링 중... (${pageNum} / ${totalPages})`
                        );

                        const page = await pdf.getPage(pageNum);
                        const viewport = page.getViewport({ scale: scale });

                        // 렌더링 전용 가상 캔버스 생성
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext('2d');

                        // PDF 페이지를 2D 캔버스 컨텍스트에 직접 렌더링
                        await page.render({
                            canvasContext: ctx,
                            viewport: viewport
                        }).promise;

                        // Canvas 비트맵에서 데이터 Base64 문자열 추출
                        const imgDataUrl = canvas.toDataURL(format, 0.92);
                        const base64Data = imgDataUrl.split(',')[1];

                        // ZIP 파일 구조 내 프레임 추가
                        zip.file(`page_${pageNum}.${ext}`, base64Data, { base64: true });
                    }

                    prog.updateProgress(90, "이미지 묶음 파일 ZIP 패키징 중...");

                    // ZIP 아카이브 압축 압축 생성
                    const zipContent = await zip.generateAsync({ type: 'blob' });
                    
                    // 파일 다운로드
                    const downloadName = FileUtils.getDownloadName(selectedPdfFile.name, '_pages', 'zip');
                    FileUtils.downloadFile(URL.createObjectURL(zipContent), downloadName);

                    prog.updateProgress(100, "추출 완료!");
                    setTimeout(() => prog.close(), 400);

                } catch (err) {
                    prog.close();
                    UIComponents.showErrorDialog("PDF Extraction Crashed", `PDF 해독 및 이미지 추출에 실패했습니다: ${err.message}`);
                }
            }, 100);
        };
        fileReader.readAsArrayBuffer(selectedPdfFile);
    }

    // 3. PDF 끼리 병합 실행
    async function runPdfMerge() {
        if (selectedPdfMergeFiles.length === 0) return;

        const prog = UIComponents.showProgressDialog(
            "PDF 병합 가동 중",
            "여러 PDF 문서를 하나로 결합하고 있습니다..."
        );

        setTimeout(async () => {
            try {
                const mergedPdf = await PDFLib.PDFDocument.create();

                for (let i = 0; i < selectedPdfMergeFiles.length; i++) {
                    prog.updateProgress(
                        Math.round((i / selectedPdfMergeFiles.length) * 80),
                        `PDF 파일 복사 중... (${i + 1} / ${selectedPdfMergeFiles.length})`
                    );

                    const pdfObj = selectedPdfMergeFiles[i];
                    const pdfBytes = await pdfObj.file.arrayBuffer();
                    const srcDoc = await PDFLib.PDFDocument.load(pdfBytes);
                    
                    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }

                prog.updateProgress(90, "PDF 바이너리 스트림 생성 중...");

                const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
                const blob = new Blob([mergedBytes], { type: 'application/pdf' });
                
                FileUtils.downloadFile(URL.createObjectURL(blob), 'merged_documents.pdf');

                prog.updateProgress(100, "병합 완료!");
                setTimeout(() => prog.close(), 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("PDF Merge Failure", `PDF 병합 도중 에러가 발생했습니다: ${err.message}`);
            }
        }, 100);
    }

    // 4. PDF 분할 실행
    async function runPdfSplit() {
        if (!selectedPdfFile) return;

        const splitMode = document.querySelector('input[name="pdf-split-mode"]:checked').value;
        
        const prog = UIComponents.showProgressDialog(
            "PDF 분할 준비 중",
            "PDF 원본 스트림을 분석하고 있습니다..."
        );

        setTimeout(async () => {
            try {
                const arrayBuffer = await selectedPdfFile.arrayBuffer();
                const srcDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const maxPages = srcDoc.getPageCount();

                if (splitMode === 'each') {
                    // Split each page into its own PDF and zip them
                    const zip = new JSZip();

                    for (let i = 0; i < maxPages; i++) {
                        prog.updateProgress(
                            Math.round((i / maxPages) * 80),
                            `페이지 분할 중... (${i + 1} / ${maxPages})`
                        );

                        const singlePageDoc = await PDFLib.PDFDocument.create();
                        const [copiedPage] = await singlePageDoc.copyPages(srcDoc, [i]);
                        singlePageDoc.addPage(copiedPage);

                        const singlePdfBytes = await singlePageDoc.save({ useObjectStreams: true });
                        zip.file(`page_${i + 1}.pdf`, singlePdfBytes);
                    }

                    prog.updateProgress(90, "개별 PDF 압축(ZIP) 진행 중...");
                    const zipContent = await zip.generateAsync({ type: 'blob' });
                    const downloadName = FileUtils.getDownloadName(selectedPdfFile.name, '_split_pages', 'zip');
                    FileUtils.downloadFile(URL.createObjectURL(zipContent), downloadName);

                } else {
                    // Extract specific range
                    const rangeStr = splitRangeInput.value.trim();
                    if (!rangeStr) {
                        throw new Error("추출할 페이지 범위를 입력해 주십시오.");
                    }

                    const pageIndices = parsePageRange(rangeStr, maxPages);
                    if (pageIndices.length === 0) {
                        throw new Error("유효한 페이지 범위가 존재하지 않습니다.");
                    }

                    prog.updateProgress(50, `지정된 ${pageIndices.length}개 페이지 추출 중...`);

                    const extractedDoc = await PDFLib.PDFDocument.create();
                    const copiedPages = await extractedDoc.copyPages(srcDoc, pageIndices);
                    copiedPages.forEach((page) => extractedDoc.addPage(page));

                    prog.updateProgress(85, "추출된 PDF 스트림 저장 중...");
                    const extractedBytes = await extractedDoc.save({ useObjectStreams: true });
                    const blob = new Blob([extractedBytes], { type: 'application/pdf' });
                    const downloadName = FileUtils.getDownloadName(selectedPdfFile.name, '_extracted', 'pdf');
                    FileUtils.downloadFile(URL.createObjectURL(blob), downloadName);
                }

                prog.updateProgress(100, "분할/추출 완료!");
                setTimeout(() => prog.close(), 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("PDF Split Failure", `PDF 분할 도중 에러가 발생했습니다: ${err.message}`);
            }
        }, 100);
    }

    // 5. PDF 편집 실행 (삭제, 회전, 압축)
    async function runPdfEdit() {
        if (!selectedPdfFile) return;

        const compress = editCompress.checked;
        const deleteRangeStr = editDeleteRange.value.trim();
        const rotateRangeStr = editRotateRange.value.trim();
        const rotateAngle = parseInt(editRotateAngle.value, 10);

        const prog = UIComponents.showProgressDialog(
            "PDF 편집 가동 중",
            "PDF 원본 구조를 읽어들이는 중..."
        );

        setTimeout(async () => {
            try {
                const arrayBuffer = await selectedPdfFile.arrayBuffer();
                const srcDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const maxPages = srcDoc.getPageCount();

                prog.updateProgress(30, "페이지 필터링 및 조작 처리 중...");

                // 역순으로 삭제 처리
                if (deleteRangeStr) {
                    const deleteIndices = parsePageRange(deleteRangeStr, maxPages);
                    
                    if (deleteIndices.length === maxPages) {
                        throw new Error("최소한 1개 이상의 페이지를 남겨두어야 합니다 (전체 삭제 불가).");
                    }

                    // 큰 인덱스부터 내림차순 정렬하여 순차 삭제
                    deleteIndices.sort((a, b) => b - a);
                    deleteIndices.forEach(idx => {
                        srcDoc.removePage(idx);
                    });
                }

                // 회전 적용 (남은 문서 기준으로 회전 처리)
                if (rotateRangeStr && rotateAngle !== 0) {
                    const remainingPagesCount = srcDoc.getPageCount();
                    const rotateIndices = parsePageRange(rotateRangeStr, remainingPagesCount);
                    
                    rotateIndices.forEach(idx => {
                        const page = srcDoc.getPage(idx);
                        const currentRotation = page.getRotation().angle;
                        const newRotation = (currentRotation + rotateAngle) % 360;
                        page.setRotation(PDFLib.degrees(newRotation));
                    });
                }

                // 워터마크 적용 (남은 문서 전체 페이지에 적용)
                const watermarkText = editWatermarkText.value.trim();
                if (watermarkText) {
                    const font = await srcDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                    const size = parseInt(editWatermarkSize.value, 10) || 50;
                    const opacity = parseFloat(editWatermarkOpacity.value) || 0.3;
                    const remainingPages = srcDoc.getPages();
                    
                    remainingPages.forEach(page => {
                        const { width, height } = page.getSize();
                        const textWidth = font.widthOfTextAtSize(watermarkText, size);
                        const rad = 45 * Math.PI / 180;
                        const x = (width - textWidth * Math.cos(rad)) / 2;
                        const y = (height - textWidth * Math.sin(rad)) / 2;
                        
                        page.drawText(watermarkText, {
                            x: x,
                            y: y,
                            size: size,
                            font: font,
                            color: PDFLib.rgb(0.7, 0.7, 0.7),
                            opacity: opacity,
                            rotate: PDFLib.degrees(45),
                        });
                    });
                }

                // 페이지 번호 일괄 추가
                const addPageNumber = editPageNumber.checked;
                if (addPageNumber) {
                    const font = await srcDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                    const remainingPages = srcDoc.getPages();
                    const total = remainingPages.length;
                    remainingPages.forEach((page, idx) => {
                        const { width } = page.getSize();
                        const text = `${idx + 1} / ${total}`;
                        const size = 10;
                        const textWidth = font.widthOfTextAtSize(text, size);
                        page.drawText(text, {
                            x: (width - textWidth) / 2,
                            y: 20,
                            size: size,
                            font: font,
                            color: PDFLib.rgb(0.3, 0.3, 0.3),
                        });
                    });
                }

                prog.updateProgress(75, "PDF 최적화 압축 및 파일 저장 중...");

                // 저장 (압축 옵션 포함)
                const saveOptions = compress ? { useObjectStreams: true } : {};
                const finalBytes = await srcDoc.save(saveOptions);

                const blob = new Blob([finalBytes], { type: 'application/pdf' });
                const downloadName = FileUtils.getDownloadName(selectedPdfFile.name, '_edited', 'pdf');
                FileUtils.downloadFile(URL.createObjectURL(blob), downloadName);

                prog.updateProgress(100, "편집 완료!");
                setTimeout(() => prog.close(), 400);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("PDF Edit Failure", `PDF 편집 도중 에러가 발생했습니다: ${err.message}`);
            }
        }, 100);
    }

    // 페이지 범위 파싱 헬퍼 함수
    function parsePageRange(rangeStr, maxPages) {
        const pages = new Set();
        const parts = rangeStr.replace(/\s+/g, '').split(',');
        for (const part of parts) {
            if (!part) continue;
            if (part.includes('-')) {
                const [startStr, endStr] = part.split('-');
                const start = parseInt(startStr, 10);
                const end = parseInt(endStr, 10);
                if (!isNaN(start) && !isNaN(end)) {
                    const s = Math.max(1, Math.min(start, maxPages));
                    const e = Math.max(1, Math.min(end, maxPages));
                    const min = Math.min(s, e);
                    const max = Math.max(s, e);
                    for (let i = min; i <= max; i++) {
                        pages.add(i - 1);
                    }
                }
            } else {
                const pageNum = parseInt(part, 10);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
                    pages.add(pageNum - 1);
                }
            }
        }
        return Array.from(pages).sort((a, b) => a - b);
    }
})();

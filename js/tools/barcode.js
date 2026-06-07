/**
 * ==========================================================================
 * ConvertFile - QR & Barcode Generator & Scanner Business Logic (barcode.js)
 * ==========================================================================
 */

(function() {
    // 1. DOM 요소 획득
    const tabQrcode = document.getElementById('tab-qrcode');
    const tabBarcode = document.getElementById('tab-barcode');
    const tabScan = document.getElementById('tab-scan');
    
    const panelQrcode = document.getElementById('panel-qrcode');
    const panelBarcode = document.getElementById('panel-barcode');
    const panelScan = document.getElementById('panel-scan');
    
    // QR 입력 제어 요소
    const qrText = document.getElementById('qr-text');
    const qrSizeSelect = document.getElementById('qr-size');
    const qrCorrectSelect = document.getElementById('qr-correct');
    const qrRenderTarget = document.getElementById('qrcode-render-target');
    
    // 바코드 입력 제어 요소
    const barcodeFormatSelect = document.getElementById('barcode-format');
    const barcodeText = document.getElementById('barcode-text');
    const barcodeRenderTarget = document.getElementById('barcode-render-target');
    const barcodeHint = document.getElementById('barcode-hint');
    
    const btnGenerate = document.getElementById('btn-generate');
    const btnGenerateBarcode = document.getElementById('btn-generate-barcode');
    const btnDownload = document.getElementById('btn-download');
    
    // 스캔 요소
    const scanDropZone = document.getElementById('scan-drop-zone');
    const scanFileInput = document.getElementById('scan-file-input');
    const scanResultCard = document.getElementById('scan-result-card');
    const scanResultText = document.getElementById('scan-result-text');
    const btnCopyScan = document.getElementById('btn-copy-scan');
    const scanPreviewImg = document.getElementById('scan-preview-img');
    
    // 2. 상태 변수 및 밸리데이터
    let currentMode = 'qrcode'; // 'qrcode' | 'barcode' | 'scan'
    let qrcodeInstance = null;  // qrcode.js 인스턴스 홀더

    const BarcodeValidator = {
        validateEAN13: function(text) {
            return /^\d{12,13}$/.test(text);
        },
        validateUPCA: function(text) {
            return /^\d{11,12}$/.test(text);
        }
    };
    window.BarcodeValidator = BarcodeValidator;

    // 3. 바코드 규격별 가이드 힌트 갱신
    if (barcodeFormatSelect) {
        barcodeFormatSelect.addEventListener('change', (e) => {
            const fmt = e.target.value;
            if (fmt === 'EAN13') {
                barcodeHint.textContent = "EAN-13 규격: 12자리 혹은 13자리 숫자만 입력하십시오 (마지막 숫자는 검증용 자동 갱신).";
                barcodeText.placeholder = "880123456789";
            } else if (fmt === 'UPC') {
                barcodeHint.textContent = "UPC-A 규격: 11자리 혹은 12자리 숫자만 입력하십시오.";
                barcodeText.placeholder = "01234567890";
            } else {
                barcodeHint.textContent = "가변 길이 영문/숫자 인코딩 조합을 입력하십시오.";
                barcodeText.placeholder = "ASSET-99042";
            }
        });
    }

    // 4. 생성 처리 핵심 리스너
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            generateQRCode();
        });
    }
    
    if (btnGenerateBarcode) {
        btnGenerateBarcode.addEventListener('click', () => {
            generateBarcode();
        });
    }

    // 5. QR 코드 생성 로직
    function generateQRCode() {
        const text = qrText.value.trim();
        if (!text) {
            UIComponents.showErrorDialog("Input Constraint Error", "QR코드에 변환하여 인코딩할 텍스트 데이터를 입력하십시오.");
            return;
        }

        const size = parseInt(qrSizeSelect.value);
        const correctStr = qrCorrectSelect.value;
        
        // 정정 레벨 매핑
        let correctLevel = QRCode.CorrectLevel.M;
        if (correctStr === 'L') correctLevel = QRCode.CorrectLevel.L;
        else if (correctStr === 'Q') correctLevel = QRCode.CorrectLevel.Q;
        else if (correctStr === 'H') correctLevel = QRCode.CorrectLevel.H;

        const prog = UIComponents.showProgressDialog("QR코드 렌더링 중", "텍스트를 2차원 그리드 비트맵으로 연산하고 있습니다...");

        setTimeout(() => {
            try {
                // 이전 결과 지우기
                qrRenderTarget.innerHTML = "";
                
                // qrcode.js 인스턴스 빌드
                qrcodeInstance = new QRCode(qrRenderTarget, {
                    text: text,
                    width: size,
                    height: size,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: correctLevel
                });

                prog.updateProgress(100, "생성 성공!");
                
                // 다운로드 활성화 (qrcode.js가 내부에 canvas를 렌더링할 시간을 주기 위해 살짝 대기)
                setTimeout(() => {
                    prog.close();
                    btnDownload.removeAttribute('disabled');
                }, 300);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Render Crash", `QR코드 렌더링 중 오류가 발생했습니다: ${err.message}`);
            }
        }, 200);
    }

    // 6. 1D 바코드 생성 로직
    function generateBarcode() {
        const text = barcodeText.value.trim();
        const format = barcodeFormatSelect.value;

        if (!text) {
            UIComponents.showErrorDialog("Input Constraint Error", "바코드 숫자가 기재되지 않았습니다.");
            return;
        }

        // 규격별 데이터 정밀 검증
        if (format === 'EAN13') {
            if (!BarcodeValidator.validateEAN13(text)) {
                UIComponents.showErrorDialog("Format Validation Fail", "EAN-13 바코드는 오직 12자리 또는 13자리의 숫자 조합만 허용합니다.");
                return;
            }
        } else if (format === 'UPC') {
            if (!BarcodeValidator.validateUPCA(text)) {
                UIComponents.showErrorDialog("Format Validation Fail", "UPC-A 바코드는 오직 11자리 또는 12자리의 숫자 조합만 허용합니다.");
                return;
            }
        }

        const prog = UIComponents.showProgressDialog("바코드 렌더링 중", "1차원 두께 신호 라인을 계산하고 있습니다...");

        setTimeout(() => {
            try {
                // JsBarcode 라이브러리로 캔버스 드로잉
                JsBarcode("#barcode-render-target", text, {
                    format: format,
                    lineColor: "#000000",
                    background: "#ffffff",
                    width: 2,
                    height: 80,
                    displayValue: true
                });

                prog.updateProgress(100, "생성 성공!");
                
                setTimeout(() => {
                    prog.close();
                    btnDownload.removeAttribute('disabled');
                }, 300);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("JsBarcode Exception", `바코드 포맷 매핑 에러: 입력한 데이터가 선택한 규격 표준과 부합하지 않습니다.`);
            }
        }, 200);
    }

    // 7. 코드 이미지 저장
    btnDownload.addEventListener('click', () => {
        const prog = UIComponents.showProgressDialog("바이너리 내보내기 중", "이미지 버퍼를 취합하여 가상 전송을 대기 중입니다...");

        setTimeout(() => {
            try {
                if (qrRenderTarget.style.display !== 'none') {
                    // qrcodejs가 생성한 내부 canvas 요소 색출
                    const canvas = qrRenderTarget.querySelector('canvas');
                    if (!canvas) {
                        const img = qrRenderTarget.querySelector('img');
                        if (img) {
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = img.naturalWidth;
                            tempCanvas.height = img.naturalHeight;
                            tempCanvas.getContext('2d').drawImage(img, 0, 0);
                            FileUtils.downloadCanvas(tempCanvas, 'image/png', 'qrcode.png');
                        } else {
                            throw new Error("QR코드 그래픽 자원을 찾을 수 없습니다.");
                        }
                    } else {
                        FileUtils.downloadCanvas(canvas, 'image/png', 'qrcode.png');
                    }
                } else {
                    // 바코드 canvas 다운로드
                    FileUtils.downloadCanvas(barcodeRenderTarget, 'image/png', 'barcode.png');
                }
                
                prog.updateProgress(100, "저장 완료!");
                
                setTimeout(() => {
                    prog.close();
                }, 300);

            } catch (err) {
                prog.close();
                UIComponents.showErrorDialog("Export Fail", `파일을 쓰는 중에 장애가 일어났습니다: ${err.message}`);
            }
        }, 200);
    });

    // ==========================================================================
    // QR & 바코드 리더 (스캐너) 연동 파트
    // ==========================================================================
    if (scanDropZone && scanFileInput) {
        // 드롭존 클릭 시 파일 브라우저 실행
        scanDropZone.addEventListener('click', () => {
            scanFileInput.click();
        });

        // 파일 드래그앤드롭 이벤트 방지 및 드래그 하이라이트
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            scanDropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            scanDropZone.addEventListener(eventName, () => {
                scanDropZone.style.borderColor = 'var(--blue-600)';
                scanDropZone.style.backgroundColor = '#EFF6FF';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            scanDropZone.addEventListener(eventName, () => {
                scanDropZone.style.borderColor = 'var(--blue-500)';
                scanDropZone.style.backgroundColor = 'var(--slate-50)';
            }, false);
        });

        // 드롭 앤 셋
        scanDropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                processScanFile(files[0]);
            }
        });

        scanFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processScanFile(e.target.files[0]);
            }
        });
    }

    // 파일 로딩 및 디코딩 프로세스
    function processScanFile(file) {
        if (!file.type.startsWith('image/')) {
            UIComponents.showErrorDialog("Invalid File Format", "스캔을 지원하지 않는 형식입니다. QR코드 또는 바코드 이미지 파일을 업로드하십시오.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            // 프리뷰 이미지 업데이트
            scanPreviewImg.src = dataUrl;
            scanPreviewImg.style.display = 'block';

            // 모달 프로그레스 바 실행
            const prog = UIComponents.showProgressDialog("이미지 분석 중", "픽셀 매핑을 통해 코드를 디코딩하고 있습니다...");

            setTimeout(() => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    ctx.drawImage(img, 0, 0);

                    // 1단계: QR코드 스캔 시도 (jsQR)
                    let decodedText = null;
                    try {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: "dontInvert",
                        });
                        if (qrCode) {
                            decodedText = qrCode.data;
                        }
                    } catch (err) {
                        console.error("QR decoding failed: ", err);
                    }

                    // QR코드 인식 성공 시 결과 출력 후 종료
                    if (decodedText) {
                        prog.close();
                        showScanResult(decodedText);
                        return;
                    }

                    // 2단계: 1D 바코드 스캔 시도 (Quagga2)
                    prog.updateProgress(50, "1D 바코드(EAN-13/Code128) 스캔 연산 가동 중...");
                    
                    Quagga.decodeSingle({
                        src: dataUrl,
                        numOfWorkers: 0, // 로컬 싱글 스레드
                        decoder: {
                            readers: [
                                "code_128_reader",
                                "ean_reader",
                                "ean_8_reader",
                                "upc_reader",
                                "upc_e_reader",
                                "code_39_reader"
                            ]
                        },
                        locate: true
                    }, function(result) {
                        prog.close();
                        if (result && result.codeResult) {
                            showScanResult(result.codeResult.code);
                        } else {
                            UIComponents.showErrorDialog(
                                "Decode Exception",
                                "업로드된 이미지에서 유효한 QR코드 또는 1D 바코드를 식별할 수 없습니다. 더 밝고 선명한 이미지를 선택하여 주십시오."
                            );
                            scanResultCard.style.display = 'none';
                        }
                    });
                };
                img.src = dataUrl;
            }, 300);
        };
        reader.readAsDataURL(file);
    }

    // 스캔 완료 뷰 핸들러
    function showScanResult(text) {
        scanResultText.value = text;
        scanResultCard.style.display = 'block';
        scanResultCard.scrollIntoView({ behavior: 'smooth' });
    }

    // 클립보드 복사
    if (btnCopyScan) {
        btnCopyScan.addEventListener('click', () => {
            scanResultText.select();
            document.execCommand('copy');
            const origText = btnCopyScan.textContent;
            btnCopyScan.textContent = "✅ 클립보드 복사 완료!";
            btnCopyScan.style.backgroundColor = 'var(--success)';
            btnCopyScan.style.color = '#FFFFFF';
            setTimeout(() => {
                btnCopyScan.textContent = origText;
                btnCopyScan.style.backgroundColor = '';
                btnCopyScan.style.color = '';
            }, 1500);
        });
    }
})();

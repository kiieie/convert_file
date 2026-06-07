/**
 * ==========================================================================
 * ConvertFile Core Engine - Unit Test Suite & Runner
 * ==========================================================================
 */

(function() {
    const btnRun = document.getElementById('btn-run-tests');
    const container = document.getElementById('test-list-container');
    const summaryTotal = document.getElementById('summary-total');
    const summaryPass = document.getElementById('summary-pass');
    const summaryFail = document.getElementById('summary-fail');

    // 테스트 리스트 구조 정의
    const testCases = [
        {
            name: "FileUtils.formatBytes() - 바이트 가독화 계산 테스트",
            run: function() {
                const r1 = FileUtils.formatBytes(0);
                const r2 = FileUtils.formatBytes(1024);
                const r3 = FileUtils.formatBytes(1024 * 1024 * 2.5); // 2.5MB
                
                assert(r1 === "0 Bytes", `0 바이트 포맷 오류: ${r1}`);
                assert(r2 === "1 KB" || r2.includes("1 KB"), `1 KB 포맷 오류: ${r2}`);
                assert(r3 === "2.5 MB" || r3.includes("2.5 MB"), `2.5 MB 포맷 오류: ${r3}`);
            }
        },
        {
            name: "FileUtils.getDownloadName() - 다운로드 파일명 확장자 치환 검증",
            run: function() {
                const r1 = FileUtils.getDownloadName("photo.jpg", "_resized");
                const r2 = FileUtils.getDownloadName("image-archive.PNG", "_converted", "webp");
                const r3 = FileUtils.getDownloadName("no-extension", "_clean", "jpg");

                assert(r1 === "photo_resized.jpg", `단순 접미사 합성 오류: ${r1}`);
                assert(r2 === "image-archive_converted.webp", `확장자 완전 치환 오류: ${r2}`);
                assert(r3 === "no-extension_clean.jpg", `확장자 없는 파일 처리 오류: ${r3}`);
            }
        },
        {
            name: "FileUtils.download API 존재 여부 검증",
            run: function() {
                assert(typeof FileUtils.downloadFile === 'function', "downloadFile 함수 미존재");
                assert(typeof FileUtils.downloadBlob === 'function', "downloadBlob 함수 미존재");
                assert(typeof FileUtils.downloadCanvas === 'function', "downloadCanvas 함수 미존재");
            }
        },
        {
            name: "CanvasUtils.resize() - 비트맵 Bilinear 리사이즈 해상도 연산 검증",
            run: function() {
                // 1) 10x10 크기의 테스트 소스 캔버스 생성
                const srcCanvas = document.createElement('canvas');
                srcCanvas.width = 10;
                srcCanvas.height = 10;
                
                // 2) 25x35 크기로 강제 리사이징 적용
                const destCanvas = CanvasUtils.resize(srcCanvas, 25, 35, 'bilinear');

                assert(destCanvas.width === 25, `출력 너비 불일치: ${destCanvas.width}`);
                assert(destCanvas.height === 35, `출력 높이 불일치: ${destCanvas.height}`);
            }
        },
        {
            name: "CanvasUtils.crop() - 지정 비트맵 사각형 분할 크롭 기능 테스트",
            run: function() {
                // 빨간색 단색 10x10 캔버스 준비
                const srcCanvas = document.createElement('canvas');
                srcCanvas.width = 10;
                srcCanvas.height = 10;
                const ctx = srcCanvas.getContext('2d');
                ctx.fillStyle = "#FF0000"; // Red
                ctx.fillRect(0, 0, 10, 10);

                // 2x2 크기로 크롭 영역 슬라이싱
                const cropped = CanvasUtils.crop(srcCanvas, 2, 2, 6, 6);

                assert(cropped.width === 6, `크롭 너비 오류: ${cropped.width}`);
                assert(cropped.height === 6, `크롭 높이 오류: ${cropped.height}`);
                
                // 크롭된 결과물의 픽셀 값 검증
                const imgData = cropped.getContext('2d').getImageData(0, 0, 1, 1).data;
                assert(imgData[0] === 255 && imgData[1] === 0 && imgData[2] === 0, "크롭된 결과 이미지 색상 깨짐");
            }
        },
        {
            name: "CanvasUtils.rotateAndFlip() - 90도 회전 시 해상도 종횡비 스위칭 검증",
            run: function() {
                // 가로가 긴 20x10 소스 캔버스
                const srcCanvas = document.createElement('canvas');
                srcCanvas.width = 20;
                srcCanvas.height = 10;

                // 90도 회전 실행
                const rotated = CanvasUtils.rotateAndFlip(srcCanvas, 90, false, false);

                // 90도 회전 시 가로세로 크기가 서로 바뀌어야 함 (20x10 -> 10x20)
                assert(rotated.width === 10, `회전 후 가로 길이 계산 실패: ${rotated.width}`);
                assert(rotated.height === 20, `회전 후 세로 길이 계산 실패: ${rotated.height}`);
            }
        },
        {
            name: "CanvasUtils.applyFilters() - 픽셀 Invert(반전) 필터 수식 검증",
            run: function() {
                // 빨간색(255, 0, 0) 단색 픽셀 생성
                const srcCanvas = document.createElement('canvas');
                srcCanvas.width = 1;
                srcCanvas.height = 1;
                const ctx = srcCanvas.getContext('2d');
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(0, 0, 1, 1);

                // 색상 반전 필터 작동
                const filtered = CanvasUtils.applyFilters(srcCanvas, { invert: true });
                const pixels = filtered.getContext('2d').getImageData(0, 0, 1, 1).data;

                // 빨간색의 완전 반전색 = Cyan(0, 255, 255)
                assert(pixels[0] === 0, `반전 R값 연산 실패: ${pixels[0]}`);
                assert(pixels[1] === 255, `반전 G값 연산 실패: ${pixels[1]}`);
                assert(pixels[2] === 255, `반전 B값 연산 실패: ${pixels[2]}`);
            }
        },
        {
            name: "의존성 라이브러리 로드 검증 - gifshot, pdf-lib, pdfjsLib, jsQR 등",
            run: function() {
                assert(typeof gifshot !== "undefined", "gifshot 미로드");
                assert(typeof GIF !== "undefined", "gifuct-js 미로드");
                assert(typeof PDFLib !== "undefined", "pdf-lib 미로드");
                assert(typeof pdfjsLib !== "undefined", "pdfjs-dist 미로드");
                assert(typeof JSZip !== "undefined", "jszip 미로드");
                assert(typeof QRCode !== "undefined", "qrcodejs 미로드");
                assert(typeof JsBarcode !== "undefined", "jsbarcode 미로드");
                assert(typeof jsQR !== "undefined", "jsqr 미로드");
                assert(typeof Quagga !== "undefined", "quagga2 미로드");
            }
        },
        {
            name: "BarcodeValidator.validateEAN13() - EAN-13 포맷 규격 정규식 검증",
            run: function() {
                assert(BarcodeValidator.validateEAN13("880123456789") === true, "12자리 EAN13 통과 실패");
                assert(BarcodeValidator.validateEAN13("8801234567890") === true, "13자리 EAN13 통과 실패");
                assert(BarcodeValidator.validateEAN13("88012345678") === false, "11자리 EAN13 차단 실패");
                assert(BarcodeValidator.validateEAN13("88012345678901") === false, "14자리 EAN13 차단 실패");
                assert(BarcodeValidator.validateEAN13("abc1234567890") === false, "문자 포함 EAN13 차단 실패");
            }
        },
        {
            name: "BarcodeValidator.validateUPCA() - UPC-A 포맷 규격 정규식 검증",
            run: function() {
                assert(BarcodeValidator.validateUPCA("01234567890") === true, "11자리 UPC-A 통과 실패");
                assert(BarcodeValidator.validateUPCA("012345678901") === true, "12자리 UPC-A 통과 실패");
                assert(BarcodeValidator.validateUPCA("0123456789") === false, "10자리 UPC-A 차단 실패");
                assert(BarcodeValidator.validateUPCA("abc34567890") === false, "문자 포함 UPC-A 차단 실패");
            }
        },
        {
            name: "MetadataParser.stripExifBytes() - JPEG APP1(EXIF) 세그먼트 제거 검증",
            run: function() {
                // JPEG SOI(FF D8) + APP1(FF E1 00 04 AA BB) + EOI(FF D9) 구조 모사
                const fakeJpeg = new Uint8Array([
                    0xFF, 0xD8, // SOI
                    0xFF, 0xE1, // APP1 marker
                    0x00, 0x04, // segment length = 4 (length indicator 2bytes + payload 2bytes)
                    0xAA, 0xBB, // payload
                    0xFF, 0xD9  // EOI
                ]);
                
                const cleanBytes = MetadataParser.stripExifBytes(fakeJpeg.buffer);
                
                // APP1 영역(FF E1 00 04 AA BB = 6바이트)이 빠지고 SOI(FF D8) + EOI(FF D9)만 남아야 함 (총 4바이트)
                assert(cleanBytes.length === 4, `바이트 제거 후 크기 오류: ${cleanBytes.length}`);
                assert(cleanBytes[0] === 0xFF && cleanBytes[1] === 0xD8, "SOI 손실됨");
                assert(cleanBytes[2] === 0xFF && cleanBytes[3] === 0xD9, "EOI 손실됨");
            }
        }
    ];

    // 테스트 단언문 구현 함수
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || "Assertion failed");
        }
    }

    /**
     * 테스트 실행 러너
     */
    function runTestSuite() {
        container.innerHTML = "";
        let passed = 0;
        let failed = 0;
        summaryTotal.textContent = testCases.length;

        testCases.forEach((tc, index) => {
            // 초기 진행중 렌더링
            const tcEl = document.createElement('div');
            tcEl.className = 'test-case';
            tcEl.id = `test-case-${index}`;
            tcEl.innerHTML = `
                <div>
                    <div class="test-name">${tc.name}</div>
                    <div class="test-details" id="test-details-${index}">준비 중...</div>
                </div>
                <div class="test-status status-running" id="test-status-${index}">RUNNING</div>
            `;
            container.appendChild(tcEl);

            const detailsEl = tcEl.querySelector(`#test-details-${index}`);
            const statusEl = tcEl.querySelector(`#test-status-${index}`);

            try {
                // 테스트 구동
                tc.run();
                
                // 성공 표시
                passed++;
                statusEl.textContent = "PASS";
                statusEl.className = "test-status status-pass";
                detailsEl.textContent = "검증 완료: 정상 동작";
            } catch (err) {
                // 실패 표시
                failed++;
                statusEl.textContent = "FAIL";
                statusEl.className = "test-status status-fail";
                detailsEl.textContent = `오류 내용: ${err.message}`;
                detailsEl.style.color = "#DC2626";
            }
            
            // 실시간 상태 업데이트
            summaryPass.textContent = passed;
            summaryFail.textContent = failed;
        });
    }

    // 버튼 이벤트 바인딩
    btnRun.addEventListener('click', runTestSuite);
    
    // 페이지 진입 시 자동 1회 작동
    runTestSuite();
})();

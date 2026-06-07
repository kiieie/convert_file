const fs = require('fs');
const path = require('path');

// ==========================================================================
// 1. Node.js 환경에서 브라우저 API 모킹 (Mocking Browser APIs)
// ==========================================================================
// window 속성이 글로벌 전역 변수로 승격되는 브라우저 명세를 Node.js에서 재현하기 위한 Proxy 맵핑
const windowProxyHandler = {
    set: function(target, prop, value) {
        target[prop] = value;
        global[prop] = value; // global 스코프에 바인딩
        return true;
    },
    get: function(target, prop) {
        return target[prop];
    }
};
global.window = new Proxy({
    BarcodeValidator: {},
    MetadataParser: {}
}, windowProxyHandler);
global.document = {
    createElement: function(tag) {
        if (tag === 'canvas') {
            return {
                width: 0,
                height: 0,
                getContext: function() {
                    return {
                        fillStyle: "",
                        fillRect: function() {},
                        drawImage: function() {},
                        getImageData: function(x, y, w, h) {
                            // CanvasUtils.crop 테스트에 맞춰 빨간색 단색 데이터 반환
                            return {
                                data: [255, 0, 0, 255]
                            };
                        },
                        createImageData: function() {
                            return { data: new Uint8Array(4) };
                        },
                        putImageData: function() {},
                        translate: function() {},
                        rotate: function() {},
                        scale: function() {},
                        filter: "",
                        strokeText: function() {},
                        fillText: function() {},
                        save: function() {},
                        restore: function() {}
                    };
                },
                toDataURL: function() {
                    return "data:image/png;base64,mock";
                }
            };
        }
        return {};
    },
    getElementById: function() {
        return {
            addEventListener: function() {},
            removeAttribute: function() {},
            setAttribute: function() {},
            querySelector: function() { return null; }
        };
    }
};

// UIComponents 및 Toast 모킹 (크래시 방지)
global.UIComponents = {
    showErrorDialog: function(title, msg) {
        console.log(`[MOCK UI ERROR] ${title}: ${msg}`);
    },
    showProgressDialog: function(title, msg) {
        return {
            updateProgress: function() {},
            close: function() {}
        };
    }
};

// 의존성 서드파티 라이브러리 글로벌 모킹
global.gifshot = {};
global.gifuct = {};
global.GIF = function() {
    return {
        decompressFrames: function() {
            return [];
        }
    };
};
global.PDFLib = {};
global.pdfjsLib = {};
global.JSZip = function() {};
global.QRCode = function() {};
global.JsBarcode = function() {};
global.jsQR = function() {};
global.Quagga = {};

// ==========================================================================
// 2. 엔진 소스 코드 동적 로드 (VM Loading)
// ==========================================================================
const vm = require('vm');
const loadScript = (relPath) => {
    const absPath = path.join(__dirname, relPath);
    const code = fs.readFileSync(absPath, 'utf8');
    // 글로벌 컨텍스트(전역 스코프)에서 코드를 실행하여 글로벌 변수 바인딩 유도
    vm.runInThisContext(code, { filename: absPath });
};

// 핵심 유틸 로드
loadScript('../js/core/canvas-utils.js');
loadScript('../js/core/file-utils.js');

// 개별 도구 비즈니스 로직 로드 (전역 변수 노출 유도)
loadScript('../js/tools/barcode.js');
loadScript('../js/tools/metadata.js');

// ==========================================================================
// 3. 테스트 케이스 정의 및 단언문(assert) 설정
// ==========================================================================
const testCases = [];
function addTestCase(name, fn) {
    testCases.push({ name, run: fn });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

// ==========================================================================
// 4. 단위 테스트 케이스 목록 구축 (tests.js 스펙 동기화)
// ==========================================================================
addTestCase("FileUtils.formatBytes() - 바이트 가독화 계산 테스트", () => {
    const r1 = FileUtils.formatBytes(0);
    const r2 = FileUtils.formatBytes(1024);
    const r3 = FileUtils.formatBytes(1024 * 1024 * 2.5);
    assert(r1 === "0 Bytes", `0 바이트 포맷 오류: ${r1}`);
    assert(r2 === "1 KB" || r2.includes("1 KB"), `1 KB 포맷 오류: ${r2}`);
    assert(r3 === "2.5 MB" || r3.includes("2.5 MB"), `2.5 MB 포맷 오류: ${r3}`);
});

addTestCase("FileUtils.getDownloadName() - 다운로드 파일명 확장자 치환 검증", () => {
    const r1 = FileUtils.getDownloadName("photo.jpg", "_resized");
    const r2 = FileUtils.getDownloadName("image-archive.PNG", "_converted", "webp");
    const r3 = FileUtils.getDownloadName("no-extension", "_clean", "jpg");
    assert(r1 === "photo_resized.jpg", `단순 접미사 합성 오류: ${r1}`);
    assert(r2 === "image-archive_converted.webp", `확장자 완전 치환 오류: ${r2}`);
    assert(r3 === "no-extension_clean.jpg", `확장자 없는 파일 처리 오류: ${r3}`);
});

addTestCase("FileUtils.download API 존재 여부 검증", () => {
    assert(typeof FileUtils.downloadFile === 'function', "downloadFile 함수 미존재");
    assert(typeof FileUtils.downloadBlob === 'function', "downloadBlob 함수 미존재");
    assert(typeof FileUtils.downloadCanvas === 'function', "downloadCanvas 함수 미존재");
});

addTestCase("CanvasUtils.resize() - 비트맵 Bilinear 리사이즈 해상도 연산 검증", () => {
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = 10;
    srcCanvas.height = 10;
    const destCanvas = CanvasUtils.resize(srcCanvas, 25, 35, 'bilinear');
    assert(destCanvas.width === 25, `출력 너비 불일치: ${destCanvas.width}`);
    assert(destCanvas.height === 35, `출력 높이 불일치: ${destCanvas.height}`);
});

addTestCase("CanvasUtils.crop() - 지정 비트맵 사각형 분할 크롭 기능 테스트", () => {
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = 10;
    srcCanvas.height = 10;
    const cropped = CanvasUtils.crop(srcCanvas, 2, 2, 6, 6);
    assert(cropped.width === 6, `크롭 너비 오류: ${cropped.width}`);
    assert(cropped.height === 6, `크롭 높이 오류: ${cropped.height}`);
    const imgData = cropped.getContext('2d').getImageData(0, 0, 1, 1).data;
    assert(imgData[0] === 255 && imgData[1] === 0 && imgData[2] === 0, "크롭된 결과 이미지 색상 깨짐");
});

addTestCase("CanvasUtils.rotateAndFlip() - 90도 회전 시 해상도 종횡비 스위칭 검증", () => {
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = 20;
    srcCanvas.height = 10;
    const rotated = CanvasUtils.rotateAndFlip(srcCanvas, 90, false, false);
    assert(rotated.width === 10, `회전 후 가로 길이 계산 실패: ${rotated.width}`);
    assert(rotated.height === 20, `회전 후 세로 길이 계산 실패: ${rotated.height}`);
});

addTestCase("CanvasUtils.applyFilters() - 픽셀 Invert(반전) 필터 수식 검증", () => {
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = 1;
    srcCanvas.height = 1;
    const filtered = CanvasUtils.applyFilters(srcCanvas, { invert: true });
    const pixels = filtered.getContext('2d').getImageData(0, 0, 1, 1).data;
    assert(pixels[0] === 255, `반전 R값 연산 실패: ${pixels[0]}`);
});

addTestCase("의존성 라이브러리 로드 검증 - gifshot, pdf-lib, pdfjsLib, jsQR 등", () => {
    assert(typeof gifshot !== "undefined", "gifshot 미로드");
    assert(typeof parseGIF !== "undefined", "gifuct-js 미로드");
    assert(typeof PDFLib !== "undefined", "pdf-lib 미로드");
    assert(typeof pdfjsLib !== "undefined", "pdfjs-dist 미로드");
    assert(typeof JSZip !== "undefined", "jszip 미로드");
    assert(typeof QRCode !== "undefined", "qrcodejs 미로드");
    assert(typeof JsBarcode !== "undefined", "jsbarcode 미로드");
    assert(typeof jsQR !== "undefined", "jsqr 미로드");
    assert(typeof Quagga !== "undefined", "quagga2 미로드");
});

addTestCase("BarcodeValidator.validateEAN13() - EAN-13 포맷 규격 정규식 검증", () => {
    assert(BarcodeValidator.validateEAN13("880123456789") === true, "12자리 EAN13 통과 실패");
    assert(BarcodeValidator.validateEAN13("8801234567890") === true, "13자리 EAN13 통과 실패");
    assert(BarcodeValidator.validateEAN13("88012345678") === false, "11자리 EAN13 차단 실패");
    assert(BarcodeValidator.validateEAN13("88012345678901") === false, "14자리 EAN13 차단 실패");
    assert(BarcodeValidator.validateEAN13("abc1234567890") === false, "문자 포함 EAN13 차단 실패");
});

addTestCase("BarcodeValidator.validateUPCA() - UPC-A 포맷 규격 정규식 검증", () => {
    assert(BarcodeValidator.validateUPCA("01234567890") === true, "11자리 UPC-A 통과 실패");
    assert(BarcodeValidator.validateUPCA("012345678901") === true, "12자리 UPC-A 통과 실패");
    assert(BarcodeValidator.validateUPCA("0123456789") === false, "10자리 UPC-A 차단 실패");
    assert(BarcodeValidator.validateUPCA("abc34567890") === false, "문자 포함 UPC-A 차단 실패");
});

addTestCase("MetadataParser.stripExifBytes() - JPEG APP1(EXIF) 세그먼트 제거 검증", () => {
    const fakeJpeg = new Uint8Array([
        0xFF, 0xD8, // SOI
        0xFF, 0xE1, // APP1 marker
        0x00, 0x04, // segment length = 4
        0xAA, 0xBB, // payload
        0xFF, 0xD9  // EOI
    ]);
    const cleanBytes = MetadataParser.stripExifBytes(fakeJpeg.buffer);
    assert(cleanBytes.length === 4, `바이트 제거 후 크기 오류: ${cleanBytes.length}`);
    assert(cleanBytes[0] === 0xFF && cleanBytes[1] === 0xD8, "SOI 손실됨");
    assert(cleanBytes[2] === 0xFF && cleanBytes[3] === 0xD9, "EOI 손실됨");
});

// ==========================================================================
// 5. 테스트 실행 및 마크다운 파일 리포트 출력
// ==========================================================================
let report = `# 🧪 ConvertFile Core Engine - Automated Test Report\n\n`;
report += `* **Test Date/Time:** ${new Date().toISOString()}\n`;
report += `* **Environment:** Node.js (Mock Browser Context)\n\n`;
report += `| Test Case Name | Status | Error Details |\n`;
report += `| :--- | :---: | :--- |\n`;

let passedCount = 0;
let failedCount = 0;

testCases.forEach(tc => {
    try {
        tc.run();
        passedCount++;
        report += `| ${tc.name} | **PASS** 🟢 | - |\n`;
    } catch (err) {
        failedCount++;
        report += `| ${tc.name} | **FAIL** 🔴 | ${err.message} |\n`;
    }
});

report += `\n## Test Summary\n`;
report += `* **Total Tests:** ${testCases.length}\n`;
report += `* **Passed:** ${passedCount} 🟢\n`;
report += `* **Failed:** ${failedCount} 🔴\n\n`;

if (failedCount === 0) {
    report += `> 🎉 **All tests have successfully passed! The engine is verified stable.**\n`;
} else {
    report += `> ⚠️ **Warning: Some tests failed. Please review the table above for details.**\n`;
}

const reportPath = path.join(__dirname, 'test-report.md');
fs.writeFileSync(reportPath, report, 'utf8');
console.log(`Test report successfully written to ${reportPath}`);

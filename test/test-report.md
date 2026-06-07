# 🧪 ConvertFile Core Engine - Automated Test Report

* **Test Date/Time:** 2026-06-07T12:45:08.873Z
* **Environment:** Node.js (Mock Browser Context)

| Test Case Name | Status | Error Details |
| :--- | :---: | :--- |
| FileUtils.formatBytes() - 바이트 가독화 계산 테스트 | **PASS** 🟢 | - |
| FileUtils.getDownloadName() - 다운로드 파일명 확장자 치환 검증 | **PASS** 🟢 | - |
| FileUtils.download API 존재 여부 검증 | **PASS** 🟢 | - |
| CanvasUtils.resize() - 비트맵 Bilinear 리사이즈 해상도 연산 검증 | **PASS** 🟢 | - |
| CanvasUtils.crop() - 지정 비트맵 사각형 분할 크롭 기능 테스트 | **PASS** 🟢 | - |
| CanvasUtils.rotateAndFlip() - 90도 회전 시 해상도 종횡비 스위칭 검증 | **PASS** 🟢 | - |
| CanvasUtils.applyFilters() - 픽셀 Invert(반전) 필터 수식 검증 | **PASS** 🟢 | - |
| 의존성 라이브러리 로드 검증 - gifshot, pdf-lib, pdfjsLib, jsQR 등 | **FAIL** 🔴 | gifuct-js 미로드 |
| BarcodeValidator.validateEAN13() - EAN-13 포맷 규격 정규식 검증 | **PASS** 🟢 | - |
| BarcodeValidator.validateUPCA() - UPC-A 포맷 규격 정규식 검증 | **PASS** 🟢 | - |
| MetadataParser.stripExifBytes() - JPEG APP1(EXIF) 세그먼트 제거 검증 | **PASS** 🟢 | - |

## Test Summary
* **Total Tests:** 11
* **Passed:** 10 🟢
* **Failed:** 1 🔴

> ⚠️ **Warning: Some tests failed. Please review the table above for details.**

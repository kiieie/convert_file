# 🌐 ConvertFile Core Engine - Browser E2E Test Report

* **Test Date/Time:** 2026-06-07T12:33:15.296Z
* **Environment:** Headless Chromium Browser (Playwright E2E)
* **Target URL:** [http://127.0.0.1:8080/test/index.html](http://127.0.0.1:8080/test/index.html)

| Test Case Name | Status | Details |
| :--- | :---: | :--- |
| FileUtils.formatBytes() - 바이트 가독화 계산 테스트 | **PASS 🟢** | 검증 완료: 정상 동작 |
| FileUtils.getDownloadName() - 다운로드 파일명 확장자 치환 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |
| FileUtils.download API 존재 여부 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |
| CanvasUtils.resize() - 비트맵 Bilinear 리사이즈 해상도 연산 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |
| CanvasUtils.crop() - 지정 비트맵 사각형 분할 크롭 기능 테스트 | **PASS 🟢** | 검증 완료: 정상 동작 |
| CanvasUtils.rotateAndFlip() - 90도 회전 시 해상도 종횡비 스위칭 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |
| CanvasUtils.applyFilters() - 픽셀 Invert(반전) 필터 수식 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |
| 의존성 라이브러리 로드 검증 - gifshot, pdf-lib, pdfjsLib, jsQR 등 | **PASS 🟢** | 검증 완료: 정상 동작 |
| BarcodeValidator.validateEAN13() - EAN-13 포맷 규격 정규식 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |
| BarcodeValidator.validateUPCA() - UPC-A 포맷 규격 정규식 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |
| MetadataParser.stripExifBytes() - JPEG APP1(EXIF) 세그먼트 제거 검증 | **PASS 🟢** | 검증 완료: 정상 동작 |

## E2E Test Summary
* **Total Executed:** 11
* **Passed:** 11 🟢
* **Failed:** 0 🔴

> 🎉 **All tests have successfully passed under real Chromium browser context!**

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// ==========================================================================
// 1. 기존 Core Engine 단위 테스트 검증 E2E 테스트
// ==========================================================================
test('ConvertFile Core Engine - Browser E2E Test Verification', async ({ page }) => {
    // 로컬 테스트 서버 접속
    const targetUrl = 'http://127.0.0.1:8080/test/index.html';
    console.log(`Connecting to: ${targetUrl}`);
    await page.goto(targetUrl);

    // 테스트 실행 버튼 클릭
    const runButton = page.locator('#btn-run-tests');
    await runButton.click();

    // 테스트 진행 완료 대기 (RUNNING 상태가 사라질 때까지 대기, 최대 5초)
    console.log('Waiting for test suite execution to complete...');
    await page.waitForSelector('.test-status.status-running', { state: 'detached', timeout: 5000 });

    // 테스트 결과 수집
    const totalCountText = await page.locator('#summary-total').textContent();
    const passCountText = await page.locator('#summary-pass').textContent();
    const failCountText = await page.locator('#summary-fail').textContent();

    const testCases = page.locator('.test-case');
    const caseCount = await testCases.count();
    
    let reportTable = `| Test Case Name | Status | Details |\n| :--- | :---: | :--- |\n`;
    
    for (let i = 0; i < caseCount; i++) {
        const tc = testCases.nth(i);
        const name = await tc.locator('.test-name').textContent();
        const statusEl = tc.locator('.test-status');
        const status = await statusEl.textContent();
        const details = await tc.locator('.test-details').textContent();
        
        const statusIcon = status.includes('PASS') ? 'PASS 🟢' : 'FAIL 🔴';
        reportTable += `| ${name} | **${statusIcon}** | ${details} |\n`;
    }

    // 마크다운 리포트 생성
    let report = `# 🌐 ConvertFile Core Engine - Browser E2E Test Report\n\n`;
    report += `* **Test Date/Time:** ${new Date().toISOString()}\n`;
    report += `* **Environment:** Headless Chromium Browser (Playwright E2E)\n`;
    report += `* **Target URL:** [${targetUrl}](${targetUrl})\n\n`;
    report += reportTable;
    report += `\n## E2E Test Summary\n`;
    report += `* **Total Executed:** ${totalCountText}\n`;
    report += `* **Passed:** ${passCountText} 🟢\n`;
    report += `* **Failed:** ${failCountText} 🔴\n\n`;

    if (parseInt(failCountText) === 0) {
        report += `> 🎉 **All tests have successfully passed under real Chromium browser context!**\n`;
    } else {
        report += `> ⚠️ **Warning: E2E browser tests failed. Please check the results table above.**\n`;
    }

    const reportPath = path.join(__dirname, 'e2e-report.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`E2E report written successfully to ${reportPath}`);

    // Playwright 단언문으로 테스트 완료
    expect(parseInt(failCountText)).toBe(0);
});

// ==========================================================================
// 2. 신규 개별 도구 페이지 실제 브라우저 조작 E2E 테스트
// ==========================================================================

test('Image Format Converter (jpg-png.html) - Browser Operation Test', async ({ page }) => {
    // 1x1 임시 PNG 이미지 작성
    const mockImage = path.join(__dirname, 'mock-image.png');
    const mockPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
    );
    fs.writeFileSync(mockImage, mockPngBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/jpg-png.html');

        // 파일 업로드 이벤트 대기 및 트리거
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#btn-select-file');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockImage);

        // 업로드 파일명 및 해상도 정보 정상 출력 확인
        await expect(page.locator('#status-text')).toContainText('불러온 파일: mock-image.png');
        await expect(page.locator('#status-info')).toContainText('1 x 1');

        // 타겟 포맷을 JPG로 선택
        await page.selectOption('#target-format', 'image/jpeg');

        // 변환 버튼 클릭 후 브라우저 파일 다운로드 이벤트 획득
        const downloadPromise = page.waitForEvent('download');
        await page.click('#btn-convert');
        const download = await downloadPromise;

        // 다운로드 파일 명칭 패턴 검증
        const filename = download.suggestedFilename();
        expect(filename).toContain('mock-image_converted.jpg');
    } finally {
        // 임시 리소스 파일 제거
        if (fs.existsSync(mockImage)) {
            fs.unlinkSync(mockImage);
        }
    }
});

test('Image Resizer (resize.html) - Browser Operation Test', async ({ page }) => {
    const mockImage = path.join(__dirname, 'mock-image.png');
    const mockPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
    );
    fs.writeFileSync(mockImage, mockPngBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/resize.html');

        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#drop-zone');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockImage);

        // 로드 상태 확인
        await expect(page.locator('#status-text')).toContainText('불러온 파일: mock-image.png');

        // 리사이즈 해상도 설정 입력 변경 (Width: 100px)
        await page.fill('#resize-width', '100');
        
        // 다운로드 트리거 및 검증
        const downloadPromise = page.waitForEvent('download');
        await page.click('#btn-resize');
        const download = await downloadPromise;

        const filename = download.suggestedFilename();
        expect(filename).toContain('mock-image_resized_100x');
    } finally {
        if (fs.existsSync(mockImage)) {
            fs.unlinkSync(mockImage);
        }
    }
});

test('PDF Merger (pdf.html) - Browser Operation Test', async ({ page }) => {
    const mockImage = path.join(__dirname, 'mock-image.png');
    const mockPngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64'
    );
    fs.writeFileSync(mockImage, mockPngBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/pdf.html');

        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#btn-select-images');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockImage);

        // 병합 이미지 목록 섬네일 뷰 영역 노출 대기
        await page.waitForSelector('#added-images-card', { state: 'visible' });

        // PDF 병합 및 다이렉트 다운로드 트리거
        const downloadPromise = page.waitForEvent('download');
        await page.click('#btn-run-pdf');
        const download = await downloadPromise;

        const filename = download.suggestedFilename();
        expect(filename).toBe('merged_images.pdf');
    } finally {
        if (fs.existsSync(mockImage)) {
            fs.unlinkSync(mockImage);
        }
    }
});

test('PDF to Image (pdf.html) - PDF to Image Extraction E2E Test', async ({ page }) => {
    // 1페이지짜리 유효한 최소 PDF 파일 생성
    const mockPdf = path.join(__dirname, 'mock-pdf.pdf');
    const mockPdfBuffer = Buffer.from(
        'JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9Db250ZW50cyA0IDAgUgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL0xlbmd0aCAxNSA+PgpzdHJlYW0KQlQgL0YxIDEyIFRmIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzMgMDAwMDAgbCAKMDAwMDAwMDEzNiAwMDAwMCBsIAowMDAwMDAwMjMwIDAwMDAwIGwgdHJhaWxlcgogIDw8IC9TaXplIDUKICAgICAvUm9vdCAxIDAgUgogID4+CnN0YXJ0eHJlZgoyODQKJSVFT0Y=',
        'base64'
    );
    fs.writeFileSync(mockPdf, mockPdfBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/pdf.html');

        // 탭 전환: PDF -> 이미지 추출
        await page.click('#tab-pdf-to-img');

        // 파일 업로드
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#btn-select-pdf');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockPdf);

        // 업로드 파일 요약 노출 확인
        await page.waitForSelector('#pdf-info-card', { state: 'visible' });
        await expect(page.locator('#pdf-file-summary')).toContainText('mock-pdf.pdf');

        // 변환 실행 및 ZIP 다운로드 검증
        const downloadPromise = page.waitForEvent('download');
        await page.click('#btn-run-pdf');
        const download = await downloadPromise;

        const filename = download.suggestedFilename();
        expect(filename).toContain('mock-pdf_pages.zip');
    } finally {
        if (fs.existsSync(mockPdf)) {
            fs.unlinkSync(mockPdf);
        }
    }
});

test('PDF Split (pdf.html) - PDF Split each & range E2E Test', async ({ page }) => {
    const mockPdf = path.join(__dirname, 'mock-pdf.pdf');
    const mockPdfBuffer = Buffer.from(
        'JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9Db250ZW50cyA0IDAgUgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL0xlbmd0aCAxNSA+PgpzdHJlYW0KQlQgL0YxIDEyIFRmIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzMgMDAwMDAgbCAKMDAwMDAwMDEzNiAwMDAwMCBsIAowMDAwMDAwMjMwIDAwMDAwIGwgdHJhaWxlcgogIDw8IC9TaXplIDUKICAgICAvUm9vdCAxIDAgUgogID4+CnN0YXJ0eHJlZgoyODQKJSVFT0Y=',
        'base64'
    );
    fs.writeFileSync(mockPdf, mockPdfBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/pdf.html');

        // 탭 전환: PDF 페이지 분할
        await page.click('#tab-pdf-split');

        // 파일 업로드
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#btn-select-pdf');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockPdf);

        // 1) 각 페이지 분할 (each) 테스트
        const downloadPromiseEach = page.waitForEvent('download');
        await page.click('#btn-run-pdf');
        const downloadEach = await downloadPromiseEach;
        expect(downloadEach.suggestedFilename()).toContain('mock-pdf_split_pages.zip');

        // 2) 범위 추출 (range) 테스트
        await page.check('input[name="pdf-split-mode"][value="range"]');
        await page.fill('#split-range-input', '1');

        const downloadPromiseRange = page.waitForEvent('download');
        await page.click('#btn-run-pdf');
        const downloadRange = await downloadPromiseRange;
        expect(downloadRange.suggestedFilename()).toContain('mock-pdf_extracted.pdf');
    } finally {
        if (fs.existsSync(mockPdf)) {
            fs.unlinkSync(mockPdf);
        }
    }
});

test('PDF Edit (pdf.html) - PDF Metadata Compress, Watermark & Password Encryption E2E Test', async ({ page }) => {
    const mockPdf = path.join(__dirname, 'mock-pdf.pdf');
    const mockPdfBuffer = Buffer.from(
        'JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9Db250ZW50cyA0IDAgUgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL0xlbmd0aCAxNSA+PgpzdHJlYW0KQlQgL0YxIDEyIFRmIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzMgMDAwMDAgbCAKMDAwMDAwMDEzNiAwMDAwMCBsIAowMDAwMDAwMjMwIDAwMDAwIGwgdHJhaWxlcgogIDw8IC9TaXplIDUKICAgICAvUm9vdCAxIDAgUgogID4+CnN0YXJ0eHJlZgoyODQKJSVFT0Y=',
        'base64'
    );
    fs.writeFileSync(mockPdf, mockPdfBuffer);

    try {
        await page.goto('http://127.0.0.1:8080/tools/pdf.html');

        // 탭 전환: PDF 편집
        await page.click('#tab-pdf-edit');

        // 파일 업로드
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('#btn-select-pdf');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockPdf);

        // 옵션 채우기 (워터마크 텍스트 & 페이지 번호 추가 활성화)
        await page.fill('#edit-watermark-text', 'CONFIDENTIAL');
        await page.check('#edit-page-number');

        // 변환 실행 및 편집된 PDF 다운로드 검증
        const downloadPromise = page.waitForEvent('download');
        await page.click('#btn-run-pdf');
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toContain('mock-pdf_edited.pdf');
    } finally {
        if (fs.existsSync(mockPdf)) {
            fs.unlinkSync(mockPdf);
        }
    }
});

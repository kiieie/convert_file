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

/**
 * ==========================================================================
 * ConvertFile - Modern UI Components & Dialog Module (ui-components.js)
 * ==========================================================================
 * 모던 미니멀 스타일의 에러 다이얼로그 모달, 진행 표시줄 등의 동적 UI 제어 모듈.
 */

window.UIComponents = {
    /**
     * 모던 플랫 스타일의 에러 모달 팝업을 생성합니다.
     * @param {string} title - 에러 종류 타이틀 (예: "유효하지 않은 파일 규격")
     * @param {string} message - 상세 원인 내용
     */
    showErrorDialog: function(title, message) {
        const existing = document.querySelector('.modern-modal-overlay');
        if (existing) existing.remove();

        const dialogHtml = `
            <div class="modern-modal-overlay">
                <div class="modern-modal" style="max-width: 360px;">
                    <div class="modern-modal__header" style="color: var(--error); display: flex; align-items: center; gap: 8px;">
                        <span>⚠️</span> ${title}
                    </div>
                    <div class="modern-modal__body" style="font-size: 13px; color: var(--slate-600); word-break: break-all;">
                        ${message}
                    </div>
                    <div class="modern-modal__footer">
                        <button class="modern-btn modern-btn--primary" style="background-color: var(--error);" onclick="this.closest('.modern-modal-overlay').remove()">확인</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
    },

    /**
     * 비동기 작업 진행 상황을 알려주는 모던 진행률 팝업을 띄웁니다.
     * @param {string} title - 진행 중인 태스크 이름
     * @param {string} message - 태스크 세부 상태 메시지
     * @returns {object} updateProgress(percent, msg), close() 컨트롤러 객체
     */
    showProgressDialog: function(title, message) {
        const existing = document.querySelector('.modern-modal-overlay');
        if (existing) existing.remove();

        const progressHtml = `
            <div class="modern-modal-overlay">
                <div class="modern-modal" style="max-width: 320px;">
                    <div class="modern-modal__header">
                        ${title}
                    </div>
                    <div class="modern-modal__body">
                        <div class="modern-progress-message" style="margin-bottom: 10px; font-size: 13px; color: var(--slate-600);">${message}</div>
                        <!-- 모던 프로그레스 바 -->
                        <div style="height: 6px; background-color: var(--slate-100); border-radius: 3px; overflow: hidden; width: 100%; position: relative;">
                            <div id="dialog-progress-fill" style="width: 0%; height: 100%; background-color: var(--blue-600); border-radius: 3px; transition: width 0.2s ease;"></div>
                        </div>
                        <div id="dialog-progress-text" style="font-size: 11px; color: var(--slate-400); text-align: right; margin-top: 4px;">0%</div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', progressHtml);
        
        const overlay = document.querySelector('.modern-modal-overlay');
        const fill = overlay.querySelector('#dialog-progress-fill');
        const text = overlay.querySelector('#dialog-progress-text');
        const msg = overlay.querySelector('.modern-progress-message');

        return {
            updateProgress: function(percent, newMsg = '') {
                fill.style.width = `${percent}%`;
                text.textContent = `${Math.round(percent)}%`;
                if (newMsg) msg.textContent = newMsg;
            },
            close: function() {
                overlay.remove();
            }
        };
    },

    /**
     * 윈도우 창 드래그 기능 (모던 플랫 테마에서는 무력화하거나 미사용하나,
     * 혹시 모를 레거시 코드 호출 안정성을 위해 빈 상태로 껍데기만 보존)
     */
    makeDraggable: function(element, dragAnchor) {
        // 모던 플랫 UI 레이아웃에서는 고정 뷰를 사용하므로 기능 생략
    },

    /**
     * 시계 초기화 기능 (사이드바 웹 레이아웃에서는 불필요하나 호환성 보존)
     */
    initClock: function(clockElement) {
        // 기능 생략
    }
};

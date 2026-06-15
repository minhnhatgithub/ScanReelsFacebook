document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const reelsForm = document.getElementById('reels-form');
    const reelsUrlInput = document.getElementById('reels-url');
    const btnPasteUrl = document.getElementById('btn-paste-url');
    const reelsAmountSelect = document.getElementById('reels-amount-select');
    const reelsAmountInput = document.getElementById('reels-amount-input');
    const btnBackToSelect = document.getElementById('btn-back-to-select');
    const btnSubmit = document.getElementById('btn-submit');
    const resultContainer = document.getElementById('result-container');
    const reelsTbody = document.getElementById('reels-tbody');
    const authorNameText = document.getElementById('author-name-text');
    const tablePaginationContainer = document.getElementById('table-pagination-container');
    const btnPrevPage = document.getElementById('btn-prev-page');
    const btnNextPage = document.getElementById('btn-next-page');
    const pageInfo = document.getElementById('page-info');
    const loadMoreContainer = document.getElementById('load-more-container');
    const btnLoadMore = document.getElementById('btn-load-more');
    const toastContainer = document.getElementById('toast-container');
    const filterSearchInput = document.getElementById('filter-search-input');
    const filterSortSelect = document.getElementById('filter-sort-select');

    // 1. Mobile Menu Toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu and smooth scroll when clicking a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        const headerEl = document.querySelector('.header');
                        const headerHeight = headerEl ? headerEl.offsetHeight : 80;
                        const targetPos = targetEl.offsetTop - headerHeight + 5;
                        window.scrollTo({
                            top: targetPos,
                            behavior: 'smooth'
                        });
                        
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
        });
    }

    // Clipboard Paste handler
    if (btnPasteUrl && reelsUrlInput) {
        btnPasteUrl.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    reelsUrlInput.value = text.trim();
                    showToast('Đã dán liên kết từ clipboard!');
                } else {
                    showToast('Bộ nhớ tạm rỗng hoặc không có văn bản!');
                }
            } catch (err) {
                console.error('Không thể đọc Clipboard: ', err);
                showToast('Không có quyền đọc Clipboard. Vui lòng tự dán bằng Ctrl + V!');
            }
        });
    }

    // Helper: Show Toast Notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger reflow/animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // Helper: Extract a mock ID/slug from Facebook Reels URLs
    function extractReelSlug(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
            
            // Look for reels or reel path
            const reelIdx = pathParts.findIndex(p => p === 'reels' || p === 'reel');
            if (reelIdx !== -1 && pathParts[reelIdx + 1]) {
                return pathParts[reelIdx + 1].substring(0, 15);
            }
            
            // Look for any parameter
            const fbid = urlObj.searchParams.get('v') || urlObj.searchParams.get('fbid');
            if (fbid) return fbid.substring(0, 15);
            
            // Return fallback random code
            return Math.floor(1000000000 + Math.random() * 9000000000).toString();
        } catch (e) {
            // Fallback for non-standard links
            return Math.floor(1000000000 + Math.random() * 9000000000).toString();
        }
    }

    // Active downloads map for managing aborting and pausing
    const activeDownloads = {};

    // Helper: Show download progress toast
    function showProgressToast(id, filename, quality) {
        let toast = document.getElementById(`toast-download-${id}`);
        if (!toast) {
            toast = document.createElement('div');
            toast.id = `toast-download-${id}`;
            toast.className = 'toast download-progress-toast show';
            toast.style.pointerEvents = 'auto';
            
            toast.innerHTML = `
                <div class="toast-progress-content">
                    <div class="toast-progress-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px;">
                        <div class="toast-progress-info" style="flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            <strong>Tải ${quality}</strong>: <span class="progress-percent">0%</span>
                            <span class="progress-speed" style="margin-left: 6px; font-weight: normal; font-size: 11px; color: #94a3b8;">(0 KB/s)</span>
                        </div>
                        <div class="toast-progress-actions" style="display: flex; gap: 6px; flex-shrink: 0;">
                            <button type="button" class="btn-toast-action btn-toast-pause" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: #3b82f6; cursor: pointer; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; transition: all 0.2s; outline: none;">Tạm dừng</button>
                            <button type="button" class="btn-toast-action btn-toast-cancel" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; cursor: pointer; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; transition: all 0.2s; outline: none;">Hủy</button>
                        </div>
                    </div>
                    <div class="toast-progress-bar-container">
                        <div class="toast-progress-bar"></div>
                    </div>
                </div>
            `;
            toastContainer.appendChild(toast);
            
            const btnPause = toast.querySelector('.btn-toast-pause');
            const btnCancel = toast.querySelector('.btn-toast-cancel');
            
            btnPause.addEventListener('click', () => {
                const dl = activeDownloads[id];
                if (!dl) return;
                
                if (dl.isPaused) {
                    dl.isPaused = false;
                    btnPause.textContent = 'Tạm dừng';
                    btnPause.style.color = '#3b82f6';
                    btnPause.style.background = 'rgba(59, 130, 246, 0.1)';
                    btnPause.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    if (dl.resumeResolve) {
                        dl.resumeResolve();
                        dl.resumeResolve = null;
                    }
                } else {
                    dl.isPaused = true;
                    btnPause.textContent = 'Tiếp tục';
                    btnPause.style.color = '#10b981';
                    btnPause.style.background = 'rgba(16, 185, 129, 0.1)';
                    btnPause.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                }
            });
            
            btnCancel.addEventListener('click', () => {
                const dl = activeDownloads[id];
                if (!dl) return;
                dl.controller.abort();
            });
        }
        return toast;
    }

    function updateProgressToast(toast, percent, speedText) {
        if (!toast) return;
        const percentEl = toast.querySelector('.progress-percent');
        const speedEl = toast.querySelector('.progress-speed');
        const barEl = toast.querySelector('.toast-progress-bar');
        
        if (percentEl) percentEl.textContent = `${percent}%`;
        if (speedEl) speedEl.textContent = speedText ? `(${speedText})` : '';
        if (barEl) barEl.style.width = `${percent}%`;
    }

    function removeProgressToast(toast, success = true, message = '') {
        if (!toast) return;
        if (success) {
            toast.className = 'toast download-progress-toast success show';
            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981; flex-shrink: 0;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>${message || 'Tải file thành công!'}</span>
                </div>
            `;
        } else {
            toast.className = 'toast download-progress-toast error show';
            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #ef4444; flex-shrink: 0;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>${message || 'Tải file thất bại.'}</span>
                </div>
            `;
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // Helper: Trigger direct download using blob or fallback to tab redirection
    async function downloadFile(url, filename, quality) {
        const toastId = filename.replace(/[^a-zA-Z0-9]/g, '_');
        const controller = new AbortController();
        const toast = showProgressToast(toastId, filename, quality);
        
        activeDownloads[toastId] = {
            controller: controller,
            isPaused: false,
            resumeResolve: null
        };
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error('Mạng không phản hồi tốt');
            
            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            
            const reader = response.body.getReader();
            let loaded = 0;
            let activeDuration = 0;
            let lastTick = Date.now();
            const chunks = [];
            
            while(true) {
                const dl = activeDownloads[toastId];
                if (!dl) break; // terminated early
                
                if (dl.isPaused) {
                    const speedEl = toast.querySelector('.progress-speed');
                    if (speedEl) speedEl.textContent = '(Đang dừng)';
                    
                    await new Promise(resolve => {
                        dl.resumeResolve = resolve;
                    });
                    lastTick = Date.now(); // Reset tick after pause
                }
                
                const {done, value} = await reader.read();
                if (done) break;
                
                const now = Date.now();
                activeDuration += (now - lastTick) / 1000;
                lastTick = now;
                
                chunks.push(value);
                loaded += value.length;
                
                const speed = activeDuration > 0 ? (loaded / activeDuration) : 0;
                
                let speedText = '';
                if (speed > 1024 * 1024) {
                    speedText = (speed / (1024 * 1024)).toFixed(1) + ' MB/s';
                } else {
                    speedText = (speed / 1024).toFixed(0) + ' KB/s';
                }
                
                let percent = 0;
                if (total > 0) {
                    percent = Math.round((loaded / total) * 100);
                }
                
                updateProgressToast(toast, percent, speedText);
            }
            
            delete activeDownloads[toastId];
            
            const blob = new Blob(chunks);
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
            removeProgressToast(toast, true, `Tải ${quality} thành công!`);
        } catch (error) {
            delete activeDownloads[toastId];
            if (error.name === 'AbortError') {
                removeProgressToast(toast, false, 'Đã hủy tải video.');
                return;
            }
            console.warn('Lỗi tải file trực tiếp (CORS hoặc Mạng), chuyển hướng mở tab mới:', error);
            // Fallback: Open in a new tab
            window.open(url, '_blank', 'noopener,noreferrer');
            removeProgressToast(toast, false, 'Mở tab mới. Vui lòng chuột phải chọn "Lưu..." để tải.');
        }
    }

    let currentUrl = '';
    let currentAmount = 10;
    let nextPageCursor = null;
    let currentCollectionId = null;
    let allReels = [];
    let currentPage = 1;
    const PAGE_SIZE = 5;

    // Helper: Initialize a custom styled dropdown
    function initCustomDropdown(containerId, hiddenInputId) {
        const container = document.getElementById(containerId);
        const hiddenInput = document.getElementById(hiddenInputId);
        if (!container || !hiddenInput) return;
        
        const trigger = container.querySelector('.custom-select-trigger');
        const triggerText = trigger.querySelector('span');
        const optionsList = container.querySelector('.custom-select-options');
        const options = container.querySelectorAll('.custom-option');
        
        // Open/Close dropdown on trigger click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other open custom dropdowns first
            document.querySelectorAll('.custom-select-container').forEach(c => {
                if (c !== container) c.classList.remove('open');
            });
            container.classList.toggle('open');
        });
        
        // Select option
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.getAttribute('data-value');
                const text = opt.textContent;
                
                // Update trigger text & active class
                triggerText.textContent = text;
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                // Update underlying hidden input value & dispatch event
                hiddenInput.value = value;
                hiddenInput.dispatchEvent(new Event('change'));
                
                // Close dropdown list
                container.classList.remove('open');
            });
        });
        
        // Listen to programmatic changes of the hidden input value
        hiddenInput.addEventListener('change', () => {
            const val = hiddenInput.value;
            const activeOpt = Array.from(options).find(o => o.getAttribute('data-value') === val);
            if (activeOpt) {
                triggerText.textContent = activeOpt.textContent;
                options.forEach(o => o.classList.remove('active'));
                activeOpt.classList.add('active');
            }
        });
    }

    // Initialize custom dropdowns
    initCustomDropdown('amount-custom-select-container', 'reels-amount-select');
    initCustomDropdown('sort-custom-select-container', 'filter-sort-select');
    initCustomDropdown('format-custom-select-container', 'filter-format-select');

    // Close all custom dropdowns when clicking anywhere outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-container').forEach(c => {
            c.classList.remove('open');
        });
    });

    // Helper: Parse reduced view count string (e.g., "8,3K", "1,5 triệu") into an integer
    function parseReducedPlayCount(str) {
        if (!str) return 0;
        let normalized = str.toString().toLowerCase().trim();
        normalized = normalized.replace(',', '.'); // Handle comma as decimal point
        
        let multiplier = 1;
        if (normalized.includes('k') || normalized.includes('nghìn') || normalized.includes('ngan')) {
            multiplier = 1000;
            normalized = normalized.replace('k', '').replace('nghìn', '').replace('ngan', '').trim();
        } else if (normalized.includes('m') || normalized.includes('triệu') || normalized.includes('trieu')) {
            multiplier = 1000000;
            normalized = normalized.replace('m', '').replace('triệu', '').replace('trieu', '').trim();
        }
        
        const value = parseFloat(normalized);
        return isNaN(value) ? 0 : value * multiplier;
    }

    // Helper: Get filtered and sorted copy of reels
    function getFilteredAndSortedReels() {
        const query = filterSearchInput ? filterSearchInput.value.trim().toLowerCase() : '';
        const sortType = filterSortSelect ? filterSortSelect.value : 'default';
        
        // 1. Filter by Caption/Text
        let reels = [...allReels];
        if (query) {
            reels = reels.filter(reel => {
                const text = (reel.text || '').toLowerCase();
                return text.includes(query);
            });
        }
        
        // 2. Sort
        if (sortType === 'views-desc') {
            reels.sort((a, b) => parseReducedPlayCount(b.play_count_reduced) - parseReducedPlayCount(a.play_count_reduced));
        } else if (sortType === 'views-asc') {
            reels.sort((a, b) => parseReducedPlayCount(a.play_count_reduced) - parseReducedPlayCount(b.play_count_reduced));
        } else if (sortType === 'duration-desc') {
            reels.sort((a, b) => (b.length_in_second || 0) - (a.length_in_second || 0));
        } else if (sortType === 'duration-asc') {
            reels.sort((a, b) => (a.length_in_second || 0) - (b.length_in_second || 0));
        }
        
        return reels;
    }

    // Helper: Format length in seconds (e.g. 566.032) to MM:SS or HH:MM:SS
    function formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        let result = '';
        if (hrs > 0) {
            result += (hrs < 10 ? '0' + hrs : hrs) + ':';
        }
        result += (mins < 10 ? '0' + mins : mins) + ':';
        result += (secs < 10 ? '0' + secs : secs);
        return result;
    }

    // Helper: Create HTML for a single Reel table row
    function createReelRowHtml(reel, index) {
        const durationText = formatDuration(reel.length_in_second);
        const caption = reel.text ? reel.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Không có mô tả';
        
        const hdUrl = reel.browser_native_hd_url || '';
        const sdUrl = reel.browser_native_sd_url || '';
        
        let hdButtonHtml = hdUrl 
            ? `<a href="${hdUrl}" class="btn-table-download hd" data-id="${reel.id}" data-quality="HD">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                HD
               </a>`
            : '';
            
        let sdButtonHtml = sdUrl
            ? `<a href="${sdUrl}" class="btn-table-download sd" data-id="${reel.id}" data-quality="SD">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                SD
               </a>`
            : '';

        const fbWatchUrl = `https://www.facebook.com/watch/?v=${reel.id}`;

        return `
            <tr data-id="${reel.id}">
                <td class="col-stt">
                    <div class="table-stt">${index}</div>
                </td>
                <td class="col-thumb">
                    <div class="table-thumb-wrapper">
                        <div class="table-thumb" style="background-image: url('${reel.first_frame_thumbnail || ''}')"></div>
                    </div>
                </td>
                <td class="col-caption">
                    <div class="table-caption" title="${caption.replace(/"/g, '&quot;')}">${caption}</div>
                </td>
                <td class="col-duration">
                    <div class="table-duration">${durationText}</div>
                </td>
                <td class="col-views">
                    <div class="table-views">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>${reel.play_count_reduced || '0'}</span>
                    </div>
                </td>
                <td class="col-actions">
                    <div class="table-actions">
                        ${hdButtonHtml}
                        ${sdButtonHtml}
                        <a href="${fbWatchUrl}" target="_blank" rel="noopener noreferrer" class="btn-table-link" title="Xem trên Facebook">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                </td>
            </tr>
        `;
    }

    // Helper: Render table page based on currentPage
    function renderTablePage() {
        if (!reelsTbody) return;
        reelsTbody.innerHTML = '';
        
        const activeReels = getFilteredAndSortedReels();
        const totalItems = activeReels.length;
        const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
        
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
        
        const pageItems = activeReels.slice(startIndex, endIndex);
        
        let gridHtml = '';
        pageItems.forEach((reel, index) => {
            const globalIndex = startIndex + index + 1;
            gridHtml += createReelRowHtml(reel, globalIndex);
        });
        reelsTbody.innerHTML = gridHtml;
        
        // Update table pagination UI
        if (totalItems > PAGE_SIZE) {
            tablePaginationContainer.style.display = 'flex';
            pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
            btnPrevPage.disabled = (currentPage === 1);
            btnNextPage.disabled = (currentPage === totalPages);
        } else {
            tablePaginationContainer.style.display = 'none';
        }
    }

    // Event delegation on reelsTbody for download clicks
    if (reelsTbody) {
        reelsTbody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-table-download');
            if (btn) {
                e.preventDefault();
                const href = btn.getAttribute('href');
                if (!href || href === 'null' || href === 'undefined') {
                    showToast('Không tìm thấy link tải chất lượng này!');
                    return;
                }
                const quality = btn.getAttribute('data-quality');
                const reelId = btn.getAttribute('data-id');
                const filename = `Reel_${reelId}_${quality}.mp4`;
                downloadFile(href, filename, quality);
            }
        });
    }

    // Local Page Navigation Event Listeners
    if (btnPrevPage) {
        btnPrevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTablePage();
            }
        });
    }

    if (btnNextPage) {
        btnNextPage.addEventListener('click', () => {
            const activeReels = getFilteredAndSortedReels();
            const totalPages = Math.ceil(activeReels.length / PAGE_SIZE) || 1;
            if (currentPage < totalPages) {
                currentPage++;
                renderTablePage();
            }
        });
    }

    // Toggle between Select and Custom Amount Input
    if (reelsAmountSelect && reelsAmountInput && btnBackToSelect) {
        const amountCustomSelectContainer = document.getElementById('amount-custom-select-container');
        
        reelsAmountSelect.addEventListener('change', () => {
            if (reelsAmountSelect.value === 'custom') {
                if (amountCustomSelectContainer) amountCustomSelectContainer.style.display = 'none';
                reelsAmountInput.style.display = 'block';
                btnBackToSelect.style.display = 'inline-flex';
                reelsAmountInput.value = '10'; // Reset/default to 10
                reelsAmountInput.focus();
            }
        });

        btnBackToSelect.addEventListener('click', () => {
            reelsAmountInput.style.display = 'none';
            btnBackToSelect.style.display = 'none';
            if (amountCustomSelectContainer) amountCustomSelectContainer.style.display = 'block';
            reelsAmountSelect.value = '10'; // Default back to 10
            reelsAmountSelect.dispatchEvent(new Event('change'));
        });
    }

    // 3. Form Submission Handler
    if (reelsForm) {
        reelsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = reelsUrlInput.value.trim();
            
            let amount = 10;
            if (reelsAmountSelect && reelsAmountSelect.value !== 'custom') {
                amount = parseInt(reelsAmountSelect.value, 10);
            } else if (reelsAmountInput) {
                amount = parseInt(reelsAmountInput.value, 10);
            }

            if (!url) {
                showToast('Vui lòng nhập link Profile/Page hoặc UID Facebook!');
                return;
            }

            if (isNaN(amount) || amount < 1) {
                showToast('Số lượng video quét phải từ 1 trở lên!');
                return;
            }

            // Save search params to global state
            currentUrl = url;
            currentAmount = amount;
            nextPageCursor = null;
            currentCollectionId = null;
            allReels = [];
            currentPage = 1;

            // Reset filters on new search query
            if (filterSearchInput) filterSearchInput.value = '';
            if (filterSortSelect) {
                filterSortSelect.value = 'default';
                filterSortSelect.dispatchEvent(new Event('change'));
            }

            // Loading state
            btnSubmit.disabled = true;
            const originalBtnHtml = btnSubmit.innerHTML;
            btnSubmit.innerHTML = `
                <svg class="spinner" width="16" height="16" viewBox="0 0 50 50" style="animation: spin 1s linear infinite; margin-right: 8px;">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80, 200" stroke-dashoffset="0"></circle>
                </svg>
                <span>Đang quét...</span>
            `;

            // Style spin animation dynamically if not present
            if (!document.getElementById('spin-keyframes')) {
                const styleSheet = document.createElement("style");
                styleSheet.id = 'spin-keyframes';
                styleSheet.innerText = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(styleSheet);
            }

            // Collapse previous results
            resultContainer.classList.remove('show');
            reelsTbody.innerHTML = '';
            tablePaginationContainer.style.display = 'none';
            loadMoreContainer.style.display = 'none';

            // API Request URL
            const apiUrl = `https://steep-pine-5334.minhnhatdeptroai.workers.dev/getListReels?url=${encodeURIComponent(url)}&amount=${amount}`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error('Mạng không phản hồi tốt');
                    return response.json();
                })
                .then(data => {
                    if (data.success && data.reels && data.reels.length > 0) {
                        // Update Author Badge Name
                        authorNameText.textContent = data.author_name || `UID: ${data.user_id_requested || 'Facebook User'}`;
                        
                        // Populate and Render Table Page
                        currentCollectionId = data.collection_id || null;
                        const seenIds = new Set();
                        allReels = data.reels.filter(r => {
                            if (seenIds.has(r.id)) return false;
                            seenIds.add(r.id);
                            return true;
                        });
                        currentPage = 1;
                        renderTablePage();

                        // Check pagination
                        if (data.summary && data.summary.has_more_pages_left && data.summary.next_page_cursor) {
                            nextPageCursor = data.summary.next_page_cursor;
                            loadMoreContainer.style.display = 'flex';
                        } else {
                            loadMoreContainer.style.display = 'none';
                        }

                        // Display result container
                        resultContainer.classList.add('show');
                        showToast(`Quét thành công ${data.reels.length} video Reels!`);
                    } else {
                        showToast(data.message || 'Không tìm thấy video Reels nào. Vui lòng thử lại!');
                    }
                })
                .catch(error => {
                    console.error('API Error:', error);
                    showToast('Lỗi máy chủ hoặc link/UID không được hỗ trợ. Vui lòng kiểm tra lại!');
                })
                .finally(() => {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalBtnHtml;
                });
        });
    }

    // 4. Load More Button Handler
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            if (!nextPageCursor || !currentUrl) return;

            btnLoadMore.disabled = true;
            const originalBtnHtml = btnLoadMore.innerHTML;
            btnLoadMore.innerHTML = `
                <svg class="spinner" width="16" height="16" viewBox="0 0 50 50" style="animation: spin 1s linear infinite; margin-right: 8px;">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80, 200" stroke-dashoffset="0"></circle>
                </svg>
                <span>Đang tải thêm...</span>
            `;

            const apiUrl = `https://steep-pine-5334.minhnhatdeptroai.workers.dev/getListReels?url=${encodeURIComponent(currentUrl)}&amount=${currentAmount}&cursor=${encodeURIComponent(nextPageCursor)}&collection_id=${encodeURIComponent(currentCollectionId)}`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error('Mạng không phản hồi tốt');
                    return response.json();
                })
                .then(data => {
                    if (data.success && data.reels && data.reels.length > 0) {
                        // Append new Reels and update view
                        const existingIds = new Set(allReels.map(r => r.id));
                        const uniqueNewReels = data.reels.filter(r => !existingIds.has(r.id));
                        allReels = allReels.concat(uniqueNewReels);
                        renderTablePage();

                        // Update pagination
                        if (data.summary && data.summary.has_more_pages_left && data.summary.next_page_cursor) {
                            nextPageCursor = data.summary.next_page_cursor;
                            loadMoreContainer.style.display = 'flex';
                        } else {
                            nextPageCursor = null;
                            loadMoreContainer.style.display = 'none';
                        }

                        if (uniqueNewReels.length > 0) {
                            showToast(`Đã tải thêm ${uniqueNewReels.length} video Reels!`);
                        } else {
                            showToast('Không có thêm video Reels mới nào (tất cả video tải về đã tồn tại).');
                        }
                    } else {
                        showToast(data.message || 'Không có thêm video Reels nào.');
                        loadMoreContainer.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('API Error:', error);
                    showToast('Lỗi khi tải thêm Reels. Vui lòng thử lại!');
                })
                .finally(() => {
                    btnLoadMore.disabled = false;
                    btnLoadMore.innerHTML = originalBtnHtml;
                });
        });
    }

    // 4. Dark Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Check for stored preference or system default
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            showToast(isDark ? 'Đã kích hoạt chế độ tối!' : 'Đã kích hoạt chế độ sáng!');
        });
    }

    // 5. FAQ Accordion Toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // Event listeners for Table Search and Sort filters
    if (filterSearchInput) {
        filterSearchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTablePage();
        });
    }

    if (filterSortSelect) {
        filterSortSelect.addEventListener('change', () => {
            currentPage = 1;
            renderTablePage();
        });
    }

    // 6. Scroll Spy for active nav menu highlighting
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinksList = document.querySelectorAll('.nav-link');
    
    function updateScrollSpy() {
        let scrollPos = window.scrollY || document.documentElement.scrollTop;
        const offset = 120; // Highlight offset when section is close to header
        
        let activeSectionId = 'hero';
        
        // Manually check if we are at top
        const heroEl = document.getElementById('hero');
        if (heroEl && scrollPos < heroEl.offsetHeight - offset) {
            activeSectionId = 'hero';
        } else {
            document.querySelectorAll('section[id]').forEach(sec => {
                if (scrollPos >= sec.offsetTop - offset) {
                    activeSectionId = sec.getAttribute('id');
                }
            });
        }
        
        navLinksList.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${activeSectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateScrollSpy);
    window.addEventListener('resize', updateScrollSpy);

    // 7. Custom Context Menu Handler
    const contextMenu = document.getElementById('custom-context-menu');
    const menuReelIdSpan = document.getElementById('menu-reel-id');
    let rightClickedReel = null;

    if (reelsTbody && contextMenu) {
        reelsTbody.addEventListener('contextmenu', (e) => {
            const row = e.target.closest('tr');
            if (!row) return;

            const reelId = row.getAttribute('data-id');
            if (!reelId) return;

            rightClickedReel = allReels.find(r => r.id === reelId);
            if (!rightClickedReel) return;

            e.preventDefault();

            // Set reel ID in header
            if (menuReelIdSpan) {
                menuReelIdSpan.textContent = reelId;
            }

            // Show menu at mouse position
            contextMenu.style.display = 'flex';
            
            // Adjust position if it overflows the screen
            const menuWidth = contextMenu.offsetWidth || 290;
            const menuHeight = contextMenu.offsetHeight || 300;
            let posX = e.clientX;
            let posY = e.clientY;

            if (posX + menuWidth > window.innerWidth) {
                posX = window.innerWidth - menuWidth - 10;
            }
            if (posY + menuHeight > window.innerHeight) {
                posY = window.innerHeight - menuHeight - 10;
            }

            contextMenu.style.left = `${posX}px`;
            contextMenu.style.top = `${posY}px`;
        });
    }

    // Hide context menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    document.addEventListener('contextmenu', (e) => {
        if (reelsTbody && !reelsTbody.contains(e.target) && contextMenu) {
            contextMenu.style.display = 'none';
        }
    });

    // Helper: Write to Clipboard
    async function copyToClipboard(text, successMsg) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(successMsg);
            if (contextMenu) contextMenu.style.display = 'none';
        } catch (err) {
            console.error('Không thể copy: ', err);
            showToast('Lỗi khi copy vào clipboard!');
        }
    }

    // Bind Context Menu Actions
    const btnCopyUid = document.getElementById('menu-copy-uid');
    const btnCopyCaption = document.getElementById('menu-copy-caption');
    const btnCopyLinks = document.getElementById('menu-copy-links');
    const btnCopyFormattedRow = document.getElementById('menu-copy-formatted-row');
    const btnCopyAllInfo = document.getElementById('menu-copy-all-info');
    const btnCopyListUids = document.getElementById('menu-copy-list-uids');
    const btnCopyFormattedList = document.getElementById('menu-copy-formatted-list');
    const btnCopyListFull = document.getElementById('menu-copy-list-full');

    // Toggle between Format Select and Custom Format Input
    const filterFormatSelect = document.getElementById('filter-format-select');
    const formatCustomInput = document.getElementById('format-custom-input');
    const btnBackToFormatSelect = document.getElementById('btn-back-to-format-select');
    const formatCustomSelectContainer = document.getElementById('format-custom-select-container');

    if (filterFormatSelect && formatCustomInput && btnBackToFormatSelect && formatCustomSelectContainer) {
        filterFormatSelect.addEventListener('change', () => {
            if (filterFormatSelect.value === 'custom') {
                formatCustomSelectContainer.style.display = 'none';
                formatCustomInput.style.display = 'block';
                btnBackToFormatSelect.style.display = 'inline-flex';
                formatCustomInput.value = '{uid}|{caption}|{hd_url}';
                formatCustomInput.focus();
            }
        });

        btnBackToFormatSelect.addEventListener('click', () => {
            formatCustomInput.style.display = 'none';
            btnBackToFormatSelect.style.display = 'none';
            formatCustomSelectContainer.style.display = 'block';
            filterFormatSelect.value = '{uid}|{caption}|{hd_url}';
            filterFormatSelect.dispatchEvent(new Event('change'));
        });
    }

    // Helper to format reel details according to pattern
    function formatReel(reel, pattern) {
        if (!pattern || pattern === 'custom') {
            pattern = formatCustomInput ? formatCustomInput.value.trim() : '{uid}|{caption}|{hd_url}';
        }
        return pattern
            .replace(/{uid}/g, reel.id || '')
            .replace(/{caption}/g, (reel.text || '').replace(/\r?\n|\r/g, ' ')) // Keep multiline captions flat in list output
            .replace(/{hd_url}/g, reel.browser_native_hd_url || '')
            .replace(/{sd_url}/g, reel.browser_native_sd_url || '');
    }

    if (btnCopyUid) {
        btnCopyUid.addEventListener('click', () => {
            if (!rightClickedReel) return;
            copyToClipboard(rightClickedReel.id, 'Đã copy UID: ' + rightClickedReel.id);
        });
    }

    if (btnCopyCaption) {
        btnCopyCaption.addEventListener('click', () => {
            if (!rightClickedReel) return;
            copyToClipboard(rightClickedReel.text || '', 'Đã copy Mô tả!');
        });
    }

    if (btnCopyLinks) {
        btnCopyLinks.addEventListener('click', () => {
            if (!rightClickedReel) return;
            const hdUrl = rightClickedReel.browser_native_hd_url || 'Không có';
            const sdUrl = rightClickedReel.browser_native_sd_url || 'Không có';
            const textToCopy = `HD: ${hdUrl}\nSD: ${sdUrl}`;
            copyToClipboard(textToCopy, 'Đã copy link tải HD & SD!');
        });
    }

    if (btnCopyFormattedRow) {
        btnCopyFormattedRow.addEventListener('click', () => {
            if (!rightClickedReel) return;
            const pattern = filterFormatSelect ? filterFormatSelect.value : '';
            const formatted = formatReel(rightClickedReel, pattern);
            copyToClipboard(formatted, 'Đã copy dòng này theo định dạng!');
        });
    }

    if (btnCopyAllInfo) {
        btnCopyAllInfo.addEventListener('click', () => {
            if (!rightClickedReel) return;
            const textToCopy = `UID: ${rightClickedReel.id}\nMô tả: ${rightClickedReel.text || ''}\nLink HD: ${rightClickedReel.browser_native_hd_url || ''}\nLink SD: ${rightClickedReel.browser_native_sd_url || ''}`;
            copyToClipboard(textToCopy, 'Đã copy toàn bộ thông tin dòng này!');
        });
    }

    if (btnCopyListUids) {
        btnCopyListUids.addEventListener('click', () => {
            const activeReels = getFilteredAndSortedReels();
            if (activeReels.length === 0) {
                showToast('Danh sách trống!');
                return;
            }
            const uids = activeReels.map(r => r.id).join('\n');
            copyToClipboard(uids, `Đã copy danh sách ${activeReels.length} UID!`);
        });
    }

    if (btnCopyFormattedList) {
        btnCopyFormattedList.addEventListener('click', () => {
            const activeReels = getFilteredAndSortedReels();
            if (activeReels.length === 0) {
                showToast('Danh sách trống!');
                return;
            }
            const pattern = filterFormatSelect ? filterFormatSelect.value : '';
            const formattedList = activeReels.map(r => formatReel(r, pattern)).join('\n');
            copyToClipboard(formattedList, `Đã copy danh sách ${activeReels.length} video theo định dạng!`);
        });
    }

    if (btnCopyListFull) {
        btnCopyListFull.addEventListener('click', () => {
            const activeReels = getFilteredAndSortedReels();
            if (activeReels.length === 0) {
                showToast('Danh sách trống!');
                return;
            }
            const fullList = activeReels.map((r, i) => {
                return `${i + 1}. UID: ${r.id}\nMô tả: ${r.text || ''}\nLink HD: ${r.browser_native_hd_url || ''}\nLink SD: ${r.browser_native_sd_url || ''}\n-----------------------`;
            }).join('\n');
            copyToClipboard(fullList, `Đã copy danh sách thông tin ${activeReels.length} video!`);
        });
    }
});

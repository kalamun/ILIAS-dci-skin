window.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initSideBar();
    initDashboard();
    refactorCoursePage();
});

function initMenu() {
    for ( const element of document.querySelectorAll('.il-mainbar .dci-mainbar-li-submenu a.il-link.link-bulky')) {
        element.parentNode.removeChild(element);
    }
    document.querySelector('.metabar .dci-mainbar-li.search button')?.addEventListener('click', openSearch);
    document.querySelector('.metabar .dci-mainbar-li.search #mm_search_form > .input-group input')?.addEventListener('blur', closeSearch);
}

function openSearch() {
    const container = document.querySelector('.metabar .dci-mainbar-li.search #mm_search_form > .input-group');
    container?.classList.add('open');
    container?.querySelector('input')?.focus();
}
function closeSearch() {
    document.querySelector('.metabar .dci-mainbar-li.search #mm_search_form > .input-group')?.classList.remove('open');
}

function initDashboard() {
    for ( const element of document.querySelectorAll('.kalamun-training-dashboard_course')) {
        const permalink = element.dataset.permalink;
        if (permalink) {
            element.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = permalink;
            });
        }
    }
}

function initSideBar() {
    const sideBar = document.querySelector('.dci-sidebar');
    const pageContent = document.querySelector('.dci-layout-page-content');

    if (sideBar) {
        const toggleMenu = sideBar.querySelector('.dci-sidebar-toggle');
        toggleMenu?.addEventListener('click', toggleSideBar);
        
        const innerMenu = sideBar.querySelector('.dci-course-tabs-inner');

        const closed = window.localStorage.getItem("sidebar_closed") === "true";
        sideBar.classList.toggle("closed", closed || !innerMenu);
        pageContent.classList.toggle("sidebar-closed", closed || !innerMenu);
        setTimeout(() => {
            sideBar.classList.toggle("active", !!innerMenu);
            pageContent.classList.toggle("sidebar-active", !!innerMenu);
        }, 200);
    }
}

function refactorCoursePage() {
    const ilContentContainer = document.querySelector('#ilContentContainer');
    if (!ilContentContainer) return false;

    const rowWrapper = ilContentContainer.querySelector('body.is_course .row');
    if (rowWrapper) {
        const cover = ilContentContainer.querySelector('#il_center_col .dci-cover:first-of-type');
        if (cover) {
            const coverWrapper = document.querySelector('.dci-course-cover') || document.createElement('div');
            coverWrapper.className = "dci-course-cover";
            coverWrapper.appendChild(cover);
            //rowWrapper.parentNode.insertBefore(coverWrapper, rowWrapper);
        }

        const internalMenu = document.getElementsByClassName('dci-page-navbar')[0];

        if (internalMenu) {
            const internalMenuUl = document.createElement('ul');
            internalMenu.appendChild(internalMenuUl);
            
            const observer = new IntersectionObserver(entries => {
                const firstVisible = entries.find(entry => entry.isIntersecting);
                if (firstVisible) {
                    const firstVisibleIndex = Number(firstVisible.target?.dataset?.index);
                    if (firstVisibleIndex !== false && firstVisibleIndex !== null) {
                        internalMenu.querySelectorAll('li').forEach((li, index) => li.classList.toggle('visible', index === firstVisibleIndex));
                    }
                }
            }, { threshold: [1] });
            
            const headings = rowWrapper.querySelectorAll(`.dci-accordion-heading h2, #il_center_col > h2, .ilc_va_cntr_VAccordCntr h2`);
            if (headings.length) {
                for (const [index, heading] of headings.entries()) {
                    const internalMenuLi = document.createElement('li');
                    internalMenuLi.innerHTML = heading.textContent.trim();
                    internalMenuLi.addEventListener("click", () => scrollToElement(heading));
                    internalMenuUl.appendChild(internalMenuLi);
                    heading.dataset.index = index;
                    observer.observe(heading);
                }
            }
        }

        /* open scorm in modal */
        for (const link of rowWrapper.querySelectorAll('.kalamun-card:where([data-type=sahs], [data-type=htlm], [data-type=html], [data-type=file]) a')) {
            link.addEventListener('click', openLinkInModal);
        }
        
        /* open medias linked to images in modal */
        for (const link of rowWrapper.querySelectorAll('.ilc_Mob a[href*="cmd=displayMedia"], a.ilCOPageSection[target="_blank"]')) {
            link.addEventListener('click', openLinkInModal);
        }

        /* transform interactive images to modals */
        document.querySelectorAll(".ilc_iim_ContentPopup").forEach(popup => {
            popup.style = "";
            const area_id = popup.id?.replace('iim_popup_', '').replace(/_1$/, '');
            const area = document.querySelector(`area#marea_${area_id}`);
            document.body.appendChild(popup);

            if (area) {
                area.addEventListener('click', openLinkInModal);
            }
        });
    }

    for (const oldMeter of document.querySelectorAll('meter')) {
        const meter = createMeter(Number(oldMeter.getAttribute('value')));
        oldMeter.parentNode.insertBefore(meter, oldMeter);
        oldMeter.parentNode.removeChild(oldMeter, true);
    }
}


function scrollToElement(elm) {
    const container = document.querySelector('.dci-layout-page-content');
    if (!container) return false;

    const top = elm?.getBoundingClientRect().top + container.scrollTop - 150;
    container.scrollTo({top, behavior: "smooth"});
}

function toggleSideBar() {
    const sideBar = document.querySelector('.dci-sidebar');
    const pageContent = document.querySelector('.dci-layout-page-content');
    sideBar?.classList.toggle('closed');
    pageContent?.classList.toggle('sidebar-closed');
    window.localStorage.setItem("sidebar_closed", sideBar.classList.contains('closed'));
}

function createMeter(progress) {
    const normalizedProgress = Math.round(Math.min(progress, 100));
    const wrapper = document.createElement('div');
    wrapper.className = "dci-meter progress-" + (normalizedProgress < 50 ? 'red' : (normalizedProgress < 100 ? 'yellow' : 'green'));
    wrapper.dataset.progress = normalizedProgress;
    wrapper.dataset.progressRange = Math.ceil(normalizedProgress/10) + "0";
    wrapper.innerHTML = (
        `<span class="dci-meter-value" style="left:${normalizedProgress}%">${normalizedProgress}%</span><div class="dci-meter-progress" style="width:${normalizedProgress}%"></div>`
    );

    return wrapper;
}

function closeModal() {
    for (const modal of document.querySelectorAll('.dci-modal')) {
        modal.parentNode.removeChild(modal);
    }
}

function reloadCard(card) {
    if (!card) return false;
    fetch(window.location.href)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const query = `.kalamun-card[data-id="${card.dataset.id}"]`;
            const newCard = doc.querySelector(query);
            if (newCard) {
                card.parentNode.insertBefore(newCard, card);
                card.parentNode.removeChild(card);

                for (const oldMeter of newCard.querySelectorAll('meter')) {
                    const meter = createMeter(Number(oldMeter.getAttribute('value')));
                    oldMeter.parentNode.insertBefore(meter, oldMeter);
                    oldMeter.parentNode.removeChild(oldMeter, true);
                }

                /* open scorm in modal */
                if (["htlm", "sahs"].includes(newCard.dataset.type)) {
                    for (const link of newCard.querySelectorAll('a')) {
                        link.addEventListener('click', openLinkInModal);
                    }
                }
            }

            const newHeadings = doc.querySelectorAll('.dci-accordion-heading');
            const oldHeadings = document.querySelectorAll('.dci-accordion-heading');
            oldHeadings?.forEach((heading, i) => {
                if (newHeadings[i]) {
                    heading.parentNode.insertBefore(newHeadings[i], heading);
                    heading.parentNode.removeChild(heading);
                }
            });

            const queryCourseProgress = '.dci-course-tabs-inner span.course-progress';
            const newMenuCourseProgress = doc.querySelectorAll(queryCourseProgress);
            const oldMenuCourseProgress = document.querySelectorAll(queryCourseProgress);
            oldMenuCourseProgress?.forEach((progress, i) => {
                if (newMenuCourseProgress[i]) {
                    progress.parentNode.insertBefore(newMenuCourseProgress[i], progress);
                    progress.parentNode.removeChild(progress);
                    for (const oldMeter of newMenuCourseProgress[i].querySelectorAll('meter')) {
                        const meter = createMeter(Number(oldMeter.getAttribute('value')));
                        oldMeter.parentNode.insertBefore(meter, oldMeter);
                        oldMeter.parentNode.removeChild(oldMeter, true);
                    }               
                }
            });

            const queryMenuProgress = '.dci-course-tabs-inner span.progress';
            const newMenuProgress = doc.querySelectorAll(queryMenuProgress);
            const oldMenuProgress = document.querySelectorAll(queryMenuProgress);
            oldMenuProgress?.forEach((progress, i) => {
                if (newMenuProgress[i]) {
                    progress.parentNode.insertBefore(newMenuProgress[i], progress);
                    progress.parentNode.removeChild(progress);
                }
            });
        })
        .catch(function(err) {  
            console.log('Failed to fetch page: ', err);  
        });
}

function openLinkInModal(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    closeModal();

    const link = e.currentTarget || e.target;
    if (!link) return;

    let parentCard = false;
    for (let parent = link; parent; parent = parent.parentNode) {
        if (parent?.classList?.contains('kalamun-card')) {
            parentCard = parent;
            break;
        }
    }

    const modalWrapper = document.createElement('DIV');
    
    const modalBkg = document.createElement('DIV');
    modalBkg.className = 'dci-modal_bkg';
    modalBkg.addEventListener('click', closeModal);
    
    const modalHeader = document.createElement('DIV');
    modalHeader.className = 'dci-modal_header';
    
    const modalTitle = document.createElement('DIV');
    modalTitle.className = 'dci-modal_title';
    modalTitle.appendChild( document.createTextNode(link.title) );
    
    const modalClose = document.createElement('DIV');
    modalClose.className = 'dci-modal_close';
    modalClose.addEventListener('click', closeModal);
    if (parentCard) {
        modalClose.addEventListener('click', () => reloadCard(parentCard));
    }
    const modalCloseSpan = document.createElement('SPAN');
    modalCloseSpan.className = 'icon-close';
    
    const modalBody = document.createElement('DIV');
    modalBody.className = 'dci-modal_body';

    let isVideo = false;
    let modalBodyContent = false;

    if (link.id?.startsWith('marea_')) {
        /* interactive image popup */
        isVideo = true;

        const popupId = 'iim_popup_' + link.id?.replace('marea_', '') + '_1';
        const popup = document.querySelector('#' + popupId);
        const modalBodyContentInner = popup?.querySelector('div')?.cloneNode(true);
        modalBodyContent = document.createElement('div');
        modalBodyContent.className = "dci-modal_body-inner";
        if (modalBodyContentInner) modalBodyContent.appendChild(modalBodyContentInner);
        modalBodyContent.querySelectorAll('.ilc_Mob').forEach(ilcMob => {
            const video = ilcMob.querySelector('video')?.cloneNode(true);
            if (video) {
                video.removeAttribute("height");
                video.setAttribute("controls", "true");
                video.setAttribute("autoplay", "true");
                ilcMob.innerHTML = "";
                ilcMob.appendChild(video);
            }
            ilcMob.classList.add('dci-video');
        });

    } else {
        isVideo = !!link.href.match(/\.mp4$/) || link.href.includes('cmd=displayMedia');
        
        modalBodyContent = document.createElement('IFRAME');
        modalBodyContent.src = link.href;
    }
    
    modalWrapper.className = `dci-modal${isVideo ? ' is-video' : ''}`;

    modalHeader.appendChild(modalTitle);
    modalClose.appendChild(modalCloseSpan);
    modalHeader.appendChild(modalClose);
    modalBody.appendChild(modalBodyContent);
    modalWrapper.appendChild(modalBkg);
    modalWrapper.appendChild(modalHeader);
    modalWrapper.appendChild(modalBody);

    document.body.appendChild(modalWrapper);
}
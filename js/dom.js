window.addEventListener("DOMContentLoaded", () => {
    refactorNavMenu();
    refactorCoursePage();
});

function refactorNavMenu() {
    const wrapper = document.querySelector('.il-maincontrols-mainbar');
    const slates = wrapper.querySelectorAll('div.dci-main-slate');
    for (const [index, li] of Object.entries(wrapper.querySelectorAll('li.dci-mainbar-li'))) {
        li.querySelector('.dci-mainbar-li-submenu')?.appendChild(slates[index]);
    }
}

function refactorCoursePage() {
    const ilContentContainer = document.querySelector('#ilContentContainer');
    if (!ilContentContainer) return false;

    ilContentContainer.classList.add('dci-course-page');

    const rowWrapper = ilContentContainer.querySelector('.row');
    if (rowWrapper) {
        const cover = ilContentContainer.querySelector('#il_center_col figure.ilc_media_cont_MediaContainer:first-of-type');
        if (cover) {
            const coverWrapper = document.querySelector('.dci-course-cover') || document.createElement('div');
            coverWrapper.className = "dci-course-cover";
            coverWrapper.appendChild(cover);
            //rowWrapper.parentNode.insertBefore(coverWrapper, rowWrapper);
        }

        const sideBar = document.createElement('div');
        sideBar.className = "dci-course-sidebar";
        rowWrapper.insertBefore(sideBar, rowWrapper.childNodes[0]);

        const internalMenu = document.createElement('div');
        internalMenu.className = 'dci-internal-menu';
        const internalMenuUl = document.createElement('ul');
        internalMenu.appendChild(internalMenuUl);

        for(const heading of rowWrapper.querySelectorAll('h1, h2, h3')) {
            const internalMenuLi = document.createElement('li');
            internalMenuLi.innerHTML = heading.textContent.trim();
            internalMenuLi.addEventListener("click", () => scrollToElement(heading));
            internalMenuUl.appendChild(internalMenuLi);
        }

        sideBar.appendChild(internalMenu);
    }
}


function scrollToElement(elm) {
    const top = elm?.getBoundingClientRect().top + document.body.scrollTop - 150;
    document.body.scrollTo({top, behavior: "smooth"});
}


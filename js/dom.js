window.addEventListener("DOMContentLoaded", () => {
    refactorNavMenu();
    initSideBar();
    refactorCoursePage();
});

function refactorNavMenu() {
    const wrapper = document.querySelector('.il-maincontrols-mainbar');
    const slates = wrapper.querySelectorAll('div.dci-main-slate');
    for (const [index, li] of Object.entries(wrapper.querySelectorAll('li.dci-mainbar-li'))) {
        li.querySelector('.dci-mainbar-li-submenu')?.appendChild(slates[index]);
    }
}

function initSideBar() {
    const sideBar = document.querySelector('.dci-sidebar');
    if (sideBar) {
        const toggleMenu = sideBar.querySelector('.dci-sidebar-toggle');
        toggleMenu?.addEventListener('click', toggleSideBar);
        
        const innerMenu = sideBar.querySelector('.dci-course-tabs-inner');

        const closed = window.localStorage.getItem("sidebar_closed") === "true";
        sideBar.classList.toggle("closed", closed || !innerMenu);
        setTimeout(() => sideBar.classList.toggle("active", !!innerMenu), 200);
    }
}

function refactorCoursePage() {
    const ilContentContainer = document.querySelector('#ilContentContainer');
    if (!ilContentContainer) return false;

    const rowWrapper = ilContentContainer.querySelector('.row');
    if (rowWrapper) {
        const cover = ilContentContainer.querySelector('#il_center_col figure:first-of-type');
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
            
            for(const size of [1,2,3,4,5,6]) {
                const headings = rowWrapper.querySelectorAll(`h${size}`);
                if (headings.length) {
                    for (const [index, heading] of headings.entries()) {
                        const internalMenuLi = document.createElement('li');
                        internalMenuLi.innerHTML = heading.textContent.trim();
                        internalMenuLi.addEventListener("click", () => scrollToElement(heading));
                        internalMenuUl.appendChild(internalMenuLi);
                        heading.dataset.index = index;
                        observer.observe(heading);
                    }
    
                    break;
                }
            }
        }
    }

    for (const oldMeter of document.querySelectorAll('meter')) {
        const meter = createMeter(Number(oldMeter.getAttribute('value')));
        oldMeter.parentNode.insertBefore(meter, oldMeter);
        oldMeter.parentNode.removeChild(oldMeter, true);
    }
}


function scrollToElement(elm) {
    const top = elm?.getBoundingClientRect().top + document.body.scrollTop - 150;
    document.querySelector('.dci-main-content')?.scrollTo({top, behavior: "smooth"});
}

function toggleSideBar() {
    const sideBar = document.querySelector('.dci-sidebar');
    sideBar?.classList.toggle('closed');
    window.localStorage.setItem("sidebar_closed", sideBar.classList.contains('closed'));
}

function createMeter(progress) {
    const radius = 10;
    const stroke = 4;
    const startAngle = 40;
    const endAngle = 320;
    const normalizedRadius = radius - stroke / 2;
    const circumference = ((endAngle - startAngle) * Math.PI / 180) * normalizedRadius;
    const strokeDashoffset = (circumference / 100 * progress);
  
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
      const angleInRadians = (angleInDegrees-90) * Math.PI / 180;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }
    
    const end = polarToCartesian(radius, radius, -normalizedRadius, startAngle);
    const start = polarToCartesian(radius, radius, -normalizedRadius, endAngle);
    const d = [
      "M", start.x, start.y, 
      "A", normalizedRadius, normalizedRadius, 0, 1, 0, end.x, end.y
    ].join(" ");
  
    const wrapper = document.createElement('div');
    wrapper.className = "dci-meter";
    wrapper.innerHTML = (
        `<svg
        class="circular-meter"
        height="${start.y + stroke/2}"
        width="${radius * 2}"
        viewBox="${'0 0 ' + radius * 2 + ' ' + (start.y + stroke/2)}"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="${d}"
          fill="transparent"
          stroke-width="${stroke}"
          stroke-linecap="round"
          class="bar"
        />
          <path
            d="${d}"
            fill="transparent"
            stroke-width="${stroke}"
            stroke-dasharray="${strokeDashoffset + ' ' + circumference}"
            style="stroke-dashoffset: ${strokeDashoffset - circumference};"
            stroke-linecap="round"
            class="progress"
          />
      </svg>
      <span class="percent">${progress}%</span>
      `
    );

    return wrapper;
}

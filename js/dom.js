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
        const cover = ilContentContainer.querySelector('#il_center_col figure:first-of-type');
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

        if (internalMenuUl.childNodes.length) {
            sideBar.appendChild(internalMenu);
        }
    }

    const pageTitle = document.querySelector('.dci-course-title');
    if (pageTitle) {
        const randomProgress = Math.round(Math.random() * 50 + 10);
        const meter = createMeter(randomProgress);
        const meterWrapper = document.createElement('div');
        meterWrapper.className = 'dci-meter';
        meterWrapper.appendChild(meter);
        meterWrapper.appendChild(document.createTextNode(randomProgress + "%"));
        pageTitle.appendChild(meterWrapper);
    }

    /** fake */
    const randomCompleted = Math.round(Math.random() * 18 + 2);
    document.querySelectorAll('.dci-card-preview .dci-card-progress').forEach((card, index) => index <= randomCompleted ? card.classList.add('completed') : false);
}


function scrollToElement(elm) {
    const top = elm?.getBoundingClientRect().top + document.body.scrollTop - 150;
    document.body.scrollTo({top, behavior: "smooth"});
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
      </svg>`
    );

    return wrapper;
}

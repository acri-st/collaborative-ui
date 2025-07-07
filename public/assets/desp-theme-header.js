let despHeaderElement = null;
let despHeaderMenuOpen = false;
let despHeaderLastScrollY = 0;
let despHeaderScrollCallback = null;

function toggleDespHeaderMenu(){
    despHeaderMenuOpen = !despHeaderMenuOpen;
    renderDespHeaderMenuButton();
}
function renderDespHeaderMenuButton(){
    let button = document.querySelector('#desp-theme-header-menu-button');
    if(button){
        if(despHeaderMenuOpen){
            document.querySelector('#desp-theme-header-menu')?.classList.add('open');
            button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        }
        else{
            document.querySelector('#desp-theme-header-menu')?.classList.remove('open');
            button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
        }
    }
}
    
function loadDespHeader(){
    console.log('[DESP_THEME] Loading DESP Theme Header');
    let headerParent = despTheme.headerParent === 'body' 
        ? document.body
        : despTheme.headerParent === 'html'
        ? document
        : document.querySelector(despTheme.headerParent)?.[0];

    
    if(!headerParent){
        console.error("Header parent not found");
        return;
    }
    despHeaderParent = headerParent;

    if(despHeaderElement){
        headerParent.removeChild(despHeaderElement);
    }

    despHeaderElement = document.createElement('div');
    despHeaderElement.id = 'desp-theme-header';
    despHeaderElement.classList.add('visible');


    despHeaderElement.innerHTML = `
        <div id="desp-theme-header-wrapper">
            <div id="desp-theme-header-container">
                <a id="desp-theme-header-logo" href="https://platform.destine.eu/" target="_blank">
                    <img src="${despTheme.url}/assets/eu.png" alt="EU logo">
                    <label>Destination earth</label>
                </a>
                <div id="desp-theme-header-links">
                    ${
                        despTheme.headers.map(header => 
                            // If link
                            `
                                <div class="desp-theme-header-link-container">
                                    <div class="desp-theme-header-link">
                                        <a 
                                            ${header.link ? `href="${header.link}"` : ''}
                                            ${header.target ? `target="${header.target}"` : ''}
                                            ${header.link && formatPath(window.location.pathname) === formatPath(header.link) ? 'class="active desp-theme-menu-route"' : 'class="desp-theme-menu-route"' }
                                        >
                                            ${header.label}
                                        </a>
                                    </div>
                                    ${header.subheaders && header.subheaders.length > 0 ? `
                                        <div class="desp-theme-header-link-sublinks desp-theme-header-submenu">
                                            ${header.subheaders.map(subheader => 
                                                `<a 
                                                    ${subheader.link ? `href="${subheader.link}"` : ''}
                                                    ${subheader.target ? `target="${subheader.target}"` : ''}
                                                    ${
                                                        subheader.link 
                                                        && formatPath(window.location.pathname) === formatPath(subheader.link) 
                                                        ? 'class="active desp-theme-menu-route"' 
                                                        : 'class="desp-theme-menu-route"'
                                                    }
                                                >
                                                    ${subheader.label}
                                                </a>
                                            `
                                                ).join('')
                                            }
                                            </div>
                                        `
                                        : ''
                                    }
                                </div>
                            `
                        ).join('')
                    }
                </div>
                <div id="desp-theme-header-right">
                    <div id="desp-theme-header-authentication">
                        ${
                            despTheme.loggedIn ?
                                despTheme.logout?.function ? `
                                    <div class="desp-theme-button themed">
                                        <svg 
                                            stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" 
                                            height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <label>${despTheme.loggedIn.username || 'hello'}</label>
                                    </div>
                                    <div class="desp-theme-header-submenu">
                                        <div class="desp-theme-menu-route" onclick="${despTheme.logout.function}">
                                            <label>Logout</label>
                                        </div>
                                    </div>
                                ` : ''
                            :
                                despTheme.login?.function ? `
                                    <div class="desp-theme-button themed" onclick="${despTheme.login.function}">
                                        <label>Sign in</label>
                                    </div>
                                ` : ''
                        }
                    </div>
                    
                    ${
                        despTheme.headers && despTheme.headers.length > 0 ? `
                            <div id="desp-theme-header-menu-button" onclick="toggleDespHeaderMenu()">
                                <svg 
                                    stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" 
                                    height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 12h18M3 6h18M3 18h18"></path>
                                </svg>
                            </div>
                            <div id="desp-theme-header-menu">
                                ${
                                    despTheme.headers.map(header => 
                                        header.subheaders
                                        ?
                                            header.subheaders.map((subheader)=>`
                                                <div class="desp-theme-header-menu-link">
                                                    <a 
                                                        ${subheader.link ? `href="${subheader.link}"` : ''}
                                                        ${subheader.target ? `target="${subheader.target}"` : ''}
                                                        ${subheader.link && formatPath(window.location.pathname) === formatPath(subheader.link) ? 'class="active desp-theme-menu-route"' : 'class="desp-theme-menu-route"' }
                                                    >
                                                        ${subheader.label}
                                                    </a>
                                                </div>
                                            `).join('')
                                        : `
                                            <div class="desp-theme-header-menu-link">
                                                <a 
                                                    ${header.link ? `href="${header.link}"` : ''}
                                                    ${header.target ? `target="${header.target}"` : ''}
                                                    ${header.link && formatPath(window.location.pathname) === formatPath(header.link) ? 'class="active desp-theme-menu-route"' : 'class="desp-theme-menu-route"' }
                                                >
                                                    ${header.label}
                                                </a>
                                            </div>
                                        `
                                    ).join('')
                                }
                            </div>
                        ` : ''
                    }
                </div>
            </div>
        </div>
    `;
    headerParent.insertBefore(despHeaderElement, headerParent.firstChild);

    if(despHeaderScrollCallback){
        despHeaderParent.removeEventListener("scroll", despHeaderScrollCallback);
    }

    despHeaderScrollCallback = ()=>{
        if(
            despHeaderParent.scrollTop < despHeaderLastScrollY
            || despHeaderParent.scrollTop < 50
        ){
            despHeaderElement.classList.add('visible');
            // console.log('up');
        }
        else{
            despHeaderElement.classList.remove('visible');
                    
            despHeaderMenuOpen = false;
            renderDespHeaderMenuButton();
            // console.log('down');
        }
        despHeaderLastScrollY = despHeaderParent.scrollTop || 0;
    }

    despHeaderParent.addEventListener("scroll", despHeaderScrollCallback);
    renderDespHeaderMenuButton();
}





let despFooterElement = null;
let despFooterMenuOpen = false;
let despFooterLastScrollY = 0;
let despFooterScrollCallback = null;

function toggleDespFooterMenu(){
    despFooterMenuOpen = !despFooterMenuOpen;
    renderDespFooterMenuButton();
}
function renderDespFooterMenuButton(){
    let button = document.querySelector('#desp-theme-footer-menu-button');
    if(despFooterMenuOpen){
        document.querySelector('#desp-theme-footer-menu')?.classList.add('open');
        button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    }
    else{
        document.querySelector('#desp-theme-footer-menu')?.classList.remove('open');
        button.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
    }
}

const logos = [
    { logo: `${despTheme.url}/assets/destination-earth.png`, link: 'https://destination-earth.eu/'},
    { logo: `${despTheme.url}/assets/funded-by-eu.png`, link: 'https://european-union.europa.eu/'},
    { logo: `${despTheme.url}/assets/implemented-by.png` },
    { logo: `${despTheme.url}/assets/ecmwf.png`, link: 'https://www.ecmwf.int/' },
    { logo: `${despTheme.url}/assets/esa.png`, link: 'https://www.esa.int/' },
    { logo: `${despTheme.url}/assets/eumetsat.png`, link: 'https://www.eumetsat.int/' },
]

const menuLinks = [
    { label: 'Code of conduct', link: 'https://platform.destine.eu/code-of-conduct/' },
    { label: 'Terms & Conditions', link: 'https://platform.destine.eu/terms-and-conditions/' },
    { label: 'Privacy Policies', link: 'https://platform.destine.eu/privacy-policies/' },
    { label: 'Cookie Policy', link: 'https://platform.destine.eu/cookie-policy/' },
    { label: 'Legal Notice', link: 'https://platform.destine.eu/legal-notice/' },
]

function loadDespFooter(){
    console.log('[DESP_THEME] Loading DESP Theme Footer');
    let footerParent = despTheme.footerParent === 'body' 
        ? document.body
        : despTheme.footerParent === 'html'
        ? document
        : document.querySelector(despTheme.footerParent)?.[0];
    
    if(!footerParent){
        console.error("Footer parent not found");
        return;
    }

    if(despFooterElement){
        footerParent.removeChild(despFooterElement);
    }

    despFooterElement = document.createElement('div');
    despFooterElement.id = 'desp-theme-footer';
    despFooterElement.classList.add('visible');

    despFooterElement.innerHTML = `
        <div id="desp-theme-footer-container">

            <div id="desp-theme-footer-logo">
                <img src="${despTheme.url}/assets/desp-logo.svg" alt="Destination Earth">
            </div>

            <div id="desp-theme-footer-logos">
                ${logos.map(logo =>
                    logo.link ?
                        `<a href="${logo.link}" target="_blank">
                            <img src="${logo.logo}" alt="${logo.alt}">
                        </a>`
                    :
                        `<img src="${logo.logo}" alt="${logo.alt}">`
                ).join('')}
            </div>

            <div id="desp-theme-footer-menu-section">
                <div id="desp-theme-footer-menu-button" onclick="toggleDespFooterMenu()">
                </div>
                
                <div id="desp-theme-footer-menu">
                    ${menuLinks.map(link => 
                        `<a href="${link.link}" class="desp-theme-footer-menu-link" target="_blank">
                            ${link.label}
                        </a>`
                    ).join('')}
                    <div id="desp-theme-footer-menu-partner-links">
                        ${logos.map(logo =>
                            logo.link 
                            ?
                                `<a href="${logo.link}"  class="desp-theme-footer-menu-partner-link" target="_blank">
                                    <img src="${logo.logo}" alt="${logo.alt}">
                                </a>` 
                            :
                                `<div class="desp-theme-footer-menu-partner-link">
                                    <img src="${logo.logo}" alt="${logo.alt}">
                                </div>` 
                        ).join('')
                    }
                    </div>
                </div>
            </div>

        </div>
    `;

    footerParent.append(despFooterElement);

    
    if(despFooterScrollCallback){
        footerParent.removeEventListener("scroll", despFooterScrollCallback);
    }

    despFooterScrollCallback = ()=>{
        if(
            footerParent.scrollTop < despFooterLastScrollY
            && footerParent.scrollTop + 100 < (footerParent.scrollHeight - footerParent.offsetHeight)
        ){
            despFooterElement.classList.remove('visible');
            despFooterMenuOpen = false;
            renderDespFooterMenuButton();
            // console.log('up');
        }
        else{
            despFooterElement.classList.add('visible');
            // console.log('down');
        }
        despFooterLastScrollY = footerParent.scrollTop || 0;
    }

    footerParent.addEventListener("scroll", despFooterScrollCallback);

    renderDespFooterMenuButton();
}


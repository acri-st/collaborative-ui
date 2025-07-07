let despTheme = {
    // url: 'http://localhost:8100',
    // url: 'https://collaborative.desp-aas-preprod.acri-st.fr',
    url: 'https://collaborative.desp-aas.acri-st.fr',
    footerParent: 'body',
    headerParent: 'body',
    headers: [
        { label: 'Home', link: '/' },
        { label: 'header 2', link: '/test' },
        { label: 'subheaders', subheaders: [
            { label: 'subheaders 1', link: '', target: '_blank' },
            { label: 'subheaders 2', link: '' },
            { label: 'subheaders 3', link: '' },
        ] }
    ],
    logout: {
        function: "disconnect()"
    },
    login: {
        function: "connect()"
    },
    loggedIn: undefined
}

function despThemeLogin(username){
    console.log('[DESP_THEME] Loggin in', username);
    despTheme.loggedIn = {
        username: username
    }
    loadDespHeader();
}

function formatPath(path){
    return path.replace(/\/$/, '');
}

// Load theme
function loadDespTheme(){
    console.log('[DESP_THEME] Loading components');
    loadDespFooter();
    loadDespHeader();
}
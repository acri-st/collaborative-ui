// @ts-nocheck
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'


import App from './App';
import store from './redux';
// import { AuthProvider } from './utils/auth';

// Call the connectivity to add interceptors to the request
import { axiosSetup, AuthProvider, overrideLogerConfig, components } from '@desp-aas/desp-ui-fwk';
import Footer from './components/Footer/Footer';
axiosSetup()

overrideLogerConfig({
    global: { logLevel: 'debug' },
    api: { logLevel: 'debug' },
    service: { logLevel: 'debug' },
    component: { logLevel: 'debug' },
    ui: { logLevel: 'debug' },
})

// This line is useless but ensure Organization of the import won't remove important dependencies
type _react = typeof React

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Provider store={store}>
        <AuthProvider>
            <App />
        </AuthProvider>
    </Provider>
)

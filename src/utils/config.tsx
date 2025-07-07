// import logo from '../../public/assets/logo.png';
export const MOBILE_MODE = import.meta.env.VITE_MOBILE && import.meta.env.VITE_MOBILE === 'true';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION;
export const API_URL = MOBILE_MODE ? process.env.VITE_API_URL || '' : '';

export const appEmail = "srv_dsy@acri-st.fr";
export const appAdress = <>260 Route du Pin Montard<br/>06410 Biot<br/>France</>;
export const appPhone = "+33 (0)4 92 967 500";

// const pos = logo.indexOf('/assets')
// export const STATIC_ROOT = pos > -1 ? logo.substring(0, pos) : '';
// console.log('STATIC_ROOT %s', STATIC_ROOT)

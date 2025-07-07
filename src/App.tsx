import React, { useEffect, useState } from 'react';

import "@fontsource/roboto";
import '@fortawesome/fontawesome-free/css/all.css';
import './theme/app.css';
import '@desp-aas/desp-ui-fwk';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';

import FormPage from './pages/FormPage/FormPage';
import UserPage from './pages/UserPage/UserPage';
import { ReduxState } from './redux';
import { useDispatch, useSelector } from 'react-redux';
import { appInit, LoadingPage, NavigationMobileMenu, useUser } from "@desp-aas/desp-ui-fwk";
import ProfilePage from './pages/ProfilePage/ProfilePage';
import { CatalogPage } from './pages/CatalogPage/CatalogPage';
import AssetPage from './pages/AssetPage/AssetPage';
import NewGroupPage from './pages/NewGroupPage/NewGroupPage';
import { ToastContainer } from 'react-toastify';
import { routes } from './utils/routes';
import { PostsPage } from './pages/PostsPage/PostsPage';


export default function App() {

    const dispatch = useDispatch()

    const [initialized, setInitialized] = useState(false);
    const {authChecked} = useSelector((state: ReduxState)=> state.auth );

    appInit(dispatch);

    const user = useUser();

    useEffect(() => {
        if(authChecked){
            setInitialized(true);
        }
    }, [authChecked])

    return (
        <div
            id="app"
        >
            <ToastContainer
                position='bottom-right'
            />
            {
                !initialized 
                ?
                    <LoadingPage 
                        title={<>Collaborative service</>}
                    />
                    :
                    <BrowserRouter>
                        <NavigationMobileMenu
                            routes={routes}
                        />
                        <Routes>
                            <Route path="" element={<Home />} />

                            {/* <Route path="/form/:product_type" element={<FormPageOld />} /> */}
                            <Route path="/form/:asset_type" element={<FormPage />} />
                            <Route path="/catalog/:asset_type" element={<CatalogPage />} />
                            <Route path="/profile/:user_id" element={<ProfilePage />} />

                            <Route path="/asset/:asset_id" element={<AssetPage />} />
                            <Route path="/course/:asset_id" element={<AssetPage />} />
                            <Route path="/new-group" element={<NewGroupPage />} />

                            {/* <Route path="/groups" element={<GroupsPage />} />
                            <Route path="/group/:group_id/*?" element={<GroupPage />} /> */}

                            <Route path="/posts" element={<PostsPage />} />

                            <Route path="*" element={<Navigate to=""/>} />
                            {
                                user &&
                                <>
                                    <Route path="/user/*" element={<UserPage />} />
                                </>
                            }
                        </Routes>
                    </BrowserRouter>
            }
        </div>
    )
}

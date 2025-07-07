import { configureStore } from '@reduxjs/toolkit';
import { FWKReduxState, reducers } from '@desp-aas/desp-ui-fwk';
import generalReducer from './generalReducer';
import catalogReducer from './catalogReducer';
import postsReducer from './postsReducer';
import groupsReducer from './groupsReducer';

export const store = configureStore({
    reducer: {
        ...reducers,
        general: generalReducer,
        catalog: catalogReducer,
        posts: postsReducer,
        groups: groupsReducer,
    },
});

export type ReduxState = ReturnType<typeof store['getState']> & FWKReduxState

export default store;
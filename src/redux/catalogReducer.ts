import { createSlice } from '@reduxjs/toolkit';
import { defaultFilters, defaultPagination, ICatalogPagination } from '../utils/catalog';
import { ASSET_TYPE, ICatalogFilters } from '@desp-aas/desp-ui-fwk';

export type CatalogState = {
    catalogFilters: {
        [type: string]: ICatalogFilters
    }
    catalogPagination: {
        [type: string]: ICatalogPagination
    }
    catalogSubscriptions: {
        [type: string]: string|undefined
    }
} 
const initialState: CatalogState = {
    catalogFilters: {
        [ASSET_TYPE.dataset]: defaultFilters(),
        [ASSET_TYPE.model]: defaultFilters(),
        [ASSET_TYPE.application]: defaultFilters(),
        [ASSET_TYPE.paper]: defaultFilters(),
        [ASSET_TYPE.course]: defaultFilters(),
    },
    catalogPagination: {
        [ASSET_TYPE.dataset]: defaultPagination(),
        [ASSET_TYPE.model]: defaultPagination(),
        [ASSET_TYPE.application]: defaultPagination(),
        [ASSET_TYPE.paper]: defaultPagination(),
        [ASSET_TYPE.course]: defaultPagination(),
    },
    catalogSubscriptions: {
        [ASSET_TYPE.dataset]: undefined,
        [ASSET_TYPE.model]: undefined,
        [ASSET_TYPE.application]: undefined,
        [ASSET_TYPE.paper]: undefined,
        [ASSET_TYPE.course]: undefined,
    }
}
export const catalogSlice = createSlice({
    name: 'catalog',
    initialState,
    reducers: {
        setCatalog: (state, action: { payload: Partial<CatalogState> }) => {
            Object.assign(state, action.payload)
        }
    },
});

export const { setCatalog } = catalogSlice.actions;

export default catalogSlice.reducer;
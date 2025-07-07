import { IGroupFilters } from '@desp-aas/desp-ui-fwk';
import { createSlice } from '@reduxjs/toolkit';

export type IGroupsState = {
    filters: IGroupFilters
} 
const initialState: IGroupsState = {
    filters: { search: '', categories: [] }
}

export const groupsSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        setReduxGroups: (state, action: { payload: Partial<IGroupsState> }) => {
            Object.assign(state, action.payload)
        }
    },
});

export const { setReduxGroups } = groupsSlice.actions;

export default groupsSlice.reducer;
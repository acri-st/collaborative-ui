import { createSlice } from '@reduxjs/toolkit';

export type GeneralState = {
} 
const initialState: GeneralState = {
}

export const authSlice = createSlice({
    name: 'general',
    initialState,
    reducers: {
        setGeneral: (state, action: { payload: Partial<GeneralState> }) => {
            Object.assign(state, action.payload)
        }
    },
});

export const { setGeneral } = authSlice.actions;

export default authSlice.reducer;
import { defaultFilters, IPostFilters } from '@desp-aas/desp-ui-fwk/src/utils';
import { createSlice } from '@reduxjs/toolkit';

export type PostsState = {
    filters: IPostFilters
} 
const initialState: PostsState = {
    filters: defaultFilters(),
}

export const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setPost: (state, action: { payload: Partial<PostsState> }) => {
            Object.assign(state, action.payload)
        }
    },
});

export const { setPost } = postsSlice.actions;

export default postsSlice.reducer;
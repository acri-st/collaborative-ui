import { useCallback, useEffect, useRef, useState } from 'react'
import './PostsList.css'
import { PostItem } from './PostItem'
import { IPost } from '@desp-aas/desp-ui-fwk'

type IProps = {
    posts?: IPost[]
    loadingPosts?: boolean
    next?: ()=>any
    refreshToken: string
    updatePosts: (reload: boolean, _offset?: number)=>any
}

export const PostsList = (props: IProps) =>{
    return (
        <div className="posts-list">
            {
                props.posts && props.posts.length > 0
                ?
                    props.posts.map((p, idx)=>(
                        <PostItem post={p} key={p.id} refreshToken={props.refreshToken} updatePosts={props.updatePosts} />
                    ))
                :
                    <div className="no-data">
                        No posts currently
                    </div>
            }
        </div>
    )
}


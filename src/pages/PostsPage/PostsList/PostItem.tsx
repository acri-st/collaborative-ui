import {
    IPost, formatPostTime, IPostReply, confirm, getPost, handleRequestError, deletePost, 
    getPostReplies, createPostReply, useUser, UserAvatar, FWKIcons, LoginRequired, IUser, InputCharLimit, 
    LoadingUserLink
} from "@desp-aas/desp-ui-fwk"
import classNames from "classnames"
import { useState, useCallback, useEffect, useRef } from "react"
import { HiReply } from "react-icons/hi"
import { NavLink } from "react-router-dom"
import { userProfileLink } from "../../../utils/users"
import { PostItemReply } from "./PostItemReply"
import "./PostItem.css"

const replyLength = 20;

type IPostProps = {
    post: IPost
    refreshToken: string
    updatePosts: (reload: boolean, _offset?: number)=>any
}
export const PostItem = (props: IPostProps) =>{
    const [ timeSince, setTimeSince ] = useState(formatPostTime(props.post.created_at));
    const [ repliesOpen, setRepliesOpen ] = useState(false)
    const [ replying, setReplying ] = useState(false)
    const [ reply, setReply ] = useState('')
    const [ deleting, setDeleting ] = useState(false)
    const [ post, setPost ] = useState<IPost>(props.post);

    const [responses, setResponses ] = useState<IPostReply[]|undefined>();
    const [loop, setLoop] = useState<NodeJS.Timeout|undefined>()

    // useEffect(()=>{
    //     setResponses([...props.post.posts].reverse())
    // }, [ props.post.posts ])

    const fetchPost = useCallback(()=>{
        getPost(props.post.id)
        .then((res)=>{
            setPost(res) 
        })
        .catch(handleRequestError)
    }, [ props.post ]);

    const handleDeletePost = useCallback(()=>{
        confirm({
            title: "Delete post",
            message: "Are you sure you want to delete this post?",
            onConfirm: ()=>{
                setDeleting(true)
                deletePost(props.post.id)
                .then((res)=>{
                    props.updatePosts(false)
                })
                .catch(handleRequestError)
                .finally(()=>{
                    setDeleting(false)
                })
            }
        })

    }, [ props.post ]);

    const fetchReplies = useCallback(()=>{
        getPostReplies(props.post)
        .then((res)=>{
            res.shift();
            setResponses(res.reverse()) 
        })
        .catch(handleRequestError)
    }, []);

    const clearLoop = () => {
        if(loop)
            clearInterval(loop);
        setLoop(undefined)
    }

    useEffect(()=>{
        if(repliesOpen)
            fetchReplies()
    }, [ repliesOpen ])

    useEffect(()=>{
        if(repliesOpen){
            if(!loop){
                let loop = setInterval(()=>fetchReplies(), 5000);
                setLoop(loop);
            }
        }
        else{
            clearLoop()
        }
        return ()=> clearLoop()
    }, [repliesOpen, props.post])


    useEffect(()=>{
        console.log("refreshing")
        setTimeSince(formatPostTime(props.post.created_at))
    }, [ props.refreshToken, props.post ])

    const handleLike = useCallback(()=>{

    }, [ props.post ])

    const handleReply = useCallback(()=>{
        setReplying(true)
        createPostReply(props.post, { text: reply })
        .then((res)=>{
            // toast(<>Replied to {props.post.title}</>, { type: 'success' })
            setReply('')
            fetchReplies();
            fetchPost();
        })
        .catch(handleRequestError)
        .finally(()=>{
            setReplying(false)
        })
    }, [ props.post, reply ])

    const toggleReplies = useCallback(()=>[
        setRepliesOpen(!repliesOpen)
    ], [ repliesOpen ]);



    const repliesRef = useRef<any>(null);
    const repliesInputRef = useRef<any>(null);

    const currentUser = useUser();

    return (
        <div className="post-item">
            <div className="post-item-post">
                <div className="post-item-top">
                    <div className="post-item-user">
                        <NavLink to={userProfileLink(post.despUserId)}>
                            <UserAvatar user={{ username: post.despUserId, id: '', displayName: post.despUserId }}/>
                        </NavLink>
                        <div className="post-item-user-info">
                            <NavLink className="post-item-username" to={userProfileLink(post.despUserId)}>
                                { post.despUserId }
                            </NavLink>
                            <div className="post-item-time">
                                { timeSince }
                            </div>
                        </div>
                    </div>

                    <div className="post-item-category">
                        { post.categoryName }
                    </div>

                </div>
                <div className="post-item-title">{post.title}</div>
                <div className="post-item-message">
                    { post.message }
                </div>

                <div className="post-item-operations">
                    <div className="post-item-operations-left">
                        {/* <div 
                            className={classNames({ "post-item-like": true, "liked": post.liked })}
                            onClick={handleLike}
                        >
                            {
                                post.liked
                                ? icons.assets.isLiked
                                : icons.assets.isNotLiked
                            }
                            {
                                post.likes || 0
                            }
                        </div> */}
                        {
                            post.reply_count &&
                            post.reply_count !== 0 ?
                            <div 
                                className="post-item-stat clickable"
                                onClick={toggleReplies}
                            >
                                {post.reply_count} {post.reply_count > 1 ? "replies" : "reply"}
                            </div>
                            : null
                        }
                    </div>
                    <div className="post-item-operations-right">
                        <div 
                            className="post-item-reply"
                            onClick={()=>{toggleReplies(); repliesInputRef.current?.focus()}}
                        >
                            <HiReply/> reply
                        </div>
                        {
                            currentUser?.username === post.despUserId &&
                            <div 
                                className={classNames({ "button small red operation post-item-delete": true, "disabled": deleting })} 
                                onClick={handleDeletePost}
                            >
                                { FWKIcons.delete }
                                { deleting ? "Deleting..." : "Delete" }
                            </div>
                        }
                    </div>
                </div>
            </div>

            <div 
                className={classNames({ "post-item-replies-container": true, "open": repliesOpen})}
                ref={repliesRef}
                style={{
                    maxHeight: repliesOpen ? 600 : 0
                }}
            >
                <div className="post-item-replies">
                    
                    <div className="post-item-replies-title">
                        Replies
                    </div>
                    <div className="post-item-replies-list">
                        {
                            responses?.map((r, idx)=>(
                                <PostItemReply reply={r} key={idx} />
                            ))
                        }
                    </div>
                    <div className="post-item-replies-reply">
                        <LoginRequired small message="You must sign in to reply to posts">
                            <div className="post-item-replies-reply-container">
                                <UserAvatar user={currentUser as IUser}/>
                                <textarea
                                    ref={repliesInputRef} value={reply} onChange={(ev)=> setReply(ev.target.value) } placeholder='Reply to this post'
                                    onKeyDown={(ev)=>{
                                        if(
                                            ev.ctrlKey &&
                                            ev.key === 'Enter' &&
                                            reply.length >= replyLength
                                        ){
                                            handleReply()
                                        }
                                    }}
                                />
                                <InputCharLimit value={reply} charLimit={{ min: replyLength }}/>
                            </div>
                            <div 
                                className={classNames({ "button small themed": true, "disabled": reply.length < replyLength || replying })}
                                onClick={handleReply}
                            >
                                <HiReply/>
                                {
                                    replying
                                    ? "Replying..."
                                    : "Reply"
                                }
                                
                            </div>
                        </LoginRequired>
                    </div>
                </div>
            </div>
        </div>
    )
}


export const PostItemLoading = () =>{
        return (
        <div className="post-item-loading loading loading-div-1">
            <div className="post-item-post-loading">
                <div className="post-item-top-loading">
                    <div className="post-item-user-loading">
                        <LoadingUserLink imageOnly/>
                        <div className="post-item-user-info-loading">
                            <div className="post-item-username-loading loading-item-2"/>
                            <div className="post-item-time-loading loading-item-2"/>
                        </div>
                    </div>

                    <div className="post-item-category-loading loading-item-2"/>

                </div>
                <div className="post-item-title-loading loading-item-2"/>
                <div className="post-item-message-loading loading-item-2"/>
            </div>
        </div>
    )
}
import { FWKIcons, IDiscussionPost, UserAvatar, formatPostReplyTime, useUser, confirm } from "@desp-aas/desp-ui-fwk"
import { NavLink } from "react-router-dom"
import { userProfileLink } from "../../../utils/users"
import './PostItemReply.css'
import parse from 'html-react-parser';
import { useCallback, useState } from "react";

type IPostItemReplyProps = {
    reply: IDiscussionPost
}

export const PostItemReply = (props: IPostItemReplyProps) => {
    const currentUser = useUser();
    const [deleting, setDeleting] = useState(false);

    
    // const handleDeletePost = useCallback(()=>{
    //     confirm({
    //         title: "Delete post",
    //         message: "Are you sure you want to delete this post?",
    //         onConfirm: ()=>{
    //             setDeleting(true)
    //             deletePost(props.post.id)
    //             .then((res)=>{
    //                 props.updatePosts(false)
    //             })
    //             .catch(handleRequestError)
    //             .finally(()=>{
    //                 setDeleting(false)
    //             })
    //         }
    //     })

    // }, [ props.reply ]);
    return (
    <div className="post-reply-item">
                                    
        <NavLink to={userProfileLink(props.reply.username)}>
            <UserAvatar user={{ username: props.reply.username, id: '', displayName: props.reply.username }}/>
        </NavLink>
        <div className="post-reply-item-content">
            <div className="post-reply-item-user" >
                <div className="post-reply-item-user-info">
                    <div className="post-reply-item-user-info-left">
                        <NavLink className="post-reply-item-username" to={userProfileLink(props.reply.username)}>
                            { props.reply.username }
                        </NavLink>
                        <div className="post-reply-item-time">
                            { formatPostReplyTime(props.reply.created_at) }
                        </div>
                    </div>
                    {
                        // currentUser?.username === props.reply.username &&
                        // <div className="post-reply-item-user-info-right">
                        //     <div 
                        //         className="button operation red small icon-only"
                        //         onClick={()=>{
                        //             // deletePostReply(props.reply.id)
                        //         }}
                        //     >
                        //         { FWKIcons.delete }
                        //     </div>
                        // </div>
                    }
                </div>
            </div>
            <div className="post-reply-item-message">
                { parse(props.reply.cooked || '') }
            </div>
        </div>

    </div>
    )
}
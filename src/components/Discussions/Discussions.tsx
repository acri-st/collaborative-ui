import React, { useEffect, useState } from 'react';
import './Discussions.css';
import { FormField, IFormFieldsConfig, Loading, Logger, LoginRequired, Message, UserLinkLoading, formReady, handleErrorWithMessage, useMessage, useUser, UserLink, IDiscussionPost, IDiscussionTopic, createDiscussionPost, getDiscussionTopic } from '@desp-aas/desp-ui-fwk';

import _ from 'lodash';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FaCircle } from 'react-icons/fa6';
import { icons } from '../../utils/icons';
import classNames from 'classnames';
dayjs.extend(relativeTime)

const logger = new Logger("AssetPage", "Topic");

const postMessageMinMax = {
    min: 20,
    // max: 50
}

type INewPostForm = {
    message: string
}
const defaultNewPostForm = { message: '' }

let chatInterval: NodeJS.Timeout;

type IDiscussionProps = {
    topicId: number
    topicDescription?: boolean
    chatView?: boolean
    hideNewPost?: boolean
    loopFetch?: boolean
}
export function Discussion(props: IDiscussionProps) {

    const user = useUser();

    const [loadingTopic, setLoadingTopic] = useState(false);
    const [creatingPost, setCreatingPost] = useState(false);
    const [topic, setTopic] = useState<IDiscussionTopic|undefined>(undefined);
    const [newPostForm, setNewPostForm] = useState<INewPostForm>(_.cloneDeep(defaultNewPostForm));

    const [postMessage, setPostMessage] = useMessage();
    const updatePostFormField = (field: string) => (update: any) => { setNewPostForm({ ...newPostForm, [field]: update }); }

    useEffect(() => {
        setPostMessage(undefined)
    }, [newPostForm])

    const newPostFormFields: IFormFieldsConfig = {
        'message': { field: 'message', required: true, charLimit: postMessageMinMax },
    }

    useEffect(()=>{
        if(props.loopFetch){
            chatInterval = setInterval(()=>fetchTopic(true), 5 * 1000)
            return ()=>{
                clearInterval(chatInterval)
            }
        }
    })


    const [createPostReady, setCreatePostReady] = useState(false);

    useEffect(() => {
        setCreatePostReady(formReady(Object.values(newPostFormFields), newPostForm) && !creatingPost)
    }, [newPostForm, creatingPost])


    const fetchTopic = async (withoutLoading?: boolean) => {
        logger.info("Fetching topic")
        if(!withoutLoading) setLoadingTopic(true);
        try {
            let response = (await getDiscussionTopic(props.topicId));
            if(response.posts && response.posts[0] && response.posts[0].cooked?.startsWith('<p>(Replace this ')){
                response.posts.splice(0,1)
            }
            if(props.chatView) response.posts = response.posts.reverse();
            setTopic(response)
        }
        catch (e) {
            logger.error("Error while fetching topic", e)
        }
        finally {
            if(!withoutLoading) setLoadingTopic(false);
        }
    }
    const sendPost = async () => {
        logger.debug("called send post")
        if (topic && user && createPostReady) {

            logger.debug("starting send post")
            setCreatingPost(true);
            try {
                logger.debug("creating post")

                // await sleep(300);

                let newPost = await createDiscussionPost(props.topicId, { text: newPostForm.message })
                logger.debug("setting topic with new post")

                // let update: IDiscussionTopic = {...topic};
                // let newPosts =  [...update.posts]

                // // update.push({ topic_id: 0, name:'', display_username: user.username, message, username: user.username, created_at: dayjs().toISOString() })
                // if(props.chatView)
                //     newPosts.unshift(newPost)
                // else
                //     newPosts.push(newPost)

                // update.posts = newPosts;
                // setTopic(update);

                updatePostFormField('message')('');

                await fetchTopic(true);
            }
            catch (e) {
                logger.error("Error occured during post creation", e);
                handleErrorWithMessage(e as any, setPostMessage)
            }
            finally {
                setCreatingPost(false);
            }
        }
        else {
            logger.warn("send post not ready")
        }
    }

    useEffect(() => {
        fetchTopic()
    }, [props.topicId])


    return (
        <div id="discussion-topic" className={classNames({ "discussion-chat-view": props.chatView })}>
            {
                props.topicDescription &&
                <div id="discussion-topic-description">
                    <div id="discussion-topic-title">{topic?.title}</div>
                    <div id="discussion-topic-information">
                        <div id="discussion-topic-creation-date">
                            {topic && dayjs(topic.created_at).format('YYYY/MM/DD HH:mm')}
                        </div>
                        <div id="discussion-topic-creation-date-separation"><FaCircle /></div>
                        <div id="discussion-topic-creation-date-since">
                            {topic && dayjs(topic.created_at).fromNow()}
                        </div>
                        {/* <div className="discussion-user">
                                            <UserLink
                                                username={selectedTopic..username}
                                            />
                                        </div> */}
                    </div>
                </div>
            }
            <div
                id="discussion-topic-posts" 
                className={classNames({ 'simple-scrollbar': true, "chat-view": props.chatView })}
            >
                {
                    loadingTopic 
                    // || true
                    ?
                        <>
                            <LoadingPost isSender/>
                            <LoadingPost />
                        </>
                    :
                    topic?.posts.map((p, idx) => (
                        <div 
                            key={idx}
                            className={classNames({ "discussion-post": true, "is-sender": p.username === user?.username })} 
                        >
                            <div className="discussion-post-information">
                                {/* <p>Posted by:</p> */}
                                <DiscussionUser
                                    post={p}
                                />
                            </div>
                            <div className="discussion-post-message" dangerouslySetInnerHTML={{
                                __html: p.cooked || ''
                            }} />
                        </div>
                    ))
                }
            </div>
            {
                !props.hideNewPost &&
                <div className="discussion-add-post">
                    <LoginRequired message="You must be signed in to post messages">
                        <FormField
                            id="discussion-add-post-input"
                            {...newPostFormFields.message}
                            value={newPostForm.message}
                            onUpdate={updatePostFormField('message')}
                            onEnter={sendPost}
                            textArea={{
                                textAreaProps: {
                                    disabled: creatingPost,
                                    placeholder: `Post new message`
                                }
                            }}
                        />
                        <Message message={postMessage} />
                        <div
                            className={classNames({ "button small inverted": true, "disabled": !createPostReady || !topic || loadingTopic })}
                            onClick={sendPost}
                        >
                            {
                                creatingPost
                                    ? <><Loading /> Posting...</>
                                    : <>{icons.discussions.send} Post message</>
                            }

                        </div>
                    </LoginRequired>
                </div>
            }
        </div>
    )
}


type ILoadingPostProps = {
    isSender?: boolean
}
const LoadingPost = (props: ILoadingPostProps) => (
    <div className={classNames({"loading-discussion-post loading": true, "is-sender": props.isSender })}>
        <div className="loading-discussion-post-information">
            <UserLinkLoading loading1/>
            <div className="loading-discussion-user-post-time"/>
        </div>
        <div className="loading-discussion-post-message"/>
    </div>
)

function DiscussionUser(props: {
    post: IDiscussionPost
    className?: string
    id?: string
}) {
    return (
        <div id={props.id} className={classNames({ "discussion-user": true, [props.className || '']: true })}>
            <UserLink
                username={props.post.username}
            // username={props.post.display_username}
            />
            <div className="discussion-user-post-time">
                {dayjs(props.post.created_at).fromNow()}
            </div>
        </div>

    )
}

export default Discussion;
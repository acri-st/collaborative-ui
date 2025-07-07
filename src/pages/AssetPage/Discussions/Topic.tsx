import React, { useCallback, useEffect, useState } from 'react';
import { FormField, IDiscussionPost, IDiscussionTopic, IFormFieldsConfig, confirm,Loading, Logger, LoginRequired, Message, UserLinkLoading, createDiscussionPost, formReady, getDiscussionTopic, useMessage, useUser, deleteDiscussionTopic, handleRequestError, handleErrorWithMessage, FWKIcons, isUser, UserLink } from '@desp-aas/desp-ui-fwk';
import { postMessageMinMax } from './config';

import _ from 'lodash';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FaCircle } from 'react-icons/fa6';
import DiscussionUser from './DiscussionUser';
import { icons } from '../../../utils/icons';
import classNames from 'classnames';
import './Topic.css'
import { toast } from 'react-toastify';
dayjs.extend(relativeTime)

const logger = new Logger("AssetPage", "Topic");


type INewPostForm = {
    message: string
}
const defaultNewPostForm = { message: '' }

type IShowTopicProps = {
    goBack: () => any
    asset_id: string
    selectedTopic: IDiscussionTopic
}
export function Topic(props: IShowTopicProps) {

    const user = useUser();

    const [loadingPosts, setLoadingPosts] = useState(false);
    const [creatingPost, setCreatingPost] = useState(false);
    const [posts, setPosts] = useState<IDiscussionPost[]>([]);
    const [newPostForm, setNewPostForm] = useState<INewPostForm>(_.cloneDeep(defaultNewPostForm));

    const [postMessage, setPostMessage] = useMessage();
    const updatePostFormField = (field: string) => (update: any) => { setNewPostForm({ ...newPostForm, [field]: update }); }

    useEffect(() => {
        setPostMessage(undefined)
    }, [newPostForm])

    const newPostFormFields: IFormFieldsConfig = {
        'message': { field: 'message', required: true, charLimit: postMessageMinMax },
    }

    const [createPostReady, setCreatePostReady] = useState(false);

    
    const [deleting, setDeleting] = useState(false);

    const handleDeleteTopic = useCallback(()=>{
        confirm({
            title: "Delete topic",
            message: `Are you sure you want to delete the topic ${props.selectedTopic.title}?`,
            onConfirm: ()=>{
                setDeleting(true);
                deleteDiscussionTopic(props.selectedTopic.id)
                .then(()=>{
                    props.goBack();
                    toast(<>Successfully deleted topic, this might take a while before being delisted</>, { type: 'success' })
                })
                .catch(handleRequestError)
                .finally(()=>{
                    setDeleting(false);
                })
            }
        })
    }, [])

    useEffect(() => {
        setCreatePostReady(formReady(Object.values(newPostFormFields), newPostForm) && !creatingPost)
    }, [newPostForm, creatingPost])


    const fetchPosts = async () => {
        logger.info("Fetching posts")
        if (!props.selectedTopic) return setPosts([]);
        else {
            setLoadingPosts(true);
            try {
                let response = (await getDiscussionTopic(props.selectedTopic.id)).posts;
                setPosts(response)
            }
            catch (e) {
                logger.error("Error while fetching posts", e)
            }
            finally {
                setLoadingPosts(false);
            }
        }
    }
    const sendPost = async () => {
        logger.debug("called send post")
        if (user && props.selectedTopic && createPostReady) {

            logger.debug("starting send post")
            setCreatingPost(true);
            try {
                logger.debug("creating post")

                // await sleep(300);

                let newPost = await createDiscussionPost(props.selectedTopic, { text: newPostForm.message })
                logger.debug("setting topic with new post")

                let update: IDiscussionPost[] = [...posts];
                // update.push({ topic_id: 0, name:'', display_username: user.username, message, username: user.username, created_at: dayjs().toISOString() })
                update.push(newPost)
                setPosts(update);

                updatePostFormField('message')('')
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
        fetchPosts()
    }, [props.selectedTopic])
    return (
        <div id="dataset-topic">
            <div id="dataset-topic-description">
                <div id="dataset-topic-title">{props.selectedTopic.title}</div>
                <div id="dataset-topic-information">
                    <div className="discussion-user">
                        <UserLink
                            username={props.selectedTopic.username}
                        />
                    </div>
                    <div id="dataset-topic-creation-date-separation"><FaCircle /></div>
                    <div id="dataset-topic-creation-date">
                        {dayjs(props.selectedTopic.created_at).format('YYYY/MM/DD HH:mm')}
                    </div>
                    <div id="dataset-topic-creation-date-separation"><FaCircle /></div>
                    <div id="dataset-topic-creation-date-since">
                        {dayjs(props.selectedTopic.created_at).fromNow()}
                    </div>
                    {
                        isUser(props.selectedTopic.username, user) &&
                        <div 
                            id="dataset-topic-delete"
                            className={classNames({ 
                                "button small inverted operation red": true,
                                "disabled": deleting 
                            })}
                            onClick={handleDeleteTopic}
                        >
                            { deleting ? <Loading /> : FWKIcons.delete}
                            { deleting ? <>Deleting...</> : <>Delete</>  }
                        </div>
                    }
                </div>
            </div>
            <div id="dataset-topic-posts">
                {
                    loadingPosts
                    ?
                        <>
                            <LoadingPost/>
                            <LoadingPost/>
                        </>
                    :
                    posts?.map((p, idx) => (
                        <div className="dataset-post" key={idx}>
                            <div className="dataset-post-information">
                                {/* <p>Posted by:</p> */}
                                <DiscussionUser
                                    post={p}
                                />
                            </div>
                            <div className="dataset-post-message" dangerouslySetInnerHTML={{
                                __html: p.cooked || ''
                            }} />
                        </div>
                    ))
                }
            </div>
            <div className="dataset-add-post">
                <LoginRequired message="You must be signed in to post messages">
                    <FormField
                        id="dataset-add-post-input"
                        {...newPostFormFields.message}
                        value={newPostForm.message}
                        onUpdate={updatePostFormField('message')}
                        onEnter={sendPost}
                        textArea={{
                            textAreaProps: {
                                disabled: creatingPost,
                                placeholder: `Post message to '${props.selectedTopic.title}'`
                            }
                        }}
                    />
                    <Message message={postMessage} />
                    <div
                        className={classNames({ "button small inverted": true, "disabled": !createPostReady })}
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
        </div>
    )
}

const LoadingPost = () => (
    <div className="loading-dataset-post loading">
        <div className="loading-dataset-post-information">
            <UserLinkLoading loading1/>
            <div className="loading-discussion-user-post-time"/>
        </div>
        <div className="loading-dataset-post-message"/>
    </div>
)


export default Topic;
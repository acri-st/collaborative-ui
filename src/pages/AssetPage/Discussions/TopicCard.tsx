import { FWKIcons, IAsset, IDiscussionTopic, Loading, UserAvatar, UserLink, confirm, deleteDiscussionTopic, handleRequestError, isUser, toast, useUser } from "@desp-aas/desp-ui-fwk"
import classNames from "classnames"
import { useCallback, useState } from "react"
import { icons } from "../../../utils/icons"
import DiscussionUser from "./DiscussionUser"
import './TopicCard.css'
import { FaCircle } from "react-icons/fa6"

type IProps = {
    topic: IDiscussionTopic
    fetchTopics: ()=>any
    onSelectTopic: (topic: IDiscussionTopic)=>any
    asset: IAsset
}

export const TopicCard = (props: IProps) =>{
    const user = useUser();
    const [deleting, setDeleting] = useState(false);
    const handleDeleteTopic = useCallback((topic: IDiscussionTopic)=>{
        confirm({
            title: "Delete topic",
            message: `Are you sure you want to delete the topic ${topic.title}?`,
            onConfirm: ()=>{
                setDeleting(true);
                deleteDiscussionTopic(topic.id)
                .then(()=>{
                    props.fetchTopics();
                    toast(<>Successfully deleted topic, this might take a while before being delisted</>, { type: 'success' })
                })
                .catch(handleRequestError)
                .finally(()=>{
                    setDeleting(false);
                })
            }
        })
    }, [])

    
    return (
        <div
            className="dataset-topic-card"
            onClick={() => { props.onSelectTopic(props.topic) }}
        >
            {
                isUser(props.topic.username, user) &&
                <div className="dataset-topic-card-operations">
                    <div 
                        className={classNames({
                            "dataset-topic-card-operation operation button red small icon-only": true,
                            "disabled": deleting
                        })}
                        onClick={(ev)=>{
                            ev.stopPropagation();
                            handleDeleteTopic(props.topic)
                        }}
                    >
                        { deleting ? <Loading /> : FWKIcons.delete}
                    </div>
                </div>
            }
            <div className="dataset-topic-card-information">
                <div className="dataset-topic-card-title">
                    {props.topic.title}
                </div>
                <div className="dataset-top-card-details">
                    <div className="dataset-topic-user">
                        <UserLink
                            username={props.topic.username}
                        />
                    </div>
                    {/* <div className="dataset-top-separator"><FaCircle /></div>
                    <div className="dataset-top-card-category">
                        {props.topic.slug}
                    </div> */}
                </div>
                {
                    props.topic.posts.length > 0 &&
                    <div className="dataset-topic-card-latest-post">
                        <DiscussionUser
                            className='dataset-topic-card-latest-post-user'
                            post={props.topic.posts[props.topic.posts.length - 1]}
                        />
                    </div>
                }
            </div>

            <div className="dataset-topic-card-posts">
                {icons.discussions.posts}
                <label>
                    {props.topic.posts_count}
                </label>
            </div>
        </div>
    )
}


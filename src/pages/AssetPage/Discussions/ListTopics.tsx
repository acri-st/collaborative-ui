import React, { useCallback, useEffect, useState } from 'react';
import { confirm, deleteDiscussionTopic, FWKIcons, getDiscussionTopics, handleRequestError, IAsset, IDiscussionTopic, isUser, Loading, LoadingUserLink, Logger, useUser } from '@desp-aas/desp-ui-fwk';

import _ from 'lodash';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import DiscussionUser from './DiscussionUser';
import { icons } from '../../../utils/icons';
import classNames from 'classnames';
import { TopicCard } from './TopicCard';
dayjs.extend(relativeTime)

const logger = new Logger("AssetPage", "ListTopics");

type IListTopicsProps = {
    asset: IAsset
    onSelectTopic: (topic: IDiscussionTopic) => any
    asset_id: string

}
export function ListTopics(props: IListTopicsProps) {

    const [loadingTopics, setLoadingTopics] = useState(true);
    const [topics, setTopics] = useState<IDiscussionTopic[]>();


    useEffect(() => {
        fetchTopics();
    }, [])


    const fetchTopics = async () => {
        logger.info("Fetching topics")
        setLoadingTopics(true);
        try {
            if (!props.asset_id) {
                throw new Error('Missing product id in params');
            }
            else {
                logger.debug(`id? ${props.asset_id}`)
                let response = await getDiscussionTopics(props.asset_id);
                // let response = { topics: example_topics };

                // if (selectedTopic) {
                //     let find = response.topics.find((t) => t.id === selectedTopic.id)
                //     if (find) setSelectedTopic(find);
                //     else setSelectedTopic(undefined);
                // }

                logger.info(`topics for asset ${props.asset_id}`, response.topics)
                setTopics(response.topics)
            }

        }
        catch (e) {
            logger.error("Error while fetching topics", e)
        }
        finally {
            setLoadingTopics(false);
        }
    }

    return (
        <>
            {
                <div id="dataset-topics"  className="simple-scrollbar" >
                    {
                        loadingTopics
                            ? 
                                <>
                                    <LoadingDiscussion/>
                                    <LoadingDiscussion/>
                                </>
                            : topics && topics.length > 0
                            ? topics?.map((t, idx) => (
                                <TopicCard
                                    key={t.id}
                                    topic={t}
                                    fetchTopics={fetchTopics}
                                    onSelectTopic={props.onSelectTopic}
                                    asset={props.asset}
                                />
                            ))
                            : <div className='no-data'>
                                No discussions currently available
                            </div>

                    }
                </div>
            }
        </>
    )
}

export const LoadingDiscussion = () =>(
    <div
        className="loading-dataset-topic-card loading"
    >
    <div className="loading-dataset-topic-card-information">
        <div className="loading-dataset-topic-card-title"/>
        <div className="dataset-top-card-category"/>
        <div className="loading-dataset-topic-card-latest-post">
            <LoadingUserLink />
        </div>
    </div>

    <div className="loading-dataset-topic-card-posts">
    </div>
</div>
)
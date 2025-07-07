import React, { useEffect, useState } from 'react';
import './Discussions.css'
import { Breadcrumbs, ICustomBreadcrumb, useUser, FWKIcons, Logger, LoginRequired, IDiscussionTopic } from '@desp-aas/desp-ui-fwk';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useParams } from 'react-router-dom';
import Topic from './Topic';
import CreateTopic from './CreateTopic';
import { ListTopics } from './ListTopics';
import { IAssetTabProps } from "../common";
dayjs.extend(relativeTime)

const logger = new Logger("AssetPage", "Discussions");


const defaultBreadcrumb = { label: 'Discussions' }


export function Discussions(props: IAssetTabProps) {
    const { asset_id } = useParams() as { asset_id: string };

    const [breadcrumbs, setBreadcrumbs] = useState<ICustomBreadcrumb[]>([defaultBreadcrumb]);


    const [newTopic, setNewTopic] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<IDiscussionTopic>();

    const user = useUser();


    useEffect(() => {
        // fetchPosts();
        if (newTopic) {
            // fetchCategories()
            setBreadcrumbs([{ ...defaultBreadcrumb, onClick: () => { setNewTopic(false) } }, { label: <>New discussion</> }])
        }
        else if (selectedTopic) {
            setBreadcrumbs([{ ...defaultBreadcrumb, onClick: () => { setSelectedTopic(undefined) } }, { label: selectedTopic.title }])
        }
        else {
            setBreadcrumbs([defaultBreadcrumb])
        }
    }, [selectedTopic, newTopic])

    return (
        <div id="discussions">
            <Breadcrumbs
                customBreadcrumbs={breadcrumbs}
            />
            {
                /** ===========================================
                 *  CREATE TOPIC
                    =========================================== */
                newTopic ?
                    <>
                        {
                            asset_id &&
                            <CreateTopic asset_id={asset_id} goBack={() => setNewTopic(false)} />
                        }
                    </>
                    :
                    /** ===========================================
                     *  LIST TOPICS
                        =========================================== */
                    !selectedTopic
                        ?
                        <>
                            {
                                <LoginRequired small message="In order to create a discussion you must first login">
                                <div id="new-topic-button" className="button create-button" onClick={() => setNewTopic(true)}>
                                    {FWKIcons.createButton} New discussion
                                </div>

                                </LoginRequired>
                            }
                            <ListTopics
                                asset={props.asset}
                                onSelectTopic={(topic) => setSelectedTopic(topic)}
                                asset_id={asset_id}
                            />

                        </>
                        :
                        /** ===========================================
                         *  SELECTED TOPIC
                            =========================================== */
                        <Topic
                            goBack={() => setSelectedTopic(undefined)}
                            asset_id={asset_id}
                            selectedTopic={selectedTopic}
                        />

            }
        </div>
    )
}

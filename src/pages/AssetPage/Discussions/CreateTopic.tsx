import { FWKIcons, FormField, IFormFieldsConfig, Loading, Logger, Message, createDiscussionTopic, formReady, handleErrorWithMessage, handleRequestError, toast, useMessage, useUser } from '@desp-aas/desp-ui-fwk';
import { useEffect, useState } from 'react';
import { postMessageMinMax } from './config';

import classNames from 'classnames';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';
dayjs.extend(relativeTime)

const logger = new Logger("AssetPage", "CreateTopic");

type INewTopicForm = {
    title: string
    category: number
    text: string
}
const defaultNewTopicForm = { title: '', category: -1, text: '' }

type ICreateTopicProps = {
    goBack: () => any
    asset_id: string
}

export function CreateTopic(props: ICreateTopicProps) {
    const user = useUser();

    const [creatingTopic, setCreatingTopic] = useState(false);
    const [newTopicForm, setNewTopicForm] = useState<INewTopicForm>(_.cloneDeep(defaultNewTopicForm));

    const updateFormField = (field: string) => (update: any) => { setNewTopicForm({ ...newTopicForm, [field]: update }); }
    const [topicMessage, setTopicMessage] = useMessage();

    const [createReady, setCreateReady] = useState(false);

    const newTopicFormFields: IFormFieldsConfig = {
        'title': {
            label: <>Title</>, field: 'title', required: true,
            validation: [{ description: 'The title must be at least 15 characters long', validation: () => newTopicForm.title.length >= 15 }]
        },
        'text': {
            label: <>First post</>, field: 'text', required: true, charLimit: postMessageMinMax,
            // validation: [{ description: 'The post must contain at least 20 characters', validation: ()=> newTopicForm.title.length >= 20 }],
            textArea: {
                textAreaProps: { placeholder: `The first post for the new discussion.` }
            }
        },
    }

    useEffect(() => {
        setCreateReady(!!props.asset_id && formReady(Object.values(newTopicFormFields), newTopicForm) && !creatingTopic)
    }, [newTopicForm, props.asset_id, creatingTopic])

    const createTopic = async () => {
        logger.info("called create topic")
        if (createReady) {
            logger.debug("creating topic")
            setCreatingTopic(true);
            try {
                logger.debug("sending topic request")
                let topicPost = await createDiscussionTopic({
                    asset_id: props.asset_id,
                    title: newTopicForm.title,
                    text: newTopicForm.text
                })
                logger.debug("topic post response", topicPost)


                logger.debug("setting new topic in topics")

                setNewTopicForm(_.cloneDeep(defaultNewTopicForm))
                toast(<>Successfully created discussion</>, { type: "success" })
                props.goBack();
            }
            catch (e) {
                logger.error("Error occured during topic creation", e);
                handleRequestError(e, { defaultMessage: <>An error has occured during discussion creation, please try again later</> })
                handleErrorWithMessage(e as any, setTopicMessage)
            }
            finally {
                setCreatingTopic(false);
            }
        }
        else {
            logger.warn("creating topic not ready")
        }
    }

    useEffect(() => {
        setTopicMessage(undefined)
    }, [newTopicForm])

    return (
        <>
            <div className="form">
                <FormField
                    id="create-topic-title"
                    {...newTopicFormFields.title}
                    id="create-topic-title"
                    value={newTopicForm.title}
                    onUpdate={updateFormField('title')}
                    onEnter={createTopic}
                />
                <FormField
                    id="create-topic-text"
                    {...newTopicFormFields.text}
                    id="create-topic-text"
                    value={newTopicForm.text}
                    onUpdate={updateFormField('text')}
                    onEnter={createTopic}
                />
            </div>
            <Message message={topicMessage} />
            <div
                id="create-topic-button"
                className={classNames({ "button inverted": true, "disabled": !createReady })}
                onClick={() => createTopic()}
            >
                {
                    creatingTopic
                        ? <><Loading /> Creating...</>
                        : <>{FWKIcons.create} Create discussion</>
                }

            </div>
        </>
    )

}
export default CreateTopic;
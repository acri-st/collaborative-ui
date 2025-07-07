import { FormField, ICreateGroup, IFormFieldsConfig, Loading, Logger, LoginRequired, MandatoryField, Message, Page, createGroup, formReady, getCategories, handleErrorWithMessage, handleRequestError, useMessage, useUser } from "@desp-aas/desp-ui-fwk";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation/Navigation";
import { ReactNode, useEffect, useState } from "react";
import _ from 'lodash';
import './NewGroupPage.css'
import classNames from "classnames";

const logger = new Logger('pages', 'NewGroupPage')

type IForm = {
    name: string
    category_id: string
    private: boolean
    description: string
}

const _defaultForm: IForm = {
    name: '',
    category_id: '',
    private: false,
    description: ''
}

export default function NewGroupPage() {
    const navigate = useNavigate();
    const user = useUser();

    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<IForm>(_.cloneDeep(_defaultForm))
    const [categoryOptions, setCatgoryOptions] = useState<{ value: string|number, label: ReactNode }[]>([])

    const [message, setMessage] = useMessage();

    const formFields: IFormFieldsConfig = {
        name: { required: true, field: 'name', label: "Name" },
        category: { required: true, field: 'category_id', label: "Category" },
        description: { required: true, field: 'description', label: "Description", charLimit: { min: 20 },  },
        private: { field: 'private', label: "Visibility" },
    }

    useEffect(() => {
        getCategories().then((_categories) => {
            let categories = _categories
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(c => ({ value: c.id, label: c.name }))
            setCatgoryOptions(categories)
        })
    }, [])

    const updateFormField = (field: string) => (update: any) => { setForm({ ...form, [field]: update }); if (message) setMessage(undefined) };

    function isFormReady() {
        return formReady(Object.values(formFields), form)
    }

    const createDisabled = creating || !isFormReady() || !user;

    const submit  = async () => {
        if (createDisabled) return;

        if(message) setMessage(undefined)
        setCreating(true)

        try {
            let groupForm: ICreateGroup = { ...form, owner: user.id };

            let newGroup = (await createGroup(groupForm))

            navigate(`/group/${newGroup.id}`);
        }
        catch (e) {
            logger.error("Error during asset creation", e);
            handleRequestError(e, { defaultMessage: <>An error has occured during the creation</> })

            handleErrorWithMessage(e as any, setMessage)
        }
        finally {
            setCreating(false)
        }
    }

    return <Page
        background2
        fixedHeight
        id="form-page"
    >
        <Navigation />
        <div className="fixed-page-content">
            <div id="form-page-content">
                <div id="form-page-title">
                    Create a new group
                </div>
                <div id="form-page-subtitle">
                    Create a community to share all information portaining to the group
                </div>
                <LoginRequired>
                    <div id="form-page-form">
                        <div id="form-page-form-fields">

                            <FormField
                                {...formFields.name}
                                value={form.name}
                                onUpdate={updateFormField('name')}
                                onEnter={submit}
                                inputProps={{
                                    placeholder: `New group name`
                                }}
                            />

                            <FormField
                                {...formFields.category}
                                select={{
                                    options: categoryOptions
                                }}
                                value={form.category_id}
                                onUpdate={updateFormField('category_id')}
                                onEnter={submit}
                            />
                            <FormField
                                {...formFields.description}
                                textArea={{}}
                                value={form.description}
                                onUpdate={updateFormField('description')}
                                onEnter={submit}
                            />

                            {/* <FormField
                                {...formFields.private}
                                radioSelect={{
                                    options: [
                                        { label: "Public", value: false },
                                        { label: "Private", value: true },
                                    ]
                                }}
                                value={form.private}
                                onUpdate={updateFormField('private')}
                                onEnter={submit}
                            /> */}

                        </div>

                        <div id="form-page-finalisation">

                            <Message message={message} />

                            <div id="form-page-finalisation-bottom">
                                <MandatoryField />
                                <div id="form-page-finalisation-buttons">
                                    <div
                                        className={classNames({
                                            "button medium filled": true,
                                            "disabled": createDisabled
                                        })}
                                        onClick={!createDisabled ? submit : undefined}
                                    >
                                        {
                                            creating
                                                ? <><Loading /> Creating...</>
                                                : <>Create</>
                                        }
                                    </div>
                                    {/* <div
                                    className="button medium"
                                    onClick={() => { navigate('/projects') }}
                                >
                                    Cancel
                                </div> */}
                                </div>
                            </div>
                        </div>
                    </div>


                </LoginRequired>

            </div>
        </div>
    </Page>
}

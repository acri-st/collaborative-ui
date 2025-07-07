import { Logger, useUser, IFormFieldsConfig, useMessage, formReady, handleRequestError, handleErrorWithMessage, Page, LoginRequired, FormField, Message, MandatoryField, Loading, ASSET_TYPE, ASSET_VISIBILITY, createAsset, externalURLValidation, getAssetTypeLabel, getLicenses, SOURCE_TYPE, ILicense, ICreateAsset } from "@desp-aas/desp-ui-fwk"
import classNames from "classnames"
import _ from "lodash"
import { useState, ReactNode, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navigation from "../../components/Navigation/Navigation"


const logger = new Logger('pages', 'FormPage')

type IForm = {
    name: string
    license: string
    visibility: ASSET_VISIBILITY
    source: SOURCE_TYPE
    externalURL: string
}

const _defaultForm= (asset_type: ASSET_TYPE): IForm  => {
    return {
        name: '',
        license: 'none',
        visibility: ASSET_VISIBILITY.private,
        source: asset_type === ASSET_TYPE['course'] ? SOURCE_TYPE.external : SOURCE_TYPE.user,
        externalURL: ''
    }
}

export default function FormPage() {
    const navigate = useNavigate();
    const { asset_type } = useParams() as { asset_type: ASSET_TYPE };
    const user = useUser();

    // const [ assetTypeName, setAssetTypeName ] = useState('');
    // useEffect(()=>{
    //     setAssetTypeName(asset_type)
    // }, [asset_type])

    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<IForm>(_.cloneDeep(_defaultForm(asset_type)))
    const [licenseOptions, setLicenseOptions] = useState<{ value: string, label: ReactNode }[]>([])

    const [assetLabel, setAssetLabel] = useState(getAssetTypeLabel(asset_type))


    useEffect(()=>{
        setForm(_.cloneDeep(_defaultForm(asset_type)))
    } , [ asset_type ])


    const formFields: IFormFieldsConfig = {
        name: { required: true, field: 'name', label: "Name" },
        license: { required: true, field: 'license', label: "License" },
        visibility: { field: 'visibility', label: "Visibility" },
        source: { field: 'source', label: "Source" },
        externalAsset: {
            field: 'externalURL', label: "External Asset", required: form.source === "external",
            validation: externalURLValidation
        },
    }

    useEffect(() => {
        setAssetLabel(getAssetTypeLabel(asset_type))
        getLicenses().then((_licenses) => {
            let lincenses = [{ value: 'none', label: "No license" }]
            lincenses = lincenses.concat(
                _licenses
                    .sort((a: ILicense, b: ILicense) => a.name.localeCompare(b.name))
                    .map(license => ({ value: license.id, label: license.name }))
            )
            setLicenseOptions(lincenses)
        })
    }, [asset_type])

    const updateFormField = (field: string) => (update: any) => { setForm({ ...form, [field]: update }); if (message) setMessage(undefined) };

    const [message, setMessage] = useMessage()

    function isFormReady() {
        return formReady(Object.values(formFields), form)
    }

    const createDisabled = creating || !isFormReady() || !user;

    async function submit() {
        if (createDisabled) return;

        if(message) setMessage(undefined)
        setCreating(true)

        try {
            let assetForm: ICreateAsset = { ...form, owner: user.id, };
            if (assetForm.source !== SOURCE_TYPE.external) delete assetForm.externalURL;
            if (assetForm.license === "none") delete assetForm.license;
            let assetId = await createAsset(assetForm, asset_type as ASSET_TYPE)

            navigate(`/asset/${assetId}`);
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
        // footer={{ fixed: true }}
    >
        <Navigation />
        <div className="fixed-page-content">
            <div id="form-page-content">
                <div id="form-page-title">
                    {
                        asset_type === ASSET_TYPE.course
                        ?
                        <>
                            Create a new course
                        </>
                        : <>
                            Create a new {assetLabel} repository
                        </>
                    }
                </div>
                <div id="form-page-subtitle">
                    {
                        asset_type === ASSET_TYPE.course
                        ?
                        <>
                            An external link to a course.
                        </>
                        : <>
                            A repository contains all {assetLabel} files, including the revision history.
                        </>
                    }
                </div>
                <LoginRequired>
                    <div id="form-page-form">
                        <div id="form-page-form-fields">

                            <FormField
                                {...formFields.name}
                                value={form.name}
                                onUpdate={updateFormField('name')}
                                onEnter={submit}
                                id="form-field-name"
                                inputProps={{
                                    placeholder: `New ${assetLabel} name`
                                }}
                            />
                            {
                                asset_type !== ASSET_TYPE['course'] &&
                                <FormField
                                    {...formFields.source}
                                    id="form-field-source"
                                    radioSelect={{
                                        options: [
                                            { label: <>User asset</>, value: 'user' },
                                            { label: <>External asset</>, value: 'external', tooltip: `Create a${asset_type === 'application' ? 'n' : ''} ${assetLabel} from remote URLs` },
                                        ]
                                    }}
                                    value={form.source}
                                    onUpdate={(source) => {
                                        setForm({ ...form, source, externalURL: source !== 'external' ? '' : form.externalURL })
                                    }}
                                    onEnter={submit}
                                />
                            }

                            {
                                form.source === "external"
                                &&
                                <FormField
                                    {...formFields.externalAsset}
                                    { 
                                        ...(asset_type === ASSET_TYPE['course']
                                        ? { label: <>Course URL</> }
                                        : {})
                                    }
                                    id="form-field-external-asset"
                                    value={form.externalURL}
                                    onUpdate={updateFormField('externalURL')}
                                    onEnter={submit}
                                />
                            }
                        </div>

                        <div id="form-page-finalisation">
                            {
                                form.source === "user" &&
                                <p>
                                    Once your {assetLabel} is created, you can upload your files.
                                </p>
                            }
                            <Message message={message} />

                            <div id="form-page-finalisation-bottom">
                                <MandatoryField />
                                <div id="form-page-finalisation-buttons">
                                    <div
                                        id="form-page-create-button"
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

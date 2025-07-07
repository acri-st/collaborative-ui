import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import './AssetPage.css';
import { useNavigate, useParams } from 'react-router-dom';
import { Loading, Logger, LoginRequired, Page, ToggleButton, isUser, useUser, toast, UserLink, confirm, handleRequestError, useTermsAndConditionsLink, formatFileResponse, getAssetVersions, IAssetVersion, Select, ASSET_STATUS, ASSET_TYPE, assetIsPublished, assetIsReady, bookmarkAsset, getAsset, getMetadatas, IAsset, IAssetResponse, likeAsset, listAssetRepository, SOURCE_TYPE, submitAsset, updateAsset, IFile, DTEAcknowledgement } from '@desp-aas/desp-ui-fwk';
import Navigation from '../../components/Navigation/Navigation';
import classNames from 'classnames';
import { Details } from './Details/Details';
import { Discussions } from './Discussions/Discussions';
import { AssetMetadata } from './AssetMetadata/AssetMetadata';
import Files from './Files/Files';
import { Overview } from './Overview/Overview';
import {FaCircleCheck } from 'react-icons/fa6';
import { MdPending } from 'react-icons/md';
import { icons } from '../../utils/icons';
import { AssetImage } from './AssetImage/AssetImage';
import { Options } from './Options/Options';
import { FaTimes  } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { IAssetFilter } from '../../utils/catalog';

const logger = new Logger('Page', 'AssetPage');

type IAssetTab = {
    name: string
    // content: (props: IAssetTabProps) => ReactNode
    label: ReactNode
}

const TABS: { [key: string]: IAssetTab } = {
    'overview': {
        label: <>Overview</>,
        name: 'overview',
    },
    'details': {
        label: <>Details</>,
        name: 'details',
    },
    'files': {
        label: <>Files</>,
        name: 'files',
    },
    'discussions': {
        label: <>Discussions</>,
        name: 'discussions',
    },
    'options': {
        label: <>Options</>,
        name: 'options',
    },
}


const removeEmpty = (obj: any) => {
    for (const entry of Object.entries(obj)) {
        if (entry[1] === '') {
            delete obj[entry[0]];
        }
    }
}

export type IPendingActions = {
    pending: boolean
    required?: boolean
    title: ReactNode
    description: ReactNode

}[]

const USABILITY_SCORE_MAX = 10;

let fetchLoop: NodeJS.Timeout|undefined;

const clearLoop = () =>{
    if(fetchLoop){
        clearInterval(fetchLoop);
        fetchLoop = undefined;
    }
}


export const AssetPage = () => {
    const pageRef = useRef<HTMLInputElement>(null);
    const [ assetResponse, setAssetResponse ] = useState<IAssetResponse>();
    const [asset, setAsset] = useState<IAsset>();
    const { asset_id } = useParams() as { asset_id: string };

    const [loadingAsset, setLoadingAsset] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const [loadingAssetMetadata, setLoadingAssetMetadata] = useState(true);
    const [allMetadata, setAllMetadata] = useState<IAssetFilter[]|undefined>();
    const [assetMetadata, setAssetMetadata] = useState<IAssetFilter[]|undefined>();
    
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [files, setFiles] = useState<IFile[]>();

    const [assetReady, setAssetReady] = useState(false);
    const [assetPublished, setAssetPublished] = useState(false);

    const [tabs, setTabs] = useState<IAssetTab[] | undefined>();
    const [selectedTab, setSelectedTab] = useState<IAssetTab | undefined>();
    const [isOwner, setIsOwner] = useState(false);
    const [assetLabel, setAssetLabel] = useState<ReactNode>();

    const [ assetVersions, setAssetVersions ] = useState<IAssetVersion[] | undefined>();
    const [ loadingAssetVersions, setLoadingAssetVersions ] = useState(true);
    const [ selectedVersion, setSelectedVersion ] = useState<IAssetVersion | undefined>();

    const [pendingActions, setPendingActions] = useState<IPendingActions | undefined>();
    const [requiredActions, setRequiredActions] = useState< number | undefined>();
    const [requiredCount, setRequiredCount] = useState< number | undefined>();
    const [usabilityScore, setUsabilityScore] = useState<string | number | undefined>();

    const [ submiting, setSubmiting ] = useState(false);
    const [ updating, setUpdating ] = useState(false);

    const [ initialised, setInitialised ] = useState(false);
    const [ liking, setLiking ] = useState(false);
    const [ bookmarking, setBookmarking ] = useState(false);

    const [ updatingAsset, setUpdatingAsset ] = useState(false);

    const user = useUser();

    const navigate = useNavigate();


    useEffect(() => {
        setIsOwner(!!(assetResponse && isUser(user, assetResponse?.draft?.despUserId)))
    }, [user, assetResponse])

    useEffect(() => {
        setAssetLabel(asset ? asset.type : undefined)
    }, [asset])

    useEffect(() => {
        setLoadingAssetMetadata(true);
        getMetadatas()
            .then((metadata) => {
                setAllMetadata(metadata)
                setLoadingAssetMetadata(false)
            })
            .catch((e: any) => {
                logger.error('Error during fetchAssetMetadata', e);
                setLoadingAssetMetadata(false)
            })
    }, [])

    useEffect(() => {
        if(!asset?.type){
            setAssetMetadata(undefined);
            return;
        }
        setAssetMetadata(allMetadata?.filter((metadata) => metadata.asset_type?.includes(asset.type) || metadata.asset_type === undefined || metadata.asset_type === null))
    }, [asset?.type, allMetadata])
    

    useEffect(() => {
        if(asset && isOwner){

            let pendingActions: IPendingActions = [
                {
                    pending: !(asset.metadata?.description && !!asset.metadata.description), required: true,
                    title: <>Add Description </>,
                    description: <>Share specifics about the context, and inspiration behind your {assetLabel}</>
                },
                {
                    pending: asset.categoryId === undefined, required: true,
                    title: <>Specify {assetLabel} category </>,
                    description: <>Specify the category of your {assetLabel}</>
                },
                // {
                //     pending: !asset.isVisible, required: true,
                //     title: <>Set to visible</>,
                //     description: <>Set your {assetLabel} to public.</>
                // },
                
                // { 
                //     pending: asset.,
                //     title: <>Add Description </>,
                //     description: <>Share specifics about the context, and inspiration behind your dataset</>
                // }
            ];
    
            if(asset.source !== "external"){
                pendingActions?.push({
                    pending: !(files && files.length > 0), required: true,
                    title: <>Add files </>,
                    description: <>Upload files for your {assetLabel}</>
                })
            }

            // Non required
            // pendingActions = pendingActions.concat([
            //     {
            //         pending: asset.metadata?.type === undefined,
            //         title: <>Specify {assetLabel} type</>,
            //         description: <>Specify the type of your {assetLabel}</>
            //     },
            // ])
    
            setPendingActions(pendingActions);
    
            setUsabilityScore(pendingActions ? pendingActions?.filter((pa) => pa.pending === false).length : 0);
            setRequiredActions(pendingActions ? pendingActions?.filter((pa) => pa.pending === false && pa.required === true).length : 0);
            setRequiredCount(pendingActions ? pendingActions?.filter((pa) => pa.required === true).length : 0);

            // let usabilityScore: number | string = pendingActions ? pendingActions?.filter((pa) => pa.pending === false).length : 0;
            // usabilityScore = (pendingActions ? (usabilityScore / pendingActions.length) * USABILITY_SCORE_MAX : 0)
            // if(!Number.isInteger(usabilityScore)){
            //     usabilityScore = usabilityScore.toFixed(2)
            // }
            // setUsabilityScore(usabilityScore);
        }


    }, [assetLabel, asset, isOwner, files])

    
    useEffect(()=>{
        if(asset && asset.status && [ASSET_STATUS.validation, ASSET_STATUS.modified].includes(asset.status)){
            if(!fetchLoop)
                fetchLoop = setInterval(()=>{ fetchAsset(); }, 5000)
        }
        else{
            if(fetchLoop){
                clearLoop()
            }
        }

        return ()=>{
            clearLoop();
        }
    }, [ asset?.status ])


    useEffect(() => {
        setAssetPublished(assetIsPublished(assetResponse?.public || assetResponse?.draft));
    }, [assetResponse, editMode])

    useEffect(()=>{
        if(assetResponse){
            let _asset =  (editMode || !assetPublished) ? assetResponse?.draft : assetResponse?.public; // assetResponse?.[editMode ? 'draft' : 'public' ]
            if(_asset)
                setAsset(_asset)
        }
    }, [ assetResponse, assetPublished, editMode ])


    useEffect(() => {
        logger.debug("[CheckUser] checking  is user", asset?.despUserId, asset?.metadata?.description)
        if (
            asset && asset.despUserId
            && isOwner
            // && !assetIsPublished(asset)
        ) {
            logger.debug("[CheckUser] is user")
            if (!editMode && !assetIsPublished(asset)) setEditMode(true)
        }
        else {
            logger.debug("[CheckUser] is not user")
            if (editMode) setEditMode(false);
        }
    }, [asset, user, isOwner])

    useEffect(() => {
        setAssetReady(assetIsReady(asset, files));
    }, [asset, editMode, files])

    useEffect(() => {
        // Handle tabs
        if (asset) {
            let tabs: IAssetTab[] = [TABS.overview, TABS.details, TABS.files, ...assetPublished ? [TABS.discussions] : []];
            // Why ?
            if (asset.source !== SOURCE_TYPE.user)
                tabs = [TABS.overview, TABS.details, ...assetPublished ? [TABS.discussions] : []]
            else if (ASSET_TYPE.application)
                // tabs = [TABS.overview, TABS.details, TABS.files, TABS.incidents, ...!assetPublished ? [TABS.discussions] : []]
                tabs = [TABS.overview, TABS.details, TABS.files, ...assetPublished ? [TABS.discussions] : []]
            else
                tabs = [TABS.overview, TABS.details, TABS.files, ...assetPublished ? [TABS.discussions] : []];

            if(isOwner){
                tabs.push(TABS.options)
            }

            setTabs(tabs);

            if (selectedTab) {
                if (!tabs.includes(selectedTab))
                    setSelectedTab(tabs[0])
            }
            else {
                setSelectedTab(tabs[0])
            }
        }
        else {
            setTabs(undefined)
            setSelectedTab(undefined)
        }
    }, [asset, editMode, assetPublished, isOwner])

    const fetchAsset = async (version?: IAssetVersion) => {
        setLoadingAsset(true)
        try {
            let _version = version || selectedVersion;
            // const _asset = asset_id === "test" ? TEST_ASSET : await getAsset(asset_id);
            const assetResponse = await getAsset(asset_id, _version ? _version.latest ? undefined : _version.marker : undefined);

            setAssetResponse(assetResponse);
        }
        catch (e: any) {
            logger.error('Error during fetchAsset', e);
            if(e?.response && e.response.status === 404){
                toast(<>The asset is either not ready or does not exist</>, { type: "warning" })
            }
            else{
                handleRequestError(e, { defaultMessage: <>An error has occured during asset retrieval, please try again later</> })
            }

            navigate(`/catalog/dataset`)
        }
        finally {
            setLoadingAsset(false)
            setInitialised(true)
        }
    }


    
    const fetchFiles = async (withoutLoading?: boolean) => {
        if(!asset || asset.source === 'external') return;
        if (!withoutLoading) setLoadingFiles(true)
        if(!asset.repository){
            return toast(<>Sorry the {assetLabel} does not have a git initialised, please contact support to resolve your issue.</>, { type: 'error' })
        }
        try {
            const files = (await listAssetRepository(asset.repository.id, "/"));
            setFiles(formatFileResponse(files.files, files.folders));
        }
        catch (e: any) {
            logger.error('Error during fetchFiles', e);
            handleRequestError(e, { defaultMessage: <>Could not retrieve files, please try again later</> });
        }
        finally {
            if (!withoutLoading) setLoadingFiles(false)
        }
    }
    const fetchAssetVersions = (updateSelectedVersion?: boolean) => {
        setLoadingAssetVersions(true);
        getAssetVersions(asset_id)
            .then((_versions) => {
                const versions = _versions.sort((a, b) => b.version - a.version);
                if(versions[0]){
                    versions[0].latest = true;
                }
                setAssetVersions(versions);
                if(!selectedVersion || updateSelectedVersion){
                    setSelectedVersion(versions[0])
                }
            })
            .finally(() => {
                setLoadingAssetVersions(false);
            })
            
    }

    useEffect(() => {
        fetchAsset()
        fetchAssetVersions()
    }, [asset_id])

    useEffect(() => {
        if(selectedVersion && initialised){
            fetchAsset()
        }
    }, [selectedVersion])

    useEffect(() => {
        fetchFiles()
    }, [ asset ])

    const onAssetUpdate = async (updates: Partial<IAsset>) => {
        
        logger.info("[onAssetUpdate] updating asset")
        if (!asset) {
            logger.error("[onAssetUpdate] no asset")
            return;
        }
        if(updating){
            logger.error("[onAssetUpdate] already updating")
            return;
        }
        setUpdating(true)
        try {
            let updatedAsset: IAsset = { ...asset, ...updates };
            removeEmpty(updatedAsset)
            removeEmpty(updatedAsset.metadata)
            let newAsset = await updateAsset(updatedAsset);
            let mergedAsset = {
                ...asset, ...newAsset
            }
            setAsset(mergedAsset)
            setAssetResponse({
                ...assetResponse,
                draft: mergedAsset
            })
            // logger.info("fetching asset")
            // fetchAsset(true);
        }
        catch (e) {
            logger.error("[onAssetUpdate] error during update", e);
            handleRequestError(e)
        }
        finally {
            setUpdating(false)
        }
    }

    const onLikeClick = useCallback(() => {
        if (asset) {
            setLiking(true)
            likeAsset(asset)
                .then(() => {
                    fetchAsset()
                    .then(()=>{
                        setLiking(false)
                    })
                })
                .catch((e: any) => {
                    logger.error('Error during asset like', e)
                    handleRequestError(e)
                    setLiking(false)
                })
        }
    }, [asset])

    const onBookmarkClick = useCallback(() => {
        if (asset) {
            setBookmarking(true)
            bookmarkAsset(asset)
                .then(() => {
                    fetchAsset()
                    .then(()=>{
                        setBookmarking(false)
                    })
                })
                .catch((e: any) => {
                    logger.error('Error during asset bookmark', e)
                    handleRequestError(e)
                    setBookmarking(false)
                })
        }
    }, [asset])

    const onSubmit = useCallback(()=>{
        if(assetReady && asset){
            let step = assetPublished ? "revalidate" : "submit"
            confirm({
                title: `${step.charAt(0).toUpperCase() + step.slice(1)}`,
                message: <>
                    By confirming you agree to the <a href={termsAndConditionsLink} target='_blank'>Terms & conditions</a>.
                    { 
                        asset.source === SOURCE_TYPE.user &&
                        <>
                            <br/>
                            <br/>
                            { DTEAcknowledgement }
                        </>
                    }
                </>,
                onConfirm: ()=>{
                    setSubmiting(true)
                    submitAsset({...asset })
                    .then(() => {
                        toast(<>Your {assetLabel} has successfully been { asset.status === ASSET_STATUS.creation ? 'submitted' : 'submitted for modification'  }</>, { type: "success" });
                        fetchAsset();
                        
                    })
                    .catch((e: any) => {
                        logger.error('Error during asset onSubmit', e)
                        handleRequestError(e, { defaultMessage: `An error has occured during ${assetLabel} retrieval, please try again later` })
                    })
                    .finally(()=>{
                        setSubmiting(false)
                    })
                }
            })
        }

    }, [ assetReady, asset])


    const getStatus = useCallback(() =>{
        
        switch(asset?.status){
            case ASSET_STATUS.rejected:
                return ( <>The {assetLabel} is <span className="rejected"><FaTimes  /> rejected</span></>)
            case ASSET_STATUS.creation:
                return ( <>The {assetLabel} is <span className="creating"><FaCircleCheck /> creating</span></>)
            case ASSET_STATUS.validation:
                return ( <>The {assetLabel} is <span className="pending"><MdPending />awaiting approval</span></>)
            case ASSET_STATUS.published:
                return ( <>The {assetLabel} is <span className="published"><FaCircleCheck /> published</span></>)
            case ASSET_STATUS.modified:
                return ( <>The {assetLabel} is <span className="modified"><MdPending /> awaiting modification approval</span></>)
            default:
                return ( <>The {assetLabel} is <span>{asset?.status}</span></>)
        }
    }, [ asset, assetLabel ]);

    useEffect(() => {
        // console.log("asset status", asset?.status)

        if(asset?.status && asset?.status !== ASSET_STATUS.published){
            setUpdatingAsset(true)
        }
        else{
            if(updatingAsset){
                fetchAssetVersions(true)
            }
            setUpdatingAsset(false)
        }
    }, [ asset?.status, updatingAsset ])

    const termsAndConditionsLink = useTermsAndConditionsLink();

    return (
        <Page
            id="asset-page"
            fixedHeight
            pageRef={pageRef}
            fixedPageThreshold={1400}
            footer={{ fixed: true }}
        // background2
        >
            <Navigation />
            <div className="fixed-page-content">
                {
                    initialised && asset
                    // && false
                        ?
                        <>
                            <div id="asset-banner" className="section">
                                <div id="asset-banner-content">
                                    <div id="asset-banner-top">
                                        {
                                            !assetPublished &&
                                            <div id="asset-banner-finalise">
                                                Finalise {assetLabel}
                                            </div>
                                        }
                                        {
                                            assetPublished && isOwner &&
                                            <div id="asset-edit-mode">
                                                <ToggleButton value={editMode} onToggle={(editMode) => setEditMode(editMode)} />
                                                <label>Edit mode</label>
                                            </div>
                                        }
                                        {
                                            asset &&
                                            assetPublished &&
                                            <div id="asset-banner-top-right">
                                                {
                                                    loadingAsset &&
                                                    <Loading/>
                                                }
                                                {
                                                    !editMode &&
                                                    asset.source !== SOURCE_TYPE.external &&
                                                    assetVersions &&
                                                    assetVersions.length > 0 &&
                                                    <Select
                                                        id="asset-version-select"
                                                        options={assetVersions?.map((version, idx) => ({ label: `v${version.version}${idx === 0 ? ' (latest)' : ''}`, value: version.version })) || []}
                                                        onChange={(version) => {
                                                            let v = assetVersions?.find((v) => v.version === version)
                                                            setSelectedVersion(v)
                                                            // fetchAsset(v)
                                                        }}
                                                        value={selectedVersion?.version}
                                                    />
                                                }
                                                <div id="asset-banner-buttons">
                                                    <LoginRequired
                                                        small
                                                        message="You must be signed in to like and bookmark"
                                                    >
                                                        <div
                                                            id="asset-banner-like" 
                                                            className={classNames({ "liked": asset.isLiked, "disabled": liking })}
                                                            onClick={onLikeClick}
                                                        >
                                                            {
                                                                liking ? <Loading /> :
                                                                asset.isLiked
                                                                    ? icons.assets.isLiked
                                                                    : icons.assets.isNotLiked
                                                            }
                                                            <div id="asset-banner-like-label">
                                                                {
                                                                    asset.isLiked
                                                                        ? (liking ? <>Unliking...</> : <>Unlike</>)
                                                                        : (liking ? <>Liking...</> : <>Like</>)
                                                                }
                                                            </div>
                                                            <div id="asset-banner-like-count">
                                                                {asset.likes_count || 0}
                                                            </div>
                                                        </div>

                                                        <div 
                                                            id="asset-banner-bookmark" 
                                                            className={classNames({ "bookmarked": asset.isBookmarked, "disabled": bookmarking })}
                                                            onClick={onBookmarkClick}
                                                        >
                                                            {
                                                                asset.isBookmarked
                                                                    ? icons.assets.isBookmarked
                                                                    : icons.assets.isNotBookmarked
                                                            }
                                                        </div>
                                                    </LoginRequired>

                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div id="asset-banner-metadata">
                                        <div id="asset-banner-type">
                                            {assetLabel}
                                        </div>
                                        <div id="asset-banner-header">
                                            {
                                                asset.despUserId &&
                                                <>
                                                    {/* <NavLink id="asset-banner-header-user" to={getUserLink(asset.despUserId)}> */}
                                                        
                                                    <UserLink
                                                        username={asset.despUserId}
                                                    // username={props.post.display_username}
                                                    />
                                                        {/* {asset.despUserId} */}
                                                    {/* </NavLink> */}
                                                    <div id="asset-banner-header-separator">
                                                        /
                                                    </div>
                                                </>
                                            }
                                            <div id="asset-banner-header-title">
                                                {asset.name}
                                            </div>
                                        </div>



                                        {
                                            // isOwner &&
                                            editMode &&
                                            pendingActions && 
                                            <div id="asset-validation">
                                                <div id="asset-pending-actions">
                                                    <div id="asset-pending-action-list" className="simple-scrollbar">
                                                        {
                                                            pendingActions?.map((action, idx) => (
                                                                action.pending
                                                                    ? <div className={classNames({ "pending-action": true, "action-required": action.required })} key={idx}>
                                                                        <div className="pending-action-title">
                                                                            {action.title}
                                                                            {
                                                                                action.required &&
                                                                                <div className="pending-action-required">*</div>
                                                                            }
                                                                        </div>
                                                                        <div className="pending-action-description">
                                                                            {action.description}
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            ))
                                                        }
                                                    </div>
                                                    <div id="asset-usability-score">
                                                        <div id="asset-usability-score-title">
                                                            Pending Actions
                                                        </div>
                                                        {/* <div id="asset-usability-score-content">
                                                            <div id="asset-usability-score-label">
                                                                Usability score:
                                                            </div>
                                                            <div id="asset-usability-score-value">
                                                                <span>{usabilityScore}</span> / {pendingActions.length || 0}
                                                            </div>
                                                        </div> */}
                                                        {
                                                            // !assetPublished &&
                                                            // <div id="asset-usability-score-content">
                                                            //     <div id="asset-usability-score-label">
                                                            //         Publish requirements:
                                                            //     </div>
                                                            //     <div id="asset-usability-score-value">
                                                            //         <span>{requiredActions}</span> / {requiredCount}
                                                            //     </div>
                                                            // </div>
                                                        }

                                                        <div id="asset-status">
                                                            { getStatus() }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                
                                <AssetImage asset={asset} editMode={editMode} pageRef={pageRef}/>

                            </div>

                            <div className="section" id="asset-middle-section">
                                
                                <div id="asset-tabs" className='simple-scrollbar'>
                                    {
                                        tabs?.map((tab, idx) => (
                                            <div
                                                className={classNames({ "asset-tab": true, "selected": selectedTab && selectedTab === tab })}
                                                key={tab.name}
                                                onClick={() => setSelectedTab(tab)}
                                                id={`asset-tab-${tab.name}`}
                                            >
                                                <div className="asset-tab-checkbox" />
                                                <label>{tab.label}</label>
                                            </div>
                                        ))
                                    }
                                </div>

                                <div id="asset-middle-section-right">
                                    {
                                        (
                                            // true ||
                                            updating 
                                        ) && 
                                        <div id="updating-asset">
                                            <span>
                                                <Loading/>
                                            </span>
                                            Updating {assetLabel}...
                                        </div>
                                    }
                                    {
                                        // !assetPublished &&
                                        editMode &&
                                        <div id="submit-section">
                                            <div 
                                                id="submit" className={classNames({ "button medium themed": true, "disabled": !assetReady || submiting })}
                                                onClick={onSubmit}
                                            >
                                                {
                                                    assetPublished
                                                    ?
                                                        submiting
                                                        ? <><Loading/> Revalidating</>
                                                        : <>Revalidate</>
                                                    :
                                                        submiting
                                                        ? <><Loading/> Submiting</>
                                                        : <>Submit</>
                                                }
                                            </div>
                                            {/* <div id="submit-text">
                                            </div> */}
                                        </div>
                                    }
                                </div>

                            </div>


                            <div id="asset-container" className={classNames({ [selectedTab?.name || '']: true })}>
                                <div id="asset-container-content" className="section">

                                    <div id="asset-content" className={classNames({ [selectedTab?.name || '']: true,  "simple-scrollbar": true })}>
                                        {
                                            asset && selectedTab &&
                                            (
                                                selectedTab.name === 'overview'
                                                    ? <Overview 
                                                        asset={asset} editMode={editMode} updateAsset={onAssetUpdate} updating={updating} loadingAssetMetadata={loadingAssetMetadata} 
                                                        assetMetadata={assetMetadata} selectedVersion={selectedVersion}assetVersions={assetVersions} />
                                                    : selectedTab.name === 'details'
                                                        ? <Details 
                                                            asset={asset} editMode={editMode} updateAsset={onAssetUpdate} updating={updating} loadingAssetMetadata={loadingAssetMetadata} assetMetadata={assetMetadata}
                                                            selectedVersion={selectedVersion} assetVersions={assetVersions} />
                                                        : selectedTab.name === 'files'
                                                            ? <Files asset={asset} editMode={editMode} updateAsset={onAssetUpdate} onUpload={fetchFiles} updating={updating} loadingAssetMetadata={loadingAssetMetadata} 
                                                                    assetMetadata={assetMetadata} selectedVersion={selectedVersion} assetVersions={assetVersions} />
                                                            : 
                                                                selectedTab.name === 'options'
                                                                ? <Options 
                                                                    asset={asset} editMode={editMode} updateAsset={onAssetUpdate} updating={updating} loadingAssetMetadata={loadingAssetMetadata} 
                                                                    assetMetadata={assetMetadata} selectedVersion={selectedVersion} assetVersions={assetVersions} />
                                                                : selectedTab.name === 'discussions'
                                                                && <Discussions 
                                                                    asset={asset} editMode={editMode} updateAsset={onAssetUpdate} updating={updating} loadingAssetMetadata={loadingAssetMetadata} 
                                                                    assetMetadata={assetMetadata} selectedVersion={selectedVersion} assetVersions={assetVersions} />
                                            )
                                            // selectedTab.content({ asset, editMode, updateAsset: onAssetUpdate })
                                        }
                                    </div>
                                    <div id="asset-metadata">
                                        {
                                            asset &&
                                            <AssetMetadata 
                                                asset={asset} editMode={editMode} updateAsset={onAssetUpdate} updating={updating} loadingAssetMetadata={loadingAssetMetadata} 
                                                assetMetadata={assetMetadata} selectedVersion={selectedVersion} assetVersions={assetVersions} />
                                        }
                                    </div>
                                </div>

                            </div>



                        </>
                        :
                        <>
                            <div id="asset-banner-loading" className="section loading">
                                <div id="asset-banner-content-loading">
                                    <div id="asset-banner-metadata-loading">
                                        <div id="asset-banner-type-loading" />
                                        <div id="asset-banner-title-loading" />
                                    </div>
                                </div>

                                <div id="asset-banner-image-loading">
                                </div>


                            </div>

                            <div className="section">
                                <div id="asset-tabs-loading">
                                    <div className="asset-loading-tab " />
                                    <div className="asset-loading-tab " />
                                    <div className="asset-loading-tab " />
                                    <div className="asset-loading-tab " />
                                </div>
                            </div>



                            <div id="asset-container-loading">
                                <div id="asset-container-content-loading" className="section">
                                    <div id="asset-content-loading" />
                                    <div id="asset-metadata-loading" />
                                </div>
                            </div>
                        </>
                }
            </div>
        </Page>
    )
}


export default AssetPage;
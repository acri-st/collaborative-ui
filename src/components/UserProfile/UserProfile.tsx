import { ReactNode, useEffect, useState } from 'react';
import './UserProfile.css';
import { getBookmarks, getUserAssets, handleRequestError, IAsset, IPost, IUser, Loading, Logger, Tabs, toast, postUserCount } from '@desp-aas/desp-ui-fwk';
import AssetCardDetailed from '../AssetCardDetailed/AssetCardDetailed';
import AssetCardDetailedLoading from '../AssetCardDetailedLoading/AssetCardDetailedLoading';
import { Route, Routes, useNavigate } from 'react-router-dom';
import UserProfileAvatar from './UserProfileAvatar/UserProfileAvatar';

const logger = new Logger("component", "userProfile");

type IProps = {
    user: IUser
    userPage?: boolean
}
type ProfileAssets = {
    [assetType: string]: IAsset[]
}

export function UserProfile(props: IProps) {
    const [assets, setAssets] = useState<ProfileAssets>({});
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [posts, setPosts] = useState<number|undefined>(undefined);
    const navigate = useNavigate();

    const fetchAssets = async () => {
        setLoadingAssets(true)
        try {
            let _assets = await getUserAssets(props.user.id)
            logger.debug("fetched assets?", _assets, props.user)
            let assets: ProfileAssets = {}
            for (let asset of _assets) {
                if (asset.type in assets)
                    assets[asset.type].push(asset)
                else assets[asset.type] = [asset]
            }
            logger.debug("assets?", assets)
            setAssets(assets);
        }
        catch (e) {
            logger.error("Error during asset fetch", e);
            toast(<>User not found</>, { type: "warning" })
            navigate('/')
        }
        finally {
            setLoadingAssets(false)
        }
    }
    const fetchPosts = async () => {
        setLoadingPosts(true)
        try {
            setPosts(await postUserCount(props.user.id));
        }
        catch (e) {
            logger.error("Error during asset fetch", e);
            handleRequestError(e, { defaultMessage: "An error has occured during post retrieval" })
        }
        finally {
            setLoadingPosts(false)
        }
    }

    useEffect(() => {
        fetchAssets();
        fetchPosts();
    }, [ props.user ]);


    return <div className="user-profile">
            <div className="user-profile-information">
                <div className="user-profile-image-container">
                    <UserProfileAvatar user={props.user} userPage={props.userPage}/>
                </div>
                <div className="user-profile-section user-profile-asset-info-list">
                    {
                        [
                            { label: <>Datasets</>, type: 'dataset' },
                            { label: <>Models</>, type: 'model' },
                            { label: <>Applications</>, type: 'application' },
                        ]
                        .map((r, idx)=>(
                            <div className="user-profile-asset-info" key={r.type}>
                                <label>{r.label}</label>
                                <p>{ loadingAssets ?  <div className="user-profile-asset-info-loading loading"/> : assets[r.type]?.length || 0 }</p>
                            </div>
                        ))
                    }
                </div>
                <div className="user-profile-section user-profile-asset-info-list">
                    {
                        [
                            { label: <>Documents</>, type: 'paper' },
                            { label: <>Courses</>, type: 'course' },
                        ]
                        .map((r, idx)=>(
                            <div className="user-profile-asset-info" key={r.type}>
                                <label>{r.label}</label>
                                <p>{ loadingAssets ? <div className="user-profile-asset-info-loading loading"/> : assets[r.type]?.length || 0 }</p>
                            </div>
                        ))
                    }
                    {
                            <div className="user-profile-asset-info">
                                <label>Posts</label>
                                <p>{ loadingPosts ? <div className="user-profile-asset-info-loading loading"/> : posts || 0 }</p>
                            </div>
                    }
                </div>
                <div className="user-profile-section user-profile-names">
                    <div className="user-profile-name">
                        {props.user.username}
                        {/* {props.user.displayName} */}
                    </div>
                    {/* <div className="user-profile-username">
                        {props.user.username}
                    </div> */}
                </div>
                
            </div>
            <div id="user-profile-container">
                {
                    props.userPage &&
                    <Tabs
                        tabs={[
                            { label: "Assets", path: "/user"  },
                            { label: "Bookmarks", path: "/user/bookmarks"  },
                        ]}
                    />
                }
                <div id="user-profile-content" className="simple-scrollbar">
                    <Routes>
                        <Route path="/"
                            element={
                                <>
                                    <UserProfileAsset
                                        loading={loadingAssets}
                                        title="datasets" 
                                        type="dataset"
                                        assets={assets}
                                    />
                                    <UserProfileAsset
                                        loading={loadingAssets}
                                        title="models"
                                        type="model"
                                        assets={assets}
                                    />
                                    <UserProfileAsset
                                        loading={loadingAssets}
                                        title="applications"
                                        type="application"
                                        assets={assets}
                                    />
                                    <UserProfileAsset
                                        loading={loadingAssets}
                                        title="documents"
                                        type="paper"
                                        assets={assets}
                                    />
                                    <UserProfileAsset
                                        loading={loadingAssets}
                                        title="courses"
                                        type="course"
                                        assets={assets}
                                    />
                                </>
                            }
                        />
                        {
                            props.userPage &&
                            <Route
                                path='/bookmarks'
                                element={<UserBookmarks/>}
                            />
                        }
                        <Route
                            path='*'
                            element={
                                <div className="no-data">
                                    Page not found
                                </div>
                            }
                        />

                    </Routes>
                </div>
            </div>
    </div>
};
export default UserProfile;


const UserBookmarks = () =>{
    const [bookmarks, setBookmarks] = useState<ProfileAssets>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        setLoading(true)
        getBookmarks()
        .then((bookmarks)=>{
            let _bookmarks:ProfileAssets = {
                "dataset": [],
                "model": [],
                "application": [],
                "paper": [],
            };
            for(let b of bookmarks){
                try{
                    _bookmarks[b.type].push(b)
                }
                catch(e){
                    logger.error("error during bookmark parse", e);
                }
            }
            setBookmarks(_bookmarks);
        })
        .catch((e)=>{
            logger.error("get bookmarks error", e)
            handleRequestError(e, { defaultMessage: "An error has occured during bookmark retrieval" })
        })
        .finally(()=>{
            setLoading(false)
        })
    }, [])

    return (
        <>
            {/* <Breadcrumbs
                customBreadcrumbs={[
                    {
                        label: <>User profile</>,
                        onClick: ()=>{ navigate('/user') }
                        
                    },
                    {
                        label: <>Bookmarks</>,
                    }
                ]}
            /> */}
            <UserProfileAsset
                loading={loading}
                title="datasets" 
                type="dataset"
                assets={bookmarks}
            />
            <UserProfileAsset
                loading={loading}
                title="models"
                type="model"
                assets={bookmarks}
            />
            <UserProfileAsset
                loading={loading}
                title="applications"
                type="application"
                assets={bookmarks}
            />
            <UserProfileAsset
                loading={loading}
                title="documents"
                type="paper"
                assets={bookmarks}
            />
            <UserProfileAsset
                loading={loading}
                title="courses"
                type="course"
                assets={bookmarks}
            />
        </>

    )
}


type IUserProfileAssetProps = {
    title: ReactNode
    type: string
    assets: ProfileAssets
    loading?: boolean
}

function UserProfileAsset(props: IUserProfileAssetProps) {
    if(props.loading) return <LoadingUserProfileAsset title={props.title}/>
    return (
        <div className="user-profile-asset">
            <h2>{props.title}</h2>
            <div className="user-profile-asset-list">
                {
                    props.assets && props.type in props.assets &&  props.assets[props.type].length > 0
                        ?
                        props.assets[props.type].map((asset) => (
                            <AssetCardDetailed
                                asset={asset}
                                key={asset.id}
                            />
                        ))
                        :
                        <div className="no-data">
                            No {props.title} yet.
                        </div>
                }
            </div>
        </div>
    )
}

function LoadingUserProfileAsset(props: { title: ReactNode }) {
    return (
        <div className="loading-user-profile-asset">
            <h2>{props.title}</h2>
            <div className="loading-user-profile-asset-list">
                <AssetCardDetailedLoading/>
                <AssetCardDetailedLoading/>
            </div>
        </div>
    )
}

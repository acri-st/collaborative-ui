import './Home.css';

import { ASSET_TYPE, FWKIcons, getAssetTypeLabel, getCounts, handleRequestError, IAsset, ICounters, Logger, Page, searchAssets } from '@desp-aas/desp-ui-fwk';
import { logoCollaborative } from '../../theme/images';

import { useCallback, useEffect, useState } from 'react';
import Navigation from '../../components/Navigation/Navigation';
import bannerBackground from './banner.jpeg';
import { BiNetworkChart } from "react-icons/bi";
import { BsLightningCharge } from "react-icons/bs";
import { LiaConnectdevelop } from "react-icons/lia";
import source1Image from './section-1-image.png';
import AssetCardLoading from '../../components/AssetCardLoading/AssetCardLoading';
import AssetCard from '../../components/AssetCard/AssetCard';
import { ReduxState } from '../../redux';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

const logger = new Logger('HomePage', 'home');

export default () => {
    const [counts, setCounts] = useState<ICounters | undefined>();

    const fetchCounts = async () => {
        logger.info("[fetchesCount] fetching counts")
        try {
            setCounts(await getCounts());
        }
        catch (e) {
            logger.error("[fetchesCount] error fetching counts")
            handleRequestError(e)
        }
    }

    useEffect(() => {
        fetchCounts();
    }, [])


    const withPluralForm = (word: string, amount: number | undefined) => {
        if (amount && amount > 1) {
            return word + 's'
        }
        return word
    }
    return <Page id="home-page">
        <Navigation />
        <div id="home-banner"
            style={{ backgroundImage: `url(${bannerBackground})` }}
        >

            <div id="home-banner-logo">
                <img src={logoCollaborative} />
            </div>

            <div id="home-banner-stats">
                <div className="home-banner-stat">
                    {counts ? counts.dataset : 0} {withPluralForm('Dataset', counts?.dataset)}
                </div>

                <div className="home-banner-stat-separator" />

                <div className="home-banner-stat">
                    {counts ? counts.model : 0} {withPluralForm('Model', counts?.model)}
                </div>

                <div className="home-banner-stat-separator" />

                <div className="home-banner-stat">
                    {counts ? counts.application : 0} {withPluralForm('Application', counts?.application)}
                </div>

                <div className="home-banner-stat-separator" />

                <div className="home-banner-stat">
                    {counts ? counts.paper : 0} {withPluralForm('Document', counts?.paper)}
                </div>
            </div>

            {/* <div id="home-banner-access"> */}
                {/* <div className="home-banner-access">
                    <HiOutlineTrophy/> Success stories
                </div> */}
                {/* <NavLink className="home-banner-access" to="/groups" id="access-groups-link">
                    { icons.groups.icon } Access groups
                </NavLink> */}
            {/* </div> */}
        </div>


        <div id="home-introduction-section">
            <div className="section padding" >
                {/* <div id="home-introduction-title">
                    Welcome to the Collaborative Services Platform
                </div> */}
                <div id="home-introduction-container">
                    <div id="home-introduction-1" className="home-big-text">
                        The <span className="home-highlight-1">ultimate hub</span> for <span className="home-highlight-2">remote sensing</span> enthusiasts, researchers, and professionals!
                    </div>
                    <div id="home-introduction-2" className="home-box-text">
                        Our collaborative platform empowers you with a comprehensive catalog of high-quality datasets, cutting-edge models, versatile applications, and essential documents to 
                        unlock new possibilities in Earth observation and geospatial analysis.
                    </div>
                </div>
            </div>
        </div>

        <div
            id="home-page-section-1-container"
            style={{
                backgroundImage: `url(${source1Image})`
            }}
        >

            <div className="section padding">
                <div id="home-page-section-1">
                    
                {/* Discover, Collaborate, and Innovate in Remote Sensing */}
                    <div id="section-1-buzzwords">
                        <div className="section-1-buzzword">Discover</div>
                        <div className="section-1-buzzword">Collaborate</div>
                        <div className="section-1-buzzword">Innovate</div>
                    </div>
                    <div id="section-1-remote-sensing">Remote Sensing</div>
                </div>

            </div>
        </div>



        <div id="home-services-section">
            <div className="section padding">
                <div id="home-services">
                    {
                        [
                            {
                                title: "Streamlined Access",
                                text: "Explore a vast repository of assets tailored for the remote sensing community.",
                                icon: <LiaConnectdevelop/>
                            },
                            {
                                title: "Collaboration Redefined",
                                text: "Connect with experts, share insights, and co-create solutions in a seamless environment.",
                                icon: <BiNetworkChart/>
                            },
                            {
                                title: "Accelerate Innovation",
                                text: "Leverage advanced tools and resources to transform ideas into impactful results.",
                                icon: <BsLightningCharge/>
                            }                            
                        ].map((s, idx)=>(
                            <div className="home-service" key={idx}>
                                <div className="home-service-icon">{s.icon}</div>
                                <div className="home-service-title">{s.title}</div>
                                <div className="home-service-text">{s.text}</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>


        <div id="home-challange-section">
            <div className="section padding" >
                <div id="home-challange-text" className="home-box-text">
                    Whether you're tackling environmental challenges, advancing scientific research, or developing the next big application, the 
                    Collaborative Services Paltform is your gateway to boundless opportunities in remote sensing.
                </div>
                <div id="home-challange-join" className="home-big-text">
                    Join the <span className="home-highlight-1">community</span> today and shape the future of <span className="home-highlight-2">Earth observation!</span>
                </div>
            </div>
        </div>
        
        
        <div className="section padding" >
            <div className="home-most-liked-assets">
                <div className="home-most-liked-assets-title">
                    Popular <span className="home-highlight-1">datasets</span>
                </div>
                <MostLikedAssetsList asset_type={ASSET_TYPE.dataset}/>
            </div>
        </div>
        
        
        <div className="section padding" >
            <div className="home-most-liked-assets right">
                <div className="home-most-liked-assets-title">
                    Popular <span className="home-highlight-1">Models</span>
                </div>
                <MostLikedAssetsList asset_type={ASSET_TYPE.model}/>
            </div>
        </div>

        <div className="section padding" >
            <div className="home-most-liked-assets">
                <div className="home-most-liked-assets-title">
                    Popular <span className="home-highlight-1">Applications</span>
                </div>
                <MostLikedAssetsList asset_type={ASSET_TYPE.application}/>
            </div>
        </div>

        <div className="section padding" >
            <div className="home-most-liked-assets right">
                <div className="home-most-liked-assets-title">
                    Popular <span className="home-highlight-1">Documents</span>
                </div>
                <MostLikedAssetsList asset_type={ASSET_TYPE.paper}/>
            </div>
        </div>

        <div className="section padding" >
            <div className="home-most-liked-assets">
                <div className="home-most-liked-assets-title">
                    Popular <span className="home-highlight-1">Courses</span>
                </div>
                <MostLikedAssetsList asset_type={ASSET_TYPE.course}/>
            </div>
        </div>
        

        {/* <div id="home-news-section">
            <div id="home-latest-news">
                <LatestNews />
            </div>
            <div id="home-news-description">
                <h2>View <span>Latest</span><br /><span>News</span></h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div>
        </div> */}

    </Page>
};

type IMostLikedAssetsListProps = {
    asset_type: ASSET_TYPE
}
const MostLikedAssetsList = (props: IMostLikedAssetsListProps) =>{
    const [ loading, setLoading] = useState(false)
    const [ assets, setAssets] = useState<IAsset[]|undefined>()

    const appWidth = useSelector((state: ReduxState)=> state.app.width )
    const isMobileMode = () => !!(appWidth && appWidth <= ( 800 ))

    const [mobileMode, setMobileMode] = useState<boolean>(isMobileMode());
    useEffect(()=>{ setMobileMode(isMobileMode()) }, [ appWidth ])

    const [ offset, setOffset ] = useState(0);
    

    const fetchTopDatasets = useCallback(()=>{
        setLoading(true)
        searchAssets({ limit: 12, type: props.asset_type, q: '', sorts: "likes_count" })
        .then((assets)=>{ setAssets(assets.assets) })
        .finally(()=>{ setLoading(false) })
    }, [props.asset_type])

    useEffect(()=>{
        fetchTopDatasets()
    }, [props.asset_type])

    const paginateLeft = useCallback(()=>{
        setOffset((prev)=> prev > 0 ?  prev - 1 : 0 )
    }, [ ])
    const paginateRight = useCallback(()=>{
        if(assets){
            setOffset((prev)=> prev < assets.length - (mobileMode ? 1 : 3) ?  prev + 1 : prev )
        }
    }, [ assets, mobileMode ])

    
    return (
        <div className="home-most-liked-assets-list">
            <div
                className="home-most-liked-assets-container"
            >
                <div
                    className="home-most-liked-assets-items"
                    style={{
                        transform: `translateX( ${ mobileMode ? `calc((${offset} *  (100%)) * -1)` : `calc((${offset} *  (33.33% )) * -1 )`})`
                    }}
                >
                    {
                        
                        loading
                        ? <>
                                <AssetCardLoading/>
                                <AssetCardLoading/>
                                <AssetCardLoading/>
                            </>
                        :
                            assets && 
                            assets.length > 0
                            ?
                                assets.map((a)=>(
                                    <AssetCard asset={a} key={a.id} />
                                ))
                            :
                                <div className="no-data">No {getAssetTypeLabel(props.asset_type)} currently</div>

                    }
                </div>
            </div>
            <div className="home-most-liked-assets-pagination">
                <div 
                    className={classNames({ "home-most-liked-assets-pagination-button": true, "disabled": offset === 0 })}
                    onClick={paginateLeft}
                >
                    { FWKIcons.letterChevronLeft }
                </div>
                <div 
                    className={classNames({ "home-most-liked-assets-pagination-button": true, "disabled": assets && offset >= assets.length - (mobileMode ? 1 : 3) })}
                    onClick={paginateRight}
                >
                    { FWKIcons.letterChevronRight }
                </div>
            </div>
        </div>
    )
}

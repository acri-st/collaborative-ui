import { ASSET_TYPE, CheckList, FWKIcons, IAsset, ICatalogFilters, ICategory, Logger, Page, SearchBar, ToggleButton, getAssetTypeLabel, getCategories, handleRequestError, searchAssets, searchRecommendedAssets, toast } from "@desp-aas/desp-ui-fwk";
import './CatalogPage.css'
import { useCallback, useEffect, useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import classNames from "classnames";
import AssetList from "../../components/AssetList/AssetList";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../redux";
import { defaultFilters, formatSearchFilters, ICatalogPagination, updateCatalogPagination } from "../../utils/catalog";
import { setCatalog } from "../../redux/catalogReducer";
import { CatalogFilters } from "./CatalogFilters/CatalogFilters";

const logger = new Logger("component", "CatalogPage");

const newAssetPage = (asset: string) => {
    return `/form/${asset}`
}


export function CatalogPage() {   
    // Asset type, dataset/paper/model/application
    const { asset_type } = useParams() as { asset_type: ASSET_TYPE };

    // Detailed mode toggle
    const [detailedMode, setDetailedMode] = useState(false);
    const [initState, setInitState] = useState({
        categories: false,
        pagination: false,
        filters: false
    });
    const [initialised, setInitialised] = useState(false);

    const appWidth = useSelector((state: ReduxState)=> state.app.width )
    const { catalogFilters, catalogPagination, catalogSubscriptions } = useSelector((state: ReduxState)=> state.catalog );
    const dispatch = useDispatch()
    
    const [ filters, setFilters ] = useState<ICatalogFilters|undefined>(catalogFilters[asset_type]);
    const [ pagination, setPagination ] = useState<ICatalogPagination|undefined>(catalogPagination[asset_type]);

    // const isMobileMode = () => !!(appWidth && appWidth <= ( asset_type === ASSET_TYPE.course ? 1400 : 1100))
    const isMobileMode = () => !!(appWidth && appWidth <= ( 1100 ))

    const [mobileMode, setMobileMode] = useState<boolean>(isMobileMode());
    useEffect(()=>{ setMobileMode(isMobileMode()) }, [ appWidth ])

    const isScrollMode = () => !!(asset_type === ASSET_TYPE.course ? appWidth && appWidth <= ( 1600 ) : mobileMode );

    const [ scrollMode, setScrollMode ] = useState<boolean>(isScrollMode());
    useEffect(()=>{ setScrollMode(isScrollMode()) }, [ mobileMode, appWidth, asset_type ])

    // FILTERS
    // Filters to be applied. centralized to listen only one variable

    // const [ filters, setFilters ] = useState<ICatalogFilters>({ search: '', sources: [...sourceTypes], categories: [] });

    // list of categories fetched from backend
    const [categories, setCategories] = useState<ICategory[]>();
    // The list of recommended assets
    const [recommendedAssets, setRecommendedAssets] = useState<IAsset[]>();
    // The list of normal assets
    const [assets, setAssets] = useState<IAsset[]>();

    // Using an object because we can trigger useEffect functions even if the value doesn't move
    // const [recommendedAssetOffset, setRecommendedAssetOffset] = useState(0);
    // const [assetOffset, setAssetOffset] = useState(0);
    
    const [recommendedAssetsReachedMax, setRecommendedAssetsReachedMax] = useState(false);
    const [assetsReachedMax, setAssetsReachedMax] = useState(false);

    const [loadingAssets, setLoadingAssets] = useState(false);
    const [loadingRecommendedAssets, setLoadingRecommendedAssets] = useState(false);

    const [searchReady, setSearchReady] = useState(true);

    const [openFilters, setOpenFilters] = useState(false);

    
    const getAssetLimit = useCallback((detailed: boolean) => {
        return detailed || scrollMode ? 20 : asset_type === ASSET_TYPE['course'] ? 4 : 8;
        // return detailed ? 20 : asset_type === ASSET_TYPE['course'] ? 2 : 8;
    }, [ asset_type ])
    // detailed ? 50 : 8;

    /* INIT */
    useEffect(() => {
        setInitialised(false);
        setInitState({
            categories: false,
            pagination: false,
            filters: false
        })
        setAssets(undefined);
        setRecommendedAssets(undefined);
        if (asset_type) {
            fetchCategories()
        }
    }, [asset_type])
    

    useEffect(()=>{
        setInitialised(Object.values(initState).every((v)=> v));
    }, [ initState ])
    
    useEffect(()=>{
        setFilters(catalogFilters[asset_type])
        setInitState((prev)=>({ ...prev, filters: true }))
    }, [ catalogFilters, asset_type ])
    useEffect(()=>{
        setPagination(catalogPagination[asset_type])
        setInitState((prev)=>({ ...prev, pagination: true }))
    }, [ catalogPagination, asset_type ])

    const checkSearchReady = () => {
        return !!(
            filters &&
            filters.categories.length > 0
            && filters.sources.length > 0
            && !!asset_type
        )
    }

    useEffect(() => {
        let searchReady = checkSearchReady();
        logger.info("searchReady", searchReady)
        setSearchReady(searchReady)
    }, [filters, asset_type]);


    useEffect(() => {
        if(initialised){
            fetchAssets(),
            fetchRecommendedAssets()
        }
    }, [initialised, filters, detailedMode ])

    const fetchCategories = useCallback(()=>{
        getCategories(asset_type !== ASSET_TYPE['course'] ? asset_type as ASSET_TYPE : undefined)
        .then((categories) => { 
            logger.info("Categories result", categories); 
            setCategories(categories);
            let filters = catalogFilters[asset_type];
            if(!filters || filters.categories.length === 0){
                let selectedCategories = categories.map((c) => c.id)
                // selectedCategories = selectedCategories.filter((c)=> filters.categories.includes(c) )
                updateFilters('categories', selectedCategories)
            }
        })
        .catch((e)=>{
            logger.error("get categories error", e)
            handleRequestError(e, { defaultMessage: "An error has occured during category retrieval, please try again later" })
        })
        .finally(()=>{
            setInitState((prev)=>({ ...prev, categories: true }));
        })
    }, [asset_type])


    const updateFilters = useCallback((key: keyof ICatalogFilters, value: any)=>{
        let prev = { ...catalogFilters }

        // dispatch(setCatalog(resetCatalogSubscription(catalogSubscriptions, asset_type)))
        dispatch(setCatalog(updateCatalogPagination(catalogPagination, asset_type, { assetOffset: 0, recommendedAssetOffset: 0 })))
        
        if(!(asset_type in prev)){
            prev[asset_type] = {
                ...defaultFilters(),
                [key]: value
            }
        }
        else{
            prev[asset_type] = {
                ...prev[asset_type],
                [key]: value
            }
        }
        prev[asset_type].subscription = undefined;

        dispatch(setCatalog({ catalogFilters: prev }))
    }, [ catalogFilters, asset_type ])

    const formatAssets = (assets: IAsset[]) => assets.forEach((a)=> a.type = asset_type )

    const getRecommendedLimit = (currentOffset: number) => (!detailedMode && !scrollMode && currentOffset === 0 && asset_type !== ASSET_TYPE['course']) 
        ? 5 
        : getAssetLimit(detailedMode);


    const getFilters = useCallback((params: { limit: number, offset: number })=>{
        let { limit, offset } = params;

        return {
            count: true,
            limit: (scrollMode || detailedMode) ? limit + offset : limit, 
            offset: (scrollMode || detailedMode) ? 0 : offset, 

            ...formatSearchFilters({
                search: filters?.search || '',
                type: asset_type,
                categories: filters?.categories || [],
                sources: filters?.sources,
                metadata: filters?.metadata,
                geo: filters?.geo
            })
        }
    }, [ asset_type, filters, scrollMode, detailedMode ])


    async function fetchRecommendedAssets(_offset?: number) {
        console.warn("[searchRecommendedAssets] called")
        if (!checkSearchReady() || !pagination) { 
            console.warn("[searchRecommendedAssets] Search is not ready")
            return setRecommendedAssets(undefined);
        }
        setLoadingRecommendedAssets(true);
        try {
            let offset = _offset === undefined ? pagination?.recommendedAssetOffset : _offset;
            let limit = getRecommendedLimit(offset);
            logger.info("[searchRecommendedAssets] Searching recommended assets", { offset, limit, detailedMode, scrollMode })
            let res = await searchRecommendedAssets(getFilters({ limit, offset }));
            let _assets = res.assets;
            let count = res.count;

            formatAssets(_assets)
            logger.info("[searchRecommendedAssets] result", _assets)

            logger.info("[searchRecommendedAssets] Updating current")
            if (count <= limit + offset) {
                setRecommendedAssetsReachedMax(true);
            }
            else {
                setRecommendedAssetsReachedMax(false);
            }
            setRecommendedAssets(_assets)
        }
        catch (e) {
            logger.error("Error during recommended asset fetch", e)
            handleRequestError(e, { defaultMessage: "An error has occured during recommended asset retrieval, please try again later" })
        }
        finally {
            setLoadingRecommendedAssets(false);
        }
    }

    async function fetchAssets(_offset?: number, append?: boolean) {
        if (!checkSearchReady() || !pagination) {
            return setAssets(undefined);
        }
        setLoadingAssets(true)
        try {
            let offset = _offset === undefined ? pagination?.assetOffset : _offset;
            let limit = getAssetLimit(detailedMode);
            logger.info("[fetchAssets] Searching assets", { offset, limit });

            let res = await searchAssets(getFilters({ limit, offset }));
            let _assets = res.assets;
            let count = res.count;

            console.log("_assets", _assets)

            if(_assets){
                formatAssets(_assets)
                
    
                logger.info("[fetchAssets] results", assets)
    
                if ( count <= limit + offset ) {
                    setAssetsReachedMax(true);
                }
                else {
                    setAssetsReachedMax(false);
                }
                setAssets(_assets)
            }
            else{
                throw new Error('Missing response in search')
            }
            
        }
        catch (e) {
            logger.error("Error during asset fetch", e)
            handleRequestError(e, { defaultMessage: "An error has occured during asset retrieval, please try again later" })
        }
        finally {
            setLoadingAssets(false)
        }
    }



    const recommendedAssetsNext = () => {
        if (!recommendedAssetsReachedMax && pagination) {
            let newOffset = pagination.recommendedAssetOffset + getRecommendedLimit(pagination.recommendedAssetOffset);
            dispatch(setCatalog(updateCatalogPagination(catalogPagination, asset_type, { recommendedAssetOffset: newOffset })))
            fetchRecommendedAssets(newOffset);
        }
    }

    const recommendedAssetsPrevious = () => {
        if ( pagination && pagination.recommendedAssetOffset > 0 ) {
            let newOffset = pagination.recommendedAssetOffset - getRecommendedLimit(pagination.recommendedAssetOffset);
            newOffset = newOffset > 0 ? newOffset : 0;
            dispatch(setCatalog(updateCatalogPagination(catalogPagination, asset_type, { recommendedAssetOffset: newOffset })))
            fetchRecommendedAssets(newOffset)
        }
        else {
            logger.error("[recommendedAssetsPrevious] cannot go previous")
        }
    }

    const assetsNext = () => {
        if (!assetsReachedMax && pagination) {
            let newOffset = pagination.assetOffset + getAssetLimit(detailedMode);
            dispatch(setCatalog(updateCatalogPagination(catalogPagination, asset_type, { assetOffset: newOffset })))
            fetchAssets(newOffset);
        }
    }

    const assetsPrevious = () => {
        if (pagination && pagination.assetOffset > 0) {
            let newOffset = pagination.assetOffset - getAssetLimit(detailedMode);
            newOffset = newOffset > 0 ? newOffset : 0;
            dispatch(setCatalog(updateCatalogPagination(catalogPagination, asset_type, { assetOffset: newOffset })))
            fetchAssets(newOffset);
        }
    }

    const toggleFilter = useCallback(()=>{
        setOpenFilters(!openFilters)
    }, [ openFilters ])

    const closeFilters = useCallback(()=>{
        setOpenFilters(false)
    }, [])
    

    return (
        <Page
            id="catalog-page"
            fixedHeight
            background2
            footer={{ fixed: true }}
        >
            <Navigation />
            <div className="fixed-page-content">
                <div id="catalog-page-content" className={classNames({ "catalog-filter-mobile": mobileMode, [`asset-type-${asset_type}`]: true })}>
                    {/* <div id="catalog-left-side" > */}
                        <CatalogFilters
                            asset_type={asset_type}
                            loadingAssets={loadingAssets}
                            loadingRecommendedAssets={loadingRecommendedAssets}
                            // filters={filters}
                            updateFilters={updateFilters}
                            searchReady={searchReady}
                            categories={categories || []}
                        />
                    {/* </div> */}
                    <div id="catalog-right-side">
                        <div id="catalog-right-side-top-banner">
                            {
                                asset_type !== ASSET_TYPE['course'] &&
                                <ToggleButton label="VIEW DETAILED" value={detailedMode} id="catalog-page-toggle-detailed" onToggle={setDetailedMode} />
                            }

                            <Link className="button create-button" id="new-asset" to={newAssetPage(asset_type)}>
                                {FWKIcons.createButton} New {getAssetTypeLabel(asset_type)}
                            </Link>
                        </div>
                        <div className="catalog-results">
                            <h2 className="header-2">Recommendations</h2>
                            <div className="catalog-results-list">
                                {
                                    !searchReady ?
                                        <div className="no-data">
                                            {FWKIcons.warning} Missing required filters
                                        </div>
                                        :
                                        <AssetList
                                            scrollMode={scrollMode}
                                            assets={recommendedAssets}
                                            detailedMode={detailedMode}
                                            asset_type={asset_type}
                                            // highlightFirst={(filters && filters.recommendedAssetOffset === 0)}
                                            highlightFirst={(pagination && pagination.recommendedAssetOffset === 0)}
                                            loadingAssets={loadingRecommendedAssets}
                                            // next={recommendedAssetsReachedMax ? undefined : recommendedAssetsNext}
                                            // previous={(filters && filters.recommendedAssetOffset) !== 0 ? recommendedAssetsPrevious : undefined}
                                            next={recommendedAssetsReachedMax ? undefined : recommendedAssetsNext}
                                            previous={(pagination && pagination.recommendedAssetOffset) !== 0 ? recommendedAssetsPrevious : undefined}
                                        />
                                }
                            </div>
                        </div>
                        <div className="catalog-results">
                            <h2 className="header-2">Results</h2>
                            <div className="catalog-results-list">
                                {

                                    !searchReady ?
                                        <div className="no-data">
                                            {FWKIcons.warning} Missing required filters
                                        </div>
                                        :
                                        <AssetList
                                            scrollMode={scrollMode}
                                            assets={assets}
                                            asset_type={asset_type}
                                            detailedMode={detailedMode}
                                            loadingAssets={loadingAssets}
                                            // next={(assetsReachedMax ? undefined : assetsNext)}
                                            // previous={(filters && filters.assetOffset !== 0) ? assetsPrevious : undefined}

                                            next={assetsReachedMax ? undefined : assetsNext}
                                            previous={(pagination && pagination.assetOffset !== 0) ? assetsPrevious : undefined}
                                        />
                                }
                            </div>
                        </div>



                    </div>
                </div>
            </div>
        </Page>
    )
}
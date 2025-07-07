import { useDispatch, useSelector } from "react-redux"
import { defaultCatalogFilters, IAssetFilter, resetCatalogSubscription, updateCatalogFilters, updateCatalogPagination } from "../../../utils/catalog"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ReduxState } from "../../../redux"
import { ASSET_TYPE, FWKIcons, getAssetTypeLabel, getMetadatas, ICatalogFilters, ICategory, Loading, Logger, SearchBar, SOURCE_TYPE, sourceTypeLabel, sourceTypes } from "@desp-aas/desp-ui-fwk"
import { FilterTitle } from "../../../components/FilterTitle/FilterTitle";
import { icons } from "../../../utils/icons"
import classNames from "classnames"
import "./CatalogFilters.css"
import { RxCrossCircled } from "react-icons/rx";
import Blurable from "@desp-aas/desp-ui-fwk/src/components/Blurable/Blurable"
import { CatalogFilter } from "../CatalogFilter/CatalogFilter"
import { setCatalog } from "../../../redux/catalogReducer"
import { CatalogSubscriptions } from "../CatalogSubscriptions/CatalogSubscriptions"
import { CatalogMap } from "../CatalogMap/CatalogMap"
import { CategoryFilter } from "../../../components/CategoryFilter/CategoryFilter"

const logger = new Logger("component", "CatalogFilters");

export type IUpdateCatalogFilters = (key: keyof ICatalogFilters, value: any)=>any

export type ICatalogFiltersProps = {
    updateFilters: IUpdateCatalogFilters
    loadingAssets: boolean
    loadingRecommendedAssets: boolean
    searchReady: boolean
    categories: ICategory[]
    asset_type: ASSET_TYPE
}


export const CatalogFilters = (props: ICatalogFiltersProps) =>{
    const { catalogFilters, catalogSubscriptions, catalogPagination } = useSelector((state: ReduxState)=> state.catalog );
    const [ filters, setFilters ] = useState<ICatalogFilters|undefined>(catalogFilters[props.asset_type]);
    const [ toggled, setToggled ] = useState(false);
    const [ filtersOpen, setFiltersOpen ] = useState(false);
    const [ loadingAssetFilters, setLoadingAssetFilters ] = useState(false);

    const [ allAssetFilters, setAllAssetFilters ] = useState<IAssetFilter[]|undefined>(undefined);
    const [ generalFilters, setGeneralFilters ] = useState<IAssetFilter[]|undefined>(undefined);
    const [ assetFilters, setAssetFilters ] = useState<IAssetFilter[]|undefined>(undefined);

    const [ additionalFilters, setAdditionalFilters ] = useState<{[filter:string]: any}>({});
    const subscribeSelectRef = useRef<HTMLDivElement>(null);
    const [ blurExceptions, setBlurExceptions ] = useState<React.RefObject<HTMLDivElement>[]>([subscribeSelectRef]);

    const dispatch = useDispatch();

    const toggleFilter = useCallback(()=>{
        setFiltersOpen(!filtersOpen);
    }, [ filtersOpen ])
    
    const closeFilters = useCallback(()=>{
        setFiltersOpen(false);
    }, [ filtersOpen ])
    
    useEffect(()=>{
        setFilters(catalogFilters[props.asset_type])
    }, [ catalogFilters, props.asset_type ])


    const onSourceToggle = useCallback(async function (source: SOURCE_TYPE) {
        if (props.loadingAssets || props.loadingRecommendedAssets) return;
        if (filters && filters?.sources.length === sourceTypes.length) {
            props.updateFilters('sources', [source])
        }
        else if (filters?.sources.includes(source))
            props.updateFilters('sources', (filters?.sources.filter((s) => s !== source) || []))
        else
            props.updateFilters('sources', [...(filters?.sources || []), source])

    }, [filters, props.loadingAssets, props.loadingRecommendedAssets]);

    
    const fetchFilters = useCallback(()=>{
        // setAllAssetFilters(example)

        setLoadingAssetFilters(true)
        getMetadatas()
        .then((filters) => { 
            logger.info("Filters result", filters); 
            setAllAssetFilters(filters);
        })
        .finally(()=>{
            setLoadingAssetFilters(false);
        })
        
    }, [])

    useEffect(()=>{
        setAdditionalFilters({})
    }, [props.asset_type])

    useEffect(()=>{
        setGeneralFilters(allAssetFilters?.filter((f)=> (f.asset_type  === undefined || f.asset_type === null) && f.queryable))
        setAssetFilters(allAssetFilters?.filter((f)=> f.asset_type?.includes(props.asset_type) && f.queryable))
    }, [props.asset_type, allAssetFilters])

    useEffect(()=>{
        fetchFilters()
    }, [])

    const closeAllFilters = useCallback(()=>{
        setToggled(false);
        setAdditionalFilters({})
    }, [])


    const addBlurException = useCallback((ref: React.RefObject<HTMLDivElement>)=>{
        setBlurExceptions((blurExceptions)=>[...blurExceptions, ref])
    }, [])

    const removeBlurException = useCallback((ref: React.RefObject<HTMLDivElement>)=>{
        setBlurExceptions((blurExceptions)=>blurExceptions.filter((r) => r !== ref))
    }, [])

    const resetFilters = useCallback(()=>{
        dispatch(setCatalog(resetCatalogSubscription(catalogSubscriptions, props.asset_type)))
        dispatch(setCatalog(updateCatalogPagination(catalogPagination, props.asset_type, { assetOffset: 0, recommendedAssetOffset: 0 })))
        dispatch(setCatalog(updateCatalogFilters(catalogFilters, props.asset_type, defaultCatalogFilters(props.asset_type, props.categories))))
    }, [catalogFilters, catalogSubscriptions, catalogPagination, props.asset_type, props.categories])

    const updateAdditionalFilters = useCallback((updates: {[filter:string]: any})=>{

        setAdditionalFilters((additionalFilters)=>{
            let newAdditionalFilters = { ...additionalFilters }
            for(let key in updates){
                if(updates[key] === filters?.metadata?.[key])
                    delete newAdditionalFilters[key]
                else
                    newAdditionalFilters[key] = updates[key]
            }
            return newAdditionalFilters;
        })

    }, [filters])

    const additionalFiltersReady = useMemo(()=>{
        return Object.keys(additionalFilters).length > 0
    }, [additionalFilters])

    const applyAdditionalFilters = useCallback(()=>{
        if (!additionalFiltersReady) return;        
        let prev = { ...catalogFilters }
        if(prev[props.asset_type]){
            prev[props.asset_type] = {
                ...prev[props.asset_type],
                metadata: {
                    ...(prev[props.asset_type].metadata || {}),
                    ...(additionalFilters),
                    subscription: undefined
                }
            }
        }

        // dispatch(setCatalog(resetCatalogSubscription(catalogSubscriptions, props.asset_type)))
        dispatch(setCatalog(updateCatalogPagination(catalogPagination, props.asset_type, { assetOffset: 0, recommendedAssetOffset: 0 })))
        dispatch(setCatalog({ catalogFilters: prev }))
        setAdditionalFilters({})
    }, [additionalFiltersReady, additionalFilters, catalogFilters, props.asset_type]);


    return (
        <div id="catalog-filters" className={classNames({ "toggled": filtersOpen })}>

            <Blurable
                id="catalog-filters-container"
                onBlurCb={closeFilters}
                blurExceptions={blurExceptions}
            >
                <div
                    id="catalog-filter-toggle"
                    className="button themed icon-only"
                    onClick={toggleFilter}
                >
                    { icons.filter }
                </div>
                <div id="catalog-filters-content">

                    <CatalogSubscriptions 
                        searchReady={props.searchReady}
                        assetType={props.asset_type}
                        categories={props.categories}
                        subscribeSelectRef={subscribeSelectRef}
                    />
                    
                    <SearchBar
                        id="catalog-page-search"
                        value={filters?.search || ''}
                        onChange={(search)=> props.updateFilters('search', search) }
                        disabled={!props.searchReady}
                        loading={props.loadingAssets || props.loadingRecommendedAssets}
                        validation={[
                            { description: 'You must type at least 4 characters.', validation: (tempSearch)=> tempSearch.length > 3 }
                        ]}
                        // searchCallback={searchAllAssets}
                    />
                    
                    {
                        props.asset_type !== ASSET_TYPE['course'] &&
                        <div className="catalog-filter-box">
                            <FilterTitle>Source</FilterTitle>
                            <div className="catalog-filter-box-form">
                                <div id="catalog-filter-source-list">
                                    {
                                        sourceTypes.map((source: SOURCE_TYPE, idx: number) => (
                                            <div
                                                key={source}
                                                className={classNames({
                                                    "catalog-filter-source": true,
                                                    "selected": filters && filters.sources.includes(source),
                                                    "disabled": props.loadingAssets || props.loadingRecommendedAssets
                                                })}
                                                onClick={() => onSourceToggle(source)}
                                            >
                                                <div className="catalog-filter-source-icon">
                                                    {icons.source[source]}
                                                </div>
                                                <label> {sourceTypeLabel(source)} </label>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    
                    <CategoryFilter
                        categories={props.categories}
                        values={filters?.categories || []}
                        onChange={(categories)=> props.updateFilters('categories', categories) }
                        disabled={props.loadingAssets || props.loadingRecommendedAssets}
                    />

                    <CatalogMap asset_type={props.asset_type} />
                    
                    <div id="catalog-filters-buttons">

                        <div className="button themed medium" id="all-filters-button" onClick={()=> setToggled(!toggled)}>
                            { icons.filter } All filters
                        </div>

                        <div 
                            className={classNames({
                                "button blue medium inverted": true,
                                "disabled": (
                                    filters?.search === ''
                                    && filters?.geo === undefined
                                    && filters?.sources.length === sourceTypes.length
                                    && filters?.categories.length === props.categories.length
                                    && Object.values(filters?.metadata || {}).filter((m)=>m !== undefined).length === 0
                                )
                            })}
                            id="filters-reset-button"
                            onClick={resetFilters}
                        >
                            { FWKIcons.refresh } Reset
                        </div>

                    </div>


                    <Blurable 
                        id="all-filters" 
                        className={classNames({ "toggled": toggled })}
                        onBlurCb={closeAllFilters}
                        blurExceptions={blurExceptions}
                    >
                        <div id="all-filters-header">
                            <div id="all-filters-title">
                                <span>{ icons.filter }</span> <span>All</span> filters 
                            </div>
                            <div id="all-filters-close-button" onClick={()=> setToggled(!toggled)}>
                                <RxCrossCircled />
                            </div>
                        </div>
                        <div id="all-filters-container">
                            <FilterTitle>General</FilterTitle>
                            {
                                filters &&
                                generalFilters?.map((f)=> (
                                    <CatalogFilter
                                        key={f.id}
                                        filter={f}
                                        filters={filters}
                                        additionalFilters={additionalFilters}
                                        updateFilters={updateAdditionalFilters}
                                        asset_type={props.asset_type}
                                        addRef={addBlurException}
                                        removeRef={removeBlurException}
                                    />
                                ))
                            }

                            <FilterTitle>{getAssetTypeLabel(props.asset_type)}</FilterTitle>
                            {
                                filters &&
                                assetFilters?.map((f)=> (
                                    <CatalogFilter
                                        key={f.id}
                                        filter={f}
                                        filters={filters}
                                        additionalFilters={additionalFilters}
                                        updateFilters={updateAdditionalFilters}
                                        asset_type={props.asset_type}
                                        addRef={addBlurException}
                                        removeRef={removeBlurException}
                                    />
                                ))
                            }

                        </div>
                        <div id="all-filters-operations">
                            <div 
                                className={classNames({
                                    "button inverted medium": true,
                                    "disabled": !additionalFiltersReady || props.loadingAssets || props.loadingRecommendedAssets
                                })}
                                onClick={applyAdditionalFilters}
                            >
                                { props.loadingAssets || props.loadingRecommendedAssets ? <><Loading /> Applying...</> : "Apply" }
                            </div>
                            
                        </div>
                    </Blurable>
                </div>
                {/* <div
                    id="catalog-filter-apply"
                    className={classNames({
                        "button themed medium": true,
                        // "disabled": !updatedFilters
                    })}
                    onClick={applyFilters}
                >
                    { FWKIcons.confirm } apply
                </div> */}
            </Blurable>
        </div>
    )
}
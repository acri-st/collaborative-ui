import { CheckList, FWKIcons, ICategory, IGroup, IGroupFilters, Logger, Page, getCategories, handleRequestError, newGroupPage, searchGroups } from "@desp-aas/desp-ui-fwk";
import './GroupsPage.css'
import { useCallback, useEffect, useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { icons } from "../../utils/icons";
import { Link } from "react-router-dom";
import { FilterTitle } from "../../components/FilterTitle/FilterTitle";
import classNames from "classnames";
import GroupList from "../../components/GroupList/GroupList";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../redux";
import Blurable from "@desp-aas/desp-ui-fwk/src/components/Blurable/Blurable";
import { setReduxGroups } from "../../redux/groupsReducer";

const logger = new Logger("component", "GroupsPage");

const getGroupLimit = (paginationMode?: boolean) =>
    paginationMode ? 2 : 10;

export function GroupsPage() {        
    const [initialised, setInitialised] = useState(false);
    // FILTERS
    // Filters to be applied. centralized to listen only one variable
    const { filters } = useSelector((state: ReduxState)=> state.groups)
    // list of categories fetched from backend
    const [categories, setCategories] = useState<ICategory[]>([]);
    
    const appWidth = useSelector((state: ReduxState)=> state.app.width )
    const [mobileMode, setMobileMode] = useState<boolean>(!!(appWidth && appWidth <= 1300));
    useEffect(()=>{ setMobileMode(!!(appWidth && appWidth <= 1300)) }, [ appWidth ])

    // The list of recommended groups
    const [recommendedGroups, setRecommendedGroups] = useState<IGroup[]>();
    // The list of normal groups
    const [groups, setGroups] = useState<IGroup[]>();

    // Using an object because we can trigger useEffect functions even if the value doesn't move
    const [recommendedGroupOffset, setRecommendedGroupOffset] = useState(0);
    const [groupOffset, setGroupOffset] = useState(0);

    const [recommendedGroupsReachedMax, setRecommendedGroupsReachedMax] = useState(false);
    const [groupsReachedMax, setGroupsReachedMax] = useState(false);


    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingRecommendedGroups, setLoadingRecommendedGroups] = useState(false);

    const [searchReady, setSearchReady] = useState(true);
    const [openFilters, setOpenFilters] = useState(false);

    const dispatch = useDispatch()


    /* INIT */
    // useEffect(() => {
    //     getCategories()
    //         .then((categories) => { 
    //             logger.info("Categories result", categories); 
    //             setCategories(categories); 
    //             updateFilters('categories', categories.map((c) => c.id))
    //         })
    //         .catch((e)=>{
    //             logger.error("get categories error", e)
    //             handleRequestError(e, <>An error has occured during category retrieval, please try again later</>)
    //         })
    // }, [])

    /* INIT */
    useEffect(() => {
        setGroups(undefined);
        setInitialised(false);
        getCategories()
            .then((categories) => { 
                logger.info("Categories result", categories); 
                logger.info("filters", filters); 
                setCategories(categories);
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
            .finally(()=>{ setInitialised(true); })
    }, [])


    const updateFilters = useCallback((key: keyof IGroupFilters, value: any)=>{
        dispatch(setReduxGroups({
            filters: {
                ...filters,
                [key]: value
            }
        }))
    }, [ filters ])

    const elementFilter = useCallback((a: any) => {
        return (
            true ||
            (filters.categories.length > 0
                ? a.categoryId !== undefined ? filters.categories.includes(typeof a.categoryId === 'number' ? a.categoryId : parseInt(a.categoryId)) : false
                : true
            )
            // && (filters.search !== '' ? a.name.toLowerCase().includes(filters.search) : true)
        )
    }, [ filters ])

    async function fetchGroups(_offset?: number) {
        if (!isSearchReady()) {
            return setGroups(undefined);
        }
        setLoadingGroups(true)
        try {
            let offset = _offset === undefined ? groupOffset : _offset;
            let limit = getGroupLimit();

            logger.info("[fetchGroups] Searching groups", { ...filters, offset, limit })

            let _groups = (await searchGroups({q: 
                filters.search, limit, offset, 
                categories: !(filters && categories) ? undefined : filters?.categories.length > 0 && filters.categories.length !== categories.length ? filters.categories.join(',') : undefined,
            }))
            // await sleep(500);
            // let _groups = tests

            _groups = _groups.filter(elementFilter);

            logger.info("[fetchGroups] Base groups", [..._groups])

            logger.info("[fetchGroups] results", groups)

            // Check if we have reached the max
            if (
                _groups.length === 0 && offset > 0
            ) {
                setGroupsReachedMax(true);
                if(!mobileMode){
                    setGroupOffset(offset - limit);
                }
                else{
                    setGroups(_groups)
                }
            }
            else {
                if (_groups.length < limit) {
                    setGroupsReachedMax(true);
                }
                else {
                    setGroupsReachedMax(false);
                }
                setGroups(_groups)
            }
        }
        catch (e) {
            logger.error("Error during group fetch", e)
            handleRequestError(e, { defaultMessage: <>An error has occured during group retrieval, please try again later</> })
        }
        finally {
            setLoadingGroups(false)
        }
    }

    const isSearchReady = () =>{
        let isReady = (
            filters.categories.length > 0
            // && (search === '' ? true : search.length > 4)
        )
        // if (!isReady) logger.warn("Not ready for search", {
        //     "filters.categories && filters.categories.length > 0 ": filters.categories && filters.categories.length > 0,
        //     "filters.sources.length > 0": filters.sources.length > 0,
        //     "!!group_type": !!group_type
        // })
        return isReady;

    }

    useEffect(() => {
        setSearchReady(isSearchReady())
    }, [filters]);


    const searchAllGroups = useCallback(async () => {
        console.log("Searching all groups?")
        setGroupOffset(0);
        // setRecommendedGroupOffset(0);

        await Promise.all([
            fetchGroups(0),
            // fetchRecommendedGroups(0)
        ])

    }, [filters])

    useEffect(() => {
        if(initialised){
            searchAllGroups();
        }
    }, [initialised, filters?.categories, searchReady])

    const groupsNext = () => {
        if (!groupsReachedMax) {
            let newOffset = recommendedGroupOffset + getGroupLimit(true);
            setGroupOffset(newOffset);
            fetchGroups(newOffset);
        }
    }


    // const recommendedGroupsNext = () => {
    //     if (!recommendedGroupsReachedMax) {
    //         let newOffset = recommendedGroupOffset + (recommendedGroupOffset === 0 ? 5 : getGroupLimit(true));
    //         setRecommendedGroupOffset(newOffset);
    //         fetchRecommendedGroups(newOffset);
    //     }
    // }

    // const recommendedGroupsPrevious = () => {
    //     if (recommendedGroupOffset > 0) {
    //         let newOffset = recommendedGroupOffset - (recommendedGroupOffset === 5 ? 5 : getGroupLimit(true))
    //         setRecommendedGroupOffset(newOffset);
    //         fetchRecommendedGroups(newOffset)
    //     }
    //     else {
    //         logger.error("[recommendedGroupsPrevious] cannot go previous")
    //     }
    // }

    const toggleFilter = useCallback(()=>{
        setOpenFilters(!openFilters)
    }, [ openFilters ])

    const closeFilters = useCallback(()=>{
        setOpenFilters(false)
    }, [])

    return (
        <Page
            id="groups-page"
            fixedHeight
            background2
            footer={{ fixed: true }}
        >
            <Navigation />
            <div className="fixed-page-content">
                <div id="groups-page-content" className={classNames({ "group-filter-mobile": mobileMode })}>
                    <div
                        id="group-left-side"
                        className={classNames({ "toggled": openFilters })} 
                    >
                        <Blurable 
                            id="group-filters"
                            onBlurCb={closeFilters} 
                            className={classNames({ "toggled": openFilters })}
                        >
                            <div
                                id="group-filter-toggle"
                                className="button themed icon-only"
                                onClick={toggleFilter}
                            >
                                { icons.filter }
                            </div>
                            {/* <SearchBar
                                id="groups-page-search"
                                value={filters.search}
                                onChange={(search)=> updateFilters('search', search) }
                                disabled={!searchReady}
                                loading={loadingGroups || loadingRecommendedGroups}
                                validation={[
                                    { description: 'You must type at least 4 characters.', validation: (tempSearch)=> tempSearch.length > 3 }
                                ]}
                                // searchCallback={searchAllGroups}
                            /> */}

                            <div className="group-filter-box" id="group-filter-categories">
                                <FilterTitle>Category</FilterTitle>
                                <div className="group-filter-box-form">
                                    <CheckList
                                        disabled={loadingGroups || loadingRecommendedGroups}
                                        toggleAllLabel="All categories"
                                        options={categories.map((c) => {
                                            return { label: c.name, value: c.id }
                                        })}
                                        onChange={(categories)=> updateFilters('categories', categories) }
                                        values={filters.categories}
                                        toggleAll
                                    />
                                </div>
                            </div>

                        </Blurable>


                    </div>
                    <div id="group-right-side">
                        <div id="group-right-side-top-banner">

                            <Link className="button create-button" id="new-group-button" to={newGroupPage}>
                                {FWKIcons.createButton} New group
                            </Link>
                        </div>
                        <div className="group-results" id="group-list">
                            <div className="group-results-list">
                                {
                                    !searchReady ?
                                        <div className="no-data">
                                            {FWKIcons.warning} Missing required filters
                                        </div>
                                        :
                                        <GroupList
                                            groups={groups}
                                            loading={loadingGroups}
                                            next={ !groupsReachedMax ? groupsNext : undefined}
                                        />
                                }
                            </div>
                        </div>
                        {/* <div className="group-results" id="group-list-recommendations">
                            <h2 className="header-2">Recommendations</h2>
                            <div className="group-results-list">
                                {
                                    !searchReady ?
                                        <div className="no-data">
                                            {FWKIcons.warning} Missing required filters
                                        </div>
                                        :
                                        <GroupList
                                            groups={recommendedGroups}
                                            loading={loadingRecommendedGroups}
                                            paginationMode
                                            next={recommendedGroupsReachedMax ? undefined : recommendedGroupsNext}
                                            previous={recommendedGroupOffset !== 0 ? recommendedGroupsPrevious : undefined}
                                        />
                                }
                            </div>
                        </div> */}



                    </div>
                </div>
            </div>
        </Page>
    )
}
import { CheckList, FWKIcons, FormField, ICategory, ICreatePost, IPost, IPostFilters, IUser, Logger, LoginRequired, Page, UserAvatar, createPost, formFieldReady, getCategories, handleRequestError, getPosts, sleep, toast, useRefresh, useUser } from "@desp-aas/desp-ui-fwk";
import './PostsPage.css'
import { useCallback, useEffect, useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { icons } from "../../utils/icons";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../redux";
import { Blurable } from "@desp-aas/desp-ui-fwk/src/components/Blurable/Blurable";
import { setPost } from "../../redux/postsReducer";
import { PostsList } from "./PostsList/PostsList";
import { CategoryFilter } from "../../components/CategoryFilter/CategoryFilter";
import { PostItemLoading } from "./PostsList/PostItem";

const logger = new Logger("component", "PostsPage");

type IUpdatePostsFilters = (key: keyof IPostFilters, value: any)=>any

const charLimits = {
    title: 15,
    message: 20
}

export const PostsPage = () => {   
    // Detailed mode toggle
    const [initialised, setInitialised] = useState(false);

    const refreshToken = useRefresh(10);


    const appWidth = useSelector((state: ReduxState)=> state.app.width )
    const { filters } = useSelector((state: ReduxState)=> state.posts );
    const dispatch = useDispatch()
    
    // const [ filters, setFilters ] = useState<IPostFilters|undefined>(catalogFilters[asset_type]);

    // useEffect(()=>{
    //     setFilters(catalogFilters[asset_type])
    // }, [ catalogFilters, asset_type ])

    const isMobileMode = () => !!(appWidth && appWidth <= ( 1100 ))
    const [mobileMode, setMobileMode] = useState<boolean>(isMobileMode());
    useEffect(()=>{ setMobileMode(isMobileMode()) }, [ appWidth ])

    // list of categories fetched from backend
    const [categories, setCategories] = useState<ICategory[]>();

    // The list of normal assets
    const [posts, setPosts] = useState<IPost[]>();
    
    const [postsReachedMax, setPostsReachedMax] = useState(false);

    const [loadingPosts, setLoadingPosts] = useState(true);

    const [searchReady, setSearchReady] = useState(true);

    const [openFilters, setOpenFilters] = useState(false);

    const [creatingPost, setCreatingPost] = useState(false);
    const [newPostReady, setNewPostReady] = useState(false);
    const [newPostOpen, setNewPostOpen] = useState(false);
    const [newPost, setNewPost] =  useState<ICreatePost>({ title: '', message: '' })

    const currentUser = useUser();
    
    const getPostlimit = useCallback(() => {
        return 20;
    },[])
    
    /* INIT */
    useEffect(() => {
        setInitialised(false);
        setPosts(undefined);
        getCategories()
            .then((categories) => { 
                logger.info("Categories result", categories); 
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
            .finally(()=>{
                setInitialised(true);
            })
    }, [])

    const updateFilters = useCallback((key: keyof IPostFilters, value: any)=>{
        let prev = { ...filters }

        let resetPagination: Partial<IPostFilters> = [ 'offset' ].includes(key) ? {} : { offset: 0 }
        
        prev = {
            ...prev,
            ...resetPagination,
            [key]: value
        }

        dispatch(setPost({ filters: prev }))
    }, [ filters ])

    const getFilters = useCallback((params: { limit: number, offset: number })=>{
        let { limit, offset } = params;

        return {
            // q: filters?.search || '', 
            // limit: limit + offset, 
            // offset: 0, 
            count: true,
            categories: !(filters && categories) ? undefined : filters?.categories.length > 0 && filters.categories.length !== categories.length ? filters.categories.join(',') : undefined,
        }
    }, [ filters ])


    async function fetchPosts(reload: boolean, _offset?: number) {
        if (!searchReady || !filters) {
            return setPosts(undefined);
        }
        if(reload) setLoadingPosts(true)
        try {
            let offset = _offset === undefined ? filters.offset : _offset;
            let limit = getPostlimit();
            logger.info("[fetchPosts] Searching posts", { offset, limit });

            let posts = (await getPosts(getFilters({ limit, offset })));
            // let posts = (await getPosts(getFilters({ limit, offset }))).posts;
            // [asset_type as ASSET_TYPE] // TODO: comeback once we know how to get the current asset type
            // let posts = tests;

            console.log("posts", posts)

            if(posts){
               logger.info("[fetchPosts] results", posts)

                // posts.forEach((p)=>formatPost(p))
    
                // Check if we have reached the max
                if ( posts.length < limit + offset) {
                    setPostsReachedMax(true);                    
                }
                else {
                    if (posts.length < limit) {
                        setPostsReachedMax(true);
                    }
                    else {
                        setPostsReachedMax(false);
                    }
                }
                setPosts(posts.reverse())
            }
            else{
                throw new Error('Missing response in search')
            }
            
        }
        catch (e) {
            logger.error("Error during post fetch", e)
            handleRequestError(e, { defaultMessage: "An error has occured when fetching posts, please try again later" })
        }
        finally {
            if(reload) setLoadingPosts(false)
        }
    }

    useEffect(() => {
        let searchReady = !!(
            filters &&
            filters.categories.length > 0
        )
        logger.info("searchReady", searchReady)
        setSearchReady(searchReady)
    }, [filters]);

    useEffect(() => {
        console.log("Searching all posts?", searchReady)
        if(initialised){
            fetchPosts(true);
        }
    }, [initialised, filters?.categories, searchReady])

    const toggleFilter = useCallback(()=>{
        setOpenFilters(!openFilters)
    }, [ openFilters ])

    const closeFilters = useCallback(()=>{
        setOpenFilters(false)
    }, [])

    const postsNext = () => {
        if (!postsReachedMax && filters) {
            let newOffset = filters.offset + getPostlimit();
            updateFilters('offset', newOffset)
            fetchPosts(true, newOffset);
            closePosts();
        }
    }

    useEffect(()=>{
        if(
            newPost.message !== '' && newPost?.title !== '' && newPost.category_id !== undefined 
            && formFieldReady({ charLimit: { min: charLimits.title } }, newPost.title)
            && formFieldReady({ charLimit: { min: charLimits.message } }, newPost.message)
        ){
            setNewPostReady(true)
        }
        else{
            setNewPostReady(false)
        }
    }, [ newPost ])

    const closePosts = useCallback(()=>{
        setNewPostOpen(false);
        setNewPost({ title: '', message: '' })
    }, [])

    const openPosts = useCallback(()=>{
        setNewPostOpen(true);
        updateNewPost({ category_id: (filters.categories.length > 0 ? filters.categories[0] : categories?.[0]?.id ) })
    }, [filters])

    const handleCreatePost = useCallback(()=>{
        if(newPostReady){
            setCreatingPost(true)

            createPost(newPost)
            .then(async ()=>{
                // toast(<>post added, now waiting</>, { type: 'info' });

                await sleep(2000);
                fetchPosts(false);
                toast(<>Sucessfully added post</>, { type: 'success' });
                closePosts();
            })
            .catch(handleRequestError)
            .finally(()=>{
                setCreatingPost(false)
            })
        }
        
    }, [newPost, newPostReady])

    const updateNewPost = useCallback((updates: Partial<ICreatePost>)=>{
        setNewPost((prev)=>({
            ...prev,
            ...updates
        }))
    }, [])

    return (
        <Page
            id="posts-page"
            fixedHeight
            background2
            footer={{ fixed: true }}
        >
            <Navigation />
            <div className="fixed-page-content">
                <div id="posts-page-content" className={classNames({ "posts-filter-mobile": mobileMode })}>
                    <div id="posts-left-side" className={classNames({ "toggled": openFilters })} >
                        <Blurable
                            id="posts-left-side-content"
                            onBlurCb={closeFilters}
                        >
                            <div
                                id="posts-filter-toggle"
                                className="button themed icon-only"
                                onClick={toggleFilter}
                            >
                                { icons.filter }
                            </div>
                            <PostsFilters
                                loadingPosts={loadingPosts}
                                updateFilters={updateFilters}
                                searchReady={searchReady}
                                categories={categories || []}
                            />
                        </Blurable>

                    </div>
                    <div id="posts-right-side">
                        <LoginRequired small message="You must sign in in order to create a new post">
                            <div id="new-post">
                                <div id="new-post-form" className={classNames({ "open": newPostOpen })}>
                                    <div className="post-item-top">
                                        <div className="post-item-user">
                                            <UserAvatar user={currentUser as IUser}/>
                                            <div className="post-item-user-info">
                                                <div className="post-item-username">
                                                    { currentUser?.displayName }
                                                </div>
                                                <div className="post-item-time">
                                                    Now
                                                </div>
                                            </div>
                                        </div>
                    
                                        <div className="post-item-category">
                                            <FormField 
                                                value={newPost.category_id} id="new-post-category" placeholder="Category" 
                                                onUpdate={(category_id)=>updateNewPost({ category_id })}
                                                select={{
                                                    search: true,
                                                    options: categories?.map((c)=>({ label: c.name, value: c.id })) || []
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <FormField 
                                        value={newPost.title} id="new-post-title" placeholder="Post title" 
                                        onUpdate={(title)=>updateNewPost({ title })} charLimit={{ min: charLimits.title }}
                                        inputProps={{ onKeyDown: (ev)=>{ if( ev.ctrlKey && ev.key === 'Enter' && newPostReady) handleCreatePost() } }}
                                    />
                                    <FormField 
                                        value={newPost.message} id="new-post-message" placeholder="Post message" 
                                        onUpdate={(message)=>updateNewPost({ message })} charLimit={{ min: charLimits.message }}
                                        textArea={{
                                            textAreaProps:{ onKeyDown: (ev)=>{ if( ev.ctrlKey && ev.key === 'Enter' && newPostReady) handleCreatePost() } }
                                        }} 
                                    />  
                                    
                                </div>
                                <div id="new-post-operations">
                                    {
                                        newPostOpen
                                        ? <>
                                            <div 
                                                className="button operation"
                                                id="new-post-cancel"
                                                onClick={closePosts}
                                            >
                                                { FWKIcons.cancel } Cancel
                                            </div>
                                            <div 
                                                className={classNames({ "button operation green": true, "disabled": !newPostReady || creatingPost})}
                                                onClick={handleCreatePost}
                                                id="new-post-create"
                                            >
                                                { icons.sendPost } { creatingPost ?  "Posting..." : "Post" }
                                            </div>
                                        </>
                                        : <>
                                            <div id="new-post-operations">
                                                <div 
                                                    className="button operation blue"
                                                    onClick={openPosts}
                                                    id="new-post-add"
                                                >
                                                    { FWKIcons.create } { creatingPost ? "Adding post..." : "Add post"}
                                                </div>
                                            </div>
                                        </> 
                                    }
                                </div>
                            </div>
                        </LoginRequired>
                        <div className="posts-results">
                            {
                                !searchReady && categories ?
                                    <div className="no-data">
                                        {FWKIcons.warning} Missing required filters
                                    </div>
                                    :
                                    loadingPosts
                                    ?
                                        <div className="posts-list">
                                            <PostItemLoading/>
                                            <PostItemLoading/>
                                            <PostItemLoading/>
                                        </div>
                                    :
                                        <PostsList
                                            posts={posts}
                                            refreshToken={refreshToken}
                                            loadingPosts={loadingPosts}
                                            next={(postsReachedMax ? undefined : postsNext)}
                                            updatePosts={fetchPosts}
                                        />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    )
}

type IFiltersProps = {
    updateFilters: IUpdatePostsFilters
    loadingPosts: boolean
    searchReady: boolean
    categories: ICategory[]
}

const PostsFilters = (props: IFiltersProps) =>{
    const { filters } = useSelector((state: ReduxState)=> state.posts );
    
    return (
        <>
            {/* <SearchBar
                id="posts-page-search"
                value={filters?.search || ''}
                onChange={(search)=> props.updateFilters('search', search) }
                disabled={!props.searchReady}
                loading={props.loadingAssets || props.loadingRecommendedAssets}
                validation={[
                    { description: 'You must type at least 4 characters.', validation: (tempSearch)=> tempSearch.length > 3 }
                ]}
                // searchCallback={searchAllAssets}
            /> */}
            
            {/* <div className="posts-filter-box" id="posts-filter-categories">
                <FilterTitle>Category</FilterTitle>
                <div className="posts-filter-box-form">
                    <CheckList
                        disabled={props.loadingPosts}
                        toggleAllLabel="All categories"
                        options={props.categories.map((c) => {
                            return { label: c.name, value: c.id }
                        })}
                        onChange={(categories)=> props.updateFilters('categories', categories) }
                        values={filters?.categories || []}
                        toggleAll
                    />
                </div>
            </div> */}
            <div id="posts-filter-categories">
                <CategoryFilter
                    categories={props.categories}
                    onChange={(categories)=> props.updateFilters('categories', categories) }
                    disabled={props.loadingPosts}
                    values={filters?.categories || []}
                    checkListProps={{
                        toggleAllLabel: "All categories"
                    }}
                />
            </div>
        </>
    )
}
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { ASSET_SOURCES, ASSET_TYPE, confirm, createSubscription, deleteSubscription, formatGeoBoundingBox, formatGeoBoundingBoxToArray, FormField, FWKIcons, getSubscriptions, handleRequestError, ICatalogFilters, ICategory, InfoTooltip, Loading, LoginRequired, Select, updateSubscription, useUser } from '@desp-aas/desp-ui-fwk';
import './CatalogSubscriptions.css';
import { icons } from '../../../utils/icons';
import { Modal } from "@mui/material"
import { updateCatalogFilters, updateCatalogPagination } from '../../../utils/catalog';
import { ReduxState } from '../../../redux';
import { useDispatch, useSelector } from 'react-redux';
import { setCatalog } from '../../../redux/catalogReducer';
import { toast } from 'react-toastify';
import { ISubscription } from '@desp-aas/desp-ui-fwk/src/utils/types/subscription';
import { Tooltip } from 'react-tooltip';
import { FaICursor } from 'react-icons/fa6';

type IProps = {
    searchReady: boolean;
    assetType: ASSET_TYPE;
    categories: ICategory[]|undefined;
    subscribeSelectRef: React.RefObject<HTMLDivElement>;
}


export const CatalogSubscriptions = (props: IProps) => {
    const dispatch = useDispatch();
    const {catalogFilters, catalogSubscriptions, catalogPagination} = useSelector((state: ReduxState) => state.catalog);
    const [ subscribing, setSubscribing ] = useState(false);
    const [ selectedSubscription, setSelectedSubscription ] = useState<ISubscription|undefined>(undefined);
    const [ allSubscriptions, setAllSubscriptions ] = useState<ISubscription[]|undefined>();
    const [ subscriptions, setSubscriptions ] = useState<ISubscription[]|undefined>();
    const [ loadingSubscriptions, setLoadingSubscriptions ] = useState(false);
    const [ unsubscribing, setUnsubscribing ] = useState(false);
    const [ newSubscriptionName, setNewSubscriptionName ] = useState('');
    const [ newSubscriptionOpen, setNewSubscriptionOpen ] = useState(false);

    const [ nameIsValid, setNameIsValid ] = useState(false);
    const [ newSubscriptionReady, setNewSubscriptionReady ] = useState(false);
    
    const [ subscriptionUpdated, setSubscriptionUpdated ] = useState(false);
    const [ updatingSubscription, setUpdatingSubscription ] = useState(false);

    const [ renameModalOpen, setRenameModalOpen ] = useState(false);

    const user = useUser();


    const [ filters, setFilters ] = useState<ICatalogFilters>(catalogFilters[props.assetType]);
    useEffect(() => {
        setFilters(catalogFilters[props.assetType]);
    }, [catalogFilters, props.assetType]);

    useEffect(() => {
        setSelectedSubscription(subscriptions?.find((subscription) => subscription.id === catalogSubscriptions[props.assetType]));
    }, [subscriptions, catalogSubscriptions, props.assetType]);

    const [ metadataFilters, setMetadataFilters ] = useState<Record<string, any>|undefined>(catalogFilters[props.assetType]?.metadata);
    useEffect(() => {
        setMetadataFilters(filters?.metadata);
    }, [filters]);

    const subscriptionNameIsValid = (name: string, currentSubscription?: ISubscription) => 
        !allSubscriptions?.some((subscription) => 
            subscription.query?.documentType === props.assetType && subscription.name === name
            && subscription.id !== currentSubscription?.id
        )


    useEffect(() => {
        setNameIsValid(
            newSubscriptionName !== '' &&
            subscriptionNameIsValid(newSubscriptionName)
        );
    }, [newSubscriptionName, allSubscriptions, props.assetType]);

    useEffect(() => {
        setNewSubscriptionReady(nameIsValid && !!allSubscriptions);
    }, [nameIsValid, allSubscriptions]);

    const fetchSubscriptions = () => {
        setLoadingSubscriptions(true);
        if(user){
            getSubscriptions().then((subscriptions) => {
                setAllSubscriptions([
                    ...subscriptions,
                    // {
                    //     id: 'new',
                    //     name: 'proper subscription',
                    //     query: {
                    //         documentType: ASSET_TYPE.dataset,
                    //         documentSource: SOURCE_TYPE.external,
                    //         // documentSource: [ ASSET_SOURCES[0] ],
                    //         documentCategory: [ '7' ],
                    //         // documentCategory: [ 'Atmospheric Composition and Health' ],
                    //         text: "hello world",
                    //         metadatas: {
                    //             "type": "IoT"
                    //         },
                    //     },
                    //     created_at: new Date().toISOString(),
                    //     despUserId: '123'
                    // }
                ]);
                // setSubscriptions(subscriptions);
            })
            .catch(handleRequestError)
            .finally(() => {
                setLoadingSubscriptions(false);
            });
        }
    }

    useEffect(() => {
        setSubscriptions(allSubscriptions?.filter((subscription) => subscription.query.documentType === props.assetType));
    }, [allSubscriptions, props.assetType]);

    const subscribe = useCallback(() => {
        if(props.searchReady && user && newSubscriptionReady ){
            setSubscribing(true);
            setNewSubscriptionOpen(false);
            createSubscription({
                name: newSubscriptionName,
                query: {
                    documentType: props.assetType,
                    documentSource: !filters?.sources || filters.sources && filters.sources.length === ASSET_SOURCES.length ? undefined : filters?.sources[0],
                    documentCategory: filters?.categories.map((category) => category.toString()),
                    metadatas: metadataFilters || {},
                    geo_bounding_box: filters?.geo ? formatGeoBoundingBox(filters.geo) : undefined,
                    text: filters?.search || ''
                },
                despUserId: user.username
            })
            .then((subscription) => {
                toast(<>Subscribed to search as '{newSubscriptionName}'</>, { type: 'success' })
                console.log(subscription);
                setNewSubscriptionName('');
                fetchSubscriptions();
                
                const newSubscriptions = {
                    ...catalogSubscriptions,
                    [props.assetType]: subscription.id
                }
                dispatch(setCatalog({ catalogSubscriptions: newSubscriptions }));
            })
            .catch(handleRequestError)
            .finally(() => {
                setSubscribing(false);
            });

        }
    }, [props.searchReady, newSubscriptionName, filters, metadataFilters, catalogSubscriptions, props.assetType, newSubscriptionReady]);


    const handleUpdateSubscription = useCallback(() => {
        if(props.searchReady && selectedSubscription && subscriptionUpdated ){
            confirm({
                title: 'Update subscription',
                message: `Are you sure you want to update subscription '${selectedSubscription.name}' with the selected fields?`,
                onConfirm: () => {
                    setUpdatingSubscription(true);
                    updateSubscription(selectedSubscription.id, {
                        name: selectedSubscription.name,
                        query: {
                            documentType: selectedSubscription.query.documentType,
                            documentSource: !filters?.sources || filters.sources && filters.sources.length === ASSET_SOURCES.length ? undefined : filters?.sources[0],
                            documentCategory: filters?.categories.map((category) => category.toString()),
                            metadatas: metadataFilters || {},
                            geo_bounding_box: filters?.geo ? formatGeoBoundingBox(filters.geo) : undefined,
                            text: filters?.search || ''
                        },
                    })
                    .then((subscription) => {
                        toast(<>Updated subscription '{selectedSubscription.name}'</>, { type: 'success' })
                        fetchSubscriptions();
                    })
                    .catch(handleRequestError)
                    .finally(() => {
                        setUpdatingSubscription(false);
                    });
                }
            })


        }
    }, [props.searchReady, subscriptionUpdated, selectedSubscription, filters]);

    const handleRenameSubscription = useCallback(() => {
        if(selectedSubscription ){
            setUpdatingSubscription(true);
            updateSubscription(selectedSubscription.id, {
                name: newSubscriptionName,
                query: selectedSubscription.query,
            })
            .then((subscription) => {
                toast(<>Updated subscription name from '{selectedSubscription.name}' to '{newSubscriptionName}'</>, { type: 'success' })
                fetchSubscriptions();
                setRenameModalOpen(false);
                setNewSubscriptionName('');
            })
            .catch(handleRequestError)
            .finally(() => {
                setUpdatingSubscription(false);
            });
        }
    }, [selectedSubscription, newSubscriptionName]);

    const unsubscribe = useCallback(() => {
        if(selectedSubscription){
            confirm({
                title: 'Unsubscribe',
                message: `Are you sure you want to unsubscribe from subscription '${selectedSubscription.name}'?`,
                onConfirm: () => {
                    if(selectedSubscription){
                        setUnsubscribing(true);
                        deleteSubscription(selectedSubscription).then(() => {
                            toast(<>Unsubscribed from '{selectedSubscription.name}'</>, { type: 'success' })
                            fetchSubscriptions();
                        })
                        .catch(handleRequestError)
                        .finally(() => {
                            setUnsubscribing(false);
                        });
                    }
                }
            })
        }
    }, [selectedSubscription]);

    useEffect(() => {
        fetchSubscriptions();
    }, []);


    useEffect(() => {
        if(selectedSubscription && props.categories){
            // setSelectedSubscription(subscriptions.find((subscription) => subscription.id === filters.subscription));
            dispatch(setCatalog(updateCatalogFilters(
                catalogFilters, props.assetType, {
                    search: selectedSubscription.query.text,
                    categories: props.categories.filter((category) => 
                        selectedSubscription.query.documentCategory.includes(category.id.toString()))
                    .map((category) => category.id),
                    sources: selectedSubscription.query.documentSource ? [selectedSubscription.query.documentSource] : ASSET_SOURCES.map((source) => source.value),
                    metadata: selectedSubscription.query.metadatas,
                    geo: selectedSubscription.query.geo_bounding_box ? formatGeoBoundingBoxToArray(selectedSubscription.query.geo_bounding_box) : undefined
                }
            )));
        }
    }, [selectedSubscription, props.categories]);

    const close = useCallback(() => {
        setNewSubscriptionOpen(false);
        setNewSubscriptionName('');
    }, []);


    console.log("geo",filters?.geo)
    
    useEffect(()=>{
        if(
            filters &&
            selectedSubscription &&
            (
                // search
                filters.search !== selectedSubscription.query.text ||
                // sources
                (
                    (filters.sources.length === ASSET_SOURCES.length )
                    ? selectedSubscription.query.documentSource !== null
                    : filters.sources?.[0] !== selectedSubscription.query.documentSource
                ) || 
                // categories
                !(
                    filters.categories.every((category) => 
                    selectedSubscription.query.documentCategory.includes(category.toString())
                    ) && 
                    selectedSubscription.query.documentCategory.every((category) => 
                        filters.categories.includes(parseInt(category))
                    )
                ) ||
                // metadata
                !(
                    Object.entries(filters.metadata).every(([key, value]) => 
                        selectedSubscription.query.metadatas[key] === value
                    ) &&
                    Object.entries(selectedSubscription.query.metadatas).every(([key, value]) => 
                        filters.metadata[key] === value
                    )
                ) || 
                // geo
                !(
                    filters.geo &&
                    selectedSubscription.query.geo_bounding_box &&
                    JSON.stringify(formatGeoBoundingBox(filters.geo)) === JSON.stringify(selectedSubscription.query.geo_bounding_box)
                )
            )
        ){
            setSubscriptionUpdated(true)
        }
        else{
            setSubscriptionUpdated(false)
        }
    }, [selectedSubscription, filters])

    const openRenameModal = useCallback(() => {
        setRenameModalOpen(true);
        setNewSubscriptionName(selectedSubscription?.name || '');
    }, [selectedSubscription]);

    const closeRenameModal = useCallback(() => {
        setRenameModalOpen(false);
        setNewSubscriptionName('');
    }, []);
    
    return (
        <>
            <Modal
                open={newSubscriptionOpen}
                onClose={close}
                id="new-subscription-modal"
                className='modal'
            >
                <div id="new-subscription-content" className='modal-content'>
                    <h2>New subscription</h2>
                    <p>
                        Add a name to your subscription to easily identify it in the future.
                    </p>
                    <FormField
                        label="Name"
                        value={newSubscriptionName}
                        onUpdate={setNewSubscriptionName}
                        validation={[
                            {
                                description: 'Name The name already exists',
                                validation: (value) => {
                                    return subscriptionNameIsValid(value);
                                }
                            }
                        ]}
                    />
                    <div id="new-subscription-actions">
                        <div className={classNames({
                            'button green operation': true,
                            'disabled': !newSubscriptionReady
                        })} onClick={subscribe}>
                            { FWKIcons.confirm } Confirm
                        </div>
                        <div className="button grey operation" onClick={close}>
                            { FWKIcons.cancel } Cancel
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                open={renameModalOpen}
                onClose={closeRenameModal}
                id="new-subscription-modal"
                className='modal'
            >
                <div id="new-subscription-content" className='modal-content'>
                    <h2>Rename subscription</h2>
                    <p>
                        Rename '{selectedSubscription?.name}' to:
                    </p>
                    <FormField
                        label="New Name"
                        value={newSubscriptionName}
                        onUpdate={setNewSubscriptionName}
                        validation={[
                            {
                                description: 'Name The name already exists',
                                validation: (value) => {
                                    return subscriptionNameIsValid(value, selectedSubscription);
                                }
                            }
                        ]}
                    />
                    <div id="new-subscription-actions">
                        <div className={classNames({
                            'button green operation': true,
                            'disabled': !newSubscriptionReady || updatingSubscription
                        })} onClick={handleRenameSubscription}>
                            { FWKIcons.confirm } { updatingSubscription ? "Updating name..." : 'Confirm'}
                        </div>
                        <div className="button grey operation" onClick={closeRenameModal}>
                            { FWKIcons.cancel } Cancel
                        </div>
                    </div>
                </div>
            </Modal>

            <div className="catalog-subscriptions">
                <LoginRequired
                    small={true}
                    message="Login to subscribe to current filters."
                >
                    <div className="catalog-subscriptions-content">
                        <Select
                            
                            id="catalog-subscriptions-select"
                            options={subscriptions?.map((subscription) => ({
                                label: subscription.name || subscription.id,
                                value: subscription.id
                            })) || []}
                            onChange={(subscription)=>{
                                dispatch(setCatalog(updateCatalogPagination(catalogPagination, props.assetType, { assetOffset: 0, recommendedAssetOffset: 0 })));
                                const newSubscriptions = {
                                    ...catalogSubscriptions,
                                    [props.assetType]: subscription
                                }
                                dispatch(setCatalog({ catalogSubscriptions: newSubscriptions }));
                            }}
                            value={catalogSubscriptions[props.assetType]}
                            // onChange={setSelectedSubscriptionId}
                            // value={selectedSubscriptionId}
                            placeholder="Subscriptions..."
                            search={true}
                            disabled={loadingSubscriptions}
                            nullable
                            selectBoxRef={props.subscribeSelectRef}
                        />
                        {
                            selectedSubscription
                            ?
                                <>
                                    <div 
                                        className={classNames({
                                            'button inverted operation blue icon-only': true,
                                            'disabled': updatingSubscription
                                        })}
                                        onClick={openRenameModal}
                                        id="catalog-subscriptions-rename"
                                    >
                                        {
                                            updatingSubscription ? <Loading/> :
                                            <FaICursor />
                                        }
                                        <Tooltip 
                                            anchorSelect="#catalog-subscriptions-rename"
                                            place="bottom"
                                        >
                                            Rename
                                        </Tooltip>
                                    </div>
                                    {
                                        subscriptionUpdated &&
                                        <div 
                                            className={classNames({
                                                'button operation blue inverted icon-only': true,
                                                'disabled': updatingSubscription
                                            })}
                                            onClick={handleUpdateSubscription}
                                            id="catalog-subscriptions-update"
                                        >
                                            {
                                                updatingSubscription ? <Loading/> :
                                                FWKIcons.edit
                                            }
                                            {/* {
                                                updatingSubscription ?
                                                    'Updating...'
                                                    :
                                                    'Update'
                                            } */}
                                            <Tooltip 
                                                anchorSelect="#catalog-subscriptions-update"
                                                place="bottom"
                                            >
                                                Update
                                            </Tooltip>
                                        </div>
                                    }
                                    <div 
                                        className={classNames({
                                            'button red inverted operation icon-only': true,
                                            'icon-only': subscriptionUpdated,
                                            'disabled': unsubscribing
                                        })}
                                        id="catalog-subscriptions-unsubscribe"
                                        onClick={unsubscribe}
                                    >
                                        {
                                            unsubscribing ? <Loading/>
                                            : icons.subscriptions.unsubscribed
                                        }
                                        
                                        {
                                            // subscriptionUpdated ? null
                                            // : unsubscribing ?
                                            //     'Unsubscribing...'
                                            //     :
                                            //     'Unsubscribe'
                                        }
                                    </div>
                                    <Tooltip 
                                        anchorSelect="#catalog-subscriptions-unsubscribe"
                                        place="bottom"
                                    >
                                        Unsubscribe
                                    </Tooltip>
                                </>
                            :
                                <div
                                    className={classNames({
                                        'button themed': true,
                                        'disabled': subscribing || !props.searchReady
                                    })}
                                    id="catalog-subscriptions-subscribe"
                                    onClick={ props.searchReady ? () => setNewSubscriptionOpen(true) : undefined}
                                >
                                    {
                                        icons.subscriptions.subscribe
                                    }
                                    {
                                        subscribing ?
                                            'Creating...'
                                            :
                                            'Get notified'
                                    }
                                </div>
                        }
                        <div id="catalog-subscriptions-info">
                            <InfoTooltip
                                tooltip={<div className="catalog-subscriptions-tooltip">
                                    Get notified when new assets are added or updated to the catalog with subscriptions.

                                    {/* Subscriptions notify you via email when assets are added or updated in the catalog. */}
                                    <br/>
                                    You'll get notified on the sources, categories, and additional filters selected below.
                                    {/* They will match the sources, categories, and additional filters selected below. */}
                                </div>}
                                id="catalog-subscriptions-info-tooltip"
                            />
                        </div>
                    </div>
                </LoginRequired>
            </div>
        </>
    )
}
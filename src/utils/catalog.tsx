import { useDispatch, useSelector } from "react-redux"
import { ReduxState } from "../redux"
import { useEffect, useState } from "react"
import { ASSET_TYPE, ICatalogFilters, ICatalogMapCoords, ICategory, SOURCE_TYPE, sourceTypes } from "@desp-aas/desp-ui-fwk"


export type ICatalogPagination = {
    assetOffset: number
    recommendedAssetOffset: number
}

export const defaultFilters = (): ICatalogFilters => (JSON.parse(JSON.stringify({
    subscription: undefined,
    search: '', 
    sources: [...sourceTypes], 
    categories: [],
    assetOffset: 0,
    recommendedAssetOffset: 0,
    geo: undefined,
    metadata: {},
})))

export const defaultPagination = (): ICatalogPagination => (JSON.parse(JSON.stringify({
    assetOffset: 0,
    recommendedAssetOffset: 0,
})))


export type IAssetFilter = {
    id: string
    name: string
    label: string
    section?: string|null
    asset_type?: ASSET_TYPE[]
    required?: boolean
    queryable: boolean
    priority?: number|null
    search_priority?: number|null
} & (
    {
        type: 'select'
        options: IFilterSelectOptions
    } | {
        type: 'datetime'
        options?: IFilterDatetimeOptions|null
    } | {
        type: 'integer'
        options?: IFilterIntegerOptions|null
    } | {
        type: 'text'
        options?: IFilterTextareaOptions|null
    } | {
        type: 'duration'
        options?: IFilterDurationOptions|null
    } | {
        type: 'code'
        options?: IFilterCodeOptions|null
    }
)

export type IFilterSelectOptions = {
    values: string[]
}
export type IFilterDatetimeOptions = {
    min?: string
    max?: string
}
export type IFilterIntegerOptions = {
    min?: number
    max?: number
}
export type IFilterTextareaOptions = {
}
export type IFilterDurationOptions = {
    duration_reference: string
}
export type IFilterCodeOptions = {
    highlight_reference?: string
}

export const formatSearchFilters = (body: {
    search: string,
    type: ASSET_TYPE,
    categories: number[],
    sources?: SOURCE_TYPE[],
    metadata?: Record<string, any>,
    geo?: ICatalogMapCoords
}) =>{
    return {
        q: body.search, 
        type: body.type,
        categories: body.categories.length > 0 ? body.categories.join(',') : undefined,
        source: (!body.sources || body.sources.length === 0 || body.sources.length === 2) ? undefined : body.sources.join(','),
        metadata: body.metadata && Object.keys(body.metadata).length > 0 ? JSON.stringify(body.metadata) : undefined,
        geo: body.geo && body.geo.length > 0 ? JSON.stringify(body.geo) : undefined
    }
}


export const updateCatalogFilters = (currentFilters: {[key: string]: ICatalogFilters}, assetType: ASSET_TYPE, updates: Partial<ICatalogFilters>) => {
    return {
        catalogFilters: {
            ...currentFilters,
            [assetType]: {
                ...currentFilters[assetType],
                ...updates
            }
        }
    }
}
export const updateCatalogPagination = (currentPagination: {[key: string]: ICatalogPagination}, assetType: ASSET_TYPE, updates: Partial<ICatalogPagination>) => {
    return {
        catalogPagination: {
            ...currentPagination,
            [assetType]: {
                ...currentPagination[assetType],
                ...updates
            }
        }
    }
}
export const resetCatalogSubscription = (currentSubscriptions: {[key: string]: string|undefined}, assetType: ASSET_TYPE) => {
    return {
        catalogSubscriptions: {
            ...currentSubscriptions,
            [assetType]: undefined
        }
    }
}


export const useFilters = (assetType: ASSET_TYPE) => {
    const { catalogFilters } = useSelector((state: ReduxState) => state.catalog);
    const [ filters, setFilters ] = useState<ICatalogFilters>(catalogFilters[assetType]);
    
    useEffect(() => {
        setFilters(catalogFilters[assetType]);
    }, [ catalogFilters, assetType ]);

    return filters;
}

export const defaultCatalogFilters = (assetType: ASSET_TYPE, categories: ICategory[]): ICatalogFilters => {
    return {
        search: '',
        categories: categories.map((category) => category.id),
        sources: [...sourceTypes],
        geo: undefined,
        metadata: {},
    }
}
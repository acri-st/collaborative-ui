import { useSelector } from "react-redux"
import { IAssetFilter } from "../../../utils/catalog"
import { useEffect, useRef } from "react"
import { ReduxState } from "../../../redux"
import { FormField, Logger, ASSET_TYPE, ICatalogFilters } from "@desp-aas/desp-ui-fwk"
import "./CatalogFilter.css"

const logger = new Logger("component", "CatalogFilter");

export type IUpdateCatalogFilter = (updates: Partial<ICatalogFilters>)=>any

export type ICatalogFilterProps = {
    filter: IAssetFilter
    filters: ICatalogFilters
    additionalFilters: {[filter:string]: any}
    updateFilters: IUpdateCatalogFilter
    asset_type: ASSET_TYPE

    addRef: (ref: React.RefObject<HTMLDivElement>)=>void
    removeRef: (ref: React.RefObject<HTMLDivElement>)=>void
}


export const CatalogFilter = (props: ICatalogFilterProps) =>{
    const { catalogFilters } = useSelector((state: ReduxState)=> state.catalog );

    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        props.addRef(boxRef)
        return ()=>{
            props.removeRef(boxRef)
        }
    }, [])
    return (
        props.filter.type === 'select' ?
        <FormField
            label={props.filter.label}
            value={ 
                props.filter.name in props.additionalFilters 
                ? props.additionalFilters[props.filter.name] 
                : catalogFilters[props.asset_type]?.metadata?.[props.filter.name] || ''}
            onUpdate={(value)=> props.updateFilters({ [props.filter.name]: value }) }
            select={{
                options: props.filter.options.values.map((value)=> ({ label: value, value })),
                // disabled: !licensesFetched,
                selectBoxRef: boxRef,
                search: props.filter.options.values.length > 10,
                nullable: true
            }}
        />
        : null
    )
}
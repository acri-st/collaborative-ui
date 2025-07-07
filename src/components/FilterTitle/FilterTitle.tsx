import { ReactNode } from 'react';
import './FilterTitle.css';
import { FWKIcons } from '@desp-aas/desp-ui-fwk';
import classNames from 'classnames';

type IProps = {
    children: ReactNode
    id?:string
    onClick?: () => void
}

export function FilterTitle(props: IProps){
    return (
        <div className="filter-title" id={props.id} onClick={props.onClick}>
            <div className="filter-title-image"/>
            <div className="filter-title-title">
                { props.children }
            </div>
        </div>
    )
}

type IFilterTitleToggleProps = {
    open: boolean
    toggle?: () => void
    id?:string
}
export function FilterTitleToggle(props: IFilterTitleToggleProps){
    console.log("FilterTitleToggle", props.open);
    return (
        <div 
            className={classNames({
                "filter-title-toggle": true,
                "open": props.open
            })} 
            onClick={props.toggle}
            id={props.id}
        >
            { FWKIcons.letterChevronLeft }
        </div>
    )
}

export default FilterTitle;
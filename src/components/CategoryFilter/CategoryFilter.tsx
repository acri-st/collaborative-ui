import React, { ReactNode, useCallback, useMemo, useState } from "react";
import './CategoryFilter.css';
import FilterTitle, { FilterTitleToggle } from "../FilterTitle/FilterTitle";
import classNames from "classnames";
import { CheckList, ICategory, ICheckListProps } from "@desp-aas/desp-ui-fwk";

export type ICategoryFilterProps = {
    id?: string
    title?: ReactNode
    categories: ICategory[]
    disabled?: boolean
    checkListProps?: Partial<ICheckListProps>
    onChange: (categories: any[])=>any
    values?: any[]
}

export const CategoryFilter = (props: ICategoryFilterProps) => {
    return (
        <div className="catalog-filter-box" id={props.id || "catalog-filter-categories"}>
            <FilterTitle
            >
                {props.title || "Category"}
            </FilterTitle>
            <div
                id="catalog-filter-categories-form"
                className={classNames({
                    "catalog-filter-box-form": true,
                })}
            >
                <CheckList
                    disabled={props.disabled}
                    toggleAllLabel="All categories"
                    options={props.categories.map((c) => {
                        return { label: c.name, searchValue: c.name, value: c.id }
                    })}
                    onChange={props.onChange}
                    values={props.values}
                    searchable={true}
                    toggleAll
                    {...props.checkListProps}
                />
            </div>
        </div>
    )
}
import classNames from "classnames";
import './CourseCard.css'
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { courseURL, getAssetImage, IAsset, randomID } from "@desp-aas/desp-ui-fwk";
import removeMarkdown from 'remove-markdown';

type IProps = {
    asset: IAsset
}

export function CourseCard(props: IProps) {
    const [ imageID, setImageID ] = useState(randomID())
    return <NavLink
        to={courseURL(props.asset)}
        // onClick={() => navigate(assetURL(props.asset))}
        className="course-card"
    >
        <div className="course-card-image image"
            style={{ backgroundImage: `url('${getAssetImage(props.asset)}?cache=${imageID}')` }}
        />
        <div className="course-card-information">
            <div className="course-card-title">
                { props.asset.name }
            </div>
            <div className="course-card-description">
                { removeMarkdown(props.asset.metadata?.description || '') }
            </div>
        </div>
    </NavLink>
}
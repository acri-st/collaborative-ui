import classNames from "classnames";
import './GroupCard.css'
import { NavLink } from "react-router-dom";
import { getGroupImage, groupURL, IGroup } from "@desp-aas/desp-ui-fwk";

type IProps = {
    group: IGroup
}

export function GroupCard(props: IProps) {
    return <NavLink
        to={groupURL(props.group)}
        className="group-card"
    >        
        <div className="group-card-image image"
            style={{ backgroundImage: `url('${getGroupImage(props.group)}')` }}
        />
        <div className="group-card-information">
            <div className="group-card-title">
                { props.group.name }
            </div>
            <div className="group-card-category">
                { props.group.categoryName }
            </div>
        </div>
    </NavLink>
}

export default GroupCard;
import classNames from "classnames";
import { icons } from "../../utils/icons";
import { FaCircle } from "react-icons/fa6";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import './AssetCardDetailed.css'
import { assetIsPublished, assetURL, IAsset, UserLink } from "@desp-aas/desp-ui-fwk";
import { NavLink } from "react-router-dom";
import AssetSource from "../AssetSource/AssetSource";

dayjs.extend(relativeTime)

type IProps = {
    asset: IAsset
    isPublished?: boolean
}

export function AssetCardDetailed(props: IProps) {
    const separator = <div className="separator"><FaCircle /></div>

    return <NavLink
        to={assetURL(props.asset)}
        className="asset-card-detailed"
    >
        <AssetSource asset={props.asset}/>
        {/* <div className="asset-card-detailed-source">
            <div className="asset-card-detailed-source-top"/>
            <div className="asset-card-detailed-source-icon">
                {icons.source[props.asset.source]}
            </div>
        </div> */}
        <div className="asset-card-detailed-top">
            <div className="asset-card-detailed-title">
                <h2>{props.asset.name}</h2>
            </div>
            {
                props.asset.despUserId &&
                <div className="asset-card-detailed-user">
                    <UserLink username={props.asset.despUserId} />
                </div>
            }
        </div>
        <div className="asset-card-detailed-bottom">
            <div className="asset-card-detailed-type">
                {props.asset.type}
            </div>
            <div className="asset-card-detailed-tags">
                <div>{
                    // props.tags && props.tags.map((tag) => (<div key={tag} className={Styles.tag}>{tag}</div>))
                }</div>
            </div>
            <div className="asset-card-detailed-info-container">
                <div className="asset-card-detailed-info">
                    {icons.assets.like} {props.asset.likes_count || 0}
                </div>
                {/* {separator} */}
                {/* <div className="asset-card-detailed-info">
                    {icons.assets.topics} 0
                </div> */}
                {separator}
                <div className="asset-card-detailed-info">
                    {icons.assets.downloads} {props.asset.downloads_count || 0}
                </div>
                {
                    props.asset.updated_at &&
                    <>
                        {separator}
                        <div className="asset-card-detailed-info">
                            {icons.assets.lastUpdate} {dayjs(props.asset.updated_at).fromNow()}
                        </div>
                    </>
                }
            </div>
        </div>
        <div className="asset-card-detailed-badges">
            {
                (
                    // true ||
                    !!props.asset.isBookmarked
                ) &&
                <div className="asset-card-detailed-badge bookmark">
                    {icons.assets.isBookmarked}
                </div>
            }
            {
                (
                    // true ||
                    !props.isPublished &&
                    !assetIsPublished(props.asset)
                ) &&
                <div className="asset-card-detailed-badge private">
                    {icons.assets.private}
                </div>
            }
        </div>
    </NavLink>
}

export default AssetCardDetailed;
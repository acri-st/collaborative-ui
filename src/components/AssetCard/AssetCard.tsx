import classNames from "classnames";
import './AssetCard.css'
import { icons } from "../../utils/icons";
import { NavLink } from "react-router-dom";
import AssetSource from "../AssetSource/AssetSource";
import { useState } from "react";
import { assetURL, getAssetImage, IAsset, randomID } from "@desp-aas/desp-ui-fwk";
import removeMarkdown from 'remove-markdown';

type IProps = {
    asset: IAsset
}

export function AssetCard(props: IProps) {
    const [ imageID, setImageID ] = useState(randomID())
    return <NavLink
        to={assetURL(props.asset)}
        // onClick={() => navigate(assetURL(props.asset))}
        className="asset-card"
    >        
        <AssetSource asset={props.asset}/>

        <div className="asset-card-image image absolute"
            style={{ backgroundImage: `url('${getAssetImage(props.asset)}?cache=${imageID}')` }}
        />
        <div className="asset-card-information">
            <div className="asset-card-title">
                { props.asset.name }
            </div>
            <div className="asset-card-description">
                { removeMarkdown(props.asset.metadata?.description || '') }
            </div>
        </div>
    </NavLink>
}

export default AssetCard;
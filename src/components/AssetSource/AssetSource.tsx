import classNames from "classnames";
import './AssetSource.css'
import { icons } from "../../utils/icons";
import { IAsset } from "@desp-aas/desp-ui-fwk";

type IProps = {
    asset: IAsset
}

export function AssetSource(props: IProps) {
    return  <div className="asset-source">
        <div className="asset-source-top"></div>

        <div className="asset-source-content">
            { icons.source[props.asset.source] }
        </div>
    </div>
}

export default AssetSource;
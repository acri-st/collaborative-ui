import { UserLinkLoading } from '@desp-aas/desp-ui-fwk';
import './AssetCardDetailedLoading.css'


export function AssetCardDetailedLoading() {
    return <div
        className="asset-card-detailed-loading loading"
    >
        <div className="asset-card-detailed-loading-top">
            <div className="asset-card-detailed-loading-source"/>
            <div className="asset-card-detailed-loading-title"/>
            <div className="asset-card-detailed-loading-user">
                <UserLinkLoading/>
            </div>

        </div>
        <div className="asset-card-detailed-loading-bottom">
            <div className="asset-card-detailed-loading-type">
            </div>
            <div className="asset-card-detailed-loading-info-container">
                <div className="asset-card-detailed-loading-info"/>
                <div className="asset-card-detailed-loading-info"/>
                <div className="asset-card-detailed-loading-info"/>
                <div className="asset-card-detailed-loading-info"/>
            </div>
        </div>
    </div>
}

export default AssetCardDetailedLoading;
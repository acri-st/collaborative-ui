import './AssetList.css';
import AssetCard from '../AssetCard/AssetCard';
import { ASSET_TYPE, IAsset, Logger } from '@desp-aas/desp-ui-fwk';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import AssetCardDetailed from '../AssetCardDetailed/AssetCardDetailed';
import AssetCardDetailedLoading from '../AssetCardDetailedLoading/AssetCardDetailedLoading';
import AssetCardLoading from '../AssetCardLoading/AssetCardLoading';
import { icons } from '../../utils/icons';
import { CourseCardLoading } from '../CourseCardLoading/CourseCardLoading';
import { CourseCard } from '../CourseCard/CourseCard';
import classNames from 'classnames';

const logger = new Logger("component", "AssetList");


type IProps = {
    assets: IAsset[] | undefined
    detailedMode?: boolean
    highlightFirst?: boolean
    loadingAssets: boolean
    scrollMode: boolean
    asset_type: ASSET_TYPE

    previous?: () => any
    next?: () => any
}

export function AssetList(props: IProps) {
    return (
        <div className={classNames({"asset-list": true, [props.asset_type]: true, "scroll-mode": props.scrollMode})}>
            {
                props.loadingAssets
                // || true
                    ?
                    props.detailedMode ?
                        <div className="asset-list-detailed-results simple-scrollbar">
                            {
                                new Array(6).fill(null).map((_, idx) => (
                                    <AssetCardDetailedLoading key={idx} />
                                ))
                            }
                        </div>
                        : props.asset_type === ASSET_TYPE['course']
                        ? 
                            <div className="asset-list-results">
                            <div className="asset-list-results-list">
                                {
                                    new Array(4).fill(null).map((_, idx) => (
                                        <CourseCardLoading key={idx} />
                                    ))
                                }
                            </div>  
                            </div>  
                        : <div className={classNames({ "asset-list-results simple-scrollbar": true, "assets-list-highlight-first": props.highlightFirst })}>
                            {
                                props.highlightFirst
                                    ?
                                    <>
                                        <AssetCardLoading />
                                        {
                                            <div className="asset-list-results-list">
                                                {
                                                    new Array(4).fill(null).map((_, idx) => (
                                                        <AssetCardLoading key={idx} />
                                                    ))
                                                }
                                            </div>
                                        }
                                    </>
                                    :
                                    <div className="asset-list-results-list">
                                        {
                                            new Array(8).fill(null).map((_, idx) => (
                                                <AssetCardLoading key={idx} />
                                            ))
                                        }
                                    </div>
                            }
                        </div>
                    :
                    !props.assets || props.assets.length === 0
                        ?
                        <div className="no-data">
                            No results
                        </div>
                        :
                        props.detailedMode
                            ?
                            <div className="asset-list-detailed-results simple-scrollbar">
                                {
                                    props.assets?.map((asset, idx) => (
                                        <AssetCardDetailed
                                            isPublished
                                            asset={asset}
                                            key={idx}
                                        />
                                    ))
                                }
                                {
                                    props.next &&
                                    <div className="centered">
                                        <div 
                                            className="button themed small asset-list-more" 
                                            onClick={props.next}
                                        >
                                            {icons.listMore} more
                                        </div>
                                    </div>
                                }
                            </div>
                            :
                            <div className={classNames({ "asset-list-results  simple-scrollbar": true, "assets-list-highlight-first": props.highlightFirst })}>
                                {
                                    props.previous &&
                                    <div className="asset-list-pagination previous" onClick={props.previous}>
                                        {<HiChevronLeft />}
                                    </div>
                                }
                                {
                                    props.asset_type === ASSET_TYPE['course']
                                    ? 
                                        <div className="asset-list-results-list">
                                            {
                                                props.assets?.map((asset, idx) => (
                                                    <CourseCard key={idx} asset={asset} />
                                                ))
                                            }
                                        </div>
                                    : props.highlightFirst
                                        ?
                                        <>
                                            <AssetCard
                                                asset={props.assets[0]}
                                            />
                                            {
                                                <div className="asset-list-results-list">
                                                    {
                                                        props.assets?.slice(1, 5).map((asset, idx) => (
                                                            <AssetCard key={idx} asset={asset} />
                                                        ))
                                                    }
                                                </div>
                                            }
                                        </>
                                        :
                                        <div className="asset-list-results-list">
                                            {
                                                props.assets?.map((asset, idx) => (
                                                    <AssetCard key={idx} asset={asset} />
                                                ))
                                            }
                                        </div>
                                }
                                {
                                    props.next &&
                                    <>
                                        {
                                            props.scrollMode
                                            ?
                                                <div className="centered">
                                                    <div 
                                                        className="button themed small asset-list-more" 
                                                        onClick={props.next}
                                                    >
                                                        {icons.listMore} more
                                                    </div>
                                                </div>
                                            :
                                                <div className="asset-list-pagination next" onClick={props.next}>
                                                    {<HiChevronRight />}
                                                </div>
                                        }
                                    </>
                                }
                            </div>
            }
        </div>
    )
}
export default AssetList;

import { ASSET_SOURCES, ICategory, Logger, getCategories, handleRequestError } from "@desp-aas/desp-ui-fwk";
import { defaultNullPlaceholder, IAssetTabProps } from "../common"
import { EditableFormField } from "../../../components/EditableFormField/EditableFormField";
import { useEffect, useState } from "react";
import './AssetMetadata.css';
import { IAssetFilter } from "../../../utils/catalog";
import { AssetMetadataField } from "../AssetMetadataField/AssetMetadataField";

const logger = new Logger('AssetPage', 'AssetMetadata');

type IProps = IAssetTabProps;

export const AssetMetadata = (props: IProps) => {
    const [categories, setCategories] = useState<ICategory[] | undefined>();
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [assetMetadataMetadata, setAssetMetadataMetadata] = useState<IAssetFilter[] | undefined>();

    useEffect(() => {
        setAssetMetadataMetadata(!props.assetMetadata ? [] : props.assetMetadata?.filter((metadata) => metadata.section === 'metadata' ))
    }, [props.assetMetadata])

    const fetchCategories = async () => {
        logger.info("[fetchCategories] fetching categories")
        setLoadingCategories(true)
        try {
            let _categories = await getCategories(props.asset.type);
            setCategories(_categories);
        }
        catch (e) {
            logger.error("[fetchCategories] error fetching categories")
            handleRequestError(e)
        }
        finally {
            setLoadingCategories(false)
        }
    }

    useEffect(() => {
        fetchCategories();
    }, [props.asset.type])

    const onUpdateMetadata = (key: string, value: any) => {
        props.updateAsset({ metadata: { ...props.asset.metadata, [key]: value } })
    }

    return (

        <div id="asset-metadata-content" className="simple-scrollbar">
            {
                (loadingCategories || props.loadingAssetMetadata)
                    ?
                    <>
                        <div className="asset-metadata-loading">
                            <div className="asset-metadata-label-loading" />
                            <div className="asset-metadata-value-loading" />
                        </div>
                        <div className="asset-metadata-loading">
                            <div className="asset-metadata-label-loading" />
                            <div className="asset-metadata-value-loading" />
                        </div>
                        <div className="asset-metadata-loading">
                            <div className="asset-metadata-label-loading" />
                            <div className="asset-metadata-value-loading" />
                        </div>
                        <div className="asset-metadata-loading">
                            <div className="asset-metadata-label-loading" />
                            <div className="asset-metadata-value-loading" />
                        </div>
                        <div className="asset-metadata-loading">
                            <div className="asset-metadata-label-loading" />
                            <div className="asset-metadata-value-loading" />
                        </div>
                    </>
                    :
                    <>
                        <EditableFormField
                            disableConfirm={props.updating}
                            removeButtons disabledEditable
                            label={"Source"}
                            value={props.asset.source}
                            placeholder={!props.editMode ? defaultNullPlaceholder : undefined}
                            onUpdate={()=>{}}
                            // onUpdate={(source) => { props.updateAsset({ source }) }}
                            select={{ options: ASSET_SOURCES }}
                        />
                        
                        <EditableFormField
                            disableConfirm={props.updating}
                            removeButtons disabledEditable={!props.editMode} editing={props.editMode}
                            required
                            placeholder={!props.editMode ? defaultNullPlaceholder : undefined}
                            label={"Category"}
                            value={props.asset.categoryId}
                            onUpdate={(categoryId) => { props.updateAsset({ categoryId }) }}
                            select={{
                                options: categories?.map((c) => { return { value: c.id, label: c.name } }) || [],
                                search: true
                            }}
                        />

                        {
                            assetMetadataMetadata?.map((metadata) => (
                                <AssetMetadataField
                                    key={metadata.name}
                                    asset={props.asset}
                                    updateAsset={props.updateAsset}
                                    metadata={metadata}
                                    editMode={props.editMode}
                                    updating={props.updating}
                                />
                            ))
                        }
                    </>
            }
        </div>
    )
}
export default AssetMetadata;
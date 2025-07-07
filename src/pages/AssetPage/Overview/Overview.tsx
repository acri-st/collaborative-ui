import { externalURLValidation, FormField, getAssetTypeLabel, IAssetMetadata, SOURCE_TYPE } from "@desp-aas/desp-ui-fwk";
import { IAssetTabProps, defaultNullPlaceholder } from "../common";
import { EditableFormField } from "../../../components/EditableFormField/EditableFormField";
import { useCallback } from "react";
import './Overview.css';
import { FaChevronRight } from "react-icons/fa6";
import { icons } from "../../../utils/icons";
import { Link } from "react-router-dom";
export const Overview = (props: IAssetTabProps) => {

    const onUpdate = useCallback((updates: Partial<IAssetMetadata>)=>{ 
        props.updateAsset({ metadata: {...props.asset.metadata, ...updates } }) 
    }, [ props.asset ])
    
    return (
        <>
            <h2>About {getAssetTypeLabel(props.asset.type)}</h2>

            {
                props.asset.source == SOURCE_TYPE.external &&
                <div id="asset-external-container">
                    {
                        props.asset.metadata?.externalURL &&
                        <Link
                            id="asset-external-link"
                            className="button rounded inverted external-link"
                            to={props.asset.metadata.externalURL}
                            target="_blank"
                        >
                            { icons.externalLink }
                            View external link
                            <span className="chevron">
                                <FaChevronRight/>
                            </span>
                        </Link>
                    }
                    {
                        props.editMode &&
                        <EditableFormField
                            value={props.asset.metadata?.externalURL}
                            placeholder={props.editMode ? `Tell us something about the ${getAssetTypeLabel(props.asset.type)}` : defaultNullPlaceholder}
                            onEnter={(externalURL)=>onUpdate({ externalURL })}
                            onUpdate={(externalURL)=>onUpdate({ externalURL })}
                            confirmBeforeUpdate
                            disabledEditable={!props.editMode}
                            validation={externalURLValidation}
                            notNull
                            // id="asset-description"
                        />
                    }
                </div>
            }
            <div id="asset-description">
                <EditableFormField
                    value={props.asset.metadata?.description}
                    // textArea={{
                    //     textAreaProps: {
                    //     }
                    // }}
                    richText={{}}
                    placeholder={props.editMode ? `Tell us something about the ${getAssetTypeLabel(props.asset.type)}` : defaultNullPlaceholder}
                    onEnter={(description)=>onUpdate({ description })}
                    onUpdate={(description)=>onUpdate({ description })}
                    confirmBeforeUpdate
                    disabledEditable={!props.editMode}
                    // id="asset-description"
                />
            </div>
        </>
    )
}
export default Overview;
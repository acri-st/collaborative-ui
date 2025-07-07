import { useEffect, useState } from "react";
import { IAssetTabProps } from "../common";
import './Details.css'
import dayjs from "dayjs";
import { ITab, Tabs } from "@desp-aas/desp-ui-fwk";
import { IAssetFilter } from "../../../utils/catalog";
import { AssetMetadataField } from "../AssetMetadataField/AssetMetadataField";

const formatDate = (date: string|undefined) =>{
    return date ? dayjs(date).format('DD-MM-YYYY') : undefined;
}

type IDetailSection = {
    [section: string]: IAssetFilter[]
}

export const Details = (props: IAssetTabProps) => {
    const [tabs, setTabs] = useState<ITab[]>([]);
    const [selectedTab, setSelectedTab] = useState<string|undefined>();
    const [sections, setSections] = useState<IDetailSection>({});


    useEffect(()=>{
        let sections: IDetailSection = {};
        for(let metadata of props.assetMetadata || []){
            if(metadata.section && metadata.section !== 'metadata' && metadata.name !== 'description'){
                sections[metadata.section] = sections[metadata.section] || [];
                sections[metadata.section].push(metadata);
            }
        }

        setSections(sections)
        setTabs(Object.keys(sections).map((section)=>({ label: section, path: section })))
        setSelectedTab(Object.keys(sections)[0])
    }, [ props.assetMetadata ])

    return (
        <div id="details-content" className={props.asset.type}>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} vertical/>

            <div id="details-tab-content">
                {
                    selectedTab &&
                    sections[selectedTab]?.map((metadata)=>(
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
            </div>
        </div>
    )
}


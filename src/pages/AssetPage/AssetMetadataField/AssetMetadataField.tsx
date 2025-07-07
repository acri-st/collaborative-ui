import { useCallback, useMemo, useRef } from "react";
import { EditableFormField } from "../../../components/EditableFormField/EditableFormField";
import { IAssetFilter } from "../../../utils/catalog";
import { defaultNullPlaceholder, IAssetTabProps } from "../common";
import dayjs from "dayjs";
import { Editor } from "@monaco-editor/react";
import { IAsset } from "@desp-aas/desp-ui-fwk";

type IProps = {
    asset: IAsset
    editMode?: boolean
    updating?: boolean
    metadata: IAssetFilter
    updateAsset: IAssetTabProps['updateAsset']
    
}
const formatDate = (date: string|undefined) =>{
    return date ? dayjs(date).format('DD-MM-YYYY') : undefined;
}

export const AssetMetadataField = (props: IProps) => {

    const id = useMemo(()=>{
        return `asset-metadata-field-${props.metadata.name}`
    }, [props.metadata.name, props.asset.id])

    const onUpdate = useCallback((field: string)=>{
        return (value:any) => { props.updateAsset({ metadata: { ...props.asset.metadata, [field]: value } }) }
    }, [ props.asset ])
    
    // if(
    //     [
    //         'duration_time_unit'
    //     ].includes(props.metadata.type)
    // ){
    //     return null;
    // }
    // else 
    if(props.metadata.type === 'select'){
        return (
            <EditableFormField
                id={id}
                disableConfirm={props.updating}
                removeButtons 
                disabledEditable={!props.editMode} 
                editing={props.editMode}
                placeholder={!props.editMode ? defaultNullPlaceholder : undefined}
                label={props.metadata.label}
                value={props.asset.metadata?.[props.metadata.name]}
                onUpdate={onUpdate(props.metadata.name)}
                select={{ 
                    options: props.metadata.options.values.map((value)=>({ label: value, value })),
                    search: props.metadata.options.values?.length > 8,
                    nullable: true
                }}
            />
        )
    }
    else if( props.metadata.type === 'code'){
        return (
            <EditableFormField
                id={id}
                label={props.metadata.label}
                editableFormFieldClassName="code-area-field"
                custom={(_props)=>(
                    props.metadata.type === 'code' &&
                    <Editor 
                        height="100%" 
                        width="100%"
                        language={ 
                            props.metadata?.options?.highlight_reference 
                            ?  props.asset.metadata?.[props.metadata.options.highlight_reference ]
                            :  'javascript'
                        }
                        theme="vs-dark"
                        defaultValue={_props.value}
                        onChange={_props.onUpdate}
                        options={{
                            minimap: { enabled: false }
                        }}
                    />
                )}
    
                displayedValue={                       
                    <Editor 
                        height="100%" 
                        width="100%"
                        language={ 
                            props.metadata?.options?.highlight_reference 
                            ?  props.asset.metadata?.[props.metadata.options.highlight_reference ]
                            :  'javascript'
                        }
                        theme="vs-dark"
                        value={props.asset.metadata?.[props.metadata.name]}
                        options={{
                            minimap: { enabled: false },
                            readOnly: true
                        }}
                    />
                }
                value={props.asset.metadata?.[props.metadata.name]}
                placeholder={props.editMode ? defaultNullPlaceholder : undefined}
                onUpdate={onUpdate(props.metadata.name)}

                confirmBeforeUpdate
                disabledEditable={!props.editMode}
                disableConfirm={props.updating}
            />
        )
    }
    // else if(props.metadata.type === 'text'){
    //     return (
    //         <EditableFormField
    //             label={props.metadata.label}
    //             editableFormFieldClassName="markdown-field"
    //             custom={(_props)=>(
    //                 <MDEditor 
    //                     ref={editorRef}
    //                     height="100%"
                        
    //                     initialEditType="wysiwyg"
    //                     onChange={(ev)=>{
    //                         // console.log("changes",editorRef?.current?.getInstance()?.getMarkdown() )
    //                         _props.onUpdate(editorRef?.current?.getInstance()?.getMarkdown() )
    //                     }}
    //                     // onKeydown={(ev)=>{console.log("changes",editorRef?.current?.getInstance()?.getMarkdown() )}}
    //                     initialValue={_props.value || ''}
    //                     useCommandShortcut={true}
    //                     usageStatistics={false}
    //                 />
    //             )}
    
    //             displayedValue={
    //                 <div className="markdown-preview">
    //                     <Markdown>{props.asset.metadata?.[props.metadata.name] || ''}</Markdown>
    //                 </div>
    //             }
    //             value={props.asset.metadata?.[props.metadata.name]}
    //             placeholder={props.editMode ? defaultNullPlaceholder : undefined}
    //             onUpdate={onUpdate(props.metadata.name)}

    //             confirmBeforeUpdate
    //             disabledEditable={!props.editMode}
    //             disableConfirm={props.updating}
    //         />
    //     )
    // }
    else if(props.metadata.type === 'text'){
        return (
            <EditableFormField
                id={id}
                label={props.metadata.label}
                richText={{}}
                // textArea={{}}
                value={props.asset.metadata?.[props.metadata.name]}
                placeholder={props.editMode ? defaultNullPlaceholder : undefined}
                onEnter={onUpdate(props.metadata.name)}
                onUpdate={onUpdate(props.metadata.name)}
                confirmBeforeUpdate
                disabledEditable={!props.editMode}
                disableConfirm={props.updating}
            />
        )
    }
    else if(props.metadata.type === 'datetime'){
        return (
            <EditableFormField
                id={id}
                label={props.metadata.label}
                value={props.asset.metadata?.[props.metadata.name] ? props.asset.metadata?.[props.metadata.name] : undefined}
                displayedValue={formatDate(props.asset.metadata?.[props.metadata.name])}
                onEnter={onUpdate(props.metadata.name)}
                onUpdate={onUpdate(props.metadata.name)}
                disableConfirm={props.updating}
                placeholder={!props.editMode ? defaultNullPlaceholder : undefined}
                confirmBeforeUpdate
                // editing={props.editMode}
                disabledEditable={!props.editMode}
                inputProps={{
                    type: "date"
                }}
                validation={[
                    // TEMPORARY must change when backend is updated
                    props.metadata.name === 'date_start' 
                    ?
                        { 
                            description: <>Start date must be before stop date</>, 
                            validation: (value)=> !props.asset.metadata?.date_stop || dayjs(value).isBefore(dayjs(props.asset.metadata?.date_stop))
                        }
                    :
                        { 
                            description: <>Stop date must be after start date</>, 
                            validation: (value)=> !props.asset.metadata?.date_start || dayjs(props.asset.metadata?.date_start).isBefore(dayjs(value))
                        }
                ]}
            />
        )
    }
    else if(props.metadata.type === 'duration'){
        return (
            <EditableFormField 
                id={id}
                disableConfirm={props.updating}
                disabledEditable={!props.editMode} 
                placeholder={!props.editMode ? defaultNullPlaceholder : undefined}
                label={props.metadata.label}
                value={props.asset.metadata?.[props.metadata.name]}
                onUpdate={onUpdate(props.metadata.name)}
                confirmBeforeUpdate
                inputProps={{
                    type: "number"
                }}
            />
        )
    }
    else return (
            <EditableFormField 
                id={id}
                disableConfirm={props.updating}
                disabledEditable={!props.editMode} 
                // editing={props.editMode}
                placeholder={!props.editMode ? defaultNullPlaceholder : undefined}
                label={props.metadata.label}
                value={props.asset.metadata?.[props.metadata.name]}
                onUpdate={onUpdate(props.metadata.name)}
                confirmBeforeUpdate
            />
        )
}


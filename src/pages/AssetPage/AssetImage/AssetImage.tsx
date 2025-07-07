import { checkImageLimits, checkSupportedFormats, confirm, deleteAssetImage, DropzonContent, Dropzone, FWKIcons, getAssetTypeLabel, handleRequestError, IAsset, IDropzoneLimits, Loading, Logger, toast, uploadAssetThumbnail } from "@desp-aas/desp-ui-fwk";
import AssetSource from "../../../components/AssetSource/AssetSource";
import './AssetImage.css';
import { ChangeEvent, RefObject, useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import axios from "axios";

type IProps = {
    asset: IAsset
    image?: string
    editMode?: boolean
    pageRef: RefObject<HTMLDivElement>
}

let timeout: any;

const logger = new Logger('Asset', 'AssetImage')

const IMAGE_FORMATS = [ "image/png", "image/jpeg", "image/jpg", "image/webp" ]

export const IMAGE_LIMITS: IDropzoneLimits = { dimensions: { height: 512, width: 512 } };

export const AssetImage = (props: IProps) =>{
    const ref = useRef<HTMLInputElement>(null);
    const [ newImage, setNewImage ] = useState<File|undefined>();
    const [ newImagePreview, setNewImagePreview ] = useState<string|ArrayBuffer|null|undefined>();
    const [ dragging, setDragging ] = useState(false);
    const [ updating, setUpdating ] = useState(false);
    const [ deleting, setDeleting ] = useState(false);
    const [ isDefaultImage, setIsDefaultImage ] = useState(true);
    const [ imageCacheID, setImageCacheID ] = useState(Math.random())
    const [ assetImage, setAssetImage ] = useState<string|undefined>();

    const onDragEnter = useCallback((ev: DragEvent)=>{ 
        setDragging(true); 
        if(timeout) clearTimeout(timeout)
        timeout = setTimeout(()=>{
            setDragging(false)
        }, 2000)
    }, [])

    useEffect(()=>{
        // console.log("props.pageRef.current", props.pageRef)
        // window.document.body.addEventListener("dragover", onDragEnter, true);
        props.pageRef.current?.addEventListener("dragover", onDragEnter, true);

        return ()=>{
            props.pageRef.current?.removeEventListener("dragover", onDragEnter, true);
        }

    }, [props.pageRef])
    
    const updatedImage = useCallback(()=>{
        setImageCacheID(Math.random())
    }, [])

    useEffect(()=>{
        if(!newImage) setNewImagePreview(undefined)
        else{
            const reader = new FileReader();
            reader.addEventListener("load", ()=>{
                setNewImagePreview(reader.result)
            })
            reader.readAsDataURL(newImage)
        }
    }, [ newImage ])

    const onEditClick = useCallback(()=>{
        if(ref.current && props.editMode){
            ref.current.click();
        }
    }, [ ref, props.editMode ])

    
    const onDrop = useCallback((files: FileList)=>{
        if(props.editMode){
            setDragging(false);
            setNewImage(files[0] ? files[0] : undefined)
        }
    }, [ props.editMode ])
    
    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement> )=>{
        if(!props.editMode || !(ev.target.files && ev.target.files.length > 0)) return;
        let file = ev.target.files?.[0];
        try{
            checkSupportedFormats(IMAGE_FORMATS, file);

            checkImageLimits( IMAGE_LIMITS, file)
            .then(()=>{
                setNewImage(file ? file : undefined)
            })
        }
        catch(e){}
    }, [ props.editMode ])

    const onConfirmClick = useCallback(()=>{
        if(props.editMode && newImage){
            setUpdating(true);
            uploadAssetThumbnail(props.asset.id.toString(), newImage)
            .then(()=>{
                toast(`Successfully updated ${getAssetTypeLabel(props.asset.type)} image`, { type: 'success' });
                setNewImage(undefined)
                updatedImage()
            })
            .catch((e)=>{
                logger.error("Upload image error", e)
                handleRequestError(e, { defaultMessage: `Failed to update ${getAssetTypeLabel(props.asset.type)} image, please try again later` })
            })
            .finally(()=>{
                setUpdating(false);
            })
        }
    }, [ props.editMode, newImage ])

    const onCancelClick = useCallback(()=>{
        if(props.editMode){
            setNewImage(undefined)
        }
    }, [ props.editMode ])

    
    const onDeleteClick = useCallback(()=>{
        if(props.editMode){
            confirm({
                title: "Delete thumbnail",
                message: "Are you sure you want to delete the thumbnail?",
                onConfirm: ()=>{
                    setDeleting(true)
                    deleteAssetImage(props.asset)
                    .then(()=>{
                        toast(<>Successfully removed asset image.</>, { type: 'success' })
                        updatedImage()
                    })
                    .catch((e)=>{
                        handleRequestError(e, { defaultMessage: "An error has occured during thumbnail deletion. Please try again later" })
                    })
                    .finally(()=>{
                        setDeleting(false)
                    })
                }
            })
        }
    }, [ props.editMode, props.asset ])

    useEffect(()=>{
        axios.get(`/storage/thumbnail/${props.asset.id}?cache=${imageCacheID}`, {
            responseType: "blob"
        })
        .then((response)=>{
            setIsDefaultImage(response.headers.is_default === "true")
            let contentType = response.headers["content-type"];
            if(contentType){
                let assetImage = URL.createObjectURL(response.data);
                setAssetImage(assetImage);
            }
        })
        .catch((e)=>{
            logger.error("get image error", e)
        })
    }, [ props.asset, imageCacheID ])

    return (
        <Dropzone
            id="asset-banner-image"
            disableDrag={updating || !props.editMode}
            limits={IMAGE_LIMITS}
            dropzoneContent={(dragging)=> dragging 
                ? <DropzonContent limits={IMAGE_LIMITS}>DROP NEW IMAGE HERE</DropzonContent>
                : <DropzonContent limits={IMAGE_LIMITS}>CLICK TO CHANGE</DropzonContent>
            }
            // dropzoneContent={(dragging)=> dragging ? "DROP NEW IMAGE HERE" : "CLICK TO CHANGE"  
            // }
            supportedFormats={IMAGE_FORMATS}
            onDrop={onDrop}
            dragRef={props.pageRef}
            dropzoneAreaClick={onEditClick}
            className={classNames({ "image": true, "dragging": dragging})}
            divProps={{
                style: { backgroundImage: `url(${ newImagePreview || assetImage})` }
            }}
            pointerEvents
        >

            {
                props.asset &&
                <AssetSource asset={props.asset}/>
            }
            {
                props.editMode &&
                <>
                    <input 
                        ref={ref} id="asset-image-input" type="file" accept={IMAGE_FORMATS.join(",")}
                        onInput={handleInputChange} 
                        value={[]}
                        
                    />
                    {
                        updating &&
                        <div id="asset-banner-updating">
                            <Loading/>
                        </div>
                    }
                    <div id="asset-image-operations">
                        <div
                            className="button asset-image-edit operation blue"
                            onClick={onEditClick}
                        >
                            { FWKIcons.edit } Edit
                        </div>
                        
                        {
                            newImage ?
                            <>
                                <div
                                    className={classNames({"button asset-image-accept green operation": true, "disabled": updating})}
                                    onClick={onConfirmClick}
                                >
                                    { FWKIcons.confirm } Confirm
                                </div>
                                <div
                                    className={classNames({"button asset-image-accept red operation": true, "disabled": updating})}
                                    onClick={onCancelClick}
                                >
                                    { FWKIcons.cancel } Cancel
                                </div>
                            </>
                            :
                            !isDefaultImage &&
                            <>
                            
                                <div
                                    className={classNames({"button asset-image-edit operation red": true, "disabled": deleting})}
                                    onClick={onDeleteClick}
                                >
                                    
                                    { deleting ? <Loading/> : FWKIcons.delete } Delete
                                </div>
                            </>
                        }
                    </div>
                </>
            }

        </Dropzone>
    )
}
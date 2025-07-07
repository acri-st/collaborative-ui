import classNames from 'classnames';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import './UserProfileAvatar.css';
import { checkImageLimits, confirm, deleteUserAvatar, DropzonContent, Dropzone, FWKIcons, handleRequestError, IDropzoneLimits, IUser, Loading, Logger, randomID, setAuth, toast, uploadAvatar, UserAvatar } from '@desp-aas/desp-ui-fwk';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const logger = new Logger("component", "UserProfileAvatar");

type IProps = {
    user: IUser
    userPage?: boolean
}

let timeout: any;

const IMAGE_FORMATS = [ "image/png", "image/jpeg", "image/jpg", "image/webp" ]

export const IMAGE_LIMITS: IDropzoneLimits = { dimensions: { height: 256, width: 256 } };

export function UserProfileAvatar(props: IProps) {
    const ref = useRef<HTMLInputElement>(null);

    const [ newImage, setNewImage ] = useState<File|undefined>();
    const [ newImagePreview, setNewImagePreview ] = useState<string|ArrayBuffer|null|undefined>();
    const [ dragging, setDragging ] = useState(false);
    const [ updating, setUpdating ] = useState(false);
    
    const [ deleting, setDeleting ] = useState(false);
    const [ isDefaultImage, setIsDefaultImage ] = useState(true);
    const [ imageCacheID, setImageCacheID ] = useState(Math.random())
    const [ avatarImage, setAvatarImage ] = useState<string|undefined>();
    
    const updatedImage = useCallback(()=>{
        setImageCacheID(Math.random())
    }, [])

    const dispatch = useDispatch();

    const onDragEnter = useCallback((ev: DragEvent)=>{ 
        setDragging(true); 
        if(timeout) clearTimeout(timeout)
        timeout = setTimeout(()=>{
            setDragging(false)
        }, 2000)
    }, [])

    useEffect(()=>{
        window.document.body.addEventListener("dragover", onDragEnter, true);
        return ()=>{
            window.document.body.removeEventListener("dragover", onDragEnter, true);
        }

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
        if(ref.current && props.userPage){
            ref.current.click();
        }
    }, [ ref, props.userPage ])

    
    const onDrop = useCallback((files: FileList)=>{
        if(props.userPage){
            setDragging(false);
            setNewImage(files[0] ? files[0] : undefined)
        }
    }, [ props.userPage ])
    
    
    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement> )=>{
        if(!props.userPage || !(ev.target.files && ev.target.files.length > 0)) return;
        let file = ev.target.files?.[0];
        checkImageLimits( IMAGE_LIMITS, file)
        .then(()=>{
            setNewImage(file ? file : undefined)
        })
    }, [ props.userPage ])
    

    const onConfirmClick = useCallback(()=>{
        if(props.userPage && newImage){
            setUpdating(true);
            uploadAvatar(props.user.id.toString(), newImage)
            .then(()=>{
                dispatch(setAuth({ avatarID: randomID() }))
                toast(`Successfully updated avatar`, { type: 'success' });
                setNewImage(undefined)
                updatedImage();
            })
            .catch((e)=>{
                handleRequestError(e, { defaultMessage: "Failed to update avatar, please try again later" })
                logger.error("Upload image error", e)
            })
            .finally(()=>{
                setUpdating(false);
            })
        }
    }, [ props.userPage, newImage ])

    const onCancelClick = useCallback(()=>{
        if(props.userPage){
            setNewImage(undefined)
        }
    }, [ props.userPage,  ])



    const onDeleteClick = useCallback(()=>{
        if(props.userPage){
            confirm({
                title: "Delete avatar",
                message: "Are you sure you want to delete the avatar?",
                onConfirm: ()=>{
                    setDeleting(true)
                    deleteUserAvatar(props.user)
                    .then(()=>{
                        toast(<>Successfully removed asset image.</>, { type: 'success' })
                        dispatch(setAuth({ avatarID: randomID() }))
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
    }, [ props.userPage, props.user ])

    useEffect(()=>{
        axios.get(`/storage/avatar/${props.user.id}?cache=${imageCacheID}`, {
            responseType: "blob"
        })
        .then((response)=>{
            setIsDefaultImage(response.headers.is_default === "true")
            let contentType = response.headers["content-type"];
            if(contentType){
                let avatarImage = URL.createObjectURL(response.data);
                setAvatarImage(avatarImage);
            }
        })
        .catch((e)=>{
            logger.error("get image error", e)
        })
    }, [ props.user, imageCacheID ])


    return (
        <Dropzone
            id="user-profile-avatar"
            disableDrag={updating || !props.userPage}
            limits={IMAGE_LIMITS}
            dropzoneContent={(dragging)=> dragging 
                ? <DropzonContent limits={IMAGE_LIMITS} short>DROP NEW IMAGE HERE</DropzonContent>
                : <DropzonContent limits={IMAGE_LIMITS} short>CLICK TO CHANGE</DropzonContent>
            }
            // dropzoneContent={(dragging)=> dragging ? "DROP NEW IMAGE HERE" : "CLICK TO CHANGE"  
            // }
            supportedFormats={IMAGE_FORMATS}
            onDrop={onDrop}
            // dragRef={props.pageRef}
            dropzoneAreaClick={onEditClick}
            className={classNames({ "image": true, "dragging": dragging})}
            pointerEvents
        >
            <UserAvatar
                id="user-profile-avatar-image"
                user={props.user}
                image={newImagePreview as string || avatarImage}
            >
                <input 
                    ref={ref} id="asset-image-input" type="file" accept={IMAGE_FORMATS.join(",")}
                    onInput={handleInputChange} 
                    value={[]}   
                />
                {
                    updating &&
                    <div id="user-profile-avatar-updating">
                        <Loading/>
                    </div>
                }
                {
                    props.userPage  &&
                    <div id="user-profile-avatar-operations">
                        <div
                            className="button user-profile-avatar-edit operation blue"
                            onClick={onEditClick}
                        >
                            { FWKIcons.edit } Edit
                        </div>

                        {
                            newImage ?
                            <>
                                <div
                                    className={classNames({"button user-profile-avatar-accept green operation icon-only": true, "disabled": updating})}
                                    onClick={onConfirmClick}
                                >
                                    { FWKIcons.confirm }
                                </div>
                                <div
                                    className={classNames({"button user-profile-avatar-accept red operation icon-only": true, "disabled": updating})}
                                    onClick={onCancelClick}
                                >
                                    { FWKIcons.cancel }
                                </div>
                            </>
                            :
                            !isDefaultImage &&
                            <>
                            
                                <div
                                    className={classNames({"button operation red": true, "disabled": deleting})}
                                    onClick={onDeleteClick}
                                >
                                    
                                    { deleting ? <Loading/> : FWKIcons.delete } Delete
                                </div>
                            </>
                        }
                    </div>
                }
            </UserAvatar>

        </Dropzone>
    );
};
export default UserProfileAvatar;
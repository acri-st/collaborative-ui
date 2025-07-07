import { ChangeEvent, useCallback, useRef, useState, DragEvent } from "react"
import { checkFilesLimits, confirm, DropzonContent, Dropzone, DTEAcknowledgement, FormField, FWKIcons, handleRequestError, IAsset, IDropzoneLimits, Loading, Logger, toast, uploadAssetContent } from "@desp-aas/desp-ui-fwk"
import { Modal } from "@mui/material"
import { partial } from "filesize";
import { icons } from "../../../utils/icons";
import classNames from "classnames";
import { BsFileEarmarkArrowUpFill } from "react-icons/bs";

const size = partial({ standard: "jedec" });

const logger = new Logger('Asset', 'FileUpload');

type IProps = {
    id: string
    asset: IAsset
    editMode?: boolean
    onChange: ()=>any
    branch: string
    paths: string[]
}

let timeout: any;

const MAX_SIZE = 50 * Math.pow(1024, 2);

const UPLOAD_LIMITS: IDropzoneLimits = { size: { max: MAX_SIZE } }

export const FileUpload = (props: IProps) =>{
    const ref = useRef<HTMLInputElement>(null);
    const dragRef = useRef<HTMLInputElement>(null);
    const [ modalOpen, setModalOpen ] = useState(false);
    const [ files, setFiles ] = useState<File[]>([]);
    
    const [commitMessage, setCommitMessage ] = useState('');
    const [ uploading, setUploading ] = useState(false);

    const openModal = useCallback(()=>{
        setModalOpen(true)
    }, [])
    const closeModal = useCallback(()=>{
        setModalOpen(false)
    }, [])


    const handleAddFiles = useCallback((newFiles: File[])=>{
        try{
            let _files = [ ...files, ...newFiles ]
                .filter((file, index, self) => 
                    index === self.findIndex((f) => f.name === file.name)
                )
                .sort((a,b)=> a.name.localeCompare(b.name));
            setFiles(_files);
        }
        catch(e){
            logger.error("An error has occured during file upload", e)
        }
    }, [ files ])

    const removeAll = useCallback(()=>{
        confirm({
            title: 'Remove selected files',
            message: "Are you sure to remove all selected files?",
            onConfirm: ()=>{
                setFiles([])
            }
        })
    }, [ ])

    
    const onSelectClick = useCallback(()=>{
        if(ref.current && props.editMode){
            ref.current.click();
        }
    }, [ ref, props.editMode ])

    
    const onDrop = useCallback((files: FileList)=>{
        handleAddFiles(Array.from(files))
    }, [ props.editMode, files ]) 
    
    const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement> )=>{
        if(!props.editMode || !(ev.target.files && ev.target.files.length > 0)) return;
        
        // let files = Array.from(ev.target.files)
        checkFilesLimits(UPLOAD_LIMITS, ev.target.files);
        handleAddFiles(Array.from(ev.target.files));


    }, [ props.editMode, files ])

    const removeFile = useCallback((index: number)=>{
        if(uploading) return;
        const _files = [...files];
        _files.splice(index, 1);
        setFiles(_files);
    }, [ files ])

    const uploadFiles = useCallback(()=>{
        if(props.asset.repository){
            setUploading(true)
            uploadAssetContent(props.asset.repository.id, commitMessage, files, props.paths.join('/'))
            .then(()=>{
                toast(<>Succesffuly uploaded files with commit message "{commitMessage}"</>, { type: "success" })
                logger.debug(`Upload successful with ${commitMessage}`)
                setModalOpen(false);
                setFiles([]);
                setCommitMessage('');
                props.onChange();
            })
            .catch((e)=>{
                logger.error("Failed to upload, check stack trace in logs", e)
                handleRequestError(e, { defaultMessage: "Failed to upload files, please try again later" })

            })
            .finally(()=>{
                setUploading(false)
            })
        }
    }, [ files, props.asset, commitMessage, props.branch ])

    return (
        <>
            <div 
                className="button green inverted"
                onClick={openModal}
                id={props.id}
            >
                { icons.create } Add files
            </div>
            <Modal
                open={modalOpen}
                onClose={closeModal}
                id="file-upload-modal"
                ref={dragRef}
            >
                <div
                    id="file-upload-content"
                >
                    <h2>Upload content</h2>
                    <p>
                        You can drop the file you want to upload below or use the button "Select files". You can select individual files or a zip, the first level of zip will be expended
                    </p>
                    <p id="upload-restrictions">
                        {FWKIcons.warning} File must be under {size(MAX_SIZE)}
                    </p>
                    <p id="upload-restrictions">
                        {FWKIcons.warning} {DTEAcknowledgement}
                    </p>
                    <FormField
                        id="upload-file-commit-message"
                        label={<>Commit message</>}
                        required
                        value={commitMessage}
                        onUpdate={setCommitMessage}
                        validation={[
                            { description: "Must be at least 4 characters long.", validation: ()=> commitMessage.length >= 4 }
                        ]}
                    />
                    
                    <Dropzone
                        disableDrag={uploading}
                        dropzoneContent={<DropzonContent limits={UPLOAD_LIMITS}>DROP FILE(S) HERE</DropzonContent>}
                        id="file-upload-files"
                        onDrop={onDrop}
                        dragRef={dragRef}
                        limits={UPLOAD_LIMITS}
                    >
                        
                        <input 
                            ref={ref} id="file-upload-input" type="file"
                            onInput={handleInputChange} 
                            value={[]} multiple
                            disabled={uploading}
                        />
                        {
                            files.length > 0 
                            ?
                                files.map((f,idx)=>(
                                    <div className="file-upload-file" key={idx}>
                                        <div className="file-upload-file-name">
                                            { f.name }
                                        </div>
                                        <div className="file-upload-file-size">
                                            { size(f.size) }
                                        </div>
                                        <div
                                            className={classNames({"file-upload-file-remove button red small icon-only inverted operation": true, "disabled": uploading })}
                                            onClick={()=>removeFile(idx)}
                                        >
                                            { FWKIcons.delete }
                                        </div>
                                    </div>
                                ))
                            :
                                <div className="no-data padding centered">
                                    Select or drag and drop files
                                </div>
                        }
                    </Dropzone>
                    <div id="file-upload-buttons">

                        <div 
                            className={classNames({"button green inverted": true, "disabled": uploading})}
                            id="file-select-button"
                            onClick={onSelectClick}
                        >
                            <BsFileEarmarkArrowUpFill /> Select files
                        </div>

                        {
                            files.length > 0 &&
                            
                            <div 
                                className={classNames({"button red inverted": true, "disabled": uploading})}
                                id="file-remove-all-button"
                                onClick={removeAll}
                            >
                                { FWKIcons.delete } Remove all
                            </div>
                        }
                        
                        <div 
                            className={classNames({ 
                                "button blue inverted": true, 
                                "disabled": !(files.length > 0 && commitMessage.length >= 4 ) || uploading
                            })}
                            id="file-upload-button"
                            onClick={uploadFiles}
                        >
                            {
                                uploading
                                ? <><Loading/> Uploading...</>
                                : <>{ FWKIcons.upload} Upload files</>
                            }
                            
                        </div>
                    </div>
                    

                    
                </div>
            </Modal>
        </>
    )
}
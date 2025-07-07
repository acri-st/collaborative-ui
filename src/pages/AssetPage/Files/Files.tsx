import { downloadAssetContent, formatFileResponse, FWKIcons, handleRequestError, IFile, IRepositoryList, listAssetRepository, Logger, LoginRequired, toast, useUser } from "@desp-aas/desp-ui-fwk";
import classNames from "classnames";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { partial } from "filesize";
import { useCallback, useEffect, useState } from "react";
import { IAssetTabProps } from "../common";
import './Files.css';
import { FileUpload } from "./FileUpload";
import { icons } from "../../../utils/icons";

const logger = new Logger('asset', 'files')

dayjs.extend(relativeTime)
const size = partial({ standard: "jedec" });

export default function Files(props: IAssetTabProps & { onUpload?: () => any }) {
    const [branch, setBranch] = useState<string>("main");
    const [gitLink, setGitLink] = useState<string|undefined>();
    const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
    const [files, setFiles] = useState<IFile[] | undefined>([]);
    const user = useUser();

    const [paths, setPaths] = useState<string[]>([]);
    // const [paths, setPaths] = useState<string[]>(["folder1", "folder2"]);

    const fetchFiles = useCallback(() => {
        if (
            props.asset && props.asset.repository
            && ( 
                props.editMode
                || props.selectedVersion
            )
        ) {
            setFiles([]);
            setLoadingFiles(true)
            listAssetRepository(
                props.asset.repository.id, 
                "/" + paths.join("/"), props.editMode 
                ? undefined 
                : props.selectedVersion?.marker
            )
                .then((repo: IRepositoryList) => {
                    setFiles(formatFileResponse(repo.files, repo.folders));
                })
                .catch((e) => {
                    logger.error("An error has occured while fetching files", e)
                    handleRequestError(e, { defaultMessage: "An error has occured during file retrieval. Please try again later" })
                })
                .finally(() => {
                    setLoadingFiles(false);
                })
        }
        else {
            setFiles(undefined)
        }
    }, [props.editMode, props.selectedVersion, paths])

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles, paths])

    const downloadFiles = useCallback(() => {
        if (!(files && files.length > 0)) return;

    }, [files])

    useEffect(()=>{
        setGitLink(props.asset.repository?.url.replace(":", "/").replace("git@", "https://").replace(".git", ""))
    }, [ props.asset ])


    const handleTreeClick = useCallback((file: IFile) => {
        if (file.file_type === 'tree') {
            setPaths((paths)=>[...paths, file.filePath.split("/").pop() || ""])
        }
    }, [])

    const handlePathClick = useCallback((idx: number) => {
        if(idx < paths.length - 1)
            setPaths(paths.slice(0, idx + 1))
    }, [paths])

    const handlePreviousPath = useCallback(() => {
        setPaths((paths)=>paths.slice(0, -1))
    }, [])

    return (
        <div id="asset-files">
            <div id="asset-files-operations">
                <div id="asset-files-collaborate-container">
                    {
                        !!user
                        ? <>
                            <a
                                id="asset-files-git-link"
                                className="button external-link inverted"
                                href={gitLink}
                                target="_blank"
                            >
                                {icons.externalLink} Collaborate
                            </a>
                        </> :
                        <>
                        
                            <div
                                id="asset-files-git-link"
                                className="button external-link inverted disabled"
                            >
                                {icons.externalLink} Collaborate
                            </div>
                            <LoginRequired
                                small
                                message="Sign in to collaborate"
                            />
                        </>
                    }
                </div>
                <a
                    id="asset-files-download"
                    className={classNames({ 
                        "button blue inverted": true, 
                        "disabled": !(files && files.length > 0) || (!props.editMode && !props.selectedVersion)
                    })}
                    onClick={downloadFiles}
                    href={downloadAssetContent(props.asset.id, props.editMode ? undefined : props.selectedVersion?.marker)}
                    download
                    target="_blank"
                >
                    {FWKIcons.download} Download files
                </a>
                {
                    props.editMode &&
                    <FileUpload
                        id="asset-files-upload"
                        asset={props.asset}
                        editMode={props.editMode}
                        onChange={() => { fetchFiles(); props.onUpload?.() }}
                        branch={branch}
                        paths={paths}
                    />
                }
            </div>
            <div id="asset-files-path">
                <div className="file-asset-file-path-separator">
                    /
                </div>
                <div 
                    className={classNames({
                        "file-asset-file-path": true,
                        "clickable": paths.length > 0
                    })}
                    onClick={ paths.length > 0 ? ()=>handlePathClick(-1) : undefined}
                >
                    { props.asset.name }
                </div>
                {
                    paths.map((path: string, idx: number) => (
                        <>
                            {
                                // idx <= paths.length - 1 &&
                                <div className="file-asset-file-path-separator" key={idx}>
                                    /
                                </div>
                            }
                            <div 
                                className={classNames({
                                    "file-asset-file-path": true,
                                    "clickable": idx < paths.length - 1
                                })} key={idx}
                                onClick={()=>handlePathClick(idx)}
                            >
                                {path}
                            </div>
                        </>
                    ))
                }
            </div>
            <div id="asset-files-container">
                <div id="asset-files-headers">
                    <div className="asset-files-header name">Name</div>
                    <div className="asset-files-header commit-message">Message</div>
                    <div className="asset-files-header size">Size</div>
                    <div className="asset-files-header time">Last modified</div>
                </div>
                <div id="asset-files-list" className="simple-scrollbar">
                    {}
                    {
                        loadingFiles
                            ?
                            <>
                                <LoadingFile />
                                <LoadingFile />
                                <LoadingFile />
                                <LoadingFile />
                            </>
                            :
                                files
                                    ?
                                    <>
                                        {
                                            paths.length > 0 &&
                                            <div className="file-item folder back" onClick={handlePreviousPath}>
                                                <div className="file-item-value name">{icons.files.folderUp} ..</div>
                                                <div className="file-item-value commit-message" />
                                                <div className="file-item-value size" />
                                                <div className="file-item-value time" />
                                            </div>
                                        }
                                        {
                                            files.length > 0
                                                ?
                                                files.map((file: IFile, idx: number) => (
                                                    
                                                    <div 
                                                        className={classNames({ 
                                                            "file-item": true,
                                                            "folder": file.file_type === 'tree'
                                                        })}key={file.filePath}
                                                        onClick={()=>handleTreeClick(file)}
                                                    >
                                                        <div className="file-item-value name">
                                                            { file.file_type === 'tree' ? icons.files.folder : icons.files.file }
                                                            {file.fileName}
                                                        </div>
                                                        <div className="file-item-value commit-message">{file.commitMessage}</div>
                                                        <div className="file-item-value size">{size(file.size)}</div>
                                                        <div className="file-item-value time">{dayjs(file.commitDate).fromNow()}</div>
                                                    </div>
                                                ))
                                                :
                                                <div className="no-data centered padding">
                                                    No files present.
                                                </div>
                                        }
                                    </>
                                        :
                                        <div className="no-data centered padding">
                                            Failed to retrieve files.
                                        </div>
                    }
                </div>
            </div>
        </div>
    )
}


export const LoadingFile = () => (
    <div className="loading-file-item loading">
        <div className="loading-file-item-value name " />
        <div className="loading-file-item-value commit-message" />
        <div className="loading-file-item-value size" />
        <div className="loading-file-item-value time" />
    </div>
)
import { confirm, deleteAsset, FWKIcons, getAssetTypeLabel, handleRequestError, IconBox, Loading, SOURCE_TYPE } from "@desp-aas/desp-ui-fwk";
import { IAssetTabProps } from "../common";
import { useCallback, useState } from "react";
import './Options.css';
import classNames from "classnames";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Options = (props: IAssetTabProps) => {

    const [ deleting, setDeleting ] = useState(false);

    const navigate = useNavigate();

    const handleDelete = useCallback(()=>{
        
        confirm({
            title: `Delete ${getAssetTypeLabel(props.asset.type)}`,
            message: `Are you sure you want to delete ${getAssetTypeLabel(props.asset.type)} ${props.asset.name}?`,
            onConfirm:()=>{
                setDeleting(true)
    
                deleteAsset(props.asset)
                .then(()=>{
                    toast(<>Successfully deleted asset {props.asset.name}</>, { type: 'success' });
                    navigate('/user')
                })
                .catch((e)=>{
                    handleRequestError(e, { defaultMessage: `An error has occured while deleting the ${getAssetTypeLabel(props.asset.type)} ${props.asset.name}. Please try again later` })
                })
                .finally(()=>{
                    setDeleting(false)
                })
            }
        })
        // confirmAlert({
        //     title: `Delete ${getAssetTypeLabel(props.asset.type)}`,
        //     message: `Are you sure you want to delete ${getAssetTypeLabel(props.asset.type)} ${props.asset.name}?`,
        //     buttons: [
        //         {
        //             label: 'Confirm',
        //             className: 'button green',
        //             onClick: ()=>{
        //                 setDeleting(true)
            
        //                 deleteAsset(props.asset)
        //                 .then(()=>{
        //                     toast(<>Successfully deleted asset {props.asset.name}</>, { type: 'success' });
        //                     navigate('/user')
        //                 })
        //                 .catch(()=>{
        //                     toast(<>An error has occured while deleting the asset {props.asset.name}. Please try again later</>, { type: 'error' });
        //                 })
        //                 .finally(()=>{
        //                     setDeleting(false)
        //                 })
        //             }
        //         },
        //         {
        //             label: 'Cancel',
        //             className: 'button cancel',
        //             // onClick: ()=>{}
        //         }
        //     ]
        // })
    }, [ props.asset ])
    
    return (
        <>
            <h2>Delete {getAssetTypeLabel(props.asset.type)}</h2>
            
            <IconBox
                type="warn"
            >
                <p>
                    Deleting the {getAssetTypeLabel(props.asset.type)} will result in the deletion of all it's contents:
                </p>
                <ul>
                    <li>Information</li>
                    <li>Discussions</li>
                    {
                        props.asset.source === SOURCE_TYPE.user &&
                        <li>Files & git repository</li>
                    }
                </ul>
            </IconBox>
            <br/>

            <div 
                id="delete-asset"
                className={classNames({ "button medium inverted red": true, "disabled": deleting })}
                onClick={handleDelete}
            >
                {
                    deleting
                    ? <> <Loading/> Deleting... </>
                    : <>{ FWKIcons.delete } Delete</>
                }
                
            </div>
        </>
    )
}
export default Options;
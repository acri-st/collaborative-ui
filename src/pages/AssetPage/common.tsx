import { IAsset, IAssetVersion } from "@desp-aas/desp-ui-fwk"
import { IAssetFilter } from "../../utils/catalog"

export type IAssetTabProps = {
    asset: IAsset
    assetMetadata?: IAssetFilter[]
    loadingAssetMetadata: boolean
    editMode: boolean
    updateAsset: (updates: Partial<IAsset>) => any
    updating: boolean
    selectedVersion: IAssetVersion|undefined
    assetVersions: IAssetVersion[]|undefined
}

export const defaultNullPlaceholder = "Not available";

import { Navigation as _Navigation, ASSET_TYPE, FWKIcons, sleep } from '@desp-aas/desp-ui-fwk';
import { routes } from '../../utils/routes';


export default function Navigation() {
    return <_Navigation
        profileLink={"/user"}
        // searchCallback={async()=>{ await sleep(1500) }}
        routes={routes}
        profileRoutes={[
            { id: "new_dataset", path: "/form/"  + ASSET_TYPE.dataset , label: <>New dataset</> },
            { id: "new_model", path: "/form/"  + ASSET_TYPE.model , label: <>New model</> },
            { id: "new_application", path: "/form/"  + ASSET_TYPE.application , label: <>New application</> },
            { id: "new_document", path: "/form/"  + ASSET_TYPE.paper , label: <>New document</> },
            { id: "new_course", path: "/form/"  + ASSET_TYPE.course , label: <>New course</> },
        ]}
    />
}

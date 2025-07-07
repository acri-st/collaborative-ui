import UserProfile from '../../components/UserProfile/UserProfile';
import { Page, useUser } from '@desp-aas/desp-ui-fwk';
import Navigation from '../../components/Navigation/Navigation';

type IProps = {
}

export default function UserPage(props: IProps) {
    const user = useUser();
    
    return <Page
        id="user-page"
        fixedHeight
        background2
        fixedPageThreshold={1050}
    >
        <Navigation/>
        <div className="fixed-page-content">
            {
                user &&
                <UserProfile
                    user={user}
                    userPage
                />
            }
        </div>
    </Page>
};

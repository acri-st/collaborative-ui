import { useEffect, useState } from 'react';
import UserProfile from '../../components/UserProfile/UserProfile';
import { IUser, Loading, Page } from '@desp-aas/desp-ui-fwk';
import './ProfilePage.css';
import { useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';

type IProps = {
}

export function ProfilePage(props: IProps) {
    const [ loading, setLoading ] = useState(false);
    const [ user, setUser ] = useState<IUser>();
    const { user_id } = useParams();

    const fetchUser = async () =>{
        setLoading(true);
        try{
            if(!user_id) throw new Error("no user_id in params")
            // let user = await getUserProfile(user_id);
            let user: IUser = {
                username: user_id,
                displayName: user_id,
                id: user_id
            }
            setUser(user)
        }
        catch(e){

        }
        finally{
            setLoading(false)
        }
    }

    useEffect(function () {
        fetchUser()
    }, []);

    return <Page
        id="user-page"
        fixedHeight
        background2
        fixedPageThreshold={1050}
    >
        <Navigation/>
        <div className="fixed-page-content">
        {
            loading
            ?
                <div className="loading-message"><Loading/> Loading user profile...</div>
            :
                user
                ? <UserProfile
                    user={user}
                />
                : <div className="no-data">
                    user does not exist
                </div>
        }
        </div>
    </Page>
};
export default ProfilePage;
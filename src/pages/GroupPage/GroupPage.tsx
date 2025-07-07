import { FWKIcons, Logger, Page, UserAvatar, getUserLink, toast, useUser, Tabs, ITab, LoginRequired, Loading, confirm, userProfileImage, handleRequestError, IGroup, IGroupParticipant, acceptGroupMember, cancelJoinGroup, deleteGroup, getGroup, getGroupImage, joinGroup, leaveGroup, refuseGroupMember, removeGroupMember } from "@desp-aas/desp-ui-fwk";
import './GroupPage.css'
import { ReactNode, useCallback, useEffect, useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import classNames from "classnames";
import { icons } from "../../utils/icons";
import { NavLink } from "react-router-dom";
import Discussion from "../../components/Discussions/Discussions";

const logger = new Logger("component", "GroupPage");


let joiningInterval: NodeJS.Timeout;


const defaultTabs = [
    {
        path: '',
        label: 'Chat'
        // label: 'Overview'
    },
    {
        path: '/members',
        label: 'Members'
    },
];

export function GroupPage() {
    const { group_id } = useParams() as {group_id: string};

    const [ isOwner, setIsOwner ] = useState<boolean>();
    const [ joined, setJoined ] = useState<boolean>();
    const [ joining, setJoining ] = useState<boolean>();
    const [ memberCount, setMemberCount ] = useState<number>(0);
    const [ tabs, setTabs ] = useState<ITab[]>(defaultTabs);

    const [ group, setGroup ] = useState<IGroup|undefined>();
    const [ members, setMembers ] = useState<IGroupParticipant[]>();
    const [ requests, setRequests ] = useState<IGroupParticipant[]>();
    const [ loading, setLoading ] = useState(false);
    const [ loadingJoin, setLoadingJoin ] = useState(false);
    const [ deleting, setDeletingGroup ] = useState(false);
    
    const currentUser = useUser();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(()=>{
        fetchGroup(!!group);
    }, [ location.pathname ])


    useEffect(()=>{
        if(joining){
            clearInterval(joiningInterval)
            joiningInterval = setInterval(()=>{
                fetchGroup(true)
            }, 10 * 1000)
        }
        else{
            clearInterval(joiningInterval)
        }

    }, [ joining ])

    const fetchGroup = useCallback((withoutLoading?: boolean) =>{
        if(! withoutLoading) setLoading(true);
        getGroup(group_id)
        .then((group)=>{
            setGroup(group);
            if(group){
                let members = [];
                let requests = [];
                let owner: IGroupParticipant|undefined;
                for(let p of group.participants){
                    if(group.despUserId === p.userId){
                        owner = p;
                        owner.status = "owner";
                    }
                    else{
                        if(p.status === 'member'){
                            members.push(p);
                        }
                        else{
                            requests.push(p);
                        }
                    }
                }
                if(owner) members.unshift(owner);
                setMembers(members);
                setRequests(requests);
            }
            else{
                setMembers([]);
                setRequests([]);
            }
        })
        .catch((e)=>{
            toast(<>No group {group_id} found</>, { type: "warning" })
            navigate('/groups')
        })
        .finally(()=>{
            if(! withoutLoading) setLoading(false)
        })
    }, [ group_id ])

    useEffect(()=>{
        
        if(group){

            setIsOwner(currentUser && group.despUserId === currentUser?.username)

            let userParticipant = currentUser ? group.participants.find((p)=> p.userId === currentUser?.username) : undefined;

            setJoined(userParticipant && userParticipant.status === "member");
            setJoining(userParticipant && userParticipant.status === "joining");

            setMemberCount(group.participants.filter((m)=> m.status === "member" || m.status === "owner" ).length)

            // if(userParticipant){
            //     if(userParticipant.status === "member"){
            //         setJoined(true);
            //         setJoining(false);
            //     }
            //     else{
            //         setJoined(false);
            //         setJoining(true);
            //     }
            // }
            // else{
            //     setJoining(false);
            //     setJoined(false);
            // }
        }

        // TABS
        let tabs = [...defaultTabs];
        if(isOwner){
            tabs.push({
                path: '/requests',
                label: 'Requests'
            })
        }
        setTabs(tabs);

        
    }, [ group, currentUser, isOwner ])

    useEffect(()=>{

    }, [])

    const joinGroupCallack = useCallback(()=>{
        if(!(currentUser && group)) return;
        setLoadingJoin(true);
        
        // Cancel join
        if(joining){
            cancelJoinGroup(group)
            .then(()=> { toast(<>Canceled group request {group.name}</>, { type: 'info' }); fetchGroup(); } )
            .catch((e)=> { toast(<></>, { type: 'error' }); 
                handleRequestError(e, { defaultMessage: `An error has occured during group cancelation request for group ${group.name}, please try again later` })
            })
            .finally(()=>setLoadingJoin(false))
        }
        else if(joined && !isOwner ){
            leaveGroup(group)
            .then(()=>{ toast(<>Left group {group.name}</>, { type: 'info' }); fetchGroup() } )
            .catch((e)=> { 
                handleRequestError(e, { defaultMessage: `An error has occured during group leave, please try again later` })
                fetchGroup(true); 
            } )
            .finally(()=>setLoadingJoin(false))
        }
        // Join group
        else{
            joinGroup(group)
            .then(()=> { toast(<>Sent join group request for group {group.name}</>, { type: 'success' }); fetchGroup() } )
            // .then(()=>{ toast(<>Sucessfully joined group {group.name}</>, { type: 'success' }); fetchGroup() })
            .catch((e)=> { 
                handleRequestError(e, { defaultMessage: `An error has occured during group request to join ${group.name}, please try again later` })
                fetchGroup(true); 
            } )
            .finally(()=>setLoadingJoin(false))
        }
    } , [ group, joined, joining ]);


    const handleDeleteGroup = useCallback(()=>{
    
        // Cancel join
        if(isOwner && group){
            confirm({
                title: 'Delete group',
                message: `Are you sure you want to delete the group ${group.name}?`,
                onConfirm: ()=>{
                    setDeletingGroup(true);
                    deleteGroup(group)
                    .then(()=> { 
                        toast(<>Deleted group request {group.name}</>, { type: 'success' });
                        navigate('/groups') 
                    } )
                    .catch((e)=> { 
                        handleRequestError(e, { defaultMessage: `An error has occured during group deletion for group ${group.name}, please try again later` })
                        fetchGroup(true); 
                    } )
                    .finally(()=>setDeletingGroup(false))
                }
            })
        }
    } , [ group, isOwner ]);
    
    return (
        <Page
            id="group-page"
            fixedHeight
            // background2
            footer={{ fixed: true }}
            fixedPageThreshold={1100}
        >
            <Navigation />
            <div className="fixed-page-content">
                
                <div id="group-page-content" className={classNames({ "loading": loading })}>
                    {
                        group
                        ?
                            <>
                                <div id="group-page-left">
                                    
                                    <div id="group-page-banner">
                                        
                                        <div id="group-page-banner-image"
                                            style={{
                                                backgroundImage: `url(${getGroupImage(group)})`
                                            }}
                                        />
                                        <div id="group-page-banner-information">
                                            <div id="group-page-banner-information-content">
                                                <div id="group-page-banner-title">
                                                    { group.name } 
                                                    {/* { group.name } { group.name } { group.name } { group.name } { group.name }  */}
                                                </div>
                                                <div id="group-page-category">
                                                    {/* Air quality and pollution dispersion */}
                                                    {/* Air quality and pollution dispersion models */}
                                                    { group.categoryName }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group-page-section" id="group-description-section">
                                        <div className="simple-scrollbar" id="group-page-description">
                                            { 
                                                group.description 
                                                ?
                                                group.description
                                                :
                                                <div className="no-data">No Description...</div> 
                                            }
                                        </div>
                                    </div>
                                    <div className="group-page-section" id="group-participants-section">
                                        <div className="group-page-header">{icons.groups.members} Members ({ memberCount })</div>
                                        <div id="group-page-participants">
                                            {
                                                members?.slice(0,5).map((p)=>(
                                                    <NavLink className="group-participant" to={getUserLink(p.username)}>
                                                        <UserAvatar 
                                                            className="group-participant-image"
                                                            image={userProfileImage(group.despUserId)} 
                                                            user={{ displayName: p.username, username: p.username, id: p.userId }}
                                                        />
                                                        <div className="group-participant-name">{p.username}</div>
                                                    </NavLink>
                                                )) 
                                            }
                                        </div>
                                        <NavLink to={`/group/${group.id}/members`} id="view-group-participants">
                                            View all {">>"}
                                        </NavLink>
                                    </div>
                                    {
                                        // !isOwner &&
                                        <div id="group-page-operations">
                                            <LoginRequired
                                                small
                                                message="You must be signed in to join a group"
                                            >
                                                {
                                                    !isOwner && 
                                                    <div 
                                                        className={classNames({
                                                            "group-page-operation medium button": true,
                                                            "themed": !(joined || joining),
                                                            "red inverted": (joined || joining),
                                                            "disabled inverted": loading || loadingJoin
                                                        })}
                                                        id="join-group"
                                                        onClick={()=>{
                                                            if(!(loading || loadingJoin)){
                                                                joinGroupCallack()
                                                            }
                                                        }}
                                                    >
                                                        {
                                                            joined
                                                            ? 
                                                                loadingJoin
                                                                ? <><Loading/> Leaving group...</>
                                                                : <>{ icons.groups.leave } Leave group</>
                                                            : joining
                                                            ?
                                                                loadingJoin
                                                                ? <><Loading/> Canceling request...</>
                                                                : <>{ FWKIcons.cancel } Cancel request</>
                                                            : 
                                                                loadingJoin
                                                                ? <><Loading/> Joining group...</>
                                                                // ? <><Loading/> Sending request...</>
                                                                : <>{ icons.groups.join } Join</>
                                                        }
                                                        
                                                    </div>
                                                }
                                                {
                                                    isOwner &&
                                                    <>
                                                        <div 
                                                            className={classNames({
                                                                "group-page-operation medium button red inverted": true,
                                                                "disabled inverted": deleting
                                                            })}
                                                            id="join-group"
                                                            onClick={()=>{
                                                                if(!(deleting)){
                                                                    handleDeleteGroup()
                                                                }
                                                            }}
                                                        >
                                                            {
                                                                deleting
                                                                ? <><Loading/> Deleting group...</>
                                                                : <>{ FWKIcons.delete } Delete</>
                                                            }
                                                            
                                                        </div>

                                                    </>
                                                }
                                            </LoginRequired>
                                        </div>
                                    }
                
                                </div>
                                <div id="group-page-right">
                                    <div id="group-page-tabs">
                                        <Tabs pathPrefix={`/group/${group.id}`} tabs={tabs}/>
                                    </div>
                                    <Routes>
                                        <Route path="/" element={<>
                                            <div className="group-page-section" id="group-chat-section">
                                                {/* <div className="group-page-header">{icons.section.chat} Chat</div> */}
                                                {
                                                    group &&
                                                    <>
                                                        <Discussion 
                                                            chatView topicId={group.topicId}
                                                            hideNewPost={!(joined || isOwner)}
                                                            loopFetch
                                                        />
                                                        {
                                                            !(joined || isOwner) &&
                                                            <div  className="centered">
                                                                <div className="no-data" style={{ marginTop: 10 }}>Join group to participate in chat</div>
                                                            </div>
                                                        }
                                                    </>
                                                }
                                            </div>
                                            {/* <div className="group-page-section" id="group-files-section">
                                                <div className="group-page-header">{icons.section.chat} Chat</div>
                                                <div className="no-data">
                                                    COMING SOON
                                                </div>
                                            </div>    */}
                                            {/* <div className="group-page-section" id="group-files-section">
                                                <div className="group-page-header">{icons.section.files} Files</div>
                                                <div className="no-data">
                                                    COMING SOON
                                                </div>
                                            </div>     */}
                                        </>}/>
                                        <Route path="/members" element={<>
                                            <div className="group-page-section" id="group-members-section">
                                                <ParticipantList
                                                    title={<>{icons.groups.members} Members </>} participants={members}
                                                    operations={
                                                        members && isOwner ?
                                                        (participant, index)=>{
                                                            if(participant.status === "owner") return null;
                                                            return (
                                                                <>
                                                                    <RemoveMemberOperation group={group} member={participant} onRemove={()=>{
                                                                        fetchGroup(true)
                                                                    }}/>
                                                                </>
                                                            )
                                                        }
                                                        : undefined
                                                    }
                                                />
                                            </div>
                                        </>}/>
                                        {
                                            // isOwner &&
                                            <Route path="/requests" element={<>
                                                <div className="group-page-section" id="group-members-section">
                                                    <ParticipantList 
                                                        title={<>{icons.groups.members} Requests </>} 
                                                        participants={requests}
                                                        operations={
                                                            requests && isOwner ?
                                                            (participant, index)=>{
                                                                return (
                                                                    <>
                                                                        <AcceptRefuseMemberOperations group={group} member={participant} onChange={()=>{
                                                                            fetchGroup(true)
                                                                        }}/>
                                                                    </>
                                                                )
                                                            }
                                                            : undefined
                                                        }
                                                    />
                                                </div>
                                            </>}/>
                                        }
                                        <Route path="*" element={<Navigate to={`/group/${group.id}`}/>}/>
                                    </Routes>
                                </div>
                            </>
                        :
                            <>
                                <div id="group-page-left" className="loading">
                                    
                                    <div id="group-page-banner">
                                        <div id="group-page-banner-image-loading"/>
                                        <div id="group-page-banner-information-loading">
                                            <div id="group-page-banner-information-content">
                                                <div id="group-page-banner-title-loading"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group-page-section-loading" id="group-description-section">
                                        <div id="group-page-description">
                                            <div className="group-description-loading-line"/>
                                            <div className="group-description-loading-line"/>
                                            <div className="group-description-loading-line"/>
                                            <div className="group-description-loading-line"/>
                                            <div className="group-description-loading-line end"/>
                                        </div>
                                    </div>
                                    <div className="group-page-section-loading" id="group-participants-section">
                                        <div className="group-page-header-loading"/>

                                        <div id="group-page-participants">
                                            {
                                                new Array(5).fill(null).map((_, idx)=>(
                                                    <div className="group-participant-loading" key={idx}>
                                                        <div className="group-participant-image-loading"/>
                                                        <div className="group-participant-name-loading"/>
                                                    </div>
                                                ))
                                            }
                                        </div>

                                        <div id="view-group-participants-loading"/>
                                    </div>
                                    <div id="group-page-operations">
                                        <div className="group-page-operation medium button themed disabled" id="join-group-loading">
                                            <div id="join-group-text-loading"/>
                                        </div>
                                    </div>
                
                                </div>
                                <div id="group-page-right" className="loading">
                                    <div className="group-page-section-loading" id="loading-section-right-1"/>
                                    <div className="group-page-section-loading" id="loading-section-right-2"/>
                                </div>
                            </>
                    }



                </div>
            </div>
        </Page>
    )
}

type IParticpantListProps = {
    title: ReactNode
    participants?: IGroupParticipant[]
    operations?: (participant: IGroupParticipant, index: number)=>ReactNode
}
const ParticipantList = (props: IParticpantListProps) =>{
    return (
        <>
        <div className="group-page-header">{props.title} ({ props.participants?.length || '0' })</div>
            <div id="group-page-members" className="simple-scrollbar">
                {
                    props.participants?.map((p, idx)=>(
                        <div className="group-member" key={idx}>
                            <NavLink  className="group-member-link" to={getUserLink(p.username)}>
                                <UserAvatar 
                                    className="group-member-image"
                                    // image={getUserImage(group)} 
                                    user={{ displayName: p.username, username: p.username, id: p.userId }}
                                />
                                <div className="group-member-name">
                                    {p.username}
                                </div>
                            </NavLink>
                            <div className="group-member-status">{p.status}</div>
                            {
                                props.operations &&
                                <div className="group-member-operations">
                                    { props.operations?.(p, idx) }
                                </div>

                            }
                        </div>
                    )) 
                }
            </div>
        </>
    )
}

type RemoveMemberOperationProps = {
    group: IGroup
    member: IGroupParticipant
    onRemove: Function
}

const RemoveMemberOperation = (props: RemoveMemberOperationProps) =>{
    const [ removing, setRemoving ] = useState(false);

    const handleRemoveMember = () =>{
        confirm({
            title: 'Remove member',
            message: `Are you sure you want to remove ${props.member.username} from group ${props.group.name}?`,
            onConfirm: ()=>{
                setRemoving(true)
                removeGroupMember(props.group, props.member)
                .then(()=>{
                    toast(<>Successfully removed user {props.member.username} from group {props.group.name}</>, { type: 'success' })
                    props.onRemove();
                })
                .finally(()=>{
                    setRemoving(false)
                })
            }
        })
    }
    return (
        <div 
            className={classNames({ "button group-operation red inverted icon-only operation": true, "disabled": removing })}
            onClick={handleRemoveMember}
        >
            {
                removing
                ? <Loading/>
                : FWKIcons.delete
            }
        </div>
    )
}

type AcceptRefuseMemberOperationsProps = {
    group: IGroup
    member: IGroupParticipant
    onChange: Function
}

const AcceptRefuseMemberOperations = (props: AcceptRefuseMemberOperationsProps) =>{
    const [ refusing, setRefusing ] = useState(false);
    const [ accepting, setAccepting ] = useState(false);

    const handleRefuse = () =>{
        confirm({
            title: 'Refuse user to join',
            message: `Are you sure you want to refuse ${props.member.username} from joining group ${props.group.name}?`,
            onConfirm: ()=>{
            
                setRefusing(true)
                refuseGroupMember(props.group, props.member)
                .then(()=>{
                    toast(<>Canceled user {props.member.username} request to join group {props.group.name}</>, { type: 'info' })
                    props.onChange();
                })
                .catch((e)=> { 
                    handleRequestError(e, { defaultMessage: "An error has occured during user refuse, please try again later" })
                    props.onChange(); 
                } )
                .finally(()=>{
                    setRefusing(false)
                })
            }
        })
    }
    const handleAccept = () =>{
        setAccepting(true)
        acceptGroupMember(props.group, props.member)
        .then(()=>{
            toast(<>Successfully accepted user {props.member.username} to join group {props.group.name}</>, { type: 'success' })
            props.onChange();
        })
        .catch((e)=> { 
            handleRequestError(e, { defaultMessage: "An error has occured during user accept, please try again later" })
            props.onChange(); 
        } )
        .finally(()=>{
            setAccepting(false)
        })

    }
    return (
        <>
            <div 
                className={classNames({ "button group-operation green inverted icon-only operation": true, "disabled": (accepting || refusing) })}
                onClick={handleAccept}
            >
                {
                    accepting
                    ? <Loading/>
                    : FWKIcons.accept
                }
            </div>
            <div 
                className={classNames({ "button group-operation red inverted icon-only operation": true, "disabled": (accepting || refusing) })}
                onClick={handleRefuse}
            >
                {
                    refusing
                    ? <Loading/>
                    : FWKIcons.cancel
                }
            </div>
        </>
    )
}



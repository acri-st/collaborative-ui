import classNames from 'classnames';
import './GroupList.css';
import { IGroup, Logger } from '@desp-aas/desp-ui-fwk';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import GroupCard from '../GroupCard/GroupCard';
import GroupCardLoading from '../GroupCardLoading/GroupCardLoading';

const logger = new Logger("component", "GroupList");

type IProps = {
    groups: IGroup[] | undefined
    loading: boolean
    paginationMode?: boolean

    previous?: () => any
    next?: () => any
}

export function GroupList(props: IProps) {
    return (
        <div className="group-list">
            {
                props.loading
                    ?
                        props.paginationMode ?
                            <div className="group-list-pagination-results simple-scrollbar">
                                {
                                    new Array(3).fill(null).map((_, idx) => (
                                        <GroupCardLoading key={idx} />
                                    ))
                                }
                            </div>

                            : <div className={classNames({ "group-list-results": true })}>
                                <div className="group-list-results-list simple-scrollbar">
                                    {
                                        new Array(12).fill(null).map((_, idx) => (
                                            <GroupCardLoading key={idx} />
                                        ))
                                    }
                                </div>
                            </div>
                    :
                    !props.groups || props.groups.length === 0
                        ?
                        <div className="no-data">
                            No results
                        </div>
                        :
                        props.paginationMode
                            ?
                            <div className="group-list-pagination-results simple-scrollbar">
                                {
                                    props.groups?.map((group, idx) => (
                                        <GroupCard
                                            key={idx}
                                            group={group}
                                        />
                                    ))
                                }
                            </div>
                            :
                            <div className={classNames({ "group-list-results": true })}>
                                {
                                    props.previous &&
                                    <div className="group-list-pagination previous" onClick={props.previous}>
                                        {<HiChevronLeft />}
                                    </div>
                                }
                                <div className="group-list-results-list simple-scrollbar">
                                    {
                                        props.groups?.map((group, idx) => (
                                            <GroupCard key={idx} group={group} />
                                        ))
                                    }
                                    {
                                        // props.next &&
                                        // <div className="centered" >
                                        //     <div 
                                        //         className="button themed medium" 
                                        //         onClick={props.next}
                                        //     >
                                        //         { icons.listMore } load more 
                                        //     </div>
                                        // </div>
                                    }
                                </div>
                            </div>
            }
        </div>
    )
}
export default GroupList;

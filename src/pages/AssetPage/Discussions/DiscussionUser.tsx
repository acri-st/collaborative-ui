import { IDiscussionPost, UserLink } from "@desp-aas/desp-ui-fwk";
import classNames from "classnames";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)

function DiscussionUser(props: {
    post: IDiscussionPost
    className?: string
    id?: string
}) {
    return (
        <div id={props.id} className={classNames({ "discussion-user": true, [props.className || '']: true })}>
            <UserLink
                username={props.post.username}
            // username={props.post.display_username}
            />
            <div className="discussion-user-post-time">
                {dayjs(props.post.created_at).fromNow()}
            </div>
        </div>

    )
}

export default DiscussionUser;
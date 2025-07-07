import { IDiscussionTopic } from "@desp-aas/desp-ui-fwk";

export const example_topics: IDiscussionTopic[] = [
    { 
        id: 1, slug: "Climate Dynamics and Forecasting", 
        fancy_title: "", 
        title: "Topic number one", 
        posts: [
            { topic_id: 1, name: "", display_username: "Charles", message: 'Great stuff', username: '', created_at: '2024-10-16T10:45:35' },
            { topic_id: 1, name: "", display_username: "Jamie", message: 'Lorem ipsum', username: '', created_at: '2024-10-16T10:41:35' },
            { topic_id: 1, name: "", display_username: "Olivia", message: 'efficitur cursus, tempus eu lacus', username: '', created_at: '2024-10-16T10:35:35' },
            { topic_id: 1, name: "", display_username: "Olivia", message: 'Nullam sed urna quis', username: '', created_at: '2024-10-16T10:35:35' },
        ], 
        posts_count: 4, 
        created_at: "", 
        category_id: 0 
    },
    { 
        id: 2, slug: "Climate Dynamics and Forecasting", 
        fancy_title: "", title: "Topic number two", 
        posts: [
            { topic_id: 2, name: "", display_username: "Charles",message: 'Another one', username: 'Charles', created_at: '2024-10-14T10:45:35' }
        ], 
        posts_count: 1,
        created_at: "", 
        category_id: 0 
    },

]

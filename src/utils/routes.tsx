import { ASSET_TYPE, FWKIcons, IRoute } from "@desp-aas/desp-ui-fwk";

export const routes: IRoute[] =  [
    { id: "home", path: "/" , label: <>Home</> },
    {
        id: "datasets",
        path: '/catalog/' + ASSET_TYPE.dataset,
        label: 'Datasets',
        // loginRequired: true
    },
    {
        id: "models",
        path: '/catalog/' + ASSET_TYPE.model,
        label: 'Models',
        // loginRequired: true
    },
    {
        id: "applications",
        path: '/catalog/' + ASSET_TYPE.application,
        label: 'Applications',
        // loginRequired: true
    },
    {
        id: "documents",
        path: '/catalog/' + ASSET_TYPE.paper,
        label: 'Documents',
        // loginRequired: true
    },
    // {
    //     id: "groups",
    //     path: "/groups",
    //     label: "Groups"
    // },
    {
        id: "community",
        label: 'Community',
        // loginRequired: true,
        subroutes: [
            // { id: "groups", label: "Groups", path: "/groups" },
            { id: "courses", label: "Courses", path: "/catalog/course" },
            // { id: "success_stories", label: "Success stories" },
            { id: "posts", label: "Posts", path: "/posts" },
            // { id: "blog", label: "Blog", path: "/news" },
            // { id: "for_developers", label: "For developers", path: "/developers" },
        ]
    },
    {
        id: "help",
        label: 'Help',
        subroutes: [
            { id: "documentation", label: "Documentation", href: "/help/documentation/", target: "_blank" },
        ]
    },
    // {
    //     id: "more",
    //     label: 'More',
    //     // loginRequired: true,
    //     subroutes: [
    //         { id: "support", section: "Support" },
    //         // { id: "forum", label: "Forum" },
    //         // { id: "documentation", label: "Documentation" },
    //         { id: "contact", label: "Contact", path: "/contact" },
    //     ]
    // },
]
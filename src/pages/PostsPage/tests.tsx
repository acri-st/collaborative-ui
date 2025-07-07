const random = (max: number = 100, min:number = 0) => Math.floor(Math.random() * (max - min + 1) + min);

const users = [
    'test1',
    'test2',
    'odaumas'
]

export default new Array(10).fill(null).map(()=>({
    id: random(100).toString(),
    name: `Post number ${random(100)}`,
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam mauris nulla, sodales vel quam ultricies, pulvinar tempor massa. Duis bibendum luctus massa, vel ultrices justo vehicula vitae.`,
    despUserId: users[random(2)],
    creation_date: new Date().toISOString(),
    liked: !!(random(100) < 50),
    likes: random(20), 
    categoryName: "Air quality and pollution dispersion models",
    // responses: [
    //     { message: "Duis bibendum luctus massa, vel ultrices justo vehicula vitae." }
    // ]
    posts: new Array(random(10)).fill(null).map(()=>({
        message: "Duis bibendum luctus massa, vel ultrices justo vehicula vitae.",
        creation_date: new Date().toISOString(),
        user: users[random(2)],
    }))
    // responses: [
    //     {
    //         message: "Duis bibendum luctus massa, vel ultrices justo vehicula vitae.",            
    //         creation_date: '2024-01-02T14:35',
    //         user: 'odaumas',
    //     },
    //     {
    //         message: "Duis bibendum luctus massa, vel ultrices justo vehicula vitae.",
    //         creation_date: '2025-01-02T15:35',
    //         user: 'test1',
    //     },
    // ]
}))


    // id: string
    // title: string
    // message: string
    // user: string
    // creation_date: string
    // category: string
    // likes: number
    // responses: IPostReply[]
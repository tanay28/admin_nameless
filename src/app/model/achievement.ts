export interface AchievementMaster {
    _id: string,
    name: string,
    createdAt: string,
    isActive: boolean,
    imgUrl: string
}

export interface AboutUsMaster {
    _id: string,
    description: string,
    createdAt: string,
    modifiedAt: string,
    author: string
}
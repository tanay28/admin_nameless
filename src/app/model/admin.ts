export interface userMaster {
    _id: string,
    username: string,
    password: string,
    createdAt: string,
    modifiedAt: string,
    author: string
}
export interface loginMaster {
    _id: string,
    username: string,
    loginAt: string,
    logoutAt: string,
    author: string
}

export interface AchievementMaster {
    _id: string,
    name: string,
    imgType: string,
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

export interface OurWorkMaster {
    _id: string,
    description: string,
    createdAt: string,
    modifiedAt: string,
    author: string
}

export interface ContentMaster {
    _id: string,
    contentType: string,
    genre: string,
    shortdes: string,
    youtubeLink: string,
    posterImgUrl: string,
    createdAt: string,
    modifiedAt: string,
    author: string,
    singer: string,
    writer: string,
    song: string,
    story: string,
    isReleased: boolean
}

export interface GalleryMaster {
    _id: string,
    name: string,
    createdAt: string,
    isActive: boolean,
    imgUrl: string,
    author: string
}

export interface TeamMaster {
    _id: string,
    fullName: string,
    role: string,
    imgUrl: string
    createdAt: string,
    isActive: boolean,
    modifiedAt: string,
    author: string
}

export interface contactUsMaster {
    _id: string,
    fullName: string,
    email: string,
    msgDescription: string,
    isSubscribed: boolean,
    author: string,
    createdAt: string,
}
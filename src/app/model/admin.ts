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
    author: string
}


//https://youtu.be/8bOJdr15_cU
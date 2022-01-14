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
    author: string
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


//https://youtu.be/8bOJdr15_cU

//https://youtu.be/f8gdO0JePQ0 tere rang
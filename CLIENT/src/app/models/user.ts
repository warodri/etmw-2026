export interface UserModel {

    _id: string,
    email: string,
    firstName: string,
    lastName: string,
    bio: string,
    city: string,
    country: string,
    profilePicture: string,
    coverPicture: string,
    isAuthor: boolean,
    lastIp: string,
    lastBrowserAgent: string,
    connected: boolean,
    forceStatus: 'connected' | 'disconnected',

    //  Social
    totalFollowers: number,
    totlaFollowing: number,

    //  Notifications
    lastCheckTime: number,
    lastUnreadMessages: number,

    createdAt: number,
    updatedAt: number,
    
}
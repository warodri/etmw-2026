export interface UserModel {

    _id: string,
    email: string,
    firstName: string,
    lastName: string,
    city: string,
    country: string,
    profilePicture: string,
    coverPicture: string,
    isAuthor: boolean,
    bio: string,
    languages: Array<string>,
    lastIp: string,
    lastBrowserAgent: string,
    connected: boolean,
    forceStatus: 'connected' | 'disconnected',

    //  Notifications
    lastCheckTime: number,
    lastUnreadMessages: number,


    createdAt: number,
    updatedAt: number,
    
}
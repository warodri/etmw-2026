export interface BookmarkModel {

    _id: string,
    userId: string,
    targetId: string,
    targetType: 'audiobook' | 'debate' | 'author' | 'comment',
    createdAt: number,
    updatedAt: number,
    
}
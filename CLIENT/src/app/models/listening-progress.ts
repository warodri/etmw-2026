export interface ListeningProgressModel {
    
    _id: string,
    userId: string,
    audiobookId: string,
    chapterNumber: number,
    progressPercent: number,
    completed: boolean,

    enabled: boolean,
    createdAt: number,
    updatedAt: number

}

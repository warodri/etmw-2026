export interface AuthorModel {

    _id: string,
    userId: string,
    penName: string,
    bio: string | null,
    languages: Array<string>,
    country: string,
    totalAudiobooks: number,
    totalCompletions: number,
    enabled: boolean,
    createdAt: number,
    updatedAt: number,

}

import { UserModel } from "./user";

export interface AuthorModel {

    _id: string,
    userId: UserModel,
    isAlias?: boolean,
    profilePicture?: any,
    bookTaste?: string[],
    penName: string,
    bio: string | null,
    languages: Array<string>,
    categories: Array<string>,
    country: string,
    isVerified: boolean,
    enabled: boolean,
    createdAt: number,
    updatedAt: number,

}

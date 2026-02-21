import { UserModel } from "./user";

export interface AuthorModel {

    _id: string,
    userId: UserModel,
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

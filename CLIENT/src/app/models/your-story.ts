import { AuthorModel } from "./author"
import { UserModel } from "./user"
import { YourStoryBlueprint } from "./your-story-blueprint"

export interface YourStoryModel {
    _id: string,
    userId: UserModel,
    authorId: AuthorModel,
    isAIGenerated: boolean,
    status: 'draft' | 'publishing' | 'published' | 'archived',
    blueprint: YourStoryBlueprint,
    totalChaptersGenerated: number,

    createdAt: number,
    updatedAt: number
}
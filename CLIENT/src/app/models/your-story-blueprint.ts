import { YourStoryCharacterModel } from "./your-story-character";

export interface YourStoryBlueprint {
    _id: string,
    storyTitle: string,
    genre: string,
    tone: string,
    inspirationalStyleNotes: string,
    storyFoundation: string,
    mainConflict: string,
    longTermArc: string,
    worldRules: string,
    characters: YourStoryCharacterModel[],
    chapterGenerationInstructions: string,

    createdAt: number,
    updatedAt: number,
}
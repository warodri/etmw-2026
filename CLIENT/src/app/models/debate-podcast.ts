export interface DebatePodcastModel {
    _id: string;
    audiobookId: string;
    firstCommentId: string;
    lastCommentId: string;
    podcastAudioUrl: string;
    enabled: boolean;
    createdAt: number;
    updatedAt: number;
}

import { UserModel } from './user';

export interface DebateCommentAttachment {
    filename?: string;
    mimetype?: string;
    originalname?: string;
    url?: string;
    type?: string;
}

export interface DebateCommentModel {
    _id: string;
    audiobookId: string;
    debateId: string;
    userId: string | UserModel;
    text?: string;
    audioUrl?: string;
    hasAttachments?: boolean;
    attachments?: Array<DebateCommentAttachment | string>;
    parentMessageId?: string | null;
    likeCount?: number;
    replyCount?: number;
    isLiked?: boolean;
    score?: number;
    enabled: boolean;
    createdAt: number;
    updatedAt: number;
}

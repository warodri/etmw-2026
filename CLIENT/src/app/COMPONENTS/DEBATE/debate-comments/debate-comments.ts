import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { InternetDebateService } from '../../../SERVICES/internet-debate.services';
import { DebateCommentModel } from '../../../models/debate-comment';
import { InternetReactionService } from '../../../SERVICES/internet-reaction.services';

@Component({
    selector: 'app-debate-comments',
    standalone: false,
    templateUrl: './debate-comments.html',
    styleUrl: './debate-comments.css',
})
export class DebateComments implements OnInit, OnChanges {

    @Input() audiobookId: string | null = null;
    @Input() refreshToken = 0;
    @Input() selectedThreadId: string | null = null;
    @Output() replyRequested = new EventEmitter<DebateCommentModel>();

    comments = signal<DebateCommentModel[]>([]);
    hasMore = signal<boolean>(false);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    selectedThreadParentId = signal<string | null>(null);

    skip = 0;
    limit = 20;

    constructor(
        private iDebate: InternetDebateService,
        private iReaction: InternetReactionService
    ) {}

    ngOnInit(): void {
        this.resetAndLoad();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['audiobookId'] || changes['refreshToken']) {
            this.resetAndLoad();
            return;
        }
        if (changes['selectedThreadId']) {
            this.selectedThreadParentId.set(this.selectedThreadId || null);
        }
    }

    resetAndLoad() {
        this.skip = 0;
        this.comments.set([]);
        this.hasMore.set(false);
        this.error.set(null);
        this.selectedThreadParentId.set(null);
        this.loadComments();
    }

    loadComments() {
        const audiobookId = this.audiobookId;
        if (!audiobookId) return;
        this.loading.set(true);
        this.iDebate.debateGetComments(audiobookId, this.skip, this.limit, (response: any) => {
            this.loading.set(false);
            if (response && response.success) {
                const next: DebateCommentModel[] = (response.comments || []) as DebateCommentModel[];
                if (this.skip === 0) {
                    this.comments.set(next);
                } else {
                    this.comments.set([...this.comments(), ...next]);
                }
                this.loadMyLikesForVisibleComments();
                this.hasMore.set(Boolean(response.hasMore ?? (next.length >= this.limit)));
                return;
            }
            this.error.set(response?.message || 'Unable to load comments');
            if (this.skip === 0) {
                this.comments.set([]);
            }
        });
    }
    
    loadMore() {
        if (this.loading() || !this.hasMore()) return;
        this.skip += this.limit;
        this.loadComments();
    }

    onReplyRequested(comment: DebateCommentModel) {
        this.replyRequested.emit(comment);
    }

    onLikeToggled(comment: DebateCommentModel) {
        const currentLiked = !!comment.isLiked;
        const currentCount = Number(comment.likeCount || 0);
        const nextLiked = !currentLiked;
        const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

        this.updateCommentReactionState(comment._id, nextLiked, nextCount);

        this.iReaction.reactionUpsert(
            comment._id,
            'debate-comment',
            'like',
            (response: any) => {
                if (response && response.success) {
                    const serverLiked = typeof response.reacted === 'boolean' ? response.reacted : nextLiked;
                    const serverCount = Number(response.totalReactions);
                    this.updateCommentReactionState(
                        comment._id,
                        serverLiked,
                        Number.isFinite(serverCount) ? serverCount : nextCount
                    );
                    return;
                }
                this.updateCommentReactionState(comment._id, currentLiked, currentCount);
            }
        );
    }

    openThread(comment: DebateCommentModel) {
        const root = this.resolveThreadParent(comment);
        this.selectedThreadParentId.set(root?._id || null);
    }

    closeThread() {
        this.selectedThreadParentId.set(null);
    }

    isThreadOpen(): boolean {
        return !!this.selectedThreadParentId();
    }

    selectedParentComment(): DebateCommentModel | null {
        const parentId = this.selectedThreadParentId();
        if (!parentId) return null;
        return this.comments().find((item) => item._id === parentId) || null;
    }

    visibleTopLevelComments(): DebateCommentModel[] {
        const all = this.comments();
        return all.filter((item) => !item.parentMessageId);
    }

    threadReplies(): DebateCommentModel[] {
        const parentId = this.selectedThreadParentId();
        if (!parentId) return [];
        return this.comments()
            .filter((item) => item.parentMessageId === parentId)
            .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
    }

    getReplyCount(commentId: string): number {
        return this.comments().filter((item) => item.parentMessageId === commentId).length;
    }

    private resolveThreadParent(comment: DebateCommentModel): DebateCommentModel | null {
        if (!comment.parentMessageId) return comment;
        return this.comments().find((item) => item._id === comment.parentMessageId) || comment;
    }

    private updateCommentReactionState(commentId: string, isLiked: boolean, likeCount: number) {
        this.comments.set(
            this.comments().map((item) => {
                if (item._id !== commentId) return item;
                return {
                    ...item,
                    isLiked,
                    likeCount
                };
            })
        );
    }

    private loadMyLikesForVisibleComments() {
        const ids = this.comments().map((item) => item._id).filter(Boolean);
        if (ids.length === 0) return;
        this.iReaction.reactionGetMine(
            null,
            'debate-comment',
            ids,
            (response: any) => {
                if (!response || !response.success) return;
                const mine: Set<string> = new Set(
                    (response.reactions || []).map((item: any) => String(item.targetId))
                );
                this.comments.set(
                    this.comments().map((item) => ({
                        ...item,
                        isLiked: mine.has(String(item._id))
                    }))
                );
            }
        );
    }



}

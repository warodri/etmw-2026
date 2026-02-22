import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '../../../utils/config';
import { DebateCommentAttachment, DebateCommentModel } from '../../../models/debate-comment';
import { UserModel } from '../../../models/user';

@Component({
    selector: 'app-debate-comment-card',
    standalone: false,
    templateUrl: './debate-comment-card.html',
    styleUrl: './debate-comment-card.css',
})
export class DebateCommentCard {
    @Input() comment!: DebateCommentModel;
    @Input() replyCount = 0;
    @Input() showThreadButton = true;
    @Output() onReply = new EventEmitter<DebateCommentModel>();
    @Output() onOpenThread = new EventEmitter<DebateCommentModel>();
    @Output() onToggleLike = new EventEmitter<DebateCommentModel>();

    private SERVER = Config.SERVER.dev ? Config.SERVER.local : Config.SERVER.remote;

    constructor(
        private router: Router
    ) {}

    openThread(comment: DebateCommentModel) {
        console.log('Open thread:', comment);
        // Navigate to thread detail view
    }

    viewAttachment(event: Event, attachment: any) {
        event.stopPropagation();
        console.log('View attachment:', attachment);
        // Open attachment in modal/fullscreen
    }

    replyTo(event: Event, comment: DebateCommentModel) {
        event.stopPropagation();
        this.onReply.emit(comment);
    }

    openThreadView(event: Event, comment: DebateCommentModel) {
        event.stopPropagation();
        this.onOpenThread.emit(comment);
    }

    toggleLike(event: Event, comment: DebateCommentModel) {
        event.stopPropagation();
        this.onToggleLike.emit(comment);
    }

    shareComment(event: Event, commentId: string) {
        event.stopPropagation();
        console.log('Share comment:', commentId);
    }

    gotoUserProfile() {
        const user = this.user();
        if (user?._id) {
            this.router.navigate(['app/user-profile', user._id]);
        }
    }

    user(): UserModel | null {
        const raw = this.comment?.userId;
        if (!raw || typeof raw === 'string') return null;
        return raw as UserModel;
    }

    userName(): string {
        const user = this.user();
        if (user) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
        }
        return 'User';
    }

    userProfile(): string {
        return this.user()?.profilePicture || 'nouser.png';
    }

    isAuthor(): boolean {
        return !!this.user()?.isAuthor;
    }

    isVerified(): boolean {
        return false;
    }

    timeAgo(): string {
        const createdAt = Number(this.comment?.createdAt || 0);
        if (!createdAt) return '';
        const diffMs = Date.now() - createdAt;
        const minutes = Math.floor(diffMs / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    audioUrl(): string | null {
        const audio = this.comment?.audioUrl;
        if (!audio) return null;
        if (audio.startsWith('http://') || audio.startsWith('https://')) return audio;
        return `${this.SERVER}/file?id=${audio}`;
    }

    attachments(): DebateCommentAttachment[] {
        const raw = this.comment?.attachments as any;
        const list = Array.isArray(raw)
            ? raw
            : (raw && typeof raw === 'object' ? Object.values(raw) : []);
        return list.map((item: any) => {
            if (typeof item === 'string') {
                return { filename: item };
            }
            return item || {};
        });
    }

    attachmentUrl(attachment: DebateCommentAttachment): string {
        if (attachment.url) return attachment.url;
        if (!attachment.filename) return '';
        return `${this.SERVER}/file?id=${attachment.filename}`;
    }

    isImageAttachment(attachment: DebateCommentAttachment): boolean {
        return !!attachment.mimetype && attachment.mimetype.startsWith('image/');
    }

    isVideoAttachment(attachment: DebateCommentAttachment): boolean {
        return !!attachment.mimetype && attachment.mimetype.startsWith('video/');
    }



}

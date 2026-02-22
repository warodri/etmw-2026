import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetDebateService } from '../../../SERVICES/internet-debate.services';
import { DebateCommentModel } from '../../../models/debate-comment';
import { UserModel } from '../../../models/user';

@Component({
    selector: 'app-debate-popular-threads',
    standalone: false,
    templateUrl: './debate-popular-threads.html',
    styleUrl: './debate-popular-threads.css',
})
export class DebatePopularThreads implements OnInit, OnChanges {
    @Input() audiobookId: string | null = null;
    @Input() limit = 5;
    @Output() onOpen = new EventEmitter<DebateCommentModel>();

    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    popularThreads = signal<DebateCommentModel[]>([]);

    constructor(
        private iDebate: InternetDebateService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadPopularThreads();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['audiobookId'] || changes['limit']) {
            this.loadPopularThreads();
        }
    }

    loadPopularThreads() {
        const audiobookId = this.audiobookId;
        if (!audiobookId) {
            this.popularThreads.set([]);
            return;
        }
        this.loading.set(true);
        this.error.set(null);
        this.iDebate.debateGetpopularThreads(audiobookId, this.limit, (response: any) => {
            this.loading.set(false);
            if (response && response.success) {
                this.popularThreads.set((response.threads || []) as DebateCommentModel[]);
                return;
            }
            this.error.set(response?.message || 'Unable to load popular threads');
            this.popularThreads.set([]);
        });
    }

    openThread(comment: DebateCommentModel) {
        this.onOpen.emit(comment);
    }

    gotoUserProfile(thread: DebateCommentModel, event: Event) {
        event.stopPropagation();
        const user = this.userObj(thread);
        if (user?._id) {
            this.router.navigate(['app/user-profile', user._id]);
        }
    }

    userObj(thread: DebateCommentModel): UserModel | null {
        const raw = thread?.userId as any;
        if (!raw || typeof raw === 'string') return null;
        return raw as UserModel;
    }

    userName(thread: DebateCommentModel): string {
        const user = this.userObj(thread);
        if (!user) return 'User';
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
    }

    userProfile(thread: DebateCommentModel): string {
        return this.userObj(thread)?.profilePicture || 'nouser.png';
    }

    timeAgo(thread: DebateCommentModel): string {
        const createdAt = Number(thread?.createdAt || 0);
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
}


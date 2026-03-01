import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetDebateService } from '../../../SERVICES/internet-debate.services';
import { DebateCommentModel } from '../../../models/debate-comment';
import { UserModel } from '../../../models/user';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-debate-popular-threads',
    standalone: false,
    templateUrl: './debate-popular-threads.html',
    styleUrl: './debate-popular-threads.css',
})
export class DebatePopularThreads implements OnInit, OnChanges {
    language: 'en' | 'es' = 'en';
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
        this.language = LangUtils.detectLanguage();
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
            this.error.set(response?.message || this.tr('Unable to load popular threads', 'No se pudieron cargar los hilos populares'));
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
        if (!user) return this.tr('User', 'Usuario');
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || this.tr('User', 'Usuario');
    }

    userProfile(thread: DebateCommentModel): string {
        return this.userObj(thread)?.profilePicture || 'nouser.png';
    }

    timeAgo(thread: DebateCommentModel): string {
        const createdAt = Number(thread?.createdAt || 0);
        if (!createdAt) return '';
        const diffMs = Date.now() - createdAt;
        const minutes = Math.floor(diffMs / 60000);
        if (minutes < 1) return this.tr('just now', 'justo ahora');
        if (minutes < 60) return `${minutes}${this.tr('m ago', 'm atrás')}`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}${this.tr('h ago', 'h atrás')}`;
        const days = Math.floor(hours / 24);
        return `${days}${this.tr('d ago', 'd atrás')}`;
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }
}

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { UserModel } from '../../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { AudiobookModel } from '../../../models/audiobook';
import { Config } from '../../../utils/config';
import { InternetDebateService } from '../../../SERVICES/internet-debate.services';
import { DebateCommentModel } from '../../../models/debate-comment';

@Component({
    selector: 'app-screen-debates',
    standalone: false,
    templateUrl: './screen-debates.html',
    styleUrl: './screen-debates.css',
})
export class ScreenDebates implements OnInit, OnDestroy {

    myUser = signal<UserModel | null>(null);
    audiobookId = signal<string | null>(null);

    audiobook = signal<AudiobookModel | null>(null);

    bookSearchQuery = '';

    viewMode: 'timeline' | 'threads' | 'podcast' = 'timeline';

    audiobooksFound = signal<AudiobookModel[]>([]);
    commentsRefreshToken = signal<number>(0);
    selectedReply = signal<DebateCommentModel | null>(null);
    selectedThreadFromPopular = signal<string | null>(null);

    SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;

    debate = {
        totalMessages: 0,
        enabled: true
    };

    //  Flags
    loading = signal<boolean>(true);

    constructor(
        private iAudiobook: InternetAudiobookService,
        private iDebate: InternetDebateService,
        private route: ActivatedRoute,
        private iUser: InternetUserService,
        private router: Router
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.audiobookId.set(params.get('audiobookId'));
            this.getMyUser(() => {
                this.loadAudiobook(() => {
                    this.countComments();
                    this.loading.set(false);
                })
            })
        })
    }

    getMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
            }
            callback()
        })
    }

    loadAudiobook(callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.iAudiobook.audiobookFindById(audiobookId, (response: any) => {
                console.log('audiobookFindById', response)
                if (response && response.success && response.audiobooks && Array.isArray(response.audiobooks) && response.audiobooks.length > 0) {
                    this.audiobook.set(response.audiobooks[0]);
                } else {
                    this.audiobook.set(null);
                }
                callback();
            })
            return;
        }
        this.audiobook.set(null);
        callback();
    }

    ngOnDestroy() {
    }

    goBack() {
        this.router.navigate(['app'])
    }

    hasAudiobookInRoute(): boolean {
        return !!this.audiobookId();
    }

    goToSearchBooks() {
        const query = (this.bookSearchQuery || '').trim();
        if (!query) return;
        this.iAudiobook.audiobookFindByQuery(query, null, null, (response: any) => {
            console.log('audiobookFindByQuery', response);
            if (response && response.success) {
                this.audiobooksFound.set(response.audiobooks);
                this.bookSearchQuery = '';
            }
        })
    }

    shareDebate() {
        console.log('Share debate');
    }

    reportDebate() {
        console.log('Report debate');
    }

    gotoBook() {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.router.navigate(['app/audiobook/view', audiobookId])
        }
    }

    searchAgain() {
        this.audiobooksFound.set([])
    }

    countComments() {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.iDebate.debateCountComments(audiobookId, (response: any) => {
                console.log('debateCountComments', response);
                if (response && response.success) {
                    this.debate.totalMessages = response.totalComments;
                }
            })
        }        
    }

    onCommentSaved(response: { totalComments?: number }) {
        if (response?.totalComments !== undefined && response?.totalComments !== null) {
            this.debate.totalMessages = Number(response.totalComments) || 0;
        } else {
            this.countComments();
        }
        this.selectedReply.set(null);
        this.commentsRefreshToken.set(this.commentsRefreshToken() + 1);
    }

    onReplyRequested(comment: DebateCommentModel) {
        this.selectedReply.set(comment);
    }

    clearReplyTarget() {
        this.selectedReply.set(null);
    }

    getReplyToLabel(): string {
        const reply = this.selectedReply();
        if (!reply) return 'comment';
        const user: any = reply.userId;
        if (user && typeof user === 'object') {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            return fullName || user.email || 'comment';
        }
        return 'comment';
    }

    onOpenPopularThread(comment: DebateCommentModel) {
        this.selectedThreadFromPopular.set(comment._id);
        this.viewMode = 'timeline';
        this.commentsRefreshToken.set(this.commentsRefreshToken() + 1);
    }

}

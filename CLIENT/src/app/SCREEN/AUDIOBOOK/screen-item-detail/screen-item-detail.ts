import { Component, OnInit, signal } from '@angular/core';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { AudiobookModel } from '../../../models/audiobook';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../SERVICES/toast';
import { Router } from '@angular/router';
import { UtilsService } from '../../../utils/utils-service';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { ListeningProgressModel } from '../../../models/listening-progress';
import { InternetService } from '../../../SERVICES/internet.service';

@Component({
    selector: 'app-screen-item-detail',
    standalone: false,
    templateUrl: './screen-item-detail.html',
    styleUrl: './screen-item-detail.css',
})
export class ScreenItemDetail implements OnInit {

    audiobookId = signal<string | null>(null);
    audiobook = signal<AudiobookModel | null>(null);
    listeningProgress = signal<ListeningProgressModel[]>([]);
    selectedChapterIndex = signal<number>(0);

    //  Flags 
    loading = signal<boolean>(true);
    isBookmarked = signal<boolean>(false);

    constructor(
        private iAudiobook: InternetAudiobookService,
        private iUser: InternetUserService,
        private internet: InternetService,
        private route: ActivatedRoute,
        private toast: ToastService,
        private router: Router,
        private utils: UtilsService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.audiobookId.set(params.get('id'));
            this.getAudiobookById(() => {
                this.getMyBookmarks();
                this.getListeningProgress(() => {
                    this.loading.set(false);
                })
            })
        })        
    }

    getAudiobookById(callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.iAudiobook.audiobookFindById(audiobookId, (response: any) => {
                if (response && response.success) {
                    const book = response.audiobook || (response.audiobooks && response.audiobooks[0]) || null;
                    this.audiobook.set(book);
                    this.selectedChapterIndex.set(0);
                    callback()
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected());
                }
            })
        }
    }

    getListeningProgress(callback: any) {
        const audiobookId = this.audiobookId();
        if (!audiobookId) {
            if (callback) callback();
            return;
        }
        this.iUser.userGetListeningHistory(audiobookId, (response: any) => {
            if (response && response.success) {
                this.listeningProgress.set(this.normalizeListeningHistory(response.history))
            }
            if (callback) callback()
        })
    }

    goBack() {
        this.router.navigate(['app'])
    }

    getCoverUrl(): string {
        const book = this.audiobook();
        if (!book) return this.getFallbackCover();
        if (book.coverFile && book.coverFileMimetype) {
            return this.utils.getClientUrlForFiles(book.coverFile, book.coverFileMimetype);
        }
        return this.getFallbackCover();
    }

    getPrimaryCategory(): string {
        const book = this.audiobook();
        if (!book || !Array.isArray(book.categories) || book.categories.length === 0) {
            return 'General';
        }
        return book.categories[0];
    }

    getStatusLabel(): string {
        const book = this.audiobook();
        if (!book) return '';
        if (book.published) return 'Published';
        if (book.pipelineStatus === 'ready') return 'Ready';
        if (book.pipelineStatus === 'failed') return 'Failed';
        if (book.pipelineStatus === 'tts_processing') return 'Processing';
        return 'Pending';
    }

    formatDuration(totalSeconds: number | undefined): string {
        const seconds = Math.max(0, Math.floor(totalSeconds || 0));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    formatDate(epoch?: number): string {
        if (!epoch) return 'N/A';
        return new Date(epoch).toLocaleDateString();
    }

    getChapters(): Array<{ chapter: number, durationSec: number }> {
        const book = this.audiobook();
        if (!book || !Array.isArray(book.audioFiles)) return [];
        return book.audioFiles.map((c: any) => ({
            chapter: c.chapter,
            durationSec: c.durationSec || 0
        }));
    }

    selectChapter(index: number) {
        this.selectedChapterIndex.set(index);
    }

    playSelectedChapter() {
        const chapters = this.getChapters();
        const idx = this.selectedChapterIndex();
        if (!chapters[idx]) return;
        this.playChapter(chapters[idx].chapter);
    }

    private getFallbackCover(): string {
        const title = this.audiobook()?.title || 'Audiobook';
        const safeTitle = encodeURIComponent(title);
        return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231e293b'/><stop offset='1' stop-color='%230f172a'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='50%25' fill='%23e2e8f0' font-family='Arial' font-size='18' text-anchor='middle'>${safeTitle}</text></svg>`;
    }

    playChapter(chapter: number) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.router.navigate(['app/player/' + audiobookId + '/' + chapter]);
        }
    }

    async shareCurrentPage() {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (!url) {
            this.toast.show('Unable to share this page.');
            return;
        }

        const title = this.audiobook()?.title || 'Audiobook';
        const nav = typeof navigator !== 'undefined' ? navigator : null;

        try {
            if (nav && 'share' in nav) {
                await nav.share({
                    title,
                    text: `Check this audiobook: ${title}`,
                    url
                });
                return;
            }
        } catch (ex: any) {
            // If user cancels native share, do nothing.
            if (ex?.name === 'AbortError') return;
        }

        try {
            if (nav?.clipboard?.writeText) {
                await nav.clipboard.writeText(url);
                this.toast.show('Link copied to clipboard.');
                return;
            }
        } catch (ex) {
            // Continue to final fallback
        }

        this.toast.show(url);
    }

    private normalizeListeningHistory(raw: any): ListeningProgressModel[] {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        return [raw];
    }

    getChapterProgressPercent(chapter: number): number {
        const history = this.listeningProgress();
        const item = history.find((h) => Number(h.chapterNumber) === Number(chapter));
        if (!item || typeof item.progressPercent !== 'number') return 0;
        return Math.max(0, Math.min(100, Math.round(item.progressPercent)));
    }

    toggleBookmark() {
        const audiobookId = this.audiobookId()
        if (audiobookId) {
            this.isBookmarked.set(!this.isBookmarked());
            this.internet.bookmarkUpsert(audiobookId, 'audiobook', (response: any) => {
                console.log('bookmarkUpsert', response)
            })
        }
    }

    getMyBookmarks() {
        const audiobookId = this.audiobookId()
        if (audiobookId) {
            this.isBookmarked.set(false);
            this.internet.bookmarkGetMine((response: any) => {
                console.log('bookmarkUpsertGetMine', response)
                for (let item of response.bookmarks) {
                    if (item.targetId == audiobookId) {
                        this.isBookmarked.set(true);
                        break;
                    }
                }
            })
        }        
    }

    gotoDebate() {
        const book = this.audiobook();
        if (book) {
            this.router.navigate(['app/debate', book._id])
        }
    }
    
}

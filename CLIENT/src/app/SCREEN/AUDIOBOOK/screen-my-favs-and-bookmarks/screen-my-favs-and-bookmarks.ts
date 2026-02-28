import { Component, OnInit, signal } from '@angular/core';
import { AudiobookModel } from '../../../models/audiobook';
import { InternetReactionService } from '../../../SERVICES/internet-reaction.services';
import { InternetService } from '../../../SERVICES/internet.service';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { ToastService } from '../../../SERVICES/toast';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-my-favs-and-bookmarks',
    standalone: false,
    templateUrl: './screen-my-favs-and-bookmarks.html',
    styleUrl: './screen-my-favs-and-bookmarks.css',
})
export class ScreenMyFavsAndBookmarks implements OnInit {

    loading = signal<boolean>(true);
    reloading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);

    likedAudiobooks = signal<AudiobookModel[]>([]);
    bookmarkedAudiobooks = signal<AudiobookModel[]>([]);

    private audiobookCache = new Map<string, AudiobookModel | null>();

    constructor(
        private iReaction: InternetReactionService,
        private internet: InternetService,
        private iAudiobook: InternetAudiobookService,
        private toast: ToastService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    goBack() {
        this.router.navigate(['app']);
    }

    refresh() {
        if (this.loading() || this.reloading()) return;
        this.reloading.set(true);
        this.loadData(() => {
            this.reloading.set(false);
        });
    }

    private loadData(callback?: () => void) {
        this.loading.set(true);
        this.errorMessage.set(null);

        Promise.all([
            this.loadLikedAudiobookIds(),
            this.loadBookmarkedAudiobookIds()
        ]).then(async ([likedIds, bookmarkIds]) => {
            const uniqueIds = this.uniqueIds([...likedIds, ...bookmarkIds]);
            const books = await this.loadAudiobooksByIds(uniqueIds);

            const byId = new Map<string, AudiobookModel>();
            books.forEach((book) => byId.set(String(book._id), book));

            this.likedAudiobooks.set(
                likedIds
                    .map((id) => byId.get(id))
                    .filter((item): item is AudiobookModel => !!item)
            );

            this.bookmarkedAudiobooks.set(
                bookmarkIds
                    .map((id) => byId.get(id))
                    .filter((item): item is AudiobookModel => !!item)
            );
        }).catch((error: any) => {
            console.error('Failed to load favorites/bookmarks', error);
            this.errorMessage.set('Unable to load your favorites and bookmarks right now.');
            this.toast.show(this.errorMessage() || 'Unexpected error');
        }).finally(() => {
            this.loading.set(false);
            if (callback) callback();
        });
    }

    private loadLikedAudiobookIds(): Promise<string[]> {
        return new Promise((resolve) => {
            this.iReaction.reactionGetMine(
                null,
                'audiobook',
                null,
                (response: any) => {
                    if (!response || !response.success) {
                        resolve([]);
                        return;
                    }
                    const ids = this.uniqueIds(
                        (response.reactions || [])
                            .filter((item: any) => {
                                const type = String(item?.targetType || 'audiobook');
                                return type === 'audiobook';
                            })
                            .map((item: any) => String(item?.targetId || '').trim())
                            .filter((id: string) => !!id)
                    );
                    resolve(ids);
                }
            );
        });
    }

    private loadBookmarkedAudiobookIds(): Promise<string[]> {
        return new Promise((resolve) => {
            this.internet.bookmarkGetMine((response: any) => {
                if (!response || !response.success) {
                    resolve([]);
                    return;
                }
                const ids = this.uniqueIds(
                    (response.bookmarks || [])
                        .filter((item: any) => {
                            const type = String(item?.targetType || 'audiobook');
                            return type === 'audiobook';
                        })
                        .map((item: any) => String(item?.targetId || '').trim())
                        .filter((id: string) => !!id)
                );
                resolve(ids);
            });
        });
    }

    private async loadAudiobooksByIds(ids: string[]): Promise<AudiobookModel[]> {
        const items = await Promise.all(ids.map((id) => this.loadAudiobookByIdCached(id)));
        return items.filter((item): item is AudiobookModel => !!item);
    }

    private loadAudiobookByIdCached(id: string): Promise<AudiobookModel | null> {
        const key = String(id || '').trim();
        if (!key) return Promise.resolve(null);

        if (this.audiobookCache.has(key)) {
            return Promise.resolve(this.audiobookCache.get(key) || null);
        }

        return new Promise((resolve) => {
            this.iAudiobook.audiobookFindById(key, (response: any) => {
                if (!response || !response.success) {
                    this.audiobookCache.set(key, null);
                    resolve(null);
                    return;
                }
                const book = response.audiobook || (response.audiobooks && response.audiobooks[0]) || null;
                this.audiobookCache.set(key, book);
                resolve(book);
            });
        });
    }

    private uniqueIds(ids: string[]): string[] {
        return Array.from(
            new Set(
                (ids || [])
                    .map((id) => String(id || '').trim())
                    .filter((id) => !!id)
            )
        );
    }

}

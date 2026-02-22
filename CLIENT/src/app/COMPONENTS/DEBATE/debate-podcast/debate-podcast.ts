import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { InternetDebateService } from '../../../SERVICES/internet-debate.services';
import { ToastService } from '../../../SERVICES/toast';
import { Config } from '../../../utils/config';
import { DebatePodcastModel } from '../../../models/debate-podcast';
import { UserModel } from '../../../models/user';

@Component({
    selector: 'app-debate-podcast',
    standalone: false,
    templateUrl: './debate-podcast.html',
    styleUrl: './debate-podcast.css',
})
export class DebatePodcast implements OnChanges {

    @Input() myUser: UserModel | null = null;
    @Input() audiobookId: string | null = null;

    readonly SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;
    readonly isLoading = signal<boolean>(false);
    readonly generating = signal<boolean>(false);
    readonly podcasts = signal<DebatePodcastModel[]>([]);
    readonly hasMore = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    private skip = 0;
    private readonly pageSize = 10;

    constructor(
        private iDebate: InternetDebateService,
        private toast: ToastService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['audiobookId']) {
            this.reload();
        }
    }

    isAdmin(): boolean {
        const email = String(this.myUser?.email || '').toLowerCase().trim();
        return email === 'warodri@gmail.com';
    }

    reload() {
        this.skip = 0;
        this.podcasts.set([]);
        this.hasMore.set(false);
        this.error.set(null);
        if (!this.audiobookId) return;
        this.fetchPodcasts(false);
    }

    fetchMore() {
        this.fetchPodcasts(true);
    }

    private fetchPodcasts(append: boolean) {
        const audiobookId = this.audiobookId;
        if (!audiobookId) return;

        this.isLoading.set(true);
        this.iDebate.debatePodcastGet(audiobookId, this.skip, this.pageSize, (response: any) => {
            this.isLoading.set(false);
            if (response?.success) {
                const list = Array.isArray(response.podcasts) ? response.podcasts : [];
                if (append) {
                    this.podcasts.set([...this.podcasts(), ...list]);
                } else {
                    this.podcasts.set(list);
                }
                this.skip += list.length;
                this.hasMore.set(!!response.hasMore);
                return;
            }

            this.error.set(response?.message || 'Unable to load podcast episodes.');
            if (!append) this.podcasts.set([]);
        });
    }

    generatePodcast() {
        const audiobookId = this.audiobookId;
        if (!audiobookId) return;
        this.generating.set(true);
        this.iDebate.debateGeneratePodcast(audiobookId, (response: any) => {
            this.generating.set(false);
            if (response?.success) {
                this.toast.show('Podcast generated');
                this.reload();
                return;
            }
            this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
        });
    }

    getAudioUrl(item: DebatePodcastModel): string {
        if (!item?.podcastAudioUrl) return '';
        return `${this.SERVER}/file?id=${item.podcastAudioUrl}`;
    }

    getGeneratedLabel(timestamp: number): string {
        const value = Number(timestamp || 0);
        if (!value) return '';
        return new Date(value).toLocaleString();
    }

    getEpisodeNumber(index: number): number {
        return index + 1;
    }

}

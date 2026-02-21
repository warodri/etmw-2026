import { Component, Input, OnInit, signal } from '@angular/core';
import { AudiobookModel } from '../../../models/audiobook';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { UtilsService } from '../../../utils/utils-service';

@Component({
    selector: 'app-homepage-categories-and-books',
    standalone: false,
    templateUrl: './homepage-categories-and-books.html',
    styleUrl: './homepage-categories-and-books.css',
})
export class HomepageCategoriesAndBooks implements OnInit {

    @Input() section: 'picked-for-you' | 'popular' | null = null;

    audiobooks = signal<AudiobookModel[]>([]);

    constructor(
        private iAudiobook: InternetAudiobookService,
        private utils: UtilsService
    ) {}

    ngOnInit(): void {
        this.loadAudiobooks();
    }

    loadAudiobooks() {
        const audiobookId = null;
        const query  = null;
        const authorIds: string[] = [];
        const categories: string[] = [];
        const latest = true;
        const myAudiobooks = false;
        const published = true;
        const pipelineStatus: string[] = [];
        const limit = 5;
        const skip = 0;

        this.iAudiobook.audiobookFind(
            audiobookId, 
            query, 
            authorIds,
            categories,
            latest,
            myAudiobooks,
            published,
            pipelineStatus,
            limit,
            skip,
            (response: any) => {
                if (response && response.success) {
                    for (let item of response.audiobooks) {
                        item.coverFileFull = this.getCoverUrl(item);
                    }
                    this.audiobooks.set( response.audiobooks || [] );
                }
            }) 
    }

    getCoverUrl(audiobook: AudiobookModel): string {
        if (!audiobook) return this.getFallbackCover(audiobook);
        if (audiobook.coverFile && audiobook.coverFileMimetype) {
            return this.utils.getClientUrlForFiles(audiobook.coverFile, audiobook.coverFileMimetype);
        }
        return this.getFallbackCover(audiobook);
    }

    private getFallbackCover(audiobook: AudiobookModel): string {
        const title = audiobook?.title || 'Audiobook';
        const safeTitle = encodeURIComponent(title);
        return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231e293b'/><stop offset='1' stop-color='%230f172a'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='50%25' fill='%23e2e8f0' font-family='Arial' font-size='18' text-anchor='middle'>${safeTitle}</text></svg>`;
    }


}

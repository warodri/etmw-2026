import { Component, Input, OnInit, signal } from '@angular/core';
import { AudiobookModel } from '../../../models/audiobook';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { UtilsService } from '../../../utils/utils-service';
import { Router } from '@angular/router';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-homepage-categories-and-books',
    standalone: false,
    templateUrl: './homepage-categories-and-books.html',
    styleUrl: './homepage-categories-and-books.css',
})
export class HomepageCategoriesAndBooks implements OnInit {

    @Input() section: 'for-you' | 'trending' | null = null;
    language: 'en' | 'es' = 'en';

    audiobooks = signal<AudiobookModel[]>([]);

    constructor(
        private iAudiobook: InternetAudiobookService,
        private utils: UtilsService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.language = LangUtils.detectLanguage();
        this.loadAudiobooks();
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }

    loadAudiobooks() {
        if (this.section) {
            this.iAudiobook.audiobookFindBySection(this.section, (response: any) => {
                console.log('audiobookFindBySection', response);
                if (response && response.success) {
                    for (let item of response.audiobooks) {
                        item.coverFileFull = this.getCoverUrl(item);
                    }
                    this.audiobooks.set(response.audiobooks);
                }
            })
        }
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

    gotoBookDetail(id: string) {
        this.router.navigate(['app/audiobook/view', id])
    }

    gotoSection(section: 'for-you' | 'trending') {
        this.router.navigate(['app/search/section', section])
    }
    
}

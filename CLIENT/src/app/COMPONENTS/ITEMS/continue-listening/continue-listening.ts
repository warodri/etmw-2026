import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '../../../utils/config';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';

interface ContinueListeningItem {
    _id: string;
    chapterNumber: number;
    progressPercent: number;
    book: {
        _id: string;
        title?: string;
        coverFile?: string;
        authorName?: string;
    };
}

@Component({
    selector: 'app-continue-listening',
    standalone: false,
    templateUrl: './continue-listening.html',
    styleUrl: './continue-listening.css',
})
export class ContinueListening implements OnInit {

    readonly SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;
    readonly recentlyPlayed = signal<ContinueListeningItem[]>([]);

    constructor(
        private iAudiobook: InternetAudiobookService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadContinueListening();
    }

    loadContinueListening() {
        this.iAudiobook.audiobookGetContineListening((response: any) => {
            if (response && response.success && Array.isArray(response.listening)) {
                this.recentlyPlayed.set(response.listening);
                return;
            }
            this.recentlyPlayed.set([]);
        });
    }

    getCoverUrl(item: ContinueListeningItem): string {
        const file = item?.book?.coverFile;
        if (!file) return '';
        return `${this.SERVER}/file?id=${file}`;
    }

    openAudiobook(item: ContinueListeningItem) {
        const id = item?.book?._id;
        if (!id) return;
        this.router.navigate(['app/audiobook/view', id]);
    }

    progressLabel(item: ContinueListeningItem): string {
        const value = Math.max(0, Math.min(100, Number(item?.progressPercent || 0)));
        return `${Math.round(value)}%`;
    }
    
}

import { Component, Input } from '@angular/core';
import { AudiobookModel } from '../../../models/audiobook';
import { UtilsService } from '../../../utils/utils-service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-item',
    standalone: false,
    templateUrl: './item.html',
    styleUrl: './item.css',
})
export class Item {

    @Input() audiobook: AudiobookModel | null = null;
    @Input() template: 'default' | 'md' | 'large' | 'detail' = 'default';

    constructor(
        private utils: UtilsService,
        private router: Router
    ) {}

    getCoverUrl(): string {
        if (!this.audiobook) return this.getFallbackCover();
        if (this.audiobook.coverFile && this.audiobook.coverFileMimetype) {
            return this.utils.getClientUrlForFiles(this.audiobook.coverFile, this.audiobook.coverFileMimetype);
        }
        return this.getFallbackCover();
    }

    getPrimaryCategory(): string {
        if (!this.audiobook || !Array.isArray(this.audiobook.categories) || this.audiobook.categories.length === 0) {
            return 'General';
        }
        return this.audiobook.categories[0];
    }

    getChapterCount(): number {
        if (!this.audiobook || !Array.isArray(this.audiobook.audioFiles)) return 0;
        return this.audiobook.audioFiles.length;
    }

    getDurationLabel(): string {
        if (!this.audiobook || !this.audiobook.totalAudioDurationSec) return 'N/A';
        const totalSeconds = Math.max(0, Math.floor(this.audiobook.totalAudioDurationSec));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    getStatusLabel(): string {
        if (!this.audiobook) return '';
        if (this.audiobook.published) return 'Published';
        if (this.audiobook.pipelineStatus === 'ready') return 'Ready';
        if (this.audiobook.pipelineStatus === 'failed') return 'Failed';
        if (this.audiobook.pipelineStatus === 'tts_processing') return 'Processing';
        return 'Pending';
    }

    private getFallbackCover(): string {
        const title = this.audiobook?.title || 'Audiobook';
        const safeTitle = encodeURIComponent(title);
        return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231e293b'/><stop offset='1' stop-color='%230f172a'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='50%25' fill='%23e2e8f0' font-family='Arial' font-size='18' text-anchor='middle'>${safeTitle}</text></svg>`;
    }

    viewItem() {
        if (this.audiobook) {
            this.router.navigate(['app/audiobook/view', this.audiobook._id])
        }
    }

}

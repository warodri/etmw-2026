import { Component, Input, OnInit, signal } from '@angular/core';
import { ScreenPlayer } from '../../../SCREEN/PLAYER/screen-player/screen-player';
import { AudiobookModel } from '../../../models/audiobook';
import { UtilClass } from '../../../utils/utils';

@Component({
    selector: 'app-etmw-player',
    standalone: false,
    templateUrl: './etmw-player.html',
    styleUrl: './etmw-player.css',
})
export class EtmwPlayer extends ScreenPlayer implements OnInit {

    coverFile = signal<string | null>(null);

    override ngOnInit(): void {
        super.ngOnInit();
    }

    override getAudiobookById(callback: any) {
        super.getAudiobookById(() => {
            this.coverFile.set(this.getCoverUrl());
            super.getListeningProgress(() => {
                if (callback) callback();
            })
        });
    }

    getChapterAudio(chapterNumber: number, callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.getInternetAudiobook().audiobookGetChapterAudio(audiobookId, chapterNumber, (response: any) => {
                if (response && response.success) {
                    
                }
                callback()
            })
        }

    }

}

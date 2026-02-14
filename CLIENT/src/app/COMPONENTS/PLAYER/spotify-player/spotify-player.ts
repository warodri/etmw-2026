import { Component, OnInit, signal } from '@angular/core';
import { ScreenPlayer } from '../../../SCREEN/PLAYER/screen-player/screen-player';

@Component({
    selector: 'app-spotify-player',
    standalone: false,
    templateUrl: './spotify-player.html',
    styleUrl: './spotify-player.css',
})
export class SpotifyPlayer extends ScreenPlayer implements OnInit {

    coverFile = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

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

    playChapter(chapterNumber: number) {
        this.loadingAudio.set(true);
        this.getChapterAudio(chapterNumber, (success: boolean) => {
            this.loadingAudio.set(false);
            if (!success) {
                this.errorMessage.set('Unable to load this chapter')
            } else {
                this.errorMessage.set(null)
            }
        })
    }

    getChapterAudio(chapterNumber: number, callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.getInternetAudiobook().audiobookGetChapterAudio(audiobookId, chapterNumber, (response: any) => {
                if (response && response.success) {
                    callback(true);
                } else {
                    callback(false);
                }
            })
        }
    }
    
}

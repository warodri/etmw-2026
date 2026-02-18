import { Component, Input, OnInit, signal } from '@angular/core';
import { ScreenPlayer } from '../../../SCREEN/PLAYER/screen-player/screen-player';

@Component({
    selector: 'app-etmw-player',
    standalone: false,
    templateUrl: './etmw-player.html',
    styleUrl: './etmw-player.css',
})
export class EtmwPlayer extends ScreenPlayer implements OnInit {

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
        this.isChapterAllowed(chapterNumber, (success: boolean) => {
            if (success) {
                this.errorMessage.set(null)
                this.getChapterAudio(chapterNumber, () => {
                    this.loadingAudio.set(false);
                })
            } else {
                this.loadingAudio.set(false);
                this.audiobookNotAvailableForThisUser.set(success);
                this.errorMessage.set('Unable to load this chapter');
            }
        })
    }

    isChapterAllowed(chapterNumber: number, callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.getInternetAudiobook().audiobookGetChapterAudioIsAvailable(audiobookId, chapterNumber, (response: any) => {
                if (response && response.success) {
                    callback(true);
                } else {
                    callback(false);
                }
            })
        }
    }

    getChapterAudio(chapterNumber: number, callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.getInternetAudiobook().audiobookGetChapterAudio(audiobookId, chapterNumber, (buffer: ArrayBuffer | null) => {
                if (!buffer) {
                    this.errorMessage.set('Unable to load this chapter');
                    return;
                }
                const blob = new Blob([buffer], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                this.setAudioSource(url, true, () => {
                    this.audioLoaded.set(true);
                    if (callback) callback();
                });
            }
        );
        }
    }

    seeMore() {
        this.getRouter().navigate(['app/page/chapter-not-available'])
    }

}

import { Component, Input, OnInit, signal } from '@angular/core';
import { ScreenPlayer } from '../../../SCREEN/PLAYER/screen-player/screen-player';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-etmw-player',
    standalone: false,
    templateUrl: './etmw-player.html',
    styleUrl: './etmw-player.css',
})
export class EtmwPlayer extends ScreenPlayer implements OnInit {
    language: 'en' | 'es' = 'en';

    coverFile = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    //  Flags
    showChapterList = signal<boolean>(false);

    override ngOnInit(): void {
        this.language = LangUtils.detectLanguage();
        super.ngOnInit();
    }

    override getAudiobookById(callback: any) {
        super.getAudiobookById(() => {
            this.coverFile.set(this.getCoverUrl());
            if (callback) callback();
        });
    }

    playChapter(chapterNumber: number) {
        this.loadingAudio.set(true);
        this.isChapterAllowed(chapterNumber, (success: boolean) => {
            if (success) {
                this.audiobookNotAvailableForThisUser.set(true);
                this.errorMessage.set(null)
                this.chapterNumber.set(chapterNumber);
                const idx = this.getChapters().findIndex((ch) => Number(ch.chapter) === Number(chapterNumber));
                if (idx >= 0) {
                    this.selectedChapterIndex.set(idx);
                }
                this.getListeningProgress(() => {
                    this.getChapterAudio(chapterNumber, () => {
                        this.loadingAudio.set(false);
                    })
                })
            } else {
                this.loadingAudio.set(false);
                this.audiobookNotAvailableForThisUser.set(success);
                this.errorMessage.set(this.tr('Unable to load this chapter', 'No se pudo cargar este capítulo'));
            }
        })
    }

    override autoPlayChapter(chapterNumber: number) {
        this.playChapter(chapterNumber);
    }

    isChapterAllowed(chapterNumber: number, callback: any) {
        const audiobookId = this.audiobookId();
        if (!audiobookId) {
            callback(false);
            return;
        }
        this.getInternetAudiobook().audiobookGetChapterAudioIsAvailable(audiobookId, chapterNumber, (response: any) => {
            console.log('audiobookGetChapterAudioIsAvailable', response)
            if (response && response.success) {
                callback(true);
            } else {
                callback(false);
            }
        })
    }

    getChapterAudio(chapterNumber: number, callback: any) {
        const audiobookId = this.audiobookId();
        if (!audiobookId) {
            this.audiobookNotAvailableForThisUser.set(false);
            this.errorMessage.set(this.tr('Unable to load this chapter', 'No se pudo cargar este capítulo'));
            if (callback) callback();
            return;
        }
        this.getInternetAudiobook().audiobookGetChapterAudio(audiobookId, chapterNumber, (buffer: ArrayBuffer | null) => {
            console.log('audiobookGetChapterAudio')
            if (!buffer) {
                this.audiobookNotAvailableForThisUser.set(false);
                this.errorMessage.set(this.tr('Unable to load this chapter', 'No se pudo cargar este capítulo'));
                if (callback) callback();
                return;
            }
            this.audiobookNotAvailableForThisUser.set(true);
            const blob = new Blob([buffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            this.setAudioSource(url, true, () => {
                this.audioLoaded.set(true);
                if (callback) callback();
            });
        }
    );
    }

    seeMore() {
        this.getRouter().navigate(['app/page/chapter-not-available'])
    }

    toggleChapterList() {
        this.showChapterList.set(!this.showChapterList())
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }
    
}

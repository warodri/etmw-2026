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

    override startPlayback() {
        this.playChapter(this.chapterNumber());
    }

    playChapter(chapterNumber: number) {
        if (!this.hasActivePlan()) {
            this.loadingAudio.set(false);
            this.audioLoaded.set(false);
            this.audiobookNotAvailableForThisUser.set(false);
            this.errorMessage.set(this.tr('You need an active plan to listen.', 'Necesitas un plan activo para escuchar.'));
            return;
        }
        this.loadingAudio.set(true);
        this.isChapterAllowed(chapterNumber, (success: boolean, reasonMessage: string | null) => {
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
                this.errorMessage.set(reasonMessage || this.tr('Unable to load this chapter', 'No se pudo cargar este capítulo'));
            }
        })
    }

    override togglePlay() {
        if (this.isPlaying) {
            super.togglePlay();
            return;
        }

        if (!this.hasActivePlan()) {
            this.audioLoaded.set(false);
            this.audiobookNotAvailableForThisUser.set(false);
            this.errorMessage.set(this.tr('You need an active plan to listen.', 'Necesitas un plan activo para escuchar.'));
            return;
        }

        const chapterNumber = this.chapterNumber();
        if (!this.audioElement || !this.audioElement.src) {
            this.playChapter(chapterNumber);
            return;
        }

        super.togglePlay();
    }

    override autoPlayChapter(chapterNumber: number) {
        this.playChapter(chapterNumber);
    }

    isChapterAllowed(chapterNumber: number, callback: any) {
        const audiobookId = this.audiobookId();
        if (!audiobookId) {
            callback(false, this.tr('Invalid audiobook.', 'Audiolibro inválido.'));
            return;
        }
        this.getInternetAudiobook().audiobookGetChapterAudioIsAvailable(audiobookId, chapterNumber, (response: any) => {
            console.log('audiobookGetChapterAudioIsAvailable', response)
            if (response && response.success) {
                callback(true, null);
            } else {
                callback(false, this.resolveAvailabilityMessage(response));
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

    private resolveAvailabilityMessage(response: any): string {
        const reasonCode = response?.reasonCode || response?.data?.reasonCode || null;
        const message = response?.message || '';
        if (reasonCode === 'monthly-book-limit') {
            return this.tr(
                'Chapter not available: you reached your monthly book limit for this plan.',
                'Capítulo no disponible: alcanzaste tu límite mensual de libros para este plan.'
            );
        }
        if (reasonCode === 'daily-chapter-limit') {
            return this.tr(
                'Chapter not available yet: your plan unlocks one new chapter per day.',
                'Capítulo no disponible aún: tu plan desbloquea un nuevo capítulo por día.'
            );
        }
        if (reasonCode === 'no-active-plan') {
            return this.tr(
                'You need an active plan to listen.',
                'Necesitas un plan activo para escuchar.'
            );
        }
        if (typeof message === 'string' && message.trim().length > 0) {
            return message;
        }
        return this.tr('Unable to load this chapter', 'No se pudo cargar este capítulo');
    }
    
}

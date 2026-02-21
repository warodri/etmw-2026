import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AudiobookModel } from '../../../models/audiobook';
import { ListeningProgressModel } from '../../../models/listening-progress';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { ToastService } from '../../../SERVICES/toast';
import { UtilsService } from '../../../utils/utils-service';
import { SubscriptionModel } from '../../../models/subscription';
import { InternetSubscriptionService } from '../../../SERVICES/internet-subscription.services';

@Component({
    selector: 'app-screen-player',
    standalone: false,
    templateUrl: './screen-player.html',
    styleUrl: './screen-player.css',
})
export class ScreenPlayer implements OnInit, OnDestroy {

    //  Basic information
    subscription = signal<SubscriptionModel | null>(null);
    audiobookId = signal<string | null>(null);
    chapterNumber = signal<number>(1);
    audiobook = signal<AudiobookModel | null>(null);
    listeningProgress = signal<ListeningProgressModel[]>([]);

    // Player state
    isPlaying = false;
    isBookmarked = false;
    isShuffle = false;
    isRepeat = false;
    isLiked = false;

    // Time
    currentTime = signal<string>('0:00');
    totalTime = signal<string>('0:00');
    currentSeconds = 0;
    totalSeconds = 0;
    progressPercent = signal<number>(0);

    // Playback
    playbackSpeed = 1.0;
    private readonly playbackSpeedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2];
    private readonly sleepTimerOptionsMin = [0, 5, 10, 15, 30, 45, 60];

    // Chapter info
    currentChapter = -1;
    totalChapters = 0;

    // Waveform visualization
    waveformBars: { height: number }[] = [];
    currentBarIndex = signal<number>(0);

    //  Audio playing
    selectedChapterIndex = signal<number>(0);
    private intervalId: any;
    private sleepTimerIntervalId: any;
    protected audioElement: HTMLAudioElement | null = null;
    protected audioUrl: string | null = null;
    loadingAudio = signal<boolean>(false);
    sleepTimerRemainingSec = signal<number>(0);
    private pendingChapterProgressPercent: number | null = null;
    private initialProgressAppliedForCurrentSource = false;
    private lastHistorySyncAt = 0;
    private lastHistorySyncedProgress = -1;

    //  Flags 
    loading = signal<boolean>(true);
    audioLoaded = signal<boolean>(false);
    audiobookNotAvailableForThisUser = signal<boolean>(false);

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastService,
        private utils: UtilsService,
        private iAudiobook: InternetAudiobookService,
        private iUser: InternetUserService,
        private iSubcription: InternetSubscriptionService,
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.audiobookId.set(params.get('audiobookId'));
            const chapterNumber = params.get('chapterNumber');
            try {
                if (chapterNumber) {
                    this.chapterNumber.set( parseInt(chapterNumber) )
                }
            } catch(ex) {
                this.chapterNumber.set(1)
            }
            this.getAudiobookById(() => {
                this.getListeningProgress(() => {
                    this.subscriptionGetMine(() => {
                        this.generateWaveform();
                        this.startPlayback();            
                        this.loading.set(false);
                    })
                })
            })
        })
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.syncListeningHistory(true);
        this.clearSleepTimer(false);
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
        }
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
            this.audioElement = null;
        }
    }

    getCoverUrl(): string {
        const audiobook = this.audiobook();
        if (!audiobook) return this.getFallbackCover();
        if (audiobook.coverFile && audiobook.coverFileMimetype) {
            return this.utils.getClientUrlForFiles(audiobook.coverFile, audiobook.coverFileMimetype);
        }
        return this.getFallbackCover();
    }

    private getFallbackCover(): string {
        const audiobook = this.audiobook();
        const title = audiobook?.title || 'Audiobook';
        const safeTitle = encodeURIComponent(title);
        return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231e293b'/><stop offset='1' stop-color='%230f172a'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='50%25' fill='%23e2e8f0' font-family='Arial' font-size='18' text-anchor='middle'>${safeTitle}</text></svg>`;
    }

    getAudiobookById(callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.iAudiobook.audiobookFindById(audiobookId, (response: any) => {
                if (response && response.success) {
                    const book = response.audiobook || (response.audiobooks && response.audiobooks[0]) || null;
                    this.audiobook.set(book);
                    callback()
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected());
                }
            })
        }
    }

    getListeningProgress(callback: any) {
        const audiobookId = this.audiobookId();
        const chapterNumber = this.chapterNumber();
        if (!audiobookId || !chapterNumber) {
            if (callback) callback();
            return;
        }
        this.iUser.userGetListeningHistory(audiobookId, chapterNumber, (response: any) => {
            if (response && response.success) {
                const history = this.normalizeListeningHistory(response.history);
                this.listeningProgress.set(history);
                this.pendingChapterProgressPercent = this.extractChapterProgressPercent(history, chapterNumber);
                this.progressPercent.set(this.pendingChapterProgressPercent);
                this.applyPendingChapterProgress();
            } else {
                this.pendingChapterProgressPercent = null;
            }
            if (callback) callback();
        })
    }
    
    subscriptionGetMine(callback: any) {
        this.iSubcription.subscriptionGetMine((response: any) => {
            if (response && response.success) {
                this.subscription.set(response.subscription)
            }
            callback()
        })
    }

    goBack() {
        this.router.navigate(['app'])
    }

    generateWaveform() {
        // Generate 60 bars with random heights
        for (let i = 0; i < 60; i++) {
            this.waveformBars.push({
                height: Math.random() * 80 + 20 // Between 20% and 100%
            });
        }
    }

    calculateProgress(): number {
        // Total circumference = 2 * pi * radius = 2 * pi * 130 ~= 816.8
        const circumference = 816.8;
        const progress = (this.currentSeconds / this.totalSeconds) * 100;
        return circumference - (circumference * progress) / 100;
    }

    startPlayback() {
        this.initAudioElement();
        this.loadChapterAudio(this.chapterNumber());
    }

    updateTime() {
        const minutes = Math.floor(this.currentSeconds / 60);
        const seconds = this.currentSeconds % 60;
        this.currentTime.set(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        const percent = this.totalSeconds > 0 ? (this.currentSeconds / this.totalSeconds) * 100 : 0;
        this.progressPercent.set(Math.max(0, Math.min(100, percent)));
    }

    updateWaveform() {
        // Update current bar index based on progress
        const totalBars = this.waveformBars.length;
        if (totalBars === 0) return;
        const progress = this.totalSeconds > 0 ? (this.currentSeconds / this.totalSeconds) : 0;
        const clamped = Math.max(0, Math.min(1, progress));
        this.currentBarIndex.set(Math.floor(clamped * totalBars));
    }

    getChapters(): Array<{ chapter: number, durationSec: number }> {
        const book = this.audiobook();
        if (!book || !Array.isArray(book.audioFiles)) return [];
        return book.audioFiles.map((c: any) => ({
            chapter: c.chapter,
            durationSec: c.durationSec || 0
        }));
    }

    selectChapter(index: number) {
        this.selectedChapterIndex.set(index);
    }

    formatDuration(totalSeconds: number | undefined): string {
        const seconds = Math.max(0, Math.floor(totalSeconds || 0));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    togglePlay() {
        this.initAudioElement();
        if (!this.audioElement) return;

        if (!this.audioElement.src) {
            this.loadChapterAudio(this.chapterNumber(), () => {
                this.audioElement?.play();
                this.isPlaying = true;
            });
            return;
        }

        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
        } else {
            this.audioElement.play();
            this.isPlaying = true;
        }
    }

    toggleBookmark() {
        this.isBookmarked = !this.isBookmarked;
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
    }

    skipBackward(seconds: number = 10) {
        if (this.audioElement) {
            this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - seconds);
        } else {
            this.currentSeconds = Math.max(0, this.currentSeconds - seconds);
            this.updateTime();
            this.updateWaveform();
        }
    }

    skipForward(seconds: number = 10) {
        if (this.audioElement) {
            this.audioElement.currentTime = Math.min(this.totalSeconds, this.audioElement.currentTime + seconds);
        } else {
            this.currentSeconds = Math.min(this.totalSeconds, this.currentSeconds + seconds);
            this.updateTime();
            this.updateWaveform();
        }
    }

    protected initAudioElement() {
        if (this.audioElement) return;
        this.audioElement = new Audio();
        this.audioElement.playbackRate = this.playbackSpeed;
        this.audioElement.addEventListener('timeupdate', () => {
            if (!this.audioElement) return;
            this.currentSeconds = Math.floor(this.audioElement.currentTime);
            this.totalSeconds = Math.floor(this.audioElement.duration || 0);
            this.updateTime();
            this.updateWaveform();
            this.syncListeningHistory(false);
        });
        this.audioElement.addEventListener('loadedmetadata', () => {
            if (!this.audioElement) return;
            this.totalSeconds = Math.floor(this.audioElement.duration || 0);
            this.applyPendingChapterProgress();
            this.updateTime();
            this.audioLoaded.set(true);
        });
        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.syncListeningHistory(true);
        });
        this.audioElement.addEventListener('pause', () => {
            this.syncListeningHistory(true);
        });
    }

    protected loadChapterAudio(chapterNumber: number, callback?: any) {
        const audiobookId = this.audiobookId();
        if (!audiobookId) return;

        this.loadingAudio.set(true);
        this.audioLoaded.set(false);
        this.iAudiobook.audiobookGetChapterAudio(audiobookId, chapterNumber, (buffer: ArrayBuffer | null) => {
            this.loadingAudio.set(false);
            if (!buffer || !this.audioElement) {
                this.toast.show('Audio not available');
                return;
            }
            if (this.audioUrl) {
                URL.revokeObjectURL(this.audioUrl);
            }
            const blob = new Blob([buffer], { type: 'audio/mpeg' });
            this.audioUrl = URL.createObjectURL(blob);
            this.audioElement.src = this.audioUrl;
            this.audioElement.playbackRate = this.playbackSpeed;
            this.initialProgressAppliedForCurrentSource = false;
            this.lastHistorySyncAt = 0;
            this.lastHistorySyncedProgress = -1;
            this.audioElement.load();
            this.audiobookNotAvailableForThisUser.set(true);
            this.audioLoaded.set(true);
            if (callback) callback();
        });
    }

    protected setAudioSource(url: string, autoplay: boolean = true, callback?: () => void) {
        this.initAudioElement();
        if (!this.audioElement) return;
        this.audioLoaded.set(false);
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
        }
        this.audioUrl = url;
        this.audioElement.src = url;
        this.audioElement.playbackRate = this.playbackSpeed;
        this.initialProgressAppliedForCurrentSource = false;
        this.lastHistorySyncAt = 0;
        this.lastHistorySyncedProgress = -1;
        this.audioElement.load();
        if (autoplay) {
            this.audioElement.play().then(() => {
                this.isPlaying = true;
                if (callback) callback();
            }).catch(() => {
                this.isPlaying = false;
                if (callback) callback();
            });
        } else {
            if (callback) callback();
        }
    }

    openSpeed() {
        const idx = this.playbackSpeedOptions.indexOf(this.playbackSpeed);
        const nextIdx = idx >= 0 ? (idx + 1) % this.playbackSpeedOptions.length : 1;
        this.playbackSpeed = this.playbackSpeedOptions[nextIdx];
        if (this.audioElement) {
            this.audioElement.playbackRate = this.playbackSpeed;
        }
        this.toast.show(`Speed: ${this.playbackSpeed}x`);
    }

    openTimer() {
        const currentMin = this.sleepTimerRemainingSec() > 0 ? Math.ceil(this.sleepTimerRemainingSec() / 60) : 0;
        const currentIdx = this.sleepTimerOptionsMin.indexOf(currentMin);
        const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % this.sleepTimerOptionsMin.length : 1;
        const nextMin = this.sleepTimerOptionsMin[nextIdx];

        if (nextMin === 0) {
            this.clearSleepTimer();
            return;
        }
        this.startSleepTimer(nextMin);
    }

    getSleepTimerLabel(): string {
        const remaining = this.sleepTimerRemainingSec();
        if (remaining <= 0) return 'Timer';
        const minutes = Math.ceil(remaining / 60);
        return `Timer ${minutes}m`;
    }

    private startSleepTimer(minutes: number) {
        const totalSeconds = minutes * 60;
        this.clearSleepTimer(false);
        this.sleepTimerRemainingSec.set(totalSeconds);
        this.toast.show(`Sleep timer: ${minutes}m`);
        this.sleepTimerIntervalId = setInterval(() => {
            const next = this.sleepTimerRemainingSec() - 1;
            if (next <= 0) {
                this.sleepTimerRemainingSec.set(0);
                this.clearSleepTimer(false);
                if (this.audioElement) {
                    this.audioElement.pause();
                }
                this.isPlaying = false;
                this.toast.show('Sleep timer ended');
                return;
            }
            this.sleepTimerRemainingSec.set(next);
        }, 1000);
    }

    private clearSleepTimer(showMessage: boolean = true) {
        if (this.sleepTimerIntervalId) {
            clearInterval(this.sleepTimerIntervalId);
            this.sleepTimerIntervalId = null;
        }
        const hadTimer = this.sleepTimerRemainingSec() > 0;
        this.sleepTimerRemainingSec.set(0);
        if (showMessage && hadTimer) {
            this.toast.show('Sleep timer off');
        }
    }

    getInternetAudiobook() {
        return this.iAudiobook;
    }

    getRouter() {
        return this.router;
    }

    private normalizeListeningHistory(raw: any): ListeningProgressModel[] {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        return [raw];
    }

    private extractChapterProgressPercent(history: ListeningProgressModel[], chapterNumber: number): number {
        const item = history.find((h) => Number(h.chapterNumber) === Number(chapterNumber));
        if (!item || typeof item.progressPercent !== 'number') return 0;
        return Math.max(0, Math.min(99.5, item.progressPercent));
    }

    private applyPendingChapterProgress() {
        if (!this.audioElement) return;
        if (this.initialProgressAppliedForCurrentSource) return;
        if (this.pendingChapterProgressPercent === null) return;
        if (!this.audioElement.duration || !Number.isFinite(this.audioElement.duration)) return;
        if (this.pendingChapterProgressPercent <= 0) {
            this.initialProgressAppliedForCurrentSource = true;
            return;
        }
        const targetSeconds = (this.audioElement.duration * this.pendingChapterProgressPercent) / 100;
        try {
            this.audioElement.currentTime = Math.max(0, targetSeconds);
            this.currentSeconds = Math.floor(this.audioElement.currentTime);
            this.totalSeconds = Math.floor(this.audioElement.duration);
            this.updateTime();
            this.updateWaveform();
            this.initialProgressAppliedForCurrentSource = true;
        } catch (ex) {
            // ignore seek failures
        }
    }

    private syncListeningHistory(force: boolean) {
        const audiobookId = this.audiobookId();
        const chapterNumber = this.chapterNumber();
        if (!audiobookId || !chapterNumber) return;
        const progress = this.progressPercent();
        if (!Number.isFinite(progress)) return;
        const clamped = Math.max(0, Math.min(100, progress));
        const now = Date.now();
        const enoughTime = now - this.lastHistorySyncAt >= 5000;
        const enoughProgress = Math.abs(clamped - this.lastHistorySyncedProgress) >= 2;
        if (!force && !enoughTime && !enoughProgress) return;
        this.lastHistorySyncAt = now;
        this.lastHistorySyncedProgress = clamped;
        const completed = clamped >= 99;
        this.iUser.userSetListeningHistory(audiobookId, chapterNumber, clamped, completed, () => {});
    }
    
}

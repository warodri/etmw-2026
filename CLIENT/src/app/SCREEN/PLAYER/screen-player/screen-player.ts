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
    currentSeconds = 64;
    totalSeconds = 209;
    progressPercent = signal<number>(0);

    // Playback
    playbackSpeed = 1.0;

    // Chapter info
    currentChapter = -1;
    totalChapters = 0;

    // Waveform visualization
    waveformBars: { height: number }[] = [];
    currentBarIndex = signal<number>(0);

    //  Audio playing
    selectedChapterIndex = signal<number>(0);
    private intervalId: any;
    private audioElement: HTMLAudioElement | null = null;
    private audioUrl: string | null = null;
    loadingAudio = signal<boolean>(false);

    //  Flags 
    loading = signal<boolean>(true);
    audioLoaded = signal<boolean>(false);

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
        if (audiobookId) {
            this.iUser.userGetListeningHistory(audiobookId, (response: any) => {
                if (response && response.success) {
                    this.listeningProgress.set(response.history)
                }
                callback()
            })
        }
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
        // Calculate stroke-dashoffset for circular progress
        // Total circumference = 2 * π * radius = 2 * π * 130 ≈ 816.8
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

    private initAudioElement() {
        if (this.audioElement) return;
        this.audioElement = new Audio();
        this.audioElement.addEventListener('timeupdate', () => {
            if (!this.audioElement) return;
            this.currentSeconds = Math.floor(this.audioElement.currentTime);
            this.totalSeconds = Math.floor(this.audioElement.duration || 0);
            this.updateTime();
            this.updateWaveform();
        });
        this.audioElement.addEventListener('loadedmetadata', () => {
            if (!this.audioElement) return;
            this.totalSeconds = Math.floor(this.audioElement.duration || 0);
            this.updateTime();
        });
        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
        });
    }

    private loadChapterAudio(chapterNumber: number, callback?: any) {
        const audiobookId = this.audiobookId();
        if (!audiobookId) return;

        this.loadingAudio.set(true);
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
            this.audioElement.load();
            if (callback) callback();
        });
    }

    openChapters() {
        console.log('Open chapters modal');
        // Open chapters list modal/bottom sheet
    }

    openSpeed() {
        console.log('Open speed selector');
        // Open playback speed selector
    }

    openTimer() {
        console.log('Open sleep timer');
        // Open sleep timer modal
    }

    getInternetAudiobook() {
        return this.iAudiobook;
    }

}

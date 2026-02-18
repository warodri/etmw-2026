import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren, signal } from '@angular/core';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { InternetStoryService } from '../../../SERVICES/internet-stories.service';
import { Config } from '../../../utils/config';

type ChapterPiece = {
    title: string,
    quote: string,
    readingText: string,
    audioImage: string,
    audioUrl: string | null,
    slideIndex: number,
    isPlaying: boolean,
    isMuted: boolean,
    progress: number,
    expanded: boolean,
    hasResume: boolean,
    resumeTime: number
};

type Story = {
    _id: string,
    audiobookId: string,
    chapterNumber: number,
    totalChapters: number,
    language: string,
    chapterPieces: ChapterPiece[],
    image: string,
    author: string,
    title: string,
    subtitle: string,
    quote: string,
    slideIndex: number,
    createdAt?: number,
    updatedAt?: number,
};

@Component({
  selector: 'app-screen-stories',
  standalone: false,
  templateUrl: './screen-stories.html',
  styleUrl: './screen-stories.css',
})
export class ScreenStories implements OnInit {

    @ViewChildren('storyItem') storyItems!: QueryList<ElementRef>;

    myUser = signal<UserModel | null>(null);

    stories = signal<Story[]>([])

    SERVER_FOR_IMAGES = Config.dev ? Config.SERVER.local : Config.SERVER.remote

    /**
     * Delete once all is working nicely
     */
    storiesMock = signal<Story[]>([
        {
            _id: '1',
            audiobookId: '1',
            chapterNumber: 2,    
            totalChapters: 30,
            language: 'en',
            chapterPieces: [
                { 
                    title: 'Chapter 1 · Part A',
                    quote: '“Most people don’t want freedom. They want safety.”',
                    readingText: 'A quiet opening that sets the tone for what follows.',
                    audioImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/wind_whistling.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                },
                { 
                    title: 'Chapter 1 · Part B',
                    quote: '“Comfort disguised as choice.”',
                    readingText: 'A small turn that hints at the larger conflict.',
                    audioImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/wind_whistling.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                }
            ],
            image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&h=1600&fit=crop',
            author: 'Walter Rodriguez',
            title: 'Freedom & Safety',
            subtitle: 'A 60‑second reflection',
            quote: '“Most people don’t want freedom. They want safety.”',
            slideIndex: 0
        },
        {
            _id: '2',
            audiobookId: '1',
            chapterNumber: 3,    
            totalChapters: 30,
            language: 'en',
            chapterPieces: [
                { 
                    title: 'Chapter 2 · Part A',
                    quote: '“We don’t fear change. We fear the unknown cost of it.”',
                    readingText: 'A fork in the road reveals a hidden cost.',
                    audioImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/birds_in_forest.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                },
                { 
                    title: 'Chapter 2 · Part B',
                    quote: '“The price of uncertainty.”',
                    readingText: 'The decision sharpens, and so does the tension.',
                    audioImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/birds_in_forest.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                },
                { 
                    title: 'END',
                    quote: '“The price of uncertainty.”',
                    readingText: 'The decision sharpens, and so does the tension.',
                    audioImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=1600&fit=crop',
                    audioUrl: '',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                }
            ],
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=1600&fit=crop',
            author: 'Jonas Reed',
            title: 'The Cost of Change',
            subtitle: 'Micro‑essay',
            quote: '“We don’t fear change. We fear the unknown cost of it.”',
            slideIndex: 0
        },
        {
            _id: '3',
            audiobookId: '1',
            chapterNumber: 30,    
            totalChapters: 30,
            language: 'en',
            chapterPieces: [
                { 
                    title: 'Chapter 30 · Part A',
                    quote: '“Discipline is kindness to your future self.”',
                    readingText: 'Small disciplines begin to compound.',
                    audioImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/waves_on_beach.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                },
                { 
                    title: 'Chapter 30 · Part B',
                    quote: '“Momentum builds where consistency lives.”',
                    readingText: 'A last reflection before the close.',
                    audioImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/waves_on_beach.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                }
            ],
            image: 'https://images.unsplash.com/photo-1473181488821-2d23949a045a?w=1200&h=1600&fit=crop',
            author: 'Aisha Noor',
            title: 'Discipline Is Kindness',
            subtitle: 'Daily note',
            quote: '“Discipline is kindness to your future self.”',
            slideIndex: 0
        },
        {
            _id: '4',
            audiobookId: '1',
            chapterNumber: 1,    
            totalChapters: 30,
            language: 'en',
            chapterPieces: [
                { 
                    title: 'Chapter 1 · Part A',
                    quote: '“Attention is the real currency.”',
                    readingText: 'The final thread becomes clear.',
                    audioImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_ambience.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                },
                { 
                    title: 'last',
                    quote: '“Attention is the real currency.”',
                    readingText: 'A last reflection before the close.',
                    audioImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=1600&fit=crop',
                    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_ambience.ogg',
                    slideIndex: 0,
                    isPlaying: false,
                    isMuted: false,
                    progress: 0,
                    expanded: false,
                    hasResume: false,
                    resumeTime: 0
                }
            ],
            image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&h=1600&fit=crop',
            author: 'Leo March',
            title: 'Walter',
            subtitle: 'Short essay',
            quote: '“Attention is the real currency.”',
            slideIndex: 0
        }
    ]);

    private touchStartX = 0;
    private touchStartY = 0;
    private touchStoryId: string | null = null;
    private observer: IntersectionObserver | null = null;
    private audioMap = new Map<string, HTMLAudioElement>();
    private storageKey = 'etmw_last_story_id';
    private muteKey = 'etmw_story_muted';

    constructor(
        private iUser: InternetUserService,
        private iStory: InternetStoryService
    ) {}

    ngOnInit(): void {
        this.loadMyUser(() => {
            this.loadStories();
        })
    }

    ngAfterViewInit(): void {
        this.setupObserver();
        this.storyItems.changes.subscribe(() => this.setupObserver());
        setTimeout(() => {
            this.loadResumeStates();
            this.loadMuteState();
        }, 0);
    }

    ngOnDestroy(): void {
        if (this.observer) this.observer.disconnect();
        this.audioMap.forEach((audio) => {
            audio.pause();
            audio.src = '';
        });
        this.audioMap.clear();
    }

    loadMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
            }
            callback();
        })
    }

    loadStories() {
        this.iStory.getStories((response: any) => {
            console.log('getStories', response)
            if (response && response.success) {
                for (let item of response.stories) {
                    if (!item.image) {
                        item.image = 'story-fallback-img.jpeg';
                    } else {
                        item.image = this.SERVER_FOR_IMAGES + '/file/' + item.image;
                    }
                    for (let subItem of item.chapterPieces) {
                        if (!subItem.audioImage) {
                            subItem.audioImage = 'story-fallback-img.jpeg';
                        } else {
                            subItem.audioImage = this.SERVER_FOR_IMAGES + '/file/' + subItem.audioImage;
                        }                        
                    }
                }
                this.stories.set(response.stories);
            }
        })
    }

    onTouchStart(event: TouchEvent, storyId: string) {
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStoryId = storyId;
    }

    onTouchMove(event: TouchEvent, storyId: string) {
        if (this.touchStoryId !== storyId) return;
        const touch = event.touches[0];
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            event.preventDefault();
        }
    }

    onTouchEnd(event: TouchEvent, storyId: string) {
        if (this.touchStoryId !== storyId) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;
        this.touchStoryId = null;

        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) {
            const story = this.getStory(storyId);
            const maxIndex = story ? this.slideCount(story) - 1 : 1;
            const next = Math.min(maxIndex, (story?.slideIndex || 0) + 1);
            this.setSlide(storyId, next);
        } else {
            const story = this.getStory(storyId);
            const prev = Math.max(0, (story?.slideIndex || 0) - 1);
            this.setSlide(storyId, prev);
        }
    }

    setSlide(storyId: string, index: number) {
        this.updateStory(storyId, { slideIndex: index });
        if (index >= 1) {
            this.autoPlayIfAllowed(storyId, index - 1);
        }
    }

    showMore(storyId: string) {
        this.setSlide(storyId, 1);
    }

    private buildMessagePiece(story: Pick<Story, 'chapterNumber' | 'totalChapters'>): ChapterPiece | null {
        if (story.chapterNumber < story.totalChapters) {
            return {
                title: 'More to come',
                quote: 'Stay tuned',
                readingText: 'The story continues soon!',
                audioImage: '',
                audioUrl: '',
                slideIndex: 0,
                isPlaying: false,
                isMuted: true,
                progress: 0,
                expanded: false,
                hasResume: false,
                resumeTime: 0
            };
        }
        if (story.chapterNumber === story.totalChapters) {
            return {
                title: 'Thanks for enjoying the book',
                quote: '',
                readingText: 'If you liked it, make sure to check more.',
                audioImage: '',
                audioUrl: '',
                slideIndex: 0,
                isPlaying: false,
                isMuted: true,
                progress: 0,
                expanded: false,
                hasResume: false,
                resumeTime: 0
            };
        }
        return null;
    }

    displayPieces(story: Pick<Story, 'chapterPieces' | 'chapterNumber' | 'totalChapters'>): ChapterPiece[] {
        const message = this.buildMessagePiece(story);
        const a = message ? [...story.chapterPieces, message] : [...story.chapterPieces];
        return a;
    }

    slideCount(story: Pick<Story, 'chapterPieces' | 'chapterNumber' | 'totalChapters'>): number {
        return 1 + this.displayPieces(story).length;
    }

    slideDots(story: Pick<Story, 'chapterPieces' | 'chapterNumber' | 'totalChapters'>): number[] {
        return Array.from({ length: this.slideCount(story) }, (_, i) => i);
    }

    toggleExpand(storyId: string, pieceIndex: number) {
        const story = this.getStory(storyId);
        if (!story) return;
        const piece = story.chapterPieces[pieceIndex];
        if (!piece) return;
        this.updatePiece(storyId, pieceIndex, { expanded: !piece.expanded });
    }

    toggleAudio(storyId: string, pieceIndex: number) {
        const story = this.getStory(storyId);
        if (!story) return;
        const piece = story.chapterPieces[pieceIndex];
        if (!piece) return;
        if (!piece.audioUrl) return;
        const audio = this.getAudio(this.audioKey(storyId, pieceIndex), piece.audioUrl);

        if (piece.isPlaying) {
            audio.pause();
            this.updatePiece(storyId, pieceIndex, { isPlaying: false });
            return;
        }

        this.stopAllAudio(this.audioKey(storyId, pieceIndex));
        audio.muted = piece.isMuted;
        audio.play().then(() => {
            this.updatePiece(storyId, pieceIndex, { isPlaying: true });
        }).catch(() => {
            this.updatePiece(storyId, pieceIndex, { isPlaying: false });
        });
    }

    toggleMute(storyId: string, pieceIndex: number) {
        const story = this.getStory(storyId);
        if (!story) return;
        const piece = story.chapterPieces[pieceIndex];
        if (!piece) return;
        if (!piece.audioUrl) return;
        const audio = this.getAudio(this.audioKey(storyId, pieceIndex), piece.audioUrl);
        const next = !piece.isMuted;
        audio.muted = next;
        this.updatePiece(storyId, pieceIndex, { isMuted: next });
        this.persistMuteState(next);
        if (next && piece.isPlaying) {
            // If user mutes, stop autoplay logic
            audio.pause();
            this.updatePiece(storyId, pieceIndex, { isPlaying: false });
        }
    }

    private getStory(id: string) {
        return this.stories().find((s) => s._id === id) || null;
    }

    languageLabel(code: string): string {
        if (!code) return 'Language: Unknown';
        const base = code.toLowerCase().split(/[-_]/)[0];
        const labels: Record<string, string> = {
            en: 'English',
            es: 'Spanish',
            fr: 'French',
            de: 'German',
            it: 'Italian',
            pt: 'Portuguese',
            nl: 'Dutch',
            sv: 'Swedish',
            no: 'Norwegian',
            da: 'Danish',
            fi: 'Finnish',
            pl: 'Polish',
            cs: 'Czech',
            hu: 'Hungarian',
            ro: 'Romanian',
            el: 'Greek',
            tr: 'Turkish',
            ru: 'Russian',
            uk: 'Ukrainian',
            ar: 'Arabic',
            he: 'Hebrew',
            hi: 'Hindi',
            bn: 'Bengali',
            ur: 'Urdu',
            th: 'Thai',
            vi: 'Vietnamese',
            id: 'Indonesian',
            ms: 'Malay',
            zh: 'Chinese',
            ja: 'Japanese',
            ko: 'Korean'
        };
        const label = labels[base];
        return label ? `Language: ${label}` : `Language: ${code.toUpperCase()}`;
    }

    private updateStory(id: string, patch: Partial<any>) {
        this.stories.update((list) =>
            list.map((s) => s._id === id ? { ...s, ...patch } : s)
        );
    }

    private updatePiece(storyId: string, pieceIndex: number, patch: Partial<any>) {
        this.stories.update((list) =>
            list.map((s) => {
                if (s._id !== storyId) return s;
                return {
                    ...s,
                    chapterPieces: s.chapterPieces.map((p, i) => i === pieceIndex ? { ...p, ...patch } : p)
                };
            })
        );
    }

    private audioKey(storyId: string, pieceIndex: number) {
        return `${storyId}:${pieceIndex}`;
    }

    private getAudio(id: string, url: string) {
        let audio = this.audioMap.get(id);
        if (!audio) {
            audio = new Audio(url);
            audio.preload = 'auto';
            audio.muted = this.getStoredMute();
            audio.addEventListener('timeupdate', () => {
                const progress = audio!.duration ? (audio!.currentTime / audio!.duration) * 100 : 0;
                const [storyId, pieceIndexRaw] = id.split(':');
                const pieceIndex = Number(pieceIndexRaw);
                if (!Number.isNaN(pieceIndex)) {
                    this.updatePiece(storyId, pieceIndex, { progress });
                    this.storeResume(storyId, pieceIndex, audio!.currentTime, audio!.duration || 0);
                }
            });
            audio.addEventListener('ended', () => {
                const [storyId, pieceIndexRaw] = id.split(':');
                const pieceIndex = Number(pieceIndexRaw);
                if (!Number.isNaN(pieceIndex)) {
                    this.updatePiece(storyId, pieceIndex, { isPlaying: false, progress: 0 });
                    this.storeResume(storyId, pieceIndex, 0, audio!.duration || 0, true);
                }
            });
            this.audioMap.set(id, audio);
        }
        return audio;
    }

    private stopAllAudio(exceptId?: string) {
        this.audioMap.forEach((audio, id) => {
            if (exceptId && id === exceptId) return;
            audio.pause();
        });
        const except = exceptId ? exceptId.split(':') : null;
        const exceptStoryId = except?.[0];
        const exceptPieceIndex = except?.[1] ? Number(except[1]) : null;
        this.stories.update((list) =>
            list.map((s) => ({
                ...s,
                chapterPieces: s.chapterPieces.map((p, i) => {
                    if (exceptStoryId && s._id === exceptStoryId && exceptPieceIndex === i) {
                        return p;
                    }
                    return { ...p, isPlaying: false };
                })
            }))
        );
    }

    private setupObserver() {
        if (this.observer) this.observer.disconnect();
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const el = entry.target as HTMLElement;
                const storyId = el.dataset['storyId'];
                if (!storyId) return;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                    this.persistStoryPosition(storyId);
                } else {
                    this.stopAllAudio();
                }
            });
        }, { threshold: [0, 0.6, 1] });

        this.storyItems?.forEach((ref) => this.observer?.observe(ref.nativeElement));
    }

    private persistStoryPosition(storyId: string) {
        try {
            localStorage.setItem(this.storageKey, storyId);
        } catch (ex) {
            // ignore storage errors
        }
    }

    continueStory(storyId: string, pieceIndex: number) {
        const story = this.getStory(storyId);
        if (!story) return;
        const piece = story.chapterPieces[pieceIndex];
        if (!piece) return;
        if (!piece.audioUrl) return;
        const audio = this.getAudio(this.audioKey(storyId, pieceIndex), piece.audioUrl);
        const resume = this.getStoredResume(storyId, pieceIndex);
        if (!resume) return;

        const seek = () => {
            try {
                audio.currentTime = Math.max(0, Math.min(audio.duration || resume.duration || 0, resume.time));
            } catch (ex) {
                // ignore
            }
            this.stopAllAudio(this.audioKey(storyId, pieceIndex));
            audio.play().then(() => {
                this.updatePiece(storyId, pieceIndex, { isPlaying: true });
            }).catch(() => {
                this.updatePiece(storyId, pieceIndex, { isPlaying: false });
            });
        };

        if (audio.readyState >= 1) {
            seek();
        } else {
            audio.addEventListener('loadedmetadata', () => seek(), { once: true });
            audio.load();
        }
    }

    private scrollToStoredStory() {
        try {
            const id = localStorage.getItem(this.storageKey);
            if (!id) return;
            const el = this.storyItems.find((ref) => ref.nativeElement?.dataset?.storyId === id);
            if (el) {
                el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (ex) {
            // ignore storage errors
        }
    }

    private loadResumeStates() {
        this.stories.update((list) =>
            list.map((s) => ({
                ...s,
                chapterPieces: s.chapterPieces.map((p, i) => {
                    const resume = this.getStoredResume(s._id, i);
                    return resume ? { ...p, hasResume: true, resumeTime: resume.time } : p;
                })
            }))
        );
    }

    private loadMuteState() {
        const muted = this.getStoredMute();
        this.stories.update((list) =>
            list.map((s) => ({
                ...s,
                chapterPieces: s.chapterPieces.map((p) => ({ ...p, isMuted: muted }))
            }))
        );
    }

    private persistMuteState(muted: boolean) {
        try {
            localStorage.setItem(this.muteKey, muted ? '1' : '0');
        } catch (ex) {
            // ignore
        }
    }

    private getStoredMute(): boolean {
        try {
            return localStorage.getItem(this.muteKey) === '1';
        } catch (ex) {
            return false;
        }
    }

    private getStoredResume(storyId: string, pieceIndex: number): { time: number, duration: number } | null {
        try {
            const raw = localStorage.getItem(`etmw_story_resume_${storyId}_${pieceIndex}`);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (typeof parsed.time !== 'number') return null;
            return {
                time: parsed.time || 0,
                duration: parsed.duration || 0
            };
        } catch (ex) {
            return null;
        }
    }

    private storeResume(storyId: string, pieceIndex: number, time: number, duration: number, clear: boolean = false) {
        try {
            if (clear) {
                localStorage.removeItem(`etmw_story_resume_${storyId}_${pieceIndex}`);
                this.updatePiece(storyId, pieceIndex, { hasResume: false, resumeTime: 0 });
                return;
            }
            if (!duration || time <= 0) return;
            localStorage.setItem(`etmw_story_resume_${storyId}_${pieceIndex}`, JSON.stringify({ time, duration }));
            this.updatePiece(storyId, pieceIndex, { hasResume: true, resumeTime: time });
        } catch (ex) {
            // ignore
        }
    }

    private autoPlayIfAllowed(storyId: string, pieceIndex: number) {
        const story = this.getStory(storyId);
        if (!story) return;
        const piece = story.chapterPieces[pieceIndex];
        if (!piece || piece.isMuted) return;
        if (!piece.audioUrl) return;
        const key = this.audioKey(storyId, pieceIndex);
        const audio = this.getAudio(key, piece.audioUrl);
        this.stopAllAudio(key);
        audio.muted = piece.isMuted;
        audio.play().then(() => {
            this.updatePiece(storyId, pieceIndex, { isPlaying: true });
        }).catch(() => {
            this.updatePiece(storyId, pieceIndex, { isPlaying: false });
        });
    }
}

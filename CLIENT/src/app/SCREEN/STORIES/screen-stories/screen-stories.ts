import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren, signal } from '@angular/core';

@Component({
  selector: 'app-screen-stories',
  standalone: false,
  templateUrl: './screen-stories.html',
  styleUrl: './screen-stories.css',
})
export class ScreenStories {

    @ViewChildren('storyItem') storyItems!: QueryList<ElementRef>;

    stories = signal<Array<{
        id: string,
        image: string,
        audioImage: string,
        author: string,
        title: string,
        subtitle: string,
        quote: string,
        body: string,
        audioText: string,
        prompt: string,
        audioUrl: string,
        slideIndex: number,
        isPlaying: boolean,
        isMuted: boolean,
        progress: number,
        expanded: boolean
    }>>([
        {
            id: 's1',
            image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&h=1600&fit=crop',
            audioImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop',
            author: 'Maya Ortega',
            title: 'Freedom & Safety',
            subtitle: 'A 60‑second reflection',
            quote: '“Most people don’t want freedom. They want safety.”',
            body: 'The author argues that what we call freedom is often just comfort disguised as choice. Do you agree?',
            audioText: 'Most people don’t want freedom. They want safety. The author argues that what we call freedom is often just comfort disguised as choice. We crave the feeling of possibility but resist the weight of responsibility. So we trade true freedom for curated options, and then call it peace.',
            prompt: 'Below: ❤️ Like 💬 Discuss ➡️ I want more!',
            audioUrl: 'https://actions.google.com/sounds/v1/ambiences/wind_whistling.ogg',
            slideIndex: 0,
            isPlaying: false,
            isMuted: false,
            progress: 0,
            expanded: false
        },
        {
            id: 's2',
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=1600&fit=crop',
            audioImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=1600&fit=crop',
            author: 'Jonas Reed',
            title: 'The Cost of Change',
            subtitle: 'Micro‑essay',
            quote: '“We don’t fear change. We fear the unknown cost of it.”',
            body: 'This story explores why we delay decisions even when the path is obvious. What would you do?',
            audioText: 'We don’t fear change. We fear the unknown cost of it. We hesitate because every new path contains invisible tradeoffs. So we wait, and we call it patience, while it’s really the price of uncertainty.',
            prompt: 'Below: ❤️ Like 💬 Discuss ➡️ I want more!',
            audioUrl: 'https://actions.google.com/sounds/v1/ambiences/birds_in_forest.ogg',
            slideIndex: 0,
            isPlaying: false,
            isMuted: false,
            progress: 0,
            expanded: false
        },
        {
            id: 's3',
            image: 'https://images.unsplash.com/photo-1473181488821-2d23949a045a?w=1200&h=1600&fit=crop',
            audioImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=1600&fit=crop',
            author: 'Aisha Noor',
            title: 'Discipline Is Kindness',
            subtitle: 'Daily note',
            quote: '“Discipline is kindness to your future self.”',
            body: 'A short reflection on consistency and why tiny habits compound into life‑changing results.',
            audioText: 'Discipline is kindness to your future self. Tiny habits feel invisible today, but they compound into tomorrow’s freedom. Consistency is less about intensity and more about showing up with patience.',
            prompt: 'Below: ❤️ Like 💬 Discuss ➡️ I want more!',
            audioUrl: 'https://actions.google.com/sounds/v1/ambiences/waves_on_beach.ogg',
            slideIndex: 0,
            isPlaying: false,
            isMuted: false,
            progress: 0,
            expanded: false
        },
        {
            id: 's4',
            image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&h=1600&fit=crop',
            audioImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=1600&fit=crop',
            author: 'Leo March',
            title: 'Attention Currency',
            subtitle: 'Short essay',
            quote: '“Attention is the real currency.”',
            body: 'A quiet warning about the cost of constant notifications — and the freedom of focus.',
            audioText: 'Attention is the real currency. Every notification is a tax on your focus. The freedom of focus returns when you choose what deserves your attention — and what doesn’t.',
            prompt: 'Below: ❤️ Like 💬 Discuss ➡️ I want more!',
            audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_ambience.ogg',
            slideIndex: 0,
            isPlaying: false,
            isMuted: false,
            progress: 0,
            expanded: false
        }
    ]);

    private touchStartX = 0;
    private touchStartY = 0;
    private touchStoryId: string | null = null;
    private observer: IntersectionObserver | null = null;
    private audioMap = new Map<string, HTMLAudioElement>();

    ngAfterViewInit(): void {
        this.setupObserver();
        this.storyItems.changes.subscribe(() => this.setupObserver());
    }

    ngOnDestroy(): void {
        if (this.observer) this.observer.disconnect();
        this.audioMap.forEach((audio) => {
            audio.pause();
            audio.src = '';
        });
        this.audioMap.clear();
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
            this.setSlide(storyId, 1);
        } else {
            this.setSlide(storyId, 0);
        }
    }

    setSlide(storyId: string, index: number) {
        this.updateStory(storyId, { slideIndex: index });
    }

    toggleExpand(storyId: string) {
        const story = this.getStory(storyId);
        if (!story) return;
        this.updateStory(storyId, { expanded: !story.expanded });
    }

    toggleAudio(storyId: string) {
        const story = this.getStory(storyId);
        if (!story) return;
        const audio = this.getAudio(storyId, story.audioUrl);

        if (story.isPlaying) {
            audio.pause();
            this.updateStory(storyId, { isPlaying: false });
            return;
        }

        this.stopAllAudio(storyId);
        audio.muted = story.isMuted;
        audio.play().then(() => {
            this.updateStory(storyId, { isPlaying: true });
        }).catch(() => {
            this.updateStory(storyId, { isPlaying: false });
        });
    }

    toggleMute(storyId: string) {
        const story = this.getStory(storyId);
        if (!story) return;
        const audio = this.getAudio(storyId, story.audioUrl);
        const next = !story.isMuted;
        audio.muted = next;
        this.updateStory(storyId, { isMuted: next });
    }

    private getStory(id: string) {
        return this.stories().find((s) => s.id === id) || null;
    }

    private updateStory(id: string, patch: Partial<any>) {
        this.stories.update((list) =>
            list.map((s) => s.id === id ? { ...s, ...patch } : s)
        );
    }

    private getAudio(id: string, url: string) {
        let audio = this.audioMap.get(id);
        if (!audio) {
            audio = new Audio(url);
            audio.preload = 'auto';
            audio.addEventListener('timeupdate', () => {
                const progress = audio!.duration ? (audio!.currentTime / audio!.duration) * 100 : 0;
                this.updateStory(id, { progress });
            });
            audio.addEventListener('ended', () => {
                this.updateStory(id, { isPlaying: false, progress: 0 });
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
        this.stories.update((list) =>
            list.map((s) => exceptId && s.id === exceptId ? s : { ...s, isPlaying: false })
        );
    }

    private setupObserver() {
        if (this.observer) this.observer.disconnect();
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const el = entry.target as HTMLElement;
                const storyId = el.dataset['storyId'];
                if (!storyId) return;
                if (!entry.isIntersecting || entry.intersectionRatio < 0.6) {
                    this.stopAllAudio();
                }
            });
        }, { threshold: [0, 0.6, 1] });

        this.storyItems?.forEach((ref) => this.observer?.observe(ref.nativeElement));
    }
}

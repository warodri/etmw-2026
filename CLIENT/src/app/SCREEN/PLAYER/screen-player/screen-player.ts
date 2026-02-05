import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-player',
    standalone: false,
    templateUrl: './screen-player.html',
    styleUrl: './screen-player.css',
})
export class ScreenPlayer implements OnInit, OnDestroy {

    audiobook = {
        title: 'My Name Is Emilia Del Valle',
        author: 'Isabel Allende',
        cover: 'https://images.squarespace-cdn.com/content/v1/624da83e75ca872f189ffa42/aa45e942-f55d-432d-8217-17c7d98105ce/image001.jpg',
        duration: 209, // in seconds (3:29)
    };

    // Player state
    isPlaying = false;
    isBookmarked = false;
    isShuffle = false;
    isRepeat = false;
    isLiked = false;

    // Time
    currentTime = '1:04';
    totalTime = '3:29';
    currentSeconds = 64;
    totalSeconds = 209;
    progressPercent = 30;

    // Playback
    playbackSpeed = 1.0;

    // Chapter info
    currentChapter = 'Lovingkindness';
    chapterNumber = 3;
    totalChapters = 12;

    // Waveform visualization
    waveformBars: { height: number }[] = [];
    currentBarIndex = 25;

    private intervalId: any;

    constructor(
        private router: Router
    ) {}

    ngOnInit() {
        this.generateWaveform();
        this.startPlayback();
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
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
        // Simulate playback
        this.intervalId = setInterval(() => {
            if (this.isPlaying && this.currentSeconds < this.totalSeconds) {
                this.currentSeconds++;
                this.updateTime();
                this.updateWaveform();
            }
        }, 1000);
    }

    updateTime() {
        const minutes = Math.floor(this.currentSeconds / 60);
        const seconds = this.currentSeconds % 60;
        this.currentTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.progressPercent = (this.currentSeconds / this.totalSeconds) * 100;
    }

    updateWaveform() {
        // Update current bar index based on progress
        this.currentBarIndex = Math.floor((this.currentSeconds / this.totalSeconds) * this.waveformBars.length);
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
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
        this.currentSeconds = Math.max(0, this.currentSeconds - seconds);
        this.updateTime();
        this.updateWaveform();
    }

    skipForward(seconds: number = 10) {
        this.currentSeconds = Math.min(this.totalSeconds, this.currentSeconds + seconds);
        this.updateTime();
        this.updateWaveform();
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

    goBack() {
        this.router.navigate(['app'])
    }

}
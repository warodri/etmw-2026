import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { InternetDebateServices } from '../../../SERVICES/internet-comments.services';
import { UserModel } from '../../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { AudiobookModel } from '../../../models/audiobook';
import { Config } from '../../../utils/config';

@Component({
    selector: 'app-screen-debates',
    standalone: false,
    templateUrl: './screen-debates.html',
    styleUrl: './screen-debates.css',
})
export class ScreenDebates implements OnInit, OnDestroy {

    myUser = signal<UserModel | null>(null);
    audiobookId = signal<string | null>(null);

    audiobook = signal<AudiobookModel | null>(null);

    debate = {
        totalMessages: 247,
        enabled: true
    };

    viewMode: 'timeline' | 'threads' | 'podcast' = 'timeline';


    popularThreads = [
        {
            _id: 't1',
            userName: 'Sarah Johnson',
            userProfile: 'https://i.pravatar.cc/150?img=5',
            text: 'What was your favorite chapter and why? For me it was Chapter 7 - it really resonated with my personal journey.',
            replyCount: 45,
            likes: 89,
            timeAgo: '3h ago'
        },
        {
            _id: 't2',
            userName: 'Lucas Silva',
            userProfile: 'https://i.pravatar.cc/150?img=15',
            text: 'Can we discuss the symbolism in the final chapter? I think I missed something important.',
            replyCount: 32,
            likes: 67,
            timeAgo: '6h ago'
        }
    ];

    recentThreads = [
        {
            _id: 't3',
            userName: 'Emma Wilson',
            userProfile: 'https://i.pravatar.cc/150?img=45',
            text: 'Just finished the book and wow! Ready to discuss all my thoughts with you all.',
            replyCount: 5,
            likes: 12,
            timeAgo: '1h ago'
        }
    ];

    // Input state
    newCommentText = '';
    isRecording = false;
    recordingDuration = '0:00';
    private recordingInterval: any;
    private recordingSeconds = 0;

    // Podcast state
    podcastGenerated = false;
    podcastPlaying = false;
    podcastProgress = 0;
    podcastCurrentTime = '0:00';
    podcastDuration = '45:32';
    estimatedDuration = '~45m';

    podcastSections = [
        { id: 1, title: 'Introduction & Overview', speaker: 'AI Narrator', duration: '3:24', timestamp: 0 },
        { id: 2, title: 'Top Comment Discussion', speaker: 'Maria González', duration: '5:12', timestamp: 204 },
        { id: 3, title: 'Author Response', speaker: 'Mariano E Rodriguez', duration: '4:38', timestamp: 516 },
        { id: 4, title: 'Community Insights', speaker: 'Multiple Speakers', duration: '8:45', timestamp: 794 }
    ];

    SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;

    //  Flags
    loading = signal<boolean>(true);

    constructor(
        private iAudiobook: InternetAudiobookService,
        private iDebate: InternetDebateServices,
        private route: ActivatedRoute,
        private iUser: InternetUserService,
        private router: Router
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.audiobookId.set(params.get('audiobookId'));
            this.getMyUser(() => {
                this.loadAudiobook(() => {
                    this.loading.set(false);
                })
            })
        })
    }

    getMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
            }
            callback()
        })
    }

    loadAudiobook(callback: any) {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.iAudiobook.audiobookFindById(audiobookId, (response: any) => {
                console.log('audiobookFindById', response)
                if (response && response.success && response.audiobooks && Array.isArray(response.audiobooks) && response.audiobooks.length > 0) {
                    this.audiobook.set(response.audiobooks[0]);
                    callback();
                }
            })
        }
    }

    ngOnDestroy() {
        this.stopRecording();
    }

    goBack() {
        this.router.navigate(['app'])
    }



    // Input actions
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        this.isRecording = true;
        this.recordingSeconds = 0;
        this.recordingInterval = setInterval(() => {
            this.recordingSeconds++;
            const minutes = Math.floor(this.recordingSeconds / 60);
            const seconds = this.recordingSeconds % 60;
            this.recordingDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        
        // Start actual recording
        console.log('Start recording audio');
    }

    stopRecording() {
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
            this.recordingInterval = null;
        }
        this.isRecording = false;
        this.recordingSeconds = 0;
        this.recordingDuration = '0:00';
        
        // Stop actual recording
        console.log('Stop recording audio');
    }

    attachFile() {
        console.log('Attach file');
        // Open file picker
    }

    enhanceWithAI() {
        console.log('Enhance with AI');
        // Use AI to improve/expand comment
    }

    canSend(): boolean {
        return this.newCommentText.trim().length > 0 || this.isRecording;
    }

    sendComment() {
        if (this.canSend()) {
            console.log('Send comment:', this.newCommentText);
            // Send comment to API
            this.newCommentText = '';
        }
    }

    // Podcast actions
    generatePodcast() {
        console.log('Generate podcast');
        // Call API to generate podcast
        this.podcastGenerated = true;
    }

    togglePodcast() {
        this.podcastPlaying = !this.podcastPlaying;
        // Implement actual podcast playback
    }

    seekPodcast(timestamp: number) {
        console.log('Seek to:', timestamp);
        // Seek podcast to timestamp
    }

    shareDebate() {
        console.log('Share debate');
    }

    reportDebate() {
        console.log('Report debate');
    }

    gotoBook() {
        const audiobookId = this.audiobookId();
        if (audiobookId) {
            this.router.navigate(['app/audiobook/view', audiobookId])
        }
    }

    openThread(comment: any) {
        console.log('Open thread:', comment);
        // Navigate to thread detail view
    }

}

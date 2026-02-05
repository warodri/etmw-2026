import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-screen-debates',
    standalone: false,
    templateUrl: './screen-debates.html',
    styleUrl: './screen-debates.css',
})
export class ScreenDebates implements OnInit, OnDestroy {

    audiobook = {
        title: 'The Anatomy of a Body',
        author: 'Mariano E Rodriguez',
        cover: 'https://images.squarespace-cdn.com/content/v1/624da83e75ca872f189ffa42/aa45e942-f55d-432d-8217-17c7d98105ce/image001.jpg'
    };

    debate = {
        totalMessages: 247,
        enabled: true
    };

    viewMode: 'timeline' | 'threads' | 'podcast' = 'timeline';

    // Comments data
    comments = [
        {
            _id: '1',
            userName: 'Maria González',
            userProfile: 'https://i.pravatar.cc/150?img=1',
            isAuthor: false,
            isVerified: true,
            timeAgo: '2h ago',
            text: 'This book completely changed my perspective on body image. The way the author describes the journey of self-acceptance is truly powerful.',
            audioUrl: null,
            hasAttachments: false,
            attachments: [],
            isPlaying: false,
            audioProgress: 0,
            audioDuration: '1:23',
            audioSpeed: '1.0',
            likes: 42,
            isLiked: false,
            replyCount: 8
        },
        {
            _id: '2',
            userName: 'Mariano E Rodriguez',
            userProfile: 'https://i.pravatar.cc/150?img=12',
            isAuthor: true,
            isVerified: true,
            timeAgo: '5h ago',
            text: 'Thank you all for the incredible discussions! Your insights inspire me to keep writing.',
            audioUrl: 'https://example.com/audio.mp3',
            hasAttachments: false,
            attachments: [],
            isPlaying: false,
            audioProgress: 0,
            audioDuration: '2:14',
            audioSpeed: '1.0',
            likes: 156,
            isLiked: true,
            replyCount: 23
        },
        {
            _id: '3',
            userName: 'Alex Chen',
            userProfile: 'https://i.pravatar.cc/150?img=68',
            isAuthor: false,
            isVerified: false,
            timeAgo: '1d ago',
            text: 'The chapter about mirror confrontation made me cry. Has anyone else felt this way?',
            audioUrl: null,
            hasAttachments: true,
            attachments: [
                { url: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999', type: 'image' }
            ],
            isPlaying: false,
            audioProgress: 0,
            audioDuration: null,
            audioSpeed: '1.0',
            likes: 34,
            isLiked: false,
            replyCount: 12
        }
    ];

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

    hasMore = true;

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

    ngOnInit() {
        // Initialize
    }

    ngOnDestroy() {
        this.stopRecording();
    }

    // Navigation
    goBack() {
        console.log('Navigate back');
    }

    // Comment actions
    openThread(comment: any) {
        console.log('Open thread:', comment);
        // Navigate to thread detail view
    }

    toggleAudio(event: Event, commentId: string) {
        event.stopPropagation();
        const comment = this.comments.find(c => c._id === commentId);
        if (comment) {
            comment.isPlaying = !comment.isPlaying;
            // Implement actual audio playback
        }
    }

    replyTo(event: Event, comment: any) {
        event.stopPropagation();
        console.log('Reply to:', comment);
        // Open reply modal or focus input with @mention
    }

    toggleLike(event: Event, commentId: string) {
        event.stopPropagation();
        const comment = this.comments.find(c => c._id === commentId);
        if (comment) {
            comment.isLiked = !comment.isLiked;
            comment.likes += comment.isLiked ? 1 : -1;
        }
    }

    shareComment(event: Event, commentId: string) {
        event.stopPropagation();
        console.log('Share comment:', commentId);
    }

    viewAttachment(event: Event, attachment: any) {
        event.stopPropagation();
        console.log('View attachment:', attachment);
        // Open attachment in modal/fullscreen
    }

    loadMore() {
        console.log('Load more comments');
        // Load more comments from API
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

}































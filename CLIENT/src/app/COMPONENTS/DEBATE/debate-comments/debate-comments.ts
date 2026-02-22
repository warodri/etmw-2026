import { Component } from '@angular/core';

@Component({
    selector: 'app-debate-comments',
    standalone: false,
    templateUrl: './debate-comments.html',
    styleUrl: './debate-comments.css',
})
export class DebateComments {

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

    hasMore = true;

    
    loadMore() {
        console.log('Load more comments');
        // Load more comments from API
    }



}

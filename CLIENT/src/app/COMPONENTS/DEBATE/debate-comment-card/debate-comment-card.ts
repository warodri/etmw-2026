import { Component } from '@angular/core';

@Component({
    selector: 'app-debate-comment-card',
    standalone: false,
    templateUrl: './debate-comment-card.html',
    styleUrl: './debate-comment-card.css',
})
export class DebateCommentCard {

    comment = {
        _id: '3',
        userName: 'Alex Chen',
        userProfile: 'https://i.pravatar.cc/150?img=68',
        isAuthor: true,
        isVerified: false,
        timeAgo: '1d ago',
        text: 'The chapter about mirror confrontation made me cry. Has anyone else felt this way?',
        audioUrl: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999',
        hasAttachments: true,
        attachments: [
            { url: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999', type: 'image' }
        ],
        audioDuration: null,
        likes: 34,
        isLiked: true,
        replyCount: 12
    }
    comments: any;

    // Comment actions
    openThread(comment: any) {
        console.log('Open thread:', comment);
        // Navigate to thread detail view
    }
    
    toggleAudio(event: Event, commentId: string) {
        event.stopPropagation();
        const comment = this.comments.find((c:any) => c._id === commentId);
        if (comment) {
            comment.isPlaying = !comment.isPlaying;
            // Implement actual audio playback
        }
    }

    viewAttachment(event: Event, attachment: any) {
        event.stopPropagation();
        console.log('View attachment:', attachment);
        // Open attachment in modal/fullscreen
    }

    replyTo(event: Event, comment: any) {
        event.stopPropagation();
        console.log('Reply to:', comment);
        // Open reply modal or focus input with @mention
    }

    toggleLike(event: Event, commentId: string) {
        event.stopPropagation();
        const comment = this.comments.find((c:any) => c._id === commentId);
        if (comment) {
            comment.isLiked = !comment.isLiked;
            comment.likes += comment.isLiked ? 1 : -1;
        }
    }

    shareComment(event: Event, commentId: string) {
        event.stopPropagation();
        console.log('Share comment:', commentId);
    }

    gotoUserProfile() {
        
    }



}

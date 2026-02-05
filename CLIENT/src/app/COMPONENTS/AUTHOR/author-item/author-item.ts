import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-author-item',
    standalone: false,
    templateUrl: './author-item.html',
    styleUrl: './author-item.css',
})
export class AuthorItem {
    @Input() template: 'simple' | 'extended' | 'detailed' = 'simple';

    @Input() author: any = {
        _id: '',
        penName: 'Unknown Author',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
        coverImage: null,
        bio: '',
        country: '',
        languages: [],
        categories: [],
        totalAudiobooks: 0,
        totalFollowers: 0,
        totalCompletions: 0,
        isVerified: false,
        isFollowing: false,
        latestWorks: []
    };

    @Output() onFollow = new EventEmitter<string>();
    @Output() onView = new EventEmitter<string>();
    @Output() onMessage = new EventEmitter<string>();

    formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    toggleFollow(event: Event) {
        event.stopPropagation();
        this.author.isFollowing = !this.author.isFollowing;
        this.author.totalFollowers += this.author.isFollowing ? 1 : -1;
        this.onFollow.emit(this.author._id);
    }

    viewAuthor() {
        this.onView.emit(this.author._id);
    }

    viewProfile(event: Event) {
        event.stopPropagation();
        this.onView.emit(this.author._id);
    }

    sendMessage(event: Event) {
        event.stopPropagation();
        this.onMessage.emit(this.author._id);
    }

    shareAuthor(event: Event) {
        event.stopPropagation();
        console.log('Share author:', this.author._id);
    }

}

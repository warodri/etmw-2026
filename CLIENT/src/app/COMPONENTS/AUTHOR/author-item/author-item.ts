import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { AuthorModel } from '../../../models/author';
import { AudiobookModel } from '../../../models/audiobook';

@Component({
    selector: 'app-author-item',
    standalone: false,
    templateUrl: './author-item.html',
    styleUrl: './author-item.css',
})
export class AuthorItem implements OnInit {

    @Input() template: 'simple' | 'extended' | 'detailed' = 'simple';

    @Input() author: AuthorModel | null = null;

    @Output() onFollow = new EventEmitter<string>();
    @Output() onView = new EventEmitter<string>();
    @Output() onMessage = new EventEmitter<string>();

    isFollowing = signal<boolean>(false);
    totalFollowers = signal<number>(0);

    latestWork = signal<AudiobookModel[]>([])

    constructor() {}

    ngOnInit(): void {
        
    }

    formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    toggleFollow(event: Event) {
        if (this.author) {
            event.stopPropagation();
            this.isFollowing.set(!this.isFollowing());
            if (this.isFollowing()) {
                this.totalFollowers.set( this.totalFollowers() + 1);
                this.onFollow.emit(this.author._id);
            } else {
                this.totalFollowers.set( this.totalFollowers() - 1);
            }
        }
    }

    viewAuthor() {
        if (this.author) {
            this.onView.emit(this.author._id);
        }
    }

    viewProfile(event: Event) {
        if (this.author) {
            event.stopPropagation();
            this.onView.emit(this.author._id);
        }
    }

    sendMessage(event: Event) {
        if (this.author) {
            event.stopPropagation();
            this.onMessage.emit(this.author._id);
        }
    }

    shareAuthor(event: Event) {
        if (this.author) {
            event.stopPropagation();
            console.log('Share author:', this.author._id);
        }
    }

}

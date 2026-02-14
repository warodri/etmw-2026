import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { AuthorModel } from '../../../models/author';
import { UserModel } from '../../../models/user';
import { AudiobookModel } from '../../../models/audiobook';

@Component({
    selector: 'app-author-item',
    standalone: false,
    templateUrl: './author-item.html',
    styleUrl: './author-item.css',
})
export class AuthorItem implements OnInit {

    @Input() template: 'simple' | 'extended' | 'detailed' = 'simple';

    @Input() author: AuthorModel | UserModel | null = null;

    @Output() onFollow = new EventEmitter<string>();
    @Output() onView = new EventEmitter<string>();
    @Output() onMessage = new EventEmitter<string>();

    isFollowing = signal<boolean>(false);
    totalFollowers = signal<number>(0);

    latestWork = signal<AudiobookModel[]>([])

    constructor() {}

    ngOnInit(): void {
        const followers = this.getTotalFollowers();
        if (followers !== null) {
            this.totalFollowers.set(followers);
        }
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
        const id = this.getId();
        if (id) {
            event.stopPropagation();
            this.isFollowing.set(!this.isFollowing());
            if (this.isFollowing()) {
                this.totalFollowers.set( this.totalFollowers() + 1);
                this.onFollow.emit(id);
            } else {
                this.totalFollowers.set( this.totalFollowers() - 1);
            }
        }
    }

    viewAuthor() {
        const id = this.getId();
        if (id) {
            this.onView.emit(id);
        }
    }

    viewProfile(event: Event) {
        const id = this.getId();
        if (id) {
            event.stopPropagation();
            this.onView.emit(id);
        }
    }

    sendMessage(event: Event) {
        const id = this.getId();
        if (id) {
            event.stopPropagation();
            this.onMessage.emit(id);
        }
    }

    shareAuthor(event: Event) {
        const id = this.getId();
        if (id) {
            event.stopPropagation();
            console.log('Share author:', id);
        }
    }

    getId(): string | null {
        const a: any = this.author;
        if (!a) return null;
        return a._id || a.userId?._id || null;
    }

    getDisplayName(): string {
        const a: any = this.author;
        if (!a) return '';
        if (a.penName) return a.penName;
        const first = a.firstName || a.userId?.firstName || '';
        const last = a.lastName || a.userId?.lastName || '';
        return `${first} ${last}`.trim();
    }

    getProfilePicture(): string {
        const a: any = this.author;
        return a?.profilePicture || a?.userId?.profilePicture || a?.userId?.coverPicture || a?.coverPicture || '';
    }

    getCoverPicture(): string {
        const a: any = this.author;
        return a?.coverPicture || a?.userId?.coverPicture || a?.profilePicture || a?.userId?.profilePicture || '';
    }

    getBio(): string {
        const a: any = this.author;
        return a?.bio || a?.userId?.bio || '';
    }

    getLanguages(): string[] {
        const a: any = this.author;
        return a?.languages || a?.userId?.languages || [];
    }

    getCategories(): string[] {
        const a: any = this.author;
        return a?.categories || a?.userId?.categories || [];
    }

    getTotalAudiobooks(): number {
        const a: any = this.author;
        return a?.totalAudiobooks || 0;
    }

    getTotalCompletions(): number {
        const a: any = this.author;
        return a?.totalCompletions || 0;
    }

    getTotalFollowers(): number | null {
        const a: any = this.author;
        const value = a?.totalFollowers ?? a?.userId?.totalFollowers;
        return typeof value === 'number' ? value : null;
    }

    getCountry(): string {
        const a: any = this.author;
        return a?.country || a?.userId?.country || '';
    }

    isVerified(): boolean {
        const a: any = this.author;
        return !!(a?.isVerified || a?.userId?.isVerified);
    }
}

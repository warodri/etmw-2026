import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-screen-search',
    standalone: false,
    templateUrl: './screen-search.html',
    styleUrl: './screen-search.css',
})
export class ScreenSearch implements OnInit, OnDestroy {
    initialQuery: string | null = null;
    initialAuthorId: string | null = null;
    initialSection: 'trending' | 'for-you' | null = null;
    initialCategory: string | null = null;
    private routeSub: Subscription | null = null;

    constructor(
        private route: ActivatedRoute
    ) { }

    /*
        #/app/search/query/<text>
        #/app/search/section/trending
        #/app/search/section/for-you
        #/app/search/author/<authorId>
        #/app/search/category/<category>
    */
    ngOnInit(): void {
        this.routeSub = this.route.paramMap.subscribe((params) => {
            this.applyRouteParams(
                params.get('query'),
                params.get('section'),
                params.get('authorId'),
                params.get('category'),
                params.get('term')
            );
        });
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
    }

    private applyRouteParams(
        rawQuery: string | null,
        rawSection: string | null,
        rawAuthorId: string | null,
        rawCategory: string | null,
        rawTerm: string | null
    ) {
        this.initialQuery = null;
        this.initialAuthorId = null;
        this.initialSection = null;
        this.initialCategory = null;

        const query = this.decodeParam(rawQuery);
        if (query) {
            this.initialQuery = query;
            return;
        }

        const section = this.decodeParam(rawSection)?.toLowerCase();
        if (section === 'trending' || section === 'for-you') {
            this.initialSection = section as 'trending' | 'for-you';
            return;
        }

        const authorId = this.decodeParam(rawAuthorId);
        if (authorId && /^[a-f\d]{24}$/i.test(authorId)) {
            this.initialAuthorId = authorId;
            return;
        }

        const category = this.decodeParam(rawCategory);
        if (category) {
            this.initialCategory = category;
            return;
        }

        const term = this.decodeParam(rawTerm);
        if (!term) return;
        const decoded = term.trim();
        const normalized = decoded.toLowerCase();

        if (normalized === 'trending' || normalized === 'for-you') {
            this.initialSection = normalized as 'trending' | 'for-you';
            return;
        }

        const isMongoObjectId = /^[a-f\d]{24}$/i.test(decoded);
        if (isMongoObjectId) {
            this.initialAuthorId = decoded;
            return;
        }

        this.initialQuery = decoded;
    }

    private decodeParam(value: string | null): string | null {
        const raw = (value || '').trim();
        if (!raw) return null;
        return decodeURIComponent(raw).trim();
    }

}

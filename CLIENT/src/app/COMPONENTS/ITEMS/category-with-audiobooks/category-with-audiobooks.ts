import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CategoryModel } from '../../../models/categories';
import { AudiobookModel } from '../../../models/audiobook';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';

@Component({
    selector: 'app-category-with-audiobooks',
    standalone: false,
    templateUrl: './category-with-audiobooks.html',
    styleUrl: './category-with-audiobooks.css',
})
export class CategoryWithAudiobooks implements OnInit, OnChanges {

    @Input() category: (CategoryModel & { children?: CategoryModel[] }) | null = null;
    
    children = signal<Array<CategoryModel>>([]);
    audiobooks = signal<Array<AudiobookModel>>([]);
    hasMore = signal<boolean>(false);

    skip = signal<number>(0);
    limit = signal<number>(10);

    constructor(
        private iAudiobook: InternetAudiobookService
    ) {}

    ngOnInit(): void {
        this.resetAndLoad();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['category']) {
            this.resetAndLoad();
        }
    }

    resetAndLoad() {
        this.skip.set(0);
        this.audiobooks.set([]);
        this.hasMore.set(false);
        this.loadAudiobooksForThisCategory(() => {
            // Done
        });
    }

    loadMore() {
        this.skip.set(this.skip() + this.limit());
        this.loadAudiobooksForThisCategory(() => {
            // Done
        });
    }

    loadAudiobooksForThisCategory(callback: any) {
        if (!this.category) return;

        const audiobookId = null;
        const query  = null;
        const authorIds: string[] = [];
        const categories = this.getCategoryNamesForQuery(this.category);
        const latest = true;
        const myAudiobooks = false;
        const published = true;
        const pipelineStatus: string[] = [];
        const limit = this.limit()
        const skip = this.skip();

        this.iAudiobook.audiobookFind(
            audiobookId, 
            query, 
            authorIds,
            categories,
            latest,
            myAudiobooks,
            published,
            pipelineStatus,
            limit,
            skip,
            (response: any) => {
                if (response && response.success) {
                    const current = this.audiobooks();
                    const next = response.audiobooks || [];
                    if (this.skip() === 0) {
                        this.audiobooks.set(next);
                    } else {
                        this.audiobooks.set([...current, ...next]);
                    }
                    this.hasMore.set(!!response.hasMore);
                }
                callback();
            }) 
    }

    private getCategoryNamesForQuery(category: CategoryModel & { children?: CategoryModel[] }): string[] {
        const names = new Set<string>();
        if (category.name) {
            names.add(category.name);
        }
        const kids = category.children || [];
        kids.forEach((child) => {
            if (child.name) names.add(child.name);
        });
        return Array.from(names);
    }

}

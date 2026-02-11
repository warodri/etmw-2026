import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryModel } from '../../../models/categories';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';

@Component({
    selector: 'app-item-list',
    standalone: false,
    templateUrl: './item-list.html',
    styleUrl: './item-list.css',
})
export class ItemList implements OnInit {

    searchQuery = '';
    searchResultCount = 0;
    activeFilters: string[] = [];
    searchResults = signal<Array<any>>([]);
    private searchDebounce: any = null;
    showFilters = signal<boolean>(false);
    filterPublished: boolean | null = true;
    filterLatest = true;
    filterMyAudiobooks = false;
    filterPipelineStatus = '';
    filterCategory = '';
    searchLimit = 20;

    gradients: Array<string> = [
        'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 100%)',
        'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)',
        'linear-gradient(135deg, rgba(234, 88, 12, 0.3) 0%, rgba(234, 88, 12, 0.1) 100%)',
        'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)',
        'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.1) 100%)',
        'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.1) 100%)',
        'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)',
        'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)',
        'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 100%)',
        'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(14, 165, 233, 0.1) 100%)',
        'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)',
        'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.1) 100%)',
    ]

    //  All categories from the server
    categories = signal<Array<CategoryModel>>([]);
    categoryCards = signal<Array<CategoryModel & { children: CategoryModel[] }>>([]);
    
    //  User selects a category to show
    selectedCategory = signal<(CategoryModel & { children: CategoryModel[] }) | null>(null)
    
    constructor(
        private router: Router,
        private iAudiobook: InternetAudiobookService
    ) {}

    ngOnInit(): void {
        this.getCategories();
    }

    getCategories() {
        this.iAudiobook.getAllCategories((response: any) => {
            if (response && response.success) {
                const rawCategories: CategoryModel[] = response.categories || [];
                const normalized = rawCategories.map((cat, idx) => ({
                    ...cat,
                    gradient: cat.gradient || this.gradients[idx % this.gradients.length]
                }));

                this.categories.set(normalized);
                this.categoryCards.set(this.buildCategoryCards(normalized));
            }
        })
    }

    buildCategoryCards(categories: Array<CategoryModel>): Array<CategoryModel & { children: CategoryModel[] }> {
        const childrenByParent = new Map<string, CategoryModel[]>();
        const parents: Array<CategoryModel> = [];

        categories.forEach((category) => {
            const parentId = typeof category.parentId === 'string'
                ? category.parentId
                : category.parentId?._id;

            if (parentId) {
                const list = childrenByParent.get(parentId) || [];
                list.push(category);
                childrenByParent.set(parentId, list);
            } else if (category.icon) {
                parents.push(category);
            }
        });

        return parents.map((parent) => ({
            ...parent,
            children: childrenByParent.get(parent._id) || []
        }));
    }

    onSearchChange(value: string) {
        this.searchQuery = value;
        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
        }
        this.searchDebounce = setTimeout(() => {
            this.performSearch(false);
        }, 350);
    }

    toggleFilters() {
        this.showFilters.set(!this.showFilters());
    }

    applyFilters() {
        this.performSearch(true);
    }

    clearFilters() {
        this.filterPublished = true;
        this.filterLatest = true;
        this.filterMyAudiobooks = false;
        this.filterPipelineStatus = '';
        this.filterCategory = '';
        this.activeFilters = [];
        this.performSearch(true);
    }

    performSearch(force: boolean) {
        const q = (this.searchQuery || '').trim();
        if (q.length < 2 && !force) {
            this.searchResults.set([]);
            this.searchResultCount = 0;
            return;
        }

        const audiobookId = null;
        const query = q.length >= 2 ? q : null;
        const authorIds: string[] = [];
        const categories: string[] = this.filterCategory ? [this.filterCategory] : [];
        const latest = this.filterLatest;
        const myAudiobooks = this.filterMyAudiobooks;
        const published = this.filterPublished as any;
        const pipelineStatus: string[] = this.filterPipelineStatus ? [this.filterPipelineStatus] : [];
        const limit = this.searchLimit;
        const skip = 0;

        this.activeFilters = [];
        if (this.filterCategory) this.activeFilters.push(this.filterCategory);
        if (this.filterPipelineStatus) this.activeFilters.push(`Status: ${this.filterPipelineStatus}`);
        if (this.filterMyAudiobooks) this.activeFilters.push('My Audiobooks');
        if (this.filterPublished === true) this.activeFilters.push('Published');
        if (this.filterPublished === false) this.activeFilters.push('Unpublished');

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
                    const list = response.audiobooks || [];
                    this.searchResults.set(list);
                    this.searchResultCount = list.length;
                } else {
                    this.searchResults.set([]);
                    this.searchResultCount = 0;
                }
            }
        );
    }

    selectCategory(category: CategoryModel & { children: CategoryModel[] }) {
        this.selectedCategory.set(category);
    }

    goHome() {
        this.router.navigate(['app'])
    }

}

import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryModel } from '../../../models/categories';
import { AudiobookFindPayload, InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { AudiobookModel } from '../../../models/audiobook';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-item-list',
    standalone: false,
    templateUrl: './item-list.html',
    styleUrl: './item-list.css',
})
export class ItemList implements OnInit, OnChanges {
    @Input() initialQuery: string | null = null;
    @Input() initialAuthorId: string | null = null;
    @Input() initialSection: 'trending' | 'for-you' | null = null;
    @Input() initialCategory: string | null = null;
    
    @ViewChild('categoryResultsAnchor') categoryResultsAnchor?: ElementRef<HTMLElement>;

    searchQuery = '';
    searchResultCount = 0;
    searchResultLabel = '';
    searchResultPrefix = '';
    language: 'en' | 'es' = 'en';
    forceShowSearchResults = false;
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
    
    audiobooksTrendingNow = signal<AudiobookModel[]>([]);
    private lastExternalSearchKey = '';

    constructor(
        private router: Router,
        private iAudiobook: InternetAudiobookService
    ) {}

    ngOnInit(): void {
        this.language = LangUtils.detectLanguage();
        this.searchResultPrefix = this.tr('Results', 'Resultados');
        this.getCategories();
        this.getTrendingNow();
        this.applyInitialSearchFromRoute();
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialQuery'] || changes['initialAuthorId'] || changes['initialSection'] || changes['initialCategory']) {
            this.applyInitialSearchFromRoute();
        }
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

    getTrendingNow() {
        this.iAudiobook.audiobookFindBySection('trending', (response: any) => {
            console.log('trending', response)
            if (response && response.success) {
                this.audiobooksTrendingNow.set(response.audiobooks);
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
        this.forceShowSearchResults = false;
        this.performSearch(true);
    }

    performSearch(force: boolean) {
        const q = (this.searchQuery || '').trim();
        if (q.length < 2 && !force) {
            this.resetSearchResults();
            return;
        }

        this.activeFilters = this.buildActiveFilters();

        const payload: AudiobookFindPayload = {
            query: q.length >= 2 ? q : null,
            categories: this.filterCategory ? [this.filterCategory] : [],
            latest: this.filterLatest,
            myAudiobooks: this.filterMyAudiobooks,
            published: this.filterPublished,
            pipelineStatus: this.filterPipelineStatus ? [this.filterPipelineStatus] : [],
            limit: this.searchLimit,
            skip: 0
        };
        this.searchResultPrefix = this.tr('Results for', 'Resultados para');
        this.searchResultLabel = q.length >= 2 ? `"${q}"` : this.tr('all audiobooks', 'todos los audiolibros');
        this.forceShowSearchResults = true;

        this.fetchSearchResults(payload);
    }

    private buildActiveFilters(): string[] {
        const filters: string[] = [];
        if (this.filterCategory) filters.push(this.filterCategory);
        if (this.filterPipelineStatus) filters.push(`${this.tr('Status', 'Estado')}: ${this.filterPipelineStatus}`);
        if (this.filterMyAudiobooks) filters.push(this.tr('My Audiobooks', 'Mis Audiolibros'));
        if (this.filterPublished === true) filters.push(this.tr('Published', 'Publicado'));
        if (this.filterPublished === false) filters.push(this.tr('Unpublished', 'Sin publicar'));
        return filters;
    }

    private resetSearchResults() {
        this.searchResults.set([]);
        this.searchResultCount = 0;
    }

    shouldShowResults(): boolean {
        return this.forceShowSearchResults || !!(this.searchQuery && this.searchQuery.length > 0);
    }

    private applyInitialSearchFromRoute() {
        const key = JSON.stringify({
            q: (this.initialQuery || '').trim(),
            section: this.initialSection || '',
            authorId: (this.initialAuthorId || '').trim(),
            category: (this.initialCategory || '').trim()
        });
        if (key === this.lastExternalSearchKey) return;
        this.lastExternalSearchKey = key;

        const section = this.initialSection || null;
        const authorId = (this.initialAuthorId || '').trim() || null;
        const category = (this.initialCategory || '').trim() || null;
        const query = (this.initialQuery || '').trim() || null;

        if (section) {
            this.searchQuery = '';
            this.searchResultPrefix = this.tr('Section', 'Sección');
            this.searchResultLabel = section;
            this.forceShowSearchResults = true;
            this.fetchSearchResults({
                section,
                published: true,
                limit: this.searchLimit,
                skip: 0
            });
            return;
        }

        if (authorId) {
            this.searchQuery = '';
            this.searchResultPrefix = this.tr('Author', 'Autor');
            this.searchResultLabel = this.tr('selected author', 'autor seleccionado');
            this.forceShowSearchResults = true;
            this.fetchSearchResults({
                authorIds: [authorId],
                published: true,
                limit: this.searchLimit,
                skip: 0
            });
            return;
        }

        if (category) {
            this.searchQuery = '';
            this.filterCategory = category;
            this.activeFilters = this.buildActiveFilters();
            this.searchResultPrefix = this.tr('Category', 'Categoría');
            this.searchResultLabel = category;
            this.forceShowSearchResults = true;
            this.fetchSearchResults({
                categories: [category],
                published: true,
                limit: this.searchLimit,
                skip: 0
            });
            return;
        }

        if (query) {
            this.searchQuery = query;
            this.performSearch(true);
        }
    }

    private fetchSearchResults(payload: AudiobookFindPayload) {
        this.iAudiobook.audiobookFind(payload, (response: any) => {
            if (response && response.success) {
                const list = response.audiobooks || [];
                this.searchResults.set(list);
                this.searchResultCount = list.length;
                return;
            }
            this.resetSearchResults();
        });
    }

    selectCategory(category: CategoryModel & { children: CategoryModel[] }) {
        this.selectedCategory.set(category);
        setTimeout(() => {
            this.categoryResultsAnchor?.nativeElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 0);
    }

    goHome() {
        this.router.navigate(['app'])
    }

}

import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorModel } from '../../../models/author';
import { CategoryModel } from '../../../models/categories';
import { InternetCategoriesServices } from '../../../SERVICES/internet-categories.services';
import { InternetAuthorService } from '../../../SERVICES/internet-author.service';

@Component({
    selector: 'app-screen-authors',
    standalone: false,
    templateUrl: './screen-authors.html',
    styleUrl: './screen-authors.css',
})
export class ScreenAuthors implements OnInit {

    searchQuery = signal<string>('');
    viewMode = signal<'grid' | 'list' | 'category'>('category');
    selectedCategory = signal<CategoryModel | null>(null);
    activeFilters: string[] = [];
    
    hasMore = signal<boolean>(false);
    showButtonForLoadingMoreAuthors = false;
    showFilters = signal<boolean>(false);
    filterPenName = signal<string>('');
    filterCountry = signal<string>('');
    filterLanguage = signal<string>('');

    categories = signal<CategoryModel[]>([]);
    parentCategories = signal<CategoryModel[]>([]);

    featuredAuthors = signal<AuthorModel[]>([]);
    allAuthors = signal<AuthorModel[]>([]);
    trendingAuthors = signal<AuthorModel[]>([]);
    newAuthors = signal<AuthorModel[]>([]);

    //  Author list after the search
    searchResults = signal<AuthorModel[]>([]);
    private searchDebounce: any = null;

    constructor(
        private router: Router,
        private iCategory: InternetCategoriesServices,
        private iAuthors: InternetAuthorService
    ) {}

    ngOnInit() {
        this.getAllCategories();
    }

    getAllCategories() {
        this.iCategory.getAllCategories((response: any) => {
            if (response && response.success) {
                const all = response.categories || [];
                const topLevel = all.filter((cat: CategoryModel) => {
                    const parentId = typeof cat.parentId === 'string' ? cat.parentId : cat.parentId?._id;
                    return !parentId;
                });
                this.categories.set(all);
                this.parentCategories.set(topLevel);
            }
        })
    }

    onSearch() {
        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
        }
        this.searchDebounce = setTimeout(() => {
            this.performSearch(false);
        }, 350);
    }

    clearSearch() {
        this.searchQuery.set('');
        this.searchResults.set([]);
        this.activeFilters = [];
    }

    selectCategory(category: CategoryModel | null) {
        this.selectedCategory.set(category);
    }

    setViewMode(mode: 'grid' | 'list' | 'category') {
        this.viewMode.set(mode);
    }

    getChildCategories(parentId: string): CategoryModel[] {
        return this.categories().filter((cat) => {
            const pid = typeof cat.parentId === 'string' ? cat.parentId : cat.parentId?._id;
            return pid === parentId;
        });
    }

    getCategoryIcon(categoryName: string): string {
        const category = this.categories().find(c => c.name === categoryName);
        return category && category.icon ? category.icon : '📚';
    }

    toggleFilters() {
        this.showFilters.set(!this.showFilters());
    }

    removeFilter(filter: string) {
        this.activeFilters = this.activeFilters.filter(f => f !== filter);
    }

    clearAllFilters() {
        this.activeFilters = [];
    }

    applyFilters() {
        const parts: string[] = [];
        const name = this.filterPenName().trim();
        const country = this.filterCountry().trim();
        const language = this.filterLanguage().trim();

        if (name) parts.push(name);
        if (country) parts.push(`country:${country}`);
        if (language) parts.push(`lang:${language}`);

        this.searchQuery.set(parts.join(' ').trim());
        this.performSearch(true);
    }

    clearFilters() {
        this.filterPenName.set('');
        this.filterCountry.set('');
        this.filterLanguage.set('');
        this.activeFilters = [];
        this.searchQuery.set('');
        this.searchResults.set([]);
    }

    private performSearch(force: boolean) {
        const raw = (this.searchQuery() || '').trim();
        if (raw.length < 2 && !force) {
            this.searchResults.set([]);
            return;
        }

        const parsed = this.parseSearchFilters(raw);
        const penName = parsed.text;
        const country = parsed.country;
        const language = parsed.language;

        this.activeFilters = [];
        if (country) this.activeFilters.push(`Country: ${country}`);
        if (language) this.activeFilters.push(`Language: ${language}`);

        this.iAuthors.findAuthors(
            penName,
            country,
            language,
            50,
            0,
            (response: any) => {
                if (response && response.success) {
                    this.searchResults.set(response.authors || []);
                } else {
                    this.searchResults.set([]);
                }
            }
        );
    }

    private parseSearchFilters(query: string): { text: string, country: string, language: string } {
        let text = query;
        let country = '';
        let language = '';

        const countryMatch = query.match(/country:([^\s]+)/i);
        if (countryMatch && countryMatch[1]) {
            country = countryMatch[1].replace(/[_-]/g, ' ');
            text = text.replace(countryMatch[0], '').trim();
        }

        const langMatch = query.match(/(lang|language):([^\s]+)/i);
        if (langMatch && langMatch[2]) {
            language = langMatch[2].replace(/[_-]/g, ' ');
            text = text.replace(langMatch[0], '').trim();
        }

        return {
            text: text.trim(),
            country,
            language
        };
    }

    viewAuthorProfile(authorId: string) {
        console.log('View author profile:', authorId);
        // Navigate to author profile
    }

    handleFollow(authorId: string) {
        console.log('Follow/Unfollow author:', authorId);
        // API call to follow/unfollow
    }

    loadMore() {
        console.log('Load more authors');
        // Load more from API
    }

    goHome() {
        this.router.navigate(['app'])
    }

}


























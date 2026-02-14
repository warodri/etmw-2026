import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorModel } from '../../../models/author';
import { CategoryModel } from '../../../models/categories';
import { InternetCategoriesServices } from '../../../SERVICES/internet-categories.services';

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
    hasMore = true;

    categories = signal<CategoryModel[]>([])

    featuredAuthors = signal<AuthorModel[]>([]);
    allAuthors = signal<AuthorModel[]>([]);
    trendingAuthors = signal<AuthorModel[]>([]);
    newAuthors = signal<AuthorModel[]>([]);

    searchResults = signal<AuthorModel[]>([]);

    constructor(
        private router: Router,
        private iCategory: InternetCategoriesServices
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
                this.categories.set(topLevel);
            }
        })
    }

    onSearch() {
        
    }

    clearSearch() {
        this.searchQuery.set('');
        this.searchResults.set([]);
    }

    selectCategory(category: CategoryModel | null) {
        this.selectedCategory.set(category);
    }

    setViewMode(mode: 'grid' | 'list' | 'category') {
        this.viewMode.set(mode);
    }

    getCategoryIcon(categoryName: string): string {
        const category = this.categories().find(c => c.name === categoryName);
        return category && category.icon ? category.icon : '📚';
    }

    toggleFilters() {
        console.log('Toggle filters');
        // Open filters modal
    }

    removeFilter(filter: string) {
        this.activeFilters = this.activeFilters.filter(f => f !== filter);
    }

    clearAllFilters() {
        this.activeFilters = [];
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





























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
    searchResultCount = 12;
    activeFilters: string[] = [];

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

    categories = signal<Array<CategoryModel>>([]);
    categoryCards = signal<Array<CategoryModel & { children: CategoryModel[] }>>([]);

    contentSections = [
        {
            title: 'Fantasy',
            description: 'Epic tales of magic, dragons, and adventure'
        },
        {
            title: 'Science Fiction',
            description: 'Explore the future and beyond'
        },
        {
            title: 'Mystery & Thriller',
            description: 'Keep you on the edge of your seat'
        }
    ];

    recentlyPlayed = [
        {
            id: '1',
            title: 'The Anatomy of a Body',
            author: 'Mariano E Rodriguez',
            cover: 'https://images.squarespace-cdn.com/content/v1/624da83e75ca872f189ffa42/aa45e942-f55d-432d-8217-17c7d98105ce/image001.jpg',
            progress: 45,
            currentTime: '2:34:12',
            totalTime: '6:21:00'
        },
        {
            id: '2',
            title: 'Away',
            author: 'Sarah Johnson',
            cover: 'https://images.squarespace-cdn.com/content/v1/624da83e75ca872f189ffa42/aa45e942-f55d-432d-8217-17c7d98105ce/image001.jpg',
            progress: 12,
            currentTime: '0:48:30',
            totalTime: '7:12:00'
        }
    ];

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

    selectCategory(categoryName: string) {
        console.log('Selected category:', categoryName);
        // Navigate to category page or filter content
    }

    goHome() {
        this.router.navigate(['app'])
    }

}

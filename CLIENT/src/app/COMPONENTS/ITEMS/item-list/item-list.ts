import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-item-list',
    standalone: false,
    templateUrl: './item-list.html',
    styleUrl: './item-list.css',
})
export class ItemList {

    searchQuery = '';
    searchResultCount = 12;
    activeFilters: string[] = [];

    categories = [
        {
            name: 'Literary Fiction',
            icon: '📚',
            count: 342,
            gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 100%)'
        },
        {
            name: 'Science Fiction',
            icon: '🚀',
            count: 289,
            gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)'
        },
        {
            name: 'Fantasy',
            icon: '🐉',
            count: 421,
            gradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.3) 0%, rgba(234, 88, 12, 0.1) 100%)'
        },
        {
            name: 'Historical Fiction',
            icon: '🏛️',
            count: 198,
            gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)'
        },
        {
            name: 'Short Stories',
            icon: '📖',
            count: 567,
            gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.1) 100%)'
        },
        {
            name: 'Non-Fiction',
            icon: '🎓',
            count: 445,
            gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.1) 100%)'
        },
        {
            name: 'Biography',
            icon: '👤',
            count: 234,
            gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)'
        },
        {
            name: 'Autobiography',
            icon: '✍️',
            count: 178,
            gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)'
        },
        {
            name: 'Memoir',
            icon: '💭',
            count: 156,
            gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 100%)'
        },
        {
            name: 'Essays',
            icon: '📝',
            count: 289,
            gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(14, 165, 233, 0.1) 100%)'
        },
        {
            name: 'Mystery',
            icon: '🔍',
            count: 334,
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)'
        },
        {
            name: 'Thriller',
            icon: '🎭',
            count: 401,
            gradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.1) 100%)'
        }
    ];

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
        private router: Router
    ) {}

    selectCategory(categoryName: string) {
        console.log('Selected category:', categoryName);
        // Navigate to category page or filter content
    }

    goHome() {
        this.router.navigate(['app'])
    }

}
import { Component, OnInit } from '@angular/core';
import { InternetService } from '../../../SERVICES/internet.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-authors',
    standalone: false,
    templateUrl: './screen-authors.html',
    styleUrl: './screen-authors.css',
})
export class ScreenAuthors implements OnInit {

    searchQuery = '';
    viewMode: 'grid' | 'list' | 'category' = 'category';
    selectedCategory: string | null = null;
    activeFilters: string[] = [];
    hasMore = true;

    categories = [
        {
            name: 'Literary Fiction',
            icon: '📚',
            authorCount: 156,
            gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 100%)'
        },
        {
            name: 'Science Fiction',
            icon: '🚀',
            authorCount: 98,
            gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 100%)'
        },
        {
            name: 'Fantasy',
            icon: '🐉',
            authorCount: 134,
            gradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.3) 0%, rgba(234, 88, 12, 0.1) 100%)'
        },
        {
            name: 'Mystery',
            icon: '🔍',
            authorCount: 89,
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)'
        },
        {
            name: 'Romance',
            icon: '💕',
            authorCount: 112,
            gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 100%)'
        },
        {
            name: 'Thriller',
            icon: '🎭',
            authorCount: 76,
            gradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.1) 100%)'
        },
        {
            name: 'Biography',
            icon: '👤',
            authorCount: 64,
            gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)'
        },
        {
            name: 'Self-Help',
            icon: '💡',
            authorCount: 91,
            gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.1) 100%)'
        }
    ];

    featuredAuthors = [
        {
            _id: '1',
            penName: 'Mariano E Rodriguez',
            profilePicture: 'https://i.pravatar.cc/150?img=12',
            coverImage: null,
            bio: 'Award-winning author of psychological thrillers and contemporary fiction. Known for exploring the depths of human consciousness.',
            country: 'Argentina',
            languages: ['Spanish', 'English'],
            categories: ['Literary Fiction', 'Thriller'],
            totalAudiobooks: 24,
            totalFollowers: 45600,
            totalCompletions: 128400,
            isVerified: true,
            isFollowing: false,
            latestWorks: [
                {
                    id: 'w1',
                    title: 'The Anatomy of a Body',
                    cover: 'https://images.squarespace-cdn.com/content/v1/624da83e75ca872f189ffa42/aa45e942-f55d-432d-8217-17c7d98105ce/image001.jpg'
                }
            ]
        },
        {
            _id: '2',
            penName: 'Isabel Allende',
            profilePicture: 'https://i.pravatar.cc/150?img=1',
            coverImage: null,
            bio: 'Master storyteller of magical realism and historical fiction. Her works blend personal experience with Latin American history.',
            country: 'Chile',
            languages: ['Spanish', 'English'],
            categories: ['Literary Fiction', 'Historical Fiction'],
            totalAudiobooks: 32,
            totalFollowers: 234000,
            totalCompletions: 891000,
            isVerified: true,
            isFollowing: false,
            latestWorks: []
        },
        {
            _id: '3',
            penName: 'James Patterson',
            profilePicture: 'https://i.pravatar.cc/150?img=33',
            coverImage: null,
            bio: 'Bestselling author of fast-paced thrillers and mysteries. Creator of Alex Cross and Women\'s Murder Club series.',
            country: 'United States',
            languages: ['English'],
            categories: ['Mystery', 'Thriller'],
            totalAudiobooks: 58,
            totalFollowers: 567000,
            totalCompletions: 2340000,
            isVerified: true,
            isFollowing: true,
            latestWorks: []
        }
    ];

    allAuthors = [
        ...this.featuredAuthors,
        {
            _id: '4',
            penName: 'Margaret Atwood',
            profilePicture: 'https://i.pravatar.cc/150?img=5',
            coverImage: null,
            bio: 'Visionary author of speculative fiction and feminist literature.',
            country: 'Canada',
            languages: ['English'],
            categories: ['Science Fiction', 'Literary Fiction'],
            totalAudiobooks: 28,
            totalFollowers: 189000,
            totalCompletions: 456000,
            isVerified: true,
            isFollowing: false,
            latestWorks: []
        },
        {
            _id: '5',
            penName: 'Haruki Murakami',
            profilePicture: 'https://i.pravatar.cc/150?img=68',
            coverImage: null,
            bio: 'Japanese author known for surreal and melancholic stories.',
            country: 'Japan',
            languages: ['Japanese', 'English'],
            categories: ['Literary Fiction', 'Fantasy'],
            totalAudiobooks: 19,
            totalFollowers: 345000,
            totalCompletions: 678000,
            isVerified: true,
            isFollowing: false,
            latestWorks: []
        },
        {
            _id: '6',
            penName: 'Chimamanda Ngozi Adichie',
            profilePicture: 'https://i.pravatar.cc/150?img=45',
            coverImage: null,
            bio: 'Award-winning Nigerian author writing about race, feminism, and African identity.',
            country: 'Nigeria',
            languages: ['English'],
            categories: ['Literary Fiction'],
            totalAudiobooks: 12,
            totalFollowers: 234000,
            totalCompletions: 567000,
            isVerified: true,
            isFollowing: false,
            latestWorks: []
        }
    ];

    trendingAuthors = [
        this.allAuthors[0],
        this.allAuthors[2],
        this.allAuthors[4]
    ];

    newAuthors = [
        {
            _id: '7',
            penName: 'Emma Chen',
            profilePicture: 'https://i.pravatar.cc/150?img=23',
            coverImage: null,
            bio: 'Debut author making waves with fresh perspectives on contemporary life.',
            country: 'Singapore',
            languages: ['English', 'Mandarin'],
            categories: ['Literary Fiction'],
            totalAudiobooks: 3,
            totalFollowers: 1200,
            totalCompletions: 3400,
            isVerified: false,
            isFollowing: false,
            latestWorks: []
        },
        {
            _id: '8',
            penName: 'Lucas Fernández',
            profilePicture: 'https://i.pravatar.cc/150?img=15',
            coverImage: null,
            bio: 'New voice in science fiction exploring AI ethics and humanity.',
            country: 'Spain',
            languages: ['Spanish', 'English'],
            categories: ['Science Fiction'],
            totalAudiobooks: 2,
            totalFollowers: 890,
            totalCompletions: 2100,
            isVerified: false,
            isFollowing: false,
            latestWorks: []
        },
        {
            _id: '9',
            penName: 'Aisha Mohammed',
            profilePicture: 'https://i.pravatar.cc/150?img=9',
            coverImage: null,
            bio: 'Emerging author bringing authentic Middle Eastern stories to global audience.',
            country: 'Egypt',
            languages: ['Arabic', 'English'],
            categories: ['Literary Fiction', 'Historical Fiction'],
            totalAudiobooks: 4,
            totalFollowers: 2300,
            totalCompletions: 5600,
            isVerified: false,
            isFollowing: false,
            latestWorks: []
        }
    ];

    searchResults: any[] = [];

    constructor(
        private router: Router
    ) {}

    ngOnInit() {
        // Initialize
    }

    onSearch() {
        if (this.searchQuery.trim()) {
            this.searchResults = this.allAuthors.filter(author =>
                author.penName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                author.bio.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                author.categories.some((cat: string) => cat.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        } else {
            this.searchResults = [];
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchResults = [];
    }

    selectCategory(category: string | null) {
        this.selectedCategory = category;
    }

    getCategoryAuthors(categoryName: string) {
        return this.allAuthors.filter(author =>
            author.categories.includes(categoryName)
        );
    }

    getCategoryIcon(categoryName: string): string {
        const category = this.categories.find(c => c.name === categoryName);
        return category ? category.icon : '📚';
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































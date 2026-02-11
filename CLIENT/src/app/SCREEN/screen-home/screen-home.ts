import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilClass } from '../../utils/utils';

@Component({
    selector: 'app-screen-home',
    standalone: false,
    templateUrl: './screen-home.html',
    styleUrl: './screen-home.css',
})
export class ScreenHome implements OnInit {

    contactForm = signal({
        name: '',
        email: '',
        userType: '',
        subject: '',
        message: ''
    });
    
    categories = signal([{
        label: 'Psychology',
        emoji: '🧠'
    }, {
        label: 'Technology',
        emoji: '💻'
    }, {
        label: 'Health',
        emoji: '🍎'
    }, {
        label: 'Finance',
        emoji: '💰'
    }, {
        label: 'Travel',
        emoji: '✈️'
    }])

    latestAuthors = signal([{
        userPhoto: 'f-author-2.jpeg',
        name: 'Alice Johnson',
        lastUpload: '1 essay uploaded today'
    }, {
        userPhoto: 'f-author-1.jpeg',
        name: 'Michael Smith',
        lastUpload: '1 thriller uploaded yesterday'
    }, {
        userPhoto: 'f-author-5.jpeg',
        name: 'Sophie Lee',
        lastUpload: '1 poem uploaded 2 days ago'
    }])

    latestWorks = signal([{
        cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        title: 'The Silent Echo',
        author: 'Emma Rodriguez',
        category: 'Mystery',
        duration: '8h 42m',
        chapters: 24,
        rating: 4.8
    }, {
        cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
        title: 'Digital Horizons',
        author: 'James Chen',
        category: 'Science Fiction',
        duration: '12h 15m',
        chapters: 31,
        rating: 4.9
    }, {
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
        title: 'Echoes of Tomorrow',
        author: 'Sarah Williams',
        category: 'Fantasy',
        duration: '15h 30m',
        chapters: 42,
        rating: 4.7
    }, {
        cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
        title: 'The Last Algorithm',
        author: 'David Park',
        category: 'Thriller',
        duration: '10h 20m',
        chapters: 28,
        rating: 4.6
    }])


    constructor(
        private router: Router
    ) {}

    ngOnInit() {
        this.detectRegion();
    }

    private detectRegion() {
        const regionInfo = UtilClass.detectRegion();        
        if (regionInfo.region == 'latam') {

        }        
        else if (regionInfo.region == 'us') {

        } 
        else if (regionInfo.region == 'uk') {

        } 
        else {

        }
    }

    gotoApp() {
        this.router.navigate(['app'])
    }
}
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-mobile-main',
    standalone: false,
    templateUrl: './screen-mobile-main.html',
    styleUrl: './screen-mobile-main.css',
})
export class ScreenMobileMain {

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

    constructor(
        private router: Router
    ) {}

    gotoSearchResult() {
        this.router.navigate(['app/search'])
    }

}

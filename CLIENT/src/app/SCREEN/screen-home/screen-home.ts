import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-screen-home',
    standalone: false,
    templateUrl: './screen-home.html',
    styleUrl: './screen-home.css',
})
export class ScreenHome {

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

}

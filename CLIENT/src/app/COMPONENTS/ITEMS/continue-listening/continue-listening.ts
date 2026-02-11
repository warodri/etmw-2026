import { Component } from '@angular/core';

@Component({
    selector: 'app-continue-listening',
    standalone: false,
    templateUrl: './continue-listening.html',
    styleUrl: './continue-listening.css',
})
export class ContinueListening {

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
    
}

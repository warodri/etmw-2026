import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { UserModel } from '../../../models/user';

@Component({
    selector: 'app-screen-mobile-main',
    standalone: false,
    templateUrl: './screen-mobile-main.html',
    styleUrl: './screen-mobile-main.css',
})
export class ScreenMobileMain implements OnInit {

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
        private router: Router,
    ) {}

    ngOnInit(): void {
        
    }

    gotoSearchResult() {
        this.router.navigate(['app/search'])
    }

}

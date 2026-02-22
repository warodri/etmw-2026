import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { UserModel } from '../../../models/user';
import { CategoryModel } from '../../../models/categories';

@Component({
    selector: 'app-screen-mobile-main',
    standalone: false,
    templateUrl: './screen-mobile-main.html',
    styleUrl: './screen-mobile-main.css',
})
export class ScreenMobileMain implements OnInit {

    constructor(
        private router: Router,
    ) {}

    ngOnInit(): void {
        
    }

    gotoSearchResult() {
        this.router.navigate(['app/search'])
    }

    gotoUpload() {
        this.router.navigate(['app/audiobooks/upload'])
    }

    gotoSeeAllAuthors() {
        this.router.navigate(['app/authors'])
    }

    gotoStories() {
        this.router.navigate(['app/stories'])
    }

    gotoFindByCategory(category: CategoryModel) {
        this.router.navigate(['app/search/category', category.name])
    }

    gotoFindBooks() {
        this.router.navigate(['app/search'])
    }

}

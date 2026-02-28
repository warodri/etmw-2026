import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { UserModel } from '../../../models/user';
import { CategoryModel } from '../../../models/categories';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-screen-mobile-main',
    standalone: false,
    templateUrl: './screen-mobile-main.html',
    styleUrl: './screen-mobile-main.css',
})
export class ScreenMobileMain implements OnInit {
    language: 'en' | 'es' = 'en';

    constructor(
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.language = LangUtils.detectLanguage();
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }

    gotoSearchResult() {
        this.router.navigate(['app/search'])
    }

    gotoUpload() {
        this.router.navigate(['app/audiobooks/upload'])
    }

    gotoCreateYourStory() {
        this.router.navigate(['app/audiobooks/create-your-story'])
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

    gotoDebate() {
        this.router.navigate(['app/debate'])
    }

}

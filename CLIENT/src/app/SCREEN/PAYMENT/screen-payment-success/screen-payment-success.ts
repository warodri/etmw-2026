import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-screen-payment-success',
    standalone: false,
    templateUrl: './screen-payment-success.html',
    styleUrl: './screen-payment-success.css',
})
export class ScreenPaymentSuccess implements OnInit {
    language: 'en' | 'es' = 'en';

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
        this.language = LangUtils.detectLanguage();
        // Optional: Auto-redirect after 10 seconds
        setTimeout(() => {
            this.goToMyBooks();
        }, 10000);
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }

    goToMyBooks() {
        this.router.navigate(['/my-audiobooks']);
    }

    goHome() {
        this.router.navigate(['/']);
    }

    goApp() {
        this.router.navigate(['app']);
    }
}

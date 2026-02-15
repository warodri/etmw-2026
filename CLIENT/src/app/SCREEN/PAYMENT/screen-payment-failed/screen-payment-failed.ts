import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-payment-failed',
    standalone: false,
    templateUrl: './screen-payment-failed.html',
    styleUrl: './screen-payment-failed.css',
})
export class ScreenPaymentFailed implements OnInit {

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
    }

    tryAgain() {
        this.router.navigate(['/upload-audiobook']);
    }

    contactSupport() {
        // Navigate to support or open email
        window.location.href = 'mailto:support@yourapp.com?subject=Payment Failed - Need Help';
    }

    goHome() {
        this.router.navigate(['/']);
    }

    goApp() {
        this.router.navigate(['app']);
    }
}
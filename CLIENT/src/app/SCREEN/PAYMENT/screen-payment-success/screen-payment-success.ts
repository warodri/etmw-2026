import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-payment-success',
    standalone: false,
    templateUrl: './screen-payment-success.html',
    styleUrl: './screen-payment-success.css',
})
export class ScreenPaymentSuccess implements OnInit {

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
        // Optional: Auto-redirect after 10 seconds
        setTimeout(() => {
            this.goToMyBooks();
        }, 10000);
    }

    goToMyBooks() {
        this.router.navigate(['/my-audiobooks']);
    }

    goHome() {
        this.router.navigate(['/']);
    }
}
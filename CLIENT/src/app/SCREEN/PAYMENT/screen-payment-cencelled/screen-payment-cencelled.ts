import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-payment-cencelled',
    standalone: false,
    templateUrl: './screen-payment-cencelled.html',
    styleUrl: './screen-payment-cencelled.css',
})
export class ScreenPaymentCencelled implements OnInit {

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
    }

    continueUpload() {
        this.router.navigate(['/upload-audiobook']);
    }

    goHome() {
        this.router.navigate(['/']);
    }

    browsePlans() {
        this.router.navigate(['/pricing']);
    }
}
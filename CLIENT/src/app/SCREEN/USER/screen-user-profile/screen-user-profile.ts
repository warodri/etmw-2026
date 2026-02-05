import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-screen-user-profile',
    standalone: false,
    templateUrl: './screen-user-profile.html',
    styleUrl: './screen-user-profile.css',
})
export class ScreenUserProfile {

    constructor(
        private router: Router
    ) {}

    goHome() {
        this.router.navigate(['app'])
    }

}

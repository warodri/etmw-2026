import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-mobile-footer',
    standalone: false,
    templateUrl: './mobile-footer.html',
    styleUrl: './mobile-footer.css',
})
export class MobileFooter {

    @Input() selected: 'home' | 'fav' | 'user' | 'none' = 'home'

    constructor(
        private router: Router
    ) {}

    goHome() {
        this.router.navigate(['app'])
    }

}

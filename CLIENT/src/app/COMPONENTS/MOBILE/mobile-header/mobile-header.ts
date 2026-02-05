import { Component, Input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-mobile-header',
    standalone: false,
    templateUrl: './mobile-header.html',
    styleUrl: './mobile-header.css',
})
export class MobileHeader implements OnInit {

    @Input() showBack = false;

    isLoggedIn = signal<boolean>(false);
    showLogin = signal<boolean>(false);
    askForCode = signal<boolean>(false);
    working = signal<boolean>(false);
    showSearch = signal<boolean>(false);

    constructor(
        private router: Router
    ) {}

    ngOnInit(): void {
        
    }

    loadMyUser() {

    }

    toggleShowLogin() {
        this.showLogin.set(!this.showLogin())
    }

    sendCode() {
        this.askForCode.set(true);
    }

    validateCode() {
        this.isLoggedIn.set(true);
        this.showLogin.set(false);
    }

    toggleShowSearch() {
        this.showSearch.set(!this.showSearch())
    }

    gotoInbox() {
        this.router.navigate(['app/inbox'])
    }
    
    gotoUserProfile() {
        this.router.navigate(['app/user-profile'])
    }

}

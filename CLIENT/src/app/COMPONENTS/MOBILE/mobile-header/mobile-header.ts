import { Component, Input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { UserModel } from '../../../models/user';
import { ToastService } from '../../../SERVICES/toast';

@Component({
    selector: 'app-mobile-header',
    standalone: false,
    templateUrl: './mobile-header.html',
    styleUrl: './mobile-header.css',
})
export class MobileHeader implements OnInit {

    @Input() showBack = false;
    
    myUser = signal<UserModel | null>(null);

    email = signal<string | null>(null);
    code = signal<number | null>(null);

    isLoggedIn = signal<boolean>(false);
    showLogin = signal<boolean>(false);
    askForCode = signal<boolean>(false);
    showSearch = signal<boolean>(false);
    working = signal<boolean>(false);

    constructor(
        private router: Router,
        private iUser: InternetUserService,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.init();
    }

    init() {
        this.getMyUser(() => {
            const user = this.myUser();
            if (user) {
                this.isLoggedIn.set(true);
                this.showLogin.set(false);
            }
        })
    }

    getMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
            }
            callback()
        })
    }

    toggleShowLogin() {
        this.showLogin.set(!this.showLogin())
    }

    sendCode() {
        const email = this.email();
        if (this.working() || !email) return;
        this.working.set(true);
        this.iUser.sendCode(email, (response: any) => {
            this.working.set(false);
            console.log('sendCode', response);
            if (response && response.success) {
                this.askForCode.set(true);
            } else {
                this.toast.show(this.toast.getMessageErrorUnexpected())
            }
        })
    }

    validateCode() {
        const email = this.email();
        const code = this.code();
        if (this.working() || !email || !code) return;
        this.working.set(true);
        this.iUser.validateCode(email, code.toString(), (response: any) => {
            this.working.set(false);
            console.log('validateCode', response);
            if (response && response.success) {
                this.myUser.set(response.user);
                const token = response.token;
                localStorage.setItem('auth_token_etmw', token);
                this.isLoggedIn.set(true);
                this.showLogin.set(false);
                setTimeout(() => {
                    this.gotoUserProfile()
                }, 100)
            } else {
                this.toast.show(this.toast.getMessageErrorUnexpected())
            }
        })
    }

    toggleShowSearch() {
        this.showSearch.set(!this.showSearch())
    }

    gotoInbox() {
        this.router.navigate(['app/inbox'])
    }
    
    gotoUserProfile() {
        const myUser = this.myUser();
        if (myUser && myUser._id) {
            this.router.navigate(['app/user-profile', myUser._id])
        }
    }

}

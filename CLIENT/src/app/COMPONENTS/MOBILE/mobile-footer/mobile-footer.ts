import { Component, Input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';

@Component({
    selector: 'app-mobile-footer',
    standalone: false,
    templateUrl: './mobile-footer.html',
    styleUrl: './mobile-footer.css',
})
export class MobileFooter implements OnInit {

    myUser = signal<UserModel | null>(null);
    @Input() selected: 'home' | 'fav' | 'user' | 'none' | null = null;

    constructor(
        private router: Router,
        private iUser: InternetUserService
    ) {}

    ngOnInit(): void {
        
    }

    goHome() {
        this.router.navigate(['app'])
    }

    gotoMyProfile() {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response);
            if (response && response.success) {
                const userId = response.user._id;
                this.goto('app/user-profile/' + userId)
            }
        })
    }

    goto(route: string) {
        this.router.navigate([route])
    }

}

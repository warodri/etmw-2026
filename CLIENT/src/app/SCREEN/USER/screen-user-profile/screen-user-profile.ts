import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { ToastService } from '../../../SERVICES/toast';

@Component({
    selector: 'app-screen-user-profile',
    standalone: false,
    templateUrl: './screen-user-profile.html',
    styleUrl: './screen-user-profile.css',
})
export class ScreenUserProfile implements OnInit {

    userId = signal<string | null>(null);
    user = signal<UserModel | null>(null);

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private iUser: InternetUserService,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.userId.set(params.get('id'));
            this.loadUser();
        })
    }

    loadUser() {
        const userId = this.userId();
        if (userId) {
            this.iUser.getUserById(userId, (response: any) => {
                console.log('getUserById', response)
                if (response && response.success) {
                    this.user.set(response.user);
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected())
                }
            })
        } else {
            this.iUser.getMyUser((response: any) => {
                console.log('getMyUser', response)
                if (response && response.success) {
                    this.user.set(response.user);
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected())
                }
            })
        }
    }

    goHome() {
        this.router.navigate(['app'])
    }

}

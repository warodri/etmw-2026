import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { UserModel } from '../../../models/user';
import { ToastService } from '../../../SERVICES/toast';
import { InternetCommentsServices } from '../../../SERVICES/internet-comments.services';

interface MessageComment {
    _id: string;
    userId: string | UserModel;
    targetId: string;
    isRead?: boolean;
}

@Component({
    selector: 'app-mobile-header',
    standalone: false,
    templateUrl: './mobile-header.html',
    styleUrl: './mobile-header.css',
})
export class MobileHeader implements OnInit, OnDestroy {

    @Input() showBack = false;
    
    myUser = signal<UserModel | null>(null);

    email = signal<string | null>(null);
    code = signal<number | null>(null);

    query = signal<string | null>(null);

    isLoggedIn = signal<boolean>(false);
    showLogin = signal<boolean>(false);
    askForCode = signal<boolean>(false);
    showSearch = signal<boolean>(false);
    working = signal<boolean>(false);
    unreadConversations = signal<number>(0);

    private unreadTimer: any = null;

    constructor(
        private router: Router,
        private iUser: InternetUserService,
        private iComments: InternetCommentsServices,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
        if (this.unreadTimer) {
            clearInterval(this.unreadTimer);
            this.unreadTimer = null;
        }
    }

    init() {
        this.getMyUser(() => {
            const user = this.myUser();
            if (user) {
                this.isLoggedIn.set(true);
                this.showLogin.set(false);
                this.refreshUnreadConversations();
                this.startUnreadRefreshTimer();
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
                this.refreshUnreadConversations();
                this.startUnreadRefreshTimer();
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

    executeSearch() {
        const query = this.query();
        if (query) {
            this.router.navigate(['app/search/query', query])
        }
    }

    private startUnreadRefreshTimer() {
        if (this.unreadTimer) {
            clearInterval(this.unreadTimer);
            this.unreadTimer = null;
        }
        this.unreadTimer = setInterval(() => {
            this.refreshUnreadConversations();
        }, 15000);
    }

    private refreshUnreadConversations() {
        const me = this.myUser();
        const myUserId = String(me?._id || '');
        if (!myUserId) {
            this.unreadConversations.set(0);
            return;
        }

        this.iComments.commentFind('message', null, 0, 400, 'desc', (response: any) => {
            if (!response?.success || !Array.isArray(response.comments)) {
                this.unreadConversations.set(0);
                return;
            }
            const comments = response.comments as MessageComment[];
            const unreadByConversation = new Set<string>();
            for (const item of comments) {
                const senderId = this.getUserId(item.userId);
                const receiverId = String(item.targetId || '');
                const isIncoming = receiverId === myUserId;
                const isUnread = isIncoming && !item.isRead;
                if (!isUnread) continue;
                if (senderId) {
                    unreadByConversation.add(senderId);
                }
            }
            this.unreadConversations.set(unreadByConversation.size);
        });
    }

    private getUserId(value: string | UserModel): string {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return String(value._id || '');
    }

}

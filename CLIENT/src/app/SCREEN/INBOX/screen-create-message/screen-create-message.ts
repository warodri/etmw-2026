import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { InternetCommentsServices } from '../../../SERVICES/internet-comments.services';
import { ToastService } from '../../../SERVICES/toast';
import { Config } from '../../../utils/config';
import { UserModel } from '../../../models/user';

@Component({
    selector: 'app-screen-create-message',
    standalone: false,
    templateUrl: './screen-create-message.html',
    styleUrl: './screen-create-message.css',
})
export class ScreenCreateMessage implements OnInit, OnDestroy {

    readonly SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;
    readonly selectedUser = signal<UserModel | null>(null);
    readonly foundUsers = signal<UserModel[]>([]);
    readonly loadingUsers = signal<boolean>(false);
    readonly sending = signal<boolean>(false);

    searchQuery = '';
    messageText = '';

    private searchDebounce: any = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private iUser: InternetUserService,
        private iComments: InternetCommentsServices,
        private toast: ToastService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const userId = String(params.get('userId') || '').trim();
            if (userId) {
                this.preloadUser(userId);
            } else {
                this.selectedUser.set(null);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
            this.searchDebounce = null;
        }
    }

    goHome() {
        this.router.navigate(['app']);
    }

    goBackToInbox() {
        this.router.navigate(['app/inbox']);
    }

    preloadUser(userId: string) {
        this.iUser.getUserById(userId, (response: any) => {
            if (response?.success && response.user) {
                this.selectedUser.set(response.user as UserModel);
                this.searchQuery = this.getUserLabel(response.user as UserModel);
                this.foundUsers.set([]);
            }
        });
    }

    onSearchInput() {
        const query = String(this.searchQuery || '').trim();
        if (this.selectedUser() && query === this.getUserLabel(this.selectedUser() as UserModel)) {
            return;
        }
        this.selectedUser.set(null);

        if (this.searchDebounce) {
            clearTimeout(this.searchDebounce);
            this.searchDebounce = null;
        }

        if (query.length < 2) {
            this.foundUsers.set([]);
            return;
        }

        this.searchDebounce = setTimeout(() => {
            this.searchUsers(query);
        }, 250);
    }

    searchUsers(query: string) {
        this.loadingUsers.set(true);
        this.iUser.userFind(query, 10, (response: any) => {
            this.loadingUsers.set(false);
            if (response?.success && Array.isArray(response.users)) {
                this.foundUsers.set(response.users as UserModel[]);
                return;
            }
            this.foundUsers.set([]);
        });
    }

    pickUser(user: UserModel) {
        this.selectedUser.set(user);
        this.searchQuery = this.getUserLabel(user);
        this.foundUsers.set([]);
    }

    clearSelectedUser() {
        this.selectedUser.set(null);
        this.searchQuery = '';
        this.foundUsers.set([]);
    }

    sendMessage() {
        const receiver = this.selectedUser();
        const message = String(this.messageText || '').trim();
        if (!receiver?._id) {
            this.toast.show('Please select a user.');
            return;
        }
        if (!message) {
            this.toast.show('Please write a message.');
            return;
        }
        if (this.sending()) return;

        this.sending.set(true);
        this.iComments.commentAdd(
            receiver._id,
            'message',
            message,
            null,
            (response: any) => {
                this.sending.set(false);
                if (response?.success) {
                    this.toast.show('Message sent');
                    this.messageText = '';
                    this.router.navigate(['app/inbox']);
                    return;
                }
                this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
            }
        );
    }

    getUserLabel(user: UserModel): string {
        const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        return fullName || user?.email || '';
    }

    getProfilePicture(user: UserModel): string {
        const image = String(user?.profilePicture || '').trim();
        if (!image) {
            return '';
        }
        if (image.startsWith('http://') || image.startsWith('https://')) {
            return image;
        }
        return `${this.SERVER}/file?id=${image}`;
    }
}

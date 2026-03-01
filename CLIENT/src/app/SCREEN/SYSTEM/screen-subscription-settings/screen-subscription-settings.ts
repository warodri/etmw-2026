import { Component, OnInit, signal } from '@angular/core';
import { NotificationSubscription } from '../../../models/notification-subscription';
import { InternetService } from '../../../SERVICES/internet.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../SERVICES/toast';

@Component({
    selector: 'app-screen-subscription-settings',
    standalone: false,
    templateUrl: './screen-subscription-settings.html',
    styleUrl: './screen-subscription-settings.css',
})
export class ScreenSubscriptionSettings implements OnInit {

    token = signal<string | null>(null);

    subscriptions = signal<NotificationSubscription[]>([
        {
            channel: 'email',
            labelEn: 'Receive an Email when',
            labelEs: 'Recibe un Email cuando',
            sections: [
                {
                    labelEn: 'Audiobooks',
                    labelEs: 'Audiobooks',
                    subscriptions: [
                        {
                            code: 'new-chapter-available',
                            labelEn: 'New chapter is available',
                            labelEs: 'Un nuevo capítulo está disponible',
                            selected: false,
                        },
                        {
                            code: 'liked-author-uploads-audiobook',
                            labelEn: 'Author you liked uploads an audiobook',
                            labelEs: '',
                            selected: false,
                        },
                        {
                            code: 'new-audiobook-similar-to-what-I-listen-to',
                            labelEn: 'New audiobook similiar to what I listen to',
                            labelEs: '',
                            selected: false,
                        },                                
                    ]
                },
                {
                    labelEn: 'Debate',
                    labelEs: 'Debates',
                    subscriptions: [
                        {
                            code: 'author-i-follow-joins-debate',
                            labelEn: 'Author I follow joins a debate',
                            labelEs: '',
                            selected: false,
                        },
                        {
                            code: 'new-debate-starts-about-liked-author',
                            labelEn: 'New debate starts about liked author',
                            labelEs: '',
                            selected: false,
                        },
                        {
                            code: 'new-debate-starts-about-liked-audiobook',
                            labelEn: 'New debate starts about liked audiobook',
                            labelEs: '',
                            selected: false,
                        },
                        {
                            code: 'user-adds-comment-to-one-of-my-debates',
                            labelEn: `A user adds a comment to one of the debates I'm following`,
                            labelEs: '',
                            selected: false,
                        },
                    ]
                },
                {
                    labelEn: 'Comments',
                    labelEs: 'Comentarios',
                    subscriptions: [
                        {
                            code: 'someone-replied-to-my-comment',
                            labelEn: 'Someone replied to my comment',
                            labelEs: '',
                            selected: false,
                        },
                        {
                            code: 'my-comment-receives-like',
                            labelEn: 'My comment received likes',
                            labelEs: '',
                            selected: false,
                        },
                    ]
                },
                {
                    labelEn: 'Listening',
                    labelEs: 'Escucha',
                    subscriptions: [
                        {
                            code: 'my-audiobook-progress-reminder',
                            labelEn: 'My audiobook progress reminder',
                            labelEs: '',
                            selected: false,
                        },
                    ]
                },
                {
                    labelEn: 'Others',
                    labelEs: 'Otros',
                    subscriptions: [
                        {
                            code: 'someone-followed-you',
                            labelEn: 'Someone followed you',
                            labelEs: '',
                            selected: false,
                        },
                        {
                            code: 'weekly-digest',
                            labelEn: 'Weekly “Your World” Digest',
                            labelEs: '',
                            selected: false,
                        },
                    ]
                },
            ]
        }
    ])

    //  Flags
    loading = signal<boolean>(true);

    constructor(
        private route: ActivatedRoute,
        private internet: InternetService,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.token.set(params.get('token'));
            this.getMyNotificationSubscription(() => {
                this.loading.set(false);
            })
        })
    }

    getMyNotificationSubscription(callback: any) {
        const token = this.token();
        if (token) {
            this.internet.notificationSubscriptionGet(token, (response: any) => {
                if (response && response.success) {
                    this.subscriptions.set(response.subscriptions);
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected())
                }
                callback()
            })
        }
    }

    getSectionSubscriptions(section: any) {
        return section.subscription ?? section.subscriptions ?? [];
    }

    updateNotification() {
        const token = this.token();
        const subscriptions = this.subscriptions();
        if (token) {
            this.internet.notificationSubscriptionUpsert(token, subscriptions, (response: any) => {
                if (response && response.success) {
                    this.toast.show('Notifications updated!')
                } else {
                    this.toast.show(this.toast.getMessageErrorUnexpected())
                }
            })
        }
    }

}

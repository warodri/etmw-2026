import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InternetSubscriptionService } from '../../../SERVICES/internet-subscription.services';
import { SubscriptionModel } from '../../../models/subscription';

@Component({
    selector: 'app-screen-tutorials',
    standalone: false,
    templateUrl: './screen-tutorials.html',
    styleUrl: './screen-tutorials.css',
})
export class ScreenTutorials implements OnInit {

    section = signal<string | null>(null);

    CHAPTER_NOT_AVAILABLE = 'chapter-not-available';

    //  T&C and legl
    LISTENER_TOS = 'listener-tos';
    AUTHOR_AGREEMENT = 'author-agreement';
    GDPR = 'privacy';
    COOKIES = 'cookies';
    CREATOR_PAYMENT = 'creator-payment';

    mySubscription = signal<SubscriptionModel | null>(null);

    constructor(
        private route: ActivatedRoute,
        private iSubscription: InternetSubscriptionService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.section.set(params.get('section'));
            if (this.section() == this.CHAPTER_NOT_AVAILABLE) {
                this.getMySubscription();
            }
        })
    }

    getMySubscription() {
        this.iSubscription.subscriptionGetMine((response: any) => {
            console.log('subscriptionGetMine', response)
            this.mySubscription.set(response.subscription);
        })
    }

    gotoContactSupport() {
        this.router.navigate(['app/contact-support'])
    }

}

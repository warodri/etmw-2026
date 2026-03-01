import { Component, Input, OnInit, signal } from '@angular/core';
import { UtilClass } from '../../../utils/utils';
import { Router } from '@angular/router';
import { UserModel } from '../../../models/user';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { InternetSubscriptionService } from '../../../SERVICES/internet-subscription.services';
import { ToastService } from '../../../SERVICES/toast';
import { LangUtils } from '../../../utils/lang';

@Component({
    selector: 'app-pricing',
    standalone: false,
    templateUrl: './pricing.html',
    styleUrl: './pricing.css',
})
export class Pricing implements OnInit {

    @Input() mainTitle = 'Choose Your Plan';
    language: 'en' | 'es' = 'en';
    
    myUser = signal<UserModel | null>(null);

    selectedRegion = signal<'latam' | 'us' | 'uk' | 'global'>('global');
    currency = signal<string>('$');
    prices = signal<{
        unlimited: {
            productId: string,
            price: number,
            booksPerMonth: number
        },
        reader: {
            productId: string,
            price: number,
            booksPerMonth: number
        },
        explorer: {
            productId: string,
            price: number,
            booksPerMonth: number
        }
    } | null>({
        unlimited: {
            productId: 'fallback-unlimited',
            price: 14.99,
            booksPerMonth: 9999
        },
        reader: {
            productId: 'fallback-reader',
            price: 9.99,
            booksPerMonth: 10
        },
        explorer: {
            productId: 'fallback-explorer',
            price: 6.49,
            booksPerMonth: 5
        }
    });

    //  Flags
    showLogin = signal<boolean>(false);
    checkoutPlanPending = signal<'Explorer' | 'Reader' | 'Unlimited' | null>(null);
    configLoadFailed = signal<boolean>(false);

    constructor(
        private router: Router,
        private iUser: InternetUserService,
        private iSubscription: InternetSubscriptionService,
        private toast: ToastService
    ) {}

    ngOnInit() {
        this.language = LangUtils.detectLanguage();
        this.getSubscriptionConfig(() => {
            this.loadMyUser(() => {
                this.detectRegion();        
            })
        })
    }

    getSubscriptionConfig(callback: any) {
        this.iSubscription.subscriptionGetConfig((response: any) => {
            console.log('subscriptionGetConfig', response);
            if (response && response.success) {
                this.prices.set(response.config)
                this.configLoadFailed.set(false);
                console.log('this.prices', this.prices())
            } else {
                this.configLoadFailed.set(true);
            }
            callback();
        })
    }

    loadMyUser(callback: any) {
        this.iUser.getMyUser((response: any) => {
            console.log('getMyUser', response)
            if (response && response.success) {
                this.myUser.set(response.user);
            }
            callback();
        })
    }

    private detectRegion() {
        const regionInfo = UtilClass.detectRegion();        
        if (regionInfo.region == 'latam') {
            this.selectedRegion.set('latam');
            // this.currency.set('$');
            // this.prices.set({
            //     explorer: '3.49',
            //     reader: '4.99',
            //     unlimited: '8.49'
            // });
        }        
        else if (regionInfo.region == 'us') {
            this.selectedRegion.set('us');
            // this.currency.set('$');
            // this.prices.set({
            //     explorer: '6.49',
            //     reader: '9.99',
            //     unlimited: '14.99'
            // });
        } 
        else if (regionInfo.region == 'uk') {
            this.selectedRegion.set('uk');
            // this.currency.set('£');
            // this.prices.set({
            //     explorer: '6.49',
            //     reader: '9.99',
            //     unlimited: '14.99'
            // });
        } 
        else {
            this.selectedRegion.set('global');
            // this.currency.set('$');
            // this.prices.set({
            //     explorer: '6.49',
            //     reader: '9.99',
            //     unlimited: '14.99'
            // });
        }
    }

    toggleShowLogin() {
        this.showLogin.set(!this.showLogin());
    }

    getStripeUrl(plan: 'Unlimited' | 'Reader' | 'Explorer') {
        if (this.checkoutPlanPending()) return;
        const selectedRegion = this.selectedRegion();
        if (selectedRegion) {
            this.checkoutPlanPending.set(plan);
            this.iSubscription.subscriptionGenerateStripeUrl(plan, selectedRegion, (response: any) => {
                if (response && response.success && response.checkoutUrl) {
                    // Open Stripe 
                    location.href = response.checkoutUrl;
                } else {
                    this.checkoutPlanPending.set(null);
                    this.toast.show(this.toast.getMessageErrorUnexpected());
                }
            })
        }
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }
    
}

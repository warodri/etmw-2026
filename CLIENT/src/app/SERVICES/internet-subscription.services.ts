import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetSubscriptionService extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   

    subscriptionGetConfig(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'SubscriptionGetConfig',
            lang,
            data: {
            }
        }, callback);
    }

    subscriptionGetMine(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'SubscriptionGetMine',
            lang,
            data: {
            }
        }, callback);
    }

    subscriptionGenerateStripeUrl(plan: 'Unlimited' | 'Reader' | 'Explorer', region: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'SubscriptionGenerateStripeUrl',
            lang,
            data: {
                plan,
                region
            }
        }, callback);
    }

}
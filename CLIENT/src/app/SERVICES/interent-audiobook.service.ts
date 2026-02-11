import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetAudiobookService extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   

    getVoicesByTier(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'GetVoicesByTier',
            lang,
            data: {
            }
        }, callback);
    }

    getAllCategories(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'GetAllCategories',
            lang,
            data: {
            }
        }, callback);
    }

    createAudiobookUpload(formData: FormData, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        formData.append('action', 'AudiobookAdd');
        formData.append('lang', lang);
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP_SECURE, formData, callback);
    }

    audiobookUploadCover(audiobookId: string, file: File, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const formData = new FormData();
        formData.append('action', 'AudiobookUploadCover');
        formData.append('lang', lang);
        formData.append('audiobookId', audiobookId);
        formData.append('file', file);
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP_SECURE, formData, callback);
    }

    checkAudiobookPaymentStatus(audiobookId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookCheckPaymentStatus',
            lang,
            data: {
                audiobookId
            }
        }, callback);
    }

    createStripeCheckout(audiobookId: string, currency: string, amount: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookCreateStripeCheckout',
            lang,
            data: {
                audiobookId,
                currency,
                amount
            }
        }, callback);
    }

    

}
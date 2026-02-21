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

    getVoicesByTier(locale: string | null, forceRefresh: boolean, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'GetVoicesByTier',
            lang,
            data: { locale, forceRefresh }
        }, callback);
    }    

    getAllCategories(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
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

    audiobookFindById(audiobookId: string, callback: any) {
        const query = null;
        const authorIds= null;
        const categories = null;
        const latest = true;
        const myAudiobooks = false;
        const published = null;
        const pipelineStatus = null;
        const limit = 1;
        const skip = 0
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFindById',
            lang,
            data: {
                audiobookId,
                query,
                authorIds,
                categories,
                latest,
                myAudiobooks,
                published,
                pipelineStatus,
                limit,
                skip
            }
        }, callback);
    }

    audiobookFind(
        audiobookId: string | null, 
        query: string | null, 
        authorIds: string[],
        categories: string[],
        latest: boolean,
        myAudiobooks: boolean,
        published: boolean,
        pipelineStatus: string[],
        limit: number,
        skip: number,
        callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFind',
            lang,
            data: {
                audiobookId,
                query,
                authorIds,
                categories,
                latest,
                myAudiobooks,
                published,
                pipelineStatus,
                limit,
                skip
            }
        }, callback);
    }

    audiobookGetChapterAudioIsAvailable(audiobookId: string, chapterNumber: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookGetChapterAudioIsAvailable',
            lang,
            data: {
                audiobookId,
                chapterNumber
            }
        }, callback);
    }

    audiobookGetChapterAudio(audiobookId: string, chapterNumber: number, callback: (result: ArrayBuffer | null) => void) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPostArrayBuffer(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookGetChapterAudio',
            lang,
            data: {
                audiobookId,
                chapterNumber
            }
        }, callback);
    }
    
    

}

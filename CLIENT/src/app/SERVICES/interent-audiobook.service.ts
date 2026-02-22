import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient } from '@angular/common/http';
import { InternetService } from './internet.service';

export interface AudiobookFindPayload {
    audiobookId?: string | null;
    query?: string | null;
    authorIds?: string[] | null;
    categories?: string[] | null;
    section?: 'trending' | 'for-you' | string | null;
    latest?: boolean | null;
    myAudiobooks?: boolean | null;
    published?: boolean | null;
    pipelineStatus?: string[] | null;
    limit?: number | null;
    skip?: number | null;
}

@Injectable({
    providedIn: 'root'
})
export class InternetAudiobookService extends InternetService {

    constructor(
        httpClient: HttpClient  
    ) {
        super(httpClient)  
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

    audiobookGetContineListening(callback: any) { 
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookGetContineListening',
            lang,
            data: {}
        }, callback);
    }
    
    //  FIND

    audiobookFind(payload: AudiobookFindPayload, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFind',
            lang,
            data: payload || {}
        }, callback);
    }
    
    audiobookFindById(audiobookId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFindById',
            lang,
            data: {
                audiobookId,
            }
        }, callback);
    }

    audiobookFindByQuery(
        query: string | null,
        authorIds: string[] | null,
        categories: string[] | null,
        callback: any
    ) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFindByQuery',
            lang,
            data: {
                query,
                authorIds,
                categories,
            }
        }, callback);
    }

    audiobookFindByCategory(categories: string[], callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFindByCategory',
            lang,
            data: {
                categories,
            }
        }, callback);
    }

    audiobookFindBySection(section: 'trending' | 'for-you', callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFindBySection',
            lang,
            data: {
                section,
            }
        }, callback);
    }

    audiobookFindByAuthor(authorIds: string[], callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFindByAuthor',
            lang,
            data: {
                authorIds
            }
        }, callback);
    }

    audiobookFindLatest(categories: string[] | null, authorIds: string[] | null, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AudiobookFindLatest',
            lang,
            data: {
                categories,
                authorIds,
            }
        }, callback);
    }

    

}

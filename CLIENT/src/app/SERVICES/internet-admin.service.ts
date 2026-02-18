import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetAdminService extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   
    
    
    editPromoCode(id: string, code: string, partnerName: string, partnerDescription: string, website: string, linkToCode: string, enabled: boolean, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'EditPromoCode',
            lang,
            data: {
                id,
                code,
                partnerName,
                partnerDescription,
                website,
                linkToCode,
                enabled
            }
        }, callback);
    }
    
    addPromoCode(code: string,  partnerName: string, partnerDescription: string, website: string, linkToCode: string, enabled: boolean, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'AddPromoCode',
            lang,
            data: {
                code,
                partnerName,
                partnerDescription,
                website,
                linkToCode,
                enabled
            }
        }, callback);
    }
    
    deletePromoCode(id: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'DeletePromoCode',
            lang,
            data: {
                id
            }
        }, callback);
    }

    getAdminPromoCodes(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'GetAdminPromoCodes',
            lang,
            data: {
            }
        }, callback);
    }

    audiobooksGetAdmin(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'AudiobooksGetAdmin',
            lang,
            data: {
            }
        }, callback);
    }
    
    updateAudiobookTotalPages(audiobookId: string, totalPages: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'UpdateAudiobookTotalPages',
            lang,
            data: {
                audiobookId,
                totalPages
            }
        }, callback);
    }
    
    updateAudiobookTotalChapters(audiobookId: string, totalChapters: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'UpdateAudiobookTotalChapters',
            lang,
            data: {
                audiobookId,
                totalChapters
            }
        }, callback);
    }

    adminAudiobookGetChapterAudio(audiobookId: string, chapterNumber: number, callback: (result: ArrayBuffer | null) => void) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPostArrayBuffer(this.SERVER + '/' + this.APP, {
            action: 'AdminAudiobookGetChapterAudio',
            lang,
            data: {
                audiobookId,
                chapterNumber,
                password: 'car0lina'
            }
        }, callback);
    }
    
    convertToMP3(audiobookId: string, params: any, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'ConvertToMP3',
            lang,
            data: {
                audiobookId,
                params
            }
        }, callback);
    }
    
    getStoriesByAudiobook(audiobookId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'GetStoriesByAudiobook',
            lang,
            data: {
                audiobookId,
            }
        }, callback);
    }

    updateAudiobookStory(_id: string, payload: any, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'UpdateAudiobookStory',
            lang,
            data: {
                _id,
                payload
            }
        }, callback);
    }

    


}

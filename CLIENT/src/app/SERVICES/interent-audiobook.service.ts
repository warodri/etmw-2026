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

    

}
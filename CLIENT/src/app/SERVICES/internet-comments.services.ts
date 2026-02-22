import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetDebateServices extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   

    debateAdd(audiobookId: string, authorId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebateAdd',
            lang,
            data: {
                audiobookId,
                authorId,
            }
        }, callback);
    }

    debateGetById(id: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebateGetById',
            lang,
            data: {
                id,
            }
        }, callback);
    }

}
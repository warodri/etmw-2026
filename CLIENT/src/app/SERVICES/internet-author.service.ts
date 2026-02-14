import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';
import { UserModel } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class InternetAuthorService extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   

    getLatestAuthors(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'FindAuthor',
            lang,
            data: {
                showLatest: true,
            }
        }, callback);
    }

    findAuthors(penName: string, country: string, language: string, limit: number, skip: number,  callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'FindAuthor',
            lang,
            data: {
                showLatest: false,
                penName, 
                country, 
                language, 
                limit, 
                skip
            }
        }, callback);
    }
    



}

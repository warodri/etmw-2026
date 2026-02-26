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

    //
    //  YOUR STORY
    //
    authorUpsertAlias(authorId: string | null, penName: string, bio: string, bookTaste: string[], profilePicture: File | null, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        //  Data
        const formData = new FormData()
        formData.append('action', 'AuthorUpsertAlias');
        if (authorId) formData.append('authorId', authorId);
        formData.append('lang', lang);
        formData.append('penName', penName);
        formData.append('bio', bio);
        formData.append('bookTaste', JSON.stringify(bookTaste));
        if (profilePicture) formData.append('file', profilePicture);
        //  Send
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP_SECURE, formData, callback);
    }
    authorGetAlias(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'AuthorGetAlias',
            lang,
            data: {
            }
        }, callback);
    }
    yourStoryUpsert(recordId: string | null, authorId: string, isAIGenerated: boolean, status: string, blueprint: any, totalChaptersGenerated: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'YourStoryUpsert',
            lang,
            data: {
                recordId, 
                authorId, 
                isAIGenerated, 
                status, 
                blueprint, 
                totalChaptersGenerated
            }
        }, callback);
    }
    yourStoryGet(skip: number, limit: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'YourStoryGet',
            lang,
            data: {
                skip,
                limit
            }
        }, callback);
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

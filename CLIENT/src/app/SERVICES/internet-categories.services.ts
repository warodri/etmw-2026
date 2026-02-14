import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetCategoriesServices extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
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

}
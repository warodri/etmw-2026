import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Config } from '../utils/config';
import { InternetCommon } from '../utils/internet.common';
import { LangUtils } from '../utils/lang';

@Injectable({
    providedIn: 'root'
})
export class InternetService {

    APP = Config.dev ? 'api/v1' : 'api/v1';
    APP_SECURE = Config.dev ? 'api/v1/secure' : 'api/v1/secure';
    SERVER = Config.SERVER.dev ? Config.SERVER.local : Config.SERVER.remote;
    SERVER_SOCKET = Config.dev ? Config.SOCKET_SERVER.local : Config.SOCKET_SERVER.remote;
    SERVER_SOCKET_PORT = Config.SOCKET_SERVER.port;
    internetCommon: InternetCommon | undefined;

    constructor(
        private httpClient: HttpClient
    ) {
        this.internetCommon = new InternetCommon(this.httpClient);
    }

    getAppConfig(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'GetAppConfig',
            lang,
            data: {
            }
        }, callback);
    }

    uploadFileAndReturn(file: File, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const formData = new FormData();
        formData.append('action', 'UploadFileAndReturn');
        formData.append('lang', lang);
        formData.append('file', file);
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP_SECURE, formData, callback);
    }

    getPromoCodes(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'GetPromoCodes',
            lang,
            data: {
            }
        }, callback);
    }
    validatePromoCode(promoCode: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'ValidatePromoCode',
            lang,
            data: {
                promoCode
            }
        }, callback);
    }


}

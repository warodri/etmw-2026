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

    sendContactForm(
        sector: 'website' | 'support',
        payload: {
            name: string,
            email: string,
            userType: string,
            subject: string,
            message: string,
            issueType?: string,
            platform?: string,
            device?: string,
            appVersion?: string,
            audiobookId?: string,
            chapterNumber?: string,
            paymentId?: string
        },
        callback: any
    ) {
        const lang: string = LangUtils.detectLanguage();
        const url = this.SERVER + '/' + (sector === 'support' ? this.APP_SECURE : this.APP);
        this.internetCommon?.doPost(url, {
            action: 'SendContactForm',
            lang,
            data: {
                sector,
                ...payload
            }
        }, callback);
    }

    getAppConfig(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
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

    //  BOOKMARKS
    
    bookmarkUpsert(targetId: string, targetType: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'BookmarkUpsert',
            lang,
            data: {
                targetId,
                targetType
            }
        }, callback);
    }

    bookmarkGetMine(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'BookmarkGetMine',
            lang,
            data: {
            }
        }, callback);
    }
    
    //  FOLLOW
    
    followUpsert(followingUserId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'FollowUpsert',
            lang,
            data: {
                followingUserId
            }
        }, callback);
    }

    followGetMine(userIdFollowing: string | null, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'FollowGetMine',
            lang,
            data: {
                userIdFollowing
            }
        }, callback);
    }

}

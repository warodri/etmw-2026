import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';
import { UserModel } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class InternetUserService extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   

    sendCode(email: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'SendCode',
            lang,
            data: {
                email,
            }
        }, callback);
    }

    validateCode(email: string, code: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'ValidateCode',
            lang,
            data: {
                email,
                code,
            }
        }, callback);
    }

    getMyUser(callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'GetMyUser',
            lang,
            data: {
            }
        }, callback);
    }

    getUserById(userId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'GetUserById',
            lang,
            data: {
                id: userId,
            }
        }, callback);
    }

    updateMyProfile(user: UserModel, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'UpdateMyProfile',
            lang,
            data: {
                ...user
            }
        }, callback);
    }

    updateUserStatus(forceStatus: 'connected' | 'disconnected', callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'UpdateUserStatus',
            lang,
            data: {
                forceStatus,
            }
        }, callback);
    }
 
    uploadUserProfileImage(file: File, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const form = new FormData();
        form.append('action', 'UploadUserProfileImage');
        form.append('lang', lang);
        form.append('file', file);
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP_SECURE, form, callback);
    }

    searchUsers(query: string, cityId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'SearchUsers',
            lang,
            data: {
                query,
                cityId,
            }
        }, callback);
    }
    
    getUsersByName(query: string, cityId: string, channelId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'GetUsersByName',
            lang,
            data: {
                query,
                cityId,
                channelId,
            }
        }, callback);
    }

    userFind(query: string, limit: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'UserFind',
            lang,
            data: {
                query,
                limit
            }
        }, callback);
    }

    userGetListeningHistory(audiobookId: string, chapterNumberOrCallback: number | any, callback?: any) {
        const hasChapter = typeof chapterNumberOrCallback === 'number';
        const done = hasChapter ? callback : chapterNumberOrCallback;
        const lang: string = LangUtils.detectLanguage();
        const data: any = {
            audiobookId
        };
        if (hasChapter) {
            data.chapterNumber = chapterNumberOrCallback;
        }
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'UserGetListeningHistory',
            lang,
            data
        }, done);
    }

    userSetListeningHistory(audiobookId: string, chapterNumber: number, progressPercent: number, completed: boolean, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'UserSetListeningHistory',
            lang,
            data: {
                audiobookId,
                chapterNumber,
                progressPercent,
                completed
            }
        }, callback);
    }

    userGetWork(userId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP, {
            action: 'UserGetWork',
            lang,
            data: {
                userId,
            }
        }, callback);
    }


}

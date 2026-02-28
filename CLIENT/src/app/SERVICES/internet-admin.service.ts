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
    
    convertToMP3(audiobookId: string, params: any, sampleVoiceFile: File, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const formData = new FormData();
        formData.append('action', 'ConvertToMP3');
        formData.append('lang', lang);
        formData.append('data', JSON.stringify({
            audiobookId,
            params
        }));
        formData.append('file', sampleVoiceFile);
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP, formData, callback);
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

    storyUploadNewFile(_id: string, pieceIndex: number, file: File, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const formData = new FormData();
        formData.append('action', 'StoryUploadNewFile');
        formData.append('lang', lang);
        formData.append('data', JSON.stringify({
            _id,
            pieceIndex
        }));
        formData.append('file', file);
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP, formData, callback);
    }

    storyTranslateLanguage(storyId: string, targetLanguage: string, sampleVoiceFile: File, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const formData = new FormData();
        formData.append('action', 'StoryTranslateLanguage');
        formData.append('lang', lang);
        formData.append('data', JSON.stringify({
            storyId,
            targetLanguage,
            narrationStyle: 'Essay'
        }));
        formData.append('file', sampleVoiceFile);
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP, formData, callback);
    }

}

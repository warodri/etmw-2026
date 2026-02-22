import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetDebateService extends InternetService {

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
    
    debateCountComments(audiobookId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebateCountComments',
            lang,
            data: {
                audiobookId
            }
        }, callback);
    }

    debateGetComments(audiobookId: string, skip: number, limit: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebateGetComments',
            lang,
            data: {
                audiobookId,
                skip,
                limit
            }
        }, callback);
    }
    
    debateCommentAdd(audiobookId: string, text: string, commentId: string | null, parentMessageId: string | null, file: File | null, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const formData = new FormData();
        formData.append('action', 'DebateCommentAdd');
        formData.append('lang', lang);
        formData.append('audiobookId', audiobookId);
        formData.append('text', text || '');
        if (commentId) formData.append('commentId', commentId);
        if (parentMessageId) formData.append('parentMessageId', parentMessageId);
        if (file) formData.append('file', file);                
        this.internetCommon?.doPostFormData(this.SERVER + '/' + this.APP_SECURE, formData, callback);
    }

    debateGetpopularThreads(audiobookId: string, limit: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebateGetpopularThreads',
            lang,
            data: {
                audiobookId,
                limit
            }
        }, callback);
    }

    debateGetRecentThreads(audiobookId: string, limit: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebateGetRecentThreads',
            lang,
            data: {
                audiobookId,
                limit
            }
        }, callback);
    }

    debateGeneratePodcast(audiobookId: string, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebateGeneratePodcast',
            lang,
            data: {
                audiobookId
            }
        }, callback);
    }

    debatePodcastGet(audiobookId: string, skip: number, limit: number, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'DebatePodcastGet',
            lang,
            data: {
                audiobookId,
                skip,
                limit
            }
        }, callback);
    }

}

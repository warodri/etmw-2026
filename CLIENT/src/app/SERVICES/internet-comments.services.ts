import { Injectable } from '@angular/core';
import { LangUtils } from "../utils/lang";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternetService } from './internet.service';

@Injectable({
    providedIn: 'root'
})
export class InternetCommentsServices extends InternetService {

    constructor(
        httpClient: HttpClient  // Add this
    ) {
        super(httpClient)  // Pass to parent
    }   

    commentAdd(
        targetId: string,
        targetType: 'audiobook' | 'debate' | 'author' | 'comment' | 'message',
        text: string,
        parentCommentId: string | null,
        callback: any
    ) {
        const lang: string = LangUtils.detectLanguage();
        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'CommentAdd',
            lang,
            data: {
                targetId,
                targetType,
                text,
                parentCommentId
            }
        }, callback);
    }

    commentFind(
        targetType: 'audiobook' | 'debate' | 'author' | 'comment' | 'message',
        conversationWithUserId: string | null,
        skip: number,
        limit: number,
        sortDir: 'asc' | 'desc',
        callback: any
    ) {
        const lang: string = LangUtils.detectLanguage();
        const data: any = {
            targetType,
            skip,
            limit,
            sortDir
        };
        if (conversationWithUserId) data.conversationWithUserId = conversationWithUserId;

        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'CommentFind',
            lang,
            data
        }, callback);
    }

    commentMarkRead(conversationWithUserId: string | null, messageId: string | null, callback: any) {
        const lang: string = LangUtils.detectLanguage();
        const data: any = {};
        if (conversationWithUserId) data.conversationWithUserId = conversationWithUserId;
        if (messageId) data.messageId = messageId;

        this.internetCommon?.doPost(this.SERVER + '/' + this.APP_SECURE, {
            action: 'CommentMarkRead',
            lang,
            data
        }, callback);
    }

}

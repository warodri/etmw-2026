import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { InternetCommentsServices } from '../../../SERVICES/internet-comments.services';
import { InternetUserService } from '../../../SERVICES/internet-user.service';
import { ToastService } from '../../../SERVICES/toast';
import { Config } from '../../../utils/config';
import { UserModel } from '../../../models/user';
import { LangUtils } from '../../../utils/lang';

interface MessageComment {
    _id: string;
    userId: string | UserModel;
    targetId: string;
    text?: string;
    audioUrl?: string;
    attachments?: Array<{ type?: string; url?: string }>;
    isRead?: boolean;
    createdAt: number;
}

interface InboxChannel {
    _id: string;
    userName: string;
    userProfile: string;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageType: 'text' | 'voice' | 'image';
    unreadCount: number;
    isOnline: boolean;
    isVerified: boolean;
    isTyping: boolean;
    tags: string[];
}

@Component({
    selector: 'app-screen-inbox',
    standalone: false,
    templateUrl: './screen-inbox.html',
    styleUrl: './screen-inbox.css',
})
export class ScreenInbox implements OnInit {
    language: 'en' | 'es' = 'en';

    readonly SERVER = Config.dev ? Config.SERVER.local : Config.SERVER.remote;
    readonly channels = signal<InboxChannel[]>([]);
    readonly loading = signal<boolean>(false);
    readonly activeFilter = signal<'all' | 'unread'>('all');
    readonly aiSummary = signal<string>(
        'Maria sent you a first message about collaboration opportunities. Tony is asking about your book "Away" and wants a signed copy. Romain responded to your question about pricing.'
    );
    readonly aiSummaryLoading = signal<boolean>(false);
    readonly aiSummaryMeta = signal<string>('');

    hasMore = false;
    private myUserId = '';

    constructor(
        private router: Router,
        private iComments: InternetCommentsServices,
        private iUser: InternetUserService,
        private toast: ToastService
    ) { }

    ngOnInit(): void {
        this.language = LangUtils.detectLanguage();
        this.aiSummary.set(
            this.tr(
                'Maria sent you a first message about collaboration opportunities. Tony is asking about your book "Away" and wants a signed copy. Romain responded to your question about pricing.',
                'Maria te envió un primer mensaje sobre oportunidades de colaboración. Tony está preguntando por tu libro "Away" y quiere una copia firmada. Romain respondió a tu pregunta sobre precios.'
            )
        );
        this.iUser.getMyUser((response: any) => {
            if (response?.success && response.user?._id) {
                this.myUserId = String(response.user._id);
                this.loadThreads();
                this.refreshAiSummary(false);
            } else {
                this.channels.set([]);
            }
        });
    }

    goHome() {
        this.router.navigate(['app']);
    }

    gotoNewMessage() {
        this.router.navigate(['app/inbox/new-message']);
    }

    openChannel(item: InboxChannel) {
        if (!item?._id) return;
        this.iComments.commentMarkRead(item._id, null, () => {
            this.router.navigate(['app/inbox/new-message', item._id]);
        });
    }

    loadMore() {
        this.loadThreads();
    }

    markAllRead() {
        this.iComments.commentMarkRead(null, null, (response: any) => {
            if (response?.success) {
                this.loadThreads();
                this.refreshAiSummary(false);
                this.toast.show(this.tr('All messages marked as read', 'Todos los mensajes marcados como leídos'));
                return;
            }
            this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
        });
    }

    setFilter(filter: 'all' | 'unread') {
        this.activeFilter.set(filter);
    }

    getVisibleChannels(): InboxChannel[] {
        const items = this.channels();
        if (this.activeFilter() === 'unread') {
            return items.filter((i) => Number(i.unreadCount || 0) > 0);
        }
        return items;
    }

    getUnreadConversationsCount(): number {
        return this.channels().filter((i) => Number(i.unreadCount || 0) > 0).length;
    }

    markThreadAsRead(item: InboxChannel, event: Event) {
        event.stopPropagation();
        if (!item?._id || !item.unreadCount) return;
        this.iComments.commentMarkRead(item._id, null, (response: any) => {
            if (response?.success) {
                this.loadThreads();
                this.refreshAiSummary(false);
            } else {
                this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
            }
        });
    }

    refreshAiSummary(forceRefresh: boolean) {
        this.aiSummaryLoading.set(true);
        this.iComments.commentAiSummary(forceRefresh, (response: any) => {
            this.aiSummaryLoading.set(false);

            if (response?.success) {
                const summaryText = String(response.summary || '').trim();
                if (summaryText) {
                    this.aiSummary.set(summaryText);
                }
                const remaining = Number(response.remainingToday ?? 0);
                this.aiSummaryMeta.set(`${this.tr('AI summaries left today', 'Resúmenes IA restantes hoy')}: ${remaining}`);
                return;
            }

            if (response?.limited) {
                const fallback = String(response.summary || '').trim();
                if (fallback) {
                    this.aiSummary.set(fallback);
                }
                this.aiSummaryMeta.set(this.tr('Daily AI summary limit reached (5/5).', 'Límite diario de resumen IA alcanzado (5/5).'));
                return;
            }

            this.aiSummaryMeta.set('');
        });
    }

    deleteThread(item: InboxChannel, event: Event) {
        event.stopPropagation();
        const next = this.channels().filter((i) => i._id !== item._id);
        this.channels.set(next);
        this.toast.show(this.tr('Thread hidden from list', 'Hilo oculto de la lista'));
    }

    toggleStar(_item: InboxChannel, event: Event) {
        event.stopPropagation();
        this.toast.show(this.tr('Starred list coming soon', 'La lista de destacados estará disponible pronto'));
    }

    archiveThread(_item: InboxChannel, event: Event) {
        event.stopPropagation();
        this.toast.show(this.tr('Archive coming soon', 'Archivo disponible pronto'));
    }

    private loadThreads() {
        this.loading.set(true);
        this.iComments.commentFind('message', null, 0, 400, 'desc', (response: any) => {
            this.loading.set(false);
            if (!response?.success || !Array.isArray(response.comments)) {
                this.channels.set([]);
                return;
            }

            const comments = response.comments as MessageComment[];
            const map = this.groupByCounterpart(comments);
            const counterpartIds = Array.from(map.keys());

            this.loadUsers(counterpartIds, (usersMap) => {
                const items: InboxChannel[] = [];
                for (const [counterpartId, group] of map.entries()) {
                    const latest = group.latest;
                    const user = usersMap.get(counterpartId);
                    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
                    items.push({
                        _id: counterpartId,
                        userName: fullName || user?.email || this.tr('Unknown user', 'Usuario desconocido'),
                        userProfile: this.resolveProfile(user),
                        lastMessage: this.getLastMessageText(latest),
                        lastMessageTime: this.formatRelativeTime(latest.createdAt),
                        lastMessageType: this.getLastMessageType(latest),
                        unreadCount: group.unreadCount,
                        isOnline: !!user?.connected,
                        isVerified: false,
                        isTyping: false,
                        tags: []
                    });
                }

                items.sort((a, b) => {
                    const aMsg = map.get(a._id)?.latest;
                    const bMsg = map.get(b._id)?.latest;
                    return Number(bMsg?.createdAt || 0) - Number(aMsg?.createdAt || 0);
                });

                this.channels.set(items);
                this.hasMore = false;
            });
        });
    }

    private groupByCounterpart(comments: MessageComment[]): Map<string, { latest: MessageComment; unreadCount: number }> {
        const map = new Map<string, { latest: MessageComment; unreadCount: number }>();
        for (const msg of comments) {
            const senderId = this.getUserId(msg.userId);
            const receiverId = String(msg.targetId || '');
            const counterpartId = senderId === this.myUserId ? receiverId : senderId;
            if (!counterpartId) continue;

            const current = map.get(counterpartId) || { latest: msg, unreadCount: 0 };
            if (Number(msg.createdAt || 0) > Number(current.latest?.createdAt || 0)) {
                current.latest = msg;
            }

            const isIncoming = receiverId === this.myUserId;
            const isUnread = !!isIncoming && !msg.isRead;
            if (isUnread) {
                current.unreadCount += 1;
            }

            map.set(counterpartId, current);
        }
        return map;
    }

    private loadUsers(userIds: string[], callback: (usersMap: Map<string, UserModel>) => void) {
        const ids = Array.from(new Set(userIds.filter(Boolean)));
        if (ids.length === 0) {
            callback(new Map());
            return;
        }

        let pending = ids.length;
        const usersMap = new Map<string, UserModel>();

        ids.forEach((id) => {
            this.iUser.getUserById(id, (response: any) => {
                if (response?.success && response.user?._id) {
                    usersMap.set(String(response.user._id), response.user as UserModel);
                }
                pending -= 1;
                if (pending === 0) {
                    callback(usersMap);
                }
            });
        });
    }

    private getUserId(value: string | UserModel): string {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return String(value._id || '');
    }

    private resolveProfile(user?: UserModel): string {
        const file = String(user?.profilePicture || '').trim();
        if (!file) return 'https://i.pravatar.cc/150?img=1';
        if (file.startsWith('http://') || file.startsWith('https://')) return file;
        return `${this.SERVER}/file?id=${file}`;
    }

    private getLastMessageType(item: MessageComment): 'text' | 'voice' | 'image' {
        if (item?.audioUrl) return 'voice';
        const firstAttachmentType = String(item?.attachments?.[0]?.type || '').toLowerCase();
        if (firstAttachmentType === 'image') return 'image';
        return 'text';
    }

    private getLastMessageText(item: MessageComment): string {
        if (item?.audioUrl) return this.tr('Sent a voice message', 'Envió un mensaje de voz');
        const firstAttachmentType = String(item?.attachments?.[0]?.type || '').toLowerCase();
        if (firstAttachmentType === 'image') return this.tr('Sent an image', 'Envió una imagen');
        return String(item?.text || this.tr('New message', 'Nuevo mensaje'));
    }

    private formatRelativeTime(timestamp: number): string {
        const ts = Number(timestamp || 0);
        if (!ts) return '';
        const diff = Date.now() - ts;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        if (diff < minute) return this.tr('now', 'ahora');
        if (diff < hour) return `${Math.floor(diff / minute)}${this.tr('m ago', 'm atrás')}`;
        if (diff < day) return `${Math.floor(diff / hour)}${this.tr('h ago', 'h atrás')}`;
        if (diff < day * 2) return this.tr('Yesterday', 'Ayer');
        return `${Math.floor(diff / day)} ${this.tr('days ago', 'días atrás')}`;
    }

    tr(enText: string, esText: string) {
        return this.language === 'es' ? esText : enText;
    }
}

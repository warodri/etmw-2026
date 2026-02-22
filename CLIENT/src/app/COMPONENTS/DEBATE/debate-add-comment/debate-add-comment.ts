import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { InternetDebateService } from '../../../SERVICES/internet-debate.services';

@Component({
    selector: 'app-debate-add-comment',
    standalone: false,
    templateUrl: './debate-add-comment.html',
    styleUrl: './debate-add-comment.css',
})
export class DebateAddComment implements OnDestroy {
    @Input() audiobookId: string | null = null;
    @Input() commentId: string | null = null;
    @Input() parentMessageId: string | null = null;
    @Input() replyToLabel: string | null = null;
    @Output() commentSaved = new EventEmitter<any>();
    @Output() replyCancelled = new EventEmitter<void>();
    @ViewChild('attachmentInput') attachmentInput?: ElementRef<HTMLInputElement>;

    // Input state
    newCommentText = '';
    isRecording = false;
    recordingDuration = '0:00';
    mediaError = '';
    private recordingInterval: any;
    private recordingSeconds = 0;
    private mediaRecorder: MediaRecorder | null = null;
    private mediaStream: MediaStream | null = null;
    private recordedChunks: Blob[] = [];

    recordedAudioFile: File | null = null;
    recordedAudioUrl = '';

    attachedFile: File | null = null;
    attachedFileUrl = '';
    attachedFileType: 'image' | 'video' | 'other' | null = null;

    submitting = false;

    constructor(
        private iDebate: InternetDebateService
    ) {}
    
    ngOnDestroy() {
        this.stopRecording();
        this.cleanupObjectUrls();
    }

    // Input actions
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    async startRecording() {
        this.mediaError = '';
        this.removeAttachment();
        this.removeRecordedAudio();
        this.isRecording = true;
        this.recordingSeconds = 0;
        this.recordedChunks = [];
        this.recordingInterval = setInterval(() => {
            this.recordingSeconds++;
            const minutes = Math.floor(this.recordingSeconds / 60);
            const seconds = this.recordingSeconds % 60;
            this.recordingDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            this.mediaRecorder.onstop = () => this.buildAudioFileFromChunks();
            this.mediaRecorder.start();
        } catch (err) {
            this.mediaError = 'Microphone access was denied or unavailable.';
            this.stopRecording();
        }
    }

    stopRecording() {
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
            this.recordingInterval = null;
        }
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
            this.mediaStream = null;
        }
        this.mediaRecorder = null;
        this.isRecording = false;
        this.recordingSeconds = 0;
        this.recordingDuration = '0:00';
    }

    attachFile() {
        this.attachmentInput?.nativeElement?.click();
    }

    onAttachmentSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input?.files && input.files[0] ? input.files[0] : null;
        this.removeRecordedAudio();
        this.removeAttachment();
        if (!file) return;

        this.attachedFile = file;
        if (file.type.startsWith('image/')) {
            this.attachedFileType = 'image';
            this.attachedFileUrl = URL.createObjectURL(file);
        } else if (file.type.startsWith('video/')) {
            this.attachedFileType = 'video';
            this.attachedFileUrl = URL.createObjectURL(file);
        } else {
            this.attachedFileType = 'other';
            this.attachedFileUrl = '';
        }
    }

    removeAttachment() {
        if (this.attachedFileUrl) {
            URL.revokeObjectURL(this.attachedFileUrl);
        }
        this.attachedFile = null;
        this.attachedFileUrl = '';
        this.attachedFileType = null;
        if (this.attachmentInput?.nativeElement) {
            this.attachmentInput.nativeElement.value = '';
        }
    }

    removeRecordedAudio() {
        if (this.recordedAudioUrl) {
            URL.revokeObjectURL(this.recordedAudioUrl);
        }
        this.recordedAudioFile = null;
        this.recordedAudioUrl = '';
    }

    canSend(): boolean {
        if (this.isRecording) return false;
        return this.newCommentText.trim().length > 0 || !!this.recordedAudioFile || !!this.attachedFile;
    }

    sendComment() {
        if (!this.canSend() || this.submitting) return;
        const audiobookId = this.audiobookId;
        if (!audiobookId) {
            this.mediaError = 'No audiobook selected.';
            return;
        }
        const text = this.newCommentText.trim();
        const fileToUpload = this.recordedAudioFile || this.attachedFile || null;
        this.submitting = true;
        this.mediaError = '';
        this.iDebate.debateCommentAdd(
            audiobookId,
            text,
            this.commentId,
            this.parentMessageId,
            fileToUpload,
            (response: any) => {
                this.submitting = false;
                if (response && response.success) {
                    this.newCommentText = '';
                    this.removeRecordedAudio();
                    this.removeAttachment();
                    this.commentSaved.emit(response);
                    if (this.parentMessageId) {
                        this.replyCancelled.emit();
                    }
                    return;
                }
                this.mediaError = response?.message || 'Unable to post comment.';
            }
        );
    }

    cancelReply() {
        this.replyCancelled.emit();
    }

    onTextareaInput(textarea: HTMLTextAreaElement) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
    }

    formatFileSize(bytes: number): string {
        if (!bytes || bytes <= 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let idx = 0;
        while (value >= 1024 && idx < units.length - 1) {
            value /= 1024;
            idx++;
        }
        return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
    }

    private buildAudioFileFromChunks() {
        if (!this.recordedChunks.length) return;
        const mimeType = this.recordedChunks[0].type || 'audio/webm';
        const ext = mimeType.includes('ogg') ? 'ogg' : (mimeType.includes('mp4') ? 'm4a' : 'webm');
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.recordedAudioFile = new File([blob], `debate-voice-${Date.now()}.${ext}`, { type: mimeType });
        if (this.recordedAudioUrl) {
            URL.revokeObjectURL(this.recordedAudioUrl);
        }
        this.recordedAudioUrl = URL.createObjectURL(blob);
        this.recordedChunks = [];
    }

    private cleanupObjectUrls() {
        if (this.recordedAudioUrl) URL.revokeObjectURL(this.recordedAudioUrl);
        if (this.attachedFileUrl) URL.revokeObjectURL(this.attachedFileUrl);
    }

}

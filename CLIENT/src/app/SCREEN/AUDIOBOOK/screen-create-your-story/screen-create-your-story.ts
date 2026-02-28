import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InternetAuthorService } from '../../../SERVICES/internet-author.service';
import { InternetAudiobookService } from '../../../SERVICES/interent-audiobook.service';
import { ToastService } from '../../../SERVICES/toast';
import { UtilsService } from '../../../utils/utils-service';
import { Config } from '../../../utils/config';
import { ProcessedVoice } from '../../../models/voices';
import { AVAILABLE_LANGUAGES } from '../../../DATA/country-list';

type PipelineStatus = 'processing' | 'generating' | 'ready';
type ServerStoryStatus = 'draft' | 'publishing' | 'published' | 'archived';

type StoryChapter = {
    chapter: number;
    status: PipelineStatus;
    title?: string;
    summary?: string;
    content?: string;
    regenerationInstructions?: string;
    coverUrl?: string;
    audioUrl?: string;
    audioDurationSec?: number;
    published: boolean;
};

type AuthorAlias = {
    id: string;
    name: string;
    bio: string;
    profilePictureUrl: string;
    profilePictureFile: File | null;
    tasteTags: string[];
};

type StoryRequest = {
    id: string;
    audiobookId?: string;
    prompt: string;
    status: PipelineStatus;
    serverStatus: ServerStoryStatus;
    createdAt: number;
    maxChapters: number;
    authorAliasId: string;
    authorAliasName: string;
    authorAliasPicture: string;
    totalChaptersGenerated: number;
    voiceLanguage?: string;
    chapterLanguage?: string;
    voiceId?: string;
    voiceName?: string;
    voiceUrl?: string;
    blueprint: any;
    chapters: StoryChapter[];
};

@Component({
    selector: 'app-screen-create-your-story',
    standalone: false,
    templateUrl: './screen-create-your-story.html',
    styleUrl: './screen-create-your-story.css',
})
export class ScreenCreateYourStory implements OnInit, OnDestroy {

    authorAliases = signal<AuthorAlias[]>([]);
    selectedAuthorAliasId = signal<string>('');
    editingAuthorId = signal<string | null>(null);

    authorForm = signal({
        name: '',
        bio: '',
        profilePicturePreview: '',
        profilePictureFile: null as File | null,
        tasteTags: [] as string[],
    });
    authorTasteInput = signal('');

    storyPrompt = signal('');
    submissions = signal<StoryRequest[]>([]);

    loadingAliases = signal(false);
    loadingStories = signal(false);
    savingAlias = signal(false);
    sendingStory = signal(false);

    expandedBioIds = signal<Record<string, boolean>>({});
    expandedTasteIds = signal<Record<string, boolean>>({});
    chapterRegenerateInput = signal<Record<string, string>>({});
    chapterAudioConverting = signal<Record<string, boolean>>({});
    chapterAudioInterrupted = signal<Record<string, boolean>>({});
    aliasPanelExpanded = signal(true);
    private aliasPanelInit = false;

    private activeTimers: number[] = [];

    //  Cover file for the audiobook
    coverFile: File | null = null;

    //  Language Selected for the voice
    voiceLanguage = '';
    chapterLanguage = 'en';
    availableLanguages = AVAILABLE_LANGUAGES;
    availableVoices = signal<ProcessedVoice[]>([]);
    loadingVoices = signal(false);
    selectedVoiceId = signal('');
    showAllVoices = signal(false);
    playingVoiceId = signal('');
    private voicePreviewAudio?: HTMLAudioElement;

    constructor(
        private iAuthor: InternetAuthorService,
        private iAudiobook: InternetAudiobookService,
        private toast: ToastService,
        private utils: UtilsService,
    ) {}

    ngOnInit(): void {
        this.loadAliases(() => {
            this.loadStories();
        });
    }

    ngOnDestroy(): void {
        this.clearTimers();
        this.revokeAuthorPreviewUrl();
        this.stopVoicePreview();
    }

    onCoverSelected(file: File) {
        if (file) {
            this.coverFile = file;
        }
    }

    onVoiceLanguageSelected(language: string) {
        this.voiceLanguage = String(language || '').trim();
        this.selectedVoiceId.set('');
        this.availableVoices.set([]);
        this.showAllVoices.set(false);
        this.stopVoicePreview();
        if (this.voiceLanguage) {
            this.loadVoicesByLanguage(this.voiceLanguage);
        }
    }

    onChapterLanguageSelected(language: string): void {
        const normalized = String(language || '').trim();
        this.chapterLanguage = normalized || 'en';
    }

    onAuthorNameInput(value: string): void {
        this.authorForm.update(form => ({ ...form, name: value }));
    }

    onAuthorBioInput(value: string): void {
        this.authorForm.update(form => ({ ...form, bio: value }));
    }

    onAuthorTasteInput(value: string): void {
        this.authorTasteInput.set(value);
    }

    onStoryPromptInput(value: string): void {
        this.storyPrompt.set(value);
    }

    onAuthorTasteKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            this.addAuthorTasteFromInput();
        }
    }

    addAuthorTasteFromInput(): void {
        const value = this.normalizeTag(this.authorTasteInput());
        if (!value) {
            this.authorTasteInput.set('');
            return;
        }

        const alreadyExists = this.authorForm().tasteTags.some(tag => tag.toLowerCase() === value.toLowerCase());
        if (!alreadyExists) {
            this.authorForm.update(form => ({
                ...form,
                tasteTags: [...form.tasteTags, value]
            }));
        }

        this.authorTasteInput.set('');
    }

    removeAuthorTasteTag(tag: string): void {
        this.authorForm.update(form => ({
            ...form,
            tasteTags: form.tasteTags.filter(item => item !== tag)
        }));
    }

    onAuthorPictureSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0] || null;
        if (!file) {
            return;
        }

        this.revokeAuthorPreviewUrl();
        this.authorForm.update(form => ({
            ...form,
            profilePictureFile: file,
            profilePicturePreview: URL.createObjectURL(file),
        }));
    }

    saveAuthorAlias(): void {
        const form = this.authorForm();
        const name = this.normalizeTag(form.name);
        const bio = this.normalizeTag(form.bio);
        const tasteTags = form.tasteTags
            .map(item => this.normalizeTag(item))
            .filter(Boolean);

        if (!name || !bio || tasteTags.length === 0) {
            return;
        }

        const requiresPicture = !this.editingAuthorId() && !form.profilePictureFile;
        if (requiresPicture) {
            this.toast.show('Profile picture is required to create an alias.');
            return;
        }

        this.savingAlias.set(true);

        const desiredSelectionId = this.editingAuthorId();
        const desiredSelectionName = name.toLowerCase();

        this.iAuthor.authorUpsertAlias(
            this.editingAuthorId(),
            name,
            bio,
            tasteTags,
            form.profilePictureFile,
            (response: any) => {
                this.savingAlias.set(false);

                if (!response?.success) {
                    this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
                    return;
                }

                this.resetAuthorForm();

                this.loadAliases(() => {
                    if (desiredSelectionId) {
                        this.selectedAuthorAliasId.set(desiredSelectionId);
                    } else {
                        const found = this.authorAliases().find(item => item.name.toLowerCase() === desiredSelectionName);
                        if (found) {
                            this.selectedAuthorAliasId.set(found.id);
                        }
                    }
                    if (this.authorAliases().length > 0) {
                        this.aliasPanelExpanded.set(false);
                    }
                    this.toast.show('Alias saved successfully.');
                });
            }
        );
    }

    editAuthorAlias(authorId: string): void {
        const author = this.authorAliases().find(item => item.id === authorId);
        if (!author) {
            return;
        }

        this.editingAuthorId.set(author.id);
        this.revokeAuthorPreviewUrl();
        this.authorForm.set({
            name: author.name,
            bio: author.bio,
            profilePicturePreview: author.profilePictureUrl,
            profilePictureFile: null,
            tasteTags: [...author.tasteTags],
        });
        this.authorTasteInput.set('');
    }

    assignAuthorAlias(authorId: string): void {
        const author = this.authorAliases().find(item => item.id === authorId);
        if (!author) {
            return;
        }
        this.selectedAuthorAliasId.set(author.id);
    }

    cancelAuthorEdit(): void {
        this.resetAuthorForm();
    }

    openAliasPanel(): void {
        this.aliasPanelExpanded.set(true);
    }

    closeAliasPanel(): void {
        if (this.authorAliases().length > 0) {
            this.aliasPanelExpanded.set(false);
        }
    }

    startNewAlias(): void {
        this.resetAuthorForm();
        this.aliasPanelExpanded.set(true);
    }

    getSelectedAuthorAlias(): AuthorAlias | null {
        return this.authorAliases().find(item => item.id === this.selectedAuthorAliasId()) || null;
    }

    canSaveAuthorAlias(): boolean {
        const form = this.authorForm();
        const hasRequiredText = !!this.normalizeTag(form.name)
            && !!this.normalizeTag(form.bio)
            && form.tasteTags.length > 0;

        if (!hasRequiredText) {
            return false;
        }

        if (this.editingAuthorId()) {
            return true;
        }

        return !!form.profilePictureFile;
    }

    hasDirtyAuthorForm(): boolean {
        const form = this.authorForm();
        return !!this.editingAuthorId()
            || !!form.name
            || !!form.bio
            || !!form.profilePicturePreview
            || form.tasteTags.length > 0;
    }

    isBioExpandable(author: AuthorAlias): boolean {
        return this.normalizeTag(author.bio).length > 160;
    }

    isBioExpanded(authorId: string): boolean {
        return !!this.expandedBioIds()[authorId];
    }

    toggleBioExpanded(authorId: string): void {
        this.expandedBioIds.update(state => ({ ...state, [authorId]: !state[authorId] }));
    }

    getAuthorBioPreview(author: AuthorAlias): string {
        const bio = String(author.bio || '');
        if (!this.isBioExpandable(author) || this.isBioExpanded(author.id)) {
            return bio;
        }
        return bio.slice(0, 160).trimEnd() + '...';
    }

    isTasteExpandable(author: AuthorAlias): boolean {
        return author.tasteTags.length > 2;
    }

    isTasteExpanded(authorId: string): boolean {
        return !!this.expandedTasteIds()[authorId];
    }

    toggleTasteExpanded(authorId: string): void {
        this.expandedTasteIds.update(state => ({ ...state, [authorId]: !state[authorId] }));
    }

    getVisibleTasteTags(author: AuthorAlias): string[] {
        if (this.isTasteExpanded(author.id)) {
            return author.tasteTags;
        }
        return author.tasteTags.slice(0, 2);
    }

    submitStoryRequest(): void {
        const prompt = this.storyPrompt().trim();
        const selectedAuthor = this.getSelectedAuthorAlias();

        if (!prompt || !selectedAuthor) {
            return;
        }
        if (!this.voiceLanguage) {
            this.toast.show('Please select a voice language.');
            return;
        }
        if (!this.chapterLanguage) {
            this.toast.show('Please select a chapter language.');
            return;
        }
        if (!this.coverFile) {
            this.toast.show('Please select a cover image.');
            return;
        }

        this.sendingStory.set(true);

        const blueprint = this.buildBlueprint(prompt, selectedAuthor);

        this.iAuthor.yourStoryUpsert(
            null,
            selectedAuthor.id,
            true,
            'draft',
            blueprint,
            0,
            this.coverFile,
            this.voiceLanguage,
            this.chapterLanguage,
            (response: any) => {
                this.sendingStory.set(false);

                if (!response?.success) {
                    this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
                    return;
                }

                const story = response.story || null;
                if (!story?._id) {
                    this.loadStories();
                } else {
                    const request = this.mapServerStoryToRequest(story);
                    this.submissions.update(list => [request, ...list]);
                    this.scheduleChapterPipeline(request.id, 1);
                }

                this.storyPrompt.set('');
                this.coverFile = null;
            }
        );
    }

    canSubmitStoryRequest(): boolean {
        return !!this.storyPrompt().trim()
            && !!this.selectedAuthorAliasId()
            && !!this.voiceLanguage
            && !!this.chapterLanguage
            && !!this.coverFile
            && !this.sendingStory();
    }

    publishChapter(requestId: string, chapterNumber: number): void {
        const request = this.submissions().find(item => item.id === requestId);
        if (!request) {
            return;
        }

        const chapter = request.chapters.find(item => item.chapter === chapterNumber);
        if (!chapter || chapter.status !== 'ready' || chapter.published) {
            return;
        }
        if (!chapter.audioUrl) {
            this.toast.show('Generate chapter audio before publishing.');
            return;
        }

        chapter.published = true;

        if (chapterNumber > request.totalChaptersGenerated) {
            request.totalChaptersGenerated = chapterNumber;
            this.persistStory(request, 'published', request.totalChaptersGenerated);
        }

        this.queueNextChapter(request, chapterNumber);
    }

    private queueNextChapter(request: StoryRequest, chapterNumber: number): void {
        const hasNextChapter = chapterNumber < request.maxChapters;
        if (!hasNextChapter) {
            return;
        }

        const nextChapterNumber = chapterNumber + 1;
        const nextExists = request.chapters.some(item => item.chapter === nextChapterNumber);
        if (!nextExists) {
            request.chapters = [
                ...request.chapters,
                {
                    chapter: nextChapterNumber,
                    status: 'processing',
                    published: false,
                },
            ];
            this.persistStory(request, 'publishing', request.totalChaptersGenerated);
            this.scheduleChapterPipeline(request.id, nextChapterNumber);
        }
    }

    canPublish(request: StoryRequest, chapter: StoryChapter): boolean {
        if (chapter.status !== 'ready' || chapter.published) {
            return false;
        }
        if (!chapter.audioUrl) {
            return false;
        }

        if (chapter.chapter === 1) {
            return true;
        }

        const prev = request.chapters.find(item => item.chapter === chapter.chapter - 1);
        return !!prev && prev.published;
    }

    canGenerateNextChapter(request: StoryRequest, chapter: StoryChapter): boolean {
        if (chapter.status !== 'ready') {
            return false;
        }
        if (!chapter.audioUrl) {
            return false;
        }
        if (chapter.chapter >= request.maxChapters) {
            return false;
        }
        const nextChapterNumber = chapter.chapter + 1;
        const nextExists = request.chapters.some(item => item.chapter === nextChapterNumber);
        if (nextExists) {
            return false;
        }

        if (chapter.published) {
            return true;
        }

        if (chapter.chapter === 1) {
            return true;
        }

        const prev = request.chapters.find(item => item.chapter === chapter.chapter - 1);
        return !!prev && prev.published;
    }

    generateNextChapter(requestId: string, chapterNumber: number): void {
        const request = this.submissions().find(item => item.id === requestId);
        if (!request) {
            return;
        }
        const chapter = request.chapters.find(item => item.chapter === chapterNumber);
        if (!chapter) {
            return;
        }
        if (!this.canGenerateNextChapter(request, chapter)) {
            this.toast.show('Complete this chapter (including audio) before generating the next one.');
            return;
        }
        if (chapter.published) {
            this.queueNextChapter(request, chapterNumber);
            return;
        }
        this.publishChapter(requestId, chapterNumber);
    }

    getChapterRegenerateKey(requestId: string, chapterNumber: number): string {
        return `${requestId}:${chapterNumber}`;
    }

    getChapterRegenerateInput(requestId: string, chapterNumber: number): string {
        const key = this.getChapterRegenerateKey(requestId, chapterNumber);
        const localValue = this.chapterRegenerateInput()[key];
        if (typeof localValue === 'string' && localValue.length > 0) {
            return localValue;
        }

        const request = this.submissions().find(item => item.id === requestId);
        const chapter = request?.chapters.find(item => item.chapter === chapterNumber);
        return String(chapter?.regenerationInstructions || '');
    }

    onChapterRegenerateInput(requestId: string, chapterNumber: number, value: string): void {
        const key = this.getChapterRegenerateKey(requestId, chapterNumber);
        this.chapterRegenerateInput.update(state => ({ ...state, [key]: value }));
    }

    regenerateChapter(requestId: string, chapterNumber: number): void {
        const request = this.submissions().find(item => item.id === requestId);
        if (!request || !requestId || requestId.startsWith('local_story_')) {
            return;
        }
        const chapter = request.chapters.find(item => item.chapter === chapterNumber);
        if (chapter?.audioUrl) {
            this.toast.show('Delete chapter audio first before regenerating text.');
            return;
        }

        const key = this.getChapterRegenerateKey(requestId, chapterNumber);
        const regenerationInstructions = (this.chapterRegenerateInput()[key] || '').trim();

        this.updateChapterStatus(requestId, chapterNumber, 'generating');

        this.iAuthor.yourStoryGenerateChapter(
            requestId,
            chapterNumber,
            regenerationInstructions || null,
            (response: any) => {
                if (!response?.success) {
                    this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
                    this.updateChapterStatus(requestId, chapterNumber, 'ready');
                    return;
                }

                const generatedChapter = response?.chapter || {};
                const generatedChapterNumber = Math.max(1, Number(generatedChapter?.chapterNumber || chapterNumber));

                this.submissions.update(list => list.map(item => {
                    if (item.id !== requestId) {
                        return item;
                    }

                    const chapters = item.chapters.map(ch => {
                        if (ch.chapter !== generatedChapterNumber) {
                            return ch;
                        }
                        const updatedChapter: StoryChapter = {
                            ...ch,
                            status: 'ready',
                            title: String(generatedChapter?.title || ch.title || `Chapter ${generatedChapterNumber}`),
                            summary: String(generatedChapter?.summary || ch.summary || ''),
                            content: String(generatedChapter?.content || ch.content || ''),
                            regenerationInstructions: String(generatedChapter?.regenerationInstructions || regenerationInstructions || ''),
                            coverUrl: this.generateCoverSvg(item.prompt, generatedChapterNumber),
                        };
                        return updatedChapter;
                    });

                    return {
                        ...item,
                        blueprint: response?.story?.blueprint || item.blueprint,
                        chapters,
                        status: this.getRequestStatus(chapters),
                    };
                }));

                this.chapterRegenerateInput.update(state => ({
                    ...state,
                    [key]: String(generatedChapter?.regenerationInstructions || regenerationInstructions || '')
                }));
            }
        );
    }

    getStatusLabel(status: PipelineStatus): string {
        if (status === 'processing') return 'Processing';
        if (status === 'generating') return 'Generating';
        return 'Ready';
    }

    formatDateTime(epoch: number): string {
        return new Date(epoch).toLocaleString();
    }

    getBlueprintCharacters(request: StoryRequest): string[] {
        const characters = request?.blueprint?.characters;
        if (!Array.isArray(characters)) {
            return [];
        }

        return characters
            .map((item: any) => {
                if (typeof item === 'string') return item.trim();
                if (item && typeof item === 'object') return String(item.name || '').trim();
                return '';
            })
            .filter((name: string) => !!name);
    }

    hasBlueprintContext(request: StoryRequest): boolean {
        const blueprint = request?.blueprint || {};
        const hasConflict = !!String(blueprint.mainConflict || '').trim();
        const hasArc = !!String(blueprint.longTermArc || '').trim();
        const hasRules = !!String(blueprint.worldRules || '').trim();
        const hasCharacters = this.getBlueprintCharacters(request).length > 0;
        return hasConflict || hasArc || hasRules || hasCharacters;
    }

    private loadAliases(onDone?: () => void): void {
        this.loadingAliases.set(true);

        this.iAuthor.authorGetAlias((response: any) => {
            this.loadingAliases.set(false);

            if (!response?.success) {
                this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
                onDone?.();
                return;
            }

            const previousSelection = this.selectedAuthorAliasId();
            const aliases = Array.isArray(response.alias)
                ? response.alias.map((item: any) => this.mapServerAlias(item))
                : [];

            this.authorAliases.set(aliases);

            if (previousSelection && aliases.some((item: AuthorAlias) => item.id === previousSelection)) {
                this.selectedAuthorAliasId.set(previousSelection);
            } else {
                this.selectedAuthorAliasId.set(aliases[0]?.id || '');
            }

            if (!this.aliasPanelInit) {
                this.aliasPanelExpanded.set(aliases.length === 0);
                this.aliasPanelInit = true;
            } else if (aliases.length === 0) {
                this.aliasPanelExpanded.set(true);
            }

            onDone?.();
        });
    }

    private loadStories(): void {
        this.loadingStories.set(true);

        this.iAuthor.yourStoryGet(0, 50, (response: any) => {
            this.loadingStories.set(false);

            if (!response?.success) {
                this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
                return;
            }

            const stories = Array.isArray(response.stories)
                ? response.stories.map((item: any) => this.mapServerStoryToRequest(item))
                : [];

            this.submissions.set(stories);
            if (!this.voiceLanguage) {
                const preferredLanguage = String(stories.find((item: StoryRequest) => !!String(item.voiceLanguage || '').trim())?.voiceLanguage || '').trim();
                if (preferredLanguage) {
                    this.voiceLanguage = preferredLanguage;
                    this.loadVoicesByLanguage(preferredLanguage);
                }
            }
            if (!this.chapterLanguage) {
                const preferredChapterLanguage = String(stories.find((item: StoryRequest) => !!String(item.chapterLanguage || '').trim())?.chapterLanguage || '').trim();
                this.chapterLanguage = preferredChapterLanguage || 'en';
            }
            this.hydrateStoryChapters(stories);
        });
    }

    private hydrateStoryChapters(stories: StoryRequest[]): void {
        for (const story of stories) {
            if (!story.id || story.id.startsWith('local_story_')) {
                continue;
            }

            this.iAuthor.yourStoryChapterGet(story.id, (response: any) => {
                if (!response?.success) {
                    return;
                }

                const serverChapters = Array.isArray(response.chapters) ? response.chapters : [];
                if (serverChapters.length === 0) {
                    return;
                }

                this.submissions.update(list => list.map(request => {
                    if (request.id !== story.id) {
                        return request;
                    }

                    const chaptersByNumber = new Map<number, StoryChapter>();
                    for (const chapter of request.chapters) {
                        chaptersByNumber.set(Number(chapter.chapter), chapter);
                    }

                    for (const serverChapter of serverChapters) {
                        const chapterNumber = Number(serverChapter?.chapterNumber || 0);
                        if (!chapterNumber) {
                            continue;
                        }

                        const existingChapter = chaptersByNumber.get(chapterNumber);
                        chaptersByNumber.set(chapterNumber, {
                            ...(existingChapter || {}),
                            chapter: chapterNumber,
                            status: 'ready',
                            published: existingChapter?.published ?? true,
                            title: String(serverChapter?.title || `Chapter ${chapterNumber}`),
                            summary: String(serverChapter?.summary || ''),
                            content: String(serverChapter?.content || ''),
                            regenerationInstructions: String(serverChapter?.regenerationInstructions || ''),
                            coverUrl: this.generateCoverSvg(request.prompt, chapterNumber),
                        });
                    }

                    const merged = Array.from(chaptersByNumber.values()).sort((a, b) => a.chapter - b.chapter);
                    return {
                        ...request,
                        chapters: merged,
                        status: this.getRequestStatus(merged),
                    };
                }));

                this.attachAudiobookChapterAudio(story.id);
            });

            this.attachAudiobookChapterAudio(story.id);
        }
    }

    private mapServerAlias(raw: any): AuthorAlias {
        const rawId = raw?._id || raw?.id || '';

        return {
            id: String(rawId),
            name: String(raw?.penName || 'Untitled alias'),
            bio: String(raw?.bio || ''),
            profilePictureUrl: this.resolveServerFileUrl(raw?.profilePicture) || 'nouser.png',
            profilePictureFile: null,
            tasteTags: this.normalizeBookTaste(raw?.bookTaste),
        };
    }

    private mapServerStoryToRequest(raw: any): StoryRequest {
        const id = String(raw?._id || this.generateLocalId());
        const authorAliasId = this.extractAuthorId(raw?.authorId);
        const authorAlias = this.authorAliases().find(item => item.id === authorAliasId) || null;

        const prompt = this.extractPrompt(raw?.blueprint);
        const totalChaptersGenerated = Math.max(0, Number(raw?.totalChaptersGenerated || 0));
        const serverStatus = this.normalizeServerStatus(raw?.status);
        const pipelineStatus = this.mapServerStatusToPipeline(serverStatus);

        const chapters = this.buildChaptersForStory(totalChaptersGenerated, pipelineStatus, prompt);

        return {
            id,
            audiobookId: raw?.audiobookId ? String(raw.audiobookId) : '',
            prompt,
            status: pipelineStatus,
            serverStatus,
            createdAt: Number(raw?.createdAt || Date.now()),
            maxChapters: Math.max(3, totalChaptersGenerated + 2),
            authorAliasId,
            authorAliasName: authorAlias?.name || 'Unknown alias',
            authorAliasPicture: authorAlias?.profilePictureUrl || 'nouser.png',
            totalChaptersGenerated,
            voiceLanguage: String(raw?.voiceLanguage || ''),
            chapterLanguage: String(raw?.chapterLanguage || raw?.voiceLanguage || 'en'),
            voiceId: '',
            voiceName: '',
            voiceUrl: '',
            blueprint: raw?.blueprint || {},
            chapters,
        };
    }

    private buildChaptersForStory(totalReady: number, status: PipelineStatus, prompt: string): StoryChapter[] {
        if (status === 'ready') {
            const count = Math.max(1, totalReady);
            const result: StoryChapter[] = [];
            for (let chapter = 1; chapter <= count; chapter++) {
                result.push({
                    chapter,
                    status: 'ready',
                    published: true,
                    coverUrl: this.generateCoverSvg(prompt, chapter),
                });
            }
            return result;
        }

        const chapterNumber = Math.max(1, totalReady + 1);
        return [
            {
                chapter: chapterNumber,
                status,
                published: false,
            },
        ];
    }

    private scheduleChapterPipeline(requestId: string, chapterNumber: number): void {
        this.updateChapterStatus(requestId, chapterNumber, 'generating');
        const req = this.submissions().find(item => item.id === requestId);
        if (req) {
            this.persistStory(req, 'publishing', req.totalChaptersGenerated);
        }

        if (!requestId || requestId.startsWith('local_story_')) {
            return;
        }

        this.iAuthor.yourStoryGenerateChapter(requestId, null, null, (response: any) => {
            if (!response?.success) {
                this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
                this.updateChapterStatus(requestId, chapterNumber, 'processing');
                return;
            }

            const generatedChapter = response?.chapter || {};
            const generatedChapterNumber = Math.max(1, Number(generatedChapter?.chapterNumber || chapterNumber));

            this.submissions.update(list => list.map(request => {
                if (request.id !== requestId) {
                    return request;
                }

                const existing = request.chapters.find(ch => ch.chapter === generatedChapterNumber);
                const baseChapter: StoryChapter = existing || {
                    chapter: generatedChapterNumber,
                    status: 'processing',
                    published: false,
                };

                const updatedChapter: StoryChapter = {
                    ...baseChapter,
                    status: 'ready',
                    title: String(generatedChapter?.title || baseChapter.title || `Chapter ${generatedChapterNumber}`),
                    summary: String(generatedChapter?.summary || baseChapter.summary || ''),
                    content: String(generatedChapter?.content || baseChapter.content || ''),
                    regenerationInstructions: String(generatedChapter?.regenerationInstructions || baseChapter.regenerationInstructions || ''),
                    coverUrl: this.generateCoverSvg(request.prompt, generatedChapterNumber),
                    audioUrl: undefined,
                    audioDurationSec: undefined,
                };

                const other = request.chapters.filter(ch => ch.chapter !== generatedChapterNumber);
                const chapters = [...other, updatedChapter].sort((a, b) => a.chapter - b.chapter);

                const nextTotalFromServer = Number(response?.story?.totalChaptersGenerated || request.totalChaptersGenerated);
                const totalChaptersGenerated = Math.max(nextTotalFromServer, generatedChapterNumber);

                return {
                    ...request,
                    blueprint: response?.story?.blueprint || request.blueprint,
                    audiobookId: response?.story?.audiobookId ? String(response.story.audiobookId) : request.audiobookId,
                    voiceLanguage: String(response?.story?.voiceLanguage || request.voiceLanguage || ''),
                    chapterLanguage: String(response?.story?.chapterLanguage || request.chapterLanguage || 'en'),
                    chapters,
                    status: this.getRequestStatus(chapters),
                    totalChaptersGenerated,
                };
            }));
        });
    }

    private loadVoicesByLanguage(locale: string) {
        const selectedLocale = String(locale || '').trim();
        if (!selectedLocale) return;
        this.loadingVoices.set(true);
        this.iAudiobook.getVoicesByTier(selectedLocale, true, (response: any) => {
            this.loadingVoices.set(false);
            if (response?.success) {
                const voices = Array.isArray(response.voices) ? response.voices : [];
                this.availableVoices.set(voices);
                this.showAllVoices.set(false);
                const currentSelectedId = this.selectedVoiceId();
                const hasCurrentSelection = !!voices.find((voice: ProcessedVoice) => String(voice?.id || '') === currentSelectedId);
                if (!hasCurrentSelection) {
                    const withPreview = voices.find((voice: ProcessedVoice) => !!String(voice?.previewUrl || '').trim());
                    const fallback = withPreview || voices[0];
                    this.selectedVoiceId.set(String(fallback?.id || ''));
                }
            } else {
                this.availableVoices.set([]);
                this.selectedVoiceId.set('');
            }
        });
    }

    selectVoice(voice: ProcessedVoice): void {
        this.selectedVoiceId.set(String(voice?.id || ''));
    }

    getVisibleVoices(): ProcessedVoice[] {
        const voices = this.availableVoices();
        if (this.showAllVoices()) return voices;
        return voices.slice(0, 4);
    }

    canShowAllVoices(): boolean {
        return this.availableVoices().length > 4;
    }

    getVisibleVoicesSummary(): string {
        const total = this.availableVoices().length;
        const visible = this.getVisibleVoices().length;
        return `Showing ${visible} of ${total} voices`;
    }

    toggleShowAllVoices(): void {
        this.showAllVoices.update((value) => !value);
    }

    playVoicePreview(voice: ProcessedVoice, event?: Event): void {
        event?.stopPropagation();
        const sampleUrl = String(voice?.previewUrl || '').trim();
        if (!sampleUrl) {
            this.toast.show('This voice does not have a preview sample.');
            return;
        }

        if (this.voicePreviewAudio) {
            this.voicePreviewAudio.pause();
            this.voicePreviewAudio.currentTime = 0;
            this.voicePreviewAudio = undefined;
        }

        this.voicePreviewAudio = new Audio(sampleUrl);
        this.playingVoiceId.set(String(voice?.id || ''));
        this.voicePreviewAudio.onended = () => this.playingVoiceId.set('');
        this.voicePreviewAudio.onerror = () => this.playingVoiceId.set('');
        this.voicePreviewAudio.play().catch(() => {
            this.playingVoiceId.set('');
            this.toast.show('Could not play this voice preview.');
        });
    }

    private stopVoicePreview(): void {
        if (!this.voicePreviewAudio) return;
        try {
            this.voicePreviewAudio.pause();
            this.voicePreviewAudio.currentTime = 0;
        } catch {
            // no-op
        }
        this.voicePreviewAudio = undefined;
        this.playingVoiceId.set('');
    }

    getSelectedVoice(): ProcessedVoice | null {
        const selectedId = this.selectedVoiceId();
        if (!selectedId) return null;
        return this.availableVoices().find(v => v.id === selectedId) || null;
    }

    hasSelectedVoice(): boolean {
        return !!this.getSelectedVoice();
    }

    private getChapterAudioKey(requestId: string, chapterNumber: number): string {
        return `${requestId}:${chapterNumber}`;
    }

    isChapterAudioConverting(requestId: string, chapterNumber: number): boolean {
        return !!this.chapterAudioConverting()[this.getChapterAudioKey(requestId, chapterNumber)];
    }

    isChapterAudioInterrupted(requestId: string, chapterNumber: number): boolean {
        return !!this.chapterAudioInterrupted()[this.getChapterAudioKey(requestId, chapterNumber)];
    }

    isAnyChapterAudioConverting(): boolean {
        const values = Object.values(this.chapterAudioConverting());
        return values.some((value) => !!value);
    }

    canConvertChapterAudio(request: StoryRequest, chapter: StoryChapter): boolean {
        const selectedVoice = this.getEffectiveVoice(request);
        return chapter.status === 'ready'
            && !chapter.audioUrl
            && !!selectedVoice
            && !!String(selectedVoice.voiceUrl || '').trim()
            && !!(request.voiceLanguage || this.voiceLanguage)
            && !this.isChapterAudioConverting(request.id, chapter.chapter);
    }

    convertChapterAudio(requestId: string, chapterNumber: number): void {
        const request = this.submissions().find(item => item.id === requestId);
        if (!request || !request.id || !request.audiobookId) return;

        const chapter = request.chapters.find(item => item.chapter === chapterNumber);
        if (!chapter || chapter.status !== 'ready') return;
        if (chapter.audioUrl) {
            this.toast.show('This chapter already has generated audio.');
            return;
        }

        const selectedVoice = this.getEffectiveVoice(request);
        if (!selectedVoice) {
            this.toast.show('Please select a voice before converting chapter audio.');
            return;
        }
        if (!String(selectedVoice.voiceUrl || '').trim()) {
            this.toast.show('The selected voice has no preview URL to use as reference audio.');
            return;
        }

        const voiceLanguage = request.voiceLanguage || this.voiceLanguage;
        if (!voiceLanguage) {
            this.toast.show('Please select voice language first.');
            return;
        }

        const key = this.getChapterAudioKey(requestId, chapterNumber);
        this.chapterAudioConverting.update(map => ({ ...map, [key]: true }));
        this.chapterAudioInterrupted.update(map => ({ ...map, [key]: false }));

        this.iAuthor.yourStoryConvertChapterAudio(
            requestId,
            chapterNumber,
            String(selectedVoice.voiceId || ''),
            String(selectedVoice.voiceName || ''),
            String(selectedVoice.voiceUrl || ''),
            String(voiceLanguage || ''),
            (response: any) => {
                this.chapterAudioConverting.update(map => ({ ...map, [key]: false }));
                if (!response?.success) {
                    this.chapterAudioInterrupted.update(map => ({ ...map, [key]: true }));
                    return;
                }
                this.chapterAudioInterrupted.update(map => ({ ...map, [key]: false }));

                const chapterAudio = response?.chapterAudio || null;
                this.submissions.update(list => list.map(item => {
                    if (item.id !== requestId) return item;
                    const chapters = item.chapters.map(ch => {
                        if (ch.chapter !== chapterNumber) return ch;
                        return {
                            ...ch,
                            audioUrl: chapterAudio?.url || ch.audioUrl,
                            audioDurationSec: Number(chapterAudio?.durationSec || ch.audioDurationSec || 0)
                        };
                    });
                    return {
                        ...item,
                        voiceId: String(selectedVoice.voiceId || item.voiceId || ''),
                        voiceName: String(selectedVoice.voiceName || item.voiceName || ''),
                        voiceUrl: String(selectedVoice.voiceUrl || item.voiceUrl || ''),
                        voiceLanguage: String(voiceLanguage || item.voiceLanguage || ''),
                        chapters
                    };
                }));
            }
        );
    }

    deleteChapterAudio(requestId: string, chapterNumber: number): void {
        const request = this.submissions().find(item => item.id === requestId);
        if (!request) return;

        const chapter = request.chapters.find(item => item.chapter === chapterNumber);
        if (!chapter?.audioUrl) return;

        const key = this.getChapterAudioKey(requestId, chapterNumber);
        this.chapterAudioConverting.update(map => ({ ...map, [key]: true }));

        this.iAuthor.yourStoryDeleteChapterAudio(requestId, chapterNumber, (response: any) => {
            this.chapterAudioConverting.update(map => ({ ...map, [key]: false }));
            if (!response?.success) {
                this.toast.show(response?.message || this.toast.getMessageErrorUnexpected());
                return;
            }

            this.submissions.update(list => list.map(item => {
                if (item.id !== requestId) return item;
                return {
                    ...item,
                    chapters: item.chapters.map(ch =>
                        ch.chapter === chapterNumber
                            ? { ...ch, audioUrl: undefined, audioDurationSec: undefined }
                            : ch
                    )
                };
            }));
        });
    }

    private getEffectiveVoice(request: StoryRequest): { voiceId: string; voiceName: string; voiceUrl: string } | null {
        const selectedVoice = this.getSelectedVoice();
        if (selectedVoice) {
            return {
                voiceId: String(selectedVoice.id || ''),
                voiceName: String(selectedVoice.name || ''),
                voiceUrl: String(selectedVoice.previewUrl || ''),
            };
        }

        const requestVoiceId = String(request?.voiceId || '').trim();
        const requestVoiceUrl = String(request?.voiceUrl || '').trim();
        if (requestVoiceId && requestVoiceUrl) {
            return {
                voiceId: requestVoiceId,
                voiceName: String(request?.voiceName || ''),
                voiceUrl: requestVoiceUrl,
            };
        }

        return null;
    }

    private attachAudiobookChapterAudio(requestId: string): void {
        const request = this.submissions().find(item => item.id === requestId);
        const audiobookId = String(request?.audiobookId || '');
        if (!request || !audiobookId) return;

        this.iAudiobook.audiobookFindById(audiobookId, (response: any) => {
            if (!response?.success) return;
            const audiobook = response?.audiobook
                || (Array.isArray(response?.audiobooks) ? response.audiobooks[0] : null);
            if (!audiobook) return;
            const files = Array.isArray(audiobook?.audioFiles) ? audiobook.audioFiles : [];
            const byChapter = new Map<number, any>();
            for (const item of files) {
                const chapter = Number(item?.chapter || 0);
                if (chapter > 0) byChapter.set(chapter, item);
            }

            this.submissions.update(list => list.map(storyRequest => {
                if (storyRequest.id !== requestId) return storyRequest;
                return {
                    ...storyRequest,
                    voiceId: String(audiobook?.voiceId || storyRequest.voiceId || ''),
                    voiceName: String(audiobook?.voiceName || storyRequest.voiceName || ''),
                    voiceUrl: String(audiobook?.voiceUrl || storyRequest.voiceUrl || ''),
                    voiceLanguage: String(audiobook?.targetLanguage || storyRequest.voiceLanguage || ''),
                    chapters: storyRequest.chapters.map(ch => {
                        const audio = byChapter.get(Number(ch.chapter));
                        return {
                            ...ch,
                            audioUrl: audio?.url || ch.audioUrl,
                            audioDurationSec: Number(audio?.durationSec || ch.audioDurationSec || 0)
                        };
                    })
                };
            }));
        });
    }

    private updateChapterStatus(requestId: string, chapterNumber: number, status: PipelineStatus): void {
        this.submissions.update(list => list.map(request => {
            if (request.id !== requestId) {
                return request;
            }

            const updatedChapters = request.chapters.map(chapter => {
                if (chapter.chapter !== chapterNumber) {
                    return chapter;
                }
                return { ...chapter, status };
            });

            const requestStatus = this.getRequestStatus(updatedChapters);
            return {
                ...request,
                chapters: updatedChapters,
                status: requestStatus,
            };
        }));
    }

    private attachChapterAssets(requestId: string, chapterNumber: number): void {
        this.submissions.update(list => list.map(request => {
            if (request.id !== requestId) {
                return request;
            }

            const updatedChapters = request.chapters.map(chapter => {
                if (chapter.chapter !== chapterNumber || chapter.status !== 'ready') {
                    return chapter;
                }

                return {
                    ...chapter,
                    coverUrl: this.generateCoverSvg(request.prompt, chapterNumber),
                };
            });

            return {
                ...request,
                chapters: updatedChapters,
            };
        }));
    }

    private persistStory(request: StoryRequest, status: ServerStoryStatus, totalChaptersGenerated: number): void {
        if (!request.id || request.id.startsWith('local_story_')) {
            return;
        }

        this.iAuthor.yourStoryUpsert(
            request.id,
            request.authorAliasId,
            true,
            status,
            request.blueprint,
            totalChaptersGenerated,
            null,
            null,
            request.chapterLanguage || this.chapterLanguage || 'en',
            (_response: any) => {
                // Fire-and-forget; UI already reflects local progress.
            }
        );
    }

    private getRequestStatus(chapters: StoryChapter[]): PipelineStatus {
        if (chapters.some(item => item.status === 'processing')) {
            return 'processing';
        }
        if (chapters.some(item => item.status === 'generating')) {
            return 'generating';
        }
        return 'ready';
    }

    private mapServerStatusToPipeline(status: ServerStoryStatus): PipelineStatus {
        if (status === 'draft') return 'processing';
        if (status === 'publishing') return 'generating';
        return 'ready';
    }

    private normalizeServerStatus(rawStatus: any): ServerStoryStatus {
        if (rawStatus === 'draft' || rawStatus === 'publishing' || rawStatus === 'published' || rawStatus === 'archived') {
            return rawStatus;
        }
        return 'draft';
    }

    private extractPrompt(blueprint: any): string {
        const prompt = String(
            blueprint?.storyFoundation
            || blueprint?.chapterGenerationInstructions
            || blueprint?.storyTitle
            || ''
        ).trim();

        return prompt || 'Untitled story idea';
    }

    private buildBlueprint(prompt: string, author: AuthorAlias): any {
        const selectedLanguageName = this.availableLanguages.find((item) => String(item.code) === String(this.chapterLanguage || ''))?.name || this.chapterLanguage || 'English';
        return {
            storyTitle: prompt.slice(0, 72),
            genre: author.tasteTags[0] || 'General',
            tone: 'immersive',
            inspirationalStyleNotes: `Written as ${author.name}`,
            storyFoundation: prompt,
            mainConflict: '',
            longTermArc: '',
            worldRules: '',
            characters: [],
            chapterGenerationInstructions: `Use these taste references: ${author.tasteTags.join(', ')}. Write all chapter text in ${selectedLanguageName}.`,
        };
    }

    private extractAuthorId(rawAuthorId: any): string {
        if (typeof rawAuthorId === 'string') {
            return rawAuthorId;
        }
        if (rawAuthorId && typeof rawAuthorId === 'object' && rawAuthorId._id) {
            return String(rawAuthorId._id);
        }
        return '';
    }

    private resolveServerFileUrl(file: any): string {
        if (!file) {
            return '';
        }

        if (typeof file === 'string') {
            return file;
        }

        const filename = file?.filename || file?.fileName || file?.name;
        const mimetype = file?.mimetype || file?.mimeType || file?.type;
        if (filename && mimetype) {
            return this.utils.getClientUrlForFiles(filename, mimetype);
        }

        return '';
    }

    private normalizeBookTaste(rawBookTaste: any): string[] {
        if (Array.isArray(rawBookTaste)) {
            return rawBookTaste.map(item => this.normalizeTag(String(item || ''))).filter(Boolean);
        }

        if (typeof rawBookTaste === 'string') {
            const raw = rawBookTaste.trim();
            if (!raw) {
                return [];
            }

            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed.map(item => this.normalizeTag(String(item || ''))).filter(Boolean);
                }
            } catch (error) {
                // fallback to comma-delimited list
            }

            return raw.split(',').map(item => this.normalizeTag(item)).filter(Boolean);
        }

        return [];
    }

    private generateCoverSvg(prompt: string, chapterNumber: number): string {
        const safePrompt = this.escapeXml(prompt.slice(0, 48) || 'Your Story');
        const chapterText = this.escapeXml(`Chapter ${chapterNumber}`);
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='440'>
            <defs>
                <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0%' stop-color='#1e3a8a'/>
                    <stop offset='100%' stop-color='#0f172a'/>
                </linearGradient>
            </defs>
            <rect width='100%' height='100%' fill='url(#g)'/>
            <rect x='20' y='20' width='320' height='400' fill='none' stroke='#60a5fa' stroke-width='2'/>
            <text x='50%' y='44%' text-anchor='middle' fill='#dbeafe' font-family='Arial' font-size='20'>${safePrompt}</text>
            <text x='50%' y='56%' text-anchor='middle' fill='#93c5fd' font-family='Arial' font-size='16'>${chapterText}</text>
            <text x='50%' y='86%' text-anchor='middle' fill='#bfdbfe' font-family='Arial' font-size='14'>AI Generated Cover</text>
        </svg>`;

        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    private clearTimers(): void {
        this.activeTimers.forEach(timerId => window.clearTimeout(timerId));
        this.activeTimers = [];
    }

    private normalizeTag(value: string): string {
        return value.trim().replace(/\s+/g, ' ');
    }

    private resetAuthorForm(): void {
        this.editingAuthorId.set(null);
        this.revokeAuthorPreviewUrl();

        this.authorForm.set({
            name: '',
            bio: '',
            profilePicturePreview: '',
            profilePictureFile: null,
            tasteTags: [],
        });
        this.authorTasteInput.set('');
    }

    private revokeAuthorPreviewUrl(): void {
        const preview = this.authorForm().profilePicturePreview;
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }
    }

    private generateLocalId(): string {
        return `local_story_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    private escapeXml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    getChapterAudioUrl(audioUrl?: string): string {
        if (!audioUrl) return '';
        const server = Config.dev ? Config.SERVER.local : Config.SERVER.remote;
        return `${server}/file?id=/${audioUrl}`;
    }

    removeCoverFile() {
        this.coverFile = null;
    }
}

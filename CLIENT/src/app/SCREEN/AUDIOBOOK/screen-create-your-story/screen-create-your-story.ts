import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InternetAuthorService } from '../../../SERVICES/internet-author.service';
import { ToastService } from '../../../SERVICES/toast';
import { UtilsService } from '../../../utils/utils-service';

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
    prompt: string;
    status: PipelineStatus;
    serverStatus: ServerStoryStatus;
    createdAt: number;
    maxChapters: number;
    authorAliasId: string;
    authorAliasName: string;
    authorAliasPicture: string;
    totalChaptersGenerated: number;
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
    aliasPanelExpanded = signal(true);
    private aliasPanelInit = false;

    private activeTimers: number[] = [];

    //  Cover file for the audiobook
    coverFile: File | null = null;

    //  Language Selected for the voice
    voiceLanguage = '';

    constructor(
        private iAuthor: InternetAuthorService,
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
    }

    onCoverSelected(file: File) {
        if (file) {
            this.coverFile = file;
        }
    }

    onVoiceLanguageSelected(language: string) {
        this.voiceLanguage = String(language || '').trim();
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
                this.voiceLanguage = '';
                this.coverFile = null;
            }
        );
    }

    canSubmitStoryRequest(): boolean {
        return !!this.storyPrompt().trim()
            && !!this.selectedAuthorAliasId()
            && !!this.voiceLanguage
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

        chapter.published = true;

        if (chapterNumber > request.totalChaptersGenerated) {
            request.totalChaptersGenerated = chapterNumber;
            this.persistStory(request, 'published', request.totalChaptersGenerated);
        }

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

        if (chapter.chapter === 1) {
            return true;
        }

        const prev = request.chapters.find(item => item.chapter === chapter.chapter - 1);
        return !!prev && prev.published;
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

                        chaptersByNumber.set(chapterNumber, {
                            chapter: chapterNumber,
                            status: 'ready',
                            published: true,
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
            });
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
            prompt,
            status: pipelineStatus,
            serverStatus,
            createdAt: Number(raw?.createdAt || Date.now()),
            maxChapters: Math.max(3, totalChaptersGenerated + 2),
            authorAliasId,
            authorAliasName: authorAlias?.name || 'Unknown alias',
            authorAliasPicture: authorAlias?.profilePictureUrl || 'nouser.png',
            totalChaptersGenerated,
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
                };

                const other = request.chapters.filter(ch => ch.chapter !== generatedChapterNumber);
                const chapters = [...other, updatedChapter].sort((a, b) => a.chapter - b.chapter);

                const nextTotalFromServer = Number(response?.story?.totalChaptersGenerated || request.totalChaptersGenerated);
                const totalChaptersGenerated = Math.max(nextTotalFromServer, generatedChapterNumber);

                return {
                    ...request,
                    blueprint: response?.story?.blueprint || request.blueprint,
                    chapters,
                    status: this.getRequestStatus(chapters),
                    totalChaptersGenerated,
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
            chapterGenerationInstructions: `Use these taste references: ${author.tasteTags.join(', ')}`,
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

    removeCoverFile() {
        this.coverFile = null;
    }
}

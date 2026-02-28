//
//  REACTIONS
//
ReactionUpsert = require('./tasks/reaction_upsert');
ReactionGetMine = require('./tasks/reaction_get_mine');

//
//  DEBATE
//
DebateAdd = require('./tasks/debate_add');
DebateGetById = require('./tasks/debate_get_by_id');
DebateCountComments = require('./tasks/debate_count_comments');
DebateGetComments = require('./tasks/debate_get_comments');
DebateCommentAdd = require('./tasks/debate_comment_add');
DebateGetpopularThreads = require('./tasks/debate_get_popular_threads');
DebateGetRecentThreads = require('./tasks/debate_get_recent_threads');
DebateGeneratePodcast = require('./tasks/debate_generate_podcast');
DebatePodcastGet = require('./tasks/debate_podcast_get');

//
//  FOLLOW
//
FollowUpsert = require('./tasks/follow_upsert');
FollowGetMine = require('./tasks/follow_get_mine');

//
//  BOOKMARKS
//
BookmarkUpsert = require('./tasks/bookmark_upsert');
BookmarkGetMine = require('./tasks/bookmark_get_mine');

//
//  STORIES
//
GetStories = require('./tasks/story_get');
GetStoriesByAudiobook = require('./tasks/story_get_by_audiobook');
UpdateAudiobookStory = require('./tasks/story_update');
StoryUploadNewFile = require('./tasks/story_upload_new_file');
StoryTranslateLanguage = require('./tasks/story_translate_language');

//
//  SUBSCRIPTIONS
//
SubscriptionGetConfig = require('./tasks/subscription_get_config');
SubscriptionGenerateStripeUrl = require('./tasks/subscription_generate_stripe');
SubscriptionGetMine = require('./tasks/subscription_get_mine');

//
//  CATEGORIES
//
const GetAllCategories = require("./tasks/category_get");

//
//  AUDIOBOOK
//  
const AudiobookAdd = require("./tasks/audiobook_add");
const AudiobookCreateStripeCheckout = require("./tasks/audiobook_create_stripe_checkout");
const AudiobookCheckPaymentStatus = require("./tasks/audiobook_check_payment_status");
const AudiobooksGetAdmin = require("./tasks/audiobook_get_admin");
const UpdateAudiobookTotalPages = require("./tasks/audiobook_update_total_pages");
const UpdateAudiobookTotalChapters = require("./tasks/audiobook_update_total_chapters");
const ConvertToMP3 = require("./tasks/audiobook_convert_to_mp3");
const AudiobookTranslate = require("./tasks/audiobook_translate");
const AudiobookUploadCover = require("./tasks/auidobook_upload_cover");

const AudiobookFind = require("./tasks/audiobook_find_router");
const AudiobookFindById = require("./tasks/audiobook_find_by_id");
const AudiobookFindByQuery = require("./tasks/audiobook_find_by_query");
const AudiobookFindByCategory = require("./tasks/audiobook_find_by_category");
const AudiobookFindBySection = require("./tasks/audiobook_find_by_section");
const AudiobookFindByAuthor = require("./tasks/audiobook_find_by_author");
const AudiobookFindLatest = require("./tasks/audiobook_find_latest");
const AudiobookGetLanguages = require("./tasks/audiobook_get_languages");
const AudiobookGetPendingPayments = require("./tasks/audiobook_get_pending_payment");
const AudiobookArchive = require("./tasks/audiobook_archive");

const AudiobookGetChapterAudio = require("./tasks/audiobook_get_chapter_audio");
const AudiobookGetChapterAudioIsAvailable = require("./tasks/audiobook_get_chapter_audio_is_available");
const AudiobookGetContineListening = require("./tasks/audiobook_get_contine_listening");

//
//  VOICES
//  
const GetVoicesByTier = require("./tasks/voices_get_by_tear");

//
//  LOGIN
//
const SendCode = require("./tasks/user_send_code");
const ValidateCode = require('./tasks/user_validate_code');
const GetMyUser = require('./tasks/user_get_mine');
const GetUserById = require('./tasks/user_get_by_id');
const UpdateMyProfile = require('./tasks/user_update');
const UserFind = require('./tasks/user_find');

//
//  USER
//
const UserGetListeningHistory = require("./tasks/user_get_listening_history");
const UserSetListeningHistory = require("./tasks/user_set_listening_history");
const UserGetWork = require("./tasks/user_get_work");

//
//  MISC
//
const GetAppConfig = require('./tasks/app_get_config');
const UploadFileAndReturn = require('./tasks/upload-file-and-return');
const GetPromoCodes = require('./tasks/promo_code_get');
const ValidatePromoCode = require('./tasks/promo_code_validate');
const CommentAdd = require('./tasks/comment_add');
const CommentDelete = require('./tasks/comment_delete');
const CommentFind = require('./tasks/comment_find');
const CommentGetById = require('./tasks/comment_get_by_id');
const CommentUpdate = require('./tasks/comment_update');
const CommentMarkRead = require('./tasks/comment_mark_read');
const CommentAiSummary = require('./tasks/comment_ai_summary');

//
//  ADMIN
//
const AddPromoCode = require('./tasks/admin_pormo_code_add');
const EditPromoCode = require('./tasks/admin_pormo_code_update');
const GetAdminPromoCodes = require('./tasks/admin_pormo_code_get');
const DeletePromoCode = require('./tasks/admin_pormo_code_delete');
const AdminAudiobookGetChapterAudio = require("./tasks/admin_audiobook_get_chapter_audio");
const SendContactForm = require('./tasks/contact_add');

//
//  AUTHOR
//
const FindAuthor = require('./tasks/author_find');
const AuthorUpsertAlias = require('./tasks/author_upsert_alias');
const AuthorGetAlias = require('./tasks/author_get_alias');

//
//  YOUR STORY
//
YourStoryUpsert = require('./tasks/your_story_upsert');
YourStoryGet = require('./tasks/your_story_get');
YourStoryChapterUpsert = require('./tasks/your_story_chapter_upsert');
YourStoryChapterGet = require('./tasks/your_story_chapter_get');
YourStoryMemoryUpsert = require('./tasks/your_story_memory_upsert');
YourStoryGenerateChapter = require('./tasks/your_story_generate_chapter');
YourStoryConvertChapterAudio = require('./tasks/your_story_convert_chapter_audio');
YourStoryDeleteChapterAudio = require('./tasks/your_story_delete_chapter_audio');

const TasksRegistry = {

    //  REACTIONS
    ReactionUpsert,
    ReactionGetMine,

    //  DEBATE
    DebateGetpopularThreads,
    DebateGetRecentThreads,
    DebateGeneratePodcast,
    DebatePodcastGet,
    DebateCommentAdd,
    DebateGetComments,
    DebateCountComments,
    DebateGetById,
    DebateAdd,

    //  FOLLOW
    FollowUpsert,
    FollowGetMine,

    //  BOOKMARKS
    BookmarkUpsert,
    BookmarkGetMine,

    //  STORIES
    UpdateAudiobookStory,
    StoryUploadNewFile,
    StoryTranslateLanguage,
    GetStoriesByAudiobook,
    GetStories,
    
    //  YOUR STORY
    YourStoryGet,
    YourStoryUpsert,
    YourStoryChapterUpsert,
    YourStoryChapterGet,
    YourStoryMemoryUpsert,
    YourStoryGenerateChapter,
    YourStoryConvertChapterAudio,
    YourStoryDeleteChapterAudio,

    //  AUTHOR
    AuthorGetAlias,
    AuthorUpsertAlias,
    FindAuthor,
    
    //  USER
    UserGetWork,
    UserSetListeningHistory,
    UserGetListeningHistory,
    UserFind,
    
    //  SUBSCRIPTIONS
    SubscriptionGetConfig,
    SubscriptionGenerateStripeUrl,
    SubscriptionGetMine,
    
    //  AUDIOBOOK
    AudiobookFindById,
    AudiobookFind,
    AudiobookFindByQuery,
    AudiobookFindByCategory,
    AudiobookFindBySection,
    AudiobookFindByAuthor,
    AudiobookGetLanguages,
    AudiobookArchive,
    AudiobookGetPendingPayments,
    AudiobookFindLatest,
    AudiobookUploadCover,
    AudiobookTranslate,
    AudiobookGetContineListening,
    AudiobookGetChapterAudio,
    AudiobookGetChapterAudioIsAvailable,
    ConvertToMP3,
    UpdateAudiobookTotalChapters,
    UpdateAudiobookTotalPages,
    AudiobooksGetAdmin,
    AudiobookCheckPaymentStatus,
    AudiobookCreateStripeCheckout,
    AudiobookAdd,
    GetAllCategories,

    //  VOICES
    GetVoicesByTier,

    //  MISC
    GetAppConfig,
    UploadFileAndReturn,
    GetPromoCodes,
    ValidatePromoCode,
    CommentAdd,
    CommentDelete,
    CommentFind,
    CommentGetById,
    CommentUpdate,
    CommentMarkRead,
    CommentAiSummary,
    
    //  LOGIN
    SendCode,
    ValidateCode,
    GetMyUser,
    GetUserById,
    UpdateMyProfile,

    //  ADMIN
    AddPromoCode,
    EditPromoCode,
    GetAdminPromoCodes,
    DeletePromoCode,
    AdminAudiobookGetChapterAudio,
    SendContactForm,

};

module.exports = TasksRegistry;

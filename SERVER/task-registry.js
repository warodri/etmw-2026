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

const AudiobookGetChapterAudio = require("./tasks/audiobook_get_chapter_audio");
const AudiobookGetChapterAudioIsAvailable = require("./tasks/audiobook_get_chapter_audio_is_available");

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
    GetStoriesByAudiobook,
    GetStories,
    
    //  AUTHOR
    FindAuthor,
    
    //  USER
    UserGetWork,
    UserSetListeningHistory,
    UserGetListeningHistory,
    
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
    AudiobookFindLatest,
    AudiobookUploadCover,
    AudiobookTranslate,
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

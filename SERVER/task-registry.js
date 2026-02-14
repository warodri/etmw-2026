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
const ConvertToMP3 = require("./tasks/audiobook_convert_to_mp3");
const AudiobookTranslate = require("./tasks/audiobook_translate");
const AudiobookUploadCover = require("./tasks/auidobook_upload_cover");

const AudiobookFind = require("./tasks/audiobook_find");
const AudiobookFindById = require("./tasks/audiobook_find");
const AudiobookGetChapterAudio = require("./tasks/audiobook_get_chapter_audio");

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

//
//  AUTHOR
//
const FindAuthor = require('./tasks/author_find');

const TasksRegistry = {

    //  AUTHOR
    FindAuthor,
    
    //  USER
    UserGetListeningHistory,
    
    //  SUBSCRIPTIONS
    SubscriptionGetConfig,
    SubscriptionGenerateStripeUrl,
    SubscriptionGetMine,
    
    //  AUDIOBOOK
    AudiobookFindById,
    AudiobookFind,
    AudiobookUploadCover,
    AudiobookTranslate,
    AudiobookGetChapterAudio,
    ConvertToMP3,
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

};

module.exports = TasksRegistry;

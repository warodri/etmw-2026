
//
//  AUDIOBOOK
//  
const GetAllCategories = require("./tasks/category_get");
const AudiobookAdd = require("./tasks/audiobook_add");
const AudiobookCreateStripeCheckout = require("./tasks/audiobook_create_stripe_checkout");
const AudiobookCheckPaymentStatus = require("./tasks/audiobook_check_payment_status");
const AudiobooksGetAdmin = require("./tasks/audiobook_get_admin");
const UpdateAudiobookTotalPages = require("./tasks/audiobook_update_total_pages");
const ConvertToMP3 = require("./tasks/audiobook_convert_to_mp3");
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


const TasksRegistry = {

    //  AUDIOBOOK
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

};

module.exports = TasksRegistry;

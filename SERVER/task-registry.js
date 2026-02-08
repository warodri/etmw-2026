
//
//  AUDIOBOOK
//  
const GetAllCategories = require("./tasks/category_get");
const AudiobookAdd = require("./tasks/audiobook_add");
const AudiobookCreateStripeCheckout = require("./tasks/audiobook_create_stripe_checkout");
const AudiobookCheckPaymentStatus = require("./tasks/audiobook_check_payment_status");

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

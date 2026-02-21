const AudiobookFindById = require('./audiobook_find_by_id');
const AudiobookFindByQuery = require('./audiobook_find_by_query');
const AudiobookFindByCategory = require('./audiobook_find_by_category');
const AudiobookFindByAuthor = require('./audiobook_find_by_author');
const AudiobookFindBySection = require('./audiobook_find_by_section');

async function run(data, req, res) {
    const payload = data || {};

    if (hasValue(payload.audiobookId)) {
        return AudiobookFindById.run(payload, req, res);
    }

    if (hasValue(payload.query)) {
        return AudiobookFindByQuery.run(payload, req, res);
    }

    if (hasAny(payload.categories)) {
        return AudiobookFindByCategory.run(payload, req, res);
    }

    if (payload.myAudiobooks || hasAny(payload.authorIds)) {
        return AudiobookFindByAuthor.run(payload, req, res);
    }

    return AudiobookFindBySection.run(payload, req, res);
}

function hasValue(value) {
    if (value === null || value === undefined) return false;
    return String(value).trim() !== '';
}

function hasAny(values) {
    if (values === null || values === undefined) return false;
    if (Array.isArray(values)) {
        return values.some((item) => hasValue(item));
    }
    return hasValue(values);
}

module.exports = {
    run
};


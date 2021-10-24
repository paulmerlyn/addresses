'use strict'

const crypto = require('crypto')

/* Generates an id by hashing address field content. It attempts to minimize storage of duplicate "similar" addresses caused by differing use of white-spaces;  
 * capitalization differences; and differences from use of semantic/punctuation characters (e.g. #, . (period), or comma; or common abbreviations (e.g. "avenue" vs "ave"). */
exports.generateId = (obj) => {
    let stringFromKVs = ''
    for (const [key, value] of Object.entries(obj)) {
        stringFromKVs += `${key}${value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().replace('avenue', 'ave').replace('road', 'rd').replace('drive', 'dr')}`
    }
    return crypto.createHash('md5').update(stringFromKVs).digest('hex')
}
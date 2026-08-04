function createChainable(queryFn) {
    const chain = {
        _sortArg: null,
        _limitN: null,
        _skipN: null,

        sort: function (arg) { chain._sortArg = arg; return chain; },
        limit: function (n) { chain._limitN = n; return chain; },
        skip: function (n) { chain._skipN = n; return chain; },
        select: function () { return chain; },
        lean: function () { return chain; },
        populate: function () { return chain; },
        where: function () { return chain; },

        then: function (resolve, reject) {
            queryFn().then((result) => {
                if (Array.isArray(result)) {
                    let arr = [...result];
                    if (chain._sortArg !== null) {
                        const sortArg = chain._sortArg;
                        if (typeof sortArg === 'string') {
                            arr.sort((a, b) => ((a[sortArg] || '') + '').localeCompare((b[sortArg] || '') + ''));
                        } else if (typeof sortArg === 'object' && sortArg !== null) {
                            const key = Object.keys(sortArg)[0];
                            const dir = sortArg[key];
                            arr.sort((a, b) => {
                                const va = a[key] instanceof Date ? a[key] : new Date(a[key] || 0);
                                const vb = b[key] instanceof Date ? b[key] : new Date(b[key] || 0);
                                return dir === 1 ? va - vb : vb - va;
                            });
                        }
                    }
                    if (chain._skipN !== null) arr = arr.slice(chain._skipN);
                    if (chain._limitN !== null) arr = arr.slice(0, chain._limitN);
                    resolve(arr);
                } else {
                    resolve(result);
                }
            }, reject);
        },

        catch: function (fn) { return chain.then(undefined, fn); },
        exec: function () { return chain; },
    };

    chain[Symbol.for('nodejs.util.promisify.custom')] = () => chain;

    return chain;
}

function createSingleChainable(queryFn) {
    const chain = {
        then: function (resolve, reject) {
            queryFn().then(resolve, reject);
        },
        catch: function (fn) { return chain.then(undefined, fn); },
        exec: function () { return chain; },
        select: function () { return chain; },
        lean: function () { return chain; },
        populate: async function () { return await chain; },
    };
    return chain;
}

// Wraps a single object (or null) so it can be awaited and chained with
// .select()/.lean() like a Mongoose doc. Keeps the original object intact.
function withChainSingle(obj) {
    if (!obj) return null;
    obj.select = obj.select || function () { return this; };
    obj.lean = obj.lean || function () { return this; };
    obj.exec = obj.exec || function () { return this; };
    return obj;
}

module.exports = { createChainable, createSingleChainable, withChainSingle };

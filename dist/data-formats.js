"use strict";
var _ = require('lodash');
var interfaces_1 = require('@trystal/interfaces');
function buildServer(svrTrist) {
    return {
        ids: [],
        contentIndex: {},
        mapIndex: {},
        trist: {
            contents: [],
            map: [],
            revisions: []
        }
    };
}
function diff_wordMode(text1, text2) {
    return null;
}
function buildRevision(authorId, clientIds, serverIds, common, contentIndex, trist) {
    function buildEdit(lineId, oldText, trystup) {
        var isPatch = (oldText.length > 5 || trystup.length > 5);
        isPatch = false;
        var delta = (isPatch ? diff_wordMode(trystup, oldText) : oldText) || '';
        return { lineId: lineId, delta: delta, isPatch: isPatch };
    }
    var edits = common.filter(function (id) {
        var scontent = contentIndex[id];
        var payload = trist.nodes[id].payload;
        var text = payload.trystup;
        return (scontent.text !== text);
    })
        .map(function (id) {
        var scontent = contentIndex[id];
        var payload = trist.nodes[id].payload;
        var text = payload.trystup;
        return buildEdit(id, scontent.text || '', text || '');
    });
    var revision = {
        authorId: authorId,
        edits: edits,
        date: new Date(),
        adds: _.difference(clientIds, common),
        dels: _.difference(serverIds, common)
    };
    return revision;
}
function revise(svrTrist, tristJS, authorId) {
    var SERVER = buildServer(svrTrist);
    var clientIds = _.keys(tristJS.nodes);
    var common = _.intersection(clientIds, SERVER.ids);
    var revision = buildRevision(authorId, clientIds, SERVER.ids, common, SERVER.contentIndex, tristJS);
    function buildContentItem(id, text, link, imgLink) {
        if (link && imgLink)
            return { id: id, text: text, link: link, imgLink: imgLink };
        if (link)
            return { id: id, text: text, link: link };
        if (imgLink)
            return { id: id, text: text, imgLink: imgLink };
        return { id: id, text: text };
    }
    function buildMapItem(id, rlevel, format, next, vnext, isDeleted) {
        var mapItem = { id: id, isDeleted: isDeleted };
        if (rlevel)
            mapItem.rlevel = rlevel;
        if (format)
            mapItem.format = format;
        if (next)
            mapItem.next = next;
        if (vnext)
            mapItem.vnext = vnext;
        if (isDeleted)
            mapItem.isDeleted = isDeleted;
        return mapItem;
    }
    _.each(revision.adds, function (id) {
        var _a = tristJS.nodes[id], rlevel = _a.rlevel, next = _a.next, vnext = _a.NV;
        var payload = tristJS.nodes[id].payload;
        var text = payload.trystup || '';
        var format = payload.format || '';
        var link = payload.link;
        var imgLink = payload.imgLink;
        SERVER.trist.contents.push(buildContentItem(id, text, link, imgLink));
        var mapItem = buildMapItem(id, rlevel || 0, format, next || null, vnext || null, false);
        SERVER.trist.map.push(mapItem);
    });
    _.each(common, function (id) {
        var scontent = SERVER.contentIndex[id];
        var _a = tristJS.nodes[id], rlevel = _a.rlevel, next = _a.next, vnext = _a.NV;
        var _b = tristJS.nodes[id], format = _b.format, link = _b.link, imgLink = _b.imgLink, text = _b.trystup;
        _.extend(scontent, { text: text, link: link, imgLink: imgLink });
        _.extend(SERVER.mapIndex[id], { format: format, rlevel: rlevel, next: next, vnext: vnext });
    });
    _.each(revision.dels, function (id) { return SERVER.mapIndex[id].isDeleted = true; });
    SERVER.trist.revisions.push(revision);
    return {
        version: interfaces_1.Formats.FMT2015,
        map: SERVER.trist.map,
        contents: SERVER.trist.contents,
        revisions: SERVER.trist.revisions
    };
}
exports.revise = revise;

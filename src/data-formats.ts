import * as _ from 'lodash'
import {JS,Cloud} from '@trystal/interfaces'

import Formats = Cloud.Formats
import IdTable = JS.IdTable
import Trist = JS.Trist
import Payload = JS.Payload


// import Formats = JS, Payload, IdTable, Trist

interface IServer {
  ids:string[]
  contentIndex: IdTable<Cloud.ContentItem>
  mapIndex: IdTable<{isDeleted:boolean}>,
  trist: {
    contents: Cloud.ContentItem[],
    map: Cloud.MapItem[],
    revisions: Cloud.Revision[]
  }
}
function buildServer(svrTrist:Cloud.Trist): IServer {
  return {
    ids:[], 
    contentIndex:{},
    mapIndex:{},
    trist:{
      contents:[],
      map:[],
      revisions:[]
    }
  }
}
function diff_wordMode(text1:string, text2:string):null {
  return null
  /*let dmp = new diff_match_patch()
  let a = dmp.diff_linesToWords_(text1, text2)
  let lineText1 = a.chars1
  let lineText2 = a.chars2
  let lineArray = a.lineArray
  let diffs = dmp.diff_main(lineText1, lineText2, false)
  dmp.diff_charsToLines_(diffs, lineArray)
  return diffs;*/
}

function buildRevision(authorId:string,  clientIds:string[],  serverIds:string[],  common:string[],  contentIndex:IdTable<Cloud.ContentItem>,  trist:Trist) : Cloud.Revision {
  function buildEdit(lineId:string, oldText:string, trystup:string) : Cloud.Edit {
    let isPatch = (oldText.length > 5 || trystup.length > 5)
    isPatch = false // change this when we're confident of the diff strategy
    const delta = (isPatch ? diff_wordMode(trystup, oldText) : oldText) || ''  
    return { lineId, delta, isPatch }
  }
  const edits: Cloud.Edit[] = common.filter(id => { 
    const scontent = contentIndex[id]
    const payload = <Payload>trist.nodes[id].payload
    const {trystup:text} = payload
    return (scontent.text !== text) 
  })
  .map(id => {
    const scontent = contentIndex[id]
    const payload = <Payload>trist.nodes[id].payload
    const {trystup:text} = payload 
    return buildEdit(id, scontent.text || '', text || '')
  })

  const revision = {
    authorId, 
    edits, 
    date: new Date(),
    adds: _.difference(clientIds, common),  // (BCD,BC) => D
    dels: _.difference(serverIds, common)  // (ABC,BC) => A
  }
  return revision
}

// // // note: external code will have to convert tristIM to tristJS for thi to work
// // // we don't want to pull in the whole immutable infrastructure just to tis conversion 
// // // when the code just works off the js anyway
// // // later, if and when we convert to using IM directly, we can make the adjustment then
export function revise(svrTrist:Cloud.Trist, tristJS:Trist, authorId:string) : Cloud.Trist {
  const SERVER = buildServer(svrTrist)
  const clientIds = _.keys(tristJS.nodes)
  const common = _.intersection(clientIds, SERVER.ids)           // (BCD,ABC) => BC
  const revision = buildRevision(authorId, clientIds, SERVER.ids, common, SERVER.contentIndex, tristJS)
  function buildContentItem(id:string, text:string, link?:string|undefined, imgLink?:string|undefined) : Cloud.ContentItem {
    if(link && imgLink) return { id, text, link, imgLink }
    if(link) return {id, text, link}
    if(imgLink) return {id, text, imgLink}
    return {id,text}
  }

  function buildMapItem(id:string, rlevel:number, format:string|null, next:string|null, vnext:string|null, isDeleted:boolean): Cloud.MapItem {
    const mapItem:Cloud.MapItem = {id, isDeleted}
    if(rlevel) mapItem.rlevel = rlevel
    if(format) mapItem.format = format
    if(next) mapItem.next = next
    if(vnext) mapItem.vnext = vnext
    if(isDeleted) mapItem.isDeleted = isDeleted
    return mapItem
  }

  _.each(revision.adds, id => { // D
    const {rlevel, next, NV:vnext} = tristJS.nodes[id]
    const payload = <Payload>tristJS.nodes[id].payload
    const text = payload.trystup || ''
    const format = payload.format || ''
    const link = payload.link
    const imgLink = payload.imgLink
    SERVER.trist.contents.push(buildContentItem(id, text, link, imgLink))
    const mapItem:Cloud.MapItem = buildMapItem(id, rlevel || 0, format, next||null, vnext||null, false) //  { id, rlevel, format, next, vnext, isDeleted: false }
    SERVER.trist.map.push(mapItem)
  })
  // function patch_wordMode(/*text1, text2*/) {
  //     return null
  //     /*let dmp = new diff_match_patch()

  //     let a = dmp.diff_linesToWords_(text1, text2)
  //     let lineText1 = a.chars1
  //     let lineText2 = a.chars2
  //     let lineArray = a.lineArray
  //     let diffs = dmp.diff_main(lineText1, lineText2, false)
  //     dmp.diff_charsToLines_(diffs, lineArray)
  //     return diffs;*/
  // }
  _.each(common, id => {  // BC
    const scontent = SERVER.contentIndex[id]
    const {rlevel, next, NV:vnext} = tristJS.nodes[id]
    const {format, link, imgLink, trystup:text} = <Payload>tristJS.nodes[id]
    _.extend(scontent, {text, link, imgLink})
    _.extend(SERVER.mapIndex[id], {format, rlevel, next, vnext})
  })
  _.each(revision.dels, id => SERVER.mapIndex[id].isDeleted = true)
  SERVER.trist.revisions.push(revision)
  
  let version = Formats.FMT2015
  let map = SERVER.trist.map
  let contents = SERVER.trist.contents
  let revisions = SERVER.trist.revisions

  return {version, map, contents, revisions }
}

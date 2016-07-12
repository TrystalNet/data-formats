import * as _ from 'lodash'
import {Formats} from './constants'

export function sayHello() {
  return 'hello'
}

// function buildServer(svrTrist) {

// }

// export function revise(svrTrist, trist, authorId) {
//   const SERVER = buildServer(svrTrist)
//   trist = trist.toJS()
//   const clientIds = _.keys(trist.nodes)
//   const common = _.intersection(clientIds, SERVER.ids)           // (BCD,ABC) => BC
//   const revision = buildRevision(authorId, clientIds, SERVER.ids, common, SERVER.contentIndex, trist)

//   _.each(revision.adds, id => { // D
//     const {rlevel, next, NV:vnext, payload:{trystup:text, format, link, imgLink}} = trist.nodes[id]
//     SERVER.trist.contents.push({ id, link, imgLink, text })
//     SERVER.trist.map.push({ id, rlevel, format, next, vnext, isDeleted: false })
//   })
//   // function patch_wordMode(/*text1, text2*/) {
//   //     return null
//   //     /*let dmp = new diff_match_patch()

//   //     let a = dmp.diff_linesToWords_(text1, text2)
//   //     let lineText1 = a.chars1
//   //     let lineText2 = a.chars2
//   //     let lineArray = a.lineArray
//   //     let diffs = dmp.diff_main(lineText1, lineText2, false)
//   //     dmp.diff_charsToLines_(diffs, lineArray)
//   //     return diffs;*/
//   // }
//   _.each(common, id => {  // BC
//     const scontent = SERVER.contentIndex[id]
//     const {rlevel, next='', NV:vnext='', payload:{format, link, imgLink, trystup:text}} = trist.nodes[id]
//     _.extend(scontent, {text, link, imgLink})
//     _.extend(SERVER.mapIndex[id], {format, rlevel, next, vnext})
//   })
//   _.each(revision.dels, id => SERVER.mapIndex[id].isDeleted = true)
//   SERVER.trist.revisions.push(revision)
  
//   return {
//     version: Formats.FMT2015,
//     map: SERVER.trist.map,
//     contents: SERVER.trist.contents,
//     revisions: SERVER.trist.revisions
//   }
// }

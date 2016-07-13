import {JS, Cloud} from '@trystal/interfaces'
import {buildChain} from '@trystal/data-gen'
import {revise} from '../src/data-formats.ts'

import Node = JS.Node
import Trist = JS.Trist 

const A = 'A', B='B'
const BOB = 'bob'

function daysFrom(d:Date) {
  const t0 = new Date('July 12, 2016').getTime()
  const t1 = new Date(d).getTime()
  return Math.round((t1 - t0) / 1000 / 3600 / 24)
}

describe('it does a simple revision to an empty server trist / ', () => {
  let cloudTrist:Cloud.Trist  
  beforeEach(() => {
    var Q = buildChain(A)
    var R:JS.Trist = {nodes:Q}
    cloudTrist = revise({}, R, BOB) 
  })
  it('it has correct version',() => expect(cloudTrist.version).toBe(20150) )
  it('has exactly one revision',() => expect(cloudTrist.revisions.length).toBe(1))
  it('has the correct number of content records',() => expect(cloudTrist.contents.length).toBe(1))
  it('has the correct number of map records',() => expect(cloudTrist.map.length).toBe(1))
  it('has the expected content record',() => expect(cloudTrist.contents[0]).toEqual({id:A, text:A}))
  it('has the expected map records',() => expect(cloudTrist.map).toEqual([{id:A, isDeleted:false}]))
  it('has the correct author', () => expect(cloudTrist.revisions[0].authorId).toEqual(BOB))
  it('has exactly 0 edits', () => expect(cloudTrist.revisions[0].edits.length).toEqual(0))
  it('has exactly 1 add', () => expect(cloudTrist.revisions[0].adds.length).toEqual(1))
  it('has exactly 0 deletes', () => expect(cloudTrist.revisions[0].dels.length).toEqual(0))
  it('has a reasonable revision date', () => expect(daysFrom(cloudTrist.revisions[0].date)).toBeGreaterThan(-1))
  it('has the expected add', () => expect(cloudTrist.revisions[0].adds).toEqual([A]))
  afterAll(() => {  })
})

describe('it does a simple revision that has two lines / ', () => {
  let cloudTrist:Cloud.Trist  
  beforeEach(() => cloudTrist = revise({}, {nodes: buildChain('A.B')}, BOB))
  it('it has correct version',() => expect(cloudTrist.version).toBe(20150) )
  it('has exactly one revision',() => expect(cloudTrist.revisions.length).toBe(1))
  it('has the correct number of content records',() => expect(cloudTrist.contents.length).toBe(2))
  it('has the correct number of map records',() => expect(cloudTrist.map.length).toBe(2))
  it('has the expected content records',() => expect(cloudTrist.contents).toEqual([{id:A, text:A},{id:B,text:B}]))
  it('has the expected map records',() => expect(cloudTrist.map).toEqual([
    {id:A, next:B, vnext:B, isDeleted:false},
    {id:B, rlevel:1, isDeleted:false}
    ]))
  it('has the expected adds', () => expect(cloudTrist.revisions[0].adds).toEqual([A,B]))
  afterAll(() => { })
})


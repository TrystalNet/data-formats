import * as M from '../src/whatever.ts'

describe('it runs a test', () => {
  it('gets hello test', () => {
    var result = M.sayHello()
    expect(result).toBe('hello')
  })
})


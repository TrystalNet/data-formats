declare module "@trystal/data-formats" {

  import {JS,Cloud} from "@trystal/interfaces"

  export function revise(cloudTrist:Cloud.Trist, trist:JS.Trist, authorId:string) : Cloud.Trist

}

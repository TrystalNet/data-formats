declare module "@trystal/trist-formats" {

  import {Trist,Cloud} from "@trystal/interfaces"

  export function revise(cloudTrist:Cloud.Trist, trist:Trist, authorId:string) : Cloud.Trist

}

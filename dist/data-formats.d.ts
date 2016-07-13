declare module "@trystal/data-formats" {

  import {Trist,Cloud} from "@trystal/interfaces"

  export function revise(cloudTrist:Cloud.Trist, trist:Trist, authorId:string) : Cloud.Trist

}

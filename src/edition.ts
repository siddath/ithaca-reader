import data from './generated/edition.json';
import type { Culture } from './culture-types';

type Image = {src:string;alt:string;width:number;height:number};
type Link = {href:string;label:string};
export type Work = {id:string;title:string;author?:string;unit:string;plural?:string;numbering:'roman'|'arabic'|'none';description?:string;sourceLabel?:string;sourceNote?:string;groups?:{title:string;start:number;end:number}[];endLink?:Link};
type Edition = {
  site:{name:string;wordmark?:string;title:string;description:string;storageKey:string;lang?:string;direction?:'ltr'|'rtl';footer?:string;searchPlaceholder?:string;typePreview?:string};
  cover:{author?:string;prefix?:string;title:string;description?:string;caption?:string;editionLine?:string;start:string;image?:Image};
  works:Work[];culture?:Culture;navLink?:Link;sectionLabels?:Record<string,string>;
  frontispiece?:{image:Image;caption:string;title:string;description:string;href:string;linkLabel:string};
  downloads:{href:string;label:string}[];
  about:{title:string;intro:string;sections:{id:string;title:string;html:string}[]};
};
export const edition = data as Edition;
export function workFor(id:string):Work {return edition.works.find(w=>w.id===id)??edition.works[0];}
export function numberFor(id:string,n:number){
  if(workFor(id).numbering!=='roman')return String(n);
  let result='';for(const [value,symbol] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']] as const){while(n>=value){result+=symbol;n-=value;}}return result;
}
document.documentElement.lang=edition.site.lang??'en';
document.documentElement.dir=edition.site.direction??'ltr';

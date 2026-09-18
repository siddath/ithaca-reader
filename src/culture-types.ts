export type CultureSource = {label:string;url:string};
export type Artwork = {
  id:string;title:string;artist:string;date:string;medium:string;collection:string;accession?:string;
  kind:'painting'|'object';relationship:'episode'|'context';chapterIds:string[];
  image:{src:string;alt:string;width:number;height:number;thumbnail?:string};
  summary:string;context:string;looking:string;reading:string;question:string;
  sources:CultureSource[];rights:{label:string;url:string;credit:string};
};
export type CulturalTheme = {id:string;title:string;lead:string;paragraphs:string[];chapterIds:string[];sources:CultureSource[]};
export type Culture = {
  title:string;description:string;introduction:string[];featured:string;
  artworks:Artwork[];themes:CulturalTheme[];
  chapters:{chapterId:string;title:string;text:string;themeIds:string[]}[];
};

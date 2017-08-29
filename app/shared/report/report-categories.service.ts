// Get the imageMarker depending on the report type
export class ReportCategoriesService {

    private categoryResources : Map<string, string>;
    private imageColors: Map<string, string>;
    private disableColors: Map<string, string>;
    private i18nTags: Map<string, string>;

    constructor() {
        this.categoryResources = new Map<string,string>();
        this.categoryResources.set("Daño de agua","res://water");
        this.categoryResources.set("Acera bloqueada","res://blocked");
        this.categoryResources.set("Basura","res://garbage");
        this.categoryResources.set("Buen ejemplo","res://heart");
        this.categoryResources.set("Agua empozada","res://water2");
        this.categoryResources.set("Hueco","res://hole");
        this.categoryResources.set("Señal tránsito","res://signal");
        this.categoryResources.set("Malos olores","res://bad_smells");
        this.categoryResources.set("Otra","res://question");
        this.categoryResources.set("Daño de luz","res://light");

        this.imageColors = new Map<string,string>();
        this.imageColors.set("Daño de agua","#6FC7C2");
        this.imageColors.set("Acera bloqueada","#B95B5D");
        this.imageColors.set("Basura","#57636F");
        this.imageColors.set("Buen ejemplo","#F07B73");
        this.imageColors.set("Agua empozada","#4389A8");
        this.imageColors.set("Hueco","#B6C965");
        this.imageColors.set("Señal tránsito","#9B789E");
        this.imageColors.set("Malos olores","#ADA1A1");
        this.imageColors.set("Otra","#E58761");
        this.imageColors.set("Daño de luz","#FDD672");

        this.disableColors = new Map<string,string>();
        this.disableColors.set("Daño de agua","#95DBD6");
        this.disableColors.set("Acera bloqueada","#D37F83");
        this.disableColors.set("Basura","#707D87");
        this.disableColors.set("Buen ejemplo","#F79C9A");
        this.disableColors.set("Agua empozada","#6D9EAF");
        this.disableColors.set("Hueco","#CEDB82");
        this.disableColors.set("Señal tránsito","#B497B7");
        this.disableColors.set("Malos olores","#B7ACAC");
        this.disableColors.set("Otra","#F29F83");
        this.disableColors.set("Daño de luz","#F9DD8F");

        this.i18nTags = new Map<string,string>();
        this.i18nTags.set("Daño de agua","water_damage");
        this.i18nTags.set("Acera bloqueada","blocked_sidewalk");
        this.i18nTags.set("Basura","garbage");
        this.i18nTags.set("Buen ejemplo","good_example");
        this.i18nTags.set("Agua empozada","stagnant_water");
        this.i18nTags.set("Hueco","hole");
        this.i18nTags.set("Señal tránsito","traffic_signal");
        this.i18nTags.set("Malos olores","bad_smells");
        this.i18nTags.set("Otra","other");
        this.i18nTags.set("Daño de luz","light_damage");
     }

     public getCategoryResource(key: string) {
         return this.categoryResources.get(key);
     }

     public getImageColor(key: string) {
         return this.imageColors.get(key);
     }

      public getDisableColor(key: string) {
         return this.disableColors.get(key);
     }

     public getI18nTag(key: string) {
         return this.i18nTags.get(key);
     }

     
}
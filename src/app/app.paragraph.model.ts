export class AppParagraphModel {
    public _id = '';
    public religion = '';
    public book = '';
    public pos = '';
    public text = '';

    constructor(myObj: any = {}) {
        (<any>Object).assign(this, myObj);
    }
}

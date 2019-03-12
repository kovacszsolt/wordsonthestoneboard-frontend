import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppParagraphModel} from '../app.paragraph.model';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AppServiceRemote {
    public constructor(private http: HttpClient) {
    }

    public getData(): Observable<AppParagraphModel[]> {
        return this.http.get<AppParagraphModel[]>('https://wordsonthestoneboard.com/backend/list' ).pipe(
            map(responseList => responseList.map(response => new AppParagraphModel(response)))
        );
    }
    public getSearch(text): Observable<AppParagraphModel[]> {
        return this.http.get<AppParagraphModel[]>('https://wordsonthestoneboard.com/backend/find/' + text).pipe(
            map(responseList => responseList.map(response => new AppParagraphModel(response)))
        );
    }

}

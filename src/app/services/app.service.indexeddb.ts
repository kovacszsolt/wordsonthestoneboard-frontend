import {AppParagraphModel} from '../app.paragraph.model';
import {Observable} from 'rxjs';
import {EventEmitter} from '@angular/core';

export class AppServiceIndexeddb {

    public getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const dbRequest = indexedDB.open('religionDB', 1);
            dbRequest.onupgradeneeded = (event) => {
                const db = event.target['result'];
                if (!db.objectStoreNames.contains('paragraph')) {
                    const paragraphListStore = db.createObjectStore('paragraph', {autoIncrement: true});
                    paragraphListStore.createIndex('religion', 'religion', {unique: false});
                }
            };
            dbRequest.onsuccess = (event: Event) => {
                if (event.type === 'success') {
                    resolve(event.target['result']);
                }
            };
            dbRequest.onerror = function (event) {
                console.log('onerror', event);
            };
            dbRequest.onblocked = function (event) {
                console.log('onblocked', event);
            };

        });
    }

    public count(db): Promise<number> {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('paragraph');
            const objectStore = transaction.objectStore('paragraph');
            const count = objectStore.count();
            count.onsuccess = (countSuccessResult) => {
                resolve(countSuccessResult.target.result);
            };
        });
    }

    public addMultiplePromise(records, db) {
        const transaction = db.transaction('paragraph', 'readwrite');
        const objectStore = transaction.objectStore('paragraph');
        return Promise.all(records.map(record => this.add(objectStore, record)));
    }

    public add(objectStore, record) {
        return new Promise((resolve, reject) => {
            const addObject = objectStore.add(record);
            addObject.onsuccess = (addResult) => {
                if (addResult.type === 'success') {
                    resolve(true);

                }
            };
            addObject.onerror = (errorResult) => {

            };
        });
    }

    public searchText(text, db): Observable<AppParagraphModel> {
        return new Observable(observer => {
            const transaction = db.transaction('paragraph', 'readonly');
            const objectStore = transaction.objectStore('paragraph');
            const request = objectStore.openCursor();
            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.text) {
                        if (cursor.value.text.toUpperCase().indexOf(text.toUpperCase()) !== -1) {
                            observer.next(cursor.value);
                        }
                    }
                    cursor.continue();
                } else {
                    observer.complete();

                }
            };
        });
    }

    public searchTextGet(text, db): Observable<AppParagraphModel[]> {
        return new Observable(observer => {
            const transaction = db.transaction('paragraph', 'readonly');
            const objectStore = transaction.objectStore('paragraph');
            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                if (event.type === 'success') {
                    const records = event.target.result.filter(record => String(record.text).valueOf().includes(text)).map(record => new AppParagraphModel(record));
                    observer.next(records);
                }
            };
        });
    }
}

import {Component, OnInit} from '@angular/core';
import {Subscriber} from 'rxjs';
import {AppServiceIndexeddb} from './services/app.service.indexeddb';
import {AppServiceRemote} from './services/app.service.remote';
import {AppServiceSql} from './services/app.service.sql';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private db;
    private searchObserver;
    private readonly PAGESIZE = 5;

    public searchText = '';
    public isLoading = true;
    public isSearching = false;
    public currentPage = 1;
    public resultListShow = [];
    public resultList = [];
    public searchState = '';
    public fullLength = 0;
    public offline = false;
    public currentPos = '';
    public isDataImportToDatabase = false;

    public get maxPage() {
        return Math.ceil(this.resultList.length / this.PAGESIZE);
    }

    public databaseType: databaseTypeEnum = databaseTypeEnum.WebSQL;

    constructor(
        private appServiceIndexeddb: AppServiceIndexeddb,
        private appServiceRemote: AppServiceRemote,
        private appServiceSql: AppServiceSql) {
    }

    ngOnInit(): void {
        // check WEBSQL working
        if ((<any>window).openDatabase === undefined) {
            this.databaseType = databaseTypeEnum.IndexedDB;
        } else {
            this.databaseType = databaseTypeEnum.WebSQL;
        }

        if (this.databaseType === databaseTypeEnum.IndexedDB) {
            this.initIndexedDB();
        } else {
            this.initWebSQL();
        }
    }

    /**
     * initialization Block Begin
     */
    private initIndexedDB() {
        this.appServiceIndexeddb.getDB().then((db) => {
            this.db = db;
            this.currentPos = 'Database OK';
            this.appServiceIndexeddb.count(this.db).then((rowCount) => {
                this.initFinish(rowCount);
            });
        });
    }

    private initWebSQL() {
        this.appServiceSql.getDB().then((db) => {
            this.db = db;
            this.appServiceSql.count(this.db).then((rowCount) => {
                this.initFinish(rowCount);
            });
        });
    }

    private initFinish(rowCount) {
        this.fullLength = rowCount;
        this.offline = (rowCount !== 0);
        this.isLoading = false;
    }
    /**
     * initialization Block End
     */

    /**
     * Search Block Begin
     */
    public search() {
        if (this.searchText !== '') {
            this.isSearching = true;
            this.resultList = [];
            this.resultListShow = [];
            this.currentPage = 1;
            if (this.offline) {
                this.searchOffline();
            } else {
                this.searchOnline();
            }
        }
    }

    private searchOnline() {
        this.appServiceRemote.getSearch(this.searchText).subscribe((resultList) => {
            console.log('resultList', resultList);
            this.resultList = resultList;
            this.pageGoto(1);
            this.isSearching = false;
        });
    }

    private searchOffline() {
        if (this.databaseType === databaseTypeEnum.IndexedDB) {
            this.searchIndexedDB();
        } else {
            this.searchWebSQL();
        }
    }

    private searchIndexedDB() {
        const resultCountStart = (this.currentPage - 1) * this.PAGESIZE;
        const resultCountEnd = this.currentPage * this.PAGESIZE;
        if (this.searchObserver instanceof Subscriber) {
            this.searchObserver.unsubscribe();
        }
        this.searchObserver = this.appServiceIndexeddb.searchText(
            this.searchText,
            this.db
        ).subscribe(
            (resultList) => {
                this.resultList.push(resultList);
                if ((this.resultList.length >= resultCountStart) && (this.resultList.length <= resultCountEnd)) {
                    this.resultListShow.push(resultList);
                    this.searchState = 'searching';
                } else {
                    this.searchState = 'caching';
                }
                this.isSearching = false;
            },
            () => {
            },
            () => {
                this.isSearching = false;
                this.searchState = '';
            }
        );
    }

    private searchWebSQL() {
        this.appServiceSql.searchText(this.db, this.searchText).then((resultList) => {
            this.resultList = resultList;
            this.isSearching = false;
            this.searchState = '';
            this.pageGoto(1);

        });
    }
    /**
     * Search Block End
     */


    public pageGoto(pageNumber) {
        this.currentPage = pageNumber;
        this.resultListShow = this.resultList.slice((this.currentPage - 1) * this.PAGESIZE, this.currentPage * this.PAGESIZE);
    }

    /**
     * Create Database Block Start
     */
    private createStorage() {
        this.isDataImportToDatabase = true;
        this.currentPos = 'Fetching Data from Server';
        this.appServiceRemote.getData().subscribe((dataList) => {
            this.currentPos = 'Add Data to Database';
            if (this.databaseType === databaseTypeEnum.IndexedDB) {
                this.createIndexedDB(dataList);
            } else {
                this.createWebSQL(dataList);
            }
        });
    }

    private createWebSQL(dataList) {
        this.appServiceSql.addMultiple(dataList, this.db).then(() => {
            this.storageFinish(dataList);
        });
    }

    private createIndexedDB(dataList) {
        this.appServiceIndexeddb.addMultiplePromise(dataList, this.db).then(() => {
            this.storageFinish(dataList);
        });
    }

    private storageFinish(dataList) {
        this.fullLength = dataList.length;
        this.currentPos = '';
        this.offline = true;
        this.isDataImportToDatabase = false;
    }
    /**
     * Create Database Block End
     */
}

enum databaseTypeEnum {
    WebSQL = 'WEBSQL',
    IndexedDB = 'INDEXEDDB '
}

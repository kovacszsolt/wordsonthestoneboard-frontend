export class AppServiceSql {

    public getDB() {
        return new Promise((resolve, reject) => {
            let db = (<any>window).openDatabase('religion', '1.0', 'Religion Database', 100 * 1024 * 1024);
            db.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS paragraph (_id,religion,book,pos,text)');
                resolve(db);
            });
        });
    }

    public count(db): Promise<number> {
        return new Promise((resolve, reject) => {
            db.transaction(function (tx) {
                tx.executeSql('SELECT COUNT(*) AS rowcount FROM paragraph', [], function (tx, results) {
                    resolve(parseInt(results.rows[0]['rowcount']));
                });
            });
        });
    }

    public searchText(db, text): Promise<any> {
        return new Promise((resolve, reject) => {
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM paragraph WHERE text LIKE "%' + text + '%"', [], function (tx, results) {
                    resolve(Array.from(results.rows));
                });
            });
        });
    }

    public addMultiple(records, db) {
        return new Promise((resolve, reject) => {
            let pos = records.length;
            db.transaction(function (tx) {
                records.forEach((record) => {
                    tx.executeSql('INSERT INTO paragraph(_id,religion,book,pos,text) VALUES (?,?,?,?,?)',
                        [record._id, record.religion, record.book, record.pos, record.text], (tx1) => {
                            pos--;
                            if (pos === 0) {
                                resolve(true);
                            }

                        });
                });
            });
        });
    }
}

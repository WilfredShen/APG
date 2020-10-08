const dbName = "apg";
const dbVersion = 1;

export default {
  initDB: function () {
    var request = indexedDB.open(dbName, dbVersion);
    request.onerror = function () {
      return false
    };
    request.onsuccess = function () {
    };
    request.onupgradeneeded = function (event) {
      var db = event.target.result;
      if (!db.objectStoreNames.contains("user")) {
        var objectStore = db.createObjectStore("user", {
          keyPath: "username",
        });
        objectStore.createIndex("password", "password", { unique: false });
        objectStore.createIndex("phone", "phone", { unique: true });
      }
    };
    return true;
  },
  openDB: function () {
    return new Promise((resolve, reject) => {
      var request = indexedDB.open(dbName, dbVersion);
      request.onerror = function (event) {
        reject("IndexedDB数据库打开错误，" + event);
      };
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };
    });
  },
  insert: async function (table, data) {
    var db = await this.openDB();
    return new Promise((resolve, reject) => {
      var request = db
        .transaction([table], 'readwrite')
        .objectStore(table)
        .add(data);
      request.onerror = function (event) {
        reject('数据写入失败' + event);
      }
      request.onsuccess = function () {
        resolve(request.result);
      }
    })
  },
  update: async function (table, data) {
    var db = await this.openDB();
    return new Promise((resolve, reject) => {
      var request = db
        .transaction([table], 'readwrite')
        .objectStore(table)
        .put(data);
      request.onerror = function (event) {
        reject('数据更新失败' + event);
      }
      request.onsuccess = function () {
        resolve(request.result);
      }
    })
  },
  select: async function (table, key, index) {
    var db = await this.openDB();
    return new Promise((resolve, reject) => {
      var store = db.transaction([table]).objectStore(table);
      var request;
      if (!index)
        request = store.get(key);
      else
        request = store.index(index).get(key);
      request.onerror = function (event) {
        reject('数据读取失败' + event);
      }
      request.onsuccess = function () {
        resolve(request.result);
      }
    })
  }
}
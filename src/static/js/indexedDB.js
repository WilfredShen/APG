const dbName = "apg";
const dbVersion = 1;

export default {
  /**
   * 初始化 IndexedDB 数据库
   */
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
  /**
   * 打开数据库
   * @return {Promise} 打开结果
   */
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
  /**
   * 异步向指定表中插入数据
   * @param {string} table 表名
   * @param {Object} data 要插入的数据
   * @return {Promise} 插入结果
   */
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
  /**
   * 异步更新表中的数据
   * @param {string} table 表名
   * @param {Object} data 要更新的数据
   * @return {Promise} 更新结果
   */
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
  /**
   * 根据主键或索引异步查询数据
   * @param {string} table 表名
   * @param {Object} key 主键/索引值
   * @param {string} index 索引名：若未指定索引名，则根据主键查询；若指定索引名，则根据指定索引查询
   * @return {Promise} 查询结果
   */
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
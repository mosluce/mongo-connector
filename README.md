## 用途
簡化 mongoose 連線流程，相同的連線名稱不重複連線

## 安裝
```shell
npm install --save mongo-connector
```

## Model 樣版
```javascript
module.exports = function (Schema) {
    return {
        table: 'Hello',
        schema: {
            fielda: String,
            fieldb: Number,
            fieldc: {
                type: Schema.Types.ObjectId
            }
        }
    };
};
```

```
欄位行別可參考 http://mongoosejs.com/docs/guide.html
```

## 環境變數
- MODEL_DIR: 主要放置 Model 的資料夾，會在連線完成後自動載入這些 Model
- MONGO_URL: 主要連線 URL

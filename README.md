# dddep
[analizeJava.js](https://github.com/naosim/analizeJava.js)で生成されたjsonを用いてさまざまなアウトプットをします。

## usage
※ analizeJava.jsの結果が`./javaClasses.json`に出力されていることを前提にしています。
### 指定したAPIの依存関係をmermaid形式で出力する
下記コマンドを実行すると標準出力されます。

```sh
node index.mjs ./javaClasses.json package.to.api.HogeApi
```

### すべてのAPIと依存するリポジトリの表(csv)を生成する
```sh
node ./apiRepoMatrix.mjs ./javaClasses.json > table.csv
```

### 表示したくないクラスを追加する
ignoreClasses.mjsに追加すると、そのクラスは無視されます。
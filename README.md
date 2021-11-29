# Twitter replace mute
Twitter用の単語置換ミュート。

## Install
- Install [Tampermonkey](https://www.tampermonkey.net)
- [Click me](https://github.com/coke12103/twitter-replace-mute/raw/master/twitter_replace_mute.user.js)

## Features
- Objectで記述する高度な置換ミュート
- 単語を選択してミュートできる簡易ミュート
- デフォルトの置換先テキストの定義

## Usage
- スクリプトを編集し、以下を行う
  - 置換ミュートを好きに記述する
  - デフォルトの置換先テキストを好きに変更する
  - 簡易ミュート使うなら`ENABLE_MENU_BLOCK`を`true`にする
- 保存する。

## ミュートの記述
1. 単語のみ指定
```
{
  from: "ミュートされる単語"
}
```
デフォルトの置換先テキストに置換される。

2. 単語と置換先を指定
```
{
  from: "伏せ字",
  to: "***"
}
```
`伏せ字`が`***`へ置換される。

3. 正規表現を利用して置換
```
{
  from: "GTX([0-9]+)",
  to: "RTX$1",
  regexp: true
},
```
`GTX1080`が`RTX1080`になる。

4. 大文字小文字区別なしで置換
```
{
  from: "javascript",
  to: "JavaScript",
  ignore_case: true
}
```
`JAVASCRIPT`とか`javascript`が`JavaScript`になる。(正規表現との併用も可)

## 簡易ミュートの仕様
- 大文字小文字区別あり
- 正規表現ではなく単純な単語置換
- Tampermonkeyのストレージに保存

# License
CC0
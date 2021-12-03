// ==UserScript==
// @name         Twitter replace mute
// @namespace    https://github.com/coke12103
// @version      0.0.2
// @description  指定したキーワードを指定した文字に置き換えることでミュートします。
// @author       coke12103
// @match        https://twitter.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      CC0
// ==/UserScript==

// CONFIG AREA

// ミュートするワード
// from: 置換元
// to: 置換先
// regexp: 正規表現か
// ignore_case: 大文字小文字を無視するか
const REPLACE_WORDS = [
  // 置換元の単語のみ指定
  {
    from: "test"
  },
  // 置換先の単語も指定
  {
    from: "テスト",
    to: "***"
  },
  // 正規表現を利用した高度な置換
  {
    from: "GTX([0-9]+)",
    to: "RTX$1",
    regexp: true
  },
  // 大文字小文字区別なし
  {
    from: "javascript",
    to: "JavaScript",
    ignore_case: true
  }
];

// REPLACE_WORDSにおいて、toが指定されていない場合、または簡易ブロック時に使われるデフォルトの置換先
const DEFAULT_REPLACE_TO = "[編集済]";

// Tampermonkeyのメニューを利用した簡易ブロックを利用するか。
// 簡易ブロックはTampermonkeyのストレージに単語を保存する点に注意。
const ENABLE_MENU_BLOCK = true;

// END CONFIG AREA

let replace_words = [];

function escape_regexp(str){
  return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function reload(){
  let new_replace_words = [];

  for(const word_info of REPLACE_WORDS){
    const opt = word_info.ignore_case ? 'gi' : 'g';
    const from = word_info.regexp ? word_info.from : escape_regexp(word_info.from);

    const replace_regexp = new RegExp(from, opt);

    const data = {
      regexp: replace_regexp,
      to: word_info.to ? word_info.to : DEFAULT_REPLACE_TO
    };

    new_replace_words.push(data);
  }

  if(ENABLE_MENU_BLOCK){
    for(const word of GM_getValue('wordList', [])){
      const replace_regexp = new RegExp(escape_regexp(word), 'g');
      const data = {
        regexp: replace_regexp,
        to: DEFAULT_REPLACE_TO
      };

      new_replace_words.push(data);
    }
  }

  replace_words = new_replace_words;
}

function replace_all(str){
  let result = str;

  try{
    for(const data of replace_words) result = result.replace(data.regexp, data.to);
  }catch(e){
    // 失敗したら適当に元のテキストを返す
    console.log(e);
    result = str;
  }

  return result;
}

function is_child_text(element){
  let result = false;

  try{
    for(const el of element.childNodes) if(el.nodeName == "#text") result = true;
  }catch(e){
    console.log(e);
  }

  return result;
}

function callback(mutations){
  for(const mutation of mutations){
    const target_elements = mutation.target.querySelectorAll('[role="article"]');

    for(const element of target_elements){
      // テキストが含まれるspanのみを抽出する
      // このセレクタでRT時の名前、名前、本文が抽出できる。
      // 但し余分なspanも混ざるのでそこだけ適当に処理段階でフィルターする
      //
      // divとaで別のセレクタを使用することにした(壊れるので)
      const text_elements = element.querySelectorAll('div[dir="auto"] span:not([data-testid="socialContext"]):not([aria-hidden="true"])');

      for(const tx_el of text_elements){
        if(!is_child_text(tx_el)) continue;

        tx_el.innerText = replace_all(tx_el.innerText);
      }

      const a_text_elements = element.querySelectorAll('a[dir="auto"][id] span:not([data-testid="socialContext"]:not([aria-hidden="true"]))');

      for(const tx_el of a_text_elements){
        if(!is_child_text(tx_el)) continue;

        tx_el.innerText = replace_all(tx_el.innerText);
      }

      // ハッシュタグを抽出する。
      const hashtag_elements = element.querySelectorAll('a[href^="/hashtag/"]');

      for(const hash_el of hashtag_elements){
        hash_el.innerText = replace_all(hash_el.innerText);
      }
    }
  }
}

function addWord(){
  const selectedText = window.getSelection().toString();

  if(!selectedText || GM_getValue('wordList', []).some((el) => el == selectedText)) return;

  GM_setValue('wordList', GM_getValue('wordList', []).concat(selectedText));
  reload();
}

function removeWord(){
  alert("簡易ミュートの削除はTampermonkeyの設定より「設定のモード」を「上級者」にした上で、このスクリプトを開き、ストレージより一覧の中から単語を削除することで行なってください。");
}

reload();

if(ENABLE_MENU_BLOCK){
  GM_registerMenuCommand('選択範囲の単語を簡易ミュートに追加', addWord);
  GM_registerMenuCommand('簡易ミュートの削除方法を表示', removeWord);
}


const obs_target = document.querySelector("[id='react-root']");
const obs_opt = {
  childList: true,
  attributes: true,
  subtree: true
}

const observer = new MutationObserver(callback);

observer.observe(obs_target, obs_opt);

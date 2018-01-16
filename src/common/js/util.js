/*
* 解析URL参数
* @expample ?id=123,key=liSi
* @return Object {id:123,a:liSi}
* */
export function urlParse() {
  let url = window.location.search; // 拿到?id=12345&a=b这样的字符串
  console.log(url);
  let obj = {};
  let reg = /[?&][^?&]+=[^?&+]+/g; // ？或者&开头，后面跟着非？&的字符，后面是等号，后面是非？&的字符的字符串
  let arr = url.match(reg); // 数组
  // ['?id=12345','&a=b']
  if (arr) {
    arr.forEach((item) => {
      let tempArr = item.substring(1).split('=');
      let key = decodeURIComponent(tempArr[0]);  // decodeURIComponent() 函数可对 encodeURIComponent() 函数编码的 URI 进行解码。
      let value = decodeURIComponent(tempArr[1]);
      obj[key] = value;
    });
  }
  return obj;
}

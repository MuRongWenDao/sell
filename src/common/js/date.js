export function formatDate(date, fmt) {
  // console.log(date);  // Sat Jul 23 2016 21:52:44 GMT+0800 (中国标准时间)
  // fmt: yyyy-MM-dd hh:mm
  // 匹配替换年份yyyy，y有几位就替换几位
  if (/(y+)/.test(fmt)) {
    //  RegExp.$1匹配的是 y+，上一行括号内的值，替换后fmt值变为 2016-MM-dd hh:mm
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '')).substr(4 - RegExp.$1.length);
  }
  // console.log(fmt);  2016-MM-dd hh:mm
  let o = {
    'M+': date.getMonth() + 1,   // getMonth从0开始算起
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {       // 处理相同格式的月日时分秒
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
};

// 例如，如果月份格式MM是两位，那么9月就是009再减去它的长度1
// 就是09
function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}

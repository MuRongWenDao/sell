// 向localstorage中存数据
// 数据结构
// seller: {
//   id: {
//     favorite: true
//   }
// }
export function saveToLocal(id, key, value) {
  let seller = window.localStorage._seller_;
  if (!seller) {
    seller = {};
    seller[id] = {};
  } else {
    // localStorage直接存储的是字符串
    // 我们需要的是一个Json对象，所以要JSON.parse
    seller = JSON.parse(seller);
    if (!seller[id]) {  // 如果没有该商家
      seller[id] = {};
    }
  }
  seller[id][key] = value;
  window.localStorage._seller_ = JSON.stringify(seller); // 存储的是字符串
}

// 从本地取数据 this.seller.id, 'favorite', this.favorite (默认值)
export function loadFromLocal(id, key, def) {
  let seller = window.localStorage._seller_;
  if (!seller) {
    return def;
  }

  seller = JSON.parse(seller)[id];
  if (!seller) {
    return def;
  }
  let ret = seller[key];
  return ret || def; // 如果ret为空
};

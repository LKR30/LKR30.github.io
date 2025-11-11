// 本地存储 key
function keyOf(type){ return 'wheel_'+type; }
// 读取或初始化
function loadArr(type,def){
  const str=localStorage.getItem(keyOf(type));
  return str?JSON.parse(str):def;
}
// 保存
function saveArr(type,arr){
  localStorage.setItem(keyOf(type),JSON.stringify(arr));
}


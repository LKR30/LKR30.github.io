let currentArr=[], currentType='', wheelEl, btnEl, inputEl;

function initPage(defArr,type){
  currentArr=loadArr(type,defArr);
  currentType=type;
  wheelEl=document.getElementById('wheel');
  btnEl=document.getElementById('goBtn');
  inputEl=document.getElementById('addInput');

  drawWheel(wheelEl,currentArr);

  btnEl.addEventListener('click',startSpin);
  inputEl.addEventListener('keypress',e=>{if(e.key==='Enter')addItem();});
}

function randColor(){
  return `hsl(${Math.floor(Math.random()*360)},70%,80%)`;
}

function drawWheel(el,arr){
  el.innerHTML='';
  const len=arr.length;
  if(!len)return el.style.background='#fff';
  const ang=360/len;
  const bg=[];
  for(let i=0;i<len;i++)bg.push(`${randColor()} ${i*ang}deg ${(i+1)*ang}deg`);
  el.style.background=`conic-gradient(${bg.join(',')})`;

  arr.forEach((txt,i)=>{
    const sp=document.createElement('span');
    const a=i*ang+ang/2;
    sp.style.cssText=`position:absolute;left:50%;top:50%;
transform:translate(-50%,-50%) rotate(${a}deg) translateY(-95px);
transform-origin:center;font-size:min(2.2vmin,14px);font-weight:bold;color:#222;
white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis;pointer-events:none;`;
    sp.textContent=txt; sp.title=txt;
    el.appendChild(sp);
  });
}

function addItem(){
  const v=inputEl.value.trim();
  if(!v)return;
  if(currentArr.includes(v))return alert('已存在');
  currentArr.push(v); inputEl.value='';
  saveArr(currentType,currentArr);
  drawWheel(wheelEl,currentArr);
}

function startSpin(){
  if(btnEl.disabled)return;
  btnEl.disabled=true;
  const len=currentArr.length;
  if(!len){alert('列表为空');btnEl.disabled=false;return;}
  const ang=360/len;
  const pick=Math.floor(Math.random()*len);
  const base=5*360;
  const final=base+(360-pick*ang-ang/2);
  wheelEl.classList.add('spinning');
  wheelEl.style.transform=`rotate(${final}deg)`;
  setTimeout(()=>{
    alert(`结果：${currentArr[pick]}`);
    wheelEl.classList.remove('spinning');
    wheelEl.style.transition='none';
    wheelEl.style.transform=`rotate(${final%360}deg)`;
    setTimeout(()=>{wheelEl.style.transition='';btnEl.disabled=false;},30);
  },3000);
}


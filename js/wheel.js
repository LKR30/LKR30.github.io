let currentArr=[], currentType='', wheelEl, btnEl, inputEl;

function initPage(defArr,type){
  currentArr=loadArr(type,defArr);
  currentType=type;
  wheelEl=document.getElementById('wheel');
  btnEl=document.getElementById('goBtn');
  inputEl=document.getElementById('addInput');

  // 根据页面类型设置不同的输入框提示文字
  const pageTitle = document.querySelector('h2').textContent;
  if (pageTitle.includes('吃')) {
    inputEl.placeholder = '输入想吃的美食...';
  } else if (pageTitle.includes('玩')) {
    inputEl.placeholder = '输入想去的地方...';
  } else if (pageTitle.includes('喝')) {
    inputEl.placeholder = '输入想喝的饮品...';
  }

  drawWheel(wheelEl,currentArr);

  btnEl.addEventListener('click',startSpin);
  inputEl.addEventListener('keypress',e=>{if(e.key==='Enter')addItem();});
}

// 改进的颜色生成函数，确保相邻颜色差异大
function randColor(index, total) {
  // 使用固定的色相间隔，确保颜色差异明显
  const hueStep = 360 / total;
  const hue = (index * hueStep) % 360;
  
  // 使用较高的饱和度和亮度，让颜色更鲜艳
  const saturation = 70 + Math.random() * 20; // 70-90%
  const lightness = 60 + Math.random() * 20;  // 60-80%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function drawWheel(el,arr){
  el.innerHTML='';
  const len=arr.length;
  if(!len)return el.style.background='#fff';
  const ang=360/len;
  const bg=[];
  for(let i=0;i<len;i++) {
    bg.push(`${randColor(i, len)} ${i*ang}deg ${(i+1)*ang}deg`);
  }
  el.style.background=`conic-gradient(${bg.join(',')})`;

  arr.forEach((txt,i)=>{
    const sp=document.createElement('span');
    const a=i*ang+ang/2;
    sp.style.cssText=`position:absolute;left:50%;top:50%;
transform:translate(-50%,-50%) rotate(${a}deg) translateY(-95px);
transform-origin:center;font-size:min(2.2vmin,14px);font-weight:bold;color:#333;
white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis;pointer-events:none;
text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);`;
    sp.textContent=txt; sp.title=txt;
    el.appendChild(sp);
    setTimeout(() => {
      sp.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      sp.style.opacity = '1';
      sp.style.transform = `translate(-50%, -50%) rotate(${a}deg) translateY(-95px)`;
    }, 50 * i); // 错开动画时间，形成序列效果
  });
}

function addItem(){
  const v=inputEl.value.trim();
  if(!v){
    showAlert('请输入内容', false);
    return;
  }
  if(currentArr.includes(v)){
    showAlert('该选项已存在', false);
    return;
  }
  currentArr.push(v); 
  inputEl.value='';
  saveArr(currentType,currentArr);
  drawWheel(wheelEl,currentArr);
  
  // 添加成功后的视觉反馈
  inputEl.style.background = 'rgba(144, 238, 144, 0.3)';
  setTimeout(() => {
    inputEl.style.background = 'rgba(255, 255, 255, 0.9)';
  }, 1000);
}

function startSpin(){
  if(btnEl.disabled)return;
  btnEl.disabled=true;
  const len=currentArr.length;
  if(!len){
    showAlert('列表为空，请先添加选项', false);
    btnEl.disabled=false;
    return;
  }
  
  // 检查设备是否支持震动API并在开始转动时震动
  if ("vibrate" in navigator) {
    // 震动模式：短震动3次，模拟开始转动的反馈
    navigator.vibrate([50, 10, 50, 10, 50]);
  }
  
  // 确保移除之前的过渡效果
  wheelEl.style.transition = 'none';
  // 重置旋转角度
  wheelEl.style.transform = 'rotate(0deg)';
  
  // 强制重绘
  wheelEl.offsetHeight;
  
  const ang=360/len;
  const pick=Math.floor(Math.random()*len);
  const base=5*360; // 至少转5圈
  const final=base+(360-pick*ang-ang/2);
  
  // 应用动画类和过渡效果
  wheelEl.classList.add('spinning');
  wheelEl.style.transition = 'transform 3s cubic-bezier(.2,.8,.2,1)';
  wheelEl.style.transform=`rotate(${final}deg)`;
  
  // 转动过程中添加震动效果（在1.5秒时）
  setTimeout(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  }, 1000);
  
  setTimeout(()=>{
    // 转盘停止时再次震动，提供结束反馈
    if ("vibrate" in navigator) {
      navigator.vibrate(500);
    }
    
    showAlert(currentArr[pick], true);
    wheelEl.classList.remove('spinning');
    // 保留最终角度但移除过渡效果
    wheelEl.style.transition='none';
    wheelEl.style.transform=`rotate(${final%360}deg)`;
    
    // 小延迟后恢复过渡效果，避免下次点击无动画
    setTimeout(()=>{
      wheelEl.style.transition='';
      btnEl.disabled=false;
    },50);
  },3000);
}

// 显示自定义弹窗
function showAlert(message, isResult = true) {
  const alertEl = document.getElementById('customAlert');
  const resultEl = document.getElementById('alertResult');
  const confirmBtn = document.getElementById('alertConfirm');
  const titleEl = document.querySelector('.alert-title');
  
  if (isResult) {
    // 根据页面类型设置不同的标题
    let titleText = '推荐结果';
    let emoji = '🎯';
    
    // 获取页面标题来判断当前页面类型
    const pageTitle = document.querySelector('h2').textContent;
    if (pageTitle.includes('吃')) {
      titleText = '今天吃这个！';
      emoji = '🍽️';
    } else if (pageTitle.includes('玩')) {
      titleText = '今天去这里！';
      emoji = '🎡';
    } else if (pageTitle.includes('喝')) {
      titleText = '今天喝这个！';
      emoji = '🥤';
    }
    
    titleEl.innerHTML = `${emoji} ${titleText}`;
    resultEl.textContent = message;
  } else {
    // 错误提示信息
    titleEl.innerHTML = '⚠️ 提示';
    resultEl.textContent = message;
  }
  
  alertEl.classList.add('show');
  
  // 点击确认按钮关闭弹窗
  confirmBtn.onclick = function() {
    alertEl.classList.remove('show');
  };
  
  // 点击背景关闭弹窗
  alertEl.onclick = function(e) {
    if (e.target === alertEl) {
      alertEl.classList.remove('show');
    }
  };

    // 添加结果文本动画
  resultEl.style.opacity = '0';
  resultEl.style.transform = 'translateY(20px)';
  resultEl.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  alertEl.classList.add('show');
  
  // 触发重绘后执行动画
  setTimeout(() => {
    resultEl.textContent = message;
    resultEl.style.opacity = '1';
    resultEl.style.transform = 'translateY(0)';
  }, 50);
}

// 修复文字动画变量绑定
const originalDrawWheel = drawWheel;
drawWheel = function(el, arr) {
  originalDrawWheel(el, arr);
  // 为每个选项设置动画变量
  const spans = el.querySelectorAll('span');
  spans.forEach(span => {
    // 正确提取旋转角度值（仅数字部分）
    const rotateVal = span.style.transform.match(/rotate\(([^)]+)\)/)[1];
    span.style.setProperty('--a', rotateVal);
  });
};


// 长按事件视觉反馈
wheelEl.addEventListener('touchstart', () => {
    if (!wheelEl.classList.contains('spinning')) {
        // 添加长按视觉反馈
        wheelEl.classList.add('long-press');
        
        pressTimer = setTimeout(() => {
            // 清除逻辑保持不变...
            // 清除后移除视觉反馈
            wheelEl.classList.remove('long-press');
        }, 1500);
    }
}, { passive: true });

// 在touchend和touchcancel中移除视觉反馈
wheelEl.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
    wheelEl.classList.remove('long-press');
});

wheelEl.addEventListener('touchcancel', () => {
    clearTimeout(pressTimer);
    wheelEl.classList.remove('long-press');
});
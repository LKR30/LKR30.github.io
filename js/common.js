// 解决iOS :active伪类失效问题
document.body.addEventListener('touchstart', function() {});

// 本地存储功能
function keyOf(type){ return 'wheel_'+type; }
function loadArr(type,def){
    const str=localStorage.getItem(keyOf(type));
    return str?JSON.parse(str):def;
}
function saveArr(type,arr){
    localStorage.setItem(keyOf(type),JSON.stringify(arr));
}

/* ===== iOS 26 导航栏交互逻辑 - 简化版 ===== */
document.addEventListener('DOMContentLoaded', function() {
    const tab = document.querySelector('.liquidTab');
    if (!tab) return;

    const links = [...tab.querySelectorAll('a')];
    
    // 设置初始active状态 - 基于当前页面
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let currentActiveIndex = links.findIndex(link => {
        const href = link.getAttribute('href');
        // 处理首页特殊情况
        if (currentPage === '' || currentPage === 'index.html') {
            return href === 'index.html';
        }
        return href === currentPage;
    });
    
    if (currentActiveIndex === -1) currentActiveIndex = 0;
    
    // 初始化active状态
    updateActiveState(currentActiveIndex);

    /* 按钮点击事件处理 */
    links.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            // 阻止默认行为，我们手动处理跳转
            e.preventDefault();
            
            // 更新active状态
            updateActiveState(index);
            
            // 添加按压反馈
            this.style.transform = 'scale(0.95)';
            this.style.background = 'rgba(255, 255, 255, 0.3)';
            
            // 短暂延迟后恢复并跳转
            setTimeout(() => {
                this.style.transform = '';
                this.style.background = '';
                
                // 跳转到目标页面
                if (this.href) {
                    window.location.href = this.href;
                }
            }, 150);
        });
        
        // 触摸反馈
        link.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.background = 'rgba(255, 255, 255, 0.3)';
            this.style.transition = 'all 0.1s';
        }, { passive: true });
        
        link.addEventListener('touchend', function() {
            this.style.transform = '';
            this.style.background = '';
            this.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
    });

    /* 更新active状态的函数 */
    function updateActiveState(index) {
        // 移除所有active状态
        links.forEach(link => {
            link.classList.remove('active');
        });
        
        // 为当前按钮添加active状态
        if (links[index]) {
            links[index].classList.add('active');
        }
    }
});

/* ===== 转盘相关功能保持不变 ===== */
let currentArr = [], currentType = '', wheelEl, btnEl, inputEl;

function initPage(defArr, type) {
    currentArr = loadArr(type, defArr);
    currentType = type;
    wheelEl = document.getElementById('wheel');
    btnEl = document.getElementById('goBtn');
    inputEl = document.getElementById('addInput');

    drawWheel(wheelEl, currentArr);

    btnEl.addEventListener('click', startSpin);
    inputEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addItem();
    });
}

function randColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;
}

function drawWheel(el, arr) {
    el.innerHTML = '';
    const len = arr.length;
    if (!len) return el.style.background = '#fff';
    
    const ang = 360 / len;
    const bg = [];
    for (let i = 0; i < len; i++) {
        bg.push(`${randColor()} ${i * ang}deg ${(i + 1) * ang}deg`);
    }
    el.style.background = `conic-gradient(${bg.join(',')})`;

    arr.forEach((txt, i) => {
        const sp = document.createElement('span');
        const a = i * ang + ang / 2;
        sp.style.cssText = `position:absolute;left:50%;top:50%;
            transform:translate(-50%,-50%) rotate(${a}deg) translateY(-95px);
            transform-origin:center;font-size:min(2.2vmin,14px);font-weight:bold;
            color:#222;white-space:nowrap;max-width:80px;overflow:hidden;
            text-overflow:ellipsis;pointer-events:none;`;
        sp.textContent = txt;
        sp.title = txt;
        el.appendChild(sp);
    });
}

function addItem() {
    const v = inputEl.value.trim();
    if (!v) return;
    if (currentArr.includes(v)) return alert('已存在');
    
    currentArr.push(v);
    inputEl.value = '';
    saveArr(currentType, currentArr);
    drawWheel(wheelEl, currentArr);
}

function startSpin() {
    if (btnEl.disabled) return;
    btnEl.disabled = true;
    
    const len = currentArr.length;
    if (!len) {
        alert('列表为空');
        btnEl.disabled = false;
        return;
    }
    
    const ang = 360 / len;
    const pick = Math.floor(Math.random() * len);
    const base = 5 * 360;
    const final = base + (360 - pick * ang - ang / 2);
    
    wheelEl.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)';
    wheelEl.style.transform = `rotate(${final}deg)`;
    
    setTimeout(() => {
        alert(`结果：${currentArr[pick]}`);
        wheelEl.style.transition = 'none';
        wheelEl.style.transform = `rotate(${final % 360}deg)`;
        setTimeout(() => {
            wheelEl.style.transition = '';
            btnEl.disabled = false;
        }, 30);
    }, 3000);
}
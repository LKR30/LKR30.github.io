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

/* ===== iOS 26 导航栏水滴滑动效果（完整实现） ===== */
document.addEventListener('DOMContentLoaded', function() {
    const tab = document.querySelector('.liquidTab');
    if (!tab) return;

    // 关键：获取水滴DOM元素（必须在HTML中添加.liquid-drop元素）
    const drop = tab.querySelector('.liquid-drop');
    const links = [...tab.querySelectorAll('a')];
    const tabRect = tab.getBoundingClientRect();
    const linkWidth = tabRect.width / links.length;
    const tabHeight = tabRect.height; // 导航栏高度
    
    let startX = 0;
    let startY = 0;
    let currentIndex = 0;
    let isDragging = false;
    let indicator = null; // 滑动指示器
    let lastPosition = { x: 0, y: 0 }; // 记录上一次位置

    // 1. 初始化当前页面的active状态
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    currentIndex = links.findIndex(link => {
        const href = link.getAttribute('href');
        return href === currentPage || (currentPage === 'index.html' && href === 'index.html');
    });
    if (currentIndex === -1) currentIndex = 0;
    updateActiveState(currentIndex);

    // 2. 核心：更新水滴位置、大小、透明度
    function updateDropPosition(index, scale = 1) {
        if (!drop) return; // 确保水滴元素存在
        
        // 计算水滴中心位置（对应当前导航项的中心）
        const position = (index * linkWidth) + (linkWidth / 2);
        
        // 直接操作水滴样式，确保动画流畅
        drop.style.left = `${position}px`;
        drop.style.transform = `translate(-50%, -50%) scale(${scale})`;
        drop.style.opacity = `${scale * 0.8}`; // 透明度跟随缩放比例
        drop.style.display = scale > 0 ? 'block' : 'none'; // 避免透明时占位置
    }

    // 3. 创建滑动指示器（椭圆）
    function createIndicator() {
        if (indicator) return;
        
        indicator = document.createElement('div');
        indicator.className = 'slide-indicator';
        // 尺寸比按钮宽20px，比导航栏高20px
        indicator.style.width = `${linkWidth + 20}px`;
        indicator.style.height = `${tabHeight + 20}px`;
        tab.appendChild(indicator);
    }

    // 4. 更新指示器位置和水滴尾部效果
    function updateIndicator(x, y) {
        if (!indicator) return;
        
        // 设置指示器位置（居中显示）
        indicator.style.left = `${x}px`;
        indicator.style.top = `${y}px`;
        indicator.style.transform = 'translate(-50%, -50%)';
        indicator.style.opacity = '1';
        
        // 计算移动方向，设置尾部效果
        const deltaX = x - lastPosition.x;
        const deltaY = y - lastPosition.y;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI; // 计算角度
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 计算距离
        
        // 设置尾部位置和大小
        const tail = indicator.querySelector('.indicator-tail');
        if (tail) {
            tail.style.transform = `rotate(${angle}deg) translateX(${Math.min(15, distance / 3)}px)`;
            tail.style.opacity = Math.min(0.7, distance / 20); // 距离越远尾部越明显
        }
        
        lastPosition = { x, y };
    }

    // 5. 隐藏指示器
    function hideIndicator() {
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator && indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
                indicator = null;
            }, 200);
        }
    }

    // 6. 触摸开始：显示水滴和指示器
    tab.addEventListener('touchstart', (e) => {
        if (!drop) return;
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        
        // 计算触摸点在导航栏内的相对位置
        const relativeX = startX - tabRect.left;
        const closestIndex = Math.min(links.length - 1, Math.max(0, Math.floor(relativeX / linkWidth)));
        currentIndex = closestIndex;
        
        // 显示水滴（初始放大1.2倍，有弹出感）
        updateDropPosition(currentIndex, 1.2);
        
        // 创建并显示滑动指示器
        createIndicator();
        // 添加水滴尾部元素
        if (!indicator.querySelector('.indicator-tail')) {
            const tail = document.createElement('div');
            tail.className = 'indicator-tail';
            indicator.appendChild(tail);
        }
        lastPosition = { 
            x: relativeX, 
            y: startY - tabRect.top 
        };
        updateIndicator(relativeX, startY - tabRect.top);
    }, { passive: true });

    // 7. 触摸移动：水滴和指示器跟随手指
    tab.addEventListener('touchmove', (e) => {
        if (!isDragging || !drop) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const relativeX = currentX - tabRect.left; // 手指在导航栏内的相对X坐标
        const relativeY = currentY - tabRect.top; // 手指在导航栏内的相对Y坐标
        
        // 计算当前手指下方对应的导航项索引
        const closestIndex = Math.min(
            links.length - 1, // 最大索引
            Math.max(0, Math.floor(relativeX / linkWidth)) // 最小索引
        );
        
        // 滑动距离越大，水滴越大（模拟水的张力）
        const diffX = currentX - startX;
        const scale = 0.9 + Math.min(0.6, Math.abs(diffX) / 50); // 缩放范围：0.9-1.5
        
        // 更新水滴位置和大小
        updateDropPosition(closestIndex, scale);
        // 更新指示器位置
        updateIndicator(relativeX, relativeY);
        currentIndex = closestIndex;
    }, { passive: true });

    // 8. 触摸结束：水滴消失，跳转页面
    tab.addEventListener('touchend', () => {
        if (!isDragging || !drop) return;
        isDragging = false;
        
        // 水滴消失动画（缩放至0）
        updateDropPosition(currentIndex, 0);
        // 隐藏指示器
        hideIndicator();
        
        // 更新active状态
        updateActiveState(currentIndex);
        
        // 延迟跳转（150ms），让水滴消失动画完成
        setTimeout(() => {
            if (links[currentIndex]) {
                window.location.href = links[currentIndex].href;
            }
        }, 150);
    }, { passive: true });

    // 9. 触摸取消：异常情况（如来电、手势返回），隐藏元素
    tab.addEventListener('touchcancel', () => {
        if (!drop) return;
        isDragging = false;
        updateDropPosition(currentIndex, 0);
        hideIndicator();
    });

    // 10. 点击导航项：支持点击跳转并保留动画效果
    links.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            // 移除阻止默认行为，允许点击直接跳转
            // e.preventDefault();
            
            if (!drop) return;
            
            // 显示水滴
            updateDropPosition(index, 1.2);
            
            // 更新active状态
            updateActiveState(index);
            
            // 按钮按压反馈
            this.style.transform = 'scale(0.95)';
            this.style.background = 'rgba(255, 255, 255, 0.3)';
            
            // 延迟跳转，让动画完成
            setTimeout(() => {
                this.style.transform = '';
                this.style.background = '';
                updateDropPosition(index, 0); // 隐藏水滴
                // 手动触发跳转（确保点击能跳转）
                window.location.href = this.href;
            }, 150);
        });
        
        // 触摸反馈增强
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

    // 辅助函数：更新导航项active状态
    function updateActiveState(index) {
        links.forEach(link => link.classList.remove('active'));
        if (links[index]) {
            links[index].classList.add('active');
        }
    }

    // 初始化水滴状态（确保一开始是隐藏的）
    if (drop) {
        drop.style.display = 'none';
        drop.style.opacity = '0';
        drop.style.transform = 'translate(-50%, -50%) scale(0)';
    }
});
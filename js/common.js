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
document.addEventListener('DOMContentLoaded', function() {
  const snowContainer = document.getElementById('snow-container');
  const snowflakeCharacters = ['❄', '❅', '❆', '•'];
  
  function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    
    // 随机选择雪花形状
    snowflake.textContent = snowflakeCharacters[Math.floor(Math.random() * snowflakeCharacters.length)];
    
    // 随机位置
    snowflake.style.left = Math.random() * 100 + 'vw';
    
    // 随机大小 (10px - 24px)
    const size = 10 + Math.random() * 14;
    snowflake.style.fontSize = size + 'px';
    
    // 随机透明度
    snowflake.style.opacity = 0.5 + Math.random() * 0.5;
    
    // 随机动画时长 (5-12秒) 和延迟
    const duration = 5 + Math.random() * 7;
    const delay = Math.random() * 5;
    
    snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;
    
    // 随机左右飘动幅度
    const translateX = Math.random() * 40 - 20;
    snowflake.style.setProperty('--translate-x', `${translateX}px`);
    
    snowContainer.appendChild(snowflake);
    
    // 雪花落地后移除
    setTimeout(() => {
      if (snowflake.parentNode) {
        snowflake.parentNode.removeChild(snowflake);
      }
    }, (duration + delay) * 1000);
  }
  
  // 初始创建一批雪花
  for (let i = 0; i < 30; i++) {
    setTimeout(() => createSnowflake(), i * 300);
  }
  
  // 持续生成雪花（数量可控）
  setInterval(createSnowflake, 500);
});

// 粒子动画效果
document.addEventListener('DOMContentLoaded', function() {
  const particleContainer = document.getElementById('particle-container');
  const particleCount = 20; // 粒子数量
  
  // 创建粒子
  for (let i = 0; i < particleCount; i++) {
    createParticle();
  }
  
  function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // 随机大小 (2-6px)
    const size = 2 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // 随机位置
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    
    // 随机动画时长 (8-15秒)
    const duration = 8 + Math.random() * 7;
    
    // 动画：缓慢漂浮
    particle.animate([
      { transform: `translate(0, 0)`, opacity: 0.6 },
      { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`, opacity: 0.2 },
      { transform: `translate(${Math.random() * 100 - 80}px, ${Math.random() * 100 - 80}px)`, opacity: 0 }
    ], {
      duration: duration * 1000,
      iterations: 1
    });
    
    particleContainer.appendChild(particle);
    
    // 动画结束后移除并创建新粒子
    setTimeout(() => {
      particle.remove();
      setTimeout(createParticle, Math.random() * 2000);
    }, duration * 1000);
  }
});
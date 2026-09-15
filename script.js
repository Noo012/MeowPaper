document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('desktop-modal');
  const desktopScreen = document.getElementById('desktop-screen');
  const closeBtn = document.getElementById('close-btn');
  const clock = document.getElementById('real-time-clock');
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');

  const mySystemIcon = document.getElementById('my-system-icon');
  const sysInfoModal = document.getElementById('system-info-modal');
  const closeSysInfo = document.getElementById('close-sys-info');

  const wallpapersIcon = document.getElementById('wallpapers-icon');
  const galleryAppModal = document.getElementById('gallery-app-modal');
  const closeGalleryApp = document.getElementById('close-gallery-app');
  const wallpaperIframe = document.getElementById('wallpaper-iframe');

  const isInIframe = window.self !== window.top;

  const urlParams = new URLSearchParams(window.location.search);
  const activeBg = urlParams.get('bg');

  if (activeBg && modal) {
    desktopScreen.style.backgroundImage = `url('${decodeURIComponent(activeBg)}')`;
    modal.style.display = 'flex';
  }

  const galleryImages = document.querySelectorAll('.gallery-grid img');
  let clickTimer = null;

  galleryImages.forEach(img => {
    const imageSrc = img.getAttribute('src');

    img.addEventListener('click', (e) => {
      if (isInIframe) {
        window.parent.postMessage({
          type: 'CHANGE_WALLPAPER',
          imgSrc: imageSrc
        }, '*');
      } else {
        if (clickTimer) clearTimeout(clickTimer);

        clickTimer = setTimeout(() => {
          const downloadUrl = `download.html?img=${encodeURIComponent(imageSrc)}`;
          window.open(downloadUrl, '_blank');
        }, 250);
      }
    });

    img.addEventListener('dblclick', (e) => {
      if (!isInIframe) {
        if (clickTimer) clearTimeout(clickTimer);
        e.stopPropagation();

        const desktopUrl = `${window.location.pathname}?bg=${encodeURIComponent(imageSrc)}`;
        window.open(desktopUrl, '_blank');
      }
    });
  });

  if (!isInIframe) {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CHANGE_WALLPAPER') {
        const newImg = event.data.imgSrc;
        if (desktopScreen) {
          desktopScreen.style.backgroundImage = `url('${newImg}')`;
        }
        if (sysInfoModal && sysInfoModal.style.display === 'block') {
          updateSystemWallpaperInfo();
        }
      }
    });
  }

  function updateSystemWallpaperInfo() {
    if (!desktopScreen) return;
    const currentBgStyle = desktopScreen.style.backgroundImage;
    if (!currentBgStyle) return;

    const cleanSrc = currentBgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    const fileName = cleanSrc.split('/').pop();
    const format = fileName.split('.').pop().toUpperCase();

    const infoName = document.getElementById('info-name');
    const infoFormat = document.getElementById('info-format');
    const infoRes = document.getElementById('info-res');

    if (infoName) infoName.innerText = fileName;
    if (infoFormat) infoFormat.innerText = format;
    if (infoRes) infoRes.innerText = 'Loading...';

    const imgObj = new Image();
    imgObj.src = cleanSrc;
    imgObj.onload = () => {
      if (infoRes) infoRes.innerText = `${imgObj.naturalWidth} x ${imgObj.naturalHeight} px`;
    };
  }

  if (mySystemIcon && sysInfoModal) {
    mySystemIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      updateSystemWallpaperInfo();
      sysInfoModal.style.display = 'block';
    });

    if (closeSysInfo) {
      closeSysInfo.addEventListener('click', () => {
        sysInfoModal.style.display = 'none';
      });
    }
  }

  if (wallpapersIcon && galleryAppModal) {
    wallpapersIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wallpaperIframe && (!wallpaperIframe.src || wallpaperIframe.src === 'about:blank')) {
        wallpaperIframe.src = 'index.html';
      }
      galleryAppModal.style.display = 'flex';
    });

    if (closeGalleryApp) {
      closeGalleryApp.addEventListener('click', () => {
        galleryAppModal.style.display = 'none';
      });
    }
  }

  if (startBtn && startMenu) {
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!startMenu.contains(e.target) && e.target !== startBtn) {
        startMenu.classList.remove('open');
      }
    });

    const menuImages = startMenu.querySelectorAll('img');
    menuImages.forEach(img => {
      img.addEventListener('click', () => {
        const selectedSrc = img.getAttribute('src');
        desktopScreen.style.backgroundImage = `url('${selectedSrc}')`;
        startMenu.classList.remove('open');

        if (sysInfoModal && sysInfoModal.style.display === 'block') {
          updateSystemWallpaperInfo();
        }
      });
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (urlParams.has('bg')) {
        window.close();
      } else if (modal) {
        modal.style.display = 'none';
      }
    });
  }

  function updateClock() {
    if (clock) {
      const now = new Date();
      clock.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  setInterval(updateClock, 1000);
  updateClock();

  document.querySelectorAll('.img-wrapper').forEach(wrapper => {
    const tooltip = wrapper.querySelector('.custom-tooltip');
    if (tooltip) {
      if (isInIframe || window.location.search.includes('bg=')) {
        tooltip.innerHTML = 'Click to preview wallpaper';
      } else {
        tooltip.innerHTML = 'Click to go to the download page<br>,double-click to preview';
      }
    }
  });
});
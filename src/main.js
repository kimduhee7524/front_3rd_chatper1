import { Router } from './services/router.js';
import { homePage } from './components/HomePage.js';
import { profilePage } from './components/ProfilePage.js';
import { loginPage } from './components/LoginPage.js';
import { errorPage } from './components/ErrorPage.js';
import {
  saveUserData,
  clearUserData,
  setLoginStatus,
  getLoginStatus,
} from './services/auth.js';

export const router = new Router();

router.addRoute('/', homePage);
router.addRoute('/login', () => {
  return getLoginStatus() ? (router.navigateTo('/'), homePage()) : loginPage();
});
router.addRoute('/profile', () => {
  return getLoginStatus()
    ? profilePage()
    : (router.navigateTo('/login'), loginPage());
});
router.addRoute('/404', errorPage);

// 페이지가 처음 로드되었을 때 라우터 실행
window.addEventListener('DOMContentLoaded', () => {
  router.handleRoute(window.location.pathname);
  initializeRouter();
});

// 경로 변경을 위한 전역 클릭 이벤트 처리
function initializeRouter() {
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      router.navigateTo(e.target.getAttribute('href'));
    }
  });
}

// 전역 에러 핸들러 추가
window.addEventListener('error', (event) => {
  let errorContainer = document.getElementById('error-container');

  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    document.body.appendChild(errorContainer);
  }

  errorContainer.innerHTML = `<div>오류 발생! ${event.message}</div>`;
});

// 이벤트 위임을 통한 폼 제출 처리
document.addEventListener('submit', (e) => {
  e.preventDefault();

  try {
    switch (e.target.id) {
      case 'login-form': {
        const username = document.getElementById('username').value;

        if (username) {
          saveUserData({ username, email: '', bio: '' });
          setLoginStatus(true);
          router.navigateTo('/profile');
        } else {
          alert('로그인 정보를 입력해주세요.');
        }
        break;
      }

      case 'profile-form': {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;

        saveUserData({ username, email, bio });
        alert('프로필이 업데이트되었습니다.');
        break;
      }
    }
  } catch (error) {
    window.dispatchEvent(new ErrorEvent('error', { message: error.message }));
  }
});

// 로그아웃 클릭 이벤트 처리
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'logout') {
    e.preventDefault();
    clearUserData();
    setLoginStatus(false);
    router.navigateTo('/login');
  }
});

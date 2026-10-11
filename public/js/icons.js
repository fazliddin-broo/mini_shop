// Black Store - Professional SVG Vector Icons Library (No stickers, no emojis)
const ICONS = {
  logo: `<img src="images/logo.png" alt="BlackStore.uz" class="brand-logo-img" />`,

  apple: `<svg viewBox="0 0 170 170" width="30" height="30" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.81-11.65-14.32-6.53-10.42-11.83-22.38-15.91-35.89-4.08-13.51-6.12-25.5-6.12-35.97 0-14.35 3.69-25.99 11.07-34.92 7.38-8.93 16.5-13.48 27.36-13.65 4.58 0 9.83 1.25 15.76 3.75 5.93 2.5 9.77 3.82 11.52 3.96 1.3.14 5.37-1.32 12.2-4.38 6.83-3.06 12.63-4.39 17.4-4 12.87 1.05 23.3 5.92 31.29 14.61-11.3 6.85-16.85 16.32-16.65 28.41.2 9.57 3.91 17.58 11.13 24.03 7.22 6.45 15.66 10.18 25.32 11.19-2.28 6.74-4.89 13.59-7.83 20.55zM119.22 31.42c0-7.18 2.61-13.88 7.83-20.1 5.22-6.22 11.65-10.36 19.29-12.42.22 1.09.33 2.18.33 3.27 0 7.07-2.61 13.8-7.83 20.19-5.22 6.39-11.65 10.46-19.29 12.2-.22-1.09-.33-2.14-.33-3.14z"/>
  </svg>`,

  samsung: `<svg viewBox="0 0 160 36" width="68" height="20" fill="currentColor">
    <path d="M12.5 14.2c-2.4-.9-3.8-1.7-3.8-3.1 0-1.4 1.4-2.4 3.7-2.4 2.2 0 4 .8 5.7 2.2l3.4-3.8C19 5 15.8 3.5 12.1 3.5 6.3 3.5 2.1 7.2 2.1 11.6c0 4.6 3.4 6.7 7.7 8.3 2.8 1.1 4.2 2 4.2 3.5 0 1.6-1.6 2.6-4.1 2.6-2.7 0-5.1-1.2-7-3.1l-3.5 4c2.6 2.7 6.4 4.3 10.6 4.3 6.4 0 10.7-3.6 10.7-8.4 0-4.4-3.2-6.9-8.2-8.6zm19.3-9.5h-5.2l-9.3 25.4h5.7l1.9-5.7h8.8l1.9 5.7h5.8L31.8 4.7zm-5.4 15.2l2.8-8.5 2.8 8.5h-5.6zm37.3-15.2h-6.2l-7.7 15.7L42 4.7h-6.2v25.4h5.2V13.8l6.7 13.9h3.7l6.7-13.9v16.3h5.2V4.7zm17.9 9.5c-2.4-.9-3.8-1.7-3.8-3.1 0-1.4 1.4-2.4 3.7-2.4 2.2 0 4 .8 5.7 2.2l3.4-3.8c-2.5-2.2-5.7-3.7-9.4-3.7-5.8 0-10 3.7-10 8.1 0 4.6 3.4 6.7 7.7 8.3 2.8 1.1 4.2 2 4.2 3.5 0 1.6-1.6 2.6-4.1 2.6-2.7 0-5.1-1.2-7-3.1l-3.5 4c2.6 2.7 6.4 4.3 10.6 4.3 6.4 0 10.7-3.6 10.7-8.4 0-4.4-3.2-6.9-8.2-8.6zm22.4-9.5h-5.4v16.1c0 3.3-1.8 5.1-4.7 5.1-2.9 0-4.7-1.8-4.7-5.1V4.7h-5.4v16.5c0 6.2 3.8 9.9 10.1 9.9 6.3 0 10.1-3.7 10.1-9.9V4.7zm17.9 0h-5.2l-9.3 25.4h5.7l1.9-5.7h8.8l1.9 5.7h5.8L126.8 4.7zm-5.4 15.2l2.8-8.5 2.8 8.5h-5.6zm30.3-15.2h-5.2l-10.7 16.5V4.7h-5.2v25.4h5.2l10.7-16.5v16.5h5.2V4.7z"/>
  </svg>`,

  whoop: `<svg viewBox="0 0 150 40" width="70" height="20" fill="currentColor">
    <path d="M18.8 8.5l-4.2 19-3.9-15.6H5.2L1 27.5h5.3l2.5-12.8 3.9 15.8h4.6l3.9-15.8 2.5 12.8h5.3L24.8 8.5h-6zm19.9 0H33v19h5.7v-7.2h6.8V27.5h5.7V8.5h-5.7v6.6h-6.8V8.5zm31.7 0h-8.8c-6.1 0-10.3 4.2-10.3 9.5 0 5.4 4.2 9.5 10.3 9.5h8.8c6.1 0 10.3-4.1 10.3-9.5 0-5.3-4.2-9.5-10.3-9.5zm-3.1 13.9h-2.6c-3.1 0-4.9-1.9-4.9-4.4 0-2.5 1.8-4.4 4.9-4.4h2.6c3.1 0 4.9 1.9 4.9 4.4 0 2.5-1.8 4.4-4.9 4.4zm28.7-13.9h-8.8c-6.1 0-10.3 4.2-10.3 9.5 0 5.4 4.2 9.5 10.3 9.5h8.8c6.1 0 10.3-4.1 10.3-9.5 0-5.3-4.2-9.5-10.3-9.5zm-3.1 13.9h-2.6c-3.1 0-4.9-1.9-4.9-4.4 0-2.5 1.8-4.4 4.9-4.4h2.6c3.1 0 4.9 1.9 4.9 4.4 0 2.5-1.8 4.4-4.9 4.4zm21.3-13.9h-8.8v19h5.7v-5.6h3.1c4.9 0 8.3-3.1 8.3-6.7 0-3.6-3.4-6.7-8.3-6.7zm-.5 8.3h-2.6v-3.2h2.6c1.9 0 3.1 1 3.1 1.6 0 .6-1.2 1.6-3.1 1.6z"/>
  </svg>`,

  rayban: `<svg viewBox="0 0 120 46" width="68" height="24" fill="currentColor">
    <path d="M12.5 35.8c-.8.8-1.8 1.2-3 1.2-2.1 0-3.5-1.5-3.5-3.9 0-3.5 3-7.5 7.1-9.4l4.5 11.2c-1.7.6-3.6.9-5.1.9zm2.4-14.8c-6 2.3-10.9 8.1-10.9 13.9 0 4.1 2.5 6.7 6.4 6.7 2.4 0 4.9-.8 7.3-2.3l.9 2h4.5L18.4 15.5l-3.5 5.5zm19.9 8.2c-.4-.5-.9-.8-1.5-.8-1.7 0-3.7 2.1-5.1 5.3l-.2.5 6.8-5zm-7.6 7.6c-1.3 2-2.7 3.3-4.1 3.3-.6 0-1-.3-1-.9 0-1.1 1.3-3.2 3.1-4.7l2 2.3zm12.3-9c-.7-.9-1.8-1.4-3.1-1.4-2.8 0-6.1 2.7-8.6 7.2l-.7-1.4c1.8-3.4 3.1-4.8 5.7-4.8.7 0 1.3.1 2 .4l1.2-2.3c-1.2-.4-2.5-.6-3.8-.6-3.6 0-6.4 2.1-8.7 6.4l-.6-1.5c1.4-2.7 2.6-3.8 4.7-3.8.6 0 1.1.1 1.7.3l1.1-2.2c-1-.3-2-.4-3-.4-3 0-5.4 1.7-7.7 5.2l-2.6-6.1h-4.3l9.8 22.8h4.2l-2.6-6.1c1.5 2 3.3 3.1 5.3 3.1 3.2 0 6.6-3.1 9.2-8.3l1.4 3.3c-2.3 4.4-4.8 6.4-8.2 6.4-1.1 0-2.2-.2-3.2-.7l-1 2.3c1.3.5 2.8.8 4.3.8 4.5 0 8.1-2.8 11.1-8.5l.7 1.8h4.2l-8.9-20.7zM60.7 25h-6.8l-1.3 3.1h6.8l1.3-3.1zm11.7-4.6c-.9 1-2.1 1.6-3.4 1.6-1.8 0-3.1-.9-3.8-2.6l-2.3 5.4c2 2.3 4.5 3.5 7.4 3.5 2.8 0 5-1.1 6.8-3.2l-4.7-4.7zm-2.4 14.5c-4.4 0-7.8-2.6-10.5-8l4.4-10.4h4.1l-2.2 5.2c.8-.4 1.7-.6 2.7-.6 3.1 0 5.6 1.6 7.4 4.5l-2.9 2.1c-1.1-1.6-2.5-2.5-4.2-2.5-1.1 0-2 .4-2.7 1.2l-2 4.7c1.7 2.4 3.7 3.8 5.9 3.8 2.2 0 3.9-1.2 5.2-3.5l3.4 2.1c-2 3.5-5 5.4-8.6 5.4zm18.3-5.2c-.4-.5-.9-.8-1.5-.8-1.7 0-3.7 2.1-5.1 5.3l-.2.5 6.8-5zm-7.6 7.6c-1.3 2-2.7 3.3-4.1 3.3-.6 0-1-.3-1-.9 0-1.1 1.3-3.2 3.1-4.7l2 2.3zm12.3-9c-.7-.9-1.8-1.4-3.1-1.4-2.8 0-6.1 2.7-8.6 7.2l-.7-1.4c1.8-3.4 3.1-4.8 5.7-4.8.7 0 1.3.1 2 .4l1.2-2.3c-1.2-.4-2.5-.6-3.8-.6-3.6 0-6.4 2.1-8.7 6.4l-.6-1.5c1.4-2.7 2.6-3.8 4.7-3.8.6 0 1.1.1 1.7.3l1.1-2.2c-1-.3-2-.4-3-.4-3 0-5.4 1.7-7.7 5.2l-2.6-6.1h-4.3l9.8 22.8h4.2l-2.6-6.1c1.5 2 3.3 3.1 5.3 3.1 3.2 0 6.6-3.1 9.2-8.3l1.4 3.3c-2.3 4.4-4.8 6.4-8.2 6.4-1.1 0-2.2-.2-3.2-.7l-1 2.3c1.3.5 2.8.8 4.3.8 4.5 0 8.1-2.8 11.1-8.5l.7 1.8h4.2l-8.9-20.7zm19.6 4.7c-1.2 1.9-2.5 3-3.8 3-.6 0-.9-.3-.9-.9 0-.9.9-2.5 2.3-3.9l2.4 1.8zm3.8-3.8c-.8-.9-1.9-1.4-3.2-1.4-2.3 0-4.8 1.7-7.1 4.7l-.4-1c1.3-2.4 2.4-3.7 4.1-3.7.6 0 1.1.2 1.6.4l1.2-2.3c-1-.4-2-.6-3.1-.6-2.8 0-5 1.5-6.9 4.3l-.6-1.5c1.2-2.1 2.2-2.8 3.6-2.8.5 0 .9.1 1.3.2l1-2.1c-.8-.2-1.6-.3-2.3-.3-2.4 0-4.4 1.3-6.2 3.8l-1.9-4.4h-4.2l7.7 17.9h4.2l-1.8-4.2c1.4 1.6 3 2.5 4.7 2.5 2.8 0 5.6-2.3 7.8-6.1l.9 2.1h4.2l-7.3-17z"/>
  </svg>`,

  google: `<svg viewBox="0 0 24 24" width="30" height="30">
    <path fill="#EA4335" d="M12 5c1.6 0 3.1.6 4.2 1.6l3.2-3.2C17.4 1.6 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.8 3C6.5 7.3 9 5 12 5z"/>
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.8 3c2.2-2.1 3.6-5.2 3.6-8.9z"/>
    <path fill="#FBBC05" d="M5.6 14.3c-.3-.8-.4-1.6-.4-2.3s.1-1.5.4-2.3L1.8 6.7C.6 9 0 10.5 0 12s.6 3 1.8 5.3l3.8-3z"/>
    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 7.9-2.9l-3.8-3c-1.1.7-2.5 1.2-4.1 1.2-3 0-5.5-2.3-6.4-5.3L1.8 16C3.7 19.7 7.5 23 12 23z"/>
  </svg>`,

  canon: `<svg viewBox="0 0 140 36" width="70" height="20" fill="currentColor">
    <path d="M20.8 17.8c0-7.8-5.8-13.4-14.2-13.4-3.8 0-5.2.4-5.2.4L0 8.9s1.4-.3 4.2-.3c5.4 0 8.7 3.5 8.7 9.2 0 5.9-3.7 9.5-9.2 9.5-2.3 0-3.7-.3-3.7-.3l.6 4.2s1.8.4 4.7.4c9.2 0 15.1-6.1 15.1-14zm23.7-7h-3.7l-6.7 20.8h5.1l1.4-4.6h7.1l1.4 4.6h5.2L44.5 10.8zm-2.8 12.4l2.2-7.2 2.2 7.2h-4.4zm36.8-12.4h-4.6l-9.5 14.7V10.8h-4.6v20.8h4.6l9.5-14.7v14.7h4.6V10.8zm26.6 0c-7.9 0-13.7 6-13.7 13.9 0 8 5.8 14 13.7 14s13.7-6 13.7-14c0-7.9-5.8-13.9-13.7-13.9zm0 23.7c-5.1 0-8.7-4.2-8.7-9.8s3.7-9.8 8.7-9.8 8.7 4.2 8.7 9.8-3.7 9.8-8.7 9.8zm39.7-23.7h-4.6l-9.5 14.7V10.8h-4.6v20.8h4.6l9.5-14.7v14.7h4.6V10.8z"/>
  </svg>`,

  lightning: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>`,

  flame: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-.85-.42-1.6-1.07-2.06C11.5 11.83 11 10.96 11 10c0-1.66 1.34-3 3-3 .67 0 1.28.22 1.78.6.22-1.53-.43-3.08-1.78-4.1-1.68 1.4-2.5 3.6-2.5 5.5 0 .9-.5 1.7-1.3 2.1-.9.4-1.7 1.3-1.7 2.4z"/>
    <path d="M12 2c5.5 4.5 7 9.5 5 14a8 8 0 0 1-14-4c0-4 3-7.5 5-9 0 2.5 2 4.5 4 4.5"/>
  </svg>`,

  messageEdit: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <line x1="9" y1="10" x2="15" y2="10"></line>
    <line x1="12" y1="7" x2="12" y2="13"></line>
  </svg>`,

  mapPin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>`,

  search: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>`,

  shoppingBag: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>`,

  cart: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>`,

  heart: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>`,

  heartFilled: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>`,

  sun: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>`,

  moon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>`,

  menu: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>`,

  grid: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>`,

  close: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`,

  chevronLeft: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>`,

  chevronRight: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>`,

  chevronDown: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>`,

  star: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>`,

  trash: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`,

  plus: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>`,

  minus: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>`,

  check: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,

  shieldCheck: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <polyline points="9 12 11 14 15 10"></polyline>
  </svg>`,

  truck: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>`,

  phone: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>`,

  eye: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,

  tag: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>`,

  filter: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>`,

  creditCard: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>`,

  arrowRight: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>`,

  // Category specific icons
  watch: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="7"></circle>
    <polyline points="12 9 12 12 13.5 13.5"></polyline>
    <path d="M16.51 17.35l-.85 3.82a2 2 0 0 1-2 1.63H10.3a2 2 0 0 1-2-1.63l-.85-3.82"></path>
    <path d="M7.49 6.65l.85-3.82A2 2 0 0 1 10.3 1.2h3.4a2 2 0 0 1 2 1.63l.85 3.82"></path>
  </svg>`,

  headphones: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
  </svg>`,

  battery: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1" y="6" width="18" height="12" rx="2"></rect>
    <line x1="23" y1="11" x2="23" y2="13"></line>
    <line x1="6" y1="10" x2="6" y2="14"></line>
    <line x1="10" y1="10" x2="10" y2="14"></line>
    <line x1="14" y1="10" x2="14" y2="14"></line>
  </svg>`,

  zap: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>`,

  speaker: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
    <circle cx="12" cy="14" r="4"></circle>
    <line x1="12" y1="6" x2="12.01" y2="6"></line>
  </svg>`,

  gamepad: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"></line>
    <line x1="8" y1="10" x2="8" y2="14"></line>
    <line x1="15" y1="13" x2="15.01" y2="13"></line>
    <line x1="18" y1="11" x2="18.01" y2="11"></line>
    <rect x="2" y="6" width="20" height="12" rx="6"></rect>
  </svg>`,

  camera: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>`,

  car: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path>
    <circle cx="7" cy="17" r="2"></circle>
    <path d="M9 17h6"></path>
    <circle cx="17" cy="17" r="2"></circle>
  </svg>`,

  smartphone: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>`,

  laptop: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="2" y1="20" x2="22" y2="20"></line>
  </svg>`,

  telegram: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>`,

  instagram: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>`,

  home: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>`,

  user: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>`,

  // Applebox toifalariga mos vektor ikonkalar
  bag: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 20h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2V5a4 4 0 0 0-8 0v1H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"></path>
    <path d="M9 6a3 3 0 0 1 6 0v1H9V6z"></path>
  </svg>`,

  sparkles: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"></path>
  </svg>`,

  droplet: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
  </svg>`,

  homeTech: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
    <circle cx="12" cy="7" r="1.5"></circle>
  </svg>`,

  tools: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>`,

  plug: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22v-5"></path>
    <path d="M9 8V2"></path>
    <path d="M15 8V2"></path>
    <path d="M18 8v5a6 6 0 0 1-12 0V8z"></path>
  </svg>`,

  tablet: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>`,

  casePhone: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3"></rect>
    <path d="M9 6h6"></path>
    <path d="M12 18h.01"></path>
  </svg>`
};

// Helper function to render icon
function getIcon(name, customClass = '') {
  const iconSvg = ICONS[name] || '';
  if (!customClass) return iconSvg;
  return iconSvg.replace('<svg ', `<svg class="${customClass}" `);
}

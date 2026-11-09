import './Icons.scss';

export const EyeClosedIcon = `
  <svg data-eye="closed" class="icon icon_md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
`;

export const EyeOpenIcon = `
  <svg data-eye="open" class="icon icon_md is-hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
`;

export const FieldErrorIcon = `
  <svg class="icon icon_xs icon_no-shrink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
`;

export const BannerErrorIcon = `
  <svg class="icon icon_md icon_no-shrink icon_danger icon_alert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
`;

export const SpinnerIcon = `
  <svg class="icon icon_md icon_spinner" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="12" r="10"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-dasharray="15 48"
    />
  </svg>
`;

export const UserIcon = `
  <svg class="icon icon_3xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
`;

/** Иконка камеры для смены аватара профиля. */
export const CameraIcon = `
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path d="M4 7.5h3l1.5-2h7l1.5 2h3A1.5 1.5 0 0 1 21.5 9v9A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z" stroke-width="1.6" stroke-linejoin="round" />
    <circle cx="12" cy="13" r="3.5" stroke-width="1.6" />
  </svg>
`;

/** Одна галочка: сообщение отправлено, но ещё не прочитано. */
export const MessageSentIcon = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" role="img" aria-label="Отправлено"><path d="M10.5 3 4.5 9 1.5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Две галочки: сообщение прочитано. */
export const MessageReadIcon =
  '<img src="/design-assets/b3d0c.svg" alt="Прочитано" width="12" height="12">';

/** Иконка поиска в шапке переписки. */
export const SearchIcon = `
  <svg class="chat-area__search-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.8" />
    <path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  </svg>
`;

/** Иконка редактирования в меню группы. */
export const EditGroupIcon =
  '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="M4 14.5 13.8 4.7a2.1 2.1 0 0 1 3 3L7 17.5H4v-3Z" stroke="currentColor" stroke-width="1.5"/><path d="m12 6.5 3 3" stroke="currentColor" stroke-width="1.5"/></svg>';

export const ChatsIcon = `
  <svg class="icon icon_lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
  </svg>
`;

export const ContactsIcon = `
  <svg class="icon icon_lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
`;

export const LogoutIcon = `
  <svg aria-hidden="true" class="icon icon_md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4m4-4 4-4-4-4m4 4H9" />
  </svg>
`;

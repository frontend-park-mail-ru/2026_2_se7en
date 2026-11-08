import './GroupViews.scss';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { user } from '@/store/User.ts';

export interface GroupMemberView {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  status: string;
  role?: 'creator' | 'admin' | 'member';
}

export interface GroupFormView {
  name?: string;
  description?: string;
  avatarUrl?: string;
  avatarFileName?: string;
  nameError?: string;
  descriptionError?: string;
  avatarError?: string;
  membersError?: string;
  submitError?: string;
  submitting?: boolean;
}

export interface GroupMembersView {
  loading?: boolean;
  error?: string;
  openMemberMenuId?: string | null;
  removeMemberId?: string | null;
  canManage?: boolean;
  leaveConfirmOpen?: boolean;
  query?: string;
}

const asset = (name: string): string => `/design-assets/${name}`;

function avatar(initials: string, small = false, online = true, imageUrl?: string): string {
  return `
    <span class="group-view__avatar${small ? ' group-view__avatar_small' : ''}">
      ${imageUrl ? `<img class="group-view__avatar-image" src="${escapeHtml(imageUrl)}" alt="">` : escapeHtml(initials)}
      ${online ? '<span class="group-view__online"></span>' : ''}
    </span>
  `;
}

function backButton(): string {
  return `
    <button type="button" data-group-back class="group-view__back" aria-label="Назад">
      <img src="${asset('63b18.svg')}" alt="" width="20" height="20">
    </button>
  `;
}

function avatarPicker(
  initials: string,
  mode: 'create' | 'edit',
  imageUrl?: string,
  error?: string,
  fileName?: string,
): string {
  const id = `${mode}-group-avatar`;
  return `
    <div class="group-view__avatar-field">
      <label class="${mode === 'create' ? 'group-create-panel__photo' : 'group-view__photo'}" for="${id}">
        ${avatar(initials, mode === 'create', false, imageUrl)}
        <span>
          <strong>${mode === 'create' ? 'Добавить фото группы' : 'Изменить фото группы'}</strong>
          <small>${escapeHtml(fileName || 'Необязательно')}</small>
        </span>
      </label>
      <input class="group-view__file-input" id="${id}" type="file" name="avatar" accept="image/png,image/jpeg,image/webp" data-group-avatar="${mode}" aria-describedby="${id}-error">
      <small id="${id}-error" class="group-view__error" role="status">${escapeHtml(error)}</small>
    </div>
  `;
}

function memberRow(
  member: GroupMemberView,
  options: {
    selectable?: boolean;
    selected?: boolean;
    showMenu?: boolean;
    menuOpen?: boolean;
  } = {},
): string {
  const tag = options.selectable ? 'button' : 'div';
  return `
    <${tag} class="group-view__member" ${options.selectable ? `type="button" data-group-member="${escapeHtml(member.id)}" aria-pressed="${Boolean(options.selected)}"` : ''}>
      ${avatar(member.initials, options.selectable, member.status === 'в сети', member.avatarUrl)}
      <span class="group-view__member-text">
        <strong>${escapeHtml(member.name)}</strong>
        <small>${escapeHtml(member.status)}</small>
      </span>
      ${
        options.selectable
          ? `
        <img
          class="group-view__check"
          src="${asset(options.selected ? '22ee3.svg' : '44f03.svg')}"
          alt="${options.selected ? 'Выбран' : 'Не выбран'}"
          width="22"
          height="22"
        >
      `
          : ''
      }
      ${!options.selectable && member.role ? `<span class="group-view__role">${member.role === 'creator' ? 'Создатель' : member.role === 'admin' ? 'Администратор' : 'Участник'}</span>` : ''}
      ${
        options.showMenu && member.role !== 'creator'
          ? `
        <span class="group-view__member-actions">
          <button type="button" class="group-view__member-menu" data-member-menu-toggle="${escapeHtml(member.id)}" aria-label="Действия с участником ${escapeHtml(member.name)}" aria-expanded="${Boolean(options.menuOpen)}">⋯</button>
          ${options.menuOpen ? `<span class="group-view__member-popover" role="menu"><button type="button" role="menuitem" data-member-remove="${escapeHtml(member.id)}">Удалить из группы</button></span>` : ''}
        </span>
      `
          : ''
      }
    </${tag}>
  `;
}

export function renderGroupCreateMembers(
  selectedIds: Set<string>,
  contacts: GroupMemberView[],
  options: {
    loading?: boolean;
    error?: string;
    membersError?: string;
    mode?: 'create' | 'add';
    query?: string;
  } = {},
): string {
  const count = selectedIds.size + 1;
  const adding = options.mode === 'add';

  return `
    <section class="group-create-panel" aria-label="${adding ? 'Добавление участников группы' : 'Выбор участников группы'}">
      <header class="group-create-panel__header">
        ${backButton()}
        <h2>${adding ? 'Добавить участников' : 'Новая группа'}</h2>
      </header>
      <p class="group-create-panel__count">${adding ? `${selectedIds.size} выбрано` : `${count} из 100 участников`}</p>
      <label class="group-create-panel__search">
        <img src="${asset('9e868.svg')}" alt="" width="17" height="17">
        <input type="search" name="member-search" value="${escapeHtml(options.query)}" placeholder="Поиск по имени или никнейму" aria-label="Поиск участников" data-member-search>
      </label>
      <div class="group-create-panel__members" aria-busy="${Boolean(options.loading)}">
        ${
          options.loading
            ? '<p class="group-create-panel__empty" role="status">Загрузка контактов…</p>'
            : options.error
              ? `<div class="group-create-panel__empty" role="alert"><p>${escapeHtml(options.error)}</p><button type="button" data-contacts-retry>Повторить</button></div>`
              : contacts.length
                ? contacts
                    .map((member) =>
                      memberRow(member, { selectable: true, selected: selectedIds.has(member.id) }),
                    )
                    .join('')
                : '<p class="group-create-panel__empty">Контакты пока недоступны</p>'
        }
      </div>
      <p class="group-create-panel__selection-error group-view__error" role="status">${escapeHtml(options.membersError)}</p>
      <footer class="group-create-panel__footer">
        <span>${adding ? `${selectedIds.size} выбрано` : `${count} из 100 участников`}</span>
        <button type="button" ${adding ? 'data-group-add-submit' : 'data-group-next'}>${adding ? 'Добавить' : 'Продолжить'}</button>
      </footer>
    </section>
  `;
}

export function renderGroupCreateDetails(
  selectedIds: Set<string>,
  contacts: GroupMemberView[],
  form: GroupFormView = {},
): string {
  const currentName = user.getName() || 'Вы';
  const currentInitials = currentName.trim().slice(0, 2).toLocaleUpperCase('ru-RU');
  const selectedMembers = contacts.filter((member) => selectedIds.has(member.id));
  const count = selectedMembers.length + 1;

  return `
    <section class="group-create-panel group-create-panel_details" aria-label="Название и аватар группы">
      <header class="group-create-panel__header">
        ${backButton()}
        <h2>Новая группа</h2>
      </header>
      <form class="group-create-panel__form" data-group-create-form novalidate>
        <div class="group-create-panel__details">
        ${avatarPicker(currentInitials, 'create', form.avatarUrl, form.avatarError, form.avatarFileName)}
        <label class="group-view__field" for="create-group-name">
          <span>Название группы</span>
          <input id="create-group-name" type="text" name="group-name" maxlength="100" placeholder="Название группы" value="${escapeHtml(form.name)}" autocomplete="off" aria-invalid="${Boolean(form.nameError)}" aria-describedby="create-group-name-error" required>
          <small id="create-group-name-error" class="group-view__error" role="status">${escapeHtml(form.nameError)}</small>
        </label>
        <label class="group-view__field" for="create-group-description">
          <span>Описание <small>Необязательно</small></span>
          <textarea id="create-group-description" name="group-description" maxlength="500" placeholder="Описание группы" aria-invalid="${Boolean(form.descriptionError)}" aria-describedby="create-group-description-error">${escapeHtml(form.description)}</textarea>
          <small id="create-group-description-error" class="group-view__error" role="status">${escapeHtml(form.descriptionError)}</small>
        </label>
        <div class="group-create-panel__members-heading">
          <strong>Участники</strong>
          <span>${count} из 100 участников</span>
        </div>
        <div class="group-create-panel__selected-members">
          ${memberRow({
            id: 'me',
            name: 'Вы',
            initials: currentInitials,
            status: 'Создатель и администратор',
          })}
          ${selectedMembers.map((member) => memberRow({ ...member, status: 'Участник' })).join('')}
        </div>
        <p class="group-view__error" role="status">${escapeHtml(form.membersError || form.submitError)}</p>
        </div>
        <footer class="group-create-panel__footer group-create-panel__footer_single">
          <button type="submit" data-group-create ${form.submitting ? 'disabled' : ''}>${form.submitting ? 'Создание…' : 'Создать группу'}</button>
        </footer>
      </form>
    </section>
  `;
}

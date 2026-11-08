import './GroupViews.scss';
import type { DisplayChat } from '@/api/chats/chats.types.ts';
import { escapeHtml } from '@/helpers/EscapeHtml.ts';
import { user } from '@/store/User.ts';
import { Button } from '@/components/core/Button.ts';
import { Input } from '@/components/core/Input.ts';
import type { GroupMemberView, GroupFormView, GroupMembersView } from './chat.types.ts';

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
  return Button({
    text: `<img src="${asset('63b18.svg')}" alt="" width="20" height="20">`,
    mode: 'unstyled',
    className: 'group-view__back',
    ariaLabel: 'Назад',
    attrs: { 'data-group-back': '' },
  });
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
      ${Input({ className: 'group-view__file-input', id, type: 'file', name: 'avatar', unstyled: true, attrs: { accept: 'image/png,image/jpeg,image/webp', 'data-group-avatar': mode, 'aria-describedby': `${id}-error` } })}
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
  const content = `
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
          ${Button({ text: '⋯', mode: 'unstyled', className: 'group-view__member-menu', ariaLabel: `Действия с участником ${member.name}`, attrs: { 'data-member-menu-toggle': member.id, 'aria-expanded': String(Boolean(options.menuOpen)) } })}
          ${options.menuOpen ? `<span class="group-view__member-popover" role="menu">${Button({ text: 'Удалить из группы', mode: 'unstyled', attrs: { role: 'menuitem', 'data-member-remove': member.id } })}</span>` : ''}
        </span>
      `
          : ''
      }
  `;
  return options.selectable
    ? Button({
        text: content,
        mode: 'unstyled',
        className: 'group-view__member',
        attrs: {
          'data-group-member': member.id,
          'aria-pressed': String(Boolean(options.selected)),
        },
      })
    : `<div class="group-view__member">${content}</div>`;
}

/** Отображает выбор участников новой группы. */
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
        ${Input({ type: 'search', name: 'member-search', value: options.query, placeholder: 'Поиск по имени или никнейму', unstyled: true, attrs: { 'aria-label': 'Поиск участников', 'data-member-search': '' } })}
      </label>
      <div class="group-create-panel__members" aria-busy="${Boolean(options.loading)}">
        ${
          options.loading
            ? '<p class="group-create-panel__empty" role="status">Загрузка контактов…</p>'
            : options.error
              ? `<div class="group-create-panel__empty" role="alert"><p>${escapeHtml(options.error)}</p>${Button({ text: 'Повторить', mode: 'unstyled', attrs: { 'data-contacts-retry': '' } })}</div>`
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
        ${Button({ text: adding ? 'Добавить' : 'Продолжить', mode: 'unstyled', attrs: { [adding ? 'data-group-add-submit' : 'data-group-next']: '' } })}
      </footer>
    </section>
  `;
}

/** Отображает форму данных новой группы. */
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
          ${Input({ id: 'create-group-name', name: 'group-name', placeholder: 'Название группы', value: form.name, unstyled: true, attrs: { maxlength: '100', autocomplete: 'off', 'aria-invalid': String(Boolean(form.nameError)), 'aria-describedby': 'create-group-name-error', required: '' } })}
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
          ${Button({ text: form.submitting ? 'Создание…' : 'Создать группу', type: 'submit', mode: 'unstyled', disabled: form.submitting, attrs: { 'data-group-create': '' } })}
        </footer>
      </form>
    </section>
  `;
}

/** Отображает информацию о группе и её участниках. */
export function renderGroupInfo(
  chat: DisplayChat,
  members: GroupMemberView[] = [],
  options: GroupMembersView = {},
): string {
  return `
    <section class="group-view group-view_info" aria-label="Информация о группе">
      <header class="group-view__header">
        ${backButton()}
        <h2>Информация о группе</h2>
        ${options.canManage ? Button({ text: 'Изменить', mode: 'unstyled', className: 'group-view__header-action', attrs: { 'data-open-group-edit': '' } }) : ''}
      </header>
      <div class="group-view__content">
        <div class="group-view__summary">
          ${avatar(chat.initials, false, false, chat.icon_url ?? undefined)}
          <span>
            <strong>${escapeHtml(chat.name)}</strong>
            <small>${chat.members_count ?? members.length} из 100 участников</small>
          </span>
        </div>
        <div class="group-view__description">
          <span>Описание</span>
          <p>${escapeHtml(chat.description || 'Описание группы не добавлено')}</p>
        </div>
        ${options.canManage ? Button({ text: 'Изменить', mode: 'unstyled', className: 'group-view__mobile-edit', attrs: { 'data-open-group-edit': '' } }) : ''}
        <div class="group-view__section-heading">
          <h3 class="group-view__section-title">Участники</h3>
          ${options.canManage ? Button({ text: 'Добавить', mode: 'unstyled', attrs: { 'data-group-add': '' } }) : ''}
        </div>
        <div class="group-view__members" aria-busy="${Boolean(options.loading)}">
          ${options.loading ? '<p class="group-view__empty" role="status">Загрузка участников…</p>' : options.error ? `<div class="group-view__empty" role="alert"><p>${escapeHtml(options.error)}</p>${Button({ text: 'Повторить', mode: 'unstyled', attrs: { 'data-group-retry': '' } })}</div>` : members.length ? members.map((member) => memberRow(member)).join('') : '<p class="group-view__empty">В группе пока нет участников</p>'}
        </div>
      </div>
      <footer class="group-view__footer group-view__footer_info">
        ${Button({ text: `<img src="${asset('1df05.svg')}" alt="" width="19" height="19"> Выйти из группы`, mode: 'unstyled', attrs: { 'data-group-leave': '' } })}
      </footer>
      ${
        options.leaveConfirmOpen
          ? `
        <div class="group-view__modal-backdrop">
          <div class="group-view__modal" role="dialog" aria-modal="true" aria-labelledby="leave-group-title">
            <h3 id="leave-group-title">Выйти из группы?</h3>
            <p>Вы больше не сможете читать её сообщения, пока вас не добавят снова.</p>
            <div class="group-view__modal-actions">
              ${Button({ text: 'Отмена', mode: 'unstyled', attrs: { 'data-group-leave-cancel': '' } })}
              ${Button({ text: 'Выйти', mode: 'unstyled', className: 'group-view__modal-danger', attrs: { 'data-group-leave-confirm': '' } })}
            </div>
          </div>
        </div>
      `
          : ''
      }
    </section>
  `;
}

/** Отображает форму редактирования группы и управления участниками. */
export function renderGroupEdit(
  chat: DisplayChat,
  members: GroupMemberView[] = [],
  form: GroupFormView = {},
  options: GroupMembersView = {},
): string {
  const memberToRemove = members.find((member) => member.id === options.removeMemberId);
  return `
    <section class="group-view group-view_edit" aria-label="Редактирование группы">
      <header class="group-view__header">
        ${backButton()}
        <h2>
          <span class="group-view__desktop-title">Редактирование группы</span>
          <span class="group-view__mobile-title">Редактирование</span>
        </h2>
      </header>
      <form class="group-view__form" data-group-edit-form novalidate>
      <div class="group-view__content">
        ${avatarPicker(chat.initials, 'edit', form.avatarUrl ?? chat.icon_url ?? undefined, form.avatarError, form.avatarFileName)}
        <label class="group-view__field" for="edit-group-name">
          <span>Название группы</span>
          ${Input({ id: 'edit-group-name', name: 'group-name', value: form.name ?? chat.name, unstyled: true, attrs: { maxlength: '100', autocomplete: 'off', 'aria-invalid': String(Boolean(form.nameError)), 'aria-describedby': 'edit-group-name-error', required: '' } })}
          <small id="edit-group-name-error" class="group-view__error" role="status">${escapeHtml(form.nameError)}</small>
        </label>
        <label class="group-view__field" for="edit-group-description">
          <span>Описание <small>Необязательно</small></span>
          <textarea id="edit-group-description" name="group-description" maxlength="500" aria-invalid="${Boolean(form.descriptionError)}" aria-describedby="edit-group-description-error">${escapeHtml(form.description ?? chat.description)}</textarea>
          <small id="edit-group-description-error" class="group-view__error" role="status">${escapeHtml(form.descriptionError)}</small>
        </label>
        <div class="group-view__members-heading">
          <strong>Участники</strong>
          <span>${chat.members_count ?? members.length} из 100 участников</span>
        </div>
        <label class="group-view__search">
          <img src="${asset('9e868.svg')}" alt="" width="17" height="17">
          ${Input({ type: 'search', name: 'member-search', value: options.query, placeholder: 'Поиск участников', unstyled: true, attrs: { 'aria-label': 'Поиск участников', 'data-member-search': '' } })}
        </label>
        <div class="group-view__members" aria-busy="${Boolean(options.loading)}">
          ${options.loading ? '<p class="group-view__empty" role="status">Загрузка участников…</p>' : options.error ? `<div class="group-view__empty" role="alert"><p>${escapeHtml(options.error)}</p>${Button({ text: 'Повторить', mode: 'unstyled', attrs: { 'data-group-retry': '' } })}</div>` : members.length ? members.map((member) => memberRow(member, { showMenu: true, menuOpen: options.openMemberMenuId === member.id })).join('') : '<p class="group-view__empty">Участники пока не загружены</p>'}
        </div>
        <p class="group-view__error" role="status">${escapeHtml(form.membersError || form.submitError)}</p>
      </div>
      <footer class="group-view__footer group-view__footer_edit">
        ${Button({ text: 'Отмена', mode: 'unstyled', attrs: { 'data-group-cancel': '' } })}
        ${Button({ text: form.submitting ? 'Сохранение…' : 'Сохранить', type: 'submit', mode: 'unstyled', disabled: form.submitting, attrs: { 'data-group-save': '' } })}
      </footer>
      </form>
      ${
        memberToRemove
          ? `
        <div class="group-view__modal-backdrop">
          <div class="group-view__modal" role="dialog" aria-modal="true" aria-labelledby="remove-member-title">
            <h3 id="remove-member-title">Удалить участника?</h3>
            <p>${escapeHtml(memberToRemove.name)} будет удалён из группы.</p>
            <div class="group-view__modal-actions">
              ${Button({ text: 'Отмена', mode: 'unstyled', attrs: { 'data-member-remove-cancel': '' } })}
              ${Button({ text: 'Удалить', mode: 'unstyled', className: 'group-view__modal-danger', attrs: { 'data-member-remove-confirm': memberToRemove.id } })}
            </div>
          </div>
        </div>
      `
          : ''
      }
    </section>
  `;
}

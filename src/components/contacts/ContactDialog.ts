import './ContactDialog.scss';

/**
 * Компонент диалога с контактом.
 * */
export class ContactDialog {
  render(hasContacts: boolean): string {
    return `
      <section class="contact-dialog" aria-label="Диалог с контактом">
        <div class="contact-dialog__placeholder">
          <h2 class="contact-dialog__title">Общение начинается с контакта</h2>
          <p class="contact-dialog__text">
            ${
              hasContacts
                ? 'Нажмите на контакт, чтобы открыть переписку.'
                : 'Добавить пользователя в контакты можно на странице его профиля'
            }
          </p>
        </div>
      </section>
    `;
  }
}

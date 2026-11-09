import './ContactDialog.scss';

/**
 * Компонент диалога с контактом.
 * */
export class ContactDialog {
  render(): string {
    return `
      <section class="contact-dialog" aria-label="Диалог с контактом">
        <div class="contact-dialog__placeholder">
          <h2 class="contact-dialog__title">Общение начинается с контакта</h2>
          <p class="contact-dialog__text">
            Выберите контакт слева или добавьте пользователя на странице его профиля.
          </p>
        </div>
      </section>
    `;
  }
}

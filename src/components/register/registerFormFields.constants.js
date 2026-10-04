import { ELEMENT_IDS } from '../../pages/RegisterPage/register.constants.js';

/**
 * Поля формы регистрации в порядке макета
 * @type {Array<{id: string, name: string, label: string, placeholder: string, type?: string}>}
 */
export const REGISTER_FIELDS = [
  {
    id: ELEMENT_IDS.FIRST_NAME,
    name: 'first_name',
    label: 'Имя',
    placeholder: 'Введите имя',
  },
  {
    id: ELEMENT_IDS.NICKNAME,
    name: 'nickname',
    label: 'Никнейм',
    placeholder: 'nickname',
  },
  {
    id: ELEMENT_IDS.EMAIL,
    name: 'email',
    label: 'Электронная почта',
    placeholder: 'name@example.com',
    type: 'email',
  },
  {
    id: ELEMENT_IDS.PASSWORD,
    name: 'password',
    label: 'Пароль',
    placeholder: 'password',
    type: 'password',
    description: 'От 8 до 16 символов. Можно использовать латинские буквы, цифры и нижнее подчёркивание.',
  },
];

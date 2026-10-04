import { ELEMENT_IDS } from '../../constants/App.js';

/**
 * Конфигурация полей для первого шага регистрации
 * @type {Array<{id: string, name: string, label: string, placeholder: string, type?: string}>}
 */
export const STEP_1_FIELDS = [
  {
    id: ELEMENT_IDS.FIRST_NAME,
    name: 'first_name',
    label: 'Имя',
    placeholder: 'Введите имя',
  },
  {
    id: ELEMENT_IDS.LAST_NAME,
    name: 'last_name',
    label: 'Фамилия',
    placeholder: 'Введите фамилию',
  },
];

/**
 * Конфигурация полей для второго шага регистрации
 * @type {Array<{id: string, name: string, label: string, placeholder: string, type?: string, hint?: string}>}
 */
export const STEP_2_FIELDS = [
  {
    id: ELEMENT_IDS.NICKNAME,
    name: 'nickname',
    label: 'Никнейм',
    placeholder: 'nickname',
  },
  {
    id: ELEMENT_IDS.PHONE_NUMBER,
    name: 'phone_number',
    label: 'Телефон',
    placeholder: '+7 800 555 35 35',
    type: 'tel',
    hint: 'необязательно',
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
  },
];

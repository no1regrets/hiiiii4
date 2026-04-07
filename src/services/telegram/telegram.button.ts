import { Markup } from 'telegraf';

interface Text {
  data: string[];
  action: string[];
}

export function inlineButtons(text: Text, number: number) {
  let buttons = [];
  text.data.map((data, index) => {
    buttons.push(Markup.button.callback(data, text.action[index]));
  });
  return Markup.inlineKeyboard(buttons, {
    columns: number,
  });
}

export function Buttons(text: Text, number: number) {
  let buttons = [];
  text.data.map((data, index) => {
    buttons.push(Markup.button.text(data));
  });
  return Markup.keyboard(buttons, {
    columns: number,
  });
}
 
   
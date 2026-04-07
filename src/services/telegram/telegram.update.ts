import { TelegramService } from './telegram.service';
import { Action, Ctx, Hears, InjectBot, Message, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Buttons, inlineButtons, } from './telegram.button';
import { Context } from './telegram.interface';
import { text } from 'stream/consumers';
import { IsEmail } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { CallbackQuery } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>, private readonly appService: TelegramService, private readonly prisma: PrismaService,) { }

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Добрый день! Вас приветсвует телеграм-бот СПАСКа. Сейчас я умею показывать расписаник на сегодня и затра, но в будушем обязательно добавяться новые функции)')
    await ctx.reply('Для того, чтобы начать пользоваться ботом нужно познакомиться!')
    await ctx.reply('Вы преподаватель, студент?', inlineButtons({ data: ['Преподаватель', 'Студент'], action: ['teacher', 'student'] }, 2))
  }

  @Hears('Посмотреть расписание на сегодня')
  async partToday(@Ctx() ctx: Context) {
    const date = new Intl.DateTimeFormat("ru", { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Moscow' }).format(new Date).split(' г.')[0]
    let parts
    if (ctx.session.role === 'teacher') {
      parts = await this.appService.getPart(ctx.session.shortName, date)
    } else {
      parts = await this.appService.getPartByGroup(ctx.session.group, date)
    }
    let text: string = "Расписание на сегодня: \n\n"
    if (parts.length === 0) {
      await ctx.reply('Сегодня у Вас нет занятий')
    } else {
      for (const lesson of ['1', '2', '3', '4', '5']) {
        const part = parts.reduce((acc, current) => {
          if (current.number != lesson) return acc
          acc.push(current)
          return acc
        }, [])
        if (part.length === 0) {
          if (lesson === '5') {
            continue;
          }
          text = text + '<b>Нет пары</b>\n\n'
        } else {
          if (ctx.session.role === 'teacher') {
            text = text + `<b>${part[0].subject}</b>\n` + `Группа: ${part[0].group}\n` + `Кабинет: ${part[0].room}\n\n`
          } else {
            if (part.length === 1) {
              text = text + `<b>${part[0].subject}</b>\n` + `Преподаватель: ${part[0].teacher}\n` + `Кабинет: ${part[0].room}\n\n`
            } else {
              text = text + `<b>${part[0].subject}</b>\n` + `Преподаватель: ${part[0].teacher}\n` + `Преподаватель: ${part[1].teacher}\n` + `Кабинет: ${part[0].room}, ${part[1].room}\n\n`
            }
          }
        }
      }
      await ctx.replyWithHTML(text)
    }
  }

  @Hears('Посмотреть расписание на завтра')
  async partTomorrow(@Ctx() ctx: Context) {
    const today = new Date();
    const tomorrow = new Date(today);
    const date = new Intl.DateTimeFormat("ru", { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Moscow' }).format(tomorrow.setDate(tomorrow.getDate() + 1)).split(' г.')[0]
    let parts: any[]
    if (ctx.session.role === 'teacher') {
      parts = await this.appService.getPart(ctx.session.shortName, date)
    } else {
      parts = await this.appService.getPartByGroup(ctx.session.group, date)
    }
    let text: string = "Расписание на завтра: \n\n"
    if (parts.length === 0) {
      await ctx.reply('Завтра у Вас нет занятий')
    } else {
      for (const lesson of ['1', '2', '3', '4', '5']) {
        const part = parts.reduce((acc, current) => {
          if (current.number != lesson) return acc
          return current
        }, 'Нет пары')
        if (typeof (part) === 'string') {
          if (lesson === '5') {
            continue;
          }
          text = text + '<b>Нет пары</b>\n\n'
        } else {
          if (ctx.session.role === 'teacher') {
            text = text + `<b>${part.subject}</b>\n` + `Группа: ${part.group}\n` + `Кабинет: ${part.room}\n\n`
          } else {
            let part = parts.filter(p =>
              p.number === lesson
            )
            if (part.length === 1) {
              text = text + `<b>${part[0].subject}</b>\n` + `Преподаватель: ${part[0].teacher}\n` + `Кабинет: ${part[0].room}\n\n`
            } else {
              text = text + `<b>${part[0].subject}</b>\n` + `Преподаватель: ${part[0].teacher}\n` + `Преподаватель: ${part[1].teacher}\n` + `Кабинет: ${part[0].room}, ${part[1].room}\n\n`
            }
          }
        }
      }
      await ctx.replyWithHTML(text)
    }
  }

  // TEACHER

  @Action('teacher')
  async getTeacher(@Ctx() ctx: Context) {
    await ctx.editMessageText('Вы преподаватель')
    ctx.session.role = 'teacher'
    ctx.session.lastName = ctx.from.last_name
    await ctx.reply('Ваша фамилия - ' + ctx.from.last_name + '?', inlineButtons({ data: ['Да', 'Нет, ввести другую'], action: ['go enter user', 'go enter secondName'] }, 2))
    ctx.session.type = 'getSecondName'
  }

  @Action('go enter secondName')
  async getInputSecondName(@Ctx() ctx: Context) {
    //await ctx.deleteMessage()
    await ctx.reply('Введите свою фамилию')
    ctx.session.type = 'getSecondName'
  }

  @Action('go enter user')
  async getUser(@Ctx() ctx: Context) {
    if (ctx.session.role === 'teacher') {
      let user = await this.appService.getUserByLastName(ctx.session.lastName)
      let name = []
      let action = []
      typeof user === 'string' ? '' : user.forEach(async u => {
        name.push(u.name)
        action.push('goEnd')
      })
      if (!user) {
        await ctx.reply('Такого преподавателя нет', inlineButtons({ data: ['Ввести фамилию еще раз'], action: ['go enter secondName'] }, 1))
      } else {
        ctx.session.type = 'goEnd'
        await ctx.reply('Выберете себя из списка', Buttons({ data: name, action: action }, 1))
      }
    }
  }

  @Action('Let`s start')
  async firtsStart(@Ctx() ctx: Context) {
    await ctx.reply('Для того, посмотреть свое расписание, нужно выбрать нужную команду из меню снизу', Buttons({ data: ['Посмотреть расписание на сегодня', 'Посмотреть расписание на завтра'], action: ['today', 'tomorrow'] }, 1))
  }








  // ENROLLEE

  @Action('enrollee')
  async getStudent(@Ctx() ctx: Context) {
    await ctx.editMessageText('Вы абитуриент')
    ctx.session.role = 'enrollee'
    await ctx.reply('Ваше полное имя - ' + ctx.from.first_name + '?', inlineButtons({ data: ['Да', 'Нет, ввести другое'], action: ['go secondName', 'go enter name'] }, 2))
    ctx.session.type = 'getName'
  }

  @Action('go enter name')
  async getName(@Ctx() ctx: Context) {
    await ctx.reply('Введите свое имя')
    ctx.session.type = 'getName'
  }
  @Action('go secondName')
  async getSecondName(@Ctx() ctx: Context) {
    await ctx.editMessageText('Ваше полное имя - ' + ctx.from.first_name)
    ctx.session.name = ctx.from.first_name
    await ctx.reply('Введите свою фамилию')
    ctx.session.type = 'getSecondName'
    return ''
  }

  @Action('go enter surName')
  async getSurName(@Ctx() ctx: Context) {
    await ctx.reply('Введите отчество')
    ctx.session.type = 'getSurname'
  }

  @Action('goTel')
  async getEmail(@Ctx() ctx: Context) {
    await ctx.reply('Введите номер телефона для связи')
    ctx.session.type = 'getTel'
  }

  @Action('Let`s start')
  async doc(@Ctx() ctx: Context) {
    await ctx.reply('Для того, посмотреть свое расписание, нужно выбрать нужную команду из меню снизу', Buttons({ data: ['Выбрать дату и время', 'Посмотреть список документов'], action: ['doc', 'tomorrow'] }, 1))
  }

  @Action('doc')
  async bookAppointment(@Ctx() ctx: Context) {
    await this.showAvailableDays(ctx);
  }

  @Action(/book_(.+)/)
  async onBookAction(@Ctx() ctx: Context) {
    const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
    const callbackData = callbackQuery.data;
    const date = callbackData.split('_')[1];
    ctx.session.type = 'getDay';
    ctx.session.day = date;
    const times = this.getAvailableTimes(date);
    await ctx.reply(`Доступное время на ${date}:`, inlineButtons({ data: times, action: times.map(time => `confirm_${date}_${time}`) }, 2));
  }

  @Action(/confirm_(.+)_(.+)/)
  async onConfirmAction(@Ctx() ctx: Context) {
    const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
    const callbackData = callbackQuery.data;
    const [date, time] = callbackData.split('_').slice(1);
    let user = await this.prisma.user.findUnique({
      where: {
        telegram_id: `${ctx.from.id}`
      }
    })

    if (user) {
      await this.prisma.ticket.create({
        data: {
          date,
          time,
          enrolleeId: user.id,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          name: ctx.session.name + ctx.session.lastName + ctx.session.shortName,
          telephone: ctx.session.tel,
          enrollee: true
        }
      })
      await this.prisma.ticket.create({
        data: {
          date,
          time,
          enrolleeId: user.id,
        },
      });
    }

    ctx.session.type = 'default';
    await ctx.reply(`Вы записаны на ${date} в ${time}.`);
  }

  private getAvailableDays() {
    return Array.from({ length: 5 }, (_, i) => format(addDays(new Date(), i + 1), 'yyyy-dd-MM'));
  }

  private async showAvailableDays(@Ctx() ctx: Context) {
    const dates = this.getAvailableDays();
    await ctx.reply('Выберите день:', inlineButtons({ data: dates, action: dates.map(date => `book_${date}`) }, 2));
  }

  private getAvailableTimes(date: string): string[] {
    const start = setHours(setMinutes(startOfDay(new Date(date)), 0), 10);
    const end = setHours(setMinutes(startOfDay(new Date(date)), 40), 16);
    const breakStart = setHours(setMinutes(startOfDay(new Date(date)), 40), 12);
    const breakEnd = setHours(setMinutes(startOfDay(new Date(date)), 0), 14);

    const times: string[] = [];
    for (let time = start; time <= end; time = addMinutes(time, 15)) {
      if (time < breakStart || time > breakEnd) {
        times.push(format(time, 'HH:mm'));
      }
    }

    return times;
  }

  //STUDENT

  @Action('student')
  async getOther(@Ctx() ctx: Context) {
    await ctx.reply('Введите первые два или три числа от номера Вашей группы.' + 'К примеру, если Ваша группа 22-А, то нужно ввести: 22')
    ctx.session.role = 'student'
    ctx.session.type = 'getGrope'
    return ''
  }

  @Action('go enter group')
  async getGroup(@Message('text') message: string, @Ctx() ctx: Context) {
    ctx.session.group === message
    let name = []
    let group = await this.appService.getGroupByFirstNumber(message)
    typeof (group) === 'string' ? '' : group.forEach(async group => {
      name.push(group.name)
    })
    if (!group) {
      await ctx.reply('Такой группы нет', inlineButtons({ data: ['Ввести группу еше раз'], action: ['goGroupe'] }, 1))
      ctx.session.type = 'getGrope'
    } else {
      ctx.session.type = 'goEnd'
      await ctx.reply('Выберете группу', Buttons({ data: name, action: name }, 1))
    }
  }






  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {

    if (!ctx.session.type) return

    if (ctx.session.type === 'default') return



    // TEACHER

    if (ctx.session.type === 'getSecondName' && ctx.session.role === 'teacher') {
      await ctx.reply('Ваша фамилия - ' + message)
      ctx.session.lastName = message
      await ctx.reply('Все верно?', inlineButtons({ data: ['Да!', 'Нет, ввести фамилию еще раз'], action: ['go enter user', 'go enter secondName'] }, 1))
      return ''
    }

    if (ctx.session.type === 'goEnd' && ctx.session.role === 'teacher') {
      const data = await this.appService.getUserByName(message)

      ctx.session.name = data.name.split(' ')[1]
      ctx.session.lastName = data.name.split(' ')[0]
      ctx.session.surname = data.name.split(' ')[2]
      ctx.session.userId = data.id
      ctx.session.DOB = data.DOB
      ctx.session.shortName = data.shortName
      ctx.session.type = 'default'
      await ctx.reply('Приятно познакомиться, ' + message.split(' ')[1] + ' ' + message.split(' ')[2] + '!', inlineButtons({ data: ['Пройти регистрацию заново', 'Начать пользоваться ботом'], action: ['teacher', 'Let`s start'] }, 1))
      return ''
    }




    // STUDENT

    if (ctx.session.type === 'getName' && ctx.session.role === 'enrollee') {
      //await ctx.editMessageText('Ваше имя - ' + message)
      await ctx.reply('Ваше имя - ' + message, inlineButtons({ data: ['Ввести имя еще раз'], action: ['go enter name'] }, 1))
      ctx.session.name = message
      await ctx.reply('Введите свою фамилию')
      ctx.session.type = 'getSecondName'
      return ''
    }

    if (ctx.session.type === 'getSecondName' && ctx.session.role === 'enrollee') {
      await ctx.reply('Ваша фамилия - ' + message, inlineButtons({ data: ['Ввести фамилию еще раз'], action: ['go enter secondName'] }, 1))
      ctx.session.lastName = message
      await ctx.reply('Введите отчество')
      ctx.session.type = 'getSurname'
      return ''
    }

    if (ctx.session.type === 'getSurname' && ctx.session.role === 'enrollee') {
      await ctx.reply('Выше отчество - ' + message, inlineButtons({ data: ['Ввести отчество еще раз'], action: ['go enter surName'] }, 1))
      ctx.session.surname = message
      await ctx.reply('Введите номер телефона для связи')
      ctx.session.type = 'getTel'
      return ''
    }

    if (ctx.session.type === 'getTel' && ctx.session.role === 'enrollee') {
      ctx.session.tel === message
      await ctx.reply('Ваш номер - ' + message, inlineButtons({ data: ['Ввести телефон еше раз'], action: ['goTel'] }, 1))
      ctx.session.type = 'default'
      await ctx.reply('Приятно познакомиться, ' + ctx.session.name + '!', inlineButtons({ data: ['Пройти регистрацию заново', 'Выбрать время подачи документов'], action: ['enrollee', 'doc'] }, 1))
      return ''
    }





    //STUDENT

    if (ctx.session.type === 'getGrope' && ctx.session.role === 'student') {
      ctx.session.group = message;
      const group = await this.appService.getGroupByFirstNumber(message);
      if (!group || group.length === 0) {
        await ctx.reply('Такой группы нет', inlineButtons({ data: ['Ввести группу еше раз'], action: ['goGroupe'] }, 1));
        ctx.session.type = 'getGrope';
      } else {
        const name = group.map(g => g.name);
        await ctx.reply('Выберете группу', Buttons({ data: name, action: name }, name.length));
        ctx.session.type = 'goEnd';
      }
      return '';
    }

    if (ctx.session.type === 'goEnd' && ctx.session.role === 'student') {
      ctx.session.group = message;
      ctx.session.type = 'default';
      await ctx.reply('Приятно познакомиться, ' + ctx.session.name + '!', inlineButtons({ data: ['Пройти регистрацию заново', 'Начать пользоваться ботом'], action: ['student', 'Let`s start'] }, 1));
      return '';
    }
  }
}    

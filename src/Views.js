import _ from 'lodash';
import dateformat from 'dateformat';
import out from './utils/Out';

const column = (value, size) => {
  if (!size) {
    return value;
  }

  let text = '';
  for (let i = 0; i < size; i += 1) {
    const char = _.get(value, `[${i}]`, ' ');
    text = `${text}${char}`;
  }
  return text;
};

export default {
  printStatus: (files) => {
    out.print('');
    const C1 = 5;
    const C2 = 8;
    const C3 = 15;
    const C4 = 20;
    out.print(
      column('', C1),
      column('STATUS', C2),
      column('ID', C3),
      column('DATE', C4),
      column('NAME'),
    );
    out.print('');
    _.each(files, (it) => {
      let formatedDate = '-';
      let status = '-';
      const mId = it.id;
      const mName = it.name;
      if (it.date) {
        formatedDate = dateformat(it.date, 'yyyy-mm-dd h:MM:ss');
        status = 'up';
      }

      out.print(
        column('', C1),
        column(status, C2),
        column(mId, C3),
        column(formatedDate, C4),
        column(mName),
      );
    });
    out.print('');
  },
};

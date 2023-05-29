import dayjs from 'dayjs'
import apiHandler from '../../../utils/ApiHandler'
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
var isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter')


dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)


export async function getAppointments(day, day_count, users = [1, 4, 9], page_size = 10) {
  //retruns an array of days each day has appointments for each user
  // day = day.tz("America/Toronto")

  let user_string = "";
  for (let i = 0; i < users.length; i++) {
    user_string += `user_id=${users[i]}&`;
  }
  user_string = user_string.slice(0, -1);

  let page = 1;
  let allAppointments = [];

  while (true) {
    const url = `/events/appointments/?${user_string}&start_date=${day
      .startOf("day")
      .toISOString()}&end_date=${day.add(day_count, "day").endOf("day").toISOString()}&page=${page}&page_size=${page_size}`;

    const response = await apiHandler.get(url);
    const appointments = response.data;

    if (appointments.length === 0) {
      break;
    }

    allAppointments.push(...appointments);
    page++;
  }

  return allAppointments;
}

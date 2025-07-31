import apiService from '@/utils/apiUtils';
import config from '@/config';

export const getSchedulesForNow = async () => {
  const data = await apiService.get(config.schedule.getScheduleList());
  return [...data];
};

export const getSchedulesForYearAndMonth = async (year, month) => {
  const data = await apiService.get(
    config.schedule.getScheduleListForYearAndMonth(year, month)
  );
  return [...data];
};

export const registerSchedule = async (event) => {
  const data = await apiService.post(config.schedule.registerSchedule(), event);
  return [...data];
};

export const updateSchedule = async (event) => {
  await apiService.put(config.schedule.updateSchedule(), event);
};

export const removeSchedule = async (scheduleId) => {
  await apiService.put(config.schedule.removeSchedule(scheduleId));
};

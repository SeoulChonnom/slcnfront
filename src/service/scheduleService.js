import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';
import config from '@/config';

export const getSchedulesForNow = async () => {
  try {
    const res = await axios({
      url: config.schedule.getScheduleList(),
      method: 'GET',
      headers: { 'X-AUTH-TOKEN': useUserStore().token },
    });
    return [...res.data.data];
  } catch (e) {
    if (e.response?.status === 400) {
      throw new Error(e.response.data.message);
    } else {
      throw new Error('알 수 없는 오류입니다.');
    }
  }
};

export const getSchedulesForYearAndMonth = async (year, month) => {
  try {
    const res = await axios({
      url: config.schedule.getScheduleListForYearAndMonth(year, month),
      method: 'GET',
      headers: { 'X-AUTH-TOKEN': useUserStore().token },
    });
    return [...res.data.data];
  } catch (e) {
    if (e.response?.status === 400) {
      throw new Error(e.response.data.message);
    } else {
      throw new Error('알 수 없는 오류입니다.');
    }
  }
};

export const registerSchedule = async (event) => {
  try {
    const res = await axios({
      url: config.schedule.registerSchedule(),
      method: 'POST',
      data: event,
      headers: { 'X-AUTH-TOKEN': useUserStore().token },
    });
    return [...res.data.data];
  } catch (e) {
    if (e.response?.status === 400) {
      throw new Error(e.response.data.message);
    } else {
      throw new Error('알 수 없는 오류입니다.');
    }
  }
};

export const updateSchedule = async (event) => {
  try {
    await axios({
      url: config.schedule.updateSchedule(),
      method: 'PUT',
      data: event,
      headers: { 'X-AUTH-TOKEN': useUserStore().token },
    });
  } catch (e) {
    if (e.response?.status === 400) {
      throw new Error(e.response.data.message);
    } else {
      throw new Error('알 수 없는 오류입니다.');
    }
  }
};

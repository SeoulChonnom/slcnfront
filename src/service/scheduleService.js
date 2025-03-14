import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';
import config from '@/config';

export const getCalendarList = async () => {
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

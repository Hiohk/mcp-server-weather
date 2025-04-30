import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// 创建 Axios 实例
const instance = axios.create({
  timeout: 10000, // 设置超时时间
});

const apiKey = process.env.Q_WEATHER_API_KEY;

// 查询城市信息
export async function getCityLocation(data) {
  const baseUrl = process.env.Q_WEATHER_LOCATION_URL;
  try {
    const response = await instance.get(baseUrl, {
      params: {
        location: data.location,
        lang: data.lang,
        number: data.number,
        key: apiKey
      }
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// 查询天气信息
export async function getCityWeather(data) {
  const baseUrl = process.env.Q_WEATHER_CITY_URL;
  try {
    const response = await instance.get(baseUrl, {
      params: {
        location: data.location,
        lang: data.lang,
        key: apiKey
      }
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// getCityLocation({
//   location: "北京",
//   lang: "zh",
// }).then(data => {
//   console.log(data.location[0]);
// });


// getCityWeather({
//   location: "101010100",
//   lang: "zh"
// }).then(res => {
//   console.log(res);
// });
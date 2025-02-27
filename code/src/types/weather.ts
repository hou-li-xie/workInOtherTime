export interface WeatherInfo {
  date: string;
  dayWeather: string;
  nightWeather: string;
  dayTemp: string;
  nightTemp: string;
  dayWind: string;
  nightWind: string;
  dayPower: string;
  nightPower: string;
  city?: string;
}

export interface WeatherResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  city: string;
  forecasts: WeatherInfo[];
}

// 地理编码响应接口
export interface GeoResponse {
  status: string;
  info: string;
  regeocode: {
    addressComponent: {
      adcode: string;
      city: string;
      district: string;
      province: string;
      [key: string]: any;
    };
    formatted_address: string;
    [key: string]: any;
  };
}

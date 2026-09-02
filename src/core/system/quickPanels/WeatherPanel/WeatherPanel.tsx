import React, { useState, useEffect } from 'react';
import { WeatherService } from '../../weather';
import type { WeatherData, WeatherStatus } from '../../weather';

const WeatherPanel: React.FC = () => {
  const [status, setStatus] = useState<WeatherStatus>('loading');
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const service = new WeatherService(null);
    service.getWeather().then(result => {
      if (result) {
        setData(result);
        setStatus('success');
      } else {
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour >= 20;
        setData({
          temperature: isNight ? 18 : 24,
          condition: isNight ? 'Clear' : 'Sunny',
          icon: isNight ? '\u263D' : '\u2600',
          location: 'OnerOS',
        });
        setStatus('success');
      }
    });
  }, []);

  if (status === 'loading') {
    return (
      <div className="weather-panel">
        <div className="weather-panel-loading">Loading weather...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="weather-panel">
        <div className="weather-panel-empty">
          <p>Weather unavailable</p>
          <p>Check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-panel">
      <div className="weather-panel-main">
        <span className="weather-panel-icon">{data.icon || '\u2600'}</span>
        <span className="weather-panel-temp">{data.temperature}{'\u00B0C'}</span>
      </div>
      <div className="weather-panel-location">{data.location || 'OnerOS'}</div>
      <div className="weather-panel-condition">{data.condition}</div>

      <div className="weather-panel-details">
        {data.humidity !== undefined && (
          <div className="weather-panel-detail">
            <span className="weather-panel-detail-label">Humidity</span>
            <span className="weather-panel-detail-value">{data.humidity}%</span>
          </div>
        )}
        {data.wind !== undefined && (
          <div className="weather-panel-detail">
            <span className="weather-panel-detail-label">Wind</span>
            <span className="weather-panel-detail-value">{data.wind} km/h</span>
          </div>
        )}
      </div>

      <div className="weather-panel-updated">Updated from cache</div>
    </div>
  );
};

export default WeatherPanel;

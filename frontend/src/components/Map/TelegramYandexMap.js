import { Box, useTheme } from '@mui/material';
import { YMaps, Map, Polyline, Placemark, Circle } from '@pbe/react-yandex-maps';
import { useState, useEffect } from 'react';

const YANDEX_MAPS_API_KEY = process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734';

const TelegramYandexMap = ({ 
  points = [], 
  center = [55.751244, 37.618423], 
  route = [], 
  zoom = 15,
  height = '400px'
}) => {
  const theme = useTheme();
  const [pulseRadius, setPulseRadius] = useState(100);
  


  // Анимация пульсации
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseRadius((prev) => (prev >= 100 ? 20 : prev + 2));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Transform and validate coordinates
  const transformCoordinates = (coords) => {
    if (!coords) return null;
    if (coords.latitude !== undefined && coords.longitude !== undefined) {
      return [coords.latitude, coords.longitude];
    }
    if (Array.isArray(coords) && coords.length === 2) {
      return coords;
    }
    return null;
  };

  const mapState = {
    center,
    zoom,
    controls: ['zoomControl', 'fullscreenControl']
  };

  const mapOptions = {
    suppressMapOpenBlock: true,
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: height, 
      borderRadius: 2, 
      overflow: 'hidden',
      position: 'relative',
      '& ymaps': {
        borderRadius: '16px !important',
      }
    }}>
      <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: 'ru_RU' }}>
        <Map
          defaultState={mapState}
          width="100%"
          height="100%"
          options={mapOptions}
          modules={[
            'control.ZoomControl',
            'control.FullscreenControl',
            'geoObject.addon.balloon',
            'geoObject.addon.hint'
          ]}
        >
          {/* Пульсирующий круг для текущей локации */}
          <Circle
            geometry={[center, pulseRadius]}
            options={{
              fillColor: theme.palette.primary.main,
              strokeColor: theme.palette.primary.main,
              fillOpacity: 0.1,
              strokeOpacity: 0.3,
              strokeWidth: 2,
            }}
          />

          {/* Маркер текущей локации */}
          <Placemark
            geometry={center}
            options={{
              preset: 'islands#blueCircleDotIcon',
              iconColor: theme.palette.primary.main,
              balloonCloseButton: false,
              hideIconOnBalloonOpen: false,
            }}
            properties={{
              balloonContentHeader: 'Ваше местоположение',
              balloonContentBody: 'Вы находитесь здесь',
              hintContent: 'Текущая локация',
            }}
          />

          {/* Маркеры точек */}
          {points.map((point, index) => {
            const coords = transformCoordinates(point.coordinates);
            if (!coords) return null;
            return (
              <Placemark
                key={index}
                geometry={coords}
                options={{
                  preset: 'islands#redDotIcon',
                  iconColor: theme.palette.error.main,
                }}
                properties={{
                  balloonContentHeader: 'Место выполнения задачи',
                  balloonContentBody: point.description || `Точка ${index + 1}`,
                  iconCaption: point.time || '',
                  hintContent: point.description || `Точка ${index + 1}`,
                }}
              />
            );
          })}

          {/* Маршрут */}
          {route.length > 1 && (
            <Polyline
              geometry={route}
              options={{
                strokeColor: theme.palette.primary.main,
                strokeWidth: 4,
                strokeOpacity: 0.8,
              }}
            />
          )}
        </Map>
      </YMaps>
    </Box>
  );
};

export default TelegramYandexMap; 
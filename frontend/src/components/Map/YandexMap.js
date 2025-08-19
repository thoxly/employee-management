import { Box } from '@mui/material';
import { YMaps, Map, Polyline, Placemark } from '@pbe/react-yandex-maps';

const YANDEX_MAPS_API_KEY = process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734';

const YandexMap = ({ points = [], center = [55.751244, 37.618423], route = [], employees = [], zoom = 9 }) => {
  // Transform and validate coordinates
  const transformCoordinates = (coords) => {
    if (!coords) return null;
    // Handle object format with latitude/longitude properties
    if (coords.latitude !== undefined && coords.longitude !== undefined) {
      return [coords.latitude, coords.longitude];
    }
    // Handle array format [lat, lng]
    if (Array.isArray(coords) && coords.length === 2) {
      return coords;
    }
    return null;
  };

  // Validate and transform route
  const validRoute = Array.isArray(route) && route.length > 1 && route.every(point => Array.isArray(point) && point.length === 2);
  const transformedRoute = validRoute ? route.map(coords => transformCoordinates(coords)).filter(Boolean) : [];

  // Filter and transform employee coordinates
  const validEmployees = employees.filter(emp => emp && (
    (emp.coordinates && Array.isArray(emp.coordinates)) || 
    (emp.coordinates && emp.coordinates.latitude !== undefined && emp.coordinates.longitude !== undefined)
  ));

  const mapState = {
    center,
    zoom,
    controls: ['zoomControl', 'fullscreenControl']
  };

  return (
    <Box sx={{ width: '100%', height: '600px', borderRadius: 1, overflow: 'hidden' }}>
      <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: 'ru_RU' }}>
        <Map
          defaultState={mapState}
          width="100%"
          height="100%"
          modules={['control.ZoomControl', 'control.FullscreenControl']}
        >
          {transformedRoute.length > 1 && (
            <>
              <Polyline
                geometry={transformedRoute}
                options={{
                  strokeColor: '#FF0000',
                  strokeWidth: 4,
                  strokeOpacity: 0.8,
                }}
              />
              <Placemark
                geometry={transformedRoute[0]}
                properties={{ balloonContent: 'Начало маршрута' }}
                options={{ preset: 'islands#redDotIcon' }}
                modules={['geoObject.addon.balloon']}
              />
              <Placemark
                geometry={transformedRoute[transformedRoute.length - 1]}
                properties={{ balloonContent: 'Конец маршрута' }}
                options={{ preset: 'islands#redDotIcon' }}
                modules={['geoObject.addon.balloon']}
              />
            </>
          )}
          {points.map((point, index) => {
            const coords = transformCoordinates(point.coordinates);
            if (!coords) return null;
            return (
              <Placemark
                key={index}
                geometry={coords}
                properties={{
                  balloonContent: point.description || `Точка ${index + 1}`,
                  iconCaption: point.time || '',
                }}
                modules={['geoObject.addon.balloon']}
              />
            );
          })}
          {validEmployees.map((employee, index) => {
            const coords = transformCoordinates(employee.coordinates);
            if (!coords) return null;
            return (
              <Placemark
                key={index}
                geometry={coords}
                properties={{
                  balloonContent: `<strong>${employee.name}</strong><br/>Последнее обновление: ${employee.lastUpdate}`,
                  iconCaption: employee.name,
                }}
                options={{ preset: 'islands#bluePersonIcon' }}
                modules={['geoObject.addon.balloon']}
              />
            );
          })}
        </Map>
      </YMaps>
    </Box>
  );
};

export default YandexMap;
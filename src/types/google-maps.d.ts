// Definiciones de tipos para Google Maps JavaScript API
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLngLiteral | LatLng): void;
      setZoom(zoom: number): void;
      getZoom(): number | undefined;
      fitBounds(bounds: LatLngBounds): void;
    }

    interface MapOptions {
      zoom?: number;
      center?: LatLngLiteral | LatLng;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      mapTypeControl?: boolean;
      styles?: any[];
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      extend(point: LatLngLiteral | LatLng): void;
    }

    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
      ): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLngLiteral | LatLng;
      componentRestrictions?: ComponentRestrictions;
    }

    interface ComponentRestrictions {
      country?: string;
    }

    interface GeocoderResult {
      formatted_address: string;
      geometry: {
        location: LatLng;
      };
      address_components: GeocoderAddressComponent[];
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    enum GeocoderStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS"
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): void;
    }

    interface MarkerOptions {
      position?: LatLngLiteral | LatLng;
      map?: Map;
      title?: string;
      icon?: string | MarkerIcon;
    }

    interface MarkerIcon {
      url: string;
      scaledSize?: Size;
      anchor?: Point;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
    }

    interface InfoWindowOptions {
      content?: string;
    }

    class DistanceMatrixService {
      getDistanceMatrix(
        request: DistanceMatrixRequest,
        callback: (response: DistanceMatrixResponse | null, status: DistanceMatrixStatus) => void
      ): void;
    }

    interface DistanceMatrixRequest {
      origins: (LatLngLiteral | LatLng)[];
      destinations: (LatLngLiteral | LatLng)[];
      travelMode: TravelMode;
      unitSystem: UnitSystem;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
    }

    interface DistanceMatrixResponse {
      rows: DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
      elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
      status: string;
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
    }

    enum DistanceMatrixStatus {
      OK = "OK"
    }

    enum TravelMode {
      DRIVING = "DRIVING"
    }

    enum UnitSystem {
      METRIC = "METRIC"
    }

    namespace event {
      function addListenerOnce(
        instance: object,
        eventName: string,
        handler: Function
      ): void;
    }

    namespace places {
      class PlacesService {
        constructor(attrContainer: Map | HTMLDivElement);
        nearbySearch(
          request: PlaceSearchRequest,
          callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
        ): void;
      }

      interface PlaceSearchRequest {
        location: LatLng;
        radius: number;
        keyword?: string;
        type?: string;
      }

      interface PlaceResult {
        place_id?: string;
        name?: string;
        vicinity?: string;
        geometry?: {
          location?: LatLng;
        };
        types?: string[];
        rating?: number;
      }

      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
        ): void;
      }

      interface AutocompletionRequest {
        input: string;
        componentRestrictions?: ComponentRestrictions;
        types?: string[];
      }

      interface AutocompletePrediction {
        place_id: string;
        description: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
        };
      }

      enum PlacesServiceStatus {
        OK = "OK"
      }
    }
  }
}

export {};
import { geocodingService } from './geocodingService';

interface PlaceData {
  name: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  description: string;
  startTime: string;
  duration: number;
  estimatedCost: number;
  rating: number;
}

export const aiItineraryGenerator = {
  async generateDayItinerary(
    destination: string,
    dayNumber: number,
    travelerType: 'budget' | 'time' | 'combination'
  ): Promise<PlaceData[]> {
    const city = destination.split(',')[0].trim();

    const places = await this.getPlacesForDestination(city, dayNumber, travelerType);

    return places;
  },

  async getPlacesForDestination(
    city: string,
    dayNumber: number,
    travelerType: string
  ): Promise<PlaceData[]> {
    const cityLower = city.toLowerCase();

    const destinationPlaces: Record<string, PlaceData[][]> = {
      'tokyo': [
        [
          {
            name: 'Senso-ji Temple',
            category: 'attraction',
            description: 'Tokyo\'s oldest and most significant Buddhist temple, located in Asakusa. Features a iconic Thunder Gate and bustling Nakamise shopping street.',
            startTime: '09:00',
            duration: 90,
            estimatedCost: 0,
            rating: 4.6,
          },
          {
            name: 'Ichiran Ramen Asakusa',
            category: 'restaurant',
            description: 'Famous tonkotsu ramen chain with individual booth seating for a focused dining experience.',
            startTime: '12:00',
            duration: 45,
            estimatedCost: 15,
            rating: 4.4,
          },
          {
            name: 'Tokyo Skytree',
            category: 'attraction',
            description: 'World\'s tallest tower at 634m with breathtaking observation decks offering panoramic views of Tokyo.',
            startTime: '14:00',
            duration: 120,
            estimatedCost: 25,
            rating: 4.5,
          },
          {
            name: 'Shibuya Crossing',
            category: 'attraction',
            description: 'The world\'s busiest pedestrian crossing, surrounded by bright neon lights and massive video screens.',
            startTime: '17:00',
            duration: 60,
            estimatedCost: 0,
            rating: 4.7,
          },
          {
            name: 'Izakaya Gonpachi Shibuya',
            category: 'restaurant',
            description: 'Traditional Japanese pub serving yakitori and other dishes in a lively atmosphere.',
            startTime: '19:00',
            duration: 90,
            estimatedCost: 35,
            rating: 4.3,
          },
        ],
        [
          {
            name: 'Meiji Shrine',
            category: 'attraction',
            description: 'Peaceful Shinto shrine dedicated to Emperor Meiji, nestled in a tranquil forest in the heart of Tokyo.',
            startTime: '09:00',
            duration: 75,
            estimatedCost: 0,
            rating: 4.6,
          },
          {
            name: 'Harajuku Takeshita Street',
            category: 'attraction',
            description: 'Vibrant pedestrian street famous for trendy fashion boutiques, quirky cafes, and unique street food.',
            startTime: '11:00',
            duration: 90,
            estimatedCost: 20,
            rating: 4.4,
          },
          {
            name: 'Kawaii Monster Cafe',
            category: 'restaurant',
            description: 'Colorful themed cafe with whimsical decor and creative dishes.',
            startTime: '13:00',
            duration: 60,
            estimatedCost: 25,
            rating: 4.2,
          },
          {
            name: 'teamLab Borderless',
            category: 'activity',
            description: 'Immersive digital art museum with stunning interactive installations.',
            startTime: '15:30',
            duration: 150,
            estimatedCost: 35,
            rating: 4.8,
          },
          {
            name: 'Tsukiji Outer Market',
            category: 'attraction',
            description: 'Historic fish market area with fresh seafood restaurants and food stalls.',
            startTime: '19:00',
            duration: 90,
            estimatedCost: 40,
            rating: 4.5,
          },
        ],
      ],
      'paris': [
        [
          {
            name: 'Eiffel Tower',
            category: 'attraction',
            description: 'Iconic iron lattice tower and symbol of Paris, offering spectacular city views from its observation decks.',
            startTime: '09:00',
            duration: 120,
            estimatedCost: 28,
            rating: 4.7,
          },
          {
            name: 'Cafe de l\'Homme',
            category: 'restaurant',
            description: 'Elegant restaurant with stunning Eiffel Tower views and fine French cuisine.',
            startTime: '12:30',
            duration: 90,
            estimatedCost: 65,
            rating: 4.5,
          },
          {
            name: 'Louvre Museum',
            category: 'attraction',
            description: 'World\'s largest art museum housing thousands of works including the Mona Lisa and Venus de Milo.',
            startTime: '15:00',
            duration: 180,
            estimatedCost: 17,
            rating: 4.8,
          },
          {
            name: 'Seine River Cruise',
            category: 'activity',
            description: 'Relaxing boat tour along the Seine, passing by Paris\'s most famous landmarks.',
            startTime: '19:00',
            duration: 75,
            estimatedCost: 15,
            rating: 4.6,
          },
        ],
      ],
      'new york': [
        [
          {
            name: 'Statue of Liberty',
            category: 'attraction',
            description: 'Iconic symbol of freedom and democracy, accessible by ferry with stunning harbor views.',
            startTime: '09:00',
            duration: 180,
            estimatedCost: 24,
            rating: 4.7,
          },
          {
            name: 'Juniors Restaurant',
            category: 'restaurant',
            description: 'Famous for its world-renowned cheesecake and classic American diner fare.',
            startTime: '13:00',
            duration: 60,
            estimatedCost: 30,
            rating: 4.4,
          },
          {
            name: 'Central Park',
            category: 'attraction',
            description: 'Massive urban park offering peaceful green spaces, lakes, and recreational activities.',
            startTime: '15:00',
            duration: 120,
            estimatedCost: 0,
            rating: 4.8,
          },
          {
            name: 'Times Square',
            category: 'attraction',
            description: 'Bustling commercial intersection famous for its bright lights, Broadway theaters, and energy.',
            startTime: '18:00',
            duration: 90,
            estimatedCost: 0,
            rating: 4.5,
          },
          {
            name: 'Carmine\'s Italian Restaurant',
            category: 'restaurant',
            description: 'Family-style Italian restaurant serving generous portions in a theatrical district setting.',
            startTime: '20:00',
            duration: 90,
            estimatedCost: 45,
            rating: 4.6,
          },
        ],
      ],
      'london': [
        [
          {
            name: 'Tower of London',
            category: 'attraction',
            description: 'Historic castle on the Thames, home to the Crown Jewels and centuries of royal history.',
            startTime: '09:30',
            duration: 150,
            estimatedCost: 32,
            rating: 4.7,
          },
          {
            name: 'Borough Market',
            category: 'attraction',
            description: 'Historic food market with diverse international cuisine and artisanal products.',
            startTime: '13:00',
            duration: 90,
            estimatedCost: 25,
            rating: 4.6,
          },
          {
            name: 'British Museum',
            category: 'attraction',
            description: 'World-famous museum featuring vast collections spanning human history and culture.',
            startTime: '15:30',
            duration: 150,
            estimatedCost: 0,
            rating: 4.8,
          },
          {
            name: 'Covent Garden',
            category: 'attraction',
            description: 'Vibrant district with street performers, boutique shops, and restaurants.',
            startTime: '18:30',
            duration: 90,
            estimatedCost: 15,
            rating: 4.5,
          },
        ],
      ],
    };

    const defaultPlaces: PlaceData[][] = [
      [
        {
          name: `${city} Main Square`,
          category: 'attraction',
          description: `The historic heart of ${city}, featuring beautiful architecture and local culture.`,
          startTime: '10:00',
          duration: 90,
          estimatedCost: 0,
          rating: 4.5,
        },
        {
          name: `Local Restaurant in ${city}`,
          category: 'restaurant',
          description: `Authentic local cuisine in the heart of ${city}.`,
          startTime: '12:30',
          duration: 75,
          estimatedCost: 25,
          rating: 4.3,
        },
        {
          name: `${city} Museum`,
          category: 'attraction',
          description: `Discover the rich history and culture of ${city}.`,
          startTime: '14:30',
          duration: 120,
          estimatedCost: 15,
          rating: 4.4,
        },
        {
          name: `${city} Park`,
          category: 'attraction',
          description: `Beautiful green space perfect for relaxation and leisure.`,
          startTime: '17:00',
          duration: 60,
          estimatedCost: 0,
          rating: 4.6,
        },
      ],
    ];

    const cityPlaces = destinationPlaces[cityLower] || defaultPlaces;
    const dayIndex = (dayNumber - 1) % cityPlaces.length;

    return cityPlaces[dayIndex];
  },
};

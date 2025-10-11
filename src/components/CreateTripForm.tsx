import { useState } from 'react';
import { X, Calendar, MapPin, Plane, FileText } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../contexts/AuthContext';
import { itineraryService } from '../services/itineraryService';

interface CreateTripFormProps {
  travelerType: string;
  onSubmit: (tripData: TripData, tripId: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export interface TripData {
  tripName: string;
  destination: string;
  fromCity: string;
  arrivalCity: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string;
  travelerType: string;
}

export function CreateTripForm({ travelerType, onSubmit, onBack, onClose }: CreateTripFormProps) {
  const { user } = useAuth();
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showArrivalCityDropdown, setShowArrivalCityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    tripName: '',
    destination: '',
    fromCity: '',
    arrivalCity: '',
    startDate: '',
    endDate: '',
  });

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
    'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
    'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
    'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
    'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
    'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
    'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain',
    'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago',
    'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];

  const filteredDestinations = countries.filter((country) =>
    country.toLowerCase().includes(destination.toLowerCase())
  );

  const citiesByCountry: Record<string, string[]> = {
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'Detroit', 'Nashville', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'New Orleans', 'Tampa'],
    'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'St. Johns', 'Kelowna', 'Barrie', 'Sherbrooke', 'Guelph', 'Kanata', 'Abbotsford', 'Kingston'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Leicester', 'Coventry', 'Cardiff', 'Belfast', 'Nottingham', 'Brighton', 'Hull', 'Plymouth', 'Stoke-on-Trent', 'Wolverhampton', 'Derby', 'Southampton', 'Portsmouth', 'York', 'Oxford', 'Cambridge'],
    'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Le Havre', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Denis', 'Aix-en-Provence', 'Le Mans', 'Clermont-Ferrand', 'Brest'],
    'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bonn', 'Bielefeld', 'Mannheim', 'Karlsruhe', 'Münster', 'Wiesbaden', 'Augsburg', 'Aachen'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Brescia', 'Taranto', 'Prato', 'Parma', 'Modena', 'Reggio Calabria', 'Reggio Emilia', 'Perugia', 'Livorno', 'Ravenna'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'A Coruña', 'Granada', 'Vitoria', 'Elche', 'Oviedo', 'Santa Cruz', 'Badalona', 'Cartagena', 'Terrassa'],
    'Japan': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Shizuoka', 'Okayama', 'Kagoshima', 'Hachioji', 'Himeji', 'Matsuyama'],
    'China': ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Chongqing', 'Tianjin', 'Wuhan', 'Hangzhou', 'Nanjing', 'Xian', 'Shenyang', 'Harbin', 'Qingdao', 'Dalian', 'Jinan', 'Changchun', 'Zhengzhou', 'Kunming', 'Taiyuan', 'Changsha', 'Ningbo', 'Fuzhou', 'Hefei', 'Nanning'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Kochi'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Maitland', 'Bundaberg', 'Wagga Wagga'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina', 'Campo Grande', 'Nova Iguaçu', 'São Bernardo do Campo', 'João Pessoa', 'Santo André'],
    'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'San Luis Potosí', 'Aguascalientes', 'Hermosillo', 'Saltillo', 'Mexicali', 'Culiacán', 'Guadalupe', 'Acapulco', 'Tlalnepantla', 'Cancún', 'Querétaro', 'Chihuahua', 'Morelia', 'Reynosa', 'Tlaquepaque', 'Tuxtla Gutiérrez'],
    'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Voronezh', 'Perm', 'Volgograd', 'Krasnodar', 'Saratov', 'Tyumen', 'Tolyatti', 'Izhevsk', 'Barnaul', 'Ulyanovsk', 'Irkutsk', 'Khabarovsk', 'Vladivostok'],
    'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Seongnam', 'Bucheon', 'Cheongju', 'Ansan', 'Jeonju', 'Anyang', 'Cheonan', 'Pohang', 'Gimhae', 'Jinju', 'Hwaseong', 'Uijeongbu', 'Sejong', 'Wonju'],
    'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Bekasi', 'Medan', 'Tangerang', 'Depok', 'Semarang', 'Palembang', 'Makassar', 'South Tangerang', 'Batam', 'Bogor', 'Pekanbaru', 'Bandar Lampung', 'Padang', 'Malang', 'Denpasar', 'Samarinda', 'Tasikmalaya', 'Pontianak', 'Jambi', 'Cimahi', 'Balikpapan', 'Surakarta'],
    'Thailand': ['Bangkok', 'Nonthaburi', 'Nakhon Ratchasima', 'Chiang Mai', 'Hat Yai', 'Udon Thani', 'Pak Kret', 'Khon Kaen', 'Surat Thani', 'Chon Buri', 'Nakhon Si Thammarat', 'Pattaya', 'Lampang', 'Ubon Ratchathani', 'Songkhla', 'Phitsanulok', 'Phuket', 'Nakhon Sawan', 'Sakon Nakhon', 'Chiang Rai'],
    'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van', 'Batman', 'Elazığ', 'İzmit', 'Manisa', 'Sivas'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'San Miguel de Tucumán', 'La Plata', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Santiago del Estero', 'Corrientes', 'Posadas', 'Neuquén', 'Bahía Blanca', 'Paraná', 'Formosa', 'San Fernando del Valle', 'San Salvador de Jujuy'],
    'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Hoofddorp', 'Maastricht', 'Leiden', 'Dordrecht', 'Zoetermeer', 'Zwolle', 'Deventer', 'Delft', 'Alkmaar'],
    'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Mansoura', 'El-Mahalla El-Kubra', 'Tanta', 'Asyut', 'Ismailia', 'Faiyum', 'Zagazig', 'Aswan', 'Damietta', 'Damanhur', 'Minya', 'Beni Suef', 'Qena', 'Sohag', 'Hurghada', 'Shibin El Kom', 'Banha', 'Kafr el-Sheikh'],
    'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley', 'Rustenburg', 'Pietermaritzburg', 'Soweto', 'Benoni', 'Tembisa', 'Vereeniging', 'Centurion', 'Boksburg', 'Krugersdorp', 'Welkom', 'Midrand', 'Randburg', 'Uitenhage', 'Roodepoort', 'Springs'],
    'Greece': ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rhodes', 'Ioannina', 'Chania', 'Agrinio', 'Katerini', 'Kalamata', 'Kavala', 'Lamia', 'Serres', 'Drama', 'Veria', 'Xanthi', 'Alexandroupoli', 'Komotini', 'Kozani', 'Trikala', 'Mytilene', 'Corfu', 'Salamina'],
    'Portugal': ['Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Funchal', 'Coimbra', 'Setúbal', 'Almada', 'Agualva-Cacém', 'Queluz', 'Sintra', 'Évora', 'Rio de Mouro', 'Odivelas', 'Aveiro', 'Amora', 'Corroios', 'Barreiro', 'Seixal', 'Guimarães', 'Faro', 'Leiria', 'Cascais', 'Matosinhos'],
    'Poland': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok', 'Katowice', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec', 'Toruń', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom', 'Olsztyn', 'Bielsko-Biała', 'Rzeszów', 'Ruda Śląska', 'Rybnik'],
    'Singapore': ['Singapore', 'Woodlands', 'Tampines', 'Jurong West', 'Bedok', 'Choa Chu Kang', 'Hougang', 'Sengkang', 'Yishun', 'Punggol', 'Ang Mo Kio', 'Bukit Batok', 'Bukit Panjang', 'Pasir Ris', 'Clementi', 'Sembawang', 'Geylang', 'Toa Payoh', 'Serangoon', 'Queenstown'],
    'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå', 'Gävle', 'Borås', 'Eskilstuna', 'Södertälje', 'Karlstad', 'Täby', 'Växjö', 'Halmstad', 'Sundsvall', 'Luleå', 'Trollhättan', 'Östersund', 'Borlänge'],
    'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne', 'St. Gallen', 'Lugano', 'Biel/Bienne', 'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Schaffhausen', 'Fribourg', 'Vernier', 'Chur', 'Neuchâtel', 'Uster', 'Sion', 'Emmen', 'Zug', 'Yverdon-les-Bains', 'Kriens', 'Rapperswil-Jona'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Khor Fakkan', 'Kalba', 'Jebel Ali', 'Dibba Al-Fujairah', 'Ruwais', 'Al Dhaid', 'Madinat Zayed', 'Ghayathi', 'Ar-Rams', 'Dibba Al-Hisn', 'Hatta', 'Al Madam'],
    'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Napier-Hastings', 'Dunedin', 'Palmerston North', 'Nelson', 'Rotorua', 'New Plymouth', 'Whangarei', 'Invercargill', 'Whanganui', 'Gisborne', 'Queenstown', 'Timaru', 'Oamaru', 'Blenheim', 'Greymouth'],
  };

  const getAvailableCities = () => {
    if (!destination) return [];
    return citiesByCountry[destination] || [];
  };

  const filteredArrivalCities = getAvailableCities().filter((city) =>
    city.toLowerCase().includes(arrivalCity.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {
      tripName: '',
      destination: '',
      fromCity: '',
      arrivalCity: '',
      startDate: '',
      endDate: '',
    };

    let isValid = true;

    if (!tripName.trim()) {
      newErrors.tripName = 'Trip name is required';
      isValid = false;
    }

    if (!destination.trim()) {
      newErrors.destination = 'Destination country is required';
      isValid = false;
    }

    if (!fromCity.trim()) {
      newErrors.fromCity = 'Departure city is required';
      isValid = false;
    }

    if (!arrivalCity.trim()) {
      newErrors.arrivalCity = 'Arrival city is required';
      isValid = false;
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
      isValid = false;
    }

    if (startDate && endDate && endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert('Please sign in to create a trip');
      return;
    }

    setLoading(true);

    const tripData: TripData = {
      tripName,
      destination,
      fromCity,
      arrivalCity,
      startDate,
      endDate,
      description,
      travelerType,
    };

    try {
      const trip = await itineraryService.createTrip(user.id, {
        name: tripName,
        destination: `${arrivalCity}, ${destination}`,
        start_date: startDate!.toISOString().split('T')[0],
        end_date: endDate!.toISOString().split('T')[0],
        traveler_type: travelerType as 'budget' | 'time' | 'combination',
        budget: {
          total: 5000,
          spent: 0,
          currency: 'USD',
        },
      });

      if (trip) {
        onSubmit(tripData, trip.id);
      } else {
        alert('Failed to create trip. Please try again.');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Create New Trip</h2>
            <p className="text-sky-100 mt-1">Plan your next adventure</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
            <p className="text-sm text-sky-800 dark:text-sky-300">
              <span className="font-semibold">Traveler Type:</span> {travelerType}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Trip Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g., Summer Vacation 2024"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
                  errors.tripName
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } dark:text-white`}
              />
            </div>
            {errors.tripName && (
              <p className="mt-1 text-sm text-red-600">{errors.tripName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Destination Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDestinationDropdown(true);
                  setArrivalCity('');
                }}
                onFocus={() => setShowDestinationDropdown(true)}
                placeholder="Search or select country"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
                  errors.destination
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } dark:text-white`}
              />
              {showDestinationDropdown && filteredDestinations.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredDestinations.map((country, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setDestination(country);
                        setShowDestinationDropdown(false);
                        setArrivalCity('');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-sky-50 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                From City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="Departure city"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
                    errors.fromCity
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } dark:text-white`}
                />
              </div>
              {errors.fromCity && (
                <p className="mt-1 text-sm text-red-600">{errors.fromCity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Arrival City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                <input
                  type="text"
                  value={arrivalCity}
                  onChange={(e) => {
                    setArrivalCity(e.target.value);
                    setShowArrivalCityDropdown(true);
                  }}
                  onFocus={() => {
                    if (destination && getAvailableCities().length > 0) {
                      setShowArrivalCityDropdown(true);
                    }
                  }}
                  placeholder={destination ? "Search or select city" : "Select country first"}
                  disabled={!destination}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
                    errors.arrivalCity
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {showArrivalCityDropdown && filteredArrivalCities.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredArrivalCities.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setArrivalCity(city);
                          setShowArrivalCityDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-sky-50 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
                {destination && getAvailableCities().length === 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    No cities available for {destination}. You can enter a city manually.
                  </p>
                )}
              </div>
              {errors.arrivalCity && (
                <p className="mt-1 text-sm text-red-600">{errors.arrivalCity}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select start date"
                  minDate={new Date()}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
                    errors.startDate
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } dark:text-white`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select end date"
                  minDate={startDate || new Date()}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all ${
                    errors.endDate
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } dark:text-white`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description / Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your trip plans, activities, and highlights..."
                rows={5}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description.length} characters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Trip...
                </span>
              ) : (
                'Create Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

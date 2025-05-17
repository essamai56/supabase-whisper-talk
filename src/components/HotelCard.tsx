
import { Link } from 'react-router-dom';
import { Bed, WifiIcon, Coffee, Car, AccessibilityIcon, Phone } from 'lucide-react';

interface HotelCardProps {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  amenities: string[];
  lowestPrice?: number;
}

const HotelCard: React.FC<HotelCardProps> = ({ 
  id, 
  name, 
  description, 
  city, 
  state, 
  amenities, 
  lowestPrice 
}) => {
  
  const getAmenityIcon = (amenity: string) => {
    switch(amenity.toLowerCase()) {
      case 'wi-fi grátis':
        return <WifiIcon className="h-5 w-5 text-blue-600" />;
      case 'café da manhã':
        return <Coffee className="h-5 w-5 text-blue-600" />;
      case 'estacionamento':
        return <Car className="h-5 w-5 text-blue-600" />;
      case 'acesso para cadeirantes':
        return <AccessibilityIcon className="h-5 w-5 text-blue-600" />;
      case 'recepção 24 horas':
        return <Phone className="h-5 w-5 text-blue-600" />;
      default:
        return <Bed className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gray-300 flex items-center justify-center">
        {/* Placeholder para imagem do hotel */}
        <span className="text-gray-500 text-lg">Imagem do Hotel</span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
        <div className="text-gray-600 mb-2 flex items-center">
          <span>{city}, {state}</span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {amenities.slice(0, 5).map((amenity, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <span className="mr-1">{getAmenityIcon(amenity)}</span>
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        {lowestPrice && (
          <div className="mb-4 text-green-700">
            <span className="text-sm">A partir de</span>
            <div className="text-xl font-bold">R$ {lowestPrice.toFixed(2)}</div>
          </div>
        )}

        <Link 
          to={`/hotel/${id}`} 
          className="block w-full text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
};

export default HotelCard;

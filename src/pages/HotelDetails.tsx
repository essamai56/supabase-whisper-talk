
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getHotelById, getRoomsByHotelId, Hotel, Room } from "@/services/hotelService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Phone, Mail, Globe, MapPin, Clock } from "lucide-react";

const HotelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchHotelDetails(id);
    }
  }, [id]);

  const fetchHotelDetails = async (hotelId: string) => {
    try {
      setLoading(true);
      const hotelData = await getHotelById(hotelId);
      const roomsData = await getRoomsByHotelId(hotelId);
      
      setHotel(hotelData);
      setRooms(roomsData);
    } catch (error) {
      console.error("Erro ao carregar detalhes do hotel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do hotel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando detalhes do hotel...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Hotel não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hotel Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{hotel.name}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-5 w-5 mr-1" />
          <span>
            {hotel.address}, {hotel.city}, {hotel.state} - {hotel.country}
          </span>
        </div>
        
        {/* Hotel Images Placeholder */}
        <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center mb-6">
          <span className="text-gray-500">Imagens do Hotel</span>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="amenities">Comodidades</TabsTrigger>
            <TabsTrigger value="rooms">Quartos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Sobre o Hotel</h2>
              <p className="text-gray-600">{hotel.description}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Informações de Contato</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-2" />
                  <span>{hotel.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  <span>{hotel.email}</span>
                </div>
                {hotel.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-600 mr-2" />
                    <a href={hotel.website.startsWith('http') ? hotel.website : `http://${hotel.website}`} 
                       className="text-blue-600 hover:underline"
                       target="_blank" 
                       rel="noopener noreferrer">
                      {hotel.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Horários</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Check-in: {hotel.check_in_time?.substring(0, 5)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Check-out: {hotel.check_out_time?.substring(0, 5)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="amenities">
            <h2 className="text-xl font-semibold mb-4">Comodidades do Hotel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotel.amenities && hotel.amenities.map((amenity: any, index) => (
                <div key={index} className="flex items-center p-3 border rounded-md">
                  <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                    {/* Placeholder para ícone de amenidade */}
                    <span className="text-sm">{amenity.icon || 'A'}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{amenity.name}</h3>
                    {amenity.description && <p className="text-sm text-gray-500">{amenity.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="rooms">
            <h2 className="text-xl font-semibold mb-4">Quartos Disponíveis</h2>
            <div className="space-y-4">
              {rooms.length === 0 ? (
                <p className="text-gray-500">Nenhum quarto disponível no momento.</p>
              ) : (
                rooms.map((room) => (
                  <div key={room.id} className="border rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Room Image Placeholder */}
                      <div className="h-48 md:w-1/3 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Imagem do Quarto</span>
                      </div>
                      
                      <div className="p-4 md:w-2/3 flex flex-col">
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg">{room.room_type?.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">Quarto {room.room_number}, Andar {room.floor}</p>
                          <p className="text-gray-600 mb-2">{room.room_type?.description}</p>
                          
                          <div className="mb-2">
                            <span className="text-sm font-medium">Ocupação máxima: </span>
                            <span>{room.room_type?.max_occupancy} pessoas</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {room.room_type?.amenities?.map((amenity: any, index) => (
                              <span key={index} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                                {amenity.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-sm text-gray-500">Preço por noite</span>
                            <div className="text-2xl font-bold text-green-700">
                              R$ {room.price_per_night.toFixed(2)}
                            </div>
                          </div>
                          
                          <Link 
                            to={`/booking/${room.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                          >
                            Reservar
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HotelDetails;


import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRoomDetails();
    }
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      
      // Primeiro, buscar o quarto e o tipo de quarto
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select(`
          *,
          room_type:room_type_id (
            name, 
            description, 
            max_occupancy
          ),
          hotel:hotel_id (*)
        `)
        .eq('id', id)
        .single();
      
      if (roomError) throw roomError;
      
      // Agora buscar as amenidades do tipo de quarto separadamente
      const { data: amenitiesData, error: amenitiesError } = await supabase
        .from('room_amenities')
        .select(`
          amenity:amenity_id (
            name,
            description,
            icon
          )
        `)
        .eq('room_type_id', roomData.room_type_id);
      
      if (amenitiesError) {
        console.error("Erro ao buscar amenidades:", amenitiesError);
        // Não lançar erro, apenas registrar, para que possamos continuar com os dados do quarto
      }
      
      // Combinar os dados
      const amenities = amenitiesData?.map((item: any) => item.amenity) || [];
      
      setRoom({
        ...roomData,
        room_type: {
          ...roomData.room_type,
          amenities
        }
      });
      
    } catch (error) {
      console.error("Error fetching room details:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do quarto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando detalhes do quarto...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Quarto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to={`/hotel/${room.hotel.id}`} className="text-blue-600 hover:underline flex items-center">
          &larr; Voltar para {room.hotel.name}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Room Image Placeholder */}
        <div className="h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Imagem do Quarto</span>
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{room.room_type.name}</h1>
          <p className="text-gray-600 mb-4">
            {room.hotel.name} - Quarto {room.room_number}, Andar {room.floor}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detalhes do quarto */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Detalhes do Quarto</h2>
              
              <div className="space-y-4">
                <p>{room.room_type.description}</p>
                
                <div>
                  <h3 className="font-medium text-gray-700">Ocupação</h3>
                  <p>Máximo de {room.room_type.max_occupancy} pessoa{room.room_type.max_occupancy !== 1 ? 's' : ''}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Amenidades</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {room.room_type.amenities && room.room_type.amenities.length > 0 ? (
                      room.room_type.amenities.map((amenity: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="h-6 w-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs">{amenity.icon?.substring(0, 1) || 'A'}</span>
                          </div>
                          <span>{amenity.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">Nenhuma amenidade disponível</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reserva e preço */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Preço e Disponibilidade</h2>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-700">
                  R$ {room.price_per_night.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500">por noite</p>
              </div>
              
              <div className="space-y-3 mb-4">
                <p>
                  <span className="font-medium">Check-in: </span>
                  <span>{room.hotel.check_in_time?.substring(0, 5)}</span>
                </p>
                <p>
                  <span className="font-medium">Check-out: </span>
                  <span>{room.hotel.check_out_time?.substring(0, 5)}</span>
                </p>
                <p>
                  <span className="font-medium">Status: </span>
                  <span className={room.is_available ? "text-green-600" : "text-red-600"}>
                    {room.is_available ? "Disponível" : "Indisponível"}
                  </span>
                </p>
              </div>
              
              <Button 
                onClick={handleBookNow}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!room.is_available}
              >
                Reservar Agora
              </Button>
              
              <p className="text-sm text-gray-500 mt-2">
                Sem taxa de reserva. Cancelamento gratuito até 48h antes do check-in.
              </p>
            </div>
          </div>
          
          {/* Informações do hotel */}
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-3">Sobre o Hotel</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">{room.hotel.name}</h3>
                <p className="text-gray-600">{room.hotel.description}</p>
                <Link 
                  to={`/hotel/${room.hotel.id}`} 
                  className="text-blue-600 hover:underline inline-block mt-2"
                >
                  Ver mais sobre o hotel
                </Link>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Localização</h3>
                <p className="text-gray-600">
                  {room.hotel.address}, {room.hotel.city}, {room.hotel.state}
                </p>
                <p className="text-gray-600">{room.hotel.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;

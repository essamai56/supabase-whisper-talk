
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Booking = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  
  // Form fields
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Calculated fields
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(1);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  useEffect(() => {
    if (roomDetails) {
      // Calculate nights and total price when dates change
      const daysStay = differenceInDays(checkOut, checkIn);
      setNights(daysStay > 0 ? daysStay : 1);
      setTotalPrice(roomDetails.price_per_night * (daysStay > 0 ? daysStay : 1));
    }
  }, [checkIn, checkOut, roomDetails]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select(`
          *,
          room_type:room_type_id (name, description, max_occupancy),
          hotel:hotel_id (*)
        `)
        .eq('id', roomId)
        .single();
        
      if (roomError) throw roomError;
      
      setRoomDetails(roomData);
      setHotelDetails(roomData.hotel);
      setTotalPrice(roomData.price_per_night);
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First create or get customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .upsert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select();
      
      if (customerError) throw customerError;
      
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: customerData?.[0]?.id,
          room_id: roomId,
          check_in_date: format(checkIn, 'yyyy-MM-dd'),
          check_out_date: format(checkOut, 'yyyy-MM-dd'),
          adults: adults,
          children: children,
          total_price: totalPrice,
          special_requests: specialRequests,
          status: 'pending',
          payment_status: 'pending'
        })
        .select();
      
      if (bookingError) throw bookingError;
      
      // Navigate to confirmation page
      toast({
        title: "Reserva realizada!",
        description: "Sua reserva foi criada com sucesso.",
      });
      
      navigate(`/booking-confirmation/${bookingData[0].id}`);
      
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Erro na reserva",
        description: "Não foi possível processar sua reserva. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando detalhes da reserva...</p>
      </div>
    );
  }

  if (!roomDetails || !hotelDetails) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Quarto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reservar Quarto</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulário de Reserva */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Informações da Reserva</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <div className="border rounded-md p-2">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={(date) => date && setCheckIn(date)}
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <div className="border rounded-md p-2">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={(date) => date && setCheckOut(date)}
                      disabled={(date) => date <= checkIn}
                      locale={ptBR}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adultos
                  </label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={roomDetails.room_type?.max_occupancy || 2}
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crianças
                  </label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={roomDetails.room_type?.max_occupancy ? roomDetails.room_type.max_occupancy - 1 : 1}
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Informações de Contato</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <Input 
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sobrenome
                    </label>
                    <Input 
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <Input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solicitações Especiais
                </label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Confirmar Reserva
              </Button>
            </form>
          </div>
        </div>
        
        {/* Resumo da Reserva */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Resumo da Reserva</h2>
            
            <div className="space-y-3 mb-4">
              <div>
                <h3 className="font-medium">{hotelDetails.name}</h3>
                <p className="text-sm text-gray-600">{hotelDetails.address}, {hotelDetails.city}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Tipo de Quarto: </span>
                <span className="text-sm">{roomDetails.room_type?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Check-in:</span>
                <span className="text-sm font-medium">{format(checkIn, "dd/MM/yyyy")}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Check-out:</span>
                <span className="text-sm font-medium">{format(checkOut, "dd/MM/yyyy")}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Noites:</span>
                <span className="text-sm font-medium">{nights}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Hóspedes:</span>
                <span className="text-sm font-medium">
                  {adults} {adults === 1 ? "adulto" : "adultos"}
                  {children > 0 && `, ${children} ${children === 1 ? "criança" : "crianças"}`}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Preço para {nights} {nights === 1 ? "noite" : "noites"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

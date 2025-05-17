
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (first_name, last_name, email, phone),
          room:room_id (
            room_number,
            room_type:room_type_id (name),
            hotel:hotel_id (name, address, city, state)
          )
        `)
        .eq('id', bookingId)
        .single();
      
      if (error) throw error;
      
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da reserva.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando detalhes da reserva...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Reserva não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Cabeçalho da confirmação */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-2 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reserva Confirmada!</h1>
          <p className="text-gray-600 mt-1">
            Sua reserva foi realizada com sucesso
          </p>
        </div>

        {/* Detalhes da reserva */}
        <div className="border-t border-b py-4 mb-4">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg">{booking.room?.hotel?.name}</h2>
              <p className="text-gray-600">
                {booking.room?.hotel?.address}, {booking.room?.hotel?.city}, {booking.room?.hotel?.state}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-medium">
                  {format(new Date(booking.check_in_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-medium">
                  {format(new Date(booking.check_out_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Quarto</p>
                <p className="font-medium">
                  {booking.room?.room_type?.name} (Quarto {booking.room?.room_number})
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Hóspedes</p>
                <p className="font-medium">
                  {booking.adults} {booking.adults === 1 ? "adulto" : "adultos"}
                  {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? "criança" : "crianças"}`}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Resumo do pagamento */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Resumo do Pagamento</h3>
          <div className="flex justify-between mb-2">
            <span>Total</span>
            <span className="font-medium">R$ {parseFloat(booking.total_price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Status do pagamento</span>
            <span className={booking.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
              {booking.payment_status === 'paid' ? 'Pago' : 'Pendente'}
            </span>
          </div>
        </div>
        
        {/* Informações do cliente */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Informações do Cliente</h3>
          <div className="space-y-2">
            <p>
              <span className="text-sm text-gray-500">Nome: </span>
              <span>{booking.customer?.first_name} {booking.customer?.last_name}</span>
            </p>
            <p>
              <span className="text-sm text-gray-500">Email: </span>
              <span>{booking.customer?.email}</span>
            </p>
            {booking.customer?.phone && (
              <p>
                <span className="text-sm text-gray-500">Telefone: </span>
                <span>{booking.customer?.phone}</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Rodapé e ações */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            Uma confirmação da reserva foi enviada para o seu email.
          </p>
          <Link 
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
          >
            Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;


import { useState, useEffect } from "react";
import SearchBar, { SearchParams } from "@/components/SearchBar";
import HotelCard from "@/components/HotelCard";
import { getHotels, Hotel } from "@/services/hotelService";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const hotelsData = await getHotels(searchTerm);
      setHotels(hotelsData);
    } catch (error) {
      console.error("Erro ao carregar hotéis:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de hotéis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    fetchHotels(params.destination);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-64 md:h-96 bg-blue-600 bg-opacity-75 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            Encontre a hospedagem perfeita
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl text-center mb-8">
            Compare preços e reserve com os melhores hotéis
          </p>
          {/* Search Bar positioned to overlap the hero section */}
          <div className="w-full max-w-4xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Hotel Listing */}
      <div className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {searchParams?.destination
            ? `Resultados para "${searchParams.destination}"`
            : "Hotéis Recomendados"}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Carregando hotéis...</p>
          </div>
        ) : hotels.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">
              Nenhum hotel encontrado. Tente uma pesquisa diferente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                id={hotel.id}
                name={hotel.name}
                description={hotel.description || ""}
                city={hotel.city}
                state={hotel.state}
                amenities={hotel.amenities || []}
                lowestPrice={hotel.lowest_price || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

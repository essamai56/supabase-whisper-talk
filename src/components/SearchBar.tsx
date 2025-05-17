
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SearchBarProps {
  onSearch: (searchParams: SearchParams) => void;
}

export interface SearchParams {
  destination: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSearch({
      destination,
      checkIn,
      checkOut,
      guests: parseInt(guests)
    });
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destino
          </label>
          <Input
            type="text"
            placeholder="Cidade ou Hotel"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal text-foreground"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? (
                  format(checkIn, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                initialFocus
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal text-foreground"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? (
                  format(checkOut, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                initialFocus
                disabled={(date) => date <= (checkIn || new Date())}
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hóspedes
          </label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="text-foreground">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hóspede</SelectItem>
              <SelectItem value="2">2 hóspedes</SelectItem>
              <SelectItem value="3">3 hóspedes</SelectItem>
              <SelectItem value="4">4 hóspedes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4">
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Pesquisar
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;

export const MAKES = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Kia',
  'Renault', 'Nissan', 'Ford', 'Volkswagen', 'Skoda', 'MG', 'Jeep', 'Datsun',
  'Chevrolet', 'Fiat', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 'Audi', 'Volvo',
  'Jaguar', 'Land Rover', 'Other'
];

export const MODELS = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Alto', 'Alto K10', 'Wagon R', 'Ertiga', 'Brezza', 'Dzire', 'Celerio', 'Ignis', 'S-Cross', 'Ciaz', 'XL6', 'Grand Vitara', 'Fronx', 'Jimny'],
  'Hyundai': ['i20', 'i10', 'Creta', 'Venue', 'Verna', 'Aura', 'Santro', 'Tucson', 'Alcazar', 'Exter'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Tiago', 'Tigor', 'Altroz', 'Hexa'],
  'Honda': ['City', 'Amaze', 'WR-V', 'Jazz', 'HR-V', 'Elevate'],
  'Toyota': ['Innova', 'Fortuner', 'Glanza', 'Urban Cruiser', 'Camry', 'Vellfire', 'Hyryder'],
  'Mahindra': ['XUV700', 'XUV300', 'Thar', 'Scorpio', 'Bolero', 'Bolero Neo', 'BE6E', 'Marazzo'],
  'Kia': ['Seltos', 'Sonet', 'Carnival', 'Carens'],
};

export const YEARS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => String(2026 - i));
export const CITIES = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Nadiad', 'Mehsana', 'Other'];
export const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'Petrol+CNG'];
export const TRANS = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'];
export const OWNERS = ['1st', '2nd', '3rd', '4th+'];
export const COLORS = ['White', 'Silver', 'Grey', 'Black', 'Red', 'Blue', 'Brown', 'Orange', 'Yellow', 'Green', 'Other'];

import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useMediaQuery } from '@mui/material';
import { Drawer } from '@mui/material';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { LocationOn as LocationOnIcon, Home as HomeIcon, Pets as PetsIcon } from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

import {
  Star as StarIcon,
  Wifi as WifiIcon,
  Tv as TvIcon,
  AcUnit as AcUnitIcon,
  FitnessCenter as FitnessCenterIcon,
  Group as GroupIcon,
  BedroomParent as BedroomParentIcon,
  Weekend as LivingIcon,
  Security as SecurityIcon,
  Speaker as SpeakerIcon,
  Bolt as BoltIcon,
  Kitchen as KitchenIcon,
  KingBed as KingBedIcon,
  Pool as PoolIcon,
} from '@mui/icons-material';
import { Tabs, Tab, Box, Skeleton, Grid, Container, Typography, Button } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import ApartmentHero from './ApartmentHero';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/pagelayout';
import {
  useGetPropertyByIdQuery,
  useLazyGetUnitAvailabilityQuery,
} from '../api/propertiesApi';
import { useBooking } from '../context/UserBooking';
import DateRangePicker from '../components/DateRangePicker';
import { useAppSelector } from '../hooks';

interface Unit {
  id: number;
  name: string;
  description: string;
  bedroomCount: number;
  kitchenCount: number;
  livingRoomCount: number;
  maxGuests: number;
  pricePerNight: string;
  cautionFee: string;
  amenities: string[];
  availability: string[];
  isVerified: boolean;
  isWholeProperty: boolean;
  media: {
    fileUrl: string;
  }[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  propertyId: number;
  createdAt: string;
  updatedAt: string;
}

interface Amenity {
  id: number;
  amenityId: number;
  assignableId: number;
  assignableType: string;
  createdAt: string;
  amenity: {
    id: number;
    name: string;
  };
}

interface Property {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  propertyType: string;
  isVerified: boolean;
  isPetAllowed: boolean;
  createdAt: string;
  amenities: Amenity[];
  units: Unit[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  media: {
    fileUrl: string;
  }[];
  agent: {
    name: string;
    image?: string;
  };
}

interface ApiResponse {
  data: Property;
}

const MobileBookingSummary: React.FC<{
  isLoading: boolean,
  basePrice: number,
  datePrice: number | null,
  checkInDate: Date | null,
  checkOutDate: Date | null,
  onStartDateChange: (date: Date | null) => void,
  onEndDateChange: (date: Date | null) => void,
  nights: number,
  guests: number,
  maxGuests: number,
  totalPrice: number,
  onGuestsChange: (guests: number) => void,
  formatPrice: (price: number) => string,
  onBookClick: () => void
}> = ({ 
  isLoading, 
  basePrice, 
  datePrice,
  checkInDate,
  checkOutDate,
  onStartDateChange,
  onEndDateChange,
  nights,
  guests,
  maxGuests,
  totalPrice,
  onGuestsChange,
  formatPrice, 
  onBookClick 
}) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [showDetails, setShowDetails] = useState(false);
  
  if (!isMobile) return null;

  return (
    <>
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 1000,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ cursor: 'pointer' }} onClick={() => setShowDetails(!showDetails)}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {isLoading ? <Skeleton width={100} /> : formatPrice(totalPrice)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {nights} night{nights !== 1 ? 's' : ''} · {guests} guest{guests !== 1 ? 's' : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              · Tap for details ↑
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={onBookClick}
          sx={{ py: 1, px: 3, textTransform: 'none' }}
        >
          Book Now
        </Button>
      </Box>

      {showDetails && (
        <Drawer
          anchor="bottom"
          open={showDetails}
          onClose={() => setShowDetails(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '85vh'
            }
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mb: 3 }} />
            
            <Box sx={{ mb: 2.5 }}>
              <DateRangePicker
                startDate={checkInDate}
                endDate={checkOutDate}
                onStartDateChange={onStartDateChange}
                onEndDateChange={onEndDateChange}
                disabled={isLoading}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Guests</Typography>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                py: 1,
                px: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => onGuestsChange(Math.max(1, Math.min(maxGuests, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={maxGuests}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    backgroundColor: 'transparent'
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">Max {maxGuests} guests</Typography>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{formatPrice(datePrice || basePrice)} × {nights} nights</Typography>
                <Typography variant="body2">{formatPrice(totalPrice)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={500}>Total</Typography>
                <Typography fontWeight={500}>{formatPrice(totalPrice)}</Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                onClick={onBookClick}
                sx={{
                  mt: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Reserve your Aparte
              </Button>
            </Box>
          </Box>
        </Drawer>
      )}
    </>
  );
};

const PropertyDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetPropertyByIdQuery(String(id)) as { data: ApiResponse | undefined, isLoading: boolean, error: unknown };
  const [trigger, { data: availabilityResult }] =
    useLazyGetUnitAvailabilityQuery();
  const [value, setValue] = useState<number>(0);
  const [propertyDetail, setPropertyDetail] = useState<Property | null>(null);
  const [showGuestsInput, setShowGuestsInput] = useState(false);
  const guestsInputRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [datePrice, setDateprice] = useState<number | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [showConfirmBooking] = useState(false);
  const { setBooking } = useBooking();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const displayCount = useMediaQuery('(min-width:600px)') ? 8 : 4;
  const auth = useAppSelector((state) => state.root.auth);
  const isAuthenticated = auth.isAuthenticated && !!auth.token;
  const [showFullDescription, setShowFullDescription] = useState(false);

  const amenityIcons = {
    'FREE WIFI': <WifiIcon className="text-black mr-2" />,
    'SMART TV': <TvIcon className="text-black mr-2" />,
    'AIR CONDITIONER': <AcUnitIcon className="text-black mr-2" />,
    'COMPACT GYM': <FitnessCenterIcon className="text-black mr-2" />,
    'SECURITY DOORS': <SecurityIcon className="text-black mr-2" />,
    'WALL-INBUILT SPEAKERS': <SpeakerIcon className="text-black mr-2" />,
    'ELECTRICITY': <BoltIcon className="text-black mr-2" />,
    'OPEN KITCHEN': <KitchenIcon className="text-black mr-2" />,
    'KING-SIZED BED': <KingBedIcon className="text-black mr-2" />,
    'SWIMMING POOL': <PoolIcon className="text-black mr-2" />,
    'DEFAULT': <HomeIcon className="text-black mr-2" />
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoading && data) {
      setPropertyDetail(data?.data);
      if (data?.data?.units && data?.data?.units?.length > 0) {
        setValue(data?.data?.units[0]?.id);
      }
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (propertyDetail?.id && value) {
      trigger({
        propertyId: propertyDetail.id.toString(),
        unitId: value.toString(),
      });
    }
  }, [value, propertyDetail?.id, trigger]);

  useEffect(() => {
    if (propertyDetail?.units) {
      const currentUnit = propertyDetail.units.find(unit => unit.id === value);
      if (currentUnit) {
        // Reset states for the new unit
        setShowFullDescription(false);
        setShowAllAmenities(false);
        setAdults(0);
        setChildren(0);
        setPets(0);
        setCheckInDate(null);
        setCheckOutDate(null);
        setNights(1);
        setDateprice(null);
      }
    }
  }, [value]); // value is the tab ID

  // Get the currently active unit by filtering
  const activeUnit =
    propertyDetail?.units && value
      ? propertyDetail?.units.find((unit) => unit.id === value)
      : undefined;

  useEffect(() => {
    if (availabilityResult?.data?.length) {
      const priceForDate = Number(activeUnit?.pricePerNight || 0);
      setDateprice(priceForDate);
    }
  }, [availabilityResult?.data, activeUnit?.pricePerNight]);

  console.log('value:', propertyDetail?.units?.[0]?.id);
  console.log('API Response:', data);
  console.log('Property Detail State:', propertyDetail);
  console.log('Availability:', availabilityResult);
  console.log('Error:', error);
  console.log('Is Loading:', isLoading);
  console.log("checkOutDate", checkOutDate);
  console.log("checkInDate", checkInDate);

  // Get Availabilty dates
  const availability = availabilityResult?.data?.map((a) => ({ date: a?.date }));

  console.log("availability", availability);

  console.log('activeUnit', activeUnit);

  // This Set Base Price and Caution fee
  const basePrice = Number(datePrice ||  activeUnit?.pricePerNight || 0);
  const cautionFeePercentage = activeUnit?.cautionFee;
  const title = activeUnit?.name;
  const unitImage = activeUnit?.media[0]?.fileUrl;

  const handleClickOutside = (event: MouseEvent) => {
    if (guestsInputRef.current && !guestsInputRef.current.contains(event.target as Node)) {
      setShowGuestsInput(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    
  const totalChargingFee = (datePrice || basePrice) * nights + pets;
  // const vAT = totalChargingFee + 0.15 * totalChargingFee;
  const cautionFee = totalChargingFee * Number(cautionFeePercentage || 0);

  const handleConfirmBookingClick = () => {
    if ((!datePrice && !basePrice) || !nights || adults === 0) {
      toast.error("Please ensure Unit price, nights, and adults are set before proceeding.");
      return;
    }
    setBooking({
      id: id || '',
      title: title || '',
      checkInDate: checkInDate
        ? checkInDate.toLocaleDateString("en-CA").substring(0, 10)
        : '',
      checkOutDate: checkOutDate
        ? checkOutDate.toLocaleDateString("en-CA").substring(0, 10)
        : '',
      adults,
      children,
      pets,
      nights,
      basePrice,
      totalChargingFee,
      unitImage: unitImage || '',
      unitId: typeof value === 'number' ? value : 0,
    });
    navigate('/confirm-booking');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace('NGN', '₦');
  };

  if (showConfirmBooking) {
    return (
      <div>
        <h2>Booking Confirmation</h2>
      </div>
    );
  }
  const calculateNights = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      setNights(calculateNights(checkInDate, checkOutDate));
    }
  }, [checkInDate, checkOutDate]);

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 8, md: 13 } }}>
        <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 3 }}>
          <Breadcrumbs 
            separator="›"
            sx={{ 
              '.MuiBreadcrumbs-li': {
                fontSize: { xs: '0.875rem', md: '1rem' }
              }
            }}
          >
            <Link to="/" className="text-[#667185] no-underline">
              Home
            </Link>
            <Typography color="text.primary">{propertyDetail?.name}</Typography>
          </Breadcrumbs>
        </Box>

        <ApartmentHero 
          images={propertyDetail?.data?.media || []}
          title={propertyDetail?.name}
          unitImages={activeUnit}
        />

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Host Info */}
            <Box sx={{ 
              p: { xs: 2, md: 3 }, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              {propertyDetail?.data?.hostImage ? (
                <Box 
                  component="img"
                  src={propertyDetail.data.hostImage}
                  alt="Host"
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box 
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: '50%',
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <GroupIcon sx={{ fontSize: 30, color: 'grey.400' }} />
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, mb: 0.5 }}>
                  Hosted by {propertyDetail?.data?.agent?.name || 'Aparte'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {propertyDetail?.meta?.average_rating?.toFixed(1) || '0.0'} · {propertyDetail?.meta?.total_reviews || 0} reviews
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Property Quick Info */}
            <Box sx={{ 
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 18 }} />
                {propertyDetail?.city}, {propertyDetail?.country}
              </Box>
              <Typography sx={{ color: 'text.disabled' }}>•</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <HomeIcon sx={{ fontSize: 18 }} />
                {propertyDetail?.propertyType}
              </Box>
              <Typography sx={{ color: 'text.disabled' }}>•</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PetsIcon sx={{ fontSize: 18 }} />
                {propertyDetail?.isPetAllowed ? 'Pets Allowed' : 'No Pets'}
              </Box>
            </Box>

            

            {/* Unit Details */}
            <Box id="unit-details" sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight={500}>
                Unit Details
              </Typography>
              <TabContext value={value.toString()}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={value}
                    onChange={(_, newValue) => {
                      setValue(newValue);
                      // Reset scroll position when changing units
                      window.scrollTo({
                        top: document.getElementById('unit-details')?.offsetTop || 0,
                        behavior: 'smooth'
                      });
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="property units"
                  >
                    {propertyDetail?.units?.map((unit) => (
                      <Tab
                        key={unit.id}
                        label={unit.name}
                        value={unit.id}
                        sx={{
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Tabs>
                </Box>

                {propertyDetail?.units?.map((unit) => (
                  <TabPanel key={unit.id} value={unit.id.toString()}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: { xs: 2, md: 3 },
                        }}>
                          <Grid container spacing={4}>
                            {/* Unit Description */}
                            <Grid item xs={12}>
                              {/* <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                About this unit
                              </Typography> */}
                              <Typography 
                                variant="body1" 
                                color="text.secondary" 
                                sx={{ 
                                  lineHeight: 1.7,
                                  display: '-webkit-box',
                                  WebkitLineClamp: showFullDescription ? 'unset' : 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {unit.description}
                              </Typography>
                              {unit.description && unit.description.length > 250 && (
                                <Button
                                  onClick={() => setShowFullDescription(!showFullDescription)}
                                  sx={{
                                    mt: 1,
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: 'primary.main',
                                    p: 0,
                                    '&:hover': {
                                      bgcolor: 'transparent',
                                      color: 'primary.dark',
                                    }
                                  }}
                                >
                                  {showFullDescription ? 'Show less' : 'Read more'}
                                </Button>
                              )}
                            </Grid>

                            {/* Basic Unit Info */}
                            <Grid item xs={12}>
                              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Basic Unit Info
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.5,
                                    color: 'text.primary' 
                                  }}>
                                    <GroupIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                    <Typography>{unit.maxGuests} Guests</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.5,
                                    color: 'text.primary' 
                                  }}>
                                    <BedroomParentIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                    <Typography>{unit.bedroomCount} Bedrooms</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.5,
                                    color: 'text.primary' 
                                  }}>
                                    <LivingIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                    <Typography>{unit.livingRoomCount} Living Room</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.5,
                                    color: 'text.primary' 
                                  }}>
                                    <KitchenIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                    <Typography>{unit.kitchenCount} Kitchen</Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* Unit Amenities */}
                            {unit.amenities && unit.amenities.length > 0 && unit.amenities.some(amenity => amenity?.amenity?.name) && (
                              <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                  Amenities
                                </Typography>
                                <Grid container spacing={2}>
                                  {unit.amenities
                                    .filter(amenity => amenity?.amenity?.name)
                                    .slice(0, showAllAmenities ? undefined : displayCount)
                                    .map((amenity, index) => (
                                      <Grid item xs={6} sm={3} key={index}>
                                        <Box sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center',
                                          gap: 1.5,
                                          // p: 1.5,
                                          borderRadius: 1,
                                          bgcolor: 'background.default',
                                          transition: 'all 0.2s ease-in-out',
                                          '&:hover': { 
                                            bgcolor: 'action.hover',
                                            transform: 'translateY(-2px)',
                                          }
                                        }}>
                                          {amenityIcons[amenity?.amenity?.name.toUpperCase() as keyof typeof amenityIcons] || amenityIcons['DEFAULT']}
                                          <Typography variant="body2" noWrap>
                                            {amenity?.amenity?.name}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    ))}
                                </Grid>
                                
                                {unit.amenities.filter(amenity => amenity?.amenity?.name).length > displayCount && (
                                  <Button 
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    sx={{ 
                                      mt: 3,
                                      textTransform: 'none',
                                      fontSize: '0.875rem',
                                      fontWeight: 500,
                                      color: 'primary.main',
                                      '&:hover': {
                                        bgcolor: 'transparent',
                                        color: 'primary.dark',
                                      }
                                    }}
                                  >
                                    {showAllAmenities ? 'Show less' : `Show all ${unit.amenities.length} amenities`}
                                  </Button>
                                )}
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </TabPanel>
                ))}
              </TabContext>
            </Box>

            {/* Amenities */}
            {/* {propertyDetail?.amenities && propertyDetail.amenities.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight={500}>
                  What this place offers
                </Typography>
                <Grid container spacing={1.5}>
                  {propertyDetail.amenities.slice(0, showAllAmenities ? undefined : displayCount).map((amenity, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        '&:hover': { 
                          bgcolor: 'action.hover',
                        }
                      }}>
                        {amenityIcons[amenity?.amenity?.name.toUpperCase() as keyof typeof amenityIcons]}
                        <Typography variant="body2" noWrap>{amenity?.amenity?.name}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                {propertyDetail.amenities.length > displayCount && (
                  <Button 
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    sx={{ 
                      mt: 1.5,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    {showAllAmenities ? 'Show less' : `Show all ${propertyDetail.amenities.length} amenities`}
                  </Button>
                )}
              </Box>
            )} */}

            {/* Things you should know */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight={500}>
                Things you should know
              </Typography>
              
              {/* Mobile Accordions */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                      House rules
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Check-in: 3:00 PM - 8:00 PM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Checkout: 11:00 AM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No smoking
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No parties or events
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                      Safety & property
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Security cameras on property
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carbon monoxide alarm
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Smoke alarm
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                      Cancellation policy
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Free cancellation before 48 hours of check-in. 
                      After that, cancel before check-in and get a 50% refund, minus the service fee.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>

              {/* Desktop Grid */}
              <Grid container spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                      House rules
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Check-in: 3:00 PM - 8:00 PM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Checkout: 11:00 AM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No smoking
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No parties or events
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                      Safety & property
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Security cameras on property
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carbon monoxide alarm
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Smoke alarm
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                      Cancellation policy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Free cancellation before 48 hours of check-in. 
                      After that, cancel before check-in and get a 50% refund, minus the service fee.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Location Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" gutterBottom fontWeight={500}>
                Location
              </Typography>
              
              <Box sx={{ position: 'relative' }}>
                {/* Address Display */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      filter: !isAuthenticated ? 'blur(4px)' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    <LocationOnIcon sx={{ color: 'primary.main' }} />
                    {propertyDetail?.city}, {propertyDetail?.state}
                  </Typography>
                  {!isAuthenticated && (
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => navigate('/login')}
                      sx={{ mt: 1 }}
                    >
                      Log in to see exact location
                    </Button>
                  )}
                </Box>

                {/* Map Container */}
                <Box sx={{ position: 'relative', height: '400px', borderRadius: 2, overflow: 'hidden' }}>
                  {!isAuthenticated && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        p: 3,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h6">
                        Sign in to see location
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        For security reasons, exact location is only visible to logged-in users
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{ textTransform: 'none', px: 4 }}
                      >
                        Sign in
                      </Button>
                    </Box>
                  )}
                  <Box sx={{ 
                    height: '100%', 
                    filter: !isAuthenticated ? 'blur(8px)' : 'none'
                  }}>
                    <MapContainer
                      center={[propertyDetail?.latitude || 6.5244, propertyDetail?.longitude || 3.3792]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker 
                        position={[propertyDetail?.latitude || 6.5244, propertyDetail?.longitude || 3.3792]}
                      />
                    </MapContainer>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Booking Section */}
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ 
              position: 'sticky',
              top: 24,
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {/* Price Display */}
              <Typography variant="h4" sx={{ 
                color: 'primary.main', 
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'baseline',
                gap: 1
              }}>
                {isLoading ? <Skeleton width={150} /> : formatPrice(datePrice || basePrice)}
                <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>/night</Typography>
              </Typography>

              <DateRangePicker
                startDate={checkInDate}
                endDate={checkOutDate}
                onStartDateChange={setCheckInDate}
                onEndDateChange={setCheckOutDate}
                disabled={isLoading}
              />

              {/* Nights and Guests Inputs */}
              <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
                {/* Guests Input */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Guests</Typography>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}>
                    <input
                      type="number"
                      value={adults + children}
                      onChange={(e) => {
                        const total = Math.max(0, parseInt(e.target.value) || 0);
                        setAdults(total);
                        setChildren(0);
                      }}
                      min="1"
                      max={activeUnit?.maxGuests || 1}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        textAlign: 'center',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Pets Input */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Pets (Optional)</Typography>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}>
                  <input
                    type="number"
                    value={pets}
                    onChange={(e) => setPets(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1rem',
                      textAlign: 'center',
                      '&::-webkit-inner-spin-button': {
                        opacity: 1
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Total Price Breakdown */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Price Details</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{nights} night{nights !== 1 ? 's' : ''}</Typography>
                  <Typography>{formatPrice(totalChargingFee)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Caution Fee</Typography>
                  <Typography>{formatPrice(cautionFee)}</Typography>
                </Box>
              </Box>

              {/* Book Now Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmBookingClick}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Book Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <MobileBookingSummary
        isLoading={isLoading}
        basePrice={basePrice}
        datePrice={datePrice}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onStartDateChange={setCheckInDate}
        onEndDateChange={setCheckOutDate}
        nights={nights}
        guests={adults + children}
        maxGuests={activeUnit?.maxGuests || 1}
        totalPrice={totalChargingFee}
        onGuestsChange={(total) => {
          setAdults(total);
          setChildren(0);
        }}
        formatPrice={formatPrice}
        onBookClick={handleConfirmBookingClick}
      />
      <ToastContainer position="bottom-right" />
    </PageLayout>
  );
};

export default PropertyDetails;
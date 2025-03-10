import React, { useState } from 'react';
import { Button, Modal, IconButton } from '@mui/material';
import PlaceCard from "../assets/images/placecard.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Close as CloseIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
// import GuestImages from '../assets/images/guest/guestImages';

interface ApartmentHeroProps {
  title: string | undefined;
  unit: Unit | null;
  images: {
    fileUrl: string;
  }[];
}
interface Unit {
  amenities: unknown[];
  availability: unknown[];
  bedroomCount: number;
  cautionFee: string;
  id: number;
  livingRoomCount: number;
  maxGuests: number;
  pricePerNight: string;
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


const ApartmentHero: React.FC<ApartmentHeroProps> = ({ title, unit }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const mainImage = unit?.media?.[0]?.fileUrl || '';
  const images = unit?.media?.map(img => img.fileUrl) || [];

  console.log("imageUrl", mainImage);

  // useEffect(() => {
  //   // Simulate fetching new images each time the component mounts
  //   const fetchImages = () => {
  //     setImages(GuestImages);
  //   };

  //   fetchImages();
  // }, []);

  return (
    <div className="relative w-full h-full lg:mb-4">
      <div className="text-[16px] p-4 pt-6 lg:pt-0 font-medium lg:text-[24px] apartment-hero">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="md:hidden text-[#667185] hover:text-[#4B5563] no-underline flex items-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="m-0">{title}</h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-2/3">
          {/* Mobile Slider */}
          <div className="block md:hidden -mx-4">
            <Swiper
              modules={[Navigation, Pagination]}
              pagination={{ clickable: true }}
              navigation
              loop
              className="w-full h-[300px]"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image || PlaceCard}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onClick={() => setShowAllPhotos(true)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          
          {/* Desktop Main Image */}
          <div className="hidden md:block">
            <img
              src={mainImage || PlaceCard}
              alt="Apartment Main"
              className="w-full h-full md:h-[406px] object-cover rounded-tl-2xl rounded-bl-2xl"
              loading="lazy"
            />
          </div>
          <div className="absolute top-4 right-4 md:hidden">
            <Button
              color="primary"
              sx={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid black",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
                textTransform: "none",
                fontSize: "14px",
                width: "150px"
              }}
              onClick={() => setShowAllPhotos(true)}
            >
              <svg width="14" height="14" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 21H14C19 21 21 19 21 14V8C21 3 19 1 14 1H8C3 1 1 3 1 8V14C1 19 3 21 8 21Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 9C9.10457 9 10 8.10457 10 7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7C6 8.10457 6.89543 9 8 9Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.66992 17.9505L6.59992 14.6405C7.38992 14.1105 8.52992 14.1705 9.23992 14.7805L9.56992 15.0705C10.3499 15.7405 11.6099 15.7405 12.3899 15.0705L16.5499 11.5005C17.3299 10.8305 18.5899 10.8305 19.3699 11.5005L20.9999 12.9005" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              View all photos
            </Button>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4 w-1/3">
          {unit && (
            <div className="relative">
              {unit?.media && unit?.media.length > 1 ? (
                <img
                  src={unit?.media[1].fileUrl}
                  alt=""
                  className="w-full h-full md:h-[195px] object-cover rounded-tr-2xl rounded-br-2xl"
                />
              ) : (
                <img
                  src={PlaceCard}
                  alt=""
                  className="w-full h-full md:h-[195px] object-cover rounded-tr-2xl rounded-br-2xl"
                />
              )}
              <div className="absolute top-3 right-2 text-[14px]">
                <Button
                  color="primary"
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid black",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    textTransform: "none",
                    fontSize: "14px",
                    width: "150px"
                  }}
                  onClick={() => setShowAllPhotos(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 21H14C19 21 21 19 21 14V8C21 3 19 1 14 1H8C3 1 1 3 1 8V14C1 19 3 21 8 21Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 9C9.10457 9 10 8.10457 10 7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7C6 8.10457 6.89543 9 8 9Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1.66992 17.9505L6.59992 14.6405C7.38992 14.1105 8.52992 14.1705 9.23992 14.7805L9.56992 15.0705C10.3499 15.7405 11.6099 15.7405 12.3899 15.0705L16.5499 11.5005C17.3299 10.8305 18.5899 10.8305 19.3699 11.5005L20.9999 12.9005" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  View all photos
                </Button>
              </div>
            </div>
          )}
          {unit && (
              unit?.media && unit?.media.length > 2 ? (
                <img
                  src={unit?.media[2].fileUrl}
                  alt=""
                  className="w-full h-full md:h-[195px] object-cover rounded-tr-2xl rounded-br-2xl"
                />
              ) : (
                <img
                  src={PlaceCard}
                  alt=""
                  className="w-full h-full md:h-[195px] object-cover rounded-tr-2xl rounded-br-2xl"
                />
              )
          )}
        </div>
      </div>

      <Modal
        open={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
        aria-labelledby="view-all-photos"
        className="flex justify-center items-center overflow-auto"
      >
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl h-full md:h-auto overflow-y-auto relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Photos</h2>
            <IconButton onClick={() => setShowAllPhotos(false)} size="small">
              <CloseIcon />
            </IconButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Apartment Photo ${index + 1}`}
                className="w-full rounded-lg"
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentHero;
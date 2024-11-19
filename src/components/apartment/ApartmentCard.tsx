import React from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

interface ApartmentCardProps {
  imageUrl: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  imageUrl,
  title,
  location,
  rating,
  reviews,
  price,
}) => {
  // Calculate the number of filled stars based on the rating
  const filledStars = Math.round(rating / 2);

  return (
    <article className="flex flex-col items-start font-medium rounded-none max-full">
      <img
        loading="lazy"
        src={imageUrl}
        alt={title}
        className="object-contain self-stretch w-full rounded-none aspect-[1.09]"
      />
      <h2
        className="mt-5 text-2xl text-zinc-900"
        style={{ fontSize: "clamp(1rem, 2.5vw, 1rem)" }}
      >
        {title}
      </h2>
      <div className="flex gap-1.5 mt-2 text-xs leading-none text-black">
        <LocationOnIcon sx={{ color: "#028090" }} />
        <p className="basis-auto">{location}</p>
      </div>
      <div className="flex gap-2.5 mt-4 text-center">
        <div className="flex flex-col whitespace-nowrap">
          <div className="flex gap-2.5 text-xs text-white">
            <div className="px-1.5 bg-cyan-700 rounded-md h-[30px] w-[30px] flex items-center justify-center">
              {rating.toFixed(1)}
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, index) =>
                index < filledStars ? (
                  <StarIcon
                    key={index}
                    sx={{
                      color: "black",
                     
                    
                    }}
                  />
                ) : (
                  <StarOutlineIcon
                    key={index}
                    sx={{
                      color: "black",
                      
                    }}
                  />
                )
              )}
            </div>
          </div>
          <div className="flex gap-0.5 self-start mt-4 text-xl text-cyan-700">
            <span>₦</span>
            <span>{price.toLocaleString()}</span>
          </div>
        </div>
        <p className="self-start mt-2.5 text-xs text-zinc-900">
          {reviews} Reviews
        </p>
      </div>
    </article>
  );
};

export default ApartmentCard;

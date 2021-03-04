import React from "react";
import amexImg from "./images/amex";
import dinersImg from "./images/diners";
import mastercardImg from "./images/mastercard";
import visaImg from "./images/visa";

type Card = "visa" | "mastercard" | "amex" | "diners";

const cardsImages = {
  amex: amexImg,
  diners: dinersImg,
  mastercard: mastercardImg,
  visa: visaImg
};

interface CardTypeDisplayProps {
  cards: Card[];
  selected?: string;
}

const CardTypeDisplay: React.FC<CardTypeDisplayProps> = ({
  cards,
  selected
}) => {
  return (
    <div className="card-type-display">
      {cards.map((card) => (
        <div
          className={`card-img ${
            selected && card !== selected ? "card-img--unselected" : ""
          }`}
          key={card}
        >
          {cardsImages[card]}
        </div>
      ))}
    </div>
  );
};

export default CardTypeDisplay;

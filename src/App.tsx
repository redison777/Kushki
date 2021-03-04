import React, { useState } from "react";
import { useForm } from "react-hook-form";
import luhn from "luhn";
import { Kushki } from "@kushki/js";
import { IMaskInput } from "react-imask";
import IMask from "imask";
import { getCardTypeByValue } from "./utils/cardTypes";
import { validateDate } from "./utils/validateDate";
import CardTypeDisplay from "./CardTypeDisplay";
import testCards from "./utils/testCards";
import axios from "axios";

import "normalize.css";
import "./styles.scss";

type Inputs = {
  cardNumber: string;
  cardName: string;
  expDate: string;
  cvc: string;
};

const chargeAmount = 49.99;
const chargeCurrency = "USD";
const KUSHKI_PUBLIC_MERCHANT_ID = "20000000106212540000";

export default function App() {
  const { register, handleSubmit, watch, errors, setValue, reset } = useForm<
    Inputs
  >();
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<object | undefined>(undefined);

  const card = getCardTypeByValue(watch("cardNumber"));

  const kushki = new Kushki({
    merchantId: KUSHKI_PUBLIC_MERCHANT_ID,
    inTestEnvironment: true
  });

  const setValues = (type: "approved" | "declined" | "declinedOnToken") => {
    setValue("cardNumber", testCards[type].cardNumber);
    setValue("cardName", testCards[type].cardName);
    setValue("expDate", testCards[type].expDate);
    setValue("cvc", testCards[type].cvc);
  };

  const onSubmit = (data: Inputs) => {
    setLoading(true);
    setError(undefined);
    setToken("");

    kushki.requestToken(
      {
        amount: chargeAmount,
        currency: chargeCurrency,
        card: {
          name: data.cardName,
          number: data.cardNumber.replace(/ /g, ""),
          cvc: data.cvc,
          expiryMonth: data.expDate.split("/")[0],
          expiryYear: data.expDate.split("/")[1]
        }
      },
      (response: any) => {
        if (!response.code) {
          setToken(response.token);

          //Check our backend example: https://github.com/MatiMenich/kushki-backend-examples/blob/master/api/cards.js
          axios
            .post("https://kushki-backend-examples.vercel.app/api/cards", {
              amount: chargeAmount,
              token: response.token
            })
            .then((response) => {
              console.log(response.data);
              setSuccess(response.data);
            })
            .catch((error) => {
              if (error.response.data) {
                setError(error.response.data.message);
              } else {
                console.error(error);
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
          setError(response.message);
        }
      }
    );
  };

  const resetExample = () => {
    setSuccess(undefined);
    setToken("");
    reset();
  };

  return (
    <>
      {!success ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="card-form">
            <div className="form-group">
              <IMaskInput
                mask={"0000 0000 0000 0000"}
                unmask={true}
                name="cardNumber"
                placeholder="Número de tarjeta"
                autoComplete="cc-number"
                inputRef={register({
                  required: "Número de tarjeta requerido",
                  pattern: {
                    value: /[\d| ]{16,22}/,
                    message: "Número de tarjeta incompleto"
                  },
                  validate: (value: string) =>
                    luhn.validate(value) || "Número de tarjeta incorrecto"
                })}
                className={`form-input ${
                  errors.cardNumber ? "form-input--error" : ""
                }`}
              />
              <CardTypeDisplay
                cards={["visa", "mastercard", "amex", "diners"]}
                selected={card && card.type}
              />
              {errors.cardNumber && (
                <span className="error-display">
                  {errors.cardNumber.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <input
                name="cardName"
                placeholder="Nombre"
                autoComplete="cc-name"
                ref={register({
                  required: true
                })}
                className={`form-input ${
                  errors.cardName ? "form-input--error" : ""
                }`}
              />
              {errors.cardName && (
                <span className="error-display">El nombre es requerido</span>
              )}
            </div>

            <div className="input-group">
              <div className="form-group">
                <IMaskInput
                  mask={"MM/YY"}
                  blocks={{
                    YY: {
                      mask: "00"
                    },
                    MM: {
                      mask: IMask.MaskedRange,
                      from: 1,
                      to: 12
                    }
                  }}
                  unmask={false}
                  name="expDate"
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                  inputRef={register({
                    required: "Expiración requerida",
                    pattern: {
                      value: /\d\d\/\d\d/,
                      message: "Expiración incorrecta"
                    },
                    validate: (value: string) =>
                      validateDate(value) || "Expiración vencida"
                  })}
                  className={`form-input ${
                    errors.expDate ? "form-input--error" : ""
                  }`}
                />
                {errors.expDate && (
                  <span className="error-display">
                    {errors.expDate.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <input
                  name="cvc"
                  placeholder={card ? card.code.name : "CVC"}
                  autoComplete="cc-csc"
                  ref={register({
                    required: true,
                    pattern: /\d{3,4}/
                  })}
                  className={`form-input ${
                    errors.cvc ? "form-input--error" : ""
                  }`}
                />
                {errors.cvc && (
                  <span className="error-display">CVC está incompleto</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className={`form-submit-button ${
                loading ? "form-submit-button--loading" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                `Pagar $${chargeAmount}`
              )}
            </button>
          </form>

          <div className="text-center">
            <div className="test-data">
              <span className="test-data__title">Datos de prueba</span>
              <button
                className="option-button"
                onClick={() => setValues("approved")}
              >
                Transacción aprobada
              </button>
              <button
                className="option-button"
                onClick={() => setValues("declinedOnToken")}
              >
                Transacción declinada en solicitud de token
              </button>
              <button
                className="option-button"
                onClick={() => setValues("declined")}
              >
                Transacción declinada
              </button>
            </div>

            {token && (
              <div style={{ marginTop: "1rem" }}>
                <b>Token obtenido:</b> {token}
              </div>
            )}

            {error && (
              <div style={{ marginTop: "1rem" }}>
                <b className="text-red">Error:</b> {error}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="success-wrapper">
          <div className="success-icon">✓</div>
          <p className="success-title">Transacción exitosa</p>
          <pre className="success-code">
            <code>{JSON.stringify(success, null, 2)}</code>
          </pre>
          <button className="option-button" onClick={resetExample}>
            Reiniciar ejemplo
          </button>
        </div>
      )}
    </>
  );
}

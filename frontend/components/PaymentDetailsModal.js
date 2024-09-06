"use client";

import { Button, Modal, Label } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@contexts/UserProvider";
import PropTypes from "prop-types";

const PaymentDetailsModal = ({
  showPaymentDetailsModal,
  setShowPaymentDetailsModal,
  btnTitle,
  modalHeader,
  number,
  date,
  cvvNo,
  isEdit,
}) => {
  const [cardNo, setCardNo] = useState(number);
  const [expiryDate, setExpiryDate] = useState(date);
  const [cvv, setCvv] = useState(cvvNo);
  const [cardNoError, setCardNoError] = useState("");
  const [expiryDateError, setExpiryDateError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const { user, updateUser } = useUser();

  const ref = useRef(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  const clickSave = async () => {
    const isCardNoExist = !!cardNo;
    const isCardNoValid = isCardNoExist && cardNo.length === 19;
    setCardNoError(
      isCardNoExist
        ? isCardNoValid
          ? ""
          : "Please enter a valid card number"
        : "This field is required"
    );

    const isExpiryDateExist = !!expiryDate;
    let isExpiryDateValid = false;
    if (isExpiryDateExist) {
      const expiryDateComponents = expiryDate.split("/");
      const expiryMonth = parseInt(expiryDateComponents[0]);
      const expiryYear = parseInt(expiryDateComponents[1]);
      const currentYear = new Date().getFullYear() % 100; // get last 2 digits of year
      const currentMonth = new Date().getMonth() + 1; // months are 0-based in JS
      isExpiryDateValid =
        expiryYear > currentYear ||
        (expiryYear === currentYear && expiryMonth >= currentMonth);
    }
    setExpiryDateError(
      isExpiryDateExist
        ? isExpiryDateValid
          ? ""
          : "Please enter a valid expiry date"
        : "This field is required"
    );

    const isCvvValid = !!cvv;
    setCvvError(isCvvValid ? "" : "This field is required");

    if (isCardNoValid && isExpiryDateValid && isCvvValid) {
      const newPaymentDetail = {
        card_number: cardNo,
        expiry_date: expiryDate,
        cvv: cvv,
      };

      const paymentDetails = user.payment_details.filter((p) => {
        return p.card_number !== cardNo;
      });

      const body = {
        payment_details: [...paymentDetails, newPaymentDetail],
      };

      updateUser(body);
      closeModal();
    }
  };

  const handleCardNoChange = ({ target }) => {
    let val = target.value.replace(/[^\d]/g, "");

    if (/^\d*$/.test(val)) {
      let match = val.match(/.{1,4}/g);
      val = match ? match.join(" ") : "";
      setCardNo(val);
    }
  };

  const handleExpiryDateChange = ({ target }) => {
    let val = target.value;

    if (/^[0-9/]*$/.test(val)) {
      if (val.length === 2 && expiryDate.length === 1 && !val.includes("/")) {
        val += "/";
      }
      setExpiryDate(val);
    }
  };

  const closeModal = () => {
    if (!isEdit) {
      setCardNo("");
      setExpiryDate("");
      setCvv("");
    }
    setCardNoError("");
    setExpiryDateError("");
    setCvvError("");
    setShowPaymentDetailsModal(false);
  };

  return (
    <div>
      <Button
        className="bg-custom-orange hover:bg-custom-orange-dark text-white"
        onClick={() => setShowPaymentDetailsModal(true)}
      >
        {btnTitle}
      </Button>
      <Modal
        show={showPaymentDetailsModal}
        onClose={closeModal}
        root={ref.current}
      >
        <Modal.Header className="bg-custom-orange text-white">
          {modalHeader}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Card Number" />
              </div>
              <input
                id="cardNo"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNo}
                onChange={isEdit ? undefined : handleCardNoChange}
                maxLength={19}
              />
              {isEdit && (
                <p className="text-gray-400 text-sm mb-4">
                  You can&apos;t edit card number
                </p>
              )}
              <p className="error_text">{cardNoError}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="small" value="Expiry Date" />
                </div>
                <input
                  id="expiryDate"
                  className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength={5}
                />
                <p className="error_text">{expiryDateError}</p>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="small" value="CVC" />
                </div>
                <input
                  id="cvc"
                  className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setCvv(val);
                    }
                  }}
                  maxLength={3}
                />
                <p className="error_text">{cvvError}</p>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={clickSave}
            >
              Save
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentDetailsModal;

PaymentDetailsModal.propTypes = {
  showPaymentDetailsModal: PropTypes.bool.isRequired,
  setShowPaymentDetailsModal: PropTypes.func.isRequired,
  btnTitle: PropTypes.string.isRequired,
  modalHeader: PropTypes.string.isRequired,
  number: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  cvvNo: PropTypes.number.isRequired,
  isEdit: PropTypes.bool.isRequired,
};
